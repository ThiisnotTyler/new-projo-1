import { LeaderboardEntry, ActivityEvent, GameMode } from '../types/game';
import { getUserStats } from './statsStorage';

const STORAGE_LEADERBOARD_PREFIX = 'dichotomy_leaderboard';
const STORAGE_FRIENDS_KEY = 'dichotomy_friends_data';
const STORAGE_ACTIVITY_KEY = 'dichotomy_activity_stream';

export type LeaderboardModeFilter = GameMode | 'all';

// Mode-specific seeded competitors with distinct traits
const SEEDED_COMPETITORS: Record<LeaderboardModeFilter, Omit<LeaderboardEntry, 'rank' | 'previousRank'>[]> = {
  classic: [
    { id: 'c1', username: 'CipherQueen', avatar: '👑', score: 14850, accuracy: 96, streak: 18, avgTimeSeconds: 1.8, country: 'US', badge: 'Grand Oracle', lastActive: '2m ago', mode: 'classic' },
    { id: 'c2', username: 'QuantumLeap', avatar: '⚡', score: 13920, accuracy: 94, streak: 14, avgTimeSeconds: 2.1, country: 'SE', badge: 'Truth Arbiter', lastActive: '5m ago', mode: 'classic' },
    { id: 'c3', username: 'FactHunter_99', avatar: '🎯', score: 12400, accuracy: 91, streak: 11, avgTimeSeconds: 2.4, country: 'DE', badge: 'Master Skeptic', lastActive: '12m ago', mode: 'classic' },
    { id: 'c4', username: 'NovaSpecter', avatar: '🌌', score: 11250, accuracy: 89, streak: 9, avgTimeSeconds: 2.7, country: 'JP', badge: 'Pattern Specialist', lastActive: '18m ago', mode: 'classic' },
    { id: 'c5', username: 'EchoLogic', avatar: '🦉', score: 9800, accuracy: 88, streak: 8, avgTimeSeconds: 3.0, country: 'UK', badge: 'Fact Detective', lastActive: '25m ago', mode: 'classic' },
    { id: 'c6', username: 'PixelSage', avatar: '🔮', score: 8400, accuracy: 84, streak: 6, avgTimeSeconds: 3.3, country: 'KR', badge: 'Intuitive Thinker', lastActive: '39m ago', mode: 'classic' },
  ],
  time_challenge: [
    { id: 'tc1', username: 'BlitzOracle', avatar: '⚡', score: 16200, accuracy: 95, streak: 16, avgTimeSeconds: 0.9, country: 'US', badge: 'Lightning Memory', lastActive: '1m ago', mode: 'time_challenge' },
    { id: 'tc2', username: 'FlashSynapse', avatar: '🏎️', score: 15100, accuracy: 93, streak: 13, avgTimeSeconds: 1.1, country: 'CA', badge: 'Speed Deduce', lastActive: '4m ago', mode: 'time_challenge' },
    { id: 'tc3', username: 'ReflexKing', avatar: '🐯', score: 13800, accuracy: 90, streak: 11, avgTimeSeconds: 1.3, country: 'FR', badge: 'Quick Draw', lastActive: '9m ago', mode: 'time_challenge' },
    { id: 'tc4', username: 'QuickSilver_Mind', avatar: '🌪️', score: 12500, accuracy: 88, streak: 9, avgTimeSeconds: 1.4, country: 'AU', badge: 'Rapid Instinct', lastActive: '15m ago', mode: 'time_challenge' },
    { id: 'tc5', username: 'PhotonGaze', avatar: '✨', score: 10900, accuracy: 86, streak: 7, avgTimeSeconds: 1.6, country: 'JP', badge: 'Flash Observer', lastActive: '30m ago', mode: 'time_challenge' },
  ],
  puzzle_easy: [
    { id: 'pe1', username: 'QuadMaster', avatar: '🧩', score: 14200, accuracy: 95, streak: 14, avgTimeSeconds: 3.2, country: 'NL', badge: 'Tile Virtuoso', lastActive: '3m ago', mode: 'puzzle_easy' },
    { id: 'pe2', username: 'SliceDeducer', avatar: '🔪', score: 13100, accuracy: 92, streak: 11, avgTimeSeconds: 3.5, country: 'UK', badge: '4-Tile Pro', lastActive: '8m ago', mode: 'puzzle_easy' },
    { id: 'pe3', username: 'TileCrafter', avatar: '🎨', score: 11800, accuracy: 90, streak: 9, avgTimeSeconds: 3.8, country: 'US', badge: 'Assemble Ace', lastActive: '16m ago', mode: 'puzzle_easy' },
    { id: 'pe4', username: 'MosaicRider', avatar: '🎠', score: 10400, accuracy: 87, streak: 7, avgTimeSeconds: 4.1, country: 'BR', badge: 'Puzzle Scout', lastActive: '28m ago', mode: 'puzzle_easy' },
  ],
  puzzle_hard: [
    { id: 'ph1', username: 'GridGrandmaster', avatar: '🏆', score: 18500, accuracy: 97, streak: 17, avgTimeSeconds: 5.2, country: 'DE', badge: '9-Grid Maestro', lastActive: '2m ago', mode: 'puzzle_hard' },
    { id: 'ph2', username: 'RubikTactician', avatar: '🎲', score: 16400, accuracy: 94, streak: 13, avgTimeSeconds: 5.8, country: 'JP', badge: 'Master Assembler', lastActive: '6m ago', mode: 'puzzle_hard' },
    { id: 'ph3', username: 'NinePieceSage', avatar: '🧙', score: 14700, accuracy: 91, streak: 10, avgTimeSeconds: 6.4, country: 'US', badge: 'Matrix Solver', lastActive: '14m ago', mode: 'puzzle_hard' },
    { id: 'ph4', username: 'ShatteredVision', avatar: '💠', score: 12900, accuracy: 89, streak: 8, avgTimeSeconds: 7.1, country: 'SE', badge: 'Reconstruct Legend', lastActive: '22m ago', mode: 'puzzle_hard' },
  ],
  all: [
    { id: 'a1', username: 'GridGrandmaster', avatar: '🏆', score: 18500, accuracy: 97, streak: 17, avgTimeSeconds: 5.2, country: 'DE', badge: 'All-Round Legend', lastActive: '2m ago', mode: 'puzzle_hard' },
    { id: 'a2', username: 'BlitzOracle', avatar: '⚡', score: 16200, accuracy: 95, streak: 16, avgTimeSeconds: 0.9, country: 'US', badge: 'Lightning Memory', lastActive: '1m ago', mode: 'time_challenge' },
    { id: 'a3', username: 'CipherQueen', avatar: '👑', score: 14850, accuracy: 96, streak: 18, avgTimeSeconds: 1.8, country: 'US', badge: 'Grand Oracle', lastActive: '2m ago', mode: 'classic' },
    { id: 'a4', username: 'QuadMaster', avatar: '🧩', score: 14200, accuracy: 95, streak: 14, avgTimeSeconds: 3.2, country: 'NL', badge: 'Tile Virtuoso', lastActive: '3m ago', mode: 'puzzle_easy' },
    { id: 'a5', username: 'QuantumLeap', avatar: '⚡', score: 13920, accuracy: 94, streak: 14, avgTimeSeconds: 2.1, country: 'SE', badge: 'Truth Arbiter', lastActive: '5m ago', mode: 'classic' },
    { id: 'a6', username: 'ReflexKing', avatar: '🐯', score: 13800, accuracy: 90, streak: 11, avgTimeSeconds: 1.3, country: 'FR', badge: 'Quick Draw', lastActive: '9m ago', mode: 'time_challenge' },
    { id: 'a7', username: 'SliceDeducer', avatar: '🔪', score: 13100, accuracy: 92, streak: 11, avgTimeSeconds: 3.5, country: 'UK', badge: '4-Tile Pro', lastActive: '8m ago', mode: 'puzzle_easy' },
  ],
};

