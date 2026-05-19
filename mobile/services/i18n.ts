import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import trCommon from '../locales/tr/common.json';
import trHome from '../locales/tr/home.json';
import enCommon from '../locales/en/common.json';
import enHome from '../locales/en/home.json';
import trMap from '../locales/tr/map.json';
import enMap from '../locales/en/map.json';
import trPlace from '../locales/tr/place.json';
import enPlace from '../locales/en/place.json';
import trQuiz from '../locales/tr/quiz.json';
import enQuiz from '../locales/en/quiz.json';
import trHistory from '../locales/tr/history.json';
import enHistory from '../locales/en/history.json';

export type SupportedLocale = 'tr' | 'en';
export type Namespace = 'common' | 'home' | 'map' | 'place' | 'quiz' | 'history';

type NamespaceData = Record<string, string>;
type LocaleData = Record<Namespace, NamespaceData>;

const localeData: Record<SupportedLocale, LocaleData> = {
  tr: {
    common: trCommon as NamespaceData,
    home: trHome as NamespaceData,
    map: trMap as NamespaceData,
    place: trPlace as NamespaceData,
    quiz: trQuiz as NamespaceData,
    history: trHistory as NamespaceData,
  },
  en: {
    common: enCommon as NamespaceData,
    home: enHome as NamespaceData,
    map: enMap as NamespaceData,
    place: enPlace as NamespaceData,
    quiz: enQuiz as NamespaceData,
    history: enHistory as NamespaceData,
  },
};

const LOCALE_STORAGE_KEY = 'user_locale';

type TranslateFn = (namespace: Namespace, key: string) => string;

interface LocaleContextValue {
  locale: SupportedLocale;
  setLocale: (newLocale: SupportedLocale) => Promise<void>;
  t: TranslateFn;
}

function resolveDeviceLocale(): SupportedLocale {
  const code = Localization.getLocales()[0]?.languageCode ?? 'tr';
  return code === 'en' ? 'en' : 'tr';
}

// Module-level locale used by the standalone t() function
let _currentLocale: SupportedLocale = resolveDeviceLocale();
const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Standalone translation function. Uses the module-level locale.
 * Not reactive — use useLocale() inside components for reactive translations.
 */
export function t(namespace: Namespace, key: string): string {
  return localeData[_currentLocale][namespace][key] ?? key;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(_currentLocale);

  useEffect(() => {
    AsyncStorage.getItem(LOCALE_STORAGE_KEY).then((stored) => {
      if (stored === 'tr' || stored === 'en') {
        _currentLocale = stored;
        setLocaleState(stored);
      }
    });
  }, []);

  const setLocale = useCallback(async (newLocale: SupportedLocale) => {
    _currentLocale = newLocale;
    setLocaleState(newLocale);
    await AsyncStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  }, []);

  const translate = useCallback<TranslateFn>(
    (namespace: Namespace, key: string): string => {
      return localeData[locale][namespace][key] ?? key;
    },
    [locale],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: translate }),
    [locale, setLocale, translate],
  );

  return React.createElement(LocaleContext.Provider, { value }, children);
}

/**
 * Shared reactive locale hook backed by LocaleProvider.
 */
export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }

  return context;
}
