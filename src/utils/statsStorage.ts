import { UserStats, RoundResult, Achievement } from '../types/game';

const STORAGE_KEY = 'dichotomy_user_stats';

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_correct',
    title: 'First Spark',
    description: 'Correctly identify your very first X or Y dilemma.',
    icon: 'Zap',
    xpReward: 100,
  },
  {
    id: 'streak_5',
    title: 'Hot Streak',
    description: 'Maintain a 5-question streak without a single mistake.',
    icon: 'Flame',
    xpReward: 250,
  },
  {
    id: 'streak_10',
    title: 'Oracle Mode',
    description: 'Reach an unbelievable 10-question answer streak!',
    icon: 'Sparkles',
    xpReward: 600,
  },
  {
    id: 'perfect_10',
    title: 'Flawless Deduction',
    description: 'Finish a full pack round with 100% accuracy.',
    icon: 'Award',
    xpReward: 800,
  },
  {
    id: 'daily_done',
    title: 'Daily Dedication',
    description: 'Complete the synchronized Daily Challenge.',
    icon: 'Calendar',
    xpReward: 350,
  },
  {
    id: 'century_correct',
    title: 'Master Fact-Checker',
    description: 'Answer 50 questions correctly across all games.',
    icon: 'ShieldCheck',
    xpReward: 1000,
  },
  {
    id: 'endless_15',
    title: 'Survival Instinct',
    description: 'Survive at least 12 rounds in Endless Survival mode.',
    icon: 'Swords',
    xpReward: 500,
  },
  {
    id: 'share_score',
    title: 'Herald of Truth',
    description: 'Share your scorecard result with friends or global rivals.',
    icon: 'Share2',
    xpReward: 200,
  },
];

function generateFriendCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'X';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const DEFAULT_STATS: UserStats = {
  username: 'Player_' + Math.floor(1000 + Math.random() * 9000),
  avatar: '🧠',
  title: 'Novice Sleuth',
  friendCode: generateFriendCode(),
  totalGames: 0,
  totalScore: 0,
  highScore: 0,
  currentStreak: 0,
  bestStreakEver: 0,
  totalCorrect: 0,
  totalIncorrect: 0,
  overallAccuracy: 0,
  xp: 0,
  level: 1,
  dailyStreak: 1,
  lastPlayedDate: null,
  history: [],
  unlockedAchievements: [],
};

export function calculateLevel(xp: number): { level: number; title: string; currentXp: number; nextLevelXp: number } {
  // 500 XP per level with scaling
  const level = Math.max(1, Math.floor(xp / 500) + 1);
  const currentXp = xp % 500;
  const nextLevelXp = 500;

  const titles = [
    'Novice Sleuth',
    'Intuitive Thinker',
    'Sharp Observer',
    'Fact Detective',
    'Pattern Specialist',
    'Master Skeptic',
    'Truth Arbiter',
    'Grand Oracle',
    'Omniscient Sage',
  ];
  const title = titles[Math.min(level - 1, titles.length - 1)];

  return { level, title, currentXp, nextLevelXp };
}

export const MAX_HISTORY_ROUNDS = 6;

export function getUserStats(): UserStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveUserStats(DEFAULT_STATS);
      return DEFAULT_STATS;
    }
    const parsed = JSON.parse(raw);
    const history = (parsed.history || []).slice(0, MAX_HISTORY_ROUNDS);
    return { ...DEFAULT_STATS, ...parsed, history };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveUserStats(stats: UserStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignore storage quote issues
  }
}

export function updateUserProfile(username: string, avatar: string): UserStats {
  const current = getUserStats();
  const updated = {
    ...current,
    username: username.trim() || current.username,
    avatar: avatar || current.avatar,
  };
  saveUserStats(updated);
  return updated;
}

