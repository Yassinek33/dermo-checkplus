import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { DermoCheckLogo } from './icons';

import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
    activePage: string;
    onNavigate: (page: string) => void;
    userProfile: any;
    onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate, userProfile, onLogout }) => {
    const { language, setLanguage, t } = useLanguage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { id: 'home', label: t('common.nav.home') },
        { id: 'questionnaire', label: t('common.nav.analysis') },
        { id: 'find-dermatologist', label: t('common.nav.find_derm') },
        { id: 'blog', label: 'Blog' },
        { id: 'about', label: t('common.nav.about') },
        { id: 'legal', label: t('common.nav.legal') },
        { id: 'contact', label: t('common.nav.contact') },
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
                <div className="flex items-center gap-1 p-1.5 pl-4 bg-brand-deep/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-black/50">

                    {/* Language Switcher */}
                    <div className="mr-4 flex items-center bg-white/5 rounded-full p-1 border border-white/10">
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
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center bg-white/5 rounded-full p-1 relative">
                        {navItems.map((item) => (
                            <div key={item.id} className="relative z-10">
                                <button
                                    onClick={() => onNavigate(item.id)}
                                    className={clsx(
                                        "relative px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-full",
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

                    {/* User Profile / Logout */}
                    <div className="ml-2 pl-2 border-l border-white/10 flex items-center gap-2 pr-2">
                        {userProfile ? (
                            <>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-cyan-500 border border-white/20 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                                    {userProfile === 'adult' ? 'A' : userProfile === 'minor' ? 'M' : 'U'}
                                </div>
                                <button onClick={onLogout} className="p-2 text-brand-secondary hover:text-red-400 transition-colors">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                </button>
                            </>
                        ) : (
                            <button onClick={() => onNavigate('profile')} className="px-4 py-2 text-sm text-brand-primary font-medium hover:bg-brand-primary/10 rounded-full transition-colors">
                                {t('common.login')}
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
                                <div className="mb-8 flex items-center justify-center gap-2 bg-white/5 rounded-full p-1 border border-white/10">
                                    <button
                                        onClick={() => setLanguage('fr')}
                                        className={clsx(
                                            "flex-1 px-4 py-2 text-xs font-bold rounded-full transition-all duration-300",
                                            language === 'fr' ? "bg-brand-primary text-brand-deep" : "text-white/40"
                                        )}
                                    >
                                        Français
                                    </button>
                                    <button
                                        onClick={() => setLanguage('en')}
                                        className={clsx(
                                            "flex-1 px-4 py-2 text-xs font-bold rounded-full transition-all duration-300",
                                            language === 'en' ? "bg-brand-primary text-brand-deep" : "text-white/40"
                                        )}
                                    >
                                        English
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

                                {/* User Profile / Logout */}
                                <div className="pt-6 border-t border-white/10">
                                    {userProfile ? (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-cyan-500 border border-white/20 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                                                    {userProfile === 'adult' ? 'A' : userProfile === 'minor' ? 'M' : 'U'}
                                                </div>
                                                <span className="text-white font-medium">{userProfile.firstName}</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    onLogout();
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className="p-2 text-brand-secondary hover:text-red-400 transition-colors"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                                    <polyline points="16 17 21 12 16 7"></polyline>
                                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleNavigate('profile')}
                                            className="w-full px-4 py-3 text-center text-brand-primary font-medium bg-brand-primary/10 hover:bg-brand-primary/20 rounded-xl transition-colors"
                                        >
                                            {t('common.login')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;

