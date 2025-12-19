import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { DermoCheckLogo } from './icons';

interface NavbarProps {
    activePage: string;
    onNavigate: (page: string) => void;
    userProfile: any;
    onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate, userProfile, onLogout }) => {
    const navItems = [
        { id: 'accueil', label: 'Accueil' },
        { id: 'nouvelle-analyse', label: 'Analyse' },
        { id: 'dermatologues', label: 'Experts' },
        { id: 'historique', label: 'Suivi' },
    ];

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-auto"
        >
            <div className="flex items-center gap-1 p-1.5 pl-6 bg-brand-deep/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-black/50">

                {/* Logo Area */}
                <div className="mr-6 flex items-center gap-2 cursor-pointer opacity-80 hover:opacity-100 transition-opacity" onClick={() => onNavigate('accueil')}>
                    <DermoCheckLogo size={24} className="text-brand-primary" />
                    <span className="font-display font-bold text-white tracking-tight hidden sm:block">DERMOCHECK</span>
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
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-accent to-purple-600 border border-white/20 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                                {userProfile.firstName?.[0] || 'U'}
                            </div>
                            <button onClick={onLogout} className="p-2 text-brand-secondary hover:text-red-400 transition-colors">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                            </button>
                        </>
                    ) : (
                        <button onClick={() => onNavigate('profile')} className="px-4 py-2 text-sm text-brand-primary font-medium hover:bg-brand-primary/10 rounded-full transition-colors">
                            Connexion
                        </button>
                    )}
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
