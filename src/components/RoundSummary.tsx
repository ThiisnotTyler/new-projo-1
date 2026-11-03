import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, RotateCcw, Share2, Trophy, CheckCircle, XCircle, ChevronDown, ChevronUp, Sparkles, Flame, Home, Image as ImageIcon, Zap, Puzzle } from 'lucide-react';
import { RoundResult, Achievement, PictureItem } from '../types/game';
import { playVictoryFanfare } from '../utils/audio';

interface RoundSummaryProps {
  result: RoundResult;
  items: PictureItem[];
  newAchievements: Achievement[];
  onPlayAgain: () => void;
  onReturnHome: () => void;
  onOpenShare: () => void;
  onViewLeaderboards: () => void;
}

export const RoundSummary: React.FC<RoundSummaryProps> = ({
  result,
  items,
  newAchievements,
  onPlayAgain,
  onReturnHome,
  onOpenShare,
  onViewLeaderboards,
}) => {
  const [showQuestionReview, setShowQuestionReview] = useState(false);

  useEffect(() => {
    // Fire confetti for high accuracy or high streak
    if (result.accuracy >= 70 || result.bestStreak >= 4) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
      });
      playVictoryFanfare();
    }
  }, [result]);

  return (
    <div className="w-full max-w-2xl mx-auto py-4 px-2 sm:px-0">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xl shadow-zinc-200/40 dark:shadow-none p-6 sm:p-8">
        
        {/* Title Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 mb-3 shadow-inner">
            <Trophy className="w-7 h-7" />
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-zinc-950 dark:text-zinc-50">
            Challenge Complete!
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 flex items-center justify-center gap-1.5">
            {result.mode === 'time_challenge' ? (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
                <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                Time Challenge (3s Flash)
              </span>
            ) : result.mode === 'puzzle_easy' ? (
              <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/60">
                <Puzzle className="w-3.5 h-3.5 text-purple-500" />
                Puzzle Mode (Easy · 4 Squares)
              </span>
            ) : result.mode === 'puzzle_hard' ? (
              <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/60">
                <Puzzle className="w-3.5 h-3.5 text-purple-500" />
                Puzzle Mode (Hard · 9 Squares)
              </span>
            ) : (
              <span>Classic Picture Deduction</span>
            )}
          </p>
        </div>

        {/* 4 Key Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
          {/* Score */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 rounded-xl p-3 text-center">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Total Score
            </div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {result.score.toLocaleString()}
            </div>
          </div>

          {/* Accuracy */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 rounded-xl p-3 text-center">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Accuracy
            </div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {result.accuracy}%
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">
              {result.correctCount}/{result.totalQuestions}
            </div>
          </div>

          {/* Best Streak */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 rounded-xl p-3 text-center">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Best Streak
            </div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-amber-500 mt-1 flex items-center justify-center gap-1">
              <span>{result.bestStreak}x</span>
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
          </div>

          {/* Avg Answer Speed */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 rounded-xl p-3 text-center">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Avg Speed
            </div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 flex items-center justify-center gap-1">
              <span>{result.avgTimeSeconds !== undefined ? `${result.avgTimeSeconds}s` : '2.0s'}</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">
              per answer
            </div>
          </div>
        </div>

        {/* Achievements Earned in this round */}
        {newAchievements.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Achievement Unlocked!</span>
            </div>
            <div className="space-y-2">
              {newAchievements.map(ach => (
                <div key={ach.id} className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{ach.title}</span>
                    <span className="text-zinc-500 dark:text-zinc-400 ml-1.5">· {ach.description}</span>
                  </div>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                    +{ach.xpReward} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
          <button
            onClick={onPlayAgain}
            className="h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-[0.99] transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <button
            onClick={onReturnHome}
            className="h-12 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 hover:bg-zinc-800 dark:hover:bg-white shadow-md active:scale-[0.99] transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Home Screen</span>
          </button>

          <button
            onClick={onOpenShare}
            className="h-12 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-750 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Share2 className="w-4 h-4 text-indigo-500" />
            <span>Share</span>
          </button>

          <button
            onClick={onViewLeaderboards}
            className="h-12 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-750 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Ranks</span>
          </button>
        </div>

        {/* Review Answers Toggle */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
          <button
            onClick={() => setShowQuestionReview(!showQuestionReview)}
            className="w-full py-2 flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
          >
            <span>Review Pictures ({result.answers.length} Total)</span>
            {showQuestionReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showQuestionReview && (
            <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {result.answers.map((ans, idx) => {
                const item = items.find(item => item.id === ans.itemId);
                if (!item) return null;
                const correctLabel = item.correctAnswer === 'A' ? item.optionA.label : item.optionB.label;
                const userLabel = ans.userChoice === 'A' ? item.optionA.label : item.optionB.label;

                return (
                  <div
                    key={ans.itemId}
                    className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800/80 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-10 h-10 rounded overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0 flex items-center justify-center">
                        {Boolean(item.imageUrl && item.imageUrl.trim() !== '') ? (
                          <img src={item.imageUrl} alt="thumbnail" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-zinc-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          {ans.isCorrect ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          )}
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {idx + 1}. {item.prompt}
                          </span>
                        </div>
                        <div className="text-zinc-500 dark:text-zinc-400 mt-1 pl-5 flex items-center justify-between gap-2">
                          <span>
                            Correct: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{correctLabel}</span>
                            {!ans.isCorrect && ` (You picked: ${userLabel})`}
                          </span>
                          <span className="font-mono text-[11px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                            {(ans.timeSpentMs / 1000).toFixed(1)}s
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
