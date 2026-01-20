
import React, { createContext, useContext, ReactNode } from 'react';
import { translations, Locale, TranslationKey } from '../locales/translations';

interface LocaleContextType {
  locale: Locale;
  t: (key: TranslationKey) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const locale: Locale = 'en';
  
  const t = (key: TranslationKey): string => {
    return translations[locale][key] || key;
  };

  return (
    <LocaleContext.Provider value={{ locale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LocaleProvider');
  }
  return context;
};
