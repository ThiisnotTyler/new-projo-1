import React, { useState } from 'react';
import { X, User, Copy, Check, Sparkles } from 'lucide-react';
import { UserStats } from '../types/game';
import { updateUserProfile } from '../utils/statsStorage';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats;
  onProfileUpdated: (updated: UserStats) => void;
}

const AVATAR_OPTIONS = ['🧠', '⚡', '🦉', '🎯', '🦊', '🌌', '🚀', '👑', '🔮', '🦁', '🎭', '🔥'];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userStats,
  onProfileUpdated,
}) => {
  const [username, setUsername] = useState(userStats.username);
  const [selectedAvatar, setSelectedAvatar] = useState(userStats.avatar);
  const [copiedCode, setCopiedCode] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateUserProfile(username, selectedAvatar);
    onProfileUpdated(updated);
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      onClose();
    }, 800);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userStats.friendCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-zinc-950 dark:text-zinc-50">
              Player Profile
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Customize your public competitor identity
            </p>
          </div>
        </div>

        {/* Friend Code Card */}
        <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Your Friend Code
            </div>
            <div className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-wider">
              {userStats.friendCode}
            </div>
          </div>
          <button
            onClick={handleCopyCode}
            className="h-8 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-600 flex items-center gap-1 transition-colors"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <form onSubmit={handleSave}>
          {/* Avatar selector */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Select Avatar
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedAvatar(emoji)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    selectedAvatar === emoji
                      ? 'bg-indigo-100 dark:bg-indigo-950 ring-2 ring-indigo-500 scale-105'
                      : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Nickname input */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Player Nickname
            </label>
            <input
              type="text"
              maxLength={16}
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1"
            >
              {savedFeedback ? <Check className="w-4 h-4" /> : null}
              <span>{savedFeedback ? 'Saved!' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
