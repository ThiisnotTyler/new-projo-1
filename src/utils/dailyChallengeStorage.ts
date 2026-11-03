import { PictureItem, DailyChallengeState, SliceBand, Choice } from '../types/game';
import { getUserStats, saveUserStats, unlockAchievement } from './statsStorage';
import { addActivityEvent } from './leaderboardStorage';

const DAILY_STORAGE_PREFIX = 'dichotomy_daily_challenge_';

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDailySeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getDailySliceInfo(dateStr: string = getTodayDateString()): {
  sliceBand: SliceBand;
  sliceLabel: string;
  sliceDescription: string;
} {
  const seed = getDailySeed(dateStr);
  const bandIndex = Math.floor(seed / 11) % 3;

  if (bandIndex === 0) {
    return {
      sliceBand: 'top',
      sliceLabel: 'Top 1/3: Forehead & Hairline',
      sliceDescription: 'Inspect upper head features, hairstyle, and brow tension.',
    };
  } else if (bandIndex === 1) {
    return {
      sliceBand: 'middle',
      sliceLabel: 'Middle 1/3: Eyes & Gaze',
      sliceDescription: 'Inspect eye shape, gaze intensity, and nasal bridge.',
    };
  } else {
    return {
      sliceBand: 'bottom',
      sliceLabel: 'Bottom 1/3: Mouth & Jawline',
      sliceDescription: 'Inspect lip expression, smile/smirk, chin, and jawline.',
    };
  }
}

export function getDailyChallengeItem(
  items: PictureItem[],
  dateStr: string = getTodayDateString()
): {
  item: PictureItem;
  sliceBand: SliceBand;
  sliceLabel: string;
  sliceDescription: string;
} {
  if (!items || items.length === 0) {
    throw new Error('No items available in database');
  }

  const seed = getDailySeed(dateStr);
  const itemIndex = seed % items.length;
  const item = items[itemIndex];
  const sliceInfo = getDailySliceInfo(dateStr);

  return {
    item,
    ...sliceInfo,
  };
}

export function getDailyChallengeState(dateStr: string = getTodayDateString()): DailyChallengeState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${DAILY_STORAGE_PREFIX}${dateStr}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function recordDailyChallengeAnswer(
  dateStr: string,
  item: PictureItem,
  sliceBand: SliceBand,
  sliceLabel: string,
  userChoice: Choice,
  timeSpentMs: number
): { state: DailyChallengeState; streakUpdated: boolean } {
  const isCorrect = userChoice === item.correctAnswer;
  const basePoints = isCorrect ? 1500 : 250;
  // Speed bonus up to 500 extra points for fast answer within 10 seconds
  const speedBonus = isCorrect ? Math.max(0, Math.floor(500 - (timeSpentMs / 1000) * 50)) : 0;
  const pointsEarned = basePoints + speedBonus;

  const currentStats = getUserStats();
  const prevStreak = currentStats.dailyStreak;
  const newStreak = isCorrect ? prevStreak + 1 : prevStreak;

  const state: DailyChallengeState = {
    dateStr,
    itemId: item.id,
    sliceBand,
    sliceLabel,
    isCompleted: true,
    userChoice,
    isCorrect,
    pointsEarned,
    timeSpentMs,
    answeredAt: new Date().toISOString(),
    streakAtTime: newStreak,
  };

  try {
    localStorage.setItem(`${DAILY_STORAGE_PREFIX}${dateStr}`, JSON.stringify(state));
  } catch {
    // ignore
  }

  // Update UserStats
  currentStats.totalGames += 1;
  currentStats.totalScore += pointsEarned;
  currentStats.highScore = Math.max(currentStats.highScore, pointsEarned);
  if (isCorrect) {
    currentStats.totalCorrect += 1;
    currentStats.currentStreak += 1;
    currentStats.bestStreakEver = Math.max(currentStats.bestStreakEver, currentStats.currentStreak);
    currentStats.dailyStreak = newStreak;
    currentStats.xp += 300;
  } else {
    currentStats.totalIncorrect += 1;
    currentStats.currentStreak = 0;
    currentStats.xp += 75;
  }

  currentStats.overallAccuracy = Math.round(
    (currentStats.totalCorrect / (currentStats.totalCorrect + currentStats.totalIncorrect)) * 100
  );
  currentStats.lastPlayedDate = dateStr;

  saveUserStats(currentStats);

  // Check achievements
  if (isCorrect) {
    unlockAchievement('daily_challenger');
    if (newStreak >= 3) unlockAchievement('streak_3');
    if (newStreak >= 7) unlockAchievement('streak_7');
  }

  // Broadcast to activity ticker
  addActivityEvent({
    id: `act-daily-${Date.now()}`,
    username: currentStats.username,
    avatar: currentStats.avatar,
    action: isCorrect
      ? `mastered today's Daily Spliced 50/50 (${sliceLabel.split(':')[0]})!`
      : `attempted today's Daily Spliced 50/50`,
    timestamp: 'Just now',
    score: pointsEarned,
  });

  return { state, streakUpdated: isCorrect };
}

export function getTimeUntilNextDaily(): {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  const diffMs = tomorrow.getTime() - now.getTime();

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  const formatted = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;

  return { hours, minutes, seconds, formatted };
}