export function recordRoundResult(result: RoundResult): { stats: UserStats; newAchievements: Achievement[] } {
  const current = getUserStats();
  const newAchievements: Achievement[] = [];

  const totalGames = current.totalGames + 1;
  const totalScore = current.totalScore + result.score;
  const highScore = Math.max(current.highScore, result.score);
  const bestStreakEver = Math.max(current.bestStreakEver, result.bestStreak);
  const totalCorrect = current.totalCorrect + result.correctCount;
  const totalIncorrect = current.totalIncorrect + (result.totalQuestions - result.correctCount);
  const overallAccuracy = Math.round((totalCorrect / Math.max(1, totalCorrect + totalIncorrect)) * 100);

  // Calculate XP gained
  let earnedXp = Math.round(result.score * 0.5) + (result.correctCount * 30);
  if (result.accuracy === 100) earnedXp += 200;

  // Daily streak check
  const todayStr = new Date().toISOString().split('T')[0];
  let dailyStreak = current.dailyStreak;
  if (current.lastPlayedDate) {
    const lastDate = new Date(current.lastPlayedDate);
    const today = new Date(todayStr);
    const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 1) {
      dailyStreak += 1;
    } else if (diffDays > 1) {
      dailyStreak = 1;
    }
  } else {
    dailyStreak = 1;
  }

  // Check achievements
  const unlocked = new Set(current.unlockedAchievements);

  if (result.correctCount > 0 && !unlocked.has('first_correct')) {
    unlocked.add('first_correct');
    const a = ALL_ACHIEVEMENTS.find(item => item.id === 'first_correct');
    if (a) newAchievements.push(a);
  }

  if (result.bestStreak >= 5 && !unlocked.has('streak_5')) {
    unlocked.add('streak_5');
    const a = ALL_ACHIEVEMENTS.find(item => item.id === 'streak_5');
    if (a) newAchievements.push(a);
  }

  if (result.bestStreak >= 10 && !unlocked.has('streak_10')) {
    unlocked.add('streak_10');
    const a = ALL_ACHIEVEMENTS.find(item => item.id === 'streak_10');
    if (a) newAchievements.push(a);
  }

  if (result.accuracy === 100 && result.totalQuestions >= 6 && !unlocked.has('perfect_10')) {
    unlocked.add('perfect_10');
    const a = ALL_ACHIEVEMENTS.find(item => item.id === 'perfect_10');
    if (a) newAchievements.push(a);
  }

  if (totalGames >= 3 && !unlocked.has('daily_done')) {
    unlocked.add('daily_done');
    const a = ALL_ACHIEVEMENTS.find(item => item.id === 'daily_done');
    if (a) newAchievements.push(a);
  }

  if (totalCorrect >= 50 && !unlocked.has('century_correct')) {
    unlocked.add('century_correct');
    const a = ALL_ACHIEVEMENTS.find(item => item.id === 'century_correct');
    if (a) newAchievements.push(a);
  }

  if (result.correctCount >= 6 && !unlocked.has('endless_15')) {
    unlocked.add('endless_15');
    const a = ALL_ACHIEVEMENTS.find(item => item.id === 'endless_15');
    if (a) newAchievements.push(a);
  }

  // Add achievement XP bonuses
  newAchievements.forEach(ach => {
    earnedXp += ach.xpReward;
  });

  const totalXp = current.xp + earnedXp;
  const { level, title } = calculateLevel(totalXp);

  // Keep last 6 round results for brevity
  const updatedHistory = [result, ...(current.history || [])].slice(0, MAX_HISTORY_ROUNDS);

  const allAnswerTimes = updatedHistory.flatMap(h => h.answers.map(a => a.timeSpentMs)).filter(t => t > 0);
  const avgAnswerTimeSeconds = allAnswerTimes.length > 0
    ? Number((allAnswerTimes.reduce((acc, t) => acc + t, 0) / allAnswerTimes.length / 1000).toFixed(1))
    : (result.avgTimeSeconds || 2.0);

  const updatedStats: UserStats = {
    ...current,
    totalGames,
    totalScore,
    highScore,
    currentStreak: result.bestStreak,
    bestStreakEver,
    totalCorrect,
    totalIncorrect,
    overallAccuracy,
    avgAnswerTimeSeconds,
    xp: totalXp,
    level,
    title,
    dailyStreak,
    lastPlayedDate: todayStr,
    history: updatedHistory,
    unlockedAchievements: Array.from(unlocked),
  };

  saveUserStats(updatedStats);
  return { stats: updatedStats, newAchievements };
}

export function unlockAchievement(achievementId: string): Achievement | null {
  const current = getUserStats();
  if (current.unlockedAchievements.includes(achievementId)) return null;

  const target = ALL_ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!target) return null;

  const updated: UserStats = {
    ...current,
    xp: current.xp + target.xpReward,
    unlockedAchievements: [...current.unlockedAchievements, achievementId],
  };
  saveUserStats(updated);
  return target;
}
