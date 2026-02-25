
import React, { useState, useMemo, forwardRef } from 'react';
import { appConfig } from '../config';

interface CountryDropdownProps {
    onSubmit: (country: string) => void;
    language: string; // Add language prop
}

export type SupportedLanguage = 'fr' | 'en' | 'nl' | 'es';

export const countries = [
    // Maghreb
    { name: "Algérie", translations: { fr: "Algérie", en: "Algeria", nl: "Algerije", es: "Argelia" }, flag: "🇩🇿", code: "DZ", lang: "fr" },
    { name: "Libye", translations: { fr: "Libye", en: "Libya", nl: "Libië", es: "Libia" }, flag: "🇱🇾", code: "LY", lang: "ar" },
    { name: "Maroc", translations: { fr: "Maroc", en: "Morocco", nl: "Marokko", es: "Marruecos" }, flag: "🇲🇦", code: "MA", lang: "fr" },
    { name: "Mauritanie", translations: { fr: "Mauritanie", en: "Mauritania", nl: "Mauritanië", es: "Mauritania" }, flag: "🇲🇷", code: "MR", lang: "ar" },
    { name: "Tunisie", translations: { fr: "Tunisie", en: "Tunisia", nl: "Tunesië", es: "Túnez" }, flag: "🇹🇳", code: "TN", lang: "fr" },

    // North America
    { name: "Canada", translations: { fr: "Canada", en: "Canada", nl: "Canada", es: "Canadá" }, flag: "🇨🇦", code: "CA", lang: "en" },
    { name: "États-Unis", translations: { fr: "États-Unis", en: "United States", nl: "Verenigde Staten", es: "Estados Unidos" }, flag: "🇺🇸", code: "US", lang: "en" },

    // Europe
    { name: "Albanie", translations: { fr: "Albanie", en: "Albania", nl: "Albanië", es: "Albania" }, flag: "🇦🇱", code: "AL", lang: "sq" },
    { name: "Allemagne", translations: { fr: "Allemagne", en: "Germany", nl: "Duitsland", es: "Alemania" }, flag: "🇩🇪", code: "DE", lang: "de" },
    { name: "Andorre", translations: { fr: "Andorre", en: "Andorra", nl: "Andorra", es: "Andorra" }, flag: "🇦🇩", code: "AD", lang: "ca" },
    { name: "Autriche", translations: { fr: "Autriche", en: "Austria", nl: "Oostenrijk", es: "Austria" }, flag: "🇦🇹", code: "AT", lang: "de" },
    { name: "Belgique", translations: { fr: "Belgique", en: "Belgium", nl: "België", es: "Bélgica" }, flag: "🇧🇪", code: "BE", lang: "fr" },
    { name: "Biélorussie", translations: { fr: "Biélorussie", en: "Belarus", nl: "Wit-Rusland", es: "Bielorrusia" }, flag: "🇧🇾", code: "BY", lang: "be" },
    { name: "Bosnie-Herzégovine", translations: { fr: "Bosnie-Herzégovine", en: "Bosnia & Herzegovina", nl: "Bosnië en Herzegovina", es: "Bosnia y Herzegovina" }, flag: "🇧🇦", code: "BA", lang: "bs" },
    { name: "Bulgarie", translations: { fr: "Bulgarie", en: "Bulgaria", nl: "Bulgarije", es: "Bulgaria" }, flag: "🇧🇬", code: "BG", lang: "bg" },
    { name: "Chypre", translations: { fr: "Chypre", en: "Cyprus", nl: "Cyprus", es: "Chipre" }, flag: "🇨🇾", code: "CY", lang: "el" },
    { name: "Croatie", translations: { fr: "Croatie", en: "Croatia", nl: "Kroatië", es: "Croacia" }, flag: "🇭🇷", code: "HR", lang: "hr" },
    { name: "Danemark", translations: { fr: "Danemark", en: "Denmark", nl: "Denemarken", es: "Dinamarca" }, flag: "🇩🇰", code: "DK", lang: "da" },
    { name: "Espagne", translations: { fr: "Espagne", en: "Spain", nl: "Spanje", es: "España" }, flag: "🇪🇸", code: "ES", lang: "es" },
    { name: "Estonie", translations: { fr: "Estonie", en: "Estonia", nl: "Estland", es: "Estonia" }, flag: "🇪🇪", code: "EE", lang: "et" },
    { name: "Finlande", translations: { fr: "Finlande", en: "Finland", nl: "Finland", es: "Finlandia" }, flag: "🇫🇮", code: "FI", lang: "fi" },
    { name: "France", translations: { fr: "France", en: "France", nl: "Frankrijk", es: "Francia" }, flag: "🇫🇷", code: "FR", lang: "fr" },
    { name: "Grèce", translations: { fr: "Grèce", en: "Greece", nl: "Griekenland", es: "Grecia" }, flag: "🇬🇷", code: "GR", lang: "el" },
    { name: "Hongrie", translations: { fr: "Hongrie", en: "Hungary", nl: "Hongarije", es: "Hungría" }, flag: "🇭🇺", code: "HU", lang: "hu" },
    { name: "Irlande", translations: { fr: "Irlande", en: "Ireland", nl: "Ierland", es: "Irlanda" }, flag: "🇮🇪", code: "IE", lang: "en" },
    { name: "Islande", translations: { fr: "Islande", en: "Iceland", nl: "IJsland", es: "Islandia" }, flag: "🇮🇸", code: "IS", lang: "is" },
    { name: "Italie", translations: { fr: "Italie", en: "Italy", nl: "Italië", es: "Italia" }, flag: "🇮🇹", code: "IT", lang: "it" },
    { name: "Lettonie", translations: { fr: "Lettonie", en: "Latvia", nl: "Letland", es: "Letonia" }, flag: "🇱🇻", code: "LV", lang: "lv" },
    { name: "Liechtenstein", translations: { fr: "Liechtenstein", en: "Liechtenstein", nl: "Liechtenstein", es: "Liechtenstein" }, flag: "🇱🇮", code: "LI", lang: "de" },
    { name: "Lituanie", translations: { fr: "Lituanie", en: "Lithuania", nl: "Litouwen", es: "Lituania" }, flag: "🇱🇹", code: "LT", lang: "lt" },
    { name: "Luxembourg", translations: { fr: "Luxembourg", en: "Luxembourg", nl: "Luxemburg", es: "Luxemburgo" }, flag: "🇱🇺", code: "LU", lang: "fr" },
    { name: "Malte", translations: { fr: "Malte", en: "Malta", nl: "Malta", es: "Malta" }, flag: "🇲🇹", code: "MT", lang: "en" },
    { name: "Moldavie", translations: { fr: "Moldavie", en: "Moldova", nl: "Moldavië", es: "Moldavia" }, flag: "🇲🇩", code: "MD", lang: "ro" },
    { name: "Monaco", translations: { fr: "Monaco", en: "Monaco", nl: "Monaco", es: "Mónaco" }, flag: "🇲🇨", code: "MC", lang: "fr" },
    { name: "Monténégro", translations: { fr: "Monténégro", en: "Montenegro", nl: "Montenegro", es: "Montenegro" }, flag: "🇲🇪", code: "ME", lang: "sr" },
    { name: "Norvège", translations: { fr: "Norvège", en: "Norway", nl: "Noorwegen", es: "Noruega" }, flag: "🇳🇴", code: "NO", lang: "no" },
    { name: "Pays-Bas", translations: { fr: "Pays-Bas", en: "Netherlands", nl: "Nederland", es: "Países Bajos" }, flag: "🇳🇱", code: "NL", lang: "nl" },
    { name: "Pologne", translations: { fr: "Pologne", en: "Poland", nl: "Polen", es: "Polonia" }, flag: "🇵🇱", code: "PL", lang: "pl" },
    { name: "Portugal", translations: { fr: "Portugal", en: "Portugal", nl: "Portugal", es: "Portugal" }, flag: "🇵🇹", code: "PT", lang: "pt" },
    { name: "Rép. Tchèque", translations: { fr: "Rép. Tchèque", en: "Czech Republic", nl: "Tsjechië", es: "República Checa" }, flag: "🇨🇿", code: "CZ", lang: "cs" },
    { name: "Roumanie", translations: { fr: "Roumanie", en: "Romania", nl: "Roemenië", es: "Rumania" }, flag: "🇷🇴", code: "RO", lang: "ro" },
    { name: "Royaume-Uni", translations: { fr: "Royaume-Uni", en: "United Kingdom", nl: "Verenigd Koninkrijk", es: "Reino Unido" }, flag: "🇬🇧", code: "GB", lang: "en" },
    { name: "Russie", translations: { fr: "Russie", en: "Russia", nl: "Rusland", es: "Rusia" }, flag: "🇷🇺", code: "RU", lang: "ru" },
    { name: "Saint-Marin", translations: { fr: "Saint-Marin", en: "San Marino", nl: "San Marino", es: "San Marino" }, flag: "🇸🇲", code: "SM", lang: "it" },
    { name: "Serbie", translations: { fr: "Serbie", en: "Serbia", nl: "Servië", es: "Serbia" }, flag: "🇷🇸", code: "RS", lang: "sr" },
    { name: "Slovaquie", translations: { fr: "Slovaquie", en: "Slovakia", nl: "Slowakije", es: "Eslovaquia" }, flag: "🇸🇰", code: "SK", lang: "sk" },
    { name: "Slovénie", translations: { fr: "Slovénie", en: "Slovenia", nl: "Slovenië", es: "Eslovenia" }, flag: "🇸🇮", code: "SI", lang: "sl" },
    { name: "Suède", translations: { fr: "Suède", en: "Sweden", nl: "Zweden", es: "Suecia" }, flag: "🇸🇪", code: "SE", lang: "sv" },
    { name: "Suisse", translations: { fr: "Suisse", en: "Switzerland", nl: "Zwitserland", es: "Suiza" }, flag: "🇨🇭", code: "CH", lang: "fr" },
    { name: "Ukraine", translations: { fr: "Ukraine", en: "Ukraine", nl: "Oekraïne", es: "Ucrania" }, flag: "🇺🇦", code: "UA", lang: "uk" },
    { name: "Vatican", translations: { fr: "Vatican", en: "Vatican City", nl: "Vaticaanstad", es: "Ciudad del Vaticano" }, flag: "🇻🇦", code: "VA", lang: "it" },
];

export const sortedCountries = countries.sort((a, b) => a.name.localeCompare(b.name));

export const getTranslatedCountryName = (country: typeof countries[0], language: string) => {
    return country.translations[language as SupportedLanguage] || country.name;
};

export const getSortedCountriesByLanguage = (language: string) => {
    return [...countries].sort((a, b) =>
        getTranslatedCountryName(a, language).localeCompare(getTranslatedCountryName(b, language))
    );
};



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
                    {getSortedCountriesByLanguage(language).map((country) => (
                        <option key={country.name} value={country.name} className="bg-slate-900 text-white">
                            {country.flag} {getTranslatedCountryName(country, language)}
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