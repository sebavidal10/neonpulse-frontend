import { en } from './en';
import { es } from './es';

export type Locale = 'en' | 'es';
type LocaleListener = (locale: Locale) => void;

const LOCALE_STORAGE_KEY = 'neonpulse_locale';
const listeners: Set<LocaleListener> = new Set();

const dictionaries: Record<Locale, Record<string, any>> = {
  en,
  es,
};

function getInitialLocale(): Locale {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      if (stored === 'en' || stored === 'es') {
        return stored;
      }
    }
  } catch {
    // ignore
  }
  return 'en';
}

export const i18n = {
  currentLocale: getInitialLocale(),
  get dictionary() {
    return dictionaries[this.currentLocale] || dictionaries.en;
  },
};

/**
 * Returns the currently active locale code.
 */
export function getLocale(): Locale {
  return i18n.currentLocale;
}

/**
 * Switches the active application locale and notifies subscribers.
 */
export function setLocale(locale: Locale): void {
  if (locale !== 'en' && locale !== 'es') return;
  i18n.currentLocale = locale;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    }
  } catch {
    // ignore
  }

  listeners.forEach((listener) => {
    try {
      listener(locale);
    } catch (err) {
      console.error('[i18n] Error in locale change listener:', err);
    }
  });
}

/**
 * Toggles between 'en' and 'es'.
 */
export function toggleLocale(): Locale {
  const nextLocale: Locale = i18n.currentLocale === 'en' ? 'es' : 'en';
  setLocale(nextLocale);
  return nextLocale;
}

/**
 * Registers a subscriber for locale changes.
 */
export function onLocaleChange(listener: LocaleListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Retrieves a translated string using dot notation with optional param substitution.
 * Example: t('header.welcomeUser', { name: 'Alex' })
 */
export function t(path: string, params?: Record<string, string | number>): string {
  const keys = path.split('.');
  let current: any = i18n.dictionary;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return path;
    }
  }

  if (typeof current !== 'string') {
    return path;
  }

  if (!params) {
    return current;
  }

  return Object.entries(params).reduce((acc, [k, v]) => {
    return acc.replaceAll(`{${k}}`, String(v));
  }, current);
}

export { en, es };
