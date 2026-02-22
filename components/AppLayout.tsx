import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import AuroraBackground from './AuroraBackground';
import { DermatoCheckLogo } from './icons';
import { Footer } from './Footer';

interface AppLayoutProps {
    children: React.ReactNode;
    userProfile: any | null;
    onLogout: () => void;
    currentPage: string;
    onNavigate: (pageId: string) => void;
    showLogo?: boolean;
    user?: any;
}

const AppLayout: React.FC<AppLayoutProps> = ({
    children,
    userProfile,
    onLogout,
    currentPage,
    onNavigate,
    showLogo = true,
    user
}) => {
    // Scroll detection for logo transparency
    const [scrollY, setScrollY] = React.useState(0);

    React.useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Calculate opacity: fully visible at top, completely disappears when scrolling (invisible at 200px)
    const logoOpacity = Math.max(0, 1 - Math.min(1, scrollY / 200));
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
        <div className="min-h-screen text-slate-100 font-sans selection:bg-brand-primary selection:text-brand-deep relative">
            {/* Ambient Background */}
            <AuroraBackground />

            {/* Logo - Centered with beautiful scroll animation - Only visible on home page */}
            {showLogo && logoOpacity > 0.01 && currentPage === 'home' && (
                <motion.div
                    initial={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
                    animate={{
                        opacity: logoOpacity,
                        scale: 0.8 + (logoOpacity * 0.2), // Shrinks as it fades
                        y: -20 * (1 - logoOpacity), // Moves up slightly as it disappears
                        x: '-50%', // Perfect centering
                        filter: `blur(${(1 - logoOpacity) * 8}px)` // Adds blur effect
                    }}
                    transition={{
                        duration: 0.4,
                        ease: [0.4, 0.0, 0.2, 1] // Custom easing for smooth animation
                    }}
                    className="fixed top-24 left-1/2 z-50 cursor-pointer group"
                    style={{
                        pointerEvents: logoOpacity < 0.1 ? 'none' : 'auto'
                    }}
                    onClick={() => onNavigate('home')}
                >
                    <div className="relative w-16 sm:w-20 md:w-24 lg:w-28">
                        <DermatoCheckLogo className="drop-shadow-[0_0_25px_rgba(45,212,191,0.6)] group-hover:scale-105 transition-transform duration-300 w-full h-auto" />
                        <div className="absolute inset-0 bg-brand-primary/20 blur-3xl -z-10 rounded-full group-hover:bg-brand-primary/30 transition-colors duration-300 opacity-60" />
                    </div>
                </motion.div>
            )}

            {/* Dynamic Navbar */}
            <Navbar
                activePage={currentPage}
                onNavigate={onNavigate}
                userProfile={userProfile}
                onLogout={onLogout}
                user={user}
            />

            {/* Main Content Area */}
            <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
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

            {/* Footer */}
            <Footer onNavigate={onNavigate} />
        </div>
    );
};

export default AppLayout;

