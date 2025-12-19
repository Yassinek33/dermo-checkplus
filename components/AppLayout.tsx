import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import AuroraBackground from './AuroraBackground';

interface AppLayoutProps {
    children: React.ReactNode;
    userProfile: any | null;
    onLogout: () => void;
    currentPage: string;
    onNavigate: (pageId: string) => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({
    children,
    userProfile,
    onLogout,
    currentPage,
    onNavigate
}) => {
    return (
        <div className="min-h-screen text-slate-100 font-sans selection:bg-brand-primary selection:text-brand-deep relative">
            {/* Ambient Background */}
            <AuroraBackground />

            {/* Dynamic Navbar */}
            <Navbar
                activePage={currentPage}
                onNavigate={onNavigate}
                userProfile={userProfile}
                onLogout={onLogout}
            />

            {/* Main Content Area */}
            <AnimatePresence mode="wait">
                <motion.main
                    key={currentPage}
                    initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="pt-28 px-4 md:px-8 max-w-7xl mx-auto pb-20 relative z-10"
                >
                    {children}
                </motion.main>
            </AnimatePresence>

            {/* Cinematic Footer */}
            <footer className="fixed bottom-0 left-0 right-0 p-4 text-center text-[10px] text-white/20 font-mono uppercase tracking-[0.2em] pointer-events-none z-0 mix-blend-overlay hidden md:block">
                System Status: Operational • DermoCheck Core v4.0.1
            </footer>
        </div>
    );
};

export default AppLayout;
