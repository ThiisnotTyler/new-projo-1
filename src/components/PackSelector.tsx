import React, { useState } from 'react';
import { Play, Settings, Image, Flame, Zap, Eye, Puzzle, Scissors, CheckCircle2 } from 'lucide-react';
import { PictureItem, GameMode } from '../types/game';
import { getDailyChallengeState, getDailySliceInfo } from '../utils/dailyChallengeStorage';

interface GameHomeProps {
  items: PictureItem[];
  onStartGame: (mode: GameMode) => void;
  onOpenItemEditor: () => void;
  onOpenDailyChallenge: () => void;
  dailyStreak: number;
}

export const PackSelector: React.FC<GameHomeProps> = ({
  items,
  onStartGame,
  onOpenItemEditor,
  onOpenDailyChallenge,
  dailyStreak,
}) => {
  const [selectedModeCategory, setSelectedModeCategory] = useState<'classic' | 'time_challenge' | 'puzzle'>('classic');
  const [puzzleDifficulty, setPuzzleDifficulty] = useState<'easy' | 'hard'>('easy');

  const todayCompleted = !!getDailyChallengeState()?.isCompleted;
  const sliceInfo = getDailySliceInfo();

  const resolvedGameMode: GameMode =
    selectedModeCategory === 'puzzle'
      ? puzzleDifficulty === 'easy'
        ? 'puzzle_easy'
        : 'puzzle_hard'
      : selectedModeCategory;

  return (
    <div className="w-full max-w-xl mx-auto py-6 sm:py-10 px-4 flex flex-col items-center justify-center">
      {/* Centered Hero Card */}
      <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xl shadow-zinc-200/40 dark:shadow-none p-6 sm:p-9 text-center transition-all">
        
        {/* Soft rounded badges header */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <Image className="w-3.5 h-3.5 text-indigo-500" />
            <span>Picture Deduction Challenge</span>
          </div>

          {dailyStreak > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/70 border border-amber-200/60 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{dailyStreak} Day Streak</span>
            </div>
          )}
        </div>

        {/* Title & Description with soft rounded typography */}
        <h1 className="font-display font-extrabold text-2xl sm:text-3.5xl text-zinc-950 dark:text-zinc-50 tracking-tight leading-snug">
          Picture Guess: Option A or B?
        </h1>

        <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed font-normal">
          Examine each image closely, make your deduction between Option A and Option B, and uncover the facts and backstory behind the picture.
        </p>

        {/* Daily Spliced 50/50 Featured Card */}
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/30 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm text-zinc-950 dark:text-zinc-50">
                  Daily Spliced 50/50
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-extrabold uppercase tracking-wide">
                  24h Mystery
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Today's Slice: <strong className="text-zinc-800 dark:text-zinc-200">{sliceInfo.sliceLabel.split(':')[0]}</strong>. Same mystery image for everyone!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenDailyChallenge}
            className={`px-4 py-2 rounded-xl font-bold text-xs shrink-0 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
              todayCompleted
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-white'
            }`}
          >
            {todayCompleted ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>View Result</span>
              </>
            ) : (
              <span>Play Today</span>
            )}
          </button>
        </div>

        {/* Mode Selection Section */}
        <div className="mt-7 mb-6 text-left">
          <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2.5 px-0.5">
            Choose Game Mode:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Classic Mode Card */}
            <button
              type="button"
              onClick={() => setSelectedModeCategory('classic')}
              className={`p-3.5 rounded-2xl border text-left transition-all relative cursor-pointer flex flex-col justify-between ${
                selectedModeCategory === 'classic'
                  ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/25 shadow-sm'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/80 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-100/70 dark:hover:bg-zinc-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Eye className="w-4 h-4" />
                  </div>
                  {selectedModeCategory === 'classic' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                  )}
                </div>
                <div className="font-display font-bold text-sm text-zinc-950 dark:text-zinc-50">
                  Classic
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug font-normal mt-1">
                  Full picture at your own pace.
                </p>
              </div>
            </button>

            {/* Time Challenge Mode Card */}
            <button
              type="button"
              onClick={() => setSelectedModeCategory('time_challenge')}
              className={`p-3.5 rounded-2xl border text-left transition-all relative cursor-pointer flex flex-col justify-between ${
                selectedModeCategory === 'time_challenge'
                  ? 'bg-amber-50/80 dark:bg-amber-950/50 border-amber-500 ring-2 ring-amber-500/25 shadow-sm'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/80 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-100/70 dark:hover:bg-zinc-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-white shrink-0 tracking-tight">
                    3s Flash
                  </span>
                </div>
                <div className="font-display font-bold text-sm text-zinc-950 dark:text-zinc-50">
                  Time Flash
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug font-normal mt-1">
                  Image vanishes after 3 seconds.
                </p>
              </div>
            </button>

            {/* Puzzle Mode Card */}
            <button
              type="button"
              onClick={() => setSelectedModeCategory('puzzle')}
              className={`p-3.5 rounded-2xl border text-left transition-all relative cursor-pointer flex flex-col justify-between ${
                selectedModeCategory === 'puzzle'
                  ? 'bg-purple-50/80 dark:bg-purple-950/50 border-purple-500 ring-2 ring-purple-500/25 shadow-sm'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/80 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-100/70 dark:hover:bg-zinc-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                    <Puzzle className="w-4 h-4 text-purple-500" />
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-600 text-white shrink-0 tracking-tight">
                    Assemble
                  </span>
                </div>
                <div className="font-display font-bold text-sm text-zinc-950 dark:text-zinc-50">
                  Puzzle Mode
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug font-normal mt-1">
                  Chop & solve image to unlock answer.
                </p>
              </div>
            </button>
          </div>

          {/* Difficulty Switcher (Visible when Puzzle Mode is selected) */}
          {selectedModeCategory === 'puzzle' && (
            <div className="mt-3 p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-800/60 animate-fade-in">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                  <Puzzle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Puzzle Difficulty:</span>
                </span>
                <span className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">
                  {puzzleDifficulty === 'easy' ? '4 Squares (2×2)' : '9 Squares (3×3)'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPuzzleDifficulty('easy')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    puzzleDifficulty === 'easy'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-purple-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span>Easy (4 Squares)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPuzzleDifficulty('hard')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    puzzleDifficulty === 'hard'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-purple-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span>Hard (9 Squares)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onStartGame(resolvedGameMode)}
            className={`w-full sm:flex-1 h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all cursor-pointer ${
              selectedModeCategory === 'time_challenge'
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25'
                : selectedModeCategory === 'puzzle'
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/25'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25'
            }`}
          >
            {selectedModeCategory === 'time_challenge' ? (
              <>
                <Zap className="w-4 h-4 fill-white text-white" />
                <span>Start Time Challenge</span>
              </>
            ) : selectedModeCategory === 'puzzle' ? (
              <>
                <Puzzle className="w-4 h-4 text-white" />
                <span>Start Puzzle ({puzzleDifficulty === 'easy' ? '4 Squares' : '9 Squares'})</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Start Classic Challenge</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenItemEditor}
            className="w-full sm:flex-1 h-12 rounded-2xl border border-zinc-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-750 font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <Settings className="w-4 h-4 text-zinc-400" />
            <span>Manage & Edit Items</span>
          </button>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-400 flex flex-wrap items-center justify-center gap-1.5">
          <span>Keyboard shortcuts:</span>
          <span className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[11px]">A or 1</span>
          <span>for Option A ·</span>
          <span className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[11px]">B or 2</span>
          <span>for Option B ·</span>
          <span className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[11px]">Space / Enter</span>
          <span>to advance</span>
        </div>
      </div>
    </div>
  );
};
