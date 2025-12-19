
import React from 'react';
import { motion } from 'framer-motion';
import { PageConfig } from '../types';
import { appConfig } from '../config';
import { DermoCheckLogo } from './icons';
import FeaturesSection from './FeaturesSection';
import HoloCard from './HoloCard';

interface HomePageProps {
    config: PageConfig;
    onStart: () => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const HomePage: React.FC<HomePageProps> = ({ config, onStart }) => {
    const heroConfig = appConfig.app.layout.hero;

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto p-4 md:p-8 relative"
        >
            {/* Background Decor Elements - keeping them for depth */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl -z-10 animate-blob mix-blend-multiply" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl -z-10 animate-blob animation-delay-2000 mix-blend-multiply" />

            {/* Main Hero Card - Now Holographic */}
            <HoloCard>
                <div className="glass-panel w-full rounded-[2.5rem] p-8 md:p-16 text-center shadow-2xl backdrop-blur-xl bg-white/60 relative overflow-hidden">
                    {/* Hero Content */}
                    <div className="relative z-10 flex flex-col items-center">

                        {/* Logo/Icon Container - Floating */}
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="mb-8 p-6 bg-gradient-to-br from-white/80 to-white/40 rounded-3xl shadow-lg border border-white/50 backdrop-blur-sm"
                        >
                            <DermoCheckLogo size={80} className="text-brand-primary drop-shadow-md" />
                        </motion.div>

                        <h2 className="text-4xl md:text-6xl font-extrabold text-brand-secondary mb-6 leading-tight tracking-tight">
                            {heroConfig.title}
                            <span className="text-brand-primary">.</span>
                        </h2>

                        <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto font-light">
                            {heroConfig.subtitle}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                            <motion.button
                                onClick={onStart}
                                whileHover={{ scale: 1.05, boxShadow: "0 0 30px -5px rgba(0, 179, 126, 0.6)" }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-brand-primary text-white text-lg rounded-2xl font-semibold shadow-xl shadow-brand-primary/20 transition-all border border-brand-primary/50 relative overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {heroConfig.cta.label}
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                </span>
                                {/* Futuristic Scan Line on Button */}
                                <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-white/50 text-brand-secondary text-lg rounded-2xl font-semibold shadow-sm border border-white/60 backdrop-blur-sm transition-all hover:border-brand-primary/30"
                            >
                                En savoir plus
                            </motion.button>
                        </div>
                    </div>
                </div>
            </HoloCard>

            {/* Features Preview (Glass Cards) */}
            <motion.div variants={itemVariants} className="w-full mt-12">
                <h3 className="text-2xl font-bold text-brand-secondary mb-8 text-center opacity-80 tracking-wide uppercase text-sm">Technologies Nouvelle Génération</h3>
                <FeaturesSection />
            </motion.div>

        </motion.div>
    );
};

export default HomePage;

