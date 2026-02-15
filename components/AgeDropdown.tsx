
import React, { useState, forwardRef } from 'react';
import { appConfig } from '../config';

interface AgeDropdownProps {
    onSubmit: (age: string) => void;
    minAge?: number; // New: min age prop
    maxAge?: number; // New: max age prop
    language: string; // Add language prop
}

const AgeDropdown = forwardRef<HTMLSelectElement, AgeDropdownProps>(({ onSubmit, minAge = 18, maxAge = 120, language }, ref) => {
    const themeConfig = appConfig.app.theme;
    const [selectedAge, setSelectedAge] = useState<string>('');

    const t = (key: string) => {
        const translations: Record<string, Record<string, string>> = {
            fr: {
                select_age: "Sélectionnez votre âge",
                years: "ans",
                validate: "Valider l'âge"
            },
            en: {
                select_age: "Select your age",
                years: "years",
                validate: "Validate Age"
            }
        };
        return translations[language as 'fr' | 'en']?.[key] || translations['fr'][key];
    };

    const ages: number[] = [];
    for (let i = minAge; i <= maxAge; i++) {
        ages.push(i);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedAge) {
            onSubmit(selectedAge);
            setSelectedAge(''); // Reset after submission
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto animate-fade-in">
            <div className="relative w-full">
                <select
                    value={selectedAge}
                    onChange={(e) => setSelectedAge(e.target.value)}
                    className="w-full px-5 py-4 bg-white/10 border border-white/20 text-white text-lg rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-inner backdrop-blur-md appearance-none cursor-pointer hover:bg-white/15"
                    aria-label={t('select_age')}
                    required
                    ref={ref}
                >
                    <option value="" disabled className="bg-slate-900 text-white/50">{t('select_age')}</option>
                    {ages.map(age => (
                        <option key={age} value={age} className="bg-slate-900 text-white">
                            {age} {t('years')}
                        </option>
                    ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-primary">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>

            <button
                type="submit"
                className="w-full px-7 py-4 bg-brand-primary text-brand-deep text-lg rounded-full hover:bg-brand-primary/90 disabled:bg-white/5 disabled:text-white/10 disabled:cursor-not-allowed transition-all duration-300 font-bold shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:shadow-[0_0_40px_rgba(45,212,191,0.4)] active:scale-95"
                disabled={!selectedAge}
            >
                {t('validate')}
            </button>
        </form>
    );
});

AgeDropdown.displayName = 'AgeDropdown'; // Add display name for forwardRef

export default AgeDropdown;