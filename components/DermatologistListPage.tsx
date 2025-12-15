
import React, { useState, useMemo } from 'react';
import { sortedCountries } from './CountryDropdown'; // Reusing for manual search block
import { BackArrowIcon } from './icons';
import { GenerateContentResponse, GroundingChunk, LatLng } from '@google/genai';

// --- Types and Interfaces ---

interface MapsPlaceInfo {
    uri: string;
    title: string;
    formattedAddress?: string;
    formatted_address?: string; // Snake case fallback
    formattedPhoneNumber?: string;
    formatted_phone_number?: string; // Snake case fallback
    internationalPhoneNumber?: string;
    international_phone_number?: string; // Snake case fallback
    websiteUri?: string;
    website_uri?: string; // Snake case fallback
    website?: string; // Simple fallback
    placeAnswerSources?: MapsPlaceAnswerSource[];
}

interface MapsReviewSnippet {
    uri: string;
    title?: string;
}

interface MapsPlaceAnswerSource {
    reviewSnippets?: MapsReviewSnippet[];
}

interface DermatologistListPageProps {
    dermatologistMapResults: GenerateContentResponse | null;
    onBack: () => void;
    searchQuery: { country: string; city: string; };
    isLoading: boolean;
    error: string | null;
    onSearch: (country: string, city: string, userLatLng?: LatLng | null) => Promise<void>;
    lastSearchLocation?: LatLng | null;
}

interface DisplayableDermatologist {
    name: string;
    address?: string;
    phone?: string;
    website?: string;
    uri: string;
    email?: string;
    reviewSnippets?: MapsReviewSnippet[];
    distance?: number; // Distance in km
    lat?: number;
    lng?: number;
}

// --- Utils ---

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return parseFloat(d.toFixed(1));
};

const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
};

import { CITY_DATA, DEFAULT_CITIES } from '../data/cities'; // Import from centralized file


