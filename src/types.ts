/**
 * TANZIEEM Core Domain Types
 * Organize Your Time. Build Your Life.
 */

export type FocusArea = 'Study' | 'Work' | 'Programming' | 'Design' | 'Reading' | 'Fitness' | 'Personal' | 'Other';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  title: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  streak: number;
  bestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  focusMinutesTotal: number;
  completedTasksTotal: number;
  dailyTargetMinutes: number; // e.g. 240 (4h)
  preferredSessionMinutes: number; // e.g. 25
  focusArea: FocusArea;
  companionName: string;
  companionVibe: number; // 0-100%
  avatarUrl?: string;
  coverUrl?: string;
  onboardingCompleted: boolean;
  createdAt: number;
}

export type TaskPriority = 'Urgent' | 'Medium' | 'Low';
export type TaskStatus = 'Planned' | 'In Progress' | 'Completed' | 'Skipped';

export interface SubQuest {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskQuest {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: FocusArea;
  priority: TaskPriority;
  deadline?: string; // YYYY-MM-DD or time
  estimatedMinutes: number;
  status: TaskStatus;
  xpReward: number;
  subQuests: SubQuest[];
  scheduledTimeBlock?: string; // e.g. "09:00 - 10:30"
  completedPomodoros?: number;
  totalPomodoros?: number;
  createdAt: number;
  updatedAt: number;
}

export type FocusSessionStatus = 'idle' | 'running' | 'paused' | 'completed' | 'abandoned';

export interface FocusSession {
  id: string;
  userId: string;
  taskId?: string;
  taskTitle?: string;
  taskCategory?: FocusArea;
  plannedMinutes: number;
  actualMinutes: number;
  startTimestamp: number;
  expectedEndTimestamp: number;
  status: FocusSessionStatus;
  pausedRemainingMs?: number;
  xpEarned: number;
  coinsEarned: number;
  streakBonus: number;
  completedAt?: number;
}

export interface DailyStat {
  date: string; // YYYY-MM-DD
  focusMinutes: number;
  completedTasks: number;
  sessions: number;
  xpEarned: number;
  coinsEarned: number;
  successfulDay: boolean;
  topCategory: FocusArea;
}

export interface Mission {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  type: 'daily' | 'weekly';
  target: number;
  progress: number;
  rewardXp: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  iconName: string;
  target: number;
  current: number;
  unlocked: boolean;
  unlockedAt?: number;
  rewardXp: number;
  rewardCoins: number;
}

export type RoomItemCategory = 'bed' | 'desk' | 'chair' | 'lamp' | 'plant' | 'bookshelf' | 'tech' | 'poster' | 'decor';

export interface RoomItem {
  id: string;
  nameEn: string;
  nameAr: string;
  category: RoomItemCategory;
  cost: number;
  owned: boolean;
  equipped: boolean;
  layer: number;
  icon: string;
  descriptionEn: string;
  descriptionAr: string;
}

export type SoundscapeType = 'lofi_rain' | 'cyber_coffee' | 'cosmic_flow' | 'none';

export type AppLanguage = 'en' | 'ar';

export interface AICoachMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  recommendations?: {
    suggestedDurationMinutes?: number;
    scheduleBlocks?: { time: string; task: string }[];
    overloadAlert?: string;
    actionableTip?: string;
  };
}

export interface AppSettings {
  language: AppLanguage;
  soundEnabled: boolean;
  ambientSoundVolume: number;
  notificationsEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
}
