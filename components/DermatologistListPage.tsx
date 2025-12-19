
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sortedCountries } from './CountryDropdown';
import { GenerateContentResponse, GroundingChunk, LatLng } from '@google/genai';
import { CITY_DATA, DEFAULT_CITIES } from '../data/cities';

// --- Types & Interfaces ---
interface MapsPlaceInfo {
    uri: string;
    title: string;
    formattedAddress?: string;
    formatted_address?: string;
    formattedPhoneNumber?: string;
    formatted_phone_number?: string;
    internationalPhoneNumber?: string;
    international_phone_number?: string;
    websiteUri?: string;
    website_uri?: string;
    website?: string;
    placeAnswerSources?: any[];
}

interface MapsReviewSnippet {
    uri: string;
    title?: string;
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
    distance?: number;
    lat?: number;
    lng?: number;
}

// --- Utils ---
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
};

const DermatologistListPage: React.FC<DermatologistListPageProps> = ({
    dermatologistMapResults,
    onBack,
    searchQuery,
    isLoading,
    error,
    onSearch,
    lastSearchLocation
}) => {
    // --- Input State ---
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [selectedCityOption, setSelectedCityOption] = useState<string>('');
    const [customCityInput, setCustomCityInput] = useState<string>('');
    const [geoError, setGeoError] = useState<string | null>(null);

    const availableCities = useMemo(() => {
        if (!selectedCountry) return [];
        const cities = CITY_DATA[selectedCountry];
        return cities && cities.length > 0 ? cities : DEFAULT_CITIES;
    }, [selectedCountry]);

    const handleManualSearch = async () => {
        const finalCity = (selectedCityOption === 'other' || selectedCityOption === 'Autre (saisir)')
            ? customCityInput.trim()
            : selectedCityOption;

        if (selectedCountry) {
            await onSearch(selectedCountry, finalCity || "", null);
        }
    };

    const handleGeoSearch = async () => {
        setGeoError(null);
        if (!navigator.geolocation) {
            setGeoError("Géolocalisation non supportée.");
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
                setGeoError("Position introuvable.");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // --- Data Extraction ---
    const displayableDermatologists: DisplayableDermatologist[] = React.useMemo(() => {
        if (!dermatologistMapResults?.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            return [];
        }

        const chunks = dermatologistMapResults.candidates[0].groundingMetadata.groundingChunks as GroundingChunk[];
        const dermatologists: DisplayableDermatologist[] = [];

        chunks.forEach(chunk => {
            if (chunk.maps) {
                const mapInfo = chunk.maps as unknown as MapsPlaceInfo;
                const anyMapInfo = mapInfo as any;

                if (mapInfo.uri && mapInfo.title) {
                    const name = mapInfo.title.trim();
                    const address = (mapInfo.formattedAddress || anyMapInfo.vicinity || anyMapInfo.address)?.trim();
                    const phone = (mapInfo.formattedPhoneNumber || mapInfo.internationalPhoneNumber || anyMapInfo.phone_number)?.trim();
                    const website = (mapInfo.websiteUri || mapInfo.website || anyMapInfo.url)?.trim();

                    let lat: number | undefined;
                    let lng: number | undefined;
                    if (anyMapInfo.geometry?.location) {
                        lat = anyMapInfo.geometry.location.lat;
                        lng = anyMapInfo.geometry.location.lng;
                    } else if (anyMapInfo.latitude) {
                        lat = anyMapInfo.latitude;
                        lng = anyMapInfo.longitude;
                    }

                    let distance: number | undefined = undefined;
                    if (lastSearchLocation && lat !== undefined && lng !== undefined) {
                        distance = calculateDistance(lastSearchLocation.latitude, lastSearchLocation.longitude, lat, lng);
                    }

                    dermatologists.push({ name, address, phone, website, uri: mapInfo.uri, distance, lat, lng });
                }
            }
        });

        if (lastSearchLocation) {
            return dermatologists.sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
        }
        return dermatologists;
    }, [dermatologistMapResults, lastSearchLocation]);

    // --- Animation Variants ---
    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    // --- Render ---
    return (
        <div className="flex flex-col gap-8 w-full relative pt-2">

            {/* Search Controls (Glass Box) */}
            <div className="glass-card rounded-3xl p-6 md:p-8 flex flex-col gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
                    {/* Divider for Large Screens */}
                    <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent" />

                    {/* Geolocation Block */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-brand-light text-brand-primary rounded-xl">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            </div>
                            <h3 className="text-lg font-bold text-brand-secondary">Autour de moi</h3>
                        </div>
                        <p className="text-sm text-slate-500 font-medium ml-1">Utiliser votre position (Rayon 10km)</p>

                        {geoError && <p className="text-red-500 text-xs bg-red-50 p-2 rounded-lg">{geoError}</p>}

                        <button
                            onClick={handleGeoSearch}
                            disabled={isLoading}
                            className="mt-auto w-full py-3 px-6 bg-white border-2 border-brand-primary text-brand-primary font-bold rounded-xl hover:bg-brand-primary hover:text-white transition-all shadow-sm active:scale-95"
                        >
                            {isLoading ? "Localisation..." : "📍 Trouver les proches"}
                        </button>
                    </div>

                    {/* Manual Search Block */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-blue-50 text-brand-secondary rounded-xl">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                            </div>
                            <h3 className="text-lg font-bold text-brand-secondary">Par ville</h3>
                        </div>
                        <div className="flex flex-col gap-3">
                            <select
                                value={selectedCountry}
                                onChange={handleCountryChange}
                                disabled={isLoading}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                            >
                                <option value="" disabled>Choisir un pays</option>
                                {sortedCountries.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>

                            <div className="flex gap-2">
                                <select
                                    value={selectedCityOption}
                                    onChange={(e) => setSelectedCityOption(e.target.value)}
                                    disabled={!selectedCountry || isLoading}
                                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                                >
                                    <option value="" disabled>Ville</option>
                                    {availableCities.map((c) => <option key={c} value={c}>{c}</option>)}
                                    <option value="other" className="text-brand-primary font-bold">Autre...</option>
                                </select>
                            </div>

                            {(selectedCityOption === 'other' || selectedCityOption === 'Autre (saisir)') && (
                                <input
                                    type="text"
                                    value={customCityInput}
                                    onChange={(e) => setCustomCityInput(e.target.value)}
                                    placeholder="Nom de la ville..."
                                    className="w-full p-3 bg-white border-2 border-brand-primary/30 rounded-xl focus:border-brand-primary outline-none text-slate-700"
                                />
                            )}

                            <button
                                onClick={handleManualSearch}
                                disabled={isLoading || !selectedCountry}
                                className="w-full py-3 px-6 bg-brand-primary text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                🔍 Rechercher
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-12"
                    >
                        <div className="relative w-24 h-24 mb-6">
                            {/* Scanning Grid Background */}
                            <div className="absolute inset-0 z-0 bg-brand-primary/5 rounded-full blur-xl" />

                            {/* Fingerprint / Map Icon */}
                            <svg className="w-full h-full text-brand-secondary/30" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>

                            {/* Scanning Laser Line */}
                            <motion.div
                                animate={{ top: ["0%", "100%", "0%"] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-0.5 bg-brand-primary shadow-[0_0_15px_rgba(0,179,126,1)] z-20"
                            />
                        </div>
                        <div className="flex flex-col items-center gap-2 relative z-10">
                            <h3 className="text-xl font-bold text-brand-secondary tracking-widest uppercase">Analyse en cours</h3>
                            <p className="text-brand-primary font-mono text-sm animate-pulse">Recherche des dermatologues à proximité...</p>
                        </div>
                    </motion.div>
                )}

                {!isLoading && error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center"
                    >
                        <p className="font-bold">Une erreur est survenue</p>
                        <p className="text-sm opacity-80">{error}</p>
                    </motion.div>
                )}

                {!isLoading && !error && displayableDermatologists.length > 0 && (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="flex flex-col gap-4"
                    >
                        <div className="flex items-center justify-between px-2 mb-2">
                            <h3 className="text-xl font-bold text-brand-secondary">
                                {lastSearchLocation ? `Résultats à proximité (${displayableDermatologists.length})` : `Résultats (${displayableDermatologists.length})`}
                            </h3>
                        </div>

                        {displayableDermatologists.map((derm, idx) => (
                            <motion.div
                                key={idx}
                                variants={item}
                                className="glass-card p-6 rounded-2xl flex flex-col md:flex-row gap-6 hover:border-brand-primary/40 relative group bg-white"
                            >
                                {/* Left: Info */}
                                <div className="flex-1 flex flex-col gap-2 text-left">
                                    <h4 className="text-xl font-bold text-brand-secondary group-hover:text-brand-primary transition-colors">
                                        {derm.name}
                                    </h4>

                                    {derm.distance !== undefined && (
                                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary bg-brand-light px-2 py-1 rounded-md w-fit mb-1">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                                            {derm.distance} km
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-1.5 text-sm text-slate-600 mt-1">
                                        {derm.address && (
                                            <div className="flex gap-2 items-start">
                                                <span className="opacity-50 mt-0.5">📍</span>
                                                <span>{derm.address}</span>
                                            </div>
                                        )}
                                        {derm.phone && (
                                            <div className="flex gap-2 items-center">
                                                <span className="opacity-50">📞</span>
                                                <a href={`tel:${derm.phone.replace(/[^\d+]/g, '')}`} className="font-semibold text-slate-800 hover:text-brand-primary underline decoration-dotted">
                                                    {derm.phone}
                                                </a>
                                            </div>
                                        )}
                                        {derm.website && (
                                            <div className="flex gap-2 items-center">
                                                <span className="opacity-50">🌐</span>
                                                <a href={derm.website} target="_blank" rel="noopener" className="text-blue-600 hover:underline truncate max-w-[200px]">
                                                    Site web
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Action */}
                                <div className="flex flex-col justify-center items-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 gap-3">
                                    <a
                                        href={derm.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full md:w-auto py-3 px-6 rounded-xl bg-brand-secondary text-white font-semibold text-sm hover:bg-brand-primary transition-all shadow-md flex items-center justify-center gap-2"
                                    >
                                        <span>Itinéraire</span>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                                    </a>
                                    {derm.phone && (
                                        <a
                                            href={`tel:${derm.phone.replace(/[^\d+]/g, '')}`}
                                            className="w-full md:w-auto py-2.5 px-6 rounded-xl border border-gray-200 text-slate-700 font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            Appeler
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {!isLoading && !error && displayableDermatologists.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 text-slate-400"
                    >
                        <p>Aucun résultat pour le moment.</p>
                        <p className="text-sm">Essayez une autre ville ou utlisez la géolocalisation.</p>
                    </motion.div>
                )}
            </AnimatePresence>
            <p className="text-[10px] text-gray-400 text-center mt-8 uppercase tracking-widest opacity-60">Powered by Google Maps Platform</p>
        </div>
    );
};

export default DermatologistListPage;
