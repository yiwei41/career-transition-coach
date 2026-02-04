import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentLanguage, setLanguage as setStoredLanguage, translations, Language, Translations } from './locales';

function getT(): Translations {
  return translations[getCurrentLanguage()];
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const defaultT = translations.en;
const defaultContext: LanguageContextValue = {
  language: 'en',
  setLanguage: () => {},
  t: defaultT,
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getCurrentLanguage);
  const [t, setT] = useState<Translations>(getT);

  const setLanguage = useCallback((lang: Language) => {
    setStoredLanguage(lang);
    setLanguageState(lang);
    setT(translations[lang]);
  }, []);

  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguageState(getCurrentLanguage());
      setT(getT());
    };
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  const value = React.useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      <React.Fragment key={language}>
        {children}
      </React.Fragment>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  return ctx ?? defaultContext;
};
