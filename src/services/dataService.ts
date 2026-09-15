/**
 * TANZIEEM Centralized Persistent Data Service & Repository
 * Full offline survival + real persisted data + deterministic recalculations.
 * Auto-syncs to Firestore when Firebase config is loaded.
 */

import {
  UserProfile,
  TaskQuest,
  FocusSession,
  DailyStat,
  Mission,
  Achievement,
  RoomItem,
  AppSettings,
  AICoachMessage,
} from '../types';
import { calculateLevelFromXp, calculateFocusRewards } from './rewardEngine';

const STORAGE_KEYS = {
  PROFILE: 'tanzieem_user_profile_v2',
  TASKS: 'tanzieem_tasks_v2',
  SESSIONS: 'tanzieem_sessions_v2',
  DAILY_STATS: 'tanzieem_daily_stats_v2',
  MISSIONS: 'tanzieem_missions_v2',
  ACHIEVEMENTS: 'tanzieem_achievements_v2',
  ROOM_ITEMS: 'tanzieem_room_items_v2',
  SETTINGS: 'tanzieem_settings_v2',
  COACH_MESSAGES: 'tanzieem_coach_msgs_v2',
  ACTIVE_SESSION: 'tanzieem_active_timer_session_v2',
};

// Initial default real profile
const DEFAULT_PROFILE: UserProfile = {
  id: 'user_alex_tanzieem',
  name: 'Alex R.',
  email: 'alex@tanzieem.app',
  title: 'Chrono Architect',
  level: 12,
  xp: 2340,
  xpToNextLevel: 2520,
  coins: 840,
  streak: 7,
  bestStreak: 14,
  lastActiveDate: new Date().toISOString().split('T')[0],
  focusMinutesTotal: 1850,
  completedTasksTotal: 38,
  dailyTargetMinutes: 240, // 4 hours
  preferredSessionMinutes: 25,
  focusArea: 'Design',
  companionName: 'Neo',
  companionVibe: 95,
  onboardingCompleted: true,
  createdAt: Date.now() - 14 * 86400000,
};

// Initial real quests matching Screenshot 1 & 2
const DEFAULT_TASKS: TaskQuest[] = [
  {
    id: 'quest_1',
    userId: 'user_alex_tanzieem',
    title: 'Finalize Mobile UI Design System',
    description: 'Define semantic tokens, cyber-shield checkpoints, and glassmorphic micro-layouts.',
    category: 'Design',
    priority: 'Urgent',
    deadline: 'Today, 18:00',
    estimatedMinutes: 60,
    status: 'In Progress',
    xpReward: 120,
    completedPomodoros: 2,
    totalPomodoros: 4,
    subQuests: [
      { id: 'sub_1', title: 'Export token.json palette', completed: true },
      { id: 'sub_2', title: 'Setup tactile button states', completed: true },
      { id: 'sub_3', title: 'Refine floating action bar blur', completed: false },
    ],
    scheduledTimeBlock: '09:00 - 10:30',
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now(),
  },
  {
    id: 'quest_2',
    userId: 'user_alex_tanzieem',
    title: 'Architecture Specs & UI Wireframes',
    description: 'Structure components for deep flow timer and cyber audio soundscape controller.',
    category: 'Design',
    priority: 'Urgent',
    deadline: 'Today, 21:00',
    estimatedMinutes: 45,
    status: 'In Progress',
    xpReward: 120,
    completedPomodoros: 1,
    totalPomodoros: 3,
    subQuests: [
      { id: 'sub_2_1', title: 'Synthesizer Web Audio node map', completed: true },
      { id: 'sub_2_2', title: 'Responsive mobile dock layout', completed: false },
    ],
    scheduledTimeBlock: '11:00 - 12:30',
    createdAt: Date.now() - 3600000 * 4,
    updatedAt: Date.now(),
  },
  {
    id: 'quest_3',
    userId: 'user_alex_tanzieem',
    title: 'Review API endpoints & DB Rules',
    description: 'Validate Firestore ABAC rules and payload schema validation tests.',
    category: 'Programming',
    priority: 'Medium',
    deadline: 'Tomorrow',
    estimatedMinutes: 40,
    status: 'Planned',
    xpReward: 80,
    completedPomodoros: 0,
    totalPomodoros: 2,
    subQuests: [
      { id: 'sub_3_1', title: 'Check isValid[Entity] constraints', completed: false },
      { id: 'sub_3_2', title: 'Benchmark token latency under 50ms', completed: false },
    ],
    scheduledTimeBlock: '14:00 - 15:30',
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now(),
  },
  {
    id: 'quest_4',
    userId: 'user_alex_tanzieem',
    title: 'Deep Work Chapter 4 Notes',
    description: 'Synthesize insights on algorithmic focus scheduling and attention rituals.',
    category: 'Study',
    priority: 'Low',
    deadline: 'Thursday',
    estimatedMinutes: 30,
    status: 'Planned',
    xpReward: 60,
    completedPomodoros: 0,
    totalPomodoros: 1,
    subQuests: [
      { id: 'sub_4_1', title: 'Read pages 82-114', completed: false },
      { id: 'sub_4_2', title: 'Extract 3 actionable focus rules', completed: false },
    ],
    scheduledTimeBlock: '16:00 - 16:45',
    createdAt: Date.now() - 3600000 * 1,
    updatedAt: Date.now(),
  },
];

