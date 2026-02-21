
import React, { useState, useMemo, forwardRef } from 'react';
import { appConfig } from '../config';

interface CountryDropdownProps {
    onSubmit: (country: string) => void;
    language: string; // Add language prop
}

export const countries = [ // Export the countries list
    // Maghreb
    { name: "Algérie", flag: "🇩🇿", code: "DZ", lang: "fr" },
    { name: "Libye", flag: "🇱🇾", code: "LY", lang: "ar" },
    { name: "Maroc", flag: "🇲🇦", code: "MA", lang: "fr" },
    { name: "Mauritanie", flag: "🇲🇷", code: "MR", lang: "ar" },
    { name: "Tunisie", flag: "🇹🇳", code: "TN", lang: "fr" },

    // North America
    { name: "Canada", flag: "🇨🇦", code: "CA", lang: "en" },
    { name: "États-Unis", flag: "🇺🇸", code: "US", lang: "en" },

    // Europe
    { name: "Albanie", flag: "🇦🇱", code: "AL", lang: "sq" },
    { name: "Allemagne", flag: "🇩🇪", code: "DE", lang: "de" },
    { name: "Andorre", flag: "🇦🇩", code: "AD", lang: "ca" },
    { name: "Autriche", flag: "🇦🇹", code: "AT", lang: "de" },
    { name: "Belgique", flag: "🇧🇪", code: "BE", lang: "fr" },
    { name: "Biélorussie", flag: "🇧🇾", code: "BY", lang: "be" },
    { name: "Bosnie-Herzégovine", flag: "🇧🇦", code: "BA", lang: "bs" },
    { name: "Bulgarie", flag: "🇧🇬", code: "BG", lang: "bg" },
    { name: "Chypre", flag: "🇨🇾", code: "CY", lang: "el" },
    { name: "Croatie", flag: "🇭🇷", code: "HR", lang: "hr" },
    { name: "Danemark", flag: "🇩🇰", code: "DK", lang: "da" },
    { name: "Espagne", flag: "🇪🇸", code: "ES", lang: "es" },
    { name: "Estonie", flag: "🇪🇪", code: "EE", lang: "et" },
    { name: "Finlande", flag: "🇫🇮", code: "FI", lang: "fi" },
    { name: "France", flag: "🇫🇷", code: "FR", lang: "fr" },
    { name: "Grèce", flag: "🇬🇷", code: "GR", lang: "el" },
    { name: "Hongrie", flag: "🇭🇺", code: "HU", lang: "hu" },
    { name: "Irlande", flag: "🇮🇪", code: "IE", lang: "en" },
    { name: "Islande", flag: "🇮🇸", code: "IS", lang: "is" },
    { name: "Italie", flag: "🇮🇹", code: "IT", lang: "it" },
    { name: "Lettonie", flag: "🇱🇻", code: "LV", lang: "lv" },
    { name: "Liechtenstein", flag: "🇱🇮", code: "LI", lang: "de" },
    { name: "Lituanie", flag: "🇱🇹", code: "LT", lang: "lt" },
    { name: "Luxembourg", flag: "🇱🇺", code: "LU", lang: "fr" },
    { name: "Malte", flag: "🇲🇹", code: "MT", lang: "en" },
    { name: "Moldavie", flag: "🇲🇩", code: "MD", lang: "ro" },
    { name: "Monaco", flag: "🇲🇨", code: "MC", lang: "fr" },
    { name: "Monténégro", flag: "🇲🇪", code: "ME", lang: "sr" },
    { name: "Norvège", flag: "🇳🇴", code: "NO", lang: "no" },
    { name: "Pays-Bas", flag: "🇳🇱", code: "NL", lang: "nl" },
    { name: "Pologne", flag: "🇵🇱", code: "PL", lang: "pl" },
    { name: "Portugal", flag: "🇵🇹", code: "PT", lang: "pt" },
    { name: "Rép. Tchèque", flag: "🇨🇿", code: "CZ", lang: "cs" },
    { name: "Roumanie", flag: "🇷🇴", code: "RO", lang: "ro" },
    { name: "Royaume-Uni", flag: "🇬🇧", code: "GB", lang: "en" },
    { name: "Russie", flag: "🇷🇺", code: "RU", lang: "ru" },
    { name: "Saint-Marin", flag: "🇸🇲", code: "SM", lang: "it" },
    { name: "Serbie", flag: "🇷🇸", code: "RS", lang: "sr" },
    { name: "Slovaquie", flag: "🇸🇰", code: "SK", lang: "sk" },
    { name: "Slovénie", flag: "🇸🇮", code: "SI", lang: "sl" },
    { name: "Suède", flag: "🇸🇪", code: "SE", lang: "sv" },
    { name: "Suisse", flag: "🇨🇭", code: "CH", lang: "fr" },
    { name: "Ukraine", flag: "🇺🇦", code: "UA", lang: "uk" },
    { name: "Vatican", flag: "🇻🇦", code: "VA", lang: "it" },
];

export const sortedCountries = countries.sort((a, b) => a.name.localeCompare(b.name));



const CountryDropdown = forwardRef<HTMLSelectElement, CountryDropdownProps>(({ onSubmit, language }, ref) => {
    const themeConfig = appConfig.app.theme;
    const [selectedCountry, setSelectedCountry] = useState<string>('');

    const t = (key: string) => {
        const translations: Record<string, Record<string, string>> = {
            fr: {
                select_country: "Sélectionnez votre pays",
                validate: "Valider le pays"
            },
            en: {
                select_country: "Select your country",
                validate: "Validate Country"
            },
            nl: {
                select_country: "Selecteer uw land",
                validate: "Land valideren"
            },
            es: {
                select_country: "Seleccione su país",
                validate: "Validar país"
            }
        };
        return translations[language as 'fr' | 'en' | 'nl' | 'es']?.[key] || translations['fr'][key];
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCountry) {
            onSubmit(selectedCountry);
            // Optionally reset after submission if desired, but usually, we move to next question
            // setSelectedCountry(''); 
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto animate-fade-in">
            <div className="relative w-full">
                <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-5 py-4 bg-white/10 border border-white/20 text-white text-lg rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-inner backdrop-blur-md appearance-none cursor-pointer hover:bg-white/15"
                    aria-label={t('select_country')}
                    required
                    ref={ref}
                >
                    <option value="" disabled className="bg-slate-900 text-white/50">{t('select_country')}</option>
                    {sortedCountries.map((country) => (
                        <option key={country.name} value={country.name} className="bg-slate-900 text-white">
                            {country.flag} {country.name}
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
                disabled={!selectedCountry}
            >
                {t('validate')}
            </button>
        </form>
    );
});

CountryDropdown.displayName = 'CountryDropdown';

export default CountryDropdown;