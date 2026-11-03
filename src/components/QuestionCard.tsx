import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, ArrowRight, Lightbulb, Users, Edit3, ImageOff, Maximize2, Minimize2, Zap, Eye, EyeOff, Lock, Puzzle } from 'lucide-react';
import { PictureItem, Choice, GameMode } from '../types/game';
import { playVanishSound, playTimerTickSound } from '../utils/audio';
import { ImagePuzzle } from './ImagePuzzle';

interface QuestionCardProps {
  item: PictureItem;
  onAnswer: (choice: Choice) => void;
  onNext: () => void;
  isAnswered: boolean;
  userChoice: Choice | null;
  isCorrect: boolean | null;
  pointsAwarded: number;
  onEditCurrentItem: () => void;
  gameMode?: GameMode;
}

const FLASH_DURATION = 3000;

export const QuestionCard: React.FC<QuestionCardProps> = ({
  item,
  onAnswer,
  onNext,
  isAnswered,
  userChoice,
  isCorrect,
  pointsAwarded,
  onEditCurrentItem,
  gameMode = 'classic',
}) => {
  const [imageError, setImageError] = useState(false);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const [flashRemainingMs, setFlashRemainingMs] = useState<number>(FLASH_DURATION);
  const [isPictureHidden, setIsPictureHidden] = useState<boolean>(false);
  const [isPuzzleSolved, setIsPuzzleSolved] = useState<boolean>(false);

  const isPuzzleMode = gameMode === 'puzzle_easy' || gameMode === 'puzzle_hard';
  const puzzleGridSize: 2 | 3 = gameMode === 'puzzle_hard' ? 3 : 2;

  // Reset puzzle solved state whenever question changes
  useEffect(() => {
    setIsPuzzleSolved(false);
  }, [item.id]);

  // Reset image error state whenever question changes
  useEffect(() => {
    setImageError(false);
  }, [item.id, item.imageUrl]);

  // 3-second flash timer for Time Challenge mode
  useEffect(() => {
    if (gameMode !== 'time_challenge' || isAnswered) {
      setIsPictureHidden(false);
      return;
    }

    setIsPictureHidden(false);
    setFlashRemainingMs(FLASH_DURATION);

    const startTime = Date.now();
    let lastSecond = 3;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, FLASH_DURATION - elapsed);
      setFlashRemainingMs(remaining);

      const currentSec = Math.ceil(remaining / 1000);
      if (currentSec !== lastSecond && remaining > 0) {
        lastSecond = currentSec;
        playTimerTickSound(remaining <= 1000);
      }

      if (remaining <= 0) {
        clearInterval(interval);
        setIsPictureHidden(true);
        playVanishSound();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [item.id, gameMode, isAnswered]);

  // Keyboard navigation: A/1 for Option A, B/2 for Option B, Space/Enter for Next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (!isAnswered) {
        // Enforce puzzle assembly requirement
        if (isPuzzleMode && !isPuzzleSolved) return;

        if (e.key === 'a' || e.key === 'A' || e.key === '1' || e.key === 'ArrowLeft') {
          e.preventDefault();
          onAnswer('A');
        } else if (e.key === 'b' || e.key === 'B' || e.key === '2' || e.key === 'ArrowRight') {
          e.preventDefault();
          onAnswer('B');
        }
      } else {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, isPuzzleMode, isPuzzleSolved, onAnswer, onNext]);

  // Reset image error state whenever item changes
  useEffect(() => {
    setImageError(false);
  }, [item.id]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xl shadow-zinc-200/30 dark:shadow-none p-5 sm:p-7 flex flex-col justify-between"
        >
          {/* Top metadata row with clean unboxed text and edit button */}
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {item.category}
              </span>
              <span aria-hidden="true">·</span>
              {gameMode === 'time_challenge' ? (
                <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                  <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                  Time Challenge (3s Flash)
                </span>
              ) : isPuzzleMode ? (
                <span className="inline-flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400">
                  <Puzzle className="w-3 h-3 text-purple-500" />
                  Puzzle Mode ({puzzleGridSize === 2 ? 'Easy · 4 Squares' : 'Hard · 9 Squares'})
                </span>
              ) : (
                <span>Picture Deduction</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {item.globalAccuracy && (
                <div className="flex items-center gap-1 font-semibold text-xs text-zinc-500 dark:text-zinc-400">
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{item.globalAccuracy}% accuracy</span>
                </div>
              )}
              <button
                onClick={onEditCurrentItem}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-2 py-0.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer font-medium"
                title="Edit this item text and information"
              >
                <Edit3 className="w-3 h-3" />
                <span className="hidden sm:inline">Edit Item</span>
              </button>
            </div>
          </div>

          {/* Prompt */}
          <h2 className="text-lg sm:text-xl font-display font-semibold text-zinc-950 dark:text-zinc-50 tracking-tight mb-3">
            {item.prompt}
          </h2>

          {/* TIME CHALLENGE COUNTDOWN TICKER & PROGRESS BAR */}
          {gameMode === 'time_challenge' && !isAnswered && (
            <div className="mb-3 px-3.5 py-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/25 flex flex-col gap-1.5 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>3-Second Picture Flash</span>
                </span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                  {!isPictureHidden ? `${(flashRemainingMs / 1000).toFixed(1)}s` : 'Vanished!'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-amber-200/50 dark:bg-amber-900/50 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-75 rounded-full ${
                    flashRemainingMs > 1000 ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'
                  }`}
                  style={{ width: `${Math.max(0, (flashRemainingMs / FLASH_DURATION) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* PICTURE CONTAINER OR PUZZLE CONTAINER */}
          {isPuzzleMode && !isAnswered ? (
            <div className="mb-4">
              <ImagePuzzle
                imageUrl={item.imageUrl}
                gridSize={puzzleGridSize}
                isSolved={isPuzzleSolved}
                onSolve={() => setIsPuzzleSolved(true)}
              />
            </div>
          ) : (
            <div className="relative w-full h-72 sm:h-96 min-h-[260px] max-h-[55vh] rounded-xl overflow-hidden bg-zinc-950/95 border border-zinc-200/80 dark:border-zinc-800 mb-4 shadow-inner flex items-center justify-center select-none group">
            {Boolean(item.imageUrl && item.imageUrl.trim() !== '') && !imageError ? (
              isPictureHidden && !isAnswered ? (
                /* Hidden state during Time Challenge after 3 seconds */
                <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-300 animate-fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3 shadow-inner">
                    <EyeOff className="w-7 h-7 text-amber-500 animate-pulse" />
                  </div>
                  <div className="font-display font-bold text-lg text-white">
                    Picture Vanished!
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
                    The 3-second flash is over. Make your deduction between Option A and Option B from memory!
                  </p>
                  <div className="mt-3.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] text-zinc-300 font-medium flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Picture re-reveals upon answering</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Ambient blurred backdrop for seamless edge transition */}
                  {fitMode === 'contain' && (
                    <img
                      src={item.imageUrl}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-25 dark:opacity-35 scale-110 pointer-events-none"
                    />
                  )}

                  {/* Main image: object-contain guarantees 100% of the image is visible without cropping */}
                  <img
                    src={item.imageUrl}
                    alt={item.prompt}
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                    className={`relative z-10 w-full h-full ${
                      fitMode === 'contain' ? 'object-contain' : 'object-cover'
                    } transition-all duration-300 drop-shadow-sm`}
                  />

                  {/* Revealed tag when answered in Time Challenge mode */}
                  {gameMode === 'time_challenge' && isAnswered && (
                    <div className="absolute top-2.5 left-2.5 z-20 px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 text-[11px] font-semibold border border-emerald-700/60 backdrop-blur-md flex items-center gap-1.5 shadow-md">
                      <Eye className="w-3 h-3 text-emerald-400" />
                      <span>Revealed For Review</span>
                    </div>
                  )}

                  {/* Quick Fit / Fill Toggle */}
                  <button
                    type="button"
                    onClick={() => setFitMode(prev => prev === 'contain' ? 'cover' : 'contain')}
                    className="absolute bottom-2.5 right-2.5 z-20 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/90 text-white text-[11px] font-medium backdrop-blur-md border border-white/15 flex items-center gap-1.5 transition-all opacity-85 hover:opacity-100 shadow-md"
                    title={fitMode === 'contain' ? "Fill Frame (may crop edges)" : "Fit Whole Picture (no crop)"}
                  >
                    {fitMode === 'contain' ? (
                      <>
                        <Maximize2 className="w-3 h-3" />
                        <span>Fill Frame</span>
                      </>
                    ) : (
                      <>
                        <Minimize2 className="w-3 h-3" />
                        <span>Fit Whole</span>
                      </>
                    )}
                  </button>
                </>
              )
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-400">
                <ImageOff className="w-10 h-10 mb-2 stroke-1" />
                <span className="text-xs font-medium">Image preview unavailable</span>
                <span className="text-[11px] opacity-70 mt-1">Check image URL in editor</span>
              </div>
            )}
          </div>
        )}

          {/* POST-GUESS INFORMATION (Revealed immediately upon answer) */}
          {isAnswered ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 pt-3 border-t border-zinc-100 dark:border-zinc-800"
            >
              {/* Correct / Incorrect Banner */}
              <div
                className={`p-3.5 rounded-xl mb-3.5 flex items-start gap-3 ${
                  isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-100'
                    : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-100'
                }`}
              >
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-sm">
                  <div className="font-bold flex items-center justify-between">
                    <span>
                      {isCorrect
                        ? (item.correctFeedbackMessage || 'Correct Deduction!')
                        : (item.incorrectFeedbackMessage || 'Incorrect!')}
                    </span>
                    {isCorrect && (
                      <span className="font-mono text-xs bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-950 dark:text-emerald-200 px-2 py-0.5 rounded font-bold">
                        +{pointsAwarded} pts
                      </span>
                    )}
                  </div>
                  <div className="text-xs mt-0.5 opacity-90">
                    The correct answer is <strong className="underline underline-offset-2">{item.correctAnswer === 'A' ? item.optionA.label : item.optionB.label}</strong>.
                  </div>
                </div>
              </div>

              {/* Information Behind The Picture */}
              <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4 bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <div className="font-semibold text-xs text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Information Behind The Picture</span>
                </div>
                {item.informationBehindPicture}

                {item.funFact && (
                  <div className="mt-2.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-400">
                    <strong className="text-zinc-800 dark:text-zinc-200">Fact:</strong> {item.funFact}
                  </div>
                )}
              </div>

              {/* Next Question Primary CTA */}
              <button
                onClick={onNext}
                autoFocus
                className="w-full h-12 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-white shadow-md active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-normal opacity-60 ml-2">
                  (Press Space ␣ or Enter)
                </span>
              </button>
            </motion.div>
          ) : (
            /* INTERACTIVE CHOICES: OPTION A vs OPTION B */
            <div className="mt-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              {/* Puzzle Locked Notification */}
              {isPuzzleMode && !isPuzzleSolved && (
                <div className="mb-3.5 px-3.5 py-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/80 flex items-center justify-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300 animate-fade-in shadow-xs">
                  <Lock className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Reassemble the {puzzleGridSize * puzzleGridSize} puzzle squares above to unlock Option A & B!</span>
                </div>
              )}

              <div className={`grid grid-cols-2 gap-3 sm:gap-4 transition-all duration-200 ${
                isPuzzleMode && !isPuzzleSolved
                  ? 'opacity-40 grayscale pointer-events-none select-none'
                  : 'opacity-100'
              }`}>
                {/* OPTION A BUTTON */}
                <button
                  onClick={() => {
                    if (isPuzzleMode && !isPuzzleSolved) return;
                    onAnswer('A');
                  }}
                  disabled={isPuzzleMode && !isPuzzleSolved}
                  className="group relative p-4.5 rounded-2xl border-2 border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30 hover:bg-indigo-100/70 dark:hover:bg-indigo-950/50 hover:border-indigo-400 dark:hover:border-indigo-600 active:scale-[0.98] transition-all text-left flex flex-col justify-between min-h-[96px] focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <span className="w-7 h-7 rounded-xl font-display font-extrabold text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center shadow-xs">
                      A
                    </span>
                    <span className="hidden sm:inline text-xs text-zinc-400 font-medium">
                      [A or 1]
                    </span>
                  </div>
                  <div>
                    <div className="font-display font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.optionA.label}
                    </div>
                    {item.optionA.description && (
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5 font-normal">
                        {item.optionA.description}
                      </div>
                    )}
                  </div>
                </button>

                {/* OPTION B BUTTON */}
                <button
                  onClick={() => {
                    if (isPuzzleMode && !isPuzzleSolved) return;
                    onAnswer('B');
                  }}
                  disabled={isPuzzleMode && !isPuzzleSolved}
                  className="group relative p-4.5 rounded-2xl border-2 border-violet-200/80 dark:border-violet-900/60 bg-violet-50/40 dark:bg-violet-950/30 hover:bg-violet-100/70 dark:hover:bg-violet-950/50 hover:border-violet-400 dark:hover:border-violet-600 active:scale-[0.98] transition-all text-left flex flex-col justify-between min-h-[96px] focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer shadow-xs disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <span className="w-7 h-7 rounded-xl font-display font-extrabold text-xs text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/60 flex items-center justify-center shadow-xs">
                      B
                    </span>
                    <span className="hidden sm:inline text-xs text-zinc-400 font-medium">
                      [B or 2]
                    </span>
                  </div>
                  <div>
                    <div className="font-display font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {item.optionB.label}
                    </div>
                    {item.optionB.description && (
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5 font-normal">
                        {item.optionB.description}
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
