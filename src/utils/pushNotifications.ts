import { PushNotificationAlert } from '../types/game';

const NOTIF_STORAGE_KEY = 'dichotomy_notifications';
const PREFS_STORAGE_KEY = 'dichotomy_notification_preferences';

export interface NotificationPreferences {
  enabled: boolean;
  dailyChallengeReminders: boolean;
  rankOvertakeAlerts: boolean;
  streakReminders: boolean;
  soundAlerts: boolean;
}

const DEFAULT_PREFS: NotificationPreferences = {
  enabled: true,
  dailyChallengeReminders: true,
  rankOvertakeAlerts: true,
  streakReminders: true,
  soundAlerts: true,
};

const DEFAULT_NOTIFICATIONS: PushNotificationAlert[] = [
  {
    id: 'notif-1',
    title: 'Daily Challenge Ready!',
    body: 'Today\'s 10-question challenge is live. Maintain your daily streak!',
    time: '2h ago',
    read: false,
    type: 'daily',
  },
  {
    id: 'notif-2',
    title: 'Leaderboard Update',
    body: 'CipherQueen reached 14,850 pts on the Global Board. Can you take the #1 spot?',
    time: '4h ago',
    read: false,
    type: 'rank',
  },
  {
    id: 'notif-3',
    title: 'Welcome to Dichotomy!',
    body: 'Determine whether statements are X or Y and climb the ranks.',
    time: '1d ago',
    read: true,
    type: 'achievement',
  },
];

export function getNotificationPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveNotificationPreferences(prefs: NotificationPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore
  }
}

export function getNotifications(): PushNotificationAlert[] {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

export function markAllNotificationsAsRead(): PushNotificationAlert[] {
  const current = getNotifications();
  const updated = current.map(n => ({ ...n, read: true }));
  try {
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
  return updated;
}

export async function requestBrowserNotificationPermission(): Promise<'granted' | 'denied' | 'default'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return 'denied';
  }
}

export function sendPushNotification(title: string, body: string, type: PushNotificationAlert['type'] = 'rank'): PushNotificationAlert {
  const prefs = getNotificationPreferences();
  
  // 1. Try sending real browser notification if supported and granted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && prefs.enabled) {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        silent: !prefs.soundAlerts,
      });
    } catch {
      // Ignore background worker issues
    }
  }

  // 2. Also register in-app notification center item
  const newNotif: PushNotificationAlert = {
    id: `notif-${Date.now()}`,
    title,
    body,
    time: 'Just now',
    read: false,
    type,
  };

  try {
    const current = getNotifications();
    const updated = [newNotif, ...current].slice(0, 20);
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }

  return newNotif;
}
