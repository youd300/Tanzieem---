import { Router, Response } from 'express';
import crypto from 'node:crypto';
import { db } from './db';
import { hashPassword, verifyPassword, createSession, deleteSession, requireAuth, AuthRequest } from './auth';

export const apiRouter = Router();

// Helper to calculate level from XP
export function calculateLevel(xp: number): { level: number; title: string; nextLevelXp: number } {
  // Base tier formula: Level 1 starts at 0 XP, Level 2 at 100 XP, Level 3 at 250 XP, etc.
  // formula: xpThreshold = 50 * level * (level - 1)
  let level = 1;
  while (50 * (level + 1) * level <= xp) {
    level++;
  }
  const nextLevelXp = 50 * (level + 1) * level;

  const titles: Record<number, string> = {
    1: 'Chrono Initiate',
    2: 'Focus Apprentice',
    3: 'Time Weaver',
    4: 'Cadence Keeper',
    5: 'Chrono Architect',
    6: 'Momentum Vanguard',
    7: 'Deep Flow Master',
    8: 'Ascendant Strategist',
    9: 'Sovereign of Hours',
    10: 'Temporal Paragon',
  };

  const title = titles[Math.min(level, 10)] || 'Chrono Legend';
  return { level, title, nextLevelXp };
}

// Check & unlock real achievements based on verified user stats
function checkAchievements(userId: string) {
  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId) as any;
  if (!profile) return;

  const completedTasksCount = (db.prepare("SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 'Completed'").get(userId) as any).count;
  const sessionsCount = (db.prepare('SELECT COUNT(*) as count FROM timer_sessions WHERE user_id = ?').get(userId) as any).count;
  const totalStudySeconds = (db.prepare('SELECT COALESCE(SUM(actual_seconds), 0) as total FROM timer_sessions WHERE user_id = ?').get(userId) as any).total;
  const totalStudyMinutes = Math.floor(totalStudySeconds / 60);

  const rules: { id: string; condition: boolean }[] = [
    { id: 'first_task', condition: completedTasksCount >= 1 },
    { id: 'first_session', condition: sessionsCount >= 1 },
    { id: 'hour_study', condition: totalStudyMinutes >= 60 },
    { id: 'tasks_10', condition: completedTasksCount >= 10 },
    { id: 'streak_7', condition: profile.streak >= 7 },
    { id: 'streak_30', condition: profile.streak >= 30 },
    { id: 'productivity_master', condition: profile.xp >= 1000 },
  ];

  const now = Date.now();
  for (const rule of rules) {
    if (rule.condition) {
      const existing = db.prepare('SELECT * FROM achievements WHERE id = ? AND user_id = ?').get(rule.id, userId) as any;
      if (!existing || existing.unlocked === 0) {
        db.prepare('INSERT OR REPLACE INTO achievements (id, user_id, unlocked, unlocked_at) VALUES (?, ?, 1, ?)').run(rule.id, userId, now);
      }
    }
  }
}

// ---------------- AUTHENTICATION ----------------

