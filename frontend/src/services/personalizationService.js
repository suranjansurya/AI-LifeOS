/**
 * AI LifeOS — AI Personalization & Adaptive Experience Service
 * Manages user UI theme, AI response styles, home layout configurations,
 * accessibility options, and privacy toggles.
 */

const PERSONALIZATION_KEY = 'ai_lifeos_personalization_v3';

export const defaultPersonalization = {
  theme: 'dark', // 'dark' | 'light' | 'system'
  aiResponseStyle: 'Balanced', // 'Concise' | 'Balanced' | 'Detailed'
  aiTone: 'Professional', // 'Professional' | 'Friendly' | 'Minimal'
  aiCoreAnimationIntensity: 'Normal', // 'Low' | 'Normal' | 'High'
  adaptiveExperienceEnabled: true,
  useMemoryInAi: true,
  usePreferencesInAi: true,
  reducedMotion: false,
  highContrast: false,
  homeSections: [
    { id: 'overview', title: 'Life Overview Indicators', visible: true },
    { id: 'timeline', title: 'Today Intelligence Timeline', visible: true },
    { id: 'next_action', title: 'Next Best Action Card', visible: true },
    { id: 'focus_timer', title: 'Compact Focus Timer Widget', visible: true },
    { id: 'up_next', title: 'Up Next Tasks Queue', visible: true }
  ]
};

export const personalizationService = {
  getSettings: () => {
    try {
      const raw = localStorage.getItem(PERSONALIZATION_KEY);
      if (!raw) return defaultPersonalization;
      return { ...defaultPersonalization, ...JSON.parse(raw) };
    } catch (e) {
      return defaultPersonalization;
    }
  },

  saveSettings: (settings) => {
    try {
      localStorage.setItem(PERSONALIZATION_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving personalization settings:', e);
    }
  },

  resetSettings: () => {
    try {
      localStorage.setItem(PERSONALIZATION_KEY, JSON.stringify(defaultPersonalization));
    } catch (e) {
      console.error('Error resetting personalization settings:', e);
    }
    return defaultPersonalization;
  }
};
