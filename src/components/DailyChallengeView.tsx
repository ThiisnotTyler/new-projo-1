import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Flame, Clock, CheckCircle2, XCircle, Share2, Check, Sparkles, Scissors, Trophy, RefreshCw } from 'lucide-react';
import { PictureItem, Choice, DailyChallengeState } from '../types/game';
import {
  getDailyChallengeItem,
  getDailyChallengeState,
  recordDailyChallengeAnswer,
  getTimeUntilNextDaily,
  getTodayDateString,
} from '../utils/dailyChallengeStorage';
import { playCorrectSound, playIncorrectSound, playClickSound, triggerHaptic } from '../utils/audio';

interface DailyChallengeViewProps {
  items: PictureItem[];
  onExit: () => void;
  dailyStreak: number;
}

export const DailyChallengeView: React.FC<DailyChallengeViewProps> = ({
  items,
  onExit,
  dailyStreak,
}) => {
  const todayStr = getTodayDateString();
  const [countdown, setCountdown] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load deterministic daily item & slice
  const dailyData = React.useMemo(() => {
    try {
      return getDailyChallengeItem(items, todayStr);
    } catch {
      return null;
    }
  }, [items, todayStr]);

  // Load existing completion state for today
  const [savedState, setSavedState] = useState<DailyChallengeState | null>(() =>
    getDailyChallengeState(todayStr)
  );

  // Live countdown timer to 24h reset
  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getTimeUntilNextDaily().formatted);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!savedState) {
      setStartTime(Date.now());
    }
  }, [savedState]);

  if (!dailyData) {
    return (
      <div className="w-full max-w-xl mx-auto py-12 px-4 text-center">
        <p className="text-zinc-500">No daily challenge items found in the database.</p>
        <button
          type="button"
          onClick={onExit}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
        >
          Return Home
        </button>
      </div>
    );
  }

  const { item, sliceBand, sliceLabel, sliceDescription } = dailyData;
  const isCompleted = !!savedState?.isCompleted;

  const handleChoice = (choice: Choice) => {
    if (isCompleted || isSubmitting) return;

    setIsSubmitting(true);
    playClickSound();
    triggerHaptic('medium');

    const elapsedMs = Date.now() - startTime;
    const { state } = recordDailyChallengeAnswer(
      todayStr,
      item,
      sliceBand,
      sliceLabel,
      choice,
      elapsedMs
    );

    if (state.isCorrect) {
      playCorrectSound();
      triggerHaptic('success');
    } else {
      playIncorrectSound();
      triggerHaptic('warning');
    }

    setSavedState(state);
    setIsSubmitting(false);
  };

  const handleCopyShare = async () => {
    if (!savedState) return;
    const resultEmoji = savedState.isCorrect ? '🟩 CORRECT' : '🟥 INCORRECT';
    const streakStr = savedState.streakAtTime ? `${savedState.streakAtTime}🔥` : `${dailyStreak}🔥`;

    const text = [
      `Dichotomy Daily 50/50 🎯`,
      `Date: ${todayStr}`,
      `Slice: ${sliceLabel.split(':')[0]}`,
      `Result: ${resultEmoji}`,
      `Streak: ${streakStr}`,
      window.location.origin,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const displayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="w-full max-w-2xl mx-auto py-4 sm:py-6 px-4 animate-fade-in flex flex-col items-center">
      {/* Top Header Controls (Identical to normal gameplay header layout) */}
      <div className="w-full flex items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => {
            playClickSound();
            onExit();
          }}
          className="h-9 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Menu</span>
        </button>

        {/* 24h Status Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/70 border border-amber-300/80 dark:border-amber-700/80 text-amber-700 dark:text-amber-300 text-xs font-bold">
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily 50/50 Challenge</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono text-[11px] font-semibold">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span>Resets in: {countdown}</span>
          </div>
        </div>

        {/* Daily Streak */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs">
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{savedState?.streakAtTime || dailyStreak} Streak</span>
        </div>
      </div>

      {/* Sliced Condition Pill Banner */}
      <div className="w-full mb-4 p-3 rounded-2xl bg-zinc-100/90 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Scissors className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-zinc-950 dark:text-zinc-50 mr-1.5">
              {sliceLabel}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">
              — {sliceDescription}
            </span>
          </div>
        </div>

        <div className="sm:hidden font-mono text-[11px] text-zinc-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Next: {countdown}</span>
        </div>
      </div>

      {/* Main Full-Size Card (Standard Game Proportion) */}
      <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xl shadow-zinc-200/40 dark:shadow-none p-5 sm:p-7 flex flex-col items-center">
        {/* Title / Prompt */}
        <div className="w-full text-center mb-4">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
            Universal 24h Mystery · {displayDate}
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-zinc-950 dark:text-zinc-50 tracking-tight leading-tight">
            {item.prompt}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
            {!isCompleted
              ? 'Deduce Option A or Option B solely from this horizontal slice. No peeking!'
              : 'Full portrait revealed! Check your deduction below.'}
          </p>
        </div>

        {/* Full-Width Spacious Image Aperture Container */}
        <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden bg-black border-2 border-zinc-300 dark:border-zinc-700 shadow-2xl mb-6">
          {/* High Resolution Subject Image */}
          <img
            src={item.imageUrl}
            referrerPolicy="no-referrer"
            alt="Daily Mystery Subject"
            className="w-full h-full object-cover select-none pointer-events-none transition-all duration-700 ease-out"
            style={{
              clipPath: isCompleted
                ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
                : sliceBand === 'top'
                ? 'polygon(0% 0%, 100% 0%, 100% 33.33%, 0% 33.33%)'
                : sliceBand === 'middle'
                ? 'polygon(0% 33.33%, 100% 33.33%, 100% 66.66%, 0% 66.66%)'
                : 'polygon(0% 66.66%, 100% 66.66%, 100% 100%, 0% 100%)',
            }}
          />

          {/* Letterbox Mask Blinds (Only visible when UNANSWERED) */}
          {!isCompleted && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
              {/* Top mask */}
              {sliceBand !== 'top' && (
                <div
                  className="w-full bg-zinc-950/95 backdrop-blur-md border-b border-white/10 flex items-center justify-center transition-all duration-700"
                  style={{
                    height: sliceBand === 'middle' ? '33.33%' : '66.66%',
                  }}
                >
                  <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase px-2 py-0.5 rounded bg-black/60 border border-white/10">
                    Obscured
                  </span>
                </div>
              )}

              {/* Bottom mask */}
              {sliceBand !== 'bottom' && (
                <div
                  className="w-full bg-zinc-950/95 backdrop-blur-md border-t border-white/10 flex items-center justify-center transition-all duration-700"
                  style={{
                    height: sliceBand === 'middle' ? '33.33%' : '66.66%',
                  }}
                >
                  <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase px-2 py-0.5 rounded bg-black/60 border border-white/10">
                    Obscured
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Correct / Incorrect Stamp upon reveal */}
          {isCompleted && (
            <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full backdrop-blur-md bg-black/80 border border-white/20 text-xs font-bold flex items-center gap-2 shadow-xl animate-fade-in text-white">
              {savedState?.isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Correct Deduction</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Incorrect</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Action Controls: 50/50 Choice Buttons or Revealed Outcome */}
        {!isCompleted ? (
          <div className="w-full max-w-md space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleChoice('A')}
                className="p-4 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 active:scale-98 transition-all text-left cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    A
                  </span>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Choice
                  </span>
                </div>
                <div className="font-display font-bold text-base text-zinc-950 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.optionA.label}
                </div>
                {item.optionA.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                    {item.optionA.description}
                  </p>
                )}
              </button>

              {/* Option B */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleChoice('B')}
                className="p-4 rounded-2xl border-2 border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/60 active:scale-98 transition-all text-left cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="w-6 h-6 rounded-lg bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
                    B
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Choice
                  </span>
                </div>
                <div className="font-display font-bold text-base text-zinc-950 dark:text-zinc-50 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {item.optionB.label}
                </div>
                {item.optionB.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                    {item.optionB.description}
                  </p>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-zinc-400 font-normal">
              1 attempt per day. Full uncropped image reveals immediately on selection!
            </p>
          </div>
        ) : (
          /* Post-Deduction Revealed Details & Story */
          <div className="w-full max-w-md space-y-4 animate-fade-in">
            {/* Feedback Score Card */}
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm ${
                savedState?.isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-base mb-1">
                <span>
                  {savedState?.isCorrect ? 'Spot-On Deduction!' : 'Incorrect Deduction'}
                </span>
                <span className="font-mono text-sm">
                  +{savedState?.pointsEarned} pts
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {savedState?.isCorrect
                  ? item.correctFeedbackMessage || `Great eye! You correctly identified Option ${item.correctAnswer}.`
                  : item.incorrectFeedbackMessage || `The correct answer was Option ${item.correctAnswer}.`}
              </p>
            </div>

            {/* Backstory & Information Behind Picture */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 text-xs sm:text-sm text-left">
              <div className="font-bold text-zinc-950 dark:text-zinc-50 mb-1.5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>The Story Behind The Picture:</span>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                {item.informationBehindPicture}
              </p>
              {item.funFact && (
                <div className="mt-3 pt-2.5 border-t border-zinc-200/60 dark:border-zinc-700/60 text-xs text-zinc-500 dark:text-zinc-400">
                  <strong className="text-zinc-800 dark:text-zinc-200">Fun Fact:</strong> {item.funFact}
                </div>
              )}
            </div>

            {/* Actions: Share & Return */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleCopyShare}
                className="w-full sm:flex-1 h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                    <span>Copied Score Card!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Share Today's Result</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onExit();
                }}
                className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Return Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