// Register
apiRouter.post('/auth/register', (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: 'All fields (name, username, email, password) are required.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check unique
    const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(cleanUsername, cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'Username or Email is already registered.' });
    }

    const userId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const { salt, hash } = hashPassword(password);
    const now = Date.now();

    // Transaction: Create user, profile with 500 COINS, welcome transaction
    db.exec('BEGIN TRANSACTION');
    try {
      db.prepare('INSERT INTO users (id, username, email, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(userId, cleanUsername, cleanEmail, hash, salt, now);

      // Starting balance = 500 Coins, Level = 1, XP = 0
      db.prepare(`
        INSERT INTO profiles (
          user_id, name, username, bio, avatar_url, title, level, xp, coins, streak, best_streak,
          daily_target_minutes, preferred_session_minutes, focus_area, language, timezone, notifications_enabled, updated_at
        ) VALUES (?, ?, ?, '', '', 'Chrono Initiate', 1, 0, 500, 0, 0, 120, 25, 'Study', 'en', 'UTC', 1, ?)
      `).run(userId, name.trim(), cleanUsername, now);

      // Create first Coin Transaction: 500 Welcome Coins
      const txId = `tx_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      db.prepare(`
        INSERT INTO coin_transactions (id, user_id, amount, type, reason, balance_before, balance_after, timestamp)
        VALUES (?, ?, 500, 'credit', 'Welcome Signup Bonus', 0, 500, ?)
      `).run(txId, userId, now);

      db.exec('COMMIT');
    } catch (txErr) {
      db.exec('ROLLBACK');
      throw txErr;
    }

    const token = createSession(userId);
    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);

    res.json({
      token,
      user: { id: userId, username: cleanUsername, email: cleanEmail },
      profile,
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// Login
apiRouter.post('/auth/login', (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Username/Email and Password are required.' });
    }

    const identifier = emailOrUsername.trim().toLowerCase();
    const userRow = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(identifier, identifier) as any;
    if (!userRow) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    const isValid = verifyPassword(password, userRow.salt, userRow.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
    }

    const token = createSession(userRow.id);
    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userRow.id);

    res.json({
      token,
      user: { id: userRow.id, username: userRow.username, email: userRow.email },
      profile,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Logout
apiRouter.post('/auth/logout', requireAuth, (req: AuthRequest, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    deleteSession(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user & profile
apiRouter.get('/auth/me', requireAuth, (req: AuthRequest, res) => {
  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.userId!) as any;
  res.json({
    user: req.user,
    profile,
  });
});

// ---------------- PROFILE ----------------

apiRouter.get('/profile', requireAuth, (req: AuthRequest, res) => {
  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.userId!);
  res.json(profile);
});

apiRouter.put('/profile', requireAuth, (req: AuthRequest, res) => {
  try {
    const { name, bio, avatar_url, language, timezone, daily_target_minutes, notifications_enabled } = req.body;
    const now = Date.now();

    db.prepare(`
      UPDATE profiles SET
        name = COALESCE(?, name),
        bio = COALESCE(?, bio),
        avatar_url = COALESCE(?, avatar_url),
        language = COALESCE(?, language),
        timezone = COALESCE(?, timezone),
        daily_target_minutes = COALESCE(?, daily_target_minutes),
        notifications_enabled = COALESCE(?, notifications_enabled),
        updated_at = ?
      WHERE user_id = ?
    `).run(name, bio, avatar_url, language, timezone, daily_target_minutes, notifications_enabled, now, req.userId!);

    const updated = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.userId!);
    res.json(updated);
  } catch (err: any) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ---------------- COINS & TRANSACTIONS ----------------

apiRouter.get('/coins/transactions', requireAuth, (req: AuthRequest, res) => {
  const transactions = db.prepare(`
    SELECT * FROM coin_transactions WHERE user_id = ? ORDER BY timestamp DESC LIMIT 100
  `).all(req.userId!);
  res.json(transactions);
});

apiRouter.post('/coins/spend', requireAuth, (req: AuthRequest, res) => {
  try {
    const { amount, reason } = req.body;
    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive integer' });
    }

    db.exec('BEGIN TRANSACTION');
    try {
      const profile = db.prepare('SELECT coins FROM profiles WHERE user_id = ?').get(req.userId!) as any;
      if (!profile || profile.coins < numAmount) {
        db.exec('ROLLBACK');
        return res.status(400).json({ error: 'Insufficient coins balance. Negative balance is forbidden.' });
      }

      const balanceBefore = profile.coins;
      const balanceAfter = balanceBefore - numAmount;
      const now = Date.now();
      const txId = `tx_${now}_${crypto.randomBytes(4).toString('hex')}`;

      db.prepare('UPDATE profiles SET coins = ?, updated_at = ? WHERE user_id = ?').run(balanceAfter, now, req.userId!);
      db.prepare(`
        INSERT INTO coin_transactions (id, user_id, amount, type, reason, balance_before, balance_after, timestamp)
        VALUES (?, ?, ?, 'debit', ?, ?, ?, ?)
      `).run(txId, req.userId!, numAmount, reason || 'In-app purchase', balanceBefore, balanceAfter, now);

      db.exec('COMMIT');

      res.json({
        success: true,
        balanceBefore,
        balanceAfter,
        spent: numAmount,
      });
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  } catch (err: any) {
    console.error('Spend coins error:', err);
    res.status(500).json({ error: 'Failed to process coin deduction' });
  }
});

// ---------------- TIMER SESSIONS ----------------

apiRouter.get('/timer/sessions', requireAuth, (req: AuthRequest, res) => {
  const sessions = db.prepare(`
    SELECT * FROM timer_sessions WHERE user_id = ? ORDER BY completed_at DESC LIMIT 50
  `).all(req.userId!);
  res.json(sessions);
});

apiRouter.post('/timer/finish', requireAuth, (req: AuthRequest, res) => {
  try {
    const { actualSeconds, taskId, taskTitle, plannedMinutes } = req.body;
    const seconds = Math.max(0, parseInt(actualSeconds, 10) || 0);

    if (seconds < 5) {
      return res.status(400).json({ error: 'Session too short to record (< 5 seconds)' });
    }

    const minutes = Math.floor(seconds / 60);
    // Rewards calculation:
    // 2 XP per minute (minimum 1 XP if >= 30 seconds)
    const xpEarned = Math.max(1, minutes * 2);
    // 1 Coin per 2 minutes (minimum 1 Coin if >= 60 seconds)
    const coinsEarned = minutes >= 1 ? Math.max(1, Math.floor(minutes / 2)) : 0;

    const now = Date.now();
    const sessionId = `sess_${now}_${crypto.randomBytes(4).toString('hex')}`;

    db.exec('BEGIN TRANSACTION');
    try {
      // 1. Insert timer session
      db.prepare(`
        INSERT INTO timer_sessions (id, user_id, task_id, task_title, planned_minutes, actual_seconds, actual_minutes, xp_earned, coins_earned, started_at, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(sessionId, req.userId!, taskId || null, taskTitle || 'Focus Session', plannedMinutes || 25, seconds, minutes, xpEarned, coinsEarned, now - seconds * 1000, now);

      // 2. Update profile XP, Coins, and Level
      const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.userId!) as any;
      const balanceBefore = profile.coins;
      const balanceAfter = balanceBefore + coinsEarned;
      const newTotalXp = profile.xp + xpEarned;
      const levelInfo = calculateLevel(newTotalXp);

      db.prepare(`
        UPDATE profiles SET
          xp = ?,
          level = ?,
          title = ?,
          coins = ?,
          updated_at = ?
        WHERE user_id = ?
      `).run(newTotalXp, levelInfo.level, levelInfo.title, balanceAfter, now, req.userId!);

      // 3. Log Coin Transaction
      if (coinsEarned > 0) {
        const txId = `tx_${now}_${crypto.randomBytes(4).toString('hex')}`;
        db.prepare(`
          INSERT INTO coin_transactions (id, user_id, amount, type, reason, balance_before, balance_after, timestamp)
          VALUES (?, ?, ?, 'credit', ?, ?, ?, ?)
        `).run(txId, req.userId!, coinsEarned, `Focus Session (${minutes}m)`, balanceBefore, balanceAfter, now);
      }

      // 4. Log XP Transaction
      const xpTxId = `xptx_${now}_${crypto.randomBytes(4).toString('hex')}`;
      db.prepare(`
        INSERT INTO xp_transactions (id, user_id, amount, source, reason, timestamp)
        VALUES (?, ?, ?, 'timer_session', ?, ?)
      `).run(xpTxId, req.userId!, xpEarned, `Focus Session (${minutes}m)`, now);

      db.exec('COMMIT');

      // Check achievements
      checkAchievements(req.userId!);

      const updatedProfile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.userId!);

      res.json({
        success: true,
        sessionId,
        actualSeconds: seconds,
        actualMinutes: minutes,
        xpEarned,
        coinsEarned,
        profile: updatedProfile,
      });
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  } catch (err: any) {
    console.error('Timer finish error:', err);
    res.status(500).json({ error: 'Failed to record timer session' });
  }
});

// ---------------- TASKS ----------------

apiRouter.get('/tasks', requireAuth, (req: AuthRequest, res) => {
  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC').all(req.userId!) as any[];
  const mapped = tasks.map((t) => ({
    ...t,
    subtasks: JSON.parse(t.subtasks_json || '[]'),
  }));
  res.json(mapped);
});

apiRouter.post('/tasks', requireAuth, (req: AuthRequest, res) => {
  try {
    const { title, description, category, priority, due_date, due_time, estimated_minutes, xp_reward, coin_reward, subtasks, time_block } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const id = `task_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const now = Date.now();
    const subtasksJson = JSON.stringify(subtasks || []);

    db.prepare(`
      INSERT INTO tasks (
        id, user_id, title, description, category, priority, status, due_date, due_time,
        estimated_minutes, xp_reward, coin_reward, subtasks_json, time_block, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'Planned', ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      req.userId!,
      title.trim(),
      description || '',
      category || 'Study',
      priority || 'Medium',
      due_date || '',
      due_time || '',
      estimated_minutes || 25,
      xp_reward || 50,
      coin_reward || 15,
      subtasksJson,
      time_block || '',
      now,
      now
    );

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as any;
    res.json({ ...task, subtasks: JSON.parse(task.subtasks_json || '[]') });
  } catch (err: any) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

apiRouter.put('/tasks/:id', requireAuth, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, priority, due_date, due_time, estimated_minutes, subtasks, time_block, status } = req.body;

    const existing = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(id, req.userId!) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const now = Date.now();
    const subtasksJson = subtasks !== undefined ? JSON.stringify(subtasks) : existing.subtasks_json;

    db.prepare(`
      UPDATE tasks SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        priority = COALESCE(?, priority),
        status = COALESCE(?, status),
        due_date = COALESCE(?, due_date),
        due_time = COALESCE(?, due_time),
        estimated_minutes = COALESCE(?, estimated_minutes),
        subtasks_json = ?,
        time_block = COALESCE(?, time_block),
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(
      title?.trim(),
      description,
      category,
      priority,
      status,
      due_date,
      due_time,
      estimated_minutes,
      subtasksJson,
      time_block,
      now,
      id,
      req.userId!
    );

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as any;
    res.json({ ...updated, subtasks: JSON.parse(updated.subtasks_json || '[]') });
  } catch (err: any) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

apiRouter.delete('/tasks/:id', requireAuth, (req: AuthRequest, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(req.params.id, req.userId!);
  res.json({ success: true, message: 'Task deleted' });
});

apiRouter.post('/tasks/:id/complete', requireAuth, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(id, req.userId!) as any;
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status === 'Completed') {
      return res.json({ message: 'Task already completed', task });
    }

    const now = Date.now();
    const xpReward = task.xp_reward || 50;
    const coinReward = task.coin_reward || 15;

    db.exec('BEGIN TRANSACTION');
    try {
      db.prepare("UPDATE tasks SET status = 'Completed', completed_at = ?, updated_at = ? WHERE id = ?").run(now, now, id);

      // Award XP & Coins
      const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.userId!) as any;
      const balanceBefore = profile.coins;
      const balanceAfter = balanceBefore + coinReward;
      const newTotalXp = profile.xp + xpReward;
      const levelInfo = calculateLevel(newTotalXp);

      db.prepare(`
        UPDATE profiles SET
          xp = ?,
          level = ?,
          title = ?,
          coins = ?,
          updated_at = ?
        WHERE user_id = ?
      `).run(newTotalXp, levelInfo.level, levelInfo.title, balanceAfter, now, req.userId!);

      // Coin Transaction
      const txId = `tx_${now}_${crypto.randomBytes(4).toString('hex')}`;
      db.prepare(`
        INSERT INTO coin_transactions (id, user_id, amount, type, reason, balance_before, balance_after, timestamp)
        VALUES (?, ?, ?, 'credit', ?, ?, ?, ?)
      `).run(txId, req.userId!, coinReward, `Completed Task: ${task.title}`, balanceBefore, balanceAfter, now);

      // XP Transaction
      const xpTxId = `xptx_${now}_${crypto.randomBytes(4).toString('hex')}`;
      db.prepare(`
        INSERT INTO xp_transactions (id, user_id, amount, source, reason, timestamp)
        VALUES (?, ?, ?, 'task_complete', ?, ?)
      `).run(xpTxId, req.userId!, xpReward, `Completed Task: ${task.title}`, now);

      db.exec('COMMIT');

      checkAchievements(req.userId!);

      const updatedProfile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.userId!);
      const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as any;

      res.json({
        success: true,
        task: { ...updatedTask, subtasks: JSON.parse(updatedTask.subtasks_json || '[]') },
        profile: updatedProfile,
        xpEarned: xpReward,
        coinsEarned: coinReward,
      });
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  } catch (err: any) {
    console.error('Complete task error:', err);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

apiRouter.post('/tasks/:id/reopen', requireAuth, (req: AuthRequest, res) => {
  const { id } = req.params;
  const now = Date.now();
  db.prepare("UPDATE tasks SET status = 'Planned', completed_at = NULL, updated_at = ? WHERE id = ? AND user_id = ?").run(now, id, req.userId!);
  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as any;
  res.json({ ...updated, subtasks: JSON.parse(updated.subtasks_json || '[]') });
});

// ---------------- DAILY PLANNER ----------------

apiRouter.get('/daily-plan', requireAuth, (req: AuthRequest, res) => {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const plan = db.prepare('SELECT * FROM daily_plans WHERE user_id = ? AND date = ?').get(req.userId!, date) as any;
  if (!plan) {
    return res.json({ date, timeBlocks: [], notes: '' });
  }
  res.json({
    id: plan.id,
    date: plan.date,
    timeBlocks: JSON.parse(plan.time_blocks_json || '[]'),
    notes: plan.notes || '',
  });
});

apiRouter.post('/daily-plan', requireAuth, (req: AuthRequest, res) => {
  try {
    const { date, timeBlocks, notes } = req.body;
    if (!date) return res.status(400).json({ error: 'Date is required' });

    const now = Date.now();
    const id = `plan_${date}_${req.userId}`;
    const blocksJson = JSON.stringify(timeBlocks || []);

    db.prepare(`
      INSERT INTO daily_plans (id, user_id, date, time_blocks_json, notes, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, date) DO UPDATE SET
        time_blocks_json = excluded.time_blocks_json,
        notes = excluded.notes,
        updated_at = excluded.updated_at
    `).run(id, req.userId!, date, blocksJson, notes || '', now);

    res.json({ success: true, date, timeBlocks: timeBlocks || [], notes: notes || '' });
  } catch (err: any) {
    console.error('Save daily plan error:', err);
    res.status(500).json({ error: 'Failed to save daily plan' });
  }
});

// ---------------- GOALS ----------------

apiRouter.get('/goals', requireAuth, (req: AuthRequest, res) => {
  const goals = db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC').all(req.userId!);
  res.json(goals);
});

apiRouter.post('/goals', requireAuth, (req: AuthRequest, res) => {
  try {
    const { title, description, category, target_value, unit, deadline } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Goal title is required' });
    }

    const id = `goal_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const now = Date.now();
    const target = parseInt(target_value, 10) || 10;

    db.prepare(`
      INSERT INTO goals (id, user_id, title, description, category, target_value, current_value, unit, deadline, completed, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, 0, ?)
    `).run(id, req.userId!, title.trim(), description || '', category || 'Study', target, unit || 'units', deadline || '', now);

    const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    res.json(goal);
  } catch (err: any) {
    console.error('Create goal error:', err);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

apiRouter.put('/goals/:id', requireAuth, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, target_value, current_value, unit, deadline } = req.body;

    const existing = db.prepare('SELECT * FROM goals WHERE id = ? AND user_id = ?').get(id, req.userId!) as any;
    if (!existing) return res.status(404).json({ error: 'Goal not found' });

    let isCompleted = existing.completed;
    let completedAt = existing.completed_at;

    const newCurrent = current_value !== undefined ? parseInt(current_value, 10) : existing.current_value;
    const newTarget = target_value !== undefined ? parseInt(target_value, 10) : existing.target_value;

    if (newCurrent >= newTarget && isCompleted === 0) {
      isCompleted = 1;
      completedAt = Date.now();
    } else if (newCurrent < newTarget && isCompleted === 1) {
      isCompleted = 0;
      completedAt = null;
    }

    db.prepare(`
      UPDATE goals SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        target_value = ?,
        current_value = ?,
        unit = COALESCE(?, unit),
        deadline = COALESCE(?, deadline),
        completed = ?,
        completed_at = ?
      WHERE id = ? AND user_id = ?
    `).run(title?.trim(), description, category, newTarget, newCurrent, unit, deadline, isCompleted, completedAt, id, req.userId!);

    const updated = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    res.json(updated);
  } catch (err: any) {
    console.error('Update goal error:', err);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

apiRouter.delete('/goals/:id', requireAuth, (req: AuthRequest, res) => {
  db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?').run(req.params.id, req.userId!);
  res.json({ success: true, message: 'Goal deleted' });
});

// ---------------- HABITS ----------------

apiRouter.get('/habits', requireAuth, (req: AuthRequest, res) => {
  const habits = db.prepare('SELECT * FROM habits WHERE user_id = ? ORDER BY created_at ASC').all(req.userId!) as any[];
  const today = new Date().toISOString().split('T')[0];

  const habitsWithToday = habits.map((h) => {
    const loggedToday = !!db.prepare('SELECT id FROM habit_logs WHERE habit_id = ? AND user_id = ? AND date = ?').get(h.id, req.userId!, today);
    return {
      ...h,
      completedToday: loggedToday,
    };
  });

  res.json(habitsWithToday);
});

apiRouter.post('/habits', requireAuth, (req: AuthRequest, res) => {
  try {
    const { title, category } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Habit title is required' });
    }

    const id = `habit_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const now = Date.now();

    db.prepare("INSERT INTO habits (id, user_id, title, category, frequency, streak, best_streak, created_at) VALUES (?, ?, ?, ?, 'daily', 0, 0, ?)")
      .run(id, req.userId!, title.trim(), category || 'Study', now);

    const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(id) as any;
    res.json({ ...habit, completedToday: false });
  } catch (err: any) {
    console.error('Create habit error:', err);
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

apiRouter.delete('/habits/:id', requireAuth, (req: AuthRequest, res) => {
  db.prepare('DELETE FROM habit_logs WHERE habit_id = ? AND user_id = ?').run(req.params.id, req.userId!);
  db.prepare('DELETE FROM habits WHERE id = ? AND user_id = ?').run(req.params.id, req.userId!);
  res.json({ success: true });
});

// Toggle habit completion for today and recalculate real streak
apiRouter.post('/habits/:id/toggle-today', requireAuth, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const habit = db.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?').get(id, req.userId!) as any;
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    const today = new Date().toISOString().split('T')[0];
    const existingLog = db.prepare('SELECT id FROM habit_logs WHERE habit_id = ? AND user_id = ? AND date = ?').get(id, req.userId!, today);

    const now = Date.now();
    let completedToday = false;

    db.exec('BEGIN TRANSACTION');
    try {
      if (existingLog) {
        db.prepare('DELETE FROM habit_logs WHERE habit_id = ? AND user_id = ? AND date = ?').run(id, req.userId!, today);
        completedToday = false;
      } else {
        const logId = `hlog_${now}_${crypto.randomBytes(4).toString('hex')}`;
        db.prepare('INSERT INTO habit_logs (id, user_id, habit_id, date, timestamp) VALUES (?, ?, ?, ?, ?)').run(logId, req.userId!, id, today, now);
        completedToday = true;

        // Reward 15 XP for checking a habit
        const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.userId!) as any;
        const newTotalXp = profile.xp + 15;
        const levelInfo = calculateLevel(newTotalXp);
        db.prepare('UPDATE profiles SET xp = ?, level = ?, title = ?, updated_at = ? WHERE user_id = ?')
          .run(newTotalXp, levelInfo.level, levelInfo.title, now, req.userId!);

        const xpTxId = `xptx_${now}_${crypto.randomBytes(4).toString('hex')}`;
        db.prepare("INSERT INTO xp_transactions (id, user_id, amount, source, reason, timestamp) VALUES (?, ?, 15, 'habit_complete', ?, ?)")
          .run(xpTxId, req.userId!, `Completed Habit: ${habit.title}`, now);
      }

      // Calculate real streak from consecutive days in habit_logs
      const logs = db.prepare('SELECT date FROM habit_logs WHERE habit_id = ? AND user_id = ? ORDER BY date DESC').all(id, req.userId!) as { date: string }[];
      const loggedDates = new Set(logs.map((l) => l.date));

      let currentStreak = 0;
      const checkDate = new Date();
      if (!completedToday) {
        // If not completed today, check if yesterday was completed
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (true) {
        const dStr = checkDate.toISOString().split('T')[0];
        if (loggedDates.has(dStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      const bestStreak = Math.max(habit.best_streak || 0, currentStreak);
      db.prepare('UPDATE habits SET streak = ?, best_streak = ? WHERE id = ?').run(currentStreak, bestStreak, id);

      db.exec('COMMIT');

      const updatedHabit = db.prepare('SELECT * FROM habits WHERE id = ?').get(id) as any;
      res.json({
        ...updatedHabit,
        completedToday,
      });
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  } catch (err: any) {
    console.error('Toggle habit error:', err);
    res.status(500).json({ error: 'Failed to toggle habit' });
  }
});

// ---------------- CALENDAR ----------------

apiRouter.get('/calendar', requireAuth, (req: AuthRequest, res) => {
  const month = (req.query.month as string) || new Date().toISOString().substring(0, 7); // YYYY-MM

  const tasks = db.prepare(`
    SELECT id, title, due_date, status, priority, category FROM tasks WHERE user_id = ? AND due_date LIKE ?
  `).all(req.userId!, `${month}%`);

  const sessions = db.prepare(`
    SELECT id, task_title, actual_minutes, completed_at FROM timer_sessions WHERE user_id = ? ORDER BY completed_at ASC
  `).all(req.userId!) as any[];

  // Filter sessions in this month
  const monthSessions = sessions.filter((s) => {
    const d = new Date(s.completed_at).toISOString().substring(0, 7);
    return d === month;
  });

  const habits = db.prepare('SELECT id, title FROM habits WHERE user_id = ?').all(req.userId!);
  const habitLogs = db.prepare(`
    SELECT hl.date, hl.habit_id, h.title FROM habit_logs hl JOIN habits h ON hl.habit_id = h.id WHERE hl.user_id = ? AND hl.date LIKE ?
  `).all(req.userId!, `${month}%`);

  res.json({
    month,
    tasks,
    sessions: monthSessions,
    habits,
    habitLogs,
  });
});

// ---------------- ANALYTICS ----------------

apiRouter.get('/analytics', requireAuth, (req: AuthRequest, res) => {
  const userId = req.userId!;

  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId) as any;
  const completedTasksCount = (db.prepare("SELECT COUNT(*) as c FROM tasks WHERE user_id = ? AND status = 'Completed'").get(userId) as any).c;
  const totalSessionsCount = (db.prepare('SELECT COUNT(*) as c FROM timer_sessions WHERE user_id = ?').get(userId) as any).c;
  const totalStudySeconds = (db.prepare('SELECT COALESCE(SUM(actual_seconds), 0) as total FROM timer_sessions WHERE user_id = ?').get(userId) as any).total;
  const totalStudyMinutes = Math.floor(totalStudySeconds / 60);

  const totalCoinsEarned = (db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM coin_transactions WHERE user_id = ? AND type = 'credit'").get(userId) as any).total;
  const totalCoinsSpent = (db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM coin_transactions WHERE user_id = ? AND type = 'debit'").get(userId) as any).total;

  // Past 7 days focus minutes breakdown
  const dailyFocus: { date: string; dayLabel: string; minutes: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

    const startOfDay = new Date(`${dateStr}T00:00:00Z`).getTime();
    const endOfDay = new Date(`${dateStr}T23:59:59Z`).getTime();

    const sumSec = (db.prepare(`
      SELECT COALESCE(SUM(actual_seconds), 0) as total 
      FROM timer_sessions 
      WHERE user_id = ? AND completed_at >= ? AND completed_at <= ?
    `).get(userId, startOfDay, endOfDay) as any).total;

    dailyFocus.push({
      date: dateStr,
      dayLabel,
      minutes: Math.floor(sumSec / 60),
    });
  }

  // Category breakdown
  const categoryStats = db.prepare(`
    SELECT category, COUNT(*) as count, SUM(actual_minutes) as minutes
    FROM (
      SELECT COALESCE(t.category, 'Study') as category, ts.actual_minutes
      FROM timer_sessions ts
      LEFT JOIN tasks t ON ts.task_id = t.id
      WHERE ts.user_id = ?
    )
    GROUP BY category
  `).all(userId);

  res.json({
    totalStudyMinutes,
    totalStudySeconds,
    completedTasksCount,
    totalSessionsCount,
    currentStreak: profile.streak || 0,
    bestStreak: profile.best_streak || 0,
    totalXp: profile.xp || 0,
    currentCoins: profile.coins || 500,
    totalCoinsEarned,
    totalCoinsSpent,
    dailyFocus,
    categoryStats,
  });
});

// ---------------- ACHIEVEMENTS ----------------

const ALL_ACHIEVEMENTS = [
  {
    id: 'first_task',
    titleEn: 'First Step',
    titleAr: 'الخطوة الأولى',
    descEn: 'Completed your first real task',
    descAr: 'أنجزت أول مهمة حقيقية لك',
    icon: 'CheckCircle2',
    target: 1,
  },
  {
    id: 'first_session',
    titleEn: 'Flow State',
    titleAr: 'حالة التدفق',
    descEn: 'Completed your first study session',
    descAr: 'أكملت أول جلسة تركيز موثقة',
    icon: 'Zap',
    target: 1,
  },
  {
    id: 'hour_study',
    titleEn: 'Hour of Power',
    titleAr: 'ساعة من العزم',
    descEn: 'Accumulated 60 total focus minutes',
    descAr: 'سجلت ٦٠ دقيقة تركيز تراكمية حقيقية',
    icon: 'Clock',
    target: 60,
  },
  {
    id: 'tasks_10',
    titleEn: 'Tenacity',
    titleAr: 'العزيمة',
    descEn: 'Completed 10 tasks in TANZIEEM',
    descAr: 'أكملت ١٠ مهام بنجاح',
    icon: 'ListChecks',
    target: 10,
  },
  {
    id: 'streak_7',
    titleEn: '7-Day Momentum',
    titleAr: 'زخم ٧ أيام',
    descEn: 'Maintained a 7-day productive streak',
    descAr: 'حافظت على حماسك لـ ٧ أيام متتالية',
    icon: 'Flame',
    target: 7,
  },
  {
    id: 'streak_30',
    titleEn: 'Master of Habits',
    titleAr: 'سيد العادات',
    descEn: 'Achieved an unbroken 30-day streak',
    descAr: 'حققت ٣٠ يوماً متتالياً من الالتزام التام',
    icon: 'Trophy',
    target: 30,
  },
  {
    id: 'productivity_master',
    titleEn: 'Productivity Legend',
    titleAr: 'أسطورة الإنتاجية',
    descEn: 'Earned over 1,000 lifetime XP',
    descAr: 'جمعت أكثر من ١,٠٠٠ نقطة خبرة موثقة',
    icon: 'Crown',
    target: 1000,
  },
];

apiRouter.get('/achievements', requireAuth, (req: AuthRequest, res) => {
  const userUnlocked = db.prepare('SELECT id, unlocked_at FROM achievements WHERE user_id = ? AND unlocked = 1').all(req.userId!) as any[];
  const unlockedMap = new Map(userUnlocked.map((u) => [u.id, u.unlocked_at]));

  const list = ALL_ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: unlockedMap.has(a.id),
    unlockedAt: unlockedMap.get(a.id) || null,
  }));

  res.json(list);
});

// ---------------- QURAN BOOKMARKS & HISTORY ----------------

apiRouter.get('/quran/bookmarks', requireAuth, (req: AuthRequest, res) => {
  const bookmarks = db.prepare('SELECT * FROM quran_bookmarks WHERE user_id = ? ORDER BY timestamp DESC').all(req.userId!);
  res.json(bookmarks);
});

apiRouter.post('/quran/bookmarks', requireAuth, (req: AuthRequest, res) => {
  const { surah_number, surah_name_ar, surah_name_en, ayah_number } = req.body;
  const id = `bm_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const now = Date.now();

  db.prepare(`
    INSERT INTO quran_bookmarks (id, user_id, surah_number, surah_name_ar, surah_name_en, ayah_number, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.userId!, surah_number, surah_name_ar, surah_name_en, ayah_number || 1, now);

  res.json({ success: true, id });
});

apiRouter.delete('/quran/bookmarks/:id', requireAuth, (req: AuthRequest, res) => {
  db.prepare('DELETE FROM quran_bookmarks WHERE id = ? AND user_id = ?').run(req.params.id, req.userId!);
  res.json({ success: true });
});

apiRouter.get('/quran/history', requireAuth, (req: AuthRequest, res) => {
  const history = db.prepare('SELECT * FROM quran_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT 20').all(req.userId!);
  res.json(history);
});

apiRouter.post('/quran/history', requireAuth, (req: AuthRequest, res) => {
  const { surah_number, surah_name_ar, surah_name_en, last_position_seconds, completed } = req.body;
  const id = `qh_${req.userId}_${surah_number}`;
  const now = Date.now();

  db.prepare(`
    INSERT INTO quran_history (id, user_id, surah_number, surah_name_ar, surah_name_en, last_position_seconds, completed, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      last_position_seconds = excluded.last_position_seconds,
      completed = excluded.completed,
      timestamp = excluded.timestamp
  `).run(id, req.userId!, surah_number, surah_name_ar, surah_name_en, last_position_seconds || 0, completed ? 1 : 0, now);

  res.json({ success: true });
});

// ---------------- PODCASTS FAVORITES & HISTORY ----------------

apiRouter.get('/podcasts/favorites', requireAuth, (req: AuthRequest, res) => {
  const favs = db.prepare('SELECT * FROM podcast_favorites WHERE user_id = ? ORDER BY timestamp DESC').all(req.userId!);
  res.json(favs);
});

apiRouter.post('/podcasts/favorites/toggle', requireAuth, (req: AuthRequest, res) => {
  const { episode_id, playlist_id, title, thumbnail } = req.body;
  const existing = db.prepare('SELECT id FROM podcast_favorites WHERE user_id = ? AND episode_id = ?').get(req.userId!, episode_id);

  if (existing) {
    db.prepare('DELETE FROM podcast_favorites WHERE user_id = ? AND episode_id = ?').run(req.userId!, episode_id);
    return res.json({ favorited: false });
  } else {
    const id = `pfav_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    db.prepare(`
      INSERT INTO podcast_favorites (id, user_id, episode_id, playlist_id, title, thumbnail, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.userId!, episode_id, playlist_id, title, thumbnail || '', Date.now());
    return res.json({ favorited: true });
  }
});

apiRouter.get('/podcasts/history', requireAuth, (req: AuthRequest, res) => {
  const history = db.prepare('SELECT * FROM podcast_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT 20').all(req.userId!);
  res.json(history);
});

apiRouter.post('/podcasts/history', requireAuth, (req: AuthRequest, res) => {
  const { episode_id, playlist_id, title, thumbnail, last_position_seconds, duration_seconds, completed } = req.body;
  const id = `phist_${req.userId}_${episode_id}`;
  const now = Date.now();

  db.prepare(`
    INSERT INTO podcast_history (id, user_id, episode_id, playlist_id, title, thumbnail, last_position_seconds, duration_seconds, completed, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, episode_id) DO UPDATE SET
      last_position_seconds = excluded.last_position_seconds,
      duration_seconds = excluded.duration_seconds,
      completed = excluded.completed,
      timestamp = excluded.timestamp
  `).run(id, req.userId!, episode_id, playlist_id, title, thumbnail || '', last_position_seconds || 0, duration_seconds || 0, completed ? 1 : 0, now);

  res.json({ success: true });
});
