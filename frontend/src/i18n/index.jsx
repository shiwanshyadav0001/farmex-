import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { LANGUAGE_TO_LOCALE, SUPPORTED_LANGUAGES, tr, translateDynamicString, translateOptionValue, getTranslatedLabel } from '@/i18n/translations';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'farmex-language';

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem(STORAGE_KEY) || 'en');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      locale: LANGUAGE_TO_LOCALE[language] || 'en-IN',
      languages: SUPPORTED_LANGUAGES,
      t: (text, vars) => tr(language, text, vars),
      translateOption: (value) => translateOptionValue(value, language),
      translateLabel: (label) => getTranslatedLabel(language, label),
      translateString: (value) => translateDynamicString(value, language),
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within LanguageProvider');
  }
  return context;
}
