import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { translations } from '../data/translations';

export type Language = 'fr' | 'en' | 'nl' | 'es';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    /** Update language state from URL without persisting to localStorage */
    syncLanguageFromUrl: (lang: Language) => void;
    t: (key: string) => any;
    isLanguageSelected: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const VALID_LANGS: Language[] = ['fr', 'en', 'nl', 'es'];

function getLangFromUrl(): Language | null {
    const seg = window.location.pathname.split('/').filter(Boolean)[0] as Language;
    return VALID_LANGS.includes(seg) ? seg : null;
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        // URL prefix takes priority over localStorage
        const urlLang = getLangFromUrl();
        if (urlLang) return urlLang;
        const saved = localStorage.getItem('dermo_lang');
        if (saved && VALID_LANGS.includes(saved as Language)) return saved as Language;
        // Bare root "/" → English
        return 'en';
    });
    const [isLanguageSelected, setIsLanguageSelected] = useState<boolean>(() => {
        return !!(getLangFromUrl() || localStorage.getItem('dermo_lang'));
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        setIsLanguageSelected(true);
        localStorage.setItem('dermo_lang', lang);
    };

    /** Sync language from URL without persisting to localStorage.
     *  Sets isLanguageSelected = true when on a /{lang}/ route. */
    const syncLanguageFromUrl = (lang: Language) => {
        setLanguageState(lang);
        // If URL has an explicit lang prefix, mark language as selected
        const urlLang = getLangFromUrl();
        if (urlLang) setIsLanguageSelected(true);
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
        <LanguageContext.Provider value={{ language, setLanguage, syncLanguageFromUrl, t, isLanguageSelected }}>
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
