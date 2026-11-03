import React, { useState, useEffect } from 'react';
import { Trophy, Users, Flame, UserPlus, ArrowUp, ArrowDown, Minus, Clock, Sparkles, Search, RefreshCw, Zap, Eye, Puzzle, Globe, Scissors } from 'lucide-react';
import { LeaderboardEntry, ActivityEvent } from '../types/game';
import { getLeaderboard, getFriends, addFriend, getActivityStream, triggerLiveSimulationTick, FriendRecord, LeaderboardModeFilter } from '../utils/leaderboardStorage';
import { getUserStats } from '../utils/statsStorage';

interface LeaderboardViewProps {
  onOpenDailyChallenge?: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onOpenDailyChallenge }) => {
  const [activeTab, setActiveTab] = useState<'global' | 'friends' | 'daily'>('global');
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'allTime'>('today');
  const [selectedMode, setSelectedMode] = useState<LeaderboardModeFilter>('all');
  const [sortBy, setSortBy] = useState<'score' | 'speed' | 'accuracy'>('score');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [friends, setFriends] = useState<FriendRecord[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [friendInput, setFriendInput] = useState('');
  const [addFriendFeedback, setAddFriendFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);

  const currentUser = getUserStats();

  // Load data
  const refreshData = () => {
    setLeaderboard(getLeaderboard(timeframe, selectedMode));
    setFriends(getFriends());
    setActivities(getActivityStream());
  };

  useEffect(() => {
    refreshData();
  }, [timeframe, selectedMode]);

  // Real-time dynamic competition simulation
  // Every 8-12 seconds, simulate competitor movement
  useEffect(() => {
    const interval = setInterval(() => {
      setIsLiveSyncing(true);
      const { updatedList, newActivity } = triggerLiveSimulationTick(selectedMode);
      if (updatedList) setLeaderboard(updatedList);
      if (newActivity) {
        setActivities(prev => [newActivity, ...prev].slice(0, 10));
      }
      setTimeout(() => setIsLiveSyncing(false), 800);
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedMode]);

  const handleAddFriendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendInput.trim()) return;
    const res = addFriend(friendInput);
    setAddFriendFeedback(res);
    if (res.success) {
      setFriendInput('');
      setFriends(getFriends());
      setActivities(getActivityStream());
      setTimeout(() => {
        setShowAddFriendModal(false);
        setAddFriendFeedback(null);
      }, 1500);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4">
      {/* Header & Live Ticker */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-zinc-950 dark:text-zinc-50">
                Live Leaderboard
              </h1>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Live Real-Time</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Real-time rankings updated automatically with active global competitors
            </p>
          </div>

          {/* Add Friend Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddFriendModal(true)}
              className="h-9 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Friend / Rival</span>
            </button>
          </div>
        </div>

        {/* Live Activity Stream Marquee / Ticker */}
        {activities.length > 0 && (
          <div className="mt-3 py-2 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400 overflow-hidden">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <div className="font-semibold text-zinc-900 dark:text-zinc-100 shrink-0">
              Live Feed:
            </div>
            <div className="truncate">
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {activities[0].avatar} {activities[0].username}
              </span>{' '}
              <span>{activities[0].action}</span>
              <span className="text-zinc-400 ml-1">({activities[0].timestamp})</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        {/* Main tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'global'
                ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-zinc-50 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Global Board
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'friends'
                ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-zinc-50 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Friends & Rivals ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-zinc-50 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Daily Challenge
          </button>
        </div>

        {/* Timeframe selector (for global board) */}
        {activeTab === 'global' && (
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setTimeframe('today')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                timeframe === 'today'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-zinc-50 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                timeframe === 'week'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-zinc-50 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeframe('allTime')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                timeframe === 'allTime'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-zinc-50 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              All-Time
            </button>
          </div>
        )}
      </div>

      {/* Mini-Game Mode Filter Pills */}
      {activeTab === 'global' && (
        <div className="mb-4 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-2 shrink-0">
              Mini-Game:
            </span>
            <button
              onClick={() => setSelectedMode('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedMode === 'all'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>All Modes</span>
            </button>
            <button
              onClick={() => setSelectedMode('classic')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedMode === 'classic'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Classic</span>
            </button>
            <button
              onClick={() => setSelectedMode('time_challenge')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedMode === 'time_challenge'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Time Flash</span>
            </button>
            <button
              onClick={() => setSelectedMode('puzzle_easy')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedMode === 'puzzle_easy'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Puzzle className="w-3.5 h-3.5" />
              <span>4-Square Puzzle</span>
            </button>
            <button
              onClick={() => setSelectedMode('puzzle_hard')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedMode === 'puzzle_hard'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Puzzle className="w-3.5 h-3.5" />
              <span>9-Square Puzzle</span>
            </button>
          </div>

          {/* Mode Context Description Banner */}
          <div className="px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-600 dark:text-zinc-300">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                {selectedMode === 'classic' && 'Classic Mode Leaderboard — Ranked by accuracy & streak on full pictures.'}
                {selectedMode === 'time_challenge' && 'Time Flash Leaderboard — Ranked by 3-second rapid memory reaction & accuracy.'}
                {selectedMode === 'puzzle_easy' && '4-Square Puzzle Leaderboard — Ranked by fast tile assembly & intuitive deduction.'}
                {selectedMode === 'puzzle_hard' && '9-Square Puzzle Leaderboard — Ranked by master 9-piece reassembly & deduction.'}
                {selectedMode === 'all' && 'Global Overall Standings — Combined rankings across all mini-games.'}
              </span>
            </div>
            <span className="text-[11px] text-zinc-400">
              Fair, mode-specific rankings
            </span>
          </div>
        </div>
      )}

      {/* Daily Challenge Mode Banner */}
      {activeTab === 'daily' && (
        <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm text-zinc-950 dark:text-zinc-50">
                  Today's Daily Spliced 50/50 Standings
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-extrabold uppercase tracking-wide">
                  24h Board
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                All players deduced Option A or B based on the exact same 1/3rd sliced image today!
              </p>
            </div>
          </div>
          {onOpenDailyChallenge && (
            <button
              type="button"
              onClick={onOpenDailyChallenge}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Open Daily Challenge
            </button>
          )}
        </div>
      )}

      {/* Leaderboard Table / Feed */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-zinc-50 dark:bg-zinc-850/60 border-b border-zinc-200/80 dark:border-zinc-800 text-[11px] font-bold text-zinc-500 uppercase tracking-wider items-center">
          <div className="col-span-2 sm:col-span-1 text-center">Rank</div>
          <div className="col-span-4 sm:col-span-5">Competitor</div>
          <button
            onClick={() => setSortBy('speed')}
            className={`col-span-2 sm:col-span-2 text-right flex items-center justify-end gap-1 transition-colors ${
              sortBy === 'speed' ? 'text-indigo-600 dark:text-indigo-400 font-black' : 'hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
            title="Sort by fastest average answer time"
          >
            <Clock className="w-3 h-3" />
            <span>Avg Speed</span>
          </button>
          <button
            onClick={() => setSortBy('score')}
            className={`col-span-2 sm:col-span-2 text-right transition-colors ${
              sortBy === 'score' ? 'text-indigo-600 dark:text-indigo-400 font-black' : 'hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
            title="Sort by highest score"
          >
            Score
          </button>
          <button
            onClick={() => setSortBy('accuracy')}
            className={`col-span-2 sm:col-span-2 text-right transition-colors ${
              sortBy === 'accuracy' ? 'text-indigo-600 dark:text-indigo-400 font-black' : 'hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
            title="Sort by accuracy percentage"
          >
            Accuracy
          </button>
        </div>

        {/* Content Rows */}
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {activeTab === 'friends' ? (
            /* Friends List View */
            friends.length === 0 ? (
              <div className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                <Users className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
                <p>No friends added yet.</p>
                <button
                  onClick={() => setShowAddFriendModal(true)}
                  className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-semibold underline"
                >
                  Enter a Friend Code or Rival Username
                </button>
              </div>
            ) : (
              [...friends]
                .sort((a, b) => {
                  if (sortBy === 'speed') return (a.avgTimeSeconds || 99) - (b.avgTimeSeconds || 99);
                  if (sortBy === 'accuracy') return b.accuracy - a.accuracy;
                  return b.score - a.score;
                })
                .map((f, idx) => (
                  <div
                    key={f.id}
                    className="grid grid-cols-12 gap-2 px-4 py-3.5 items-center hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors text-xs"
                  >
                    <div className="col-span-2 sm:col-span-1 text-center font-mono font-bold text-zinc-600 dark:text-zinc-400">
                      #{idx + 1}
                    </div>
                    <div className="col-span-4 sm:col-span-5 flex items-center gap-2.5 truncate">
                      <span className="text-xl shrink-0">{f.avatar}</span>
                      <div className="truncate">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {f.username}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          Code: {f.code} · Streak: {f.streak}x
                        </div>
                      </div>
                    </div>
                    {/* Answer Speed */}
                    <div className="col-span-2 sm:col-span-2 text-right font-mono font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3 text-indigo-500" />
                      <span>{f.avgTimeSeconds ? `${f.avgTimeSeconds}s` : '2.1s'}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-2 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {f.score.toLocaleString()}
                    </div>
                    <div className="col-span-2 sm:col-span-2 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      {f.accuracy}%
                    </div>
                  </div>
                ))
            )
          ) : (
            /* Global & Daily Boards */
            [...leaderboard]
              .sort((a, b) => {
                if (sortBy === 'speed') return (a.avgTimeSeconds || 99) - (b.avgTimeSeconds || 99);
                if (sortBy === 'accuracy') return b.accuracy - a.accuracy;
                return b.score - a.score;
              })
              .map((entry, idx) => {
                const rankDelta = entry.previousRank - entry.rank;
                const isUser = entry.isCurrentUser;
                const displayRank = sortBy === 'score' ? entry.rank : idx + 1;

                return (
                  <div
                    key={entry.id}
                    className={`grid grid-cols-12 gap-2 px-4 py-3.5 items-center transition-colors text-xs ${
                      isUser
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/30 font-semibold border-l-4 border-indigo-600'
                        : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30'
                    }`}
                  >
                    {/* Rank & Movement */}
                    <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1 font-mono">
                      <span
                        className={`font-bold ${
                          displayRank === 1
                            ? 'text-amber-500 font-black text-sm'
                            : displayRank === 2
                            ? 'text-zinc-400 font-bold'
                            : displayRank === 3
                            ? 'text-amber-700 font-bold'
                            : 'text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        #{displayRank}
                      </span>
                      {sortBy === 'score' && rankDelta > 0 && (
                        <span className="text-[10px] text-emerald-500 font-bold flex items-center" title={`Up ${rankDelta} spots`}>
                          <ArrowUp className="w-2.5 h-2.5" />
                        </span>
                      )}
                      {sortBy === 'score' && rankDelta < 0 && (
                        <span className="text-[10px] text-rose-500 font-bold flex items-center" title={`Down ${Math.abs(rankDelta)} spots`}>
                          <ArrowDown className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    {/* Competitor Name & Avatar */}
                    <div className="col-span-4 sm:col-span-5 flex items-center gap-2.5 truncate">
                      <span className="text-xl shrink-0">{entry.avatar}</span>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {entry.username}
                          </span>
                          {isUser && (
                            <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded font-sans shrink-0">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
                          <span>{entry.badge}</span>
                          {entry.mode && (
                            <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold shrink-0 ${
                              entry.mode === 'time_challenge'
                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400'
                                : entry.mode === 'puzzle_easy' || entry.mode === 'puzzle_hard'
                                ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400'
                                : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400'
                            }`}>
                              {entry.mode === 'classic' && 'Classic'}
                              {entry.mode === 'time_challenge' && 'Time Flash'}
                              {entry.mode === 'puzzle_easy' && '4-Square'}
                              {entry.mode === 'puzzle_hard' && '9-Square'}
                            </span>
                          )}
                          {entry.streak > 0 && (
                            <>
                              <span className="mx-0.5">·</span>
                              <span className="text-amber-500 font-mono font-medium">
                                {entry.streak}x streak
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Avg Speed / Time to Answer */}
                    <div className="col-span-2 sm:col-span-2 text-right font-mono font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3 text-indigo-500" />
                      <span>{entry.avgTimeSeconds !== undefined ? `${entry.avgTimeSeconds}s` : '2.0s'}</span>
                    </div>

                    {/* Score */}
                    <div className="col-span-2 sm:col-span-2 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
                      {entry.score.toLocaleString()}
                    </div>

                    {/* Accuracy */}
                    <div className="col-span-2 sm:col-span-2 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {entry.accuracy}%
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Add Friend / Enter Rival Code Modal */}
      {showAddFriendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="font-display font-bold text-lg text-zinc-950 dark:text-zinc-50 mb-1">
              Add Friend or Rival
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Enter a friend code (e.g. {currentUser.friendCode}) or player nickname to compare your score records.
            </p>

            <form onSubmit={handleAddFriendSubmit}>
              <input
                type="text"
                placeholder="Enter Code (e.g. X94K2) or Name..."
                value={friendInput}
                onChange={e => setFriendInput(e.target.value)}
                autoFocus
                className="w-full h-11 px-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
              />

              {addFriendFeedback && (
                <div
                  className={`text-xs p-2.5 rounded-lg mb-3 ${
                    addFriendFeedback.success
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {addFriendFeedback.message}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddFriendModal(false)}
                  className="flex-1 h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
                >
                  Add Competitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