export interface FriendRecord {
  id: string;
  code: string;
  username: string;
  avatar: string;
  score: number;
  accuracy: number;
  streak: number;
  avgTimeSeconds?: number;
  addedAt: string;
  favoriteMode?: string;
}

const DEFAULT_FRIENDS: FriendRecord[] = [
  { id: 'f1', code: 'X94K2', username: 'Sam_Rivera', avatar: '🦊', score: 8640, accuracy: 87, streak: 8, avgTimeSeconds: 2.2, addedAt: '2 days ago', favoriteMode: 'Classic' },
  { id: 'f2', code: 'XM7P1', username: 'Elena_Rostova', avatar: '🌸', score: 10250, accuracy: 92, streak: 12, avgTimeSeconds: 1.8, addedAt: '5 days ago', favoriteMode: 'Time Flash' },
  { id: 'f3', code: 'XB3W9', username: 'Jordan_T', avatar: '🎮', score: 6400, accuracy: 81, streak: 5, avgTimeSeconds: 2.6, addedAt: '1 week ago', favoriteMode: 'Puzzle Mode' },
];

const INITIAL_ACTIVITIES: ActivityEvent[] = [
  { id: 'act-1', username: 'GridGrandmaster', avatar: '🏆', action: 'solved 9-Square Hard Puzzle with 100% accuracy!', timestamp: 'Just now', score: 2150 },
  { id: 'act-2', username: 'BlitzOracle', avatar: '⚡', action: 'posted 0.9s deduction reaction in Time Flash Mode', timestamp: '2m ago', score: 1850 },
  { id: 'act-3', username: 'CipherQueen', avatar: '👑', action: 'achieved a 15-answer streak in Classic Mode!', timestamp: '5m ago', score: 1450 },
  { id: 'act-4', username: 'QuadMaster', avatar: '🧩', action: 'completed 4-Square Puzzle Challenge!', timestamp: '12m ago', score: 1100 },
];

