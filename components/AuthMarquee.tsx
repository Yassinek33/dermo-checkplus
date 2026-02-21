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
            className="w-full overflow-hidden bg-brand-deep border-y border-brand-primary/20 py-3 relative cursor-pointer group hover:bg-white/[0.02] transition-colors duration-300"
        >
            {/* Left and right gradient overlays for smooth fading edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-brand-deep to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-brand-deep to-transparent z-10 pointer-events-none" />

            <div className="flex whitespace-nowrap">
                <motion.div
                    className="flex text-sm md:text-base font-medium text-brand-primary/90 tracking-wide pr-8"
                    animate={{ x: [0, -1000] }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 20,
                            ease: "linear",
                        },
                    }}
                >
                    {[...Array(5)].map((_, i) => (
                        <span key={i} className="mr-8 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(45,212,191,0.8)] transition-all">
                            {marqueeText}
                        </span>
                    ))}
                </motion.div>
                {/* Secondary div for seamless looping */}
                <motion.div
                    className="flex text-sm md:text-base font-medium text-brand-primary/90 tracking-wide pr-8 absolute top-3 left-[1000px]"
                    animate={{ x: [0, -1000] }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 20,
                            ease: "linear",
                        },
                    }}
                >
                    {[...Array(5)].map((_, i) => (
                        <span key={i} className="mr-8 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(45,212,191,0.8)] transition-all">
                            {marqueeText}
                        </span>
                    ))}
                </motion.div>
            </div>

            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
    );
};

export default AuthMarquee; 
