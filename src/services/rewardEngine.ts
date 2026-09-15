/**
 * TANZIEEM Centralized Deterministic Reward & Level Engine
 * No random variations. Fully idempotent calculations.
 */

export interface LevelThreshold {
  level: number;
  titleEn: string;
  titleAr: string;
  totalXpRequired: number;
}

// Deterministic level curve
export const LEVEL_TIERS: LevelThreshold[] = [
  { level: 1, titleEn: 'Beginner', titleAr: 'مبتدئ', totalXpRequired: 0 },
  { level: 2, titleEn: 'Time Seeker', titleAr: 'باحث الوقت', totalXpRequired: 100 },
  { level: 3, titleEn: 'Cadet of Flow', titleAr: 'مستكشف التدفق', totalXpRequired: 220 },
  { level: 4, titleEn: 'Focus Apprentice', titleAr: 'متدرب التركيز', totalXpRequired: 360 },
  { level: 5, titleEn: 'Focus Explorer', titleAr: 'مستكشف التركيز', totalXpRequired: 520 },
  { level: 6, titleEn: 'Deep Thinker', titleAr: 'مفكر عميق', totalXpRequired: 700 },
  { level: 7, titleEn: 'Session Crafter', titleAr: 'صانع الجلسات', totalXpRequired: 900 },
  { level: 8, titleEn: 'Momentum Builder', titleAr: 'بانِي الزخم', totalXpRequired: 1120 },
  { level: 9, titleEn: 'Flow Disciple', titleAr: 'خبير الاستغراق', totalXpRequired: 1360 },
  { level: 10, titleEn: 'Time Builder', titleAr: 'باني الوقت', totalXpRequired: 1620 },
  { level: 11, titleEn: 'Chrono Adept', titleAr: 'عارف بالزمن', totalXpRequired: 1900 },
  { level: 12, titleEn: 'Chrono Architect', titleAr: 'مهندس زمني', totalXpRequired: 2200 },
  { level: 13, titleEn: 'Chrono Master', titleAr: 'سيد الوقت', totalXpRequired: 2520 },
  { level: 15, titleEn: 'Sprint Commander', titleAr: 'قائد الإنجاز', totalXpRequired: 3200 },
  { level: 20, titleEn: 'Hyperfocus Elite', titleAr: 'نخبة التركيز الفائق', totalXpRequired: 5200 },
  { level: 25, titleEn: 'Productivity Master', titleAr: 'سيد الإنتاجية', totalXpRequired: 7800 },
  { level: 50, titleEn: 'Time Architect', titleAr: 'معماري الزمن', totalXpRequired: 24000 },
  { level: 75, titleEn: 'Life Builder', titleAr: 'بانِي الحياة', totalXpRequired: 58000 },
  { level: 100, titleEn: 'TANZIEEM LEGEND', titleAr: 'أسطورة تنظيم', totalXpRequired: 120000 },
];

export interface LevelInfo {
  level: number;
  titleEn: string;
  titleAr: string;
  currentTierXp: number;
  nextTierXp: number;
  progressPercent: number;
}

export function calculateLevelFromXp(totalXp: number): LevelInfo {
  let currentTier = LEVEL_TIERS[0];
  let nextTier = LEVEL_TIERS[1];

  for (let i = 0; i < LEVEL_TIERS.length; i++) {
    if (totalXp >= LEVEL_TIERS[i].totalXpRequired) {
      currentTier = LEVEL_TIERS[i];
      nextTier = LEVEL_TIERS[i + 1] || {
        level: 100,
        titleEn: 'TANZIEEM LEGEND',
        titleAr: 'أسطورة تنظيم',
        totalXpRequired: LEVEL_TIERS[i].totalXpRequired,
      };
    } else {
      break;
    }
  }

  const xpInCurrentTier = Math.max(0, totalXp - currentTier.totalXpRequired);
  const xpNeededForNext = Math.max(1, nextTier.totalXpRequired - currentTier.totalXpRequired);
  const progressPercent = currentTier.level === 100 ? 100 : Math.min(100, Math.round((xpInCurrentTier / xpNeededForNext) * 100));

  return {
    level: currentTier.level,
    titleEn: currentTier.titleEn,
    titleAr: currentTier.titleAr,
    currentTierXp: xpInCurrentTier,
    nextTierXp: xpNeededForNext,
    progressPercent,
  };
}

export interface FocusRewardResult {
  baseXp: number;
  taskBonusXp: number;
  streakMultiplier: number;
  totalXp: number;
  coinsEarned: number;
}

/**
 * Deterministic formula:
 * 15m => 12 XP, 5 Coins
 * 25m => 20 XP, 8 Coins (+ task bonus = +5 XP)
 * 30m => 25 XP, 10 Coins
 * 45m => 40 XP, 16 Coins
 * 60m => 55 XP, 22 Coins
 * Streak multiplier: 1.0x (0-2 days), 1.1x (3-6 days), 1.2x (7+ days), 1.5x (30+ days)
 */
export function calculateFocusRewards(
  actualMinutes: number,
  hasAttachedTask: boolean,
  currentStreak: number
): FocusRewardResult {
  if (actualMinutes < 5) {
    return {
      baseXp: 0,
      taskBonusXp: 0,
      streakMultiplier: 1.0,
      totalXp: 0,
      coinsEarned: 0,
    };
  }

  // Linear base rates with roundings
  const baseXp = Math.round(actualMinutes * 0.85);
  const taskBonusXp = hasAttachedTask ? Math.round(actualMinutes * 0.18) + 5 : 0;
  const coinsEarned = Math.round(actualMinutes * 0.35) + (hasAttachedTask ? 2 : 0);

  let streakMultiplier = 1.0;
  if (currentStreak >= 30) streakMultiplier = 1.5;
  else if (currentStreak >= 7) streakMultiplier = 1.2;
  else if (currentStreak >= 3) streakMultiplier = 1.1;

  const totalXp = Math.round((baseXp + taskBonusXp) * streakMultiplier);

  return {
    baseXp,
    taskBonusXp,
    streakMultiplier,
    totalXp,
    coinsEarned,
  };
}

export function calculateTaskCompletionRewards(estimatedMinutes: number, priority: string) {
  let xp = 40;
  let coins = 15;

  if (priority === 'Urgent') {
    xp += 40;
    coins += 15;
  } else if (priority === 'Medium') {
    xp += 20;
    coins += 10;
  }

  if (estimatedMinutes >= 60) {
    xp += 30;
    coins += 10;
  }

  return { xp, coins };
}