function getStorageKey(timeframe: string, mode: LeaderboardModeFilter): string {
  return `${STORAGE_LEADERBOARD_PREFIX}_${mode}_${timeframe}`;
}

export function getLeaderboard(
  timeframe: 'today' | 'week' | 'allTime' = 'today',
  mode: LeaderboardModeFilter = 'all'
): LeaderboardEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = getStorageKey(timeframe, mode);
    const raw = localStorage.getItem(key);
    let list: LeaderboardEntry[] = [];

    if (raw) {
      list = JSON.parse(raw);
    } else {
      const seedData = SEEDED_COMPETITORS[mode] || SEEDED_COMPETITORS.all;
      list = seedData.map((p, idx) => {
        let score = p.score;
        if (timeframe === 'week') score = Math.round(score * 2.5);
        if (timeframe === 'allTime') score = Math.round(score * 5.8);
        return {
          ...p,
          score,
          timeframe,
          rank: idx + 1,
          previousRank: idx + 1,
        };
      });
      saveLeaderboard(list, timeframe, mode);
    }

    // Merge current user stats specifically for this mode
    const user = getUserStats();
    const modeHistory = mode === 'all' 
      ? user.history 
      : user.history.filter(h => h.mode === mode);

    if (modeHistory.length > 0 || (mode === 'all' && user.totalScore > 0)) {
      const modeHighScore = modeHistory.reduce((max, h) => Math.max(max, h.score), 0);
      const modeCorrect = modeHistory.reduce((sum, h) => sum + h.correctCount, 0);
      const modeQuestions = modeHistory.reduce((sum, h) => sum + h.totalQuestions, 0);
      const modeAccuracy = modeQuestions > 0 ? Math.round((modeCorrect / modeQuestions) * 100) : user.overallAccuracy;
      const modeBestStreak = modeHistory.reduce((max, h) => Math.max(max, h.bestStreak), 0);

      const userIndex = list.findIndex(e => e.isCurrentUser || e.id === 'user_current');
      const existingAvgTime = userIndex >= 0 ? list[userIndex].avgTimeSeconds : undefined;

      const userEntry: LeaderboardEntry = {
        id: 'user_current',
        username: user.username,
        avatar: user.avatar,
        score: modeHighScore || (mode === 'all' ? (user.highScore || user.totalScore) : 0),
        accuracy: modeAccuracy,
        streak: modeBestStreak || (mode === 'all' ? user.bestStreakEver : 0),
        avgTimeSeconds: existingAvgTime || user.avgAnswerTimeSeconds || 2.1,
        country: 'US',
        badge: user.title,
        isCurrentUser: true,
        lastActive: 'Now',
        timeframe,
        mode: mode === 'all' ? undefined : mode,
        rank: 0,
        previousRank: 0,
      };

      if (userIndex >= 0) {
        userEntry.previousRank = list[userIndex].previousRank || list[userIndex].rank;
        list[userIndex] = userEntry;
      } else {
        userEntry.previousRank = list.length + 1;
        list.push(userEntry);
      }

      // Sort descending by score
      list.sort((a, b) => b.score - a.score);

      // Reassign current ranks
      list = list.map((item, idx) => ({
        ...item,
        rank: idx + 1,
        previousRank: item.previousRank || idx + 1,
      }));
    }

    return list;
  } catch {
    return [];
  }
}

