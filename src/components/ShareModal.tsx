import React, { useState, useRef } from 'react';
import { X, Share2, Copy, Check, Download, Twitter, MessageCircle, Link2 } from 'lucide-react';
import { RoundResult } from '../types/game';
import { unlockAchievement } from '../utils/statsStorage';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: RoundResult;
  username: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  result,
  username,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  if (!isOpen) return null;

  // Generate Wordle-like emoji grid
  const emojiGrid = result.answers.map(a => (a.isCorrect ? '🟩' : '🟥')).join('');
  const shareText = `Dichotomy: Picture Deduction\nScore: ${result.score.toLocaleString()} pts (${result.accuracy}% accuracy)\nStreak: ${result.bestStreak}x 🔥\n${emojiGrid}\nCan you beat my score? Play Picture Guess!`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      unlockAchievement('share_score');
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Dichotomy - Picture Deduction Result`,
          text: shareText,
          url: window.location.origin,
        });
        unlockAchievement('share_score');
      } catch {
        // User cancelled
      }
    } else {
      handleCopyText();
    }
  };

  const handleShareTwitter = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(tweetUrl, '_blank');
    unlockAchievement('share_score');
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
    unlockAchievement('share_score');
  };

  const handleDownloadImageCard = () => {
    setIsGeneratingImage(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGeneratingImage(false);
      return;
    }

    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#09090b');
    gradient.addColorStop(0.5, '#18181b');
    gradient.addColorStop(1, '#09090b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    ctx.save();
    const radial = ctx.createRadialGradient(600, 200, 50, 600, 200, 450);
    radial.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
    radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 1200, 630);
    ctx.restore();

    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 1140, 570);

    ctx.font = 'bold 36px "Outfit", system-ui, sans-serif';
    ctx.fillStyle = '#6366f1';
    ctx.fillText('DICHOTOMY · PICTURE GUESSING GAME', 80, 100);

    ctx.font = 'bold 54px "Outfit", system-ui, sans-serif';
    ctx.fillStyle = '#f4f4f5';
    ctx.fillText('Picture Deduction Challenge', 80, 180);

    ctx.font = 'bold 72px "JetBrains Mono", monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText(`${result.score.toLocaleString()}`, 80, 280);

    ctx.font = '24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('TOTAL POINTS', 80, 320);

    ctx.font = 'bold 72px "JetBrains Mono", monospace';
    ctx.fillStyle = '#60a5fa';
    ctx.fillText(`${result.accuracy}%`, 480, 280);

    ctx.font = '24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('ACCURACY', 480, 320);

    ctx.font = 'bold 72px "JetBrains Mono", monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`${result.bestStreak}x`, 820, 280);

    ctx.font = '24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('BEST STREAK', 820, 320);

    let emojiX = 80;
    const emojiY = 420;
    result.answers.forEach((ans) => {
      ctx.fillStyle = ans.isCorrect ? '#10b981' : '#f43f5e';
      ctx.fillRect(emojiX, emojiY - 32, 36, 36);
      emojiX += 48;
    });

    ctx.font = '24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#71717a';
    ctx.fillText(`Player: ${username} · Challenge live at dichotomy-game.web`, 80, 530);

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `dichotomy-picture-score-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      unlockAchievement('share_score');
    } catch {
      // Fallback
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-zinc-950 dark:text-zinc-50">
              Share Scorecard
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Challenge friends or broadcast your accuracy
            </p>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-750 rounded-xl p-4 mb-4 text-center">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
            Picture Deduction Challenge
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            {result.score.toLocaleString()} pts · {result.accuracy}%
          </div>

          <div className="text-xl tracking-widest py-2 select-all font-mono">
            {emojiGrid}
          </div>

          <div className="text-[11px] text-zinc-400 mt-1">
            Streak: {result.bestStreak}x 🔥 · {result.correctCount}/{result.totalQuestions} Correct
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={handleCopyText}
            className="h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700/80 text-zinc-900 dark:text-zinc-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Grid!' : 'Copy Results'}</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>Share to App</span>
          </button>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={handleShareTwitter}
            className="flex-1 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Twitter className="w-3.5 h-3.5" />
            <span>X / Twitter</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex-1 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleDownloadImageCard}
            disabled={isGeneratingImage}
            className="h-9 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            title="Download Scorecard Image"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save Image</span>
          </button>
        </div>
      </div>
    </div>
  );
};
