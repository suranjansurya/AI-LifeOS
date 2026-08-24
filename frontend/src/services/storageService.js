import {
  initialProfile,
  initialNextBestAction,
  initialTasksList,
  initialGoalsList,
  initialNotesList,
  initialNotificationsList,
  initialChatMessages
} from '../data/mockData';

const KEYS = {
  TASKS: 'ai_lifeos_tasks_v2',
  GOALS: 'ai_lifeos_goals_v2',
  NOTES: 'ai_lifeos_notes_v2',
  FOCUS_SESSIONS: 'ai_lifeos_focus_v2',
  NOTIFICATIONS: 'ai_lifeos_notifications_v2',
  PROFILE: 'ai_lifeos_profile_v2',
  CHAT: 'ai_lifeos_chat_v2'
};

// Safe JSON parser helper to prevent app crash on corrupted localStorage
const safeGet = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.warn(`[storageService] Error parsing key "${key}" from localStorage:`, err);
    return fallback;
  }
};

const safeSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[storageService] Error writing key "${key}" to localStorage:`, err);
  }
};

export const storageService = {
  // Profile
  getProfile: () => safeGet(KEYS.PROFILE, initialProfile),
  saveProfile: (profile) => safeSet(KEYS.PROFILE, profile),

  // Tasks
  getTasks: () => safeGet(KEYS.TASKS, initialTasksList),
  saveTasks: (tasks) => safeSet(KEYS.TASKS, tasks),

  // Goals
  getGoals: () => safeGet(KEYS.GOALS, initialGoalsList),
  saveGoals: (goals) => safeSet(KEYS.GOALS, goals),

  // Notes
  getNotes: () => safeGet(KEYS.NOTES, initialNotesList),
  saveNotes: (notes) => safeSet(KEYS.NOTES, notes),

  // Focus Sessions
  getFocusSessions: () => safeGet(KEYS.FOCUS_SESSIONS, [
    {
      id: 'fs-1',
      taskId: 'task-4',
      taskTitle: 'Review System Design - Scalable Caching Strategies',
      durationMinutes: 40,
      completedAt: new Date(Date.now() - 86400000).toISOString(),
      distractionsLogged: 0
    }
  ]),
  saveFocusSessions: (sessions) => safeSet(KEYS.FOCUS_SESSIONS, sessions),

  // Notifications
  getNotifications: () => safeGet(KEYS.NOTIFICATIONS, initialNotificationsList),
  saveNotifications: (notifications) => safeSet(KEYS.NOTIFICATIONS, notifications),

  // Chat Messages
  getChatHistory: () => safeGet(KEYS.CHAT, initialChatMessages),
  saveChatHistory: (messages) => safeSet(KEYS.CHAT, messages),

  // Reset Storage
  clearAll: () => {
    try {
      Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
  }
};
