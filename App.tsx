import React, { useState, useCallback, useMemo, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
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
import { searchDermatologistsWithMaps } from './services/geminiService';
import { reverseGeocode } from './services/geocodingService';
import { GenerateContentResponse, LatLng } from '@google/genai';
import AppLayout from './components/AppLayout';
import { countries } from './components/CountryDropdown';
import LanguagePopup from './components/LanguagePopup';
import { useLanguage } from './context/LanguageContext';
import ConsentPopup from './components/ConsentPopup';
import { FAQPage } from './components/FAQPage';
import { DermatoCheckLogo } from './components/icons';
import { BlogListPage } from './components/BlogListPage';
import { BlogArticlePageComponent } from './components/BlogArticlePage';
import AuthPage from './components/AuthPage';
import ProfilePage from './components/ProfilePage';
import Navbar from './components/Navbar';
import { supabase } from './services/supabaseClient';

// --- Admin Imports ---
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminAuth } from './components/admin/AdminAuth';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminUsers } from './components/admin/AdminUsers';
import { AdminPosts } from './components/admin/AdminPosts';
import { AdminPages } from './components/admin/AdminPages';
import { AdminMedia } from './components/admin/AdminMedia';
import { AdminAppearance } from './components/admin/AdminAppearance';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminSEO } from './components/admin/AdminSEO';

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
type ArticleSlug = string | undefined;

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
    const { t, isLanguageSelected } = useLanguage();
    const [showSplash, setShowSplash] = useState(() => {
        return !sessionStorage.getItem('dermo_splash_shown');
    });

    const handleSplashComplete = useCallback(() => {
        sessionStorage.setItem('dermo_splash_shown', 'true');
        setShowSplash(false);
    }, []);
    const [currentPageId, setCurrentPageId] = useState<PageId>('home');
    const [currentArticleSlug, setCurrentArticleSlug] = useState<ArticleSlug>(undefined);
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

    // Supabase Auth State
    const [user, setUser] = useState<any>(null);

    // Admin State
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
        return sessionStorage.getItem('dermo_admin_auth') === 'true';
    });
    const [adminActiveTab, setAdminActiveTab] = useState('dashboard');

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user && !userProfile) {
                // If logged in, must be adult
                setUserProfile('adult');
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                // If logged in, must be adult
                setUserProfile('adult');
            }
        });

        return () => subscription.unsubscribe();
    }, [userProfile]);

    useEffect(() => {
        if (userProfile) {
            localStorage.setItem('dermo_user_profile', userProfile);
        }
    }, [userProfile]);

    const navigateTo = useCallback((pageId: PageId, articleSlug?: ArticleSlug) => {
        setCurrentPageId(pageId);
        setCurrentArticleSlug(articleSlug);
        setIsMobileMenuOpen(false); // Close menu on navigation

        // Scroll to the top of the page smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });

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
            navigateTo('home');
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
            let searchCountry = country;
            let searchCity = city;

            // WORKAROUND: Google Maps Grounding API has a bug with latLng
            // Convert coordinates to country/city using reverse geocoding
            if (userLatLng && userLatLng.latitude && userLatLng.longitude) {
                console.log("🔄 Using reverse geocoding workaround for coordinates:", userLatLng);
                const geocoded = await reverseGeocode(userLatLng.latitude, userLatLng.longitude);

                if (geocoded.error) {
                    console.error("Reverse geocoding failed:", geocoded.error);
                    setDermSearchError(`Impossible de déterminer votre emplacement: ${geocoded.error}`);
                    setIsDermSearchLoading(false);
                    return;
                }

                if (geocoded.country) {
                    searchCountry = geocoded.country;
                    searchCity = geocoded.city || "";
                    console.log(`✅ Geocoded location: ${searchCity}, ${searchCountry}`);
                    setCurrentSearchQuery({ country: searchCountry, city: searchCity });
                } else {
                    console.error("No country found in geocoding result");
                    setDermSearchError("Impossible de déterminer votre pays à partir de votre position.");
                    setIsDermSearchLoading(false);
                    return;
                }
            }

            const countryData = countries.find(c => c.name === searchCountry);
            const searchLang = countryData?.lang || 'fr';

            // Search by country/city instead of coordinates (workaround for API bug)
            const results = await searchDermatologistsWithMaps(searchCountry, searchCity, null, searchLang);
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
        // Handle blog-article route first (doesn't need config)
        if (currentPageId === 'blog-article') {
            return <BlogArticlePageComponent slug={currentArticleSlug || ''} onNavigate={navigateTo} />;
        }

        if (currentPageId === 'profile') {
            return <ProfilePage user={user} onNavigate={navigateTo} onLogout={async () => {
                await supabase.auth.signOut();
                localStorage.removeItem('dermo_user_profile');
                setUserProfile(null);
                setUser(null);
                navigateTo('home');
            }} />;
        }

        // --- Admin Zone ---
        if (currentPageId === 'admin') {
            if (!isAdminAuthenticated) {
                return (
                    <AdminAuth
                        user={user}
                        onLogin={() => {
                            setIsAdminAuthenticated(true);
                            sessionStorage.setItem('dermo_admin_auth', 'true');
                        }}
                    />
                );
            }

            return (
                <AdminLayout
                    activeTab={adminActiveTab}
                    onNavigate={setAdminActiveTab}
                    onLogoutAdmin={() => {
                        setIsAdminAuthenticated(false);
                        sessionStorage.removeItem('dermo_admin_auth');
                        navigateTo('home');
                    }}
                >
                    {adminActiveTab === 'dashboard' && <AdminDashboard onNavigate={setAdminActiveTab} />}
                    {adminActiveTab === 'posts' && <AdminPosts />}
                    {adminActiveTab === 'pages' && <AdminPages />}
                    {adminActiveTab === 'media' && <AdminMedia />}
                    {adminActiveTab === 'users' && <AdminUsers />}
                    {adminActiveTab === 'appearance' && <AdminAppearance />}
                    {adminActiveTab === 'seo' && <AdminSEO />}
                    {adminActiveTab === 'settings' && <AdminSettings />}
                </AdminLayout>
            );
        }

        if (!currentPageConfig) return <div className="text-center text-red-600">Page non trouvée.</div>;

        // STRICT Security check for Minors accessing Questionnaire
        if (userProfile === 'minor' && currentPageId === 'questionnaire') {
            // Use setTimeout to avoid React render cycle issues when navigating during render
            setTimeout(() => navigateTo('find-dermatologist'), 0);
            return null; // Don't render anything while redirecting
        }

        // Auth page is only for adults
        if (userProfile === 'minor' && currentPageId === 'auth') {
            setTimeout(() => navigateTo('home'), 0);
            return null;
        }

        switch (currentPageConfig.id) {
            case 'home':
                return <HomePage
                    config={currentPageConfig}
                    onStart={() => navigateTo(userProfile === 'minor' ? 'find-dermatologist' : 'questionnaire')}
                    onNavigate={navigateTo}
                    user={user}
                />;
            case 'questionnaire':
                return <Questionnaire config={currentPageConfig} />;
            case 'about':
                return <AboutPage config={currentPageConfig} />;
            case 'blog':
                return <BlogListPage onNavigate={navigateTo} />;
            case 'dictionary':
                return <DictionaryPage config={currentPageConfig} />;
            case 'contact':
                return <ContactPage config={currentPageConfig} />;
            case 'find-dermatologist':
                return (
                    <div className="glass-panel rounded-3xl p-8 md:p-12 text-center animate-fade-in shadow-2xl relative z-10">
                        {/* Logo - Click to go home */}
                        <div className="flex justify-center mb-8">
                            <button
                                onClick={() => navigateTo('home')}
                                className="group transition-transform duration-300 hover:scale-105 active:scale-95 focus:outline-none"
                                aria-label="Retour à l'accueil"
                            >
                                <DermatoCheckLogo size={56} className="h-auto drop-shadow-[0_0_25px_rgba(45,212,191,0.5)] group-hover:drop-shadow-[0_0_40px_rgba(45,212,191,0.7)] transition-all duration-300" />
                            </button>
                        </div>
                        {/* Using the glass-panel class from styles.css */}
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6 tracking-tight">{t('dermatologist.title')}</h2>
                        <p className="text-lg text-brand-secondary/80 mb-10 max-w-2xl mx-auto font-light leading-relaxed">{t('dermatologist.description')}</p>

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
                return <FAQPage />;
            case 'auth':
                return <AuthPage onNavigate={navigateTo} />;
            case 'privacy-policy':
            case 'terms-of-use':
            case 'legal':
                return <InfoPage config={currentPageConfig} />;
            default:
                return <div className="text-center text-red-600">Page non gérée.</div>;
        }
    };

    const [isConsentGiven, setIsConsentGiven] = useState(() => {
        return localStorage.getItem('dermo_consent_given') === 'true';
    });

    const handleConsent = useCallback(() => {
        localStorage.setItem('dermo_consent_given', 'true');
        setIsConsentGiven(true);
    }, []);

    if (showSplash) {
        return <SplashScreen onComplete={handleSplashComplete} />;
    }

    if (!isLanguageSelected) {
        return <LanguagePopup />;
    }

    if (!userProfile) {
        return <MinorCheckPopup onConfirmAdult={() => handleProfileSelect('adult')} onConfirmMinor={() => handleProfileSelect('minor')} />;
    }

    // Hide AppLayout for admin to give AdminLayout full control
    if (currentPageId === 'admin') {
        return <>{renderContent()}</>;
    }

    // Hide AppLayout for profile: gives ProfilePage full-screen layout control
    // (sidebar needs to reach screen edge, unhindered by max-w-7xl)
    if (currentPageId === 'profile') {
        const handleLogout = async () => {
            await supabase.auth.signOut();
            localStorage.removeItem('dermo_user_profile');
            setUserProfile(null);
            setUser(null);
            navigateTo('home');
        };
        return (
            <div style={{ minHeight: '100vh', background: '#060d0f', color: '#e8f4f3' }}>
                <Navbar
                    activePage="profile"
                    onNavigate={navigateTo}
                    userProfile={userProfile}
                    onLogout={handleLogout}
                    user={user}
                />
                <ProfilePage user={user} onNavigate={navigateTo} onLogout={handleLogout} />
            </div>
        );
    }

    return (
        <AppLayout
            currentPage={currentPageId}
            onNavigate={navigateTo}
            userProfile={userProfile}
            user={user}
            onLogout={async () => {
                await supabase.auth.signOut();
                localStorage.removeItem('dermo_user_profile');
                setUserProfile(null);
                setUser(null);
                navigateTo('home');
            }}
            showLogo={isConsentGiven && isLanguageSelected}
        >
            {!isConsentGiven && (
                <ConsentPopup onAccept={handleConsent} />
            )}
            {renderContent()}
        </AppLayout>
    );
};

export default App;