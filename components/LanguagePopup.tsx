import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { DermatoCheckLogo } from './icons';

const LanguagePopup: React.FC = () => {
    const { setLanguage, isLanguageSelected, t } = useLanguage();

    if (isLanguageSelected) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-4 bg-black/90 backdrop-blur-xl">
                {/* Ambient Background Glows */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full max-w-lg glass-panel p-8 md:p-12 text-center space-y-6 border border-white/10 shadow-3xl bg-brand-deep/50 overflow-hidden"
                >
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent" />

                    {/* Logo */}
                    <div className="flex justify-center mb-0">
                        <DermatoCheckLogo size={32} className="h-auto drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
                    </div>

                    <div className="space-y-2">
                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block px-3 py-1 rounded-full border border-brand-primary/20 bg-brand-primary/5 text-brand-primary text-[10px] font-mono tracking-widest uppercase mb-2"
                        >
                            Global Access / Protocol v10
                        </motion.div>
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">
                            Select <span className="text-brand-primary italic">Language</span>
                        </h2>
                        <p className="text-white/40 font-light text-sm md:text-lg">
                            Choisissez votre langue pour une expérience personnalisée.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <button
                            onClick={() => setLanguage('fr')}
                            className="group relative px-8 py-5 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                            <span className="text-xl font-display font-semibold text-white group-hover:text-brand-primary transition-colors">FRANÇAIS</span>
                            <p className="text-[10px] text-white/30 font-mono tracking-tighter mt-1 uppercase">French Interface</p>
                        </button>

                        <button
                            onClick={() => setLanguage('en')}
                            className="group relative px-8 py-5 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                            <span className="text-xl font-display font-semibold text-white group-hover:text-brand-primary transition-colors">ENGLISH</span>
                            <p className="text-[10px] text-white/30 font-mono tracking-tighter mt-1 uppercase">English Interface</p>
                        </button>
                    </div>

                    <p className="text-[9px] text-white/20 font-mono uppercase tracking-[0.3em] pt-4">
                        DermatoCheck Core Multi-Language System
                    </p>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LanguagePopup;
