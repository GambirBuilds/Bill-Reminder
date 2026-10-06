import { DEMO_BILLS, DEMO_PAYMENT_HISTORY, INITIAL_BUDGET } from '../data/demoBills';

const STORAGE_KEY = 'billReminderData';
const THEME_KEY = 'billReminderTheme';

export const DEFAULT_INITIAL_STATE = {
  bills: DEMO_BILLS,
  paymentHistory: DEMO_PAYMENT_HISTORY,
  settings: {
    budget: INITIAL_BUDGET,
    reminderDays: 3, // default 3 days before
    notificationsEnabled: false,
    currency: 'Rs.',
  },
  initialized: true,
};

/**
 * Safely loads data from localStorage with full fallback and corruption resilience
 */
export function loadData() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return DEFAULT_INITIAL_STATE;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First time launch: save demo data and return
      saveData(DEFAULT_INITIAL_STATE);
      return DEFAULT_INITIAL_STATE;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.bills)) {
      console.warn('Corrupted data detected in localStorage. Restoring initial dataset.');
      saveData(DEFAULT_INITIAL_STATE);
      return DEFAULT_INITIAL_STATE;
    }

    return {
      bills: parsed.bills || [],
      paymentHistory: parsed.paymentHistory || [],
      settings: {
        budget: parsed.settings?.budget ?? INITIAL_BUDGET,
        reminderDays: parsed.settings?.reminderDays ?? 3,
        notificationsEnabled: parsed.settings?.notificationsEnabled ?? false,
        currency: parsed.settings?.currency ?? 'Rs.',
      },
      initialized: true,
    };
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    return DEFAULT_INITIAL_STATE;
  }
}

/**
 * Safely saves data to localStorage
 */
export function saveData(data) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
    return false;
  }
}

/**
 * Clears demo/all data for starting a clean account
 */
export function clearAllData() {
  const cleanState = {
    bills: [],
    paymentHistory: [],
    settings: {
      budget: INITIAL_BUDGET,
      reminderDays: 3,
      notificationsEnabled: false,
      currency: 'Rs.',
    },
    initialized: true,
  };
  saveData(cleanState);
  return cleanState;
}

/**
 * Resets back to demo dataset
 */
export function resetToDemoData() {
  saveData(DEFAULT_INITIAL_STATE);
  return DEFAULT_INITIAL_STATE;
}

/**
 * Theme storage helper
 */
export function loadTheme() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return 'dark';
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    // Default to dark mode as suggested in design instructions (#0B0F14)
    return 'dark';
  } catch {
    return 'dark';
  }
}

export function saveTheme(theme) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(THEME_KEY, theme);
    }
  } catch (error) {
    console.error('Error saving theme:', error);
  }
}
