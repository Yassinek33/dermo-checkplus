import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { translations } from '../data/translations';

export type Language = 'fr' | 'en' | 'nl' | 'es';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => any;
    isLanguageSelected: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('dermo_lang');
        return (saved as Language) || 'fr';
    });
    const [isLanguageSelected, setIsLanguageSelected] = useState<boolean>(() => {
        return !!localStorage.getItem('dermo_lang');
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        setIsLanguageSelected(true);
        localStorage.setItem('dermo_lang', lang);
    };

    // Robust t function with nested key support (e.g., "common.nav.home")
    const t = (key: string): any => {
        const keys = key.split('.');
        let value: any = translations[language];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key} for language: ${language}`);
                return key;
            }
        }

        return value;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, isLanguageSelected }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
