/**
 * Localization — mirrors lib/util/messages.dart and assets/language/{en,ar,bn,es}.json
 * from the Flutter V4.0 source. All four language tables are bundled; the active
 * language is persisted to AsyncStorage.
 *
 * RTL languages (Arabic) automatically switch layout direction via useDocumentDirection effect.
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppConstants } from '@/constants/app_constants';

// Import all four V4.0 language tables directly. `resolveJsonModule` is enabled in
// tsconfig.json so JSON imports produce typed objects.
import en from '@assets/languages/en.json';
import ar from '@assets/languages/ar.json';
import bn from '@assets/languages/bn.json';
import es from '@assets/languages/es.json';

export type LanguageCode = 'en' | 'ar' | 'es' | 'bn';

type Messages = Record<string, string>;

const TABLES: Record<LanguageCode, Messages> = {
  en: en as Messages,
  ar: ar as Messages,
  es: es as Messages,
  bn: bn as Messages,
};

/** Languages exposed in the Language picker — mirrors AppConstants.languages in Flutter. */
export const SUPPORTED_LANGUAGES: {
  code: LanguageCode;
  name: string;
  countryCode: string;
  rtl: boolean;
}[] = [
  { code: 'en', name: 'English', countryCode: 'US', rtl: false },
  { code: 'ar', name: 'Arabic', countryCode: 'SA', rtl: true },
  { code: 'es', name: 'Spanish', countryCode: 'ES', rtl: false },
  { code: 'bn', name: 'Bengali', countryCode: 'BN', rtl: false },
];

export interface LocalizationContextValue {
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
  rtl: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocalizationContext = createContext<LocalizationContextValue | undefined>(undefined);

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>('en');

  // Load saved language on mount
  useEffect(() => {
    AsyncStorage.getItem(AppConstants.languageCodeKey).then((saved) => {
      if (saved === 'en' || saved === 'ar' || saved === 'es' || saved === 'bn') {
        setLangState(saved);
      }
    });
  }, []);

  // Sync layout direction with selected language
  useEffect(() => {
    const meta = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
    const isRtl = !!meta?.rtl;
    if (I18nManager.isRTL !== isRtl) {
      I18nManager.forceRTL(isRtl);
      // Note: in a real app, you'd reload the app here for RTL to take full effect.
    }
  }, [lang]);

  const setLang = (l: LanguageCode) => {
    setLangState(l);
    AsyncStorage.setItem(AppConstants.languageCodeKey, l).catch(() => {});
  };

  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>) => {
      const table = TABLES[lang] ?? TABLES.en;
      let str = table[key] ?? TABLES.en[key] ?? key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
      }
      return str;
    };
  }, [lang]);

  const meta = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
  const value: LocalizationContextValue = { lang, setLang, rtl: !!meta?.rtl, t };

  return (
    <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LocalizationContext);
  if (!ctx) {
    throw new Error('useTranslation must be used inside LocalizationProvider');
  }
  return ctx;
}
