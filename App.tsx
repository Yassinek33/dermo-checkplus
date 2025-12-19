import React, { useState, useCallback, useMemo, useEffect } from 'react';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import Questionnaire from './Questionnaire';
import BlogPage from './components/BlogPage';
import ContactPage from './components/ContactPage';
import DictionaryPage from './components/DictionaryPage';
import InfoPage from './components/InfoPage';
import { appConfig } from './config';
import { PageConfig } from './types';
import MinorCheckPopup from './components/MinorCheckPopup';
import DermatologistFinder from './components/DermatologistFinder';
import DermatologistListPage from './components/DermatologistListPage';
import { DermoCheckLogo } from './components/icons';
import { searchDermatologistsWithMaps } from './services/geminiService';
import { GenerateContentResponse, LatLng } from '@google/genai';
import AppLayout from './components/AppLayout';

// --- Icons for Menu ---
const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

type PageId = string;
type UserProfile = 'adult' | 'minor' | null;

const NavItem: React.FC<{ label: string; active: boolean; onClick: () => void; mobile?: boolean }> = ({ label, active, onClick, mobile }) => {
    // Desktop styles (Dark text on Light Green header)
    const desktopBase = "px-3 py-2 text-base font-medium transition-all duration-200 ease-in-out rounded-xl whitespace-nowrap border border-transparent";
    const desktopActive = "bg-emerald-700 text-white font-bold shadow-sm border-emerald-800";
    const desktopInactive = "text-emerald-900 hover:text-emerald-950 hover:bg-emerald-200/50";

    // Mobile styles (Drawer is white)
    const mobileBase = "block w-full text-left px-4 py-3 text-lg font-medium border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors text-slate-700";
    const mobileActive = "text-emerald-800 bg-emerald-50 font-bold";
    const mobileInactive = "text-slate-700";

    const classes = mobile
        ? `${mobileBase} ${active ? mobileActive : mobileInactive}`
        : `${desktopBase} ${active ? desktopActive : desktopInactive}`;

    return (
        <button
            onClick={onClick}
            className={classes}
            aria-current={active ? "page" : undefined}
        >
            {label}
        </button>
    );
};

