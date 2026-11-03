/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TopNavigation } from './components/TopNavigation';
import { PackSelector } from './components/PackSelector';
import { GameplayHeader } from './components/GameplayHeader';
import { QuestionCard } from './components/QuestionCard';
import { RoundSummary } from './components/RoundSummary';
import { LeaderboardView } from './components/LeaderboardView';
import { StatsView } from './components/StatsView';
import { ShareModal } from './components/ShareModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { ItemEditorModal } from './components/ItemEditorModal';
import { DailyChallengeView } from './components/DailyChallengeView';

import { getPictureItems, savePictureItems } from './data/pictureGameData';
import { PictureItem, Choice, RoundAnswer, RoundResult, Achievement, GameMode } from './types/game';
import { playClickSound, playCorrectSound, playIncorrectSound, playStreakSound, isAudioMuted, setAudioMuted, triggerHaptic } from './utils/audio';
import { getUserStats, recordRoundResult } from './utils/statsStorage';
import { submitScoreToLeaderboard } from './utils/leaderboardStorage';
import { getNotifications, sendPushNotification } from './utils/pushNotifications';

type ScreenState = 'MENU' | 'PLAYING' | 'SUMMARY' | 'DAILY';

export default function App() {
  // Navigation & Theme
  const [activeTab, setActiveTab] = useState<'play' | 'leaderboards' | 'stats'>('play');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('dichotomy_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isMuted, setIsMuted] = useState<boolean>(isAudioMuted);

  // Picture Items (Managed locally + editable in-app)
  const [items, setItems] = useState<PictureItem[]>(getPictureItems);

  // User Stats & Profile
  const [userStats, setUserStats] = useState(getUserStats);
  const [unreadNotifs, setUnreadNotifs] = useState<number>(0);

  // Modals
  const [showShareModal, setShowShareModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showItemEditor, setShowItemEditor] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; body: string } | null>(null);

  // Active Game State
  const [screenState, setScreenState] = useState<ScreenState>('MENU');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [gameQueue, setGameQueue] = useState<PictureItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreakInRound, setBestStreakInRound] = useState(0);
  const [answers, setAnswers] = useState<RoundAnswer[]>([]);

  // Current Question Feedback State
  const [isAnswered, setIsAnswered] = useState(false);
  const [userChoice, setUserChoice] = useState<Choice | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Round Result State
  const [lastRoundResult, setLastRoundResult] = useState<RoundResult | null>(null);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  // Dark Mode class synchronization on document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dichotomy_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dichotomy_dark_mode', 'false');
    }
  }, [darkMode]);

  // Update unread notification count
  const refreshUnreadCount = useCallback(() => {
    const list = getNotifications();
    const unread = list.filter(n => !n.read).length;
    setUnreadNotifs(unread);
  }, []);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    setAudioMuted(next);
  };

  const handleToggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Start Picture Challenge Game
  const handleStartGame = (mode: GameMode = 'classic') => {
    playClickSound();
    setGameMode(mode);
    const currentItems = getPictureItems();
    setItems(currentItems);
    setGameQueue(currentItems);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreakInRound(0);
    setAnswers([]);
    setIsAnswered(false);
    setUserChoice(null);
    setIsCorrect(null);
    setPointsAwarded(0);
    setQuestionStartTime(Date.now());
    setScreenState('PLAYING');
    setActiveTab('play');
  };

  // Answer a picture question
  const handleAnswerQuestion = (choice: Choice) => {
    if (isAnswered || !gameQueue[currentIndex]) return;

    const currentItem = gameQueue[currentIndex];
    const correct = choice === currentItem.correctAnswer;
    const timeSpent = Date.now() - questionStartTime;

    // Calculate score: Base 100 + Speed Bonus (up to 50) + Streak Multiplier
    let pts = 0;
    let nextStreak = streak;

    if (correct) {
      nextStreak = streak + 1;
      const speedBonus = Math.max(0, Math.round((5000 - timeSpent) / 100));
      const streakMultiplier = Math.min(nextStreak, 5);
      pts = (100 + speedBonus) * streakMultiplier;

      playCorrectSound();
      if (nextStreak >= 3) {
        playStreakSound(nextStreak);
      }
      triggerHaptic('success');
    } else {
      nextStreak = 0;
      playIncorrectSound();
      triggerHaptic('warning');
    }

    const newBestStreak = Math.max(bestStreakInRound, nextStreak);
    setStreak(nextStreak);
    setBestStreakInRound(newBestStreak);
    setScore(prev => prev + pts);
    setPointsAwarded(pts);
    setUserChoice(choice);
    setIsCorrect(correct);
    setIsAnswered(true);

    const answerRecord: RoundAnswer = {
      itemId: currentItem.id,
      userChoice: choice,
      isCorrect: correct,
      timeSpentMs: timeSpent,
      pointsEarned: pts,
    };
    setAnswers(prev => [...prev, answerRecord]);
  };

  // Finish Round & Save Stats
  const finishRound = useCallback(() => {
    const totalQuestions = answers.length;
    const correctCount = answers.filter(a => a.isCorrect).length;
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const avgTimeSeconds = totalQuestions > 0
      ? Number((answers.reduce((acc, a) => acc + a.timeSpentMs, 0) / totalQuestions / 1000).toFixed(1))
      : 0;

    const result: RoundResult = {
      id: `round_${Date.now()}`,
      date: new Date().toISOString(),
      score,
      totalQuestions,
      correctCount,
      accuracy,
      bestStreak: bestStreakInRound,
      avgTimeSeconds,
      mode: gameMode,
      packTitle:
        gameMode === 'time_challenge'
          ? 'Time Challenge (3s Flash)'
          : gameMode === 'puzzle_easy'
          ? 'Puzzle Mode (Easy · 4 Squares)'
          : gameMode === 'puzzle_hard'
          ? 'Puzzle Mode (Hard · 9 Squares)'
          : 'Classic Picture Deduction',
      answers,
    };

    setLastRoundResult(result);

    // Save to user career stats and calculate achievements
    const { stats: updatedStats, newAchievements: unlocked } = recordRoundResult(result);
    setUserStats(updatedStats);
    setNewAchievements(unlocked);

    // Submit score to live Leaderboard for this specific mini-game
    submitScoreToLeaderboard(score, accuracy, bestStreakInRound, avgTimeSeconds, gameMode);

    // If new achievements, trigger toast and notification
    if (unlocked.length > 0) {
      sendPushNotification(
        `🏆 Milestone: ${unlocked[0].title}`,
        `${unlocked[0].description} (+${unlocked[0].xpReward} XP)`,
        'achievement'
      );
      setToastMessage({
        title: `Achievement: ${unlocked[0].title}!`,
        body: unlocked[0].description,
      });
      setTimeout(() => setToastMessage(null), 4000);
      refreshUnreadCount();
    }

    setScreenState('SUMMARY');
  }, [answers, score, bestStreakInRound, gameMode, refreshUnreadCount]);

  // Proceed to next question
  const handleNextQuestion = () => {
    playClickSound();

    const nextIdx = currentIndex + 1;
    if (nextIdx >= gameQueue.length) {
      finishRound();
      return;
    }

    setCurrentIndex(nextIdx);
    setIsAnswered(false);
    setUserChoice(null);
    setIsCorrect(null);
    setPointsAwarded(0);
    setQuestionStartTime(Date.now());
  };

  // Exit game to menu
  const handleExitGame = () => {
    playClickSound();
    setScreenState('MENU');
  };

  const handleItemsUpdated = (updated: PictureItem[]) => {
    setItems(updated);
    if (screenState === 'PLAYING') {
      setGameQueue(updated);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Top 3-Zone Navigation */}
      <TopNavigation
        currentTab={activeTab}
        onSelectTab={tab => {
          playClickSound();
          setActiveTab(tab);
          if (tab === 'play') {
            setScreenState('MENU');
          }
        }}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        unreadNotifsCount={unreadNotifs}
        onOpenNotifications={() => setShowNotifModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenDailyChallenge={() => {
          playClickSound();
          setActiveTab('play');
          setScreenState('DAILY');
        }}
        userStats={userStats}
      />

      {/* In-App Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 max-w-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in border border-zinc-700/50">
          <div className="text-xl">🏆</div>
          <div className="text-xs">
            <div className="font-bold">{toastMessage.title}</div>
            <div className="text-zinc-300 dark:text-zinc-600 mt-0.5">{toastMessage.body}</div>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 flex flex-col justify-center py-5 sm:py-8">
        {activeTab === 'play' && (
          <>
            {screenState === 'MENU' && (
              <PackSelector
                items={items}
                onStartGame={handleStartGame}
                onOpenItemEditor={() => setShowItemEditor(true)}
                onOpenDailyChallenge={() => {
                  playClickSound();
                  setScreenState('DAILY');
                }}
                dailyStreak={userStats.dailyStreak}
              />
            )}

            {screenState === 'DAILY' && (
              <DailyChallengeView
                items={items}
                onExit={() => {
                  setScreenState('MENU');
                  setUserStats(getUserStats());
                }}
                dailyStreak={userStats.dailyStreak}
              />
            )}

            {screenState === 'PLAYING' && gameQueue[currentIndex] && (
              <div className="px-3 sm:px-4">
                <GameplayHeader
                  currentIndex={currentIndex}
                  totalQuestions={gameQueue.length}
                  score={score}
                  streak={streak}
                  onExit={handleExitGame}
                  lastPointsEarned={pointsAwarded}
                  gameMode={gameMode}
                />

                <QuestionCard
                  item={gameQueue[currentIndex]}
                  onAnswer={handleAnswerQuestion}
                  onNext={handleNextQuestion}
                  isAnswered={isAnswered}
                  userChoice={userChoice}
                  isCorrect={isCorrect}
                  pointsAwarded={pointsAwarded}
                  onEditCurrentItem={() => setShowItemEditor(true)}
                  gameMode={gameMode}
                />
              </div>
            )}

            {screenState === 'SUMMARY' && lastRoundResult && (
              <RoundSummary
                result={lastRoundResult}
                items={gameQueue}
                newAchievements={newAchievements}
                onPlayAgain={() => handleStartGame(gameMode)}
                onReturnHome={() => {
                  playClickSound();
                  setScreenState('MENU');
                }}
                onOpenShare={() => setShowShareModal(true)}
                onViewLeaderboards={() => {
                  playClickSound();
                  setActiveTab('leaderboards');
                }}
              />
            )}
          </>
        )}

        {activeTab === 'leaderboards' && (
          <LeaderboardView
            onOpenDailyChallenge={() => {
              playClickSound();
              setActiveTab('play');
              setScreenState('DAILY');
            }}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            stats={userStats}
            onSelectPlay={() => {
              playClickSound();
              setActiveTab('play');
              setScreenState('MENU');
            }}
          />
        )}
      </main>

      {/* Footer Navigation Bar (Ergonomic Mobile / Tablet Bottom Tab Navigation) */}
      <footer className="sm:hidden sticky bottom-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800">
        <div className="grid grid-cols-3 h-14 items-center">
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('play');
            }}
            className={`flex flex-col items-center justify-center text-xs font-medium ${
              activeTab === 'play'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            <span>Play</span>
          </button>
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('leaderboards');
            }}
            className={`flex flex-col items-center justify-center text-xs font-medium ${
              activeTab === 'leaderboards'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            <span>Ranks</span>
          </button>
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('stats');
            }}
            className={`flex flex-col items-center justify-center text-xs font-medium ${
              activeTab === 'stats'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            <span>Career</span>
          </button>
        </div>
      </footer>

      {/* Modals */}
      {lastRoundResult && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          result={lastRoundResult}
          username={userStats.username}
        />
      )}

      <NotificationSettingsModal
        isOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        onNotificationsChanged={refreshUnreadCount}
      />

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userStats={userStats}
        onProfileUpdated={updated => setUserStats(updated)}
      />

      <ItemEditorModal
        isOpen={showItemEditor}
        onClose={() => setShowItemEditor(false)}
        items={items}
        onItemsUpdated={handleItemsUpdated}
      />
    </div>
  );
}
