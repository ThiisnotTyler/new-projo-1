import React from 'react';
import { Flame, X, Zap, Puzzle } from 'lucide-react';
import { GameMode } from '../types/game';

interface GameplayHeaderProps {
  currentIndex: number;
  totalQuestions: number;
  score: number;
  streak: number;
  onExit: () => void;
  lastPointsEarned?: number | null;
  gameMode?: GameMode;
}

export const GameplayHeader: React.FC<GameplayHeaderProps> = ({
  currentIndex,
  totalQuestions,
  score,
  streak,
  onExit,
  lastPointsEarned,
  gameMode = 'classic',
}) => {
  const progressPercent = Math.round(((currentIndex) / Math.max(1, totalQuestions)) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto mb-3">
      {/* Top row: Exit button, Title, Streak & Score */}
      <div className="flex items-center justify-between gap-3 py-1.5">
        <button
          onClick={onExit}
          className="h-8 px-2.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 cursor-pointer"
          title="Exit game"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Quit</span>
        </button>

        {/* Question Counter & Mode */}
        <div className="text-center truncate px-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
            {gameMode === 'time_challenge' ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                3s Flash
              </span>
            ) : gameMode === 'puzzle_easy' ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 text-[10px] font-bold">
                <Puzzle className="w-2.5 h-2.5 text-purple-500" />
                4 Squares
              </span>
            ) : gameMode === 'puzzle_hard' ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 text-[10px] font-bold">
                <Puzzle className="w-2.5 h-2.5 text-purple-500" />
                9 Squares
              </span>
            ) : null}
            <span>
              {gameMode === 'time_challenge'
                ? 'Time Challenge'
                : gameMode === 'puzzle_easy'
                ? 'Puzzle (Easy)'
                : gameMode === 'puzzle_hard'
                ? 'Puzzle (Hard)'
                : 'Picture Deduction'}
            </span>
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Image {currentIndex + 1} of {totalQuestions}
          </div>
        </div>

        {/* Score & Streak Block */}
        <div className="flex items-center gap-2">
          {/* Streak indicator */}
          {streak > 1 && (
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-1 rounded-md border border-amber-200/60 dark:border-amber-900/60 animate-bounce">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{streak}x</span>
            </div>
          )}

          {/* Current Score */}
          <div className="relative text-right">
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">
              Score
            </div>
            <div className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-50 leading-none">
              {score.toLocaleString()}
            </div>
            {lastPointsEarned && lastPointsEarned > 0 && (
              <span className="absolute -top-3 right-0 text-[10px] font-bold text-emerald-500 animate-fade-out font-mono">
                +{lastPointsEarned}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1">
        <div
          className={`h-full transition-all duration-300 ease-out ${
            gameMode === 'time_challenge'
              ? 'bg-amber-500'
              : gameMode === 'puzzle_easy' || gameMode === 'puzzle_hard'
              ? 'bg-purple-600'
              : 'bg-indigo-600 dark:bg-indigo-500'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
