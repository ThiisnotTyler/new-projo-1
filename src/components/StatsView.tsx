import React, { useState } from 'react';
import { Award, Zap, Flame, Trophy, Calendar, CheckCircle2, History, Shield, ArrowUpRight, Clock, ChevronDown, ChevronUp, Eye, Puzzle } from 'lucide-react';
import { UserStats } from '../types/game';
import { ALL_ACHIEVEMENTS, calculateLevel } from '../utils/statsStorage';

interface StatsViewProps {
  stats: UserStats;
  onSelectPlay: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ stats, onSelectPlay }) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { level, title, currentXp, nextLevelXp } = calculateLevel(stats.xp);
  const xpPercentage = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));
  const recentHistory = (stats.history || []).slice(0, 6);

  const getModeStats = (targetMode: 'classic' | 'time_challenge' | 'puzzle_easy' | 'puzzle_hard') => {
    const rounds = (stats.history || []).filter(h => h.mode === targetMode);
    const gamesCount = rounds.length;
    const highScore = rounds.reduce((max, r) => Math.max(max, r.score), 0);
    const correctSum = rounds.reduce((sum, r) => sum + r.correctCount, 0);
    const questionsSum = rounds.reduce((sum, r) => sum + r.totalQuestions, 0);
    const accuracy = questionsSum > 0 ? Math.round((correctSum / questionsSum) * 100) : 0;
    const avgSpeed = rounds.length > 0
      ? (rounds.reduce((sum, r) => sum + (r.avgTimeSeconds || 0), 0) / rounds.length).toFixed(1)
      : null;
    return { gamesCount, highScore, accuracy, avgSpeed };
  };

  const classicStats = getModeStats('classic');
  const timeFlashStats = getModeStats('time_challenge');
  const puzzleEasyStats = getModeStats('puzzle_easy');
  const puzzleHardStats = getModeStats('puzzle_hard');

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4">
      {/* Title & Level Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 flex items-center justify-center text-3xl shadow-inner shrink-0">
              {stats.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-2xl text-zinc-950 dark:text-zinc-50">
                  {stats.username}
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                  LVL {level}
                </span>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{title}</span>
                <span aria-hidden="true">·</span>
                <span>Friend Code: <strong className="font-mono text-zinc-800 dark:text-zinc-200">{stats.friendCode}</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={onSelectPlay}
            className="h-10 px-4 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-800 dark:hover:bg-white transition-colors self-start sm:self-auto"
          >
            <span>Start Guessing</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
            <span className="text-zinc-500 dark:text-zinc-400">Progression XP</span>
            <span className="font-mono text-zinc-800 dark:text-zinc-200">
              {currentXp} / {nextLevelXp} XP ({xpPercentage}%)
            </span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Career Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4">
          <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            Total Score
          </div>
          <div className="font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            {stats.totalScore.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            High: {stats.highScore.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4">
          <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            Win Accuracy
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.overallAccuracy}%
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            {stats.totalCorrect} right · {stats.totalIncorrect} wrong
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4">
          <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            Avg Speed
          </div>
          <div className="font-mono text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
            <span>{stats.avgAnswerTimeSeconds ? `${stats.avgAnswerTimeSeconds}s` : '2.0s'}</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            Avg answer time
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4">
          <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            Best Streak
          </div>
          <div className="font-mono text-2xl font-bold text-amber-500 mt-1 flex items-center gap-1">
            <span>{stats.bestStreakEver}x</span>
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            Current: {stats.currentStreak}x
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 col-span-2 sm:col-span-1">
          <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            Daily Streak
          </div>
          <div className="font-mono text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
            <span>{stats.dailyStreak}</span>
            <span className="text-sm font-sans font-medium text-zinc-400">days</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            {stats.totalGames} total games
          </div>
        </div>
      </div>

      {/* Mini-Game Performance Breakdown */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-lg text-zinc-950 dark:text-zinc-50">
              Mini-Game Performance
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Individual career statistics separated by game mode
            </p>
          </div>
          <Trophy className="w-5 h-5 text-indigo-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Classic Mode */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-500" />
                <span>Classic Mode</span>
              </span>
              <span className="text-[10px] font-semibold text-zinc-400">
                {classicStats.gamesCount} {classicStats.gamesCount === 1 ? 'game' : 'games'}
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">High Score:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {classicStats.highScore.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Accuracy:</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {classicStats.accuracy}%
                </span>
              </div>
            </div>
          </div>

          {/* Time Flash Mode */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Time Flash</span>
              </span>
              <span className="text-[10px] font-semibold text-zinc-400">
                {timeFlashStats.gamesCount} {timeFlashStats.gamesCount === 1 ? 'game' : 'games'}
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">High Score:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {timeFlashStats.highScore.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Avg Reaction:</span>
                <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                  {timeFlashStats.avgSpeed ? `${timeFlashStats.avgSpeed}s` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Puzzle Easy (4 Squares) */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Puzzle className="w-3.5 h-3.5 text-purple-500" />
                <span>4-Square Puzzle</span>
              </span>
              <span className="text-[10px] font-semibold text-zinc-400">
                {puzzleEasyStats.gamesCount} {puzzleEasyStats.gamesCount === 1 ? 'game' : 'games'}
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">High Score:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {puzzleEasyStats.highScore.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Accuracy:</span>
                <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
                  {puzzleEasyStats.accuracy}%
                </span>
              </div>
            </div>
          </div>

          {/* Puzzle Hard (9 Squares) */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Puzzle className="w-3.5 h-3.5 text-purple-500" />
                <span>9-Square Puzzle</span>
              </span>
              <span className="text-[10px] font-semibold text-zinc-400">
                {puzzleHardStats.gamesCount} {puzzleHardStats.gamesCount === 1 ? 'game' : 'games'}
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">High Score:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {puzzleHardStats.highScore.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Accuracy:</span>
                <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
                  {puzzleHardStats.accuracy}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Showcase */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-lg text-zinc-950 dark:text-zinc-50">
              Achievements
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Unlocked {stats.unlockedAchievements.length} of {ALL_ACHIEVEMENTS.length} milestones
            </p>
          </div>
          <Award className="w-5 h-5 text-amber-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ALL_ACHIEVEMENTS.map(ach => {
            const isUnlocked = stats.unlockedAchievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                  isUnlocked
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/60'
                    : 'bg-zinc-50/50 dark:bg-zinc-800/20 border-zinc-200/50 dark:border-zinc-800/60 opacity-60'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isUnlocked
                      ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {isUnlocked ? <Trophy className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                      {ach.title}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400 ml-2">
                      +{ach.xpReward} XP
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                    {ach.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Match History Dropdown (Limited to Last 6 Rounds) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Dropdown Header Trigger */}
        <button
          type="button"
          onClick={() => setIsHistoryOpen(prev => !prev)}
          className="w-full p-5 sm:p-6 flex items-center justify-between hover:bg-zinc-50/60 dark:hover:bg-zinc-850/50 transition-colors text-left"
          aria-expanded={isHistoryOpen}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base sm:text-lg text-zinc-950 dark:text-zinc-50">
                  Round History
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  Last 6 Rounds
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {recentHistory.length > 0
                  ? `Showing ${recentHistory.length} most recent ${recentHistory.length === 1 ? 'game' : 'games'}`
                  : 'No rounds recorded yet'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400 font-mono hidden sm:inline">
              {isHistoryOpen ? 'Collapse' : 'Expand'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 transition-transform">
              {isHistoryOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </button>

        {/* Dropdown Content */}
        {isHistoryOpen && (
          <div className="px-6 pb-6 pt-2 border-t border-zinc-100 dark:border-zinc-800 animate-fade-in">
            {recentHistory.length > 0 ? (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {recentHistory.map((round, idx) => (
                  <div key={round.id || idx} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-zinc-400 text-[11px] font-bold">#{idx + 1}</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {round.packTitle || (round.mode === 'time_challenge' ? 'Time Challenge (3s Flash)' : 'Classic Picture Deduction')}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1.5 pl-5">
                        <span>{new Date(round.date).toLocaleDateString()}</span>
                        <span>·</span>
                        <span>Streak: {round.bestStreak}x</span>
                        {round.avgTimeSeconds !== undefined && (
                          <>
                            <span>·</span>
                            <span className="font-mono text-indigo-500 dark:text-indigo-400">{round.avgTimeSeconds}s avg</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {round.score.toLocaleString()} pts
                      </div>
                      <div className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {round.accuracy}% ({round.correctCount}/{round.totalQuestions})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-zinc-400">
                No rounds played yet. Start a challenge to log your performance!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
