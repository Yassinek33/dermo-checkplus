import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { DermatoCheckLogo } from './icons';

import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
    activePage: string;
    onNavigate: (page: string) => void;
    userProfile: any;
    onLogout: () => void;
    user?: any; // Add user prop
}

const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate, userProfile, onLogout, user }) => {
    const { language, setLanguage, t } = useLanguage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { id: 'home', label: t('common.nav.home') },
        { id: 'find-dermatologist', label: t('common.nav.find_derm') },
        { id: 'blog', label: t('common.nav.blog') },
    ];

    const handleNavigate = (page: string) => {
        onNavigate(page);
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            {/* Desktop Navbar */}
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-auto hidden md:block"
            >
                <div className="flex items-center gap-1 p-1 pl-3 bg-brand-deep/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-black/50">

                    {/* Language Switcher */}
                    <div className="mr-2 flex items-center bg-white/5 rounded-full p-1 border border-white/10">
                        <button
                            onClick={() => setLanguage('fr')}
                            className={clsx(
                                "px-2 py-1 text-[10px] font-bold rounded-full transition-all duration-300",
                                language === 'fr' ? "bg-brand-primary text-brand-deep" : "text-white/40 hover:text-white"
                            )}
                        >
                            FR
                        </button>
                        <button
                            onClick={() => setLanguage('en')}
                            className={clsx(
                                "px-2 py-1 text-[10px] font-bold rounded-full transition-all duration-300",
                                language === 'en' ? "bg-brand-primary text-brand-deep" : "text-white/40 hover:text-white"
                            )}
                        >
                            EN
                        </button>
                        <button
                            onClick={() => setLanguage('nl')}
                            className={clsx(
                                "px-2 py-1 text-[10px] font-bold rounded-full transition-all duration-300",
                                language === 'nl' ? "bg-brand-primary text-brand-deep" : "text-white/40 hover:text-white"
                            )}
                        >
                            NL
                        </button>
                        <button
                            onClick={() => setLanguage('es')}
                            className={clsx(
                                "px-2 py-1 text-[10px] font-bold rounded-full transition-all duration-300",
                                language === 'es' ? "bg-brand-primary text-brand-deep" : "text-white/40 hover:text-white"
                            )}
                        >
                            ES
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center bg-white/5 rounded-full p-1 relative">
                        {navItems.map((item) => (
                            <div key={item.id} className="relative z-10">
                                <button
                                    onClick={() => onNavigate(item.id)}
                                    className={clsx(
                                        "relative px-3 py-1.5 text-[13px] font-medium transition-colors duration-300 rounded-full",
                                        activePage === item.id ? "text-brand-deep" : "text-brand-secondary hover:text-white"
                                    )}
                                >
                                    {activePage === item.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-brand-primary rounded-full -z-10 mix-blend-normal"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    {item.label}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Profile Switch + Sign In Icons */}
                    <div className="ml-2 pl-2 border-l border-white/10 flex items-center gap-1 pr-2">
                        {/* Profile switch (mineur/majeur) - Only show if NOT logged in */}
                        {!user && (
                            <button
                                onClick={onLogout}
                                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300"
                                title={userProfile === 'adult' ? t('auth.switch_to_minor') : t('auth.switch_to_adult')}
                            >
                                {userProfile === 'adult' ? (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        </svg>
                                        <span className="text-[10px] font-bold bg-brand-primary text-brand-deep px-1 rounded-sm">18+</span>
                                    </>
                                ) : (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                            <path d="M8 11h.01" />
                                            <path d="M16 11h.01" />
                                            <path d="M12 16a4 4 0 0 0 0-3" />
                                        </svg>
                                        <span className="text-[10px] font-bold bg-rose-400 text-brand-deep px-1 rounded-sm">-18</span>
                                    </>
                                )}
                            </button>
                        )}
                        {/* Sign In (adults only) */}
                        {/* Sign In / Profile (adults only) */}
                        {userProfile === 'adult' && (
                            <button
                                onClick={() => user ? onNavigate('profile') : onNavigate('auth')}
                                className={clsx(
                                    "rounded-full transition-all duration-300 flex items-center justify-center",
                                    user
                                        // Logged in: solid teal bg + dark text = initials always visible
                                        ? "w-9 h-9 bg-brand-primary text-brand-deep font-bold border border-brand-primary/30"
                                        // Not logged in: standard icon button
                                        : clsx(
                                            "p-2",
                                            activePage === 'auth' || activePage === 'profile'
                                                ? "bg-brand-primary text-brand-deep"
                                                : "text-brand-secondary hover:text-white hover:bg-white/10"
                                        )
                                )}
                                title={user ? "Mon Profil" : t('auth.tab_login')}
                            >
                                {user ? (
                                    <span className="text-xs font-bold leading-none">
                                        {user.user_metadata?.full_name
                                            ? user.user_metadata.full_name.split(' ').map((n: any) => n[0]).join('').substring(0, 2).toUpperCase()
                                            : user.email?.substring(0, 2).toUpperCase()}
                                    </span>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                )}
                            </button>
                        )}

                    </div>
                </div>
            </motion.nav>

            {/* Mobile Navbar */}
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="fixed top-0 left-0 right-0 z-40 md:hidden"
            >
                <div className="flex items-center justify-end p-4 pl-40 bg-brand-deep/95 backdrop-blur-xl border-b border-white/10">
                    {/* Hamburger Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <div className="w-5 h-4 flex flex-col justify-between">
                            <motion.span
                                animate={isMobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                                className="w-full h-0.5 bg-brand-primary rounded-full"
                            />
                            <motion.span
                                animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                                className="w-full h-0.5 bg-brand-primary rounded-full"
                            />
                            <motion.span
                                animate={isMobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                                className="w-full h-0.5 bg-brand-primary rounded-full"
                            />
                        </div>
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-0 bottom-0 w-[280px] bg-brand-deep border-l border-white/10 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex flex-col h-full p-6 pt-20">
                                {/* Language Switcher */}
                                <div className="mb-8 grid grid-cols-2 gap-2 bg-white/5 rounded-2xl p-2 border border-white/10">
                                    <button
                                        onClick={() => setLanguage('fr')}
                                        className={clsx(
                                            "w-full px-4 py-2 text-xs font-bold rounded-xl transition-all duration-300",
                                            language === 'fr' ? "bg-brand-primary text-brand-deep" : "text-white/40 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        Français
                                    </button>
                                    <button
                                        onClick={() => setLanguage('en')}
                                        className={clsx(
                                            "w-full px-4 py-2 text-xs font-bold rounded-xl transition-all duration-300",
                                            language === 'en' ? "bg-brand-primary text-brand-deep" : "text-white/40 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        English
                                    </button>
                                    <button
                                        onClick={() => setLanguage('nl')}
                                        className={clsx(
                                            "w-full px-4 py-2 text-xs font-bold rounded-xl transition-all duration-300",
                                            language === 'nl' ? "bg-brand-primary text-brand-deep" : "text-white/40 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        Nederlands
                                    </button>
                                    <button
                                        onClick={() => setLanguage('es')}
                                        className={clsx(
                                            "w-full px-4 py-2 text-xs font-bold rounded-xl transition-all duration-300",
                                            language === 'es' ? "bg-brand-primary text-brand-deep" : "text-white/40 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        Español
                                    </button>
                                </div>

                                {/* Navigation Items */}
                                <div className="flex-1 space-y-2">
                                    {navItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleNavigate(item.id)}
                                            className={clsx(
                                                "w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-300",
                                                activePage === item.id
                                                    ? "bg-brand-primary text-brand-deep"
                                                    : "text-brand-secondary hover:bg-white/5 hover:text-white"
                                            )}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Profile Switch + Sign In */}
                                <div className="pt-6 border-t border-white/10 space-y-3">
                                    {/* Profile switch (mineur/majeur) - Only show if NOT logged in */}
                                    {!user && (
                                        <button
                                            onClick={() => {
                                                onLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium text-white/70 bg-white/5 hover:bg-white/10 transition-all duration-300"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                            </svg>
                                            {userProfile === 'adult' ? t('auth.switch_to_minor') : t('auth.switch_to_adult')}
                                        </button>
                                    )}
                                    {/* Sign In (adults only) */}
                                    {userProfile === 'adult' && (
                                        <button
                                            onClick={() => {
                                                if (user) handleNavigate('profile');
                                                else handleNavigate('auth');
                                            }}
                                            className={clsx(
                                                "w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300",
                                                activePage === 'auth' || activePage === 'profile'
                                                    ? "bg-brand-primary text-brand-deep"
                                                    : "text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20"
                                            )}
                                        >
                                            {user ? (
                                                <>
                                                    <span className="w-6 h-6 rounded-full bg-brand-primary text-brand-deep flex items-center justify-center text-xs font-bold border border-white/20">
                                                        {user.user_metadata?.full_name
                                                            ? user.user_metadata.full_name.split(' ').map((n: any) => n[0]).join('').substring(0, 2).toUpperCase()
                                                            : user.email?.substring(0, 2).toUpperCase()}
                                                    </span>
                                                    Mon Profil
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                        <circle cx="12" cy="7" r="4" />
                                                    </svg>
                                                    {t('auth.tab_login')} / {t('auth.tab_signup')}
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence >
        </>
    );
};

export default Navbar;