export function saveLeaderboard(
  list: LeaderboardEntry[],
  timeframe: 'today' | 'week' | 'allTime',
  mode: LeaderboardModeFilter = 'all'
): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getStorageKey(timeframe, mode);
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // Ignore storage issues
  }
}

export function submitScoreToLeaderboard(
  newScore: number,
  accuracy: number,
  streak: number,
  avgTimeSeconds?: number,
  mode: GameMode = 'classic'
): void {
  const user = getUserStats();

  const updateListForMode = (targetMode: LeaderboardModeFilter) => {
    const currentList = getLeaderboard('today', targetMode);
    const userIdx = currentList.findIndex(e => e.isCurrentUser || e.id === 'user_current');
    const prevRank = userIdx >= 0 ? currentList[userIdx].rank : currentList.length + 1;

    const userEntry: LeaderboardEntry = {
      id: 'user_current',
      username: user.username,
      avatar: user.avatar,
      score: Math.max(userIdx >= 0 ? currentList[userIdx].score : 0, newScore),
      accuracy: Math.max(userIdx >= 0 ? currentList[userIdx].accuracy : 0, accuracy),
      streak: Math.max(userIdx >= 0 ? currentList[userIdx].streak : 0, streak),
      avgTimeSeconds: avgTimeSeconds !== undefined ? avgTimeSeconds : (user.avgAnswerTimeSeconds || 2.1),
      country: 'US',
      badge: user.title,
      isCurrentUser: true,
      lastActive: 'Just now',
      timeframe: 'today',
      mode,
      rank: 0,
      previousRank: prevRank,
    };

    const filtered = currentList.filter(e => !e.isCurrentUser && e.id !== 'user_current');
    filtered.push(userEntry);
    filtered.sort((a, b) => b.score - a.score);

    const updated = filtered.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
      previousRank: entry.id === 'user_current' ? prevRank : entry.previousRank,
    }));

    saveLeaderboard(updated, 'today', targetMode);
  };

  // Update specific mode board and overall board
  updateListForMode(mode);
  updateListForMode('all');

  const modeLabels: Record<GameMode, string> = {
    classic: 'Classic Mode',
    time_challenge: 'Time Flash Mode',
    puzzle_easy: '4-Square Puzzle',
    puzzle_hard: '9-Square Hard Puzzle',
  };

  addActivityEvent({
    id: `act-${Date.now()}`,
    username: user.username,
    avatar: user.avatar,
    action: `scored ${newScore.toLocaleString()} pts in ${modeLabels[mode]} (${accuracy}% acc)`,
    timestamp: 'Just now',
    score: newScore,
  });
}

export function getFriends(): FriendRecord[] {
  if (typeof window === 'undefined') return DEFAULT_FRIENDS;
  try {
    const raw = localStorage.getItem(STORAGE_FRIENDS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_FRIENDS_KEY, JSON.stringify(DEFAULT_FRIENDS));
      return DEFAULT_FRIENDS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_FRIENDS;
  }
}

