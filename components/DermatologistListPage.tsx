
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sortedCountries } from './CountryDropdown';
import { GenerateContentResponse, GroundingChunk, LatLng } from '@google/genai';
import { CITY_DATA, DEFAULT_CITIES } from '../data/cities';
import { fetchPlaceDetails } from '../services/placesService';
import { DermoCheckLogo } from './icons';

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

import { useLanguage } from '../context/LanguageContext';

// ...

const DermatologistListPage: React.FC<DermatologistListPageProps> = ({
    dermatologistMapResults,
    onBack,
    searchQuery,
    isLoading,
    error,
    onSearch,
    lastSearchLocation
}) => {
    const { t } = useLanguage();

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

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCountry(e.target.value);
        setSelectedCityOption('');
        setCustomCityInput('');
    };

    const handleManualSearch = async () => {
        const finalCity = (selectedCityOption === 'other' || selectedCityOption === 'Autre (saisir)' || selectedCityOption === 'Capitale / Ville principale')
            ? customCityInput.trim()
            : selectedCityOption;

        if (selectedCountry) {
            await onSearch(selectedCountry, finalCity || "", null);
        }
    };

    const handleGeoSearch = async () => {
        setGeoError(null);
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
                await onSearch("", "", latLng);
            },
            (err) => {
                console.warn("Geolocation error:", err);
                setGeoError(t('dermatologist.errors.geo_unavailable'));
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // --- State for enriched place details ---
    const [enrichedDermatologists, setEnrichedDermatologists] = useState<Map<string, { address?: string, phone?: string, website?: string }>>(new Map());

    // --- Data Extraction ---
    const displayableDermatologists: DisplayableDermatologist[] = React.useMemo(() => {
        if (!dermatologistMapResults?.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            return [];
        }

        // --- Step 1: Parse data from Gemini text response ---
        // The AI returns structured text with name, address, phone, website for each result.
        // We extract this by finding each name in the text and parsing surrounding context.
        const responseText = dermatologistMapResults.candidates?.[0]?.content?.parts?.[0]?.text || "";
        console.log("Gemini response text:", responseText);
        const responseLines = responseText.split('\n');

        // Helper: given a name, find it in the response text and extract address/phone/website from nearby lines
        const extractDetailsFromText = (searchName: string): { address: string, phone: string, website: string } => {
            const result = { address: "", phone: "", website: "" };
            if (!responseText || !searchName) return result;

            const cleanStr = (s: string) => s.replace(/\*\*/g, '').replace(/\*/g, '').trim();
            const normSearch = searchName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

            // Find the line index where this name appears
            let nameLineIdx = -1;
            for (let i = 0; i < responseLines.length; i++) {
                const normLine = responseLines[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                if (normLine.includes(normSearch) ||
                    // Try matching just the first 15 chars of the name for partial matches
                    (normSearch.length > 8 && normLine.includes(normSearch.substring(0, 15)))) {
                    nameLineIdx = i;
                    break;
                }
            }

            if (nameLineIdx === -1) return result;

            // Look at the next 12 lines after the name for details
            const contextLines = responseLines.slice(nameLineIdx, Math.min(nameLineIdx + 12, responseLines.length));
            const contextBlock = contextLines.join('\n');

            // Extract address
            const addrPatterns = [
                /(?:adresse|address|📍)\s*[:：]\s*(.+?)(?:\n|$)/i,
                /(?:\*\*adresse\*\*|📍)\s*[:：]?\s*(.+?)(?:\n|$)/i,
                /(?:^|\n)\s*[-•*]\s*(?:adresse|address)\s*[:：]\s*(.+?)(?:\n|$)/i,
                /(\d+[\s,]+(?:rue|av\.|avenue|boulevard|blvd|street|st\.|road|rd\.|place|allée|impasse|chemin|ul\.|prospekt|проспект|улица|ул\.).+?)(?:\n|$)/i,
            ];
            for (const pat of addrPatterns) {
                const m = contextBlock.match(pat);
                if (m) { result.address = cleanStr(m[1]); break; }
            }

            // Extract phone
            const phonePatterns = [
                /(?:téléphone|telephone|tel|phone|📞)\s*[:：]\s*(.+?)(?:\n|$)/i,
                /(?:\*\*téléphone\*\*|\*\*tel\*\*|📞)\s*[:：]?\s*(.+?)(?:\n|$)/i,
                /(?:^|\n)\s*[-•*]\s*(?:téléphone|telephone|tel|phone)\s*[:：]\s*(.+?)(?:\n|$)/i,
            ];
            for (const pat of phonePatterns) {
                const m = contextBlock.match(pat);
                if (m) { result.phone = cleanStr(m[1]); break; }
            }
            // Fallback: look for phone number pattern in context
            if (!result.phone) {
                const phoneNumMatch = contextBlock.match(/(?:^|\n|:\s*)((?:\+\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{0,4})(?:\s*$|\n)/m);
                if (phoneNumMatch) result.phone = cleanStr(phoneNumMatch[1]);
            }

            // Extract website
            const webPatterns = [
                /(?:site\s*web|website|🌐)\s*[:：]\s*(.+?)(?:\n|$)/i,
                /(?:\*\*site\s*web\*\*|🌐)\s*[:：]?\s*(.+?)(?:\n|$)/i,
            ];
            for (const pat of webPatterns) {
                const m = contextBlock.match(pat);
                if (m) { result.website = cleanStr(m[1]); break; }
            }
            if (!result.website) {
                const urlMatch = contextBlock.match(/(https?:\/\/(?!www\.google\.com\/maps)[^\s\)>\]]+)/i);
                if (urlMatch) result.website = cleanStr(urlMatch[1]);
            }

            console.log(`Parsed from text for "${searchName}":`, result);
            return result;
        };

        // --- Step 2: Extract from grounding chunks and combine with text data ---
        const chunks = dermatologistMapResults.candidates[0].groundingMetadata.groundingChunks as GroundingChunk[];
        const dermatologists: DisplayableDermatologist[] = [];

        chunks.forEach((chunk, index) => {
            const mapInfoRaw = chunk.maps || (chunk as any).googleMapsGroundingChunk || (chunk as any).google_maps_grounding_chunk;

            if (mapInfoRaw) {
                const mapInfo = mapInfoRaw as unknown as MapsPlaceInfo;
                const anyMapInfo = mapInfo as any;

                const name = (mapInfo.title || anyMapInfo.name || anyMapInfo.place_name || anyMapInfo.displayName?.text)?.trim();
                const uri = (mapInfo.uri || mapInfo.websiteUri || anyMapInfo.google_maps_uri || anyMapInfo.url || anyMapInfo.googleMapsUri)?.trim();
                const placeId = anyMapInfo.placeId;

                if (name) {
                    // Get enriched data from Places API if available
                    const enriched = placeId ? enrichedDermatologists.get(placeId) : undefined;

                    // Extract data from the Gemini text response
                    const textData = extractDetailsFromText(name);

                    // Combine: Places API > raw chunk data > text parsed data
                    const address = enriched?.address || anyMapInfo.formattedAddress || anyMapInfo.formatted_address || textData.address;
                    const phone = enriched?.phone || anyMapInfo.formattedPhoneNumber || anyMapInfo.formatted_phone_number || textData.phone;
                    const website = enriched?.website || anyMapInfo.websiteUri || anyMapInfo.website_uri || anyMapInfo.website || textData.website;

                    let lat: number | undefined;
                    let lng: number | undefined;

                    if (anyMapInfo.geometry?.location) {
                        lat = anyMapInfo.geometry.location.lat;
                        lng = anyMapInfo.geometry.location.lng;
                    } else if (anyMapInfo.latitude && anyMapInfo.longitude) {
                        lat = anyMapInfo.latitude;
                        lng = anyMapInfo.longitude;
                    } else if (anyMapInfo.location?.latitude && anyMapInfo.location?.longitude) {
                        lat = anyMapInfo.location.latitude;
                        lng = anyMapInfo.location.longitude;
                    }

                    let distance: number | undefined = undefined;
                    if (lastSearchLocation && lat !== undefined && lng !== undefined) {
                        distance = calculateDistance(lastSearchLocation.latitude, lastSearchLocation.longitude, lat, lng);
                    }

                    dermatologists.push({ name, address, phone, website, uri: uri || `#result-${index}`, distance, lat, lng });
                }
            }
        });

        // Secondary filter (Frontend) - VERY PERMISSIVE
        // The API already does the heavy lifting with Google Maps Grounding
        // We only filter out obviously wrong results
        let qCountry = searchQuery.country.trim().toLowerCase();
        const qCity = searchQuery.city.trim().toLowerCase();

        // Robust address normalization helper
        const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        console.log("Dermatologists before filtering:", dermatologists);
        console.log("Search query:", { qCountry, qCity });

        const filteredDermatologists = dermatologists.filter(derm => {
            const addr = normalize(derm.address || "");
            const name = normalize(derm.name);

            // Must have at least a name
            if (!name) return false;

            // VERY PERMISSIVE FILTERING:
            // Trust the Gemini + Google Maps grounding — it already does the heavy lifting.
            // Only filter by city if we have BOTH a city query AND actual address data.
            if (qCity && addr) {
                const normCity = normalize(qCity);
                // Accept if city is in address OR name
                if (addr.includes(normCity) || name.includes(normCity)) {
                    return true;
                }
                // If address exists but doesn't match city, still accept
                // because the API grounding already filtered geographically
                return true;
            }

            // If no city, no address, or geolocation search — trust the API completely
            return true;
        });

        console.log("Filtered dermatologists:", filteredDermatologists);

        const finalResults = lastSearchLocation
            ? filteredDermatologists.sort((a, b) => (a.distance || 9999) - (b.distance || 9999))
            : filteredDermatologists;

        // --- Pinned / Featured dermatologist for Meknès, Maroc ---
        const normCountry = normalize(searchQuery.country);
        const normCityQ = normalize(searchQuery.city);
        const isMeknes = (normCityQ.includes("meknes") || normCityQ.includes("meknas"));
        const isMaroc = (normCountry.includes("maroc") || normCountry.includes("morocco") || normCountry.includes("ma"));

        if (isMeknes && isMaroc) {
            const pinnedDoctor: DisplayableDermatologist = {
                name: "DR. Khafifi Hamza",
                address: "18 rue Antsirabé, appt. 8, Meknès, Maroc",
                phone: "+212535520159",
                website: "",
                uri: "https://www.google.com/maps/search/DR+Khafifi+Hamza+18+rue+Antsirab%C3%A9+Mekn%C3%A8s",
            };
            // Remove any duplicate if already in results
            const withoutDuplicate = finalResults.filter(d => !normalize(d.name).includes("khafifi"));
            return [pinnedDoctor, ...withoutDuplicate].slice(0, 6);
        }

        return finalResults.slice(0, 6);
    }, [dermatologistMapResults, lastSearchLocation, searchQuery, enrichedDermatologists]);

    // --- Enrich dermatologist data with Places API ---
    useEffect(() => {
        const enrichData = async () => {
            if (!dermatologistMapResults?.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                return;
            }

            const chunks = dermatologistMapResults.candidates[0].groundingMetadata.groundingChunks as GroundingChunk[];
            const newEnrichedData = new Map<string, { address?: string, phone?: string, website?: string }>();

            // Fetch details for each place
            for (const chunk of chunks) {
                const mapInfoRaw = chunk.maps || (chunk as any).googleMapsGroundingChunk || (chunk as any).google_maps_grounding_chunk;
                if (mapInfoRaw) {
                    const anyMapInfo = mapInfoRaw as any;
                    const placeId = anyMapInfo.placeId;

                    if (placeId && !enrichedDermatologists.has(placeId)) {
                        console.log(`Fetching details for placeId: ${placeId}`);
                        const details = await fetchPlaceDetails(placeId);
                        if (details.formattedAddress || details.formattedPhoneNumber) {
                            newEnrichedData.set(placeId, {
                                address: details.formattedAddress,
                                phone: details.formattedPhoneNumber,
                                website: details.website
                            });
                        }
                    }
                }
            }

            if (newEnrichedData.size > 0) {
                setEnrichedDermatologists(prev => new Map([...prev, ...newEnrichedData]));
            }
        };

        enrichData();
    }, [dermatologistMapResults]);

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
            {/* Centered Logo - Click to go home */}
            <div className="flex justify-center mb-6">
                <button
                    onClick={onBack}
                    className="group transition-transform duration-300 hover:scale-105 active:scale-95 focus:outline-none"
                    aria-label="Retour à l'accueil"
                >
                    <DermoCheckLogo size={48} className="h-auto drop-shadow-[0_0_25px_rgba(45,212,191,0.4)] group-hover:drop-shadow-[0_0_35px_rgba(45,212,191,0.6)] transition-all duration-300" />
                </button>
            </div>

            {/* Search Controls (Glass Box) */}
            <div className="glass-card rounded-3xl p-6 md:p-8 flex flex-col gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
                    {/* Divider for Large Screens */}
                    <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent" />

                    {/* Geolocation Block */}
                    <div className="flex flex-col gap-5 p-2">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl border border-brand-primary/20 shadow-[0_0_15px_rgba(45,212,191,0.1)]">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-bold text-white tracking-tight">{t('dermatologist.around_me.title')}</h3>
                                <p className="text-sm text-brand-secondary/50 font-light">{t('dermatologist.around_me.description')}</p>
                            </div>
                        </div>

                        {geoError && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-xl animate-shake">{geoError}</p>}

                        <button
                            onClick={handleGeoSearch}
                            disabled={isLoading}
                            className="mt-auto group relative w-full py-4 px-6 bg-white/5 border border-brand-primary/30 text-brand-primary font-bold rounded-2xl hover:bg-brand-primary hover:text-brand-deep transition-all shadow-lg active:scale-95 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isLoading ? t('dermatologist.around_me.loading') : `📍 ${t('dermatologist.around_me.button')}`}
                            </span>
                        </button>
                    </div>

                    {/* Manual Search Block */}
                    <div className="flex flex-col gap-5 p-2">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/5 text-brand-secondary rounded-2xl border border-white/10 shadow-lg">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-bold text-white tracking-tight">{t('dermatologist.by_city.title')}</h3>
                                <p className="text-sm text-brand-secondary/50 font-light">{t('dermatologist.by_city.description')}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <select
                                value={selectedCountry}
                                onChange={handleCountryChange}
                                disabled={isLoading}
                                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-brand-primary/40 outline-none transition-all placeholder-white/20 backdrop-blur-md appearance-none cursor-pointer hover:bg-white/10"
                            >
                                <option value="" disabled className="bg-brand-deep">{t('dermatologist.by_city.country_placeholder')}</option>
                                {sortedCountries.map((c) => <option key={c.name} value={c.name} className="bg-brand-deep">{c.name}</option>)}
                            </select>

                            <select
                                value={selectedCityOption}
                                onChange={(e) => setSelectedCityOption(e.target.value)}
                                disabled={!selectedCountry || isLoading}
                                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-brand-primary/40 outline-none transition-all placeholder-white/20 backdrop-blur-md appearance-none cursor-pointer hover:bg-white/10"
                            >
                                <option value="" disabled className="bg-brand-deep">{t('dermatologist.by_city.city_placeholder')}</option>
                                {availableCities.map((c) => <option key={c} value={c} className="bg-brand-deep">{c}</option>)}
                                <option value="other" className="text-brand-primary font-bold bg-brand-deep">{t('dermatologist.by_city.matches_nothing')}</option>
                            </select>

                            {(selectedCityOption === 'other' || selectedCityOption === 'Autre (saisir)' || selectedCityOption === 'Capitale / Ville principale') && (
                                <input
                                    type="text"
                                    value={customCityInput}
                                    onChange={(e) => setCustomCityInput(e.target.value)}
                                    placeholder={t('dermatologist.by_city.input_placeholder')}
                                    className="w-full p-4 bg-white/5 border border-brand-primary/30 rounded-2xl focus:border-brand-primary outline-none text-white transition-all shadow-inner"
                                />
                            )}

                            <button
                                onClick={handleManualSearch}
                                disabled={isLoading || !selectedCountry}
                                className="w-full py-4 px-6 bg-gradient-to-r from-brand-primary to-[#2dd4bf] text-brand-deep font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    🔍 {t('dermatologist.by_city.button')}
                                </span>
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
                            <h3 className="text-xl font-bold text-brand-secondary tracking-widest uppercase">{t('dermatologist.list.loading_title')}</h3>
                            <p className="text-brand-primary font-mono text-sm animate-pulse">{t('dermatologist.list.loading_desc')}</p>
                        </div>
                    </motion.div>
                )}

                {!isLoading && error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-3xl mx-auto mt-8 p-8 relative z-20"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0505] via-[#1f0a0a] to-[#0a0b0d] rounded-3xl opacity-95 backdrop-blur-xl border border-red-500/20 shadow-[0_0_60px_rgba(220,38,38,0.15)]"></div>

                        <div className="relative z-30 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-red-900/5 rounded-full flex items-center justify-center mb-6 ring-1 ring-red-500/40 shadow-[0_0_30px_rgba(220,38,38,0.3)] animate-pulse-slow">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>

                            <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-4">
                                {error.includes("PERMISSION_DENIED") || error.includes("SERVICE_DISABLED") || error.includes("has not been used")
                                    ? t('dermatologist.list.api_not_enabled_title') || "API Non Activée"
                                    : t('dermatologist.list.interrupted')}
                            </h3>

                            {/* API Not Enabled Error */}
                            {(error.includes("PERMISSION_DENIED") || error.includes("SERVICE_DISABLED") || error.includes("has not been used")) && (
                                <div className="text-left w-full max-w-xl space-y-4">
                                    <p className="text-brand-secondary/90 text-sm">
                                        {t('dermatologist.list.api_not_enabled_desc') || "L'API Google Generative Language n'est pas activée pour ce projet. Veuillez suivre ces étapes :"}
                                    </p>

                                    <div className="bg-brand-deep/50 border border-brand-primary/20 rounded-xl p-4 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <span className="text-brand-primary font-bold text-lg">1.</span>
                                            <div className="flex-1">
                                                <p className="text-white text-sm font-medium mb-2">
                                                    {t('dermatologist.list.api_step_1') || "Cliquez sur le bouton ci-dessous pour activer l'API"}
                                                </p>
                                                <a
                                                    href="https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview?project=38723791540"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-brand-deep font-bold rounded-lg hover:bg-brand-primary/90 transition-all text-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    {t('dermatologist.list.api_activate_button') || "Activer l'API"}
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <span className="text-brand-primary font-bold text-lg">2.</span>
                                            <p className="text-white text-sm flex-1">
                                                {t('dermatologist.list.api_step_2') || "Cliquez sur le bouton 'ACTIVER' ou 'ENABLE' sur la page qui s'ouvre"}
                                            </p>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <span className="text-brand-primary font-bold text-lg">3.</span>
                                            <p className="text-white text-sm flex-1">
                                                {t('dermatologist.list.api_step_3') || "Attendez 1-2 minutes, puis rafraîchissez cette page"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                                        <p className="text-yellow-200 text-xs">
                                            💡 {t('dermatologist.list.api_note') || "Note : L'API est gratuite pour un usage normal (jusqu'à 1500 requêtes/jour)"}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Traffic Overload Error */}
                            {(error.includes("RESOURCE_EXHAUSTED") || error.includes("429")) && (
                                <>
                                    <p className="text-brand-secondary/80 text-base mb-6 max-w-md">
                                        {t('dermatologist.list.traffic_overload')}
                                    </p>
                                    <div className="px-4 py-2 bg-red-950/30 border border-red-500/10 rounded-lg">
                                        <p className="text-xs text-red-400 font-mono">Status: TRAFFIC_OVERLOAD_PROTECTION</p>
                                    </div>
                                </>
                            )}

                            {/* Generic Error */}
                            {!(error.includes("PERMISSION_DENIED") || error.includes("SERVICE_DISABLED") || error.includes("has not been used") || error.includes("RESOURCE_EXHAUSTED") || error.includes("429")) && (
                                <p className="text-brand-secondary/80 text-base mb-6 max-w-md">
                                    {error}
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}

                {!isLoading && !error && displayableDermatologists.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col gap-4"
                    >
                        <div className="flex items-center justify-between px-2 mb-4">
                            <h3 className="text-2xl font-display font-bold text-white tracking-tight">
                                {lastSearchLocation
                                    ? t('dermatologist.list.results_nearby').replace('{count}', displayableDermatologists.length.toString())
                                    : t('dermatologist.list.results').replace('{count}', displayableDermatologists.length.toString())
                                }
                            </h3>
                        </div>

                        {displayableDermatologists.map((derm, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass-card p-5 sm:p-6 md:p-8 rounded-3xl flex flex-col gap-4 sm:gap-5 md:gap-8 md:flex-row hover:border-brand-primary/40 relative group bg-white/5 transition-all duration-500"
                            >
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>

                                {/* Info Section */}
                                <div className="flex-1 flex flex-col gap-2 sm:gap-3 text-left min-w-0">
                                    <h4 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white group-hover:text-brand-primary transition-colors leading-tight">
                                        {derm.name}
                                    </h4>

                                    <div className="flex flex-col gap-2 sm:gap-3">
                                        {derm.address && (
                                            <div className="flex items-start gap-2 sm:gap-3 bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                                                <span className="text-brand-primary text-lg sm:text-xl mt-0.5 flex-shrink-0">📍</span>
                                                <p className="text-sm sm:text-base text-brand-secondary font-medium leading-relaxed break-words">
                                                    {derm.address}
                                                </p>
                                            </div>
                                        )}
                                        {derm.phone && (
                                            <div className="flex items-center gap-2 sm:gap-3 bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                                                <span className="text-brand-primary text-lg sm:text-xl flex-shrink-0">📞</span>
                                                <a
                                                    href={`tel:${derm.phone.replace(/[^\d+]/g, '')}`}
                                                    className="text-sm sm:text-base text-white font-bold hover:text-brand-primary transition-colors"
                                                >
                                                    {derm.phone}
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {derm.distance !== undefined && (
                                        <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-3 py-1.5 rounded-full w-fit mt-1 sm:mt-3 shadow-[0_0_15px_rgba(45,212,191,0.1)]">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                                            {t('dermatologist.list.distance').replace('{km}', derm.distance.toString())}
                                        </div>
                                    )}

                                    {derm.website && (
                                        <div className="flex gap-2 sm:gap-3 items-center mt-1 sm:mt-2">
                                            <span className="text-brand-primary opacity-80 text-sm">🌐</span>
                                            <a href={derm.website} target="_blank" rel="noopener" className="text-sm text-brand-primary hover:text-white transition-colors underline underline-offset-4">
                                                {t('dermatologist.list.visit_website')}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col justify-center items-stretch md:items-end border-t md:border-t-0 md:border-l border-white/10 pt-4 sm:pt-6 md:pt-0 md:pl-8 gap-3 sm:gap-4">
                                    <a
                                        href={derm.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group/btn relative py-3 sm:py-4 px-6 sm:px-8 rounded-2xl bg-brand-primary text-brand-deep font-bold text-sm sm:text-base hover:scale-[1.05] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3"
                                    >
                                        <span className="relative z-10">{t('dermatologist.list.get_directions')}</span>
                                        <svg className="relative z-10 w-5 h-5 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                    </a>
                                    {derm.phone && (
                                        <a
                                            href={`tel:${derm.phone.replace(/[^\d+]/g, '')}`}
                                            className="py-3 px-6 sm:px-8 rounded-2xl border border-white/20 text-white font-bold text-sm sm:text-base hover:bg-white/5 hover:border-white/40 active:scale-95 transition-all flex items-center justify-center gap-3 backdrop-blur-sm"
                                        >
                                            📞 {t('dermatologist.list.call')}
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
                        <p>{t('dermatologist.list.no_results')}</p>
                        <p className="text-sm">{t('dermatologist.list.no_results_desc')}</p>
                    </motion.div>
                )}
            </AnimatePresence>
            <p className="text-[10px] text-gray-400 text-center mt-8 uppercase tracking-widest opacity-60">Powered by Google Maps Platform</p>
        </div>
    );
};

export default DermatologistListPage;