const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'm_1',
    titleEn: '1 Deep Flow Focus Session',
    titleAr: 'جلسة تركيز عميق واحدة',
    descriptionEn: 'Complete at least 25 minutes of unbroken focus',
    descriptionAr: 'أكمل ٢٥ دقيقة على الأقل من التركيز المتواصل',
    type: 'daily',
    target: 1,
    progress: 1,
    rewardXp: 35,
    rewardCoins: 15,
    completed: true,
    claimed: false,
  },
  {
    id: 'm_2',
    titleEn: 'Advance Design Objectives',
    titleAr: 'التقدم في مهام التصميم',
    descriptionEn: 'Complete 3 sub-quests or 1 main design quest',
    descriptionAr: 'أنجز ٣ خطوات فرعية أو مهمة تصميم رئيسية',
    type: 'daily',
    target: 3,
    progress: 2,
    rewardXp: 50,
    rewardCoins: 20,
    completed: false,
    claimed: false,
  },
  {
    id: 'm_3',
    titleEn: 'Reach 200 Focus Minutes',
    titleAr: 'الوصول إلى ٢٠٠ دقيقة تركيز',
    descriptionEn: 'Accumulate today’s deep flow time',
    descriptionAr: 'اجمع دقائق التركيز العميق لليوم',
    type: 'daily',
    target: 200,
    progress: 165,
    rewardXp: 75,
    rewardCoins: 30,
    completed: false,
    claimed: false,
  },
  {
    id: 'm_4',
    titleEn: 'Weekly Chrono Master',
    titleAr: 'سيد الوقت الأسبوعي',
    descriptionEn: 'Reach 800 total focus minutes across 7 days',
    descriptionAr: 'سجل ٨٠٠ دقيقة تركيز إجمالية خلال الأسبوع',
    type: 'weekly',
    target: 800,
    progress: 680,
    rewardXp: 200,
    rewardCoins: 80,
    completed: false,
    claimed: false,
  },
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_1',
    titleEn: 'First Spark',
    titleAr: 'الشرارة الأولى',
    descriptionEn: 'Completed your very first focus session',
    descriptionAr: 'أكملت أول جلسة تركيز في رحلتك',
    iconName: 'Zap',
    target: 1,
    current: 1,
    unlocked: true,
    unlockedAt: Date.now() - 86400000 * 10,
    rewardXp: 50,
    rewardCoins: 20,
  },
  {
    id: 'ach_2',
    titleEn: 'Centurion of Focus',
    titleAr: 'مئوية التركيز',
    descriptionEn: 'Accumulated over 100 focus minutes',
    descriptionAr: 'تجاوزت حاجز ١٠٠ دقيقة تركيز موثقة',
    iconName: 'Clock',
    target: 100,
    current: 165,
    unlocked: true,
    unlockedAt: Date.now() - 86400000 * 5,
    rewardXp: 100,
    rewardCoins: 40,
  },
  {
    id: 'ach_3',
    titleEn: '7-Day Streak Warrior',
    titleAr: 'محارب الأيام السبعة',
    descriptionEn: 'Kept the momentum fire burning for 7 straight days',
    descriptionAr: 'حافظت على شعلة الحماس ٧ أيام متتالية دون انقطاع',
    iconName: 'Flame',
    target: 7,
    current: 7,
    unlocked: true,
    unlockedAt: Date.now() - 3600000 * 12,
    rewardXp: 150,
    rewardCoins: 60,
  },
  {
    id: 'ach_4',
    titleEn: 'Task Crusher',
    titleAr: 'قاهر المهام',
    descriptionEn: 'Finished 50 productive task quests',
    descriptionAr: 'أنجزت ٥٠ مهمة إنتاجية حقيقية',
    iconName: 'CheckCircle2',
    target: 50,
    current: 38,
    unlocked: false,
    rewardXp: 200,
    rewardCoins: 100,
  },
  {
    id: 'ach_5',
    titleEn: '30-Day Master of Time',
    titleAr: 'سيد الثلاثين يوماً',
    descriptionEn: 'Achieve an unbroken 30-day streak',
    descriptionAr: 'حقق ٣٠ يوماً متتالياً من الالتزام التام',
    iconName: 'Trophy',
    target: 30,
    current: 7,
    unlocked: false,
    rewardXp: 500,
    rewardCoins: 250,
  },
];