const App: React.FC = () => {
    const [currentPageId, setCurrentPageId] = useState<PageId>('home');
    const [userProfile, setUserProfile] = useState<UserProfile>(() => {
        return (localStorage.getItem('dermo_user_profile') as UserProfile) || null;
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // States for "Trouver un Dermato" feature
    const [dermatologistMapResults, setDermatologistMapResults] = useState<GenerateContentResponse | null>(null);
    const [isDermSearchLoading, setIsDermSearchLoading] = useState(false);
    const [dermSearchError, setDermSearchError] = useState<string | null>(null);
    const [currentSearchQuery, setCurrentSearchQuery] = useState<{ country: string; city: string }>({ country: '', city: '' });
    const [lastSearchLocation, setLastSearchLocation] = useState<LatLng | null>(null);

    useEffect(() => {
        if (userProfile) {
            localStorage.setItem('dermo_user_profile', userProfile);
        }
    }, [userProfile]);

    const navigateTo = useCallback((pageId: PageId) => {
        setCurrentPageId(pageId);
        setIsMobileMenuOpen(false); // Close menu on navigation
        // Reset state for new page if it's the dermatologist finder
        if (pageId === 'find-dermatologist') {
            setDermatologistMapResults(null);
            setIsDermSearchLoading(false);
            setDermSearchError(null);
            setCurrentSearchQuery({ country: '', city: '' });
            setLastSearchLocation(null);
        }
    }, []);

    const handleProfileSelect = useCallback((profile: 'adult' | 'minor') => {
        setUserProfile(profile);
        // Redirect immediately based on profile
        if (profile === 'adult') {
            navigateTo('questionnaire');
        } else {
            navigateTo('find-dermatologist');
        }
    }, [navigateTo]);


    // Shared callback for performing dermatologist search
    const performDermatologistSearch = useCallback(async (country: string, city: string, userLatLng?: LatLng | null) => {
        setIsDermSearchLoading(true);
        setDermSearchError(null);
        setDermatologistMapResults(null);
        setCurrentSearchQuery({ country, city });
        setLastSearchLocation(userLatLng || null); // Store the location used for this search

        try {
            const results = await searchDermatologistsWithMaps(country, city, userLatLng);
            setDermatologistMapResults(results);
        } catch (error: any) {
            console.error("Error searching for dermatologists:", error);
            setDermSearchError(error.message || "Échec de la recherche de dermatologues.");
        } finally {
            setIsDermSearchLoading(false);
        }
    }, []);

    const handleBackFromDermatologistList = useCallback(() => {
        setDermatologistMapResults(null);
        setDermSearchError(null);
        setCurrentSearchQuery({ country: '', city: '' }); // Clear search query to show finder
        setLastSearchLocation(null);
    }, []);

    const handleBackFromFinder = useCallback(() => {
        setDermatologistMapResults(null);
        setDermSearchError(null);
        setCurrentSearchQuery({ country: currentSearchQuery.country, city: '' }); // Keep country, clear city to re-show finder
        setLastSearchLocation(null);
    }, [currentSearchQuery.country]);

    const getVisibleNavItems = useMemo(() => {
        const allItems = appConfig.app.layout.header.nav;
        const isMinor = userProfile === 'minor';

        return allItems.filter(item => {
            // Rule: "Auto analyse" MUST NOT be visible for minors
            if (isMinor && item.id === 'questionnaire') {
                return false;
            }
            return true;
        });
    }, [userProfile]);

    const currentPageConfig = useMemo(() => appConfig.app.pages.find(p => p.id === currentPageId), [currentPageId]);

    // --- Render Logic with AppLayout ---
    const renderContent = () => {
        if (!currentPageConfig) return <div className="text-center text-red-600">Page non trouvée.</div>;

        // STRICT Security check for Minors accessing Questionnaire
        if (userProfile === 'minor' && currentPageId === 'questionnaire') {
            // Use setTimeout to avoid React render cycle issues when navigating during render
            setTimeout(() => navigateTo('find-dermatologist'), 0);
            return null; // Don't render anything while redirecting
        }

        switch (currentPageConfig.id) {
            case 'home':
                return <HomePage
                    config={currentPageConfig}
                    onStart={() => navigateTo(userProfile === 'minor' ? 'find-dermatologist' : 'questionnaire')}
                />;
            case 'questionnaire':
                return <Questionnaire config={currentPageConfig} />;
            case 'about':
                return <AboutPage config={currentPageConfig} />;
            case 'blog':
                return <BlogPage config={currentPageConfig} />;
            case 'dictionary':
                return <DictionaryPage config={currentPageConfig} />;
            case 'contact':
                return <ContactPage config={currentPageConfig} />;
            case 'find-dermatologist':
                return (
                    <div className="glass-panel rounded-3xl p-6 md:p-8 text-center animate-fade-in shadow-xl relative backdrop-blur-xl bg-white/70">
                        {/* Using the glass-panel class from styles.css */}
                        <h2 className="text-2xl md:text-3xl font-bold text-brand-secondary mb-6">{currentPageConfig.title}</h2>
                        {currentPageConfig.description && <p className="text-base md:text-lg text-slate-600 mb-8 max-w-2xl mx-auto">{currentPageConfig.description}</p>}

                        {dermatologistMapResults || isDermSearchLoading || dermSearchError ? (
                            <DermatologistListPage
                                dermatologistMapResults={dermatologistMapResults}
                                onBack={handleBackFromDermatologistList}
                                searchQuery={currentSearchQuery}
                                isLoading={isDermSearchLoading}
                                error={dermSearchError}
                                onSearch={performDermatologistSearch}
                                lastSearchLocation={lastSearchLocation}
                            />
                        ) : (
                            <DermatologistFinder
                                onBack={handleBackFromFinder}
                                onSearch={performDermatologistSearch}
                                isLoading={isDermSearchLoading}
                            />
                        )}
                    </div>
                );
            case 'faq':
            case 'privacy-policy':
            case 'terms-of-use':
                return <InfoPage config={currentPageConfig} />;
            default:
                return <div className="text-center text-red-600">Page non gérée.</div>;
        }
    };

    if (!userProfile) {
        return <MinorCheckPopup onConfirmAdult={() => handleProfileSelect('adult')} onConfirmMinor={() => handleProfileSelect('minor')} />;
    }

    return (
        <AppLayout
            currentPage={currentPageId}
            onNavigate={navigateTo}
            userProfile={userProfile}
            onLogout={() => {
                localStorage.removeItem('dermo_user_profile');
                setUserProfile(null);
                navigateTo('home');
            }}
        >
            {renderContent()}
        </AppLayout>
    );
};

export default App;