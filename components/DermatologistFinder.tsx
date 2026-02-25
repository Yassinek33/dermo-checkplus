import React, { useState, useMemo } from 'react';
import { getSortedCountriesByLanguage, getTranslatedCountryName } from './CountryDropdown';
import { BackArrowIcon } from './icons';
import { LatLng } from '@google/genai';
import { CITY_DATA, DEFAULT_CITIES } from '../data/cities'; // Import from centralized file
import { useLanguage } from '../context/LanguageContext';

// Removed local CITY_DATA variable to use the centralized one imported above.

interface DermatologistFinderProps {
    onBack: () => void;
    onSearch: (country: string, city: string, userLatLng?: LatLng | null) => Promise<void>;
    isLoading: boolean;
}

import LocationRequestPopup from './LocationRequestPopup';

// ... existing code ...

const DermatologistFinder: React.FC<DermatologistFinderProps> = ({ onBack, onSearch, isLoading }) => {
    const { t } = useLanguage();
    // Manual Search State
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [selectedCityOption, setSelectedCityOption] = useState<string>('');
    const [customCityInput, setCustomCityInput] = useState<string>('');

    // Geolocation Search State
    const [userLocation, setUserLocation] = useState<LatLng | null>(null);
    const [geoError, setGeoError] = useState<string | null>(null);

    // Logic to show popup
    const [showLocationPopup, setShowLocationPopup] = useState(true);

    // Get Cities for selected country
    const availableCities = useMemo(() => {
        if (!selectedCountry) return [];
        const cities = CITY_DATA[selectedCountry];
        return cities && cities.length > 0 ? cities : DEFAULT_CITIES;
    }, [selectedCountry]);

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCountry(e.target.value);
        setSelectedCityOption('');
        setCustomCityInput('');
    };

    // Manual Search Handler
    const handleManualSearch = async () => {
        const finalCity = (selectedCityOption === 'other' || selectedCityOption === 'Autre (saisir)' || selectedCityOption === 'Capitale / Ville principale')
            ? customCityInput.trim()
            : selectedCityOption;

        if (selectedCountry && finalCity) {
            await onSearch(selectedCountry, finalCity, null);
        } else if (selectedCountry && !finalCity) {
            // Allow searching just by country if no city input, though less precise
            await onSearch(selectedCountry, "", null);
        }
    };

    // Geolocation Search Handler
    const handleGeoSearch = async () => {
        setGeoError(null);
        setShowLocationPopup(false); // Close popup if manual button clicked or re-triggered

        if (!navigator.geolocation) {
            setGeoError(t('dermatologist.errors.geo_not_supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latLng = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                setUserLocation(latLng);
                // Trigger search with empty city/country but valid latLng
                await onSearch("", "", latLng);
            },
            (error) => {
                console.warn("Geolocation error:", error);
                if (error.code === error.PERMISSION_DENIED) {
                    setGeoError(t('dermatologist.errors.geo_denied'));
                } else {
                    setGeoError(t('dermatologist.errors.geo_unavailable'));
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const isManualSearchDisabled = useMemo(() => {
        if (isLoading || !selectedCountry) return true;
        // If city is selected and it's a "custom" type, we need input
        if ((selectedCityOption === 'other' || selectedCityOption === 'Autre (saisir)') && !customCityInput.trim()) return true;
        // If no city selected yet
        if (!selectedCityOption && !customCityInput.trim()) return true;
        return false;
    }, [isLoading, selectedCountry, selectedCityOption, customCityInput]);

    const handlePopupAllow = () => {
        setShowLocationPopup(false);
        handleGeoSearch();
    };

    const handlePopupDeny = () => {
        setShowLocationPopup(false);
    };

    return (
        <div className="flex flex-col gap-6 w-full animate-fade-in relative">
            {showLocationPopup && (
                <LocationRequestPopup
                    onAllow={handlePopupAllow}
                    onDeny={handlePopupDeny}
                />
            )}

            <button
                onClick={onBack}
                className="absolute -top-12 left-0 p-2 text-gray-400 hover:text-[#00B37E] transition-colors rounded-full hover:bg-gray-50"
                aria-label={t('common.back')}
            >
                <BackArrowIcon />
            </button>

            <div className="w-full text-center mb-4">
                <p className="text-base md:text-lg font-['Inter'] text-[#195E49]">
                    {t('dermatologist.choose_method')}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                {/* BLOC 1 : Autour de moi */}
                <div className="bg-[#F0FDFA] border border-[#D1FAE6] rounded-2xl p-6 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-bold font-['Poppins'] text-[#0A2840] mb-4">
                        📍 {t('dermatologist.around_me.title')}
                    </h3>
                    <p className="text-sm text-[#195E49] mb-6 text-center font-['Inter']">
                        {t('dermatologist.around_me.description')}
                    </p>

                    {geoError && (
                        <p className="text-red-600 text-xs mb-3 bg-red-50 p-2 rounded-lg">{geoError}</p>
                    )}

                    <button
                        onClick={handleGeoSearch}
                        disabled={isLoading}
                        className="w-full mt-auto px-6 py-4 bg-white border-2 border-[#00B37E] text-[#00B37E] hover:bg-[#00B37E] hover:text-white rounded-full transition-all duration-200 font-bold font-['Poppins'] shadow-sm"
                    >
                        {isLoading ? t('dermatologist.around_me.loading') : t('dermatologist.around_me.button')}
                    </button>
                </div>

                {/* BLOC 2 : Par pays et ville */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-bold font-['Poppins'] text-[#0A2840] mb-4 text-center">
                        🌍 {t('dermatologist.by_city.title')}
                    </h3>
                    <div className="flex flex-col gap-4 w-full">
                        <select
                            value={selectedCountry}
                            onChange={handleCountryChange}
                            className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-[#0A2840] text-base rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B37E]/50 transition-all font-['Inter']"
                            disabled={isLoading}
                        >
                            <option value="" disabled>{t('dermatologist.by_city.country_placeholder')}</option>
                            {getSortedCountriesByLanguage(language).map((country) => (
                                <option key={country.name} value={country.name}>
                                    {country.flag} {getTranslatedCountryName(country, language)}
                                </option>
                            ))}
                        </select>

                        <div className="relative w-full">
                            <select
                                value={selectedCityOption}
                                onChange={(e) => setSelectedCityOption(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-[#0A2840] text-base rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B37E]/50 transition-all font-['Inter']"
                                disabled={!selectedCountry || isLoading}
                            >
                                <option value="" disabled>{t('dermatologist.by_city.city_placeholder')}</option>
                                {availableCities.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                                <option value="other" className="font-bold text-[#00B37E]">{t('dermatologist.by_city.other_city')}</option>
                            </select>
                        </div>

                        {(selectedCityOption === 'other' || selectedCityOption === 'Autre (saisir)' || selectedCityOption === 'Capitale / Ville principale') && (
                            <input
                                type="text"
                                value={customCityInput}
                                onChange={(e) => setCustomCityInput(e.target.value)}
                                placeholder={t('dermatologist.by_city.input_placeholder')}
                                className="w-full px-4 py-3 border border-[#00B37E] bg-white text-[#0A2840] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B37E]/30 font-['Inter'] animate-fade-in"
                                disabled={isLoading}
                            />
                        )}

                        <button
                            onClick={handleManualSearch}
                            disabled={isManualSearchDisabled}
                            className="w-full mt-2 px-6 py-4 bg-[#00B37E] text-white rounded-full hover:bg-[#009466] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold font-['Poppins'] shadow-md"
                        >
                            {isLoading ? "..." : t('dermatologist.by_city.button')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DermatologistFinder;
