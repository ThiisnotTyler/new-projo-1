import React, { useState } from 'react';
import { X, Bell, Check, Send, AlertTriangle, ShieldCheck, Trophy, Flame } from 'lucide-react';
import { PushNotificationAlert } from '../types/game';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  requestBrowserNotificationPermission,
  sendPushNotification,
  getNotifications,
  markAllNotificationsAsRead,
  NotificationPreferences,
} from '../utils/pushNotifications';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationsChanged: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  onNotificationsChanged,
}) => {
  const [prefs, setPrefs] = useState<NotificationPreferences>(getNotificationPreferences());
  const [notifications, setNotifications] = useState<PushNotificationAlert[]>(getNotifications());
  const [permissionState, setPermissionState] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [testSentMessage, setTestSentMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await requestBrowserNotificationPermission();
    setPermissionState(res);
    if (res === 'granted') {
      sendPushNotification('🔔 Notifications Enabled!', 'You will receive real-time rank updates and daily challenges.', 'daily');
      setNotifications(getNotifications());
      onNotificationsChanged();
    }
  };

  const handleTogglePref = (key: keyof NotificationPreferences) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    saveNotificationPreferences(updated);
  };

  const handleSendTestPush = () => {
    const sampleAlerts = [
      { title: '⚡ Rank Overtake Alert!', body: 'Rival Elena_Rostova just scored 10,250 on "Real vs Satire" and climbed to #2!' },
      { title: '🔥 Streak in Danger!', body: 'Your 5-day guessing streak expires in 2 hours. Complete today\'s Daily Challenge!' },
      { title: '🏆 Global Tournament Live', body: 'The weekend leaderboard contest has commenced. Claim your top 10 badge!' },
    ];
    const picked = sampleAlerts[Math.floor(Math.random() * sampleAlerts.length)];
    const notif = sendPushNotification(picked.title, picked.body, 'rank');
    setNotifications(getNotifications());
    onNotificationsChanged();
    setTestSentMessage('Test push notification dispatched!');
    setTimeout(() => setTestSentMessage(null), 3000);
  };

  const handleClearRead = () => {
    const updated = markAllNotificationsAsRead();
    setNotifications(updated);
    onNotificationsChanged();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-zinc-950 dark:text-zinc-50">
              Push Notification Center
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Stay ahead of rivals with real-time updates
            </p>
          </div>
        </div>

        {/* Browser Permission Banner */}
        <div className="mb-5 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              Browser Push Status:
            </span>
            <span
              className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                permissionState === 'granted'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : permissionState === 'denied'
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}
            >
              {permissionState.toUpperCase()}
            </span>
          </div>

          {permissionState !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="w-full h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Enable Browser Push Notifications</span>
            </button>
          )}

          {permissionState === 'granted' && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
              <Check className="w-3.5 h-3.5" />
              <span>Native push notifications active on this device</span>
            </div>
          )}
        </div>

        {/* Preferences Toggles */}
        <div className="space-y-3 mb-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Notification Preferences
          </div>

          <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer">
            <div className="text-xs">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                Rank Overtake Alerts
              </div>
              <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                Notify when friends or competitors pass your score
              </div>
            </div>
            <input
              type="checkbox"
              checked={prefs.rankOvertakeAlerts}
              onChange={() => handleTogglePref('rankOvertakeAlerts')}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer">
            <div className="text-xs">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                Daily Challenge Reminders
              </div>
              <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                Alert when the new daily gauntlet resets
              </div>
            </div>
            <input
              type="checkbox"
              checked={prefs.dailyChallengeReminders}
              onChange={() => handleTogglePref('dailyChallengeReminders')}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer">
            <div className="text-xs">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                Streak Loss Warnings
              </div>
              <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                Prevent breaking your daily answer streak
              </div>
            </div>
            <input
              type="checkbox"
              checked={prefs.streakReminders}
              onChange={() => handleTogglePref('streakReminders')}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </label>
        </div>

        {/* Trigger Test Notification Button */}
        <div className="mb-5">
          <button
            onClick={handleSendTestPush}
            className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-750 transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-indigo-500" />
            <span>Send Immediate Test Push Notification</span>
          </button>
          {testSentMessage && (
            <div className="text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1.5">
              {testSentMessage}
            </div>
          )}
        </div>

        {/* Notification Feed History */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              Recent Alerts ({notifications.length})
            </span>
            <button
              onClick={handleClearRead}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              Mark all as read
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`p-2.5 rounded-lg border text-xs transition-colors ${
                  n.read
                    ? 'bg-zinc-50/50 dark:bg-zinc-850/40 border-zinc-200/50 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                    : 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 text-zinc-900 dark:text-zinc-100 font-medium'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-semibold text-[11px]">{n.title}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">{n.time}</span>
                </div>
                <p className="text-[11px] opacity-90">{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