export function addFriend(friendCodeOrName: string): { success: boolean; message: string; friend?: FriendRecord } {
  const query = friendCodeOrName.trim();
  if (!query) return { success: false, message: 'Please enter a valid friend code or name.' };

  const currentFriends = getFriends();
  const exists = currentFriends.some(f => f.code.toLowerCase() === query.toLowerCase() || f.username.toLowerCase() === query.toLowerCase());
  if (exists) {
    return { success: false, message: 'This player is already on your friends list!' };
  }

  const avatars = ['🦊', '🐯', '🐼', '🦁', '🦉', '🐺', '🐬'];
  const newFriend: FriendRecord = {
    id: `friend_${Date.now()}`,
    code: query.startsWith('X') ? query.toUpperCase() : `X${Math.floor(1000 + Math.random() * 9000)}`,
    username: query.startsWith('X') ? `Player_${query.slice(1)}` : query,
    avatar: avatars[Math.floor(Math.random() * avatars.length)],
    score: Math.floor(4000 + Math.random() * 7000),
    accuracy: Math.floor(75 + Math.random() * 20),
    streak: Math.floor(3 + Math.random() * 8),
    addedAt: 'Just now',
    favoriteMode: 'Classic',
  };

  const updated = [newFriend, ...currentFriends];
  try {
    localStorage.setItem(STORAGE_FRIENDS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }

  addActivityEvent({
    id: `act-friend-${Date.now()}`,
    username: newFriend.username,
    avatar: newFriend.avatar,
    action: 'joined your friends and rivals circle!',
    timestamp: 'Just now',
  });

  return { success: true, message: `Added ${newFriend.username} to your Rivals Leaderboard!`, friend: newFriend };
}

export function getActivityStream(): ActivityEvent[] {
  if (typeof window === 'undefined') return INITIAL_ACTIVITIES;
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVITY_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_ACTIVITY_KEY, JSON.stringify(INITIAL_ACTIVITIES));
      return INITIAL_ACTIVITIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ACTIVITIES;
  }
}

export function addActivityEvent(event: ActivityEvent): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getActivityStream();
    const updated = [event, ...current].slice(0, 15);
    localStorage.setItem(STORAGE_ACTIVITY_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
}

// Simulates live competition updates for a mode
export function triggerLiveSimulationTick(mode: LeaderboardModeFilter = 'all'): { updatedList: LeaderboardEntry[]; newActivity?: ActivityEvent } {
  const currentList = getLeaderboard('today', mode);
  if (currentList.length === 0) return { updatedList: currentList };

  const nonUserIndices = currentList
    .map((e, idx) => (!e.isCurrentUser ? idx : -1))
    .filter(idx => idx >= 0);

  if (nonUserIndices.length === 0) return { updatedList: currentList };

  const targetIdx = nonUserIndices[Math.floor(Math.random() * nonUserIndices.length)];
  const player = currentList[targetIdx];
  const scoreBump = Math.floor(150 + Math.random() * 350);
  const newScore = player.score + scoreBump;
  const newStreak = Math.min(25, player.streak + (Math.random() > 0.4 ? 1 : 0));

  const updatedEntry: LeaderboardEntry = {
    ...player,
    score: newScore,
    streak: newStreak,
    lastActive: 'Just now',
    previousRank: player.rank,
  };

  currentList[targetIdx] = updatedEntry;
  currentList.sort((a, b) => b.score - a.score);

  const final = currentList.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));

  saveLeaderboard(final, 'today', mode);

  const newActivity: ActivityEvent = {
    id: `act-sim-${Date.now()}`,
    username: player.username,
    avatar: player.avatar,
    action: `climbed to Rank #${final.find(e => e.id === player.id)?.rank || 1}!`,
    timestamp: 'Just now',
    score: newScore,
  };
  addActivityEvent(newActivity);

  return { updatedList: final, newActivity };
}