const DermatologistListPage: React.FC<DermatologistListPageProps> = ({
    dermatologistMapResults,
    onBack,
    searchQuery,
    isLoading,
    error,
    onSearch,
    lastSearchLocation
}) => {
    // --- Input State for "Search Again" functionality ---
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [selectedCityOption, setSelectedCityOption] = useState<string>('');
    const [customCityInput, setCustomCityInput] = useState<string>('');
    const [geoError, setGeoError] = useState<string | null>(null);

    const availableCities = useMemo(() => {
        if (!selectedCountry) return [];
        const cities = CITY_DATA[selectedCountry];
        // Ensure that even if the country exists but has an empty array, we don't break, though ideally we populate CITY_DATA
        return cities && cities.length > 0 ? cities : DEFAULT_CITIES;
    }, [selectedCountry]);

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCountry(e.target.value);
        setSelectedCityOption('');
        setCustomCityInput('');
    };

    const handleManualSearch = async () => {
        const finalCity = (selectedCityOption === 'other' || selectedCityOption === 'Autre (saisir)' || selectedCityOption === 'Capitale / Ville principale')
            ? customCityInput.trim()
            : selectedCityOption;

        if (selectedCountry && finalCity) {
            await onSearch(selectedCountry, finalCity, null);
        } else if (selectedCountry && !finalCity) {
            await onSearch(selectedCountry, "", null);
        }
    };

    const handleGeoSearch = async () => {
        setGeoError(null);
        if (!navigator.geolocation) {
            setGeoError("La géolocalisation n'est pas supportée.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latLng = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                await onSearch("", "", latLng);
            },
            (err) => {
                console.warn("Geolocation error:", err);
                setGeoError("Impossible de récupérer votre position.");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const isManualSearchDisabled = useMemo(() => {
        if (isLoading || !selectedCountry) return true;
        if ((selectedCityOption === 'other' || selectedCityOption === 'Autre (saisir)') && !customCityInput.trim()) return true;
        if (!selectedCityOption && !customCityInput.trim()) return true;
        return false;
    }, [isLoading, selectedCountry, selectedCityOption, customCityInput]);

    // --- Results Parsing & Sorting ---
    const displayableDermatologists: DisplayableDermatologist[] = React.useMemo(() => {
        if (!dermatologistMapResults || !dermatologistMapResults.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            return [];
        }

        const chunks = dermatologistMapResults.candidates[0].groundingMetadata.groundingChunks as GroundingChunk[];
        const dermatologists: DisplayableDermatologist[] = [];

        chunks.forEach(chunk => {
            if (chunk.maps) {
                const mapInfo = chunk.maps as unknown as MapsPlaceInfo;
                const anyMapInfo = mapInfo as any; // For accessing potential non-typed properties

                if (mapInfo.uri && mapInfo.title) {
                    const name = mapInfo.title.trim();

                    // Robust extraction with fallback to snake_case
                    const address = (mapInfo.formattedAddress || mapInfo.formatted_address || anyMapInfo.vicinity || anyMapInfo.address)?.trim();
                    const phone = (mapInfo.formattedPhoneNumber || mapInfo.formatted_phone_number || mapInfo.internationalPhoneNumber || mapInfo.international_phone_number || anyMapInfo.phone_number)?.trim();
                    const website = (mapInfo.websiteUri || mapInfo.website_uri || mapInfo.website || anyMapInfo.url)?.trim();
                    const email = (anyMapInfo.email || anyMapInfo.business_email || anyMapInfo.contact_email)?.trim();

                    // Coordinate extraction logic
                    let lat: number | undefined;
                    let lng: number | undefined;

                    if (anyMapInfo.geometry && anyMapInfo.geometry.location) {
                        lat = anyMapInfo.geometry.location.lat;
                        lng = anyMapInfo.geometry.location.lng;
                    } else if (anyMapInfo.latitude && anyMapInfo.longitude) {
                        lat = anyMapInfo.latitude;
                        lng = anyMapInfo.longitude;
                    } else if (anyMapInfo.center) {
                        lat = anyMapInfo.center.latitude;
                        lng = anyMapInfo.center.longitude;
                    }

                    let distance: number | undefined = undefined;
                    if (lastSearchLocation && lat !== undefined && lng !== undefined) {
                        distance = calculateDistance(lastSearchLocation.latitude, lastSearchLocation.longitude, lat, lng);
                    }

                    const reviewSnippets: MapsReviewSnippet[] = [];
                    if (mapInfo.placeAnswerSources && Array.isArray(mapInfo.placeAnswerSources)) {
                        mapInfo.placeAnswerSources.forEach((source: MapsPlaceAnswerSource) => {
                            if (source.reviewSnippets && Array.isArray(source.reviewSnippets)) {
                                reviewSnippets.push(...source.reviewSnippets);
                            }
                        });
                    }

                    dermatologists.push({
                        name,
                        address,
                        phone,
                        website,
                        uri: mapInfo.uri,
                        email,
                        reviewSnippets: reviewSnippets.length > 0 ? reviewSnippets : undefined,
                        distance,
                        lat,
                        lng
                    });
                }
            }
        });

        // Sort by distance if it exists (Geo search mode)
        if (lastSearchLocation) {
            return dermatologists.sort((a, b) => {
                if (a.distance !== undefined && b.distance !== undefined) {
                    return a.distance - b.distance;
                }
                // If one has distance and other doesn't, prioritize the one with distance
                if (a.distance !== undefined) return -1;
                if (b.distance !== undefined) return 1;
                return 0;
            });
        }

        return dermatologists;
    }, [dermatologistMapResults, lastSearchLocation]);


    // --- Render Logic ---
    const renderResults = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-3xl" aria-live="polite" aria-atomic="true" role="status">
                    <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="w-5 h-5 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '100ms' }}></span>
                        <span className="w-5 h-5 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></span>
                    </div>
                    <p className="mt-4 text-slate-600 text-base md:text-lg animate-fade-in">Recherche en cours...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-6 bg-red-50 border border-red-200 text-red-900 text-base rounded-xl text-center mt-4" role="alert">
                    <p className="font-bold mb-1">Erreur</p>
                    <p>{error}</p>
                </div>
            );
        }

        if (displayableDermatologists.length > 0) {
            return (
                <div className="w-full space-y-5 text-left mt-6" role="region" aria-label="Liste des dermatologues">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                            {lastSearchLocation ? `Résultats autour de moi (${displayableDermatologists.length})` : `Dermatologues à ${searchQuery.city || 'proximité'} (${displayableDermatologists.length})`}
                        </h3>
                    </div>

                    {displayableDermatologists.map((derm, index) => (
                        <div key={index} className="bg-white p-6 rounded-[16px] shadow-md border border-gray-100 transition-shadow hover:shadow-lg flex flex-col gap-3 animate-fade-in">
                            {/* Header: Name */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                <h4 className="font-['Poppins'] font-semibold text-lg md:text-xl" style={{ color: '#00B37E' }}>
                                    {derm.name}
                                </h4>
                            </div>

                            {/* Content Block */}
                            <div className="font-['Inter'] text-sm md:text-base space-y-2 text-[#0A2840]">

                                {/* Address */}
                                {derm.address && (
                                    <p className="leading-relaxed flex gap-2 items-start">
                                        <span className="font-medium min-w-[24px] text-slate-500">📍</span>
                                        <span>{derm.address}</span>
                                    </p>
                                )}

                                {/* Distance */}
                                {derm.distance !== undefined && (
                                    <p className="leading-relaxed flex gap-2 items-center text-emerald-700 font-medium">
                                        <span className="font-medium min-w-[24px]">📍</span>
                                        <span>à {derm.distance} km</span>
                                    </p>
                                )}

                                {/* Phone */}
                                {derm.phone && (
                                    <p className="leading-relaxed flex gap-2 items-center">
                                        <span className="font-medium min-w-[24px] text-slate-500">📞</span>
                                        <a href={`tel:${derm.phone.replace(/[^\d+]/g, '')}`} className="hover:text-[#00B37E] font-medium transition-colors">
                                            {derm.phone}
                                        </a>
                                    </p>
                                )}

                                {/* Website */}
                                {derm.website && (
                                    <p className="leading-relaxed flex gap-2 items-center">
                                        <span className="font-medium min-w-[24px] text-slate-500">🌐</span>
                                        <a
                                            href={derm.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#0066CC] hover:underline truncate block max-w-full"
                                        >
                                            {derm.website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]}
                                        </a>
                                    </p>
                                )}

                                {/* Email */}
                                {derm.email && (
                                    <p className="leading-relaxed flex gap-2 items-center">
                                        <span className="font-medium min-w-[24px] text-slate-500">✉️</span>
                                        <a href={`mailto:${derm.email}`} className="text-[#0066CC] hover:underline break-all">
                                            {derm.email}
                                        </a>
                                    </p>
                                )}
                            </div>

                            {/* Footer: Link */}
                            <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-end">
                                <a
                                    href={derm.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-gray-100 text-slate-700 hover:bg-[#00B37E] hover:text-white px-4 py-2 rounded-full font-['Inter'] font-medium text-sm transition-colors duration-200"
                                >
                                    Voir sur Google Maps
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="text-center py-10 bg-gray-50 rounded-2xl mt-6">
                <p className="text-slate-600 text-lg font-medium">
                    Aucun résultat trouvé.
                </p>
                <p className="text-slate-500 text-sm mt-2">
                    Essayez d'élargir la zone de recherche ou de vérifier l'orthographe.
                </p>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6 w-full animate-fade-in relative pt-4">
            {/* The Search Header Block (Dual Mode) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mb-4 border-b border-gray-100 pb-8">

                {/* BLOC 1 : Autour de moi (Compact) */}
                <div className="bg-[#F0FDFA] border border-[#D1FAE6] rounded-2xl p-5 flex flex-col shadow-sm">
                    <h3 className="text-lg font-bold font-['Poppins'] text-[#0A2840] mb-2 flex items-center gap-2">
                        📍 Autour de moi
                    </h3>
                    <p className="text-xs text-[#195E49] mb-3 font-['Inter'] flex-grow">
                        Recherche géolocalisée (10-15 km).
                    </p>
                    {geoError && <p className="text-red-500 text-xs mb-2">{geoError}</p>}
                    <button
                        onClick={handleGeoSearch}
                        disabled={isLoading}
                        className="w-full px-4 py-2.5 bg-white border border-[#00B37E] text-[#00B37E] hover:bg-[#00B37E] hover:text-white rounded-full transition-all duration-200 font-bold text-sm font-['Poppins']"
                    >
                        Trouver les proches
                    </button>
                </div>

                {/* BLOC 2 : Manuel (Compact) */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col shadow-sm">
                    <h3 className="text-lg font-bold font-['Poppins'] text-[#0A2840] mb-2 flex items-center gap-2">
                        🌍 Par pays et ville
                    </h3>
                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-2">
                            <select
                                value={selectedCountry}
                                onChange={handleCountryChange}
                                className="px-3 py-2 border border-gray-200 bg-gray-50 text-[#0A2840] text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00B37E] font-['Inter']"
                                disabled={isLoading}
                            >
                                <option value="" disabled>Pays</option>
                                {sortedCountries.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                            <select
                                value={selectedCityOption}
                                onChange={(e) => setSelectedCityOption(e.target.value)}
                                className="px-3 py-2 border border-gray-200 bg-gray-50 text-[#0A2840] text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00B37E] font-['Inter']"
                                disabled={!selectedCountry || isLoading}
                            >
                                <option value="" disabled>Ville</option>
                                {availableCities.map((c) => <option key={c} value={c}>{c}</option>)}
                                <option value="other" className="font-bold text-[#00B37E]">Autre</option>
                            </select>
                        </div>

                        {(selectedCityOption === 'other' || selectedCityOption === 'Autre (saisir)' || selectedCityOption === 'Capitale / Ville principale') && (
                            <input
                                type="text"
                                value={customCityInput}
                                onChange={(e) => setCustomCityInput(e.target.value)}
                                placeholder="Nom de la ville..."
                                className="w-full px-3 py-2 border border-[#00B37E] bg-white text-[#0A2840] text-sm rounded-lg focus:outline-none font-['Inter']"
                                disabled={isLoading}
                            />
                        )}

                        <button
                            onClick={handleManualSearch}
                            disabled={isManualSearchDisabled}
                            className="w-full px-4 py-2.5 bg-[#00B37E] text-white rounded-full hover:bg-[#009466] disabled:opacity-50 font-bold text-sm font-['Poppins']"
                        >
                            Rechercher
                        </button>
                    </div>
                </div>
            </div>

            {renderResults()}

            <p className="text-xs text-gray-400 italic text-center pb-4">
                *Résultats fournis par Google Maps. Vérifiez les informations avant de vous déplacer.
            </p>
        </div>
    );
};

export default DermatologistListPage;
