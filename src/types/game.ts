/**
 * Type definitions for the Picture-Based A or B Guessing Game.
 * All properties are documented below to make customization straightforward.
 */

export type Choice = 'A' | 'B';

export type GameMode = 'classic' | 'time_challenge' | 'puzzle_easy' | 'puzzle_hard';

export type SliceBand = 'top' | 'middle' | 'bottom';

export interface DailyChallengeState {
  dateStr: string; // YYYY-MM-DD
  itemId: string;
  sliceBand: SliceBand;
  sliceLabel: string;
  isCompleted: boolean;
  userChoice?: Choice;
  isCorrect?: boolean;
  pointsEarned?: number;
  timeSpentMs?: number;
  answeredAt?: string;
  streakAtTime?: number;
}

export interface PictureItem {
  id: string;
  /** Image URL for the item (HTTPS URL or relative path) */
  imageUrl: string;
  /** Title or prompt displayed above the picture */
  prompt: string;
  /** Optional subtitle or category hint */
  category: string;
  /** Option A details */
  optionA: {
    label: string;
    description?: string;
  };
  /** Option B details */
  optionB: {
    label: string;
    description?: string;
  };
  /** The correct choice: either 'A' or 'B' */
  correctAnswer: Choice;
  /** Custom feedback message shown when the player guesses correctly */
  correctFeedbackMessage?: string;
  /** Custom feedback message shown when the player guesses incorrectly */
  incorrectFeedbackMessage?: string;
  /** Detailed background information and trivia revealed after the guess */
  informationBehindPicture: string;
  /** Optional extra fun fact or secondary note */
  funFact?: string;
  /** Community/global accuracy percentage benchmark (e.g., 65%) */
  globalAccuracy?: number;
}

export interface RoundAnswer {
  itemId: string;
  userChoice: Choice;
  isCorrect: boolean;
  timeSpentMs: number;
  pointsEarned: number;
}

export interface RoundResult {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  bestStreak: number;
  avgTimeSeconds?: number;
  mode?: GameMode;
  packTitle?: string;
  answers: RoundAnswer[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: string;
}

export interface UserStats {
  username: string;
  avatar: string;
  title: string;
  friendCode: string;
  totalGames: number;
  totalScore: number;
  highScore: number;
  currentStreak: number;
  bestStreakEver: number;
  totalCorrect: number;
  totalIncorrect: number;
  overallAccuracy: number;
  avgAnswerTimeSeconds?: number;
  xp: number;
  level: number;
  dailyStreak: number;
  lastPlayedDate: string | null;
  history: RoundResult[];
  unlockedAchievements: string[];
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  previousRank: number;
  username: string;
  avatar: string;
  score: number;
  accuracy: number;
  streak: number;
  avgTimeSeconds?: number;
  badge?: string;
  country?: string;
  isCurrentUser?: boolean;
  lastActive: string;
  timeframe?: 'today' | 'week' | 'allTime';
  mode?: GameMode;
}

export interface ActivityEvent {
  id: string;
  username: string;
  avatar: string;
  action: string;
  timestamp: string;
  score?: number;
}

export interface PushNotificationAlert {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'rank' | 'streak' | 'daily' | 'achievement' | 'friend';
  actionUrl?: string;
}
