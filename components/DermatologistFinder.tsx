
import React, { useState, useMemo } from 'react';
import { sortedCountries } from './CountryDropdown'; // Import sortedCountries
import { BackArrowIcon } from './icons';
import { LatLng } from '@google/genai'; // Import LatLng type

import { CITY_DATA, DEFAULT_CITIES } from '../data/cities'; // Import from centralized file

// Removed local CITY_DATA variable to use the centralized one imported above.

interface DermatologistFinderProps {
    onBack: () => void;
    onSearch: (country: string, city: string, userLatLng?: LatLng | null) => Promise<void>;
    isLoading: boolean;
}

const DermatologistFinder: React.FC<DermatologistFinderProps> = ({ onBack, onSearch, isLoading }) => {
    // Manual Search State
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [selectedCityOption, setSelectedCityOption] = useState<string>('');
    const [customCityInput, setCustomCityInput] = useState<string>('');

    // Geolocation Search State
    const [userLocation, setUserLocation] = useState<LatLng | null>(null);
    const [geoError, setGeoError] = useState<string | null>(null);

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
        if (!navigator.geolocation) {
            setGeoError("La géolocalisation n'est pas supportée par votre navigateur.");
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
                    setGeoError("Localisation refusée. Veuillez vérifier vos paramètres.");
                } else {
                    setGeoError("Impossible de récupérer votre position.");
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

    return (
        <div className="flex flex-col gap-6 w-full animate-fade-in relative">
            <button
                onClick={onBack}
                className="absolute -top-12 left-0 p-2 text-gray-400 hover:text-[#00B37E] transition-colors rounded-full hover:bg-gray-50"
                aria-label="Retour"
            >
                <BackArrowIcon />
            </button>

            <div className="w-full text-center mb-4">
                <p className="text-base md:text-lg font-['Inter'] text-[#195E49]">
                    Choisissez une méthode pour localiser un spécialiste :
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                {/* BLOC 1 : Autour de moi */}
                <div className="bg-[#F0FDFA] border border-[#D1FAE6] rounded-2xl p-6 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-bold font-['Poppins'] text-[#0A2840] mb-4">
                        📍 Autour de moi
                    </h3>
                    <p className="text-sm text-[#195E49] mb-6 text-center font-['Inter']">
                        Utilisez votre position actuelle pour trouver les dermatologues dans un rayon de 10-15 km.
                    </p>

                    {geoError && (
                        <p className="text-red-600 text-xs mb-3 bg-red-50 p-2 rounded-lg">{geoError}</p>
                    )}

                    <button
                        onClick={handleGeoSearch}
                        disabled={isLoading}
                        className="w-full mt-auto px-6 py-4 bg-white border-2 border-[#00B37E] text-[#00B37E] hover:bg-[#00B37E] hover:text-white rounded-full transition-all duration-200 font-bold font-['Poppins'] shadow-sm"
                    >
                        {isLoading ? "Recherche..." : "Trouver les proches"}
                    </button>
                </div>

                {/* BLOC 2 : Par pays et ville */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-bold font-['Poppins'] text-[#0A2840] mb-4 text-center">
                        🌍 Par pays et ville
                    </h3>
                    <div className="flex flex-col gap-4 w-full">
                        <select
                            value={selectedCountry}
                            onChange={handleCountryChange}
                            className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-[#0A2840] text-base rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B37E]/50 transition-all font-['Inter']"
                            disabled={isLoading}
                        >
                            <option value="" disabled>Pays</option>
                            {sortedCountries.map((country) => (
                                <option key={country.name} value={country.name}>
                                    {country.flag} {country.name}
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
                                <option value="" disabled>Ville</option>
                                {availableCities.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                                <option value="other" className="font-bold text-[#00B37E]">Autre (saisir)</option>
                            </select>
                        </div>

                        {(selectedCityOption === 'other' || selectedCityOption === 'Autre (saisir)' || selectedCityOption === 'Capitale / Ville principale') && (
                            <input
                                type="text"
                                value={customCityInput}
                                onChange={(e) => setCustomCityInput(e.target.value)}
                                placeholder="Nom de la ville..."
                                className="w-full px-4 py-3 border border-[#00B37E] bg-white text-[#0A2840] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B37E]/30 font-['Inter'] animate-fade-in"
                                disabled={isLoading}
                            />
                        )}

                        <button
                            onClick={handleManualSearch}
                            disabled={isManualSearchDisabled}
                            className="w-full mt-2 px-6 py-4 bg-[#00B37E] text-white rounded-full hover:bg-[#009466] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold font-['Poppins'] shadow-md"
                        >
                            {isLoading ? "..." : "Rechercher"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DermatologistFinder;
