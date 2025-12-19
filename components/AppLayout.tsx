import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DermoCheckLogo } from '../icons'; // Assuming icons are in components/icons or similar. Adjust path if needed.

// We'll move the icons here or import them properly. 
// For now, defining simple SVG icons inline for the layout if not available.

interface AppLayoutProps {
    children: React.ReactNode;
    currentPage: string;
    onNavigate: (page: string) => void;
    userProfile: 'adult' | 'minor' | null;
    onLogout: () => void;
}

const MenuItem = ({ label, icon, active, onClick }: { label: string, icon: React.ReactNode, active: boolean, onClick: () => void }) => (
    <motion.button
        whileHover={{ scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${active
            ? 'bg-brand-primary/10 text-brand-primary font-semibold shadow-sm border border-brand-primary/20'
            : 'text-slate-600 hover:bg-brand-surface hover:text-brand-primary'
            }`}
    >
        <span className={`p-2 rounded-lg ${active ? 'bg-brand-primary text-white' : 'bg-gray-100 text-slate-400 group-hover:bg-brand-light group-hover:text-brand-primary'} transition-colors`}>
            {icon}
        </span>
        <span className="text-base tracking-wide">{label}</span>
        {active && (
            <motion.div
                layoutId="activeIndicator"
                className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary"
            />
        )}
    </motion.button>
);

const AppLayout: React.FC<AppLayoutProps> = ({ children, currentPage, onNavigate, userProfile, onLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Navigation Items
    const navItems = [
        { id: 'home', label: 'Accueil', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> },
        { id: 'questionnaire', label: 'Auto-Analyse', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>, hideForMinor: true },
        { id: 'find-dermatologist', label: 'Dermatologues', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3" /><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z" /></svg> },
        { id: 'dictionary', label: 'Dictionnaire', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> },
        { id: 'blog', label: 'Revue', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
        { id: 'contact', label: 'Contact', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> },
    ];

    const visibleItems = navItems.filter(item => !(item.hideForMinor && userProfile === 'minor'));

    return (
        <div className="flex min-h-screen bg-transparent overflow-hidden">
            {/* Desktop Sidebar (Glassmorphism) */}
            <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 p-6 z-40">
                <div className="glass-panel w-full h-full rounded-3xl flex flex-col p-6 shadow-2xl relative overflow-hidden">
                    {/* Abstract Blob Decoration */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl animate-blob" />

                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-10 z-10">
                        {/* Replace with actual logo component later */}
                        <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-brand-primary/30">
                            D
                        </div>
                        <span className="text-xl font-bold text-brand-secondary tracking-tight">DermoCheck</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2 z-10 overflow-y-auto pr-2">
                        {visibleItems.map(item => (
                            <MenuItem
                                key={item.id}
                                label={item.label}
                                icon={item.icon}
                                active={currentPage === item.id}
                                onClick={() => onNavigate(item.id)}
                            />
                        ))}
                    </nav>

                    {/* User Profile */}
                    <div className="mt-6 pt-6 border-t border-gray-100 z-10">
                        <div className="p-4 bg-white/50 rounded-xl border border-white flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-xs uppercase font-bold text-brand-primary">Mode</span>
                                <span className="text-sm font-semibold text-brand-secondary">
                                    {userProfile === 'adult' ? 'Adulte / Majeur' : 'Mineur'}
                                </span>
                            </div>
                            <button
                                onClick={onLogout}
                                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                                title="Changer de profil"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 relative flex flex-col min-w-0">
                {/* Mobile Header (Only visible on small screens) */}
                <div className="lg:hidden flex items-center justify-between p-6 z-50 sticky top-0 bg-white/80 backdrop-blur-md">
                    <span className="text-xl font-bold text-brand-secondary">DermoCheck</span>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-brand-secondary">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="lg:hidden absolute top-20 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 z-50 border border-gray-100"
                        >
                            {visibleItems.map(item => (
                                <MenuItem
                                    key={item.id}
                                    label={item.label}
                                    icon={item.icon}
                                    active={currentPage === item.id}
                                    onClick={() => {
                                        onNavigate(item.id);
                                        setIsMobileMenuOpen(false);
                                    }}
                                />
                            ))}
                            <button
                                onClick={onLogout}
                                className="w-full mt-4 p-3 text-center text-red-500 font-medium bg-red-50 rounded-xl"
                            >
                                Changer de profil
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Page Content with Transitions */}
                <div className="flex-1 p-4 lg:p-8 overflow-y-auto h-screen">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.98 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // Custom easing for "premium" feel
                            className="w-full max-w-6xl mx-auto min-h-[85vh]"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default AppLayout;
