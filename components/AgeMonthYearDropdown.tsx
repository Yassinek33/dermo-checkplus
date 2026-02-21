
import React, { useState, useMemo, forwardRef, Ref } from 'react';
import { appConfig } from '../config';

interface AgeMonthYearDropdownProps {
    onSubmit: (ageString: string) => void;
    monthsRef?: Ref<HTMLSelectElement>; // New ref prop for months dropdown
    yearsRef?: Ref<HTMLSelectElement>; // New ref prop for years dropdown
    language: string; // Add language prop
}

const AgeMonthYearDropdown: React.FC<AgeMonthYearDropdownProps> = ({ onSubmit, monthsRef, yearsRef, language }) => {
    const themeConfig = appConfig.app.theme;
    const [selectedMonths, setSelectedMonths] = useState<string>('');
    const [selectedYears, setSelectedYears] = useState<string>('');

    const t = (key: string) => {
        const translations: Record<string, Record<string, string>> = {
            fr: {
                months: "Mois",
                years: "Années",
                validate: "Valider l'âge",
                less_than_1: "Moins de 1 mois",
                month_suffix: "mois",
                year_suffix: "ans"
            },
            en: {
                months: "Months",
                years: "Years",
                validate: "Validate Age",
                less_than_1: "Less than 1 month",
                month_suffix: "months",
                year_suffix: "years"
            },
            nl: {
                months: "Maanden",
                years: "Jaren",
                validate: "Leeftijd valideren",
                less_than_1: "Minder dan 1 maand",
                month_suffix: "maanden",
                year_suffix: "jaar"
            },
            es: {
                months: "Meses",
                years: "Años",
                validate: "Validar edad",
                less_than_1: "Menos de 1 mes",
                month_suffix: "meses",
                year_suffix: "años"
            }
        };
        return translations[language as 'fr' | 'en' | 'nl' | 'es']?.[key] || translations['fr'][key];
    };

    const months: { label: string; value: string }[] = useMemo(() => {
        const list = [{ label: t('less_than_1'), value: "0" }];
        for (let i = 1; i <= 11; i++) {
            list.push({ label: `${i} ${t('month_suffix')}`, value: i.toString() });
        }
        return list;
    }, [language]); // Re-memoize on language change

    const years: { label: string; value: string }[] = useMemo(() => {
        const list = [];
        // Start from 0 years to allow for cases like "3 mois" without any years, but still valid.
        list.push({ label: `0 ${t('year_suffix')}`, value: "0" });
        for (let i = 1; i <= 120; i++) {
            list.push({ label: `${i} ${t('year_suffix')}`, value: i.toString() });
        }
        return list;
    }, [language]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let ageString = '';
        const yearsValue = parseInt(selectedYears, 10);
        const monthsValue = parseInt(selectedMonths, 10);

        if (yearsValue > 0) {
            ageString += `${yearsValue} ${t('year_suffix')}`; // Use standard suffix "ans" or "years"
        }
        if (monthsValue > 0) {
            if (ageString) ageString += language === 'en' ? ' and ' : ' et ';
            ageString += `${monthsValue} ${t('month_suffix')}`;
        } else if (monthsValue === 0 && yearsValue === 0) {
            // For "Moins de 1 mois", verify selectedMonths is indeed "0"
            if (selectedMonths === "0") {
                ageString = t('less_than_1');
            }
        }

        if (ageString) {
            onSubmit(ageString);
            setSelectedMonths('');
            setSelectedYears('');
        }
    };

    const isSubmitDisabled = !selectedMonths && !selectedYears;
    // Allow submission if "Moins de 1 mois" is selected alone (value "0" for months)
    const isActuallyDisabled = isSubmitDisabled && !(selectedMonths === "0" && !selectedYears);

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div className="relative flex-1">
                    <select
                        value={selectedMonths}
                        onChange={(e) => setSelectedMonths(e.target.value)}
                        className="w-full px-5 py-4 bg-white/10 border border-white/20 text-white text-lg rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-inner backdrop-blur-md appearance-none cursor-pointer hover:bg-white/15"
                        aria-label={t('months')}
                        ref={monthsRef}
                    >
                        <option value="" disabled className="bg-slate-900 text-white/50">{t('months')}</option>
                        {months.map(month => (
                            <option key={month.value} value={month.value} className="bg-slate-900 text-white">
                                {month.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-primary">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>

                <div className="relative flex-1">
                    <select
                        value={selectedYears}
                        onChange={(e) => setSelectedYears(e.target.value)}
                        className="w-full px-5 py-4 bg-white/10 border border-white/20 text-white text-lg rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-inner backdrop-blur-md appearance-none cursor-pointer hover:bg-white/15"
                        aria-label={t('years')}
                        ref={yearsRef}
                    >
                        <option value="" disabled className="bg-slate-900 text-white/50">{t('years')}</option>
                        {years.map(year => (
                            <option key={year.value} value={year.value} className="bg-slate-900 text-white">
                                {year.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-primary">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
            </div>
            <button
                type="submit"
                className="w-full px-7 py-4 bg-brand-primary text-brand-deep text-lg rounded-full hover:bg-brand-primary/90 disabled:bg-white/5 disabled:text-white/10 disabled:cursor-not-allowed transition-all duration-300 font-bold shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:shadow-[0_0_40px_rgba(45,212,191,0.4)] active:scale-95"
                disabled={isActuallyDisabled}
            >
                {t('validate')}
            </button>
        </form>
    );
};

export default AgeMonthYearDropdown;