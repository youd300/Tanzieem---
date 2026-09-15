import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'tanzieem.sqlite');
export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for high concurrency & reliability
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  -- Users Table
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  -- Profiles Table
  CREATE TABLE IF NOT EXISTS profiles (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT NOT NULL,
    bio TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    title TEXT DEFAULT 'Chrono Initiate',
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 500,
    streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    daily_target_minutes INTEGER DEFAULT 120,
    preferred_session_minutes INTEGER DEFAULT 25,
    focus_area TEXT DEFAULT 'Study',
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    notifications_enabled INTEGER DEFAULT 1,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Sessions Tokens
  CREATE TABLE IF NOT EXISTS session_tokens (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Coin Transactions (Audit log)
  CREATE TABLE IF NOT EXISTS coin_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'credit' | 'debit'
    reason TEXT NOT NULL,
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- XP Transactions
  CREATE TABLE IF NOT EXISTS xp_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    source TEXT NOT NULL,
    reason TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Tasks
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'Study',
    priority TEXT DEFAULT 'Medium',
    status TEXT DEFAULT 'Planned',
    due_date TEXT DEFAULT '',
    due_time TEXT DEFAULT '',
    estimated_minutes INTEGER DEFAULT 25,
    xp_reward INTEGER DEFAULT 50,
    coin_reward INTEGER DEFAULT 15,
    subtasks_json TEXT DEFAULT '[]',
    time_block TEXT DEFAULT '',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    completed_at INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Daily Plans
  CREATE TABLE IF NOT EXISTS daily_plans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    time_blocks_json TEXT DEFAULT '[]',
    notes TEXT DEFAULT '',
    updated_at INTEGER NOT NULL,
    UNIQUE(user_id, date),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Goals
  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'Study',
    target_value INTEGER DEFAULT 10,
    current_value INTEGER DEFAULT 0,
    unit TEXT DEFAULT 'units',
    deadline TEXT DEFAULT '',
    completed INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    completed_at INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Habits
  CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Study',
    frequency TEXT DEFAULT 'daily',
    streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Habit Logs
  CREATE TABLE IF NOT EXISTS habit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    habit_id TEXT NOT NULL,
    date TEXT NOT NULL, -- YYYY-MM-DD
    timestamp INTEGER NOT NULL,
    UNIQUE(user_id, habit_id, date),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(habit_id) REFERENCES habits(id) ON DELETE CASCADE
  );

  -- Timer Sessions (Real focus sessions)
  CREATE TABLE IF NOT EXISTS timer_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    task_id TEXT,
    task_title TEXT DEFAULT '',
    planned_minutes INTEGER DEFAULT 25,
    actual_seconds INTEGER NOT NULL,
    actual_minutes INTEGER NOT NULL,
    xp_earned INTEGER NOT NULL,
    coins_earned INTEGER NOT NULL,
    started_at INTEGER NOT NULL,
    completed_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Achievements
  CREATE TABLE IF NOT EXISTS achievements (
    id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    unlocked INTEGER DEFAULT 0,
    unlocked_at INTEGER,
    PRIMARY KEY (id, user_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Quran Bookmarks
  CREATE TABLE IF NOT EXISTS quran_bookmarks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    surah_number INTEGER NOT NULL,
    surah_name_ar TEXT NOT NULL,
    surah_name_en TEXT NOT NULL,
    ayah_number INTEGER DEFAULT 1,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Quran History
  CREATE TABLE IF NOT EXISTS quran_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    surah_number INTEGER NOT NULL,
    surah_name_ar TEXT NOT NULL,
    surah_name_en TEXT NOT NULL,
    last_position_seconds INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Podcast Favorites
  CREATE TABLE IF NOT EXISTS podcast_favorites (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    episode_id TEXT NOT NULL,
    playlist_id TEXT NOT NULL,
    title TEXT NOT NULL,
    thumbnail TEXT DEFAULT '',
    timestamp INTEGER NOT NULL,
    UNIQUE(user_id, episode_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Podcast History
  CREATE TABLE IF NOT EXISTS podcast_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    episode_id TEXT NOT NULL,
    playlist_id TEXT NOT NULL,
    title TEXT NOT NULL,
    thumbnail TEXT DEFAULT '',
    last_position_seconds INTEGER DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    timestamp INTEGER NOT NULL,
    UNIQUE(user_id, episode_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);