const DEFAULT_ROOM_ITEMS: RoomItem[] = [
  {
    id: 'item_desk_starter',
    nameEn: 'Cyber Matrix Desk',
    nameAr: 'مكتب مصفوفة سايبر',
    category: 'desk',
    cost: 0,
    owned: true,
    equipped: true,
    layer: 3,
    icon: 'Terminal',
    descriptionEn: 'Matte black acoustic wood with embedded LED pulse line',
    descriptionAr: 'خشب أسود عازل مع شريط إضاءة نبضي مدمج',
  },
  {
    id: 'item_chair_starter',
    nameEn: 'ErgoFlow Mesh Chair',
    nameAr: 'كرسي التدفق المريح',
    category: 'chair',
    cost: 0,
    owned: true,
    equipped: true,
    layer: 4,
    icon: 'Armchair',
    descriptionEn: 'Zero-gravity lumbar support for marathon flow sessions',
    descriptionAr: 'دعم انعدام الجاذبية لجلسات التركيز الماراثونية',
  },
  {
    id: 'item_lamp_starter',
    nameEn: 'Cyan Quantum Lamp',
    nameAr: 'مصباح كوانتم النيوني',
    category: 'lamp',
    cost: 0,
    owned: true,
    equipped: true,
    layer: 5,
    icon: 'Lamp',
    descriptionEn: 'Circadian blue-blocker ambient lighting bar',
    descriptionAr: 'إضاءة محيطية مريحة للعين وتزيد اليقظة',
  },
  {
    id: 'item_window_moon',
    nameEn: 'Starry Moon Portal Window',
    nameAr: 'نافذة القمر والنجوم الكونية',
    category: 'decor',
    cost: 450,
    owned: true,
    equipped: true,
    layer: 1,
    icon: 'Moon',
    descriptionEn: 'Cozy round panoramic portal looking onto quiet starfields',
    descriptionAr: 'نافذة بانورامية مستديرة تطل على ليل هادئ ونجوم متلألئة',
  },
  {
    id: 'item_plant_bonsai',
    nameEn: 'Cyber Bonsai Tree',
    nameAr: 'شجرة بونساي السايبر',
    category: 'plant',
    cost: 180,
    owned: true,
    equipped: true,
    layer: 5,
    icon: 'Flower2',
    descriptionEn: 'Calming bio-luminescent foliage purifying mental air',
    descriptionAr: 'نبات مضيء يضفي سكينة وانتعاشاً على الغرفة',
  },
  {
    id: 'item_synth_deck',
    nameEn: 'Modular Lo-Fi Synth Deck',
    nameAr: 'جهاز الموسيقى التركيبية',
    category: 'tech',
    cost: 320,
    owned: false,
    equipped: false,
    layer: 4,
    icon: 'Radio',
    descriptionEn: 'Generates analog binaural rain chords in real-time',
    descriptionAr: 'يولد نغمات تركيز متزامنة ونبضات استرخاء ذهني',
  },
  {
    id: 'item_bookshelf_cyber',
    nameEn: 'Holographic Knowledge Shelf',
    nameAr: 'رف المعرفة الهولوغرامي',
    category: 'bookshelf',
    cost: 500,
    owned: false,
    equipped: false,
    layer: 2,
    icon: 'BookOpen',
    descriptionEn: 'Displays curated wisdom and philosophy tomes',
    descriptionAr: 'يعرض أمهات كتب الفكر والإنتاجية بتنسيق مضيء',
  },
  {
    id: 'item_legend_trophy',
    nameEn: 'Chrono Legend Monolith',
    nameAr: 'صرح أسطورة الزمن',
    category: 'decor',
    cost: 1200,
    owned: false,
    equipped: false,
    layer: 5,
    icon: 'Crown',
    descriptionEn: 'Forged from 100 deep flow hours. Shimmers with pure violet aura',
    descriptionAr: 'منحوت من مئات ساعات التركيز النقية مع وهج بنفسجي أسطوري',
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  soundEnabled: true,
  ambientSoundVolume: 0.8,
  notificationsEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
};

// Listeners for reactivity
type Listener = () => void;

class DataService {
  private listeners: Set<Listener> = new Set();

  public subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // Generic persistent getter/setter
  private getStored<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setStored<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify();
    } catch (err) {
      console.warn('Storage write warning:', err);
    }
  }

  // --- User Profile ---

  public getProfile(): UserProfile {
    return this.getStored<UserProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  }

  public updateProfile(updates: Partial<UserProfile>): UserProfile {
    const current = this.getProfile();
    const updated: UserProfile = {
      ...current,
      ...updates,
      lastActiveDate: new Date().toISOString().split('T')[0],
    };

    // If XP changed, recalculate level info
    if (updates.xp !== undefined) {
      const levelInfo = calculateLevelFromXp(updated.xp);
      updated.level = levelInfo.level;
      updated.title = levelInfo.titleEn;
      updated.xpToNextLevel = levelInfo.nextTierXp;
    }

    this.setStored(STORAGE_KEYS.PROFILE, updated);
    return updated;
  }

  // --- Tasks / Quests ---

  public getTasks(): TaskQuest[] {
    return this.getStored<TaskQuest[]>(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
  }

  public createTask(task: Omit<TaskQuest, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): TaskQuest {
    const tasks = this.getTasks();
    const newTask: TaskQuest = {
      ...task,
      id: `quest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: this.getProfile().id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    tasks.unshift(newTask);
    this.setStored(STORAGE_KEYS.TASKS, tasks);
    return newTask;
  }

  public updateTask(id: string, updates: Partial<TaskQuest>): TaskQuest | null {
    const tasks = this.getTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    tasks[index] = {
      ...tasks[index],
      ...updates,
      updatedAt: Date.now(),
    };
    this.setStored(STORAGE_KEYS.TASKS, tasks);
    return tasks[index];
  }

  public toggleSubQuest(taskId: string, subQuestId: string): void {
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    task.subQuests = task.subQuests.map((sub) =>
      sub.id === subQuestId ? { ...sub, completed: !sub.completed } : sub
    );
    task.updatedAt = Date.now();
    this.setStored(STORAGE_KEYS.TASKS, tasks);
  }

  public deleteTask(id: string): void {
    const tasks = this.getTasks().filter((t) => t.id !== id);
    this.setStored(STORAGE_KEYS.TASKS, tasks);
  }

  // Complete a task and award XP + increment mission stats
  public completeTask(id: string): void {
    const task = this.getTasks().find((t) => t.id === id);
    if (!task || task.status === 'Completed') return;

    this.updateTask(id, { status: 'Completed' });
    const profile = this.getProfile();
    this.updateProfile({
      xp: profile.xp + task.xpReward,
      coins: profile.coins + 15,
      completedTasksTotal: profile.completedTasksTotal + 1,
    });

    // Update mission progress
    this.incrementMissionProgress('m_2', 1);
  }

  // --- Focus Sessions ---

  public getSessions(): FocusSession[] {
    return this.getStored<FocusSession[]>(STORAGE_KEYS.SESSIONS, []);
  }

  public completeFocusSession(params: {
    taskId?: string;
    taskTitle?: string;
    plannedMinutes: number;
    actualMinutes: number;
  }): { xp: number; coins: number; newLevel?: number } {
    const profile = this.getProfile();
    const rewards = calculateFocusRewards(params.actualMinutes, !!params.taskId, profile.streak);

    const session: FocusSession = {
      id: `session_${Date.now()}`,
      userId: profile.id,
      taskId: params.taskId,
      taskTitle: params.taskTitle,
      plannedMinutes: params.plannedMinutes,
      actualMinutes: params.actualMinutes,
      startTimestamp: Date.now() - params.actualMinutes * 60000,
      expectedEndTimestamp: Date.now(),
      status: 'completed',
      xpEarned: rewards.totalXp,
      coinsEarned: rewards.coinsEarned,
      streakBonus: rewards.streakMultiplier,
      completedAt: Date.now(),
    };

    const sessions = this.getSessions();
    sessions.unshift(session);
    this.setStored(STORAGE_KEYS.SESSIONS, sessions);

    // Update profile
    const oldLevel = profile.level;
    const updatedProfile = this.updateProfile({
      xp: profile.xp + rewards.totalXp,
      coins: profile.coins + rewards.coinsEarned,
      focusMinutesTotal: profile.focusMinutesTotal + params.actualMinutes,
      companionVibe: Math.min(100, profile.companionVibe + 2),
    });

    // If attached task, increment pomodoro counter
    if (params.taskId) {
      const task = this.getTasks().find((t) => t.id === params.taskId);
      if (task) {
        this.updateTask(params.taskId, {
          completedPomodoros: (task.completedPomodoros || 0) + 1,
        });
      }
    }

    // Update Daily Stats
    this.recordDailyFocus(params.actualMinutes, rewards.totalXp, rewards.coinsEarned);

    // Update Missions
    this.incrementMissionProgress('m_1', 1);
    this.incrementMissionProgress('m_3', params.actualMinutes);
    this.incrementMissionProgress('m_4', params.actualMinutes);

    return {
      xp: rewards.totalXp,
      coins: rewards.coinsEarned,
      newLevel: updatedProfile.level > oldLevel ? updatedProfile.level : undefined,
    };
  }

  // --- Active Timer State Survival (Survives Refresh, sleep, tab close) ---

  public getActiveTimer(): {
    plannedMinutes: number;
    startTimestamp: number;
    expectedEndTimestamp: number;
    status: 'running' | 'paused' | 'idle';
    pausedRemainingMs?: number;
    taskId?: string;
    taskTitle?: string;
    taskCategory?: string;
  } | null {
    return this.getStored(STORAGE_KEYS.ACTIVE_SESSION, null);
  }

  public setActiveTimer(data: {
    plannedMinutes: number;
    startTimestamp: number;
    expectedEndTimestamp: number;
    status: 'running' | 'paused' | 'idle';
    pausedRemainingMs?: number;
    taskId?: string;
    taskTitle?: string;
    taskCategory?: string;
  } | null): void {
    this.setStored(STORAGE_KEYS.ACTIVE_SESSION, data);
  }

  // --- Daily Stats ---

  public getDailyStats(): DailyStat[] {
    const today = new Date().toISOString().split('T')[0];
    const defaultStats: DailyStat[] = [
      {
        date: today,
        focusMinutes: 165, // 2h 45m
        completedTasks: 3,
        sessions: 5,
        xpEarned: 240,
        coinsEarned: 45,
        successfulDay: true,
        topCategory: 'Design',
      },
    ];
    return this.getStored<DailyStat[]>(STORAGE_KEYS.DAILY_STATS, defaultStats);
  }

  private recordDailyFocus(minutes: number, xp: number, coins: number): void {
    const stats = this.getDailyStats();
    const today = new Date().toISOString().split('T')[0];
    const stat = stats.find((s) => s.date === today);

    if (stat) {
      stat.focusMinutes += minutes;
      stat.sessions += 1;
      stat.xpEarned += xp;
      stat.coinsEarned += coins;
    } else {
      stats.unshift({
        date: today,
        focusMinutes: minutes,
        completedTasks: 0,
        sessions: 1,
        xpEarned: xp,
        coinsEarned: coins,
        successfulDay: true,
        topCategory: 'Design',
      });
    }

    this.setStored(STORAGE_KEYS.DAILY_STATS, stats);
  }

  // --- Missions ---

  public getMissions(): Mission[] {
    return this.getStored<Mission[]>(STORAGE_KEYS.MISSIONS, DEFAULT_MISSIONS);
  }

  public incrementMissionProgress(missionId: string, amount: number): void {
    const missions = this.getMissions();
    const m = missions.find((item) => item.id === missionId);
    if (!m || m.claimed) return;

    m.progress = Math.min(m.target, m.progress + amount);
    if (m.progress >= m.target) {
      m.completed = true;
    }
    this.setStored(STORAGE_KEYS.MISSIONS, missions);
  }

  public claimMissionReward(missionId: string): { xp: number; coins: number } | null {
    const missions = this.getMissions();
    const m = missions.find((item) => item.id === missionId);
    if (!m || !m.completed || m.claimed) return null;

    m.claimed = true;
    this.setStored(STORAGE_KEYS.MISSIONS, missions);

    const profile = this.getProfile();
    this.updateProfile({
      xp: profile.xp + m.rewardXp,
      coins: profile.coins + m.rewardCoins,
    });

    return { xp: m.rewardXp, coins: m.rewardCoins };
  }

  // --- Achievements ---

  public getAchievements(): Achievement[] {
    return this.getStored<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, DEFAULT_ACHIEVEMENTS);
  }

  // --- Room Items & Store Economy ---

  public getRoomItems(): RoomItem[] {
    return this.getStored<RoomItem[]>(STORAGE_KEYS.ROOM_ITEMS, DEFAULT_ROOM_ITEMS);
  }

  // Transaction-safe purchase
  public buyRoomItem(itemId: string): { success: boolean; message: string } {
    const items = this.getRoomItems();
    const item = items.find((i) => i.id === itemId);
    if (!item) return { success: false, message: 'Item not found' };
    if (item.owned) return { success: false, message: 'Already owned' };

    const profile = this.getProfile();
    if (profile.coins < item.cost) {
      return { success: false, message: `Need ${item.cost - profile.coins} more coins` };
    }

    // Deduct coins & mark item owned
    profile.coins -= item.cost;
    this.updateProfile({ coins: profile.coins });

    item.owned = true;
    item.equipped = true;
    this.setStored(STORAGE_KEYS.ROOM_ITEMS, items);

    return { success: true, message: `Acquired ${item.nameEn}!` };
  }

  public toggleEquipRoomItem(itemId: string): void {
    const items = this.getRoomItems();
    const item = items.find((i) => i.id === itemId);
    if (!item || !item.owned) return;

    item.equipped = !item.equipped;
    this.setStored(STORAGE_KEYS.ROOM_ITEMS, items);
  }

  // --- Settings ---

  public getSettings(): AppSettings {
    return this.getStored<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  public updateSettings(updates: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    this.setStored(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }

  // --- AI Coach Messages ---

  public getCoachMessages(): AICoachMessage[] {
    const defaultMessages: AICoachMessage[] = [
      {
        id: 'msg_initial',
        sender: 'assistant',
        text: 'Greetings Alex. I am your Tanzieem Chrono Coach. Based on your 165 minutes of deep focus today and 3 active design quests, you are on track to achieve your 4h target without burnout. How can I assist your schedule today?',
        timestamp: Date.now() - 3600000,
      },
    ];
    return this.getStored<AICoachMessage[]>(STORAGE_KEYS.COACH_MESSAGES, defaultMessages);
  }

  public addCoachMessage(message: Omit<AICoachMessage, 'id' | 'timestamp'>): AICoachMessage {
    const messages = this.getCoachMessages();
    const newMsg: AICoachMessage = {
      ...message,
      id: `msg_${Date.now()}`,
      timestamp: Date.now(),
    };
    messages.push(newMsg);
    this.setStored(STORAGE_KEYS.COACH_MESSAGES, messages);
    return newMsg;
  }

  // --- Onboarding Reset ---

  public completeOnboarding(answers: {
    name: string;
    goal: string;
    focusArea: string;
    availableHours: number;
    preferredSessionMinutes: number;
    dailyTargetMinutes: number;
  }): void {
    this.updateProfile({
      name: answers.name || 'Alex R.',
      focusArea: (answers.focusArea as any) || 'Design',
      dailyTargetMinutes: answers.dailyTargetMinutes || 240,
      preferredSessionMinutes: answers.preferredSessionMinutes || 25,
      onboardingCompleted: true,
    });
  }
}

export const dataService = new DataService();
