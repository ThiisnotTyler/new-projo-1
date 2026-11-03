import React from 'react';
import { Volume2, VolumeX, Moon, Sun, Bell, User, Scissors } from 'lucide-react';
import { UserStats } from '../types/game';

interface TopNavigationProps {
  currentTab: 'play' | 'leaderboards' | 'stats';
  onSelectTab: (tab: 'play' | 'leaderboards' | 'stats') => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  unreadNotifsCount: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenDailyChallenge: () => void;
  userStats: UserStats;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentTab,
  onSelectTab,
  darkMode,
  onToggleDarkMode,
  isMuted,
  onToggleMute,
  unreadNotifsCount,
  onOpenNotifications,
  onOpenProfile,
  onOpenDailyChallenge,
  userStats,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('play')}
          className="text-left font-display font-black text-xl tracking-tight text-zinc-950 dark:text-zinc-50 hover:opacity-85 transition-opacity focus:outline-none cursor-pointer"
        >
          <span>Dichotomy</span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden sm:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('play')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'play'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200'
            }`}
          >
            Play Game
          </button>

          {/* Daily 50/50 Quick Trigger */}
          <button
            type="button"
            onClick={onOpenDailyChallenge}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/70 border border-amber-300/80 dark:border-amber-700/80 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Scissors className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Daily 50/50</span>
          </button>

          <button
            onClick={() => onSelectTab('leaderboards')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'leaderboards'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200'
            }`}
          >
            <span>Leaderboards</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Live competition" />
          </button>
          <button
            onClick={() => onSelectTab('stats')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'stats'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200'
            }`}
          >
            Stats & History
          </button>
        </nav>

        {/* Zone 3: Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors focus:outline-none"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors focus:outline-none"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors focus:outline-none"
            title="Push Notifications & Alerts"
            aria-label="Push Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {/* User Profile Trigger */}
          <button
            onClick={onOpenProfile}
            className="h-9 px-2.5 rounded-lg flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 transition-colors text-xs font-semibold focus:outline-none"
            title="Edit Player Profile"
          >
            <span className="text-base leading-none">{userStats.avatar}</span>
            <span className="hidden md:inline max-w-[80px] truncate">{userStats.username}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
