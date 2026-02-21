import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface AuthMarqueeProps {
    onNavigate: (pageId: string) => void;
}

const AuthMarquee: React.FC<AuthMarqueeProps> = ({ onNavigate }) => {
    const { t } = useLanguage();

    const marqueeText = t('home.auth_marquee');

    return (
        <div
            onClick={() => onNavigate('auth')}
            className="w-full overflow-hidden bg-brand-deep border-y border-brand-primary/20 py-4 md:py-5 relative cursor-pointer group hover:bg-white/[0.02] transition-colors duration-300 flex items-center"
        >
            {/* Left and right gradient overlays for smooth fading edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-brand-deep to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-brand-deep to-transparent z-10 pointer-events-none" />

            {/* Container for continuous scrolling */}
            <motion.div
                className="flex whitespace-nowrap min-w-max"
                animate={{ x: [0, "-50%"] }}
                transition={{
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 30, // Adjusted for smoother reading speed
                    ease: "linear",
                }}
            >
                {/* First Set of Text */}
                <div className="flex text-base md:text-lg font-medium text-brand-primary/90 tracking-wide">
                    {[...Array(3)].map((_, i) => (
                        <span key={`first-${i}`} className="mx-8 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(45,212,191,0.8)] transition-all">
                            {marqueeText}
                        </span>
                    ))}
                </div>
                {/* Exact duplicate for seamless looping */}
                <div className="flex text-base md:text-lg font-medium text-brand-primary/90 tracking-wide">
                    {[...Array(3)].map((_, i) => (
                        <span key={`second-${i}`} className="mx-8 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(45,212,191,0.8)] transition-all">
                            {marqueeText}
                        </span>
                    ))}
                </div>
            </motion.div>

            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
    );
};

export default AuthMarquee; 
