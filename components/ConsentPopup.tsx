import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { DermatoCheckLogo } from './icons';

interface ConsentPopupProps {
    onAccept: () => void;
}

const ConsentPopup: React.FC<ConsentPopupProps> = ({ onAccept }) => {
    const { t } = useLanguage();
    const [checks, setChecks] = useState({
        analysis: false,
        cookies: false
    });

    const allChecked = checks.analysis && checks.cookies;

    const toggleCheck = (key: keyof typeof checks) => {
        setChecks(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-4 pb-8 bg-black/90 backdrop-blur-xl overflow-y-auto">
                {/* Ambient Background Glows - Matching Dark/Luxury Theme */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full max-w-lg glass-panel p-6 md:p-10 space-y-6 border border-white/10 shadow-3xl bg-brand-deep/50 overflow-hidden rounded-3xl flex-shrink-0 my-auto"
                >
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent" />

                    {/* Logo */}
                    <div className="flex justify-center mb-0">
                        <DermatoCheckLogo size={28} className="h-auto drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
                    </div>

                    <div className="text-center space-y-4">
                        <div className="inline-block px-3 py-1 rounded-full border border-brand-primary/20 bg-brand-primary/5 text-brand-primary text-[10px] font-mono tracking-widest uppercase mb-2">
                            Strict Confidentiality Protocol
                        </div>
                        <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
                            {t('consent.title')}
                        </h2>
                        <p className="text-brand-secondary/80 font-light text-sm leading-relaxed whitespace-pre-line">
                            {t('consent.description')}
                        </p>
                    </div>

                    <div className="space-y-4 pt-2">
                        {/* Checkbox 1 */}
                        <div
                            onClick={() => toggleCheck('analysis')}
                            className={`group flex gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer ${checks.analysis ? 'bg-brand-primary/10 border-brand-primary/30' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                        >
                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${checks.analysis ? 'bg-brand-primary border-brand-primary' : 'border-white/20'}`}>
                                {checks.analysis && <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                            </div>
                            <p className="text-sm text-brand-secondary/90 font-light leading-relaxed">
                                {t('consent.checkboxes.analysis')}
                            </p>
                        </div>

                        {/* Checkbox 2 */}
                        <div
                            onClick={() => toggleCheck('cookies')}
                            className={`group flex gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer ${checks.cookies ? 'bg-brand-primary/10 border-brand-primary/30' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                        >
                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${checks.cookies ? 'bg-brand-primary border-brand-primary' : 'border-white/20'}`}>
                                {checks.cookies && <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                            </div>
                            <p className="text-sm text-brand-secondary/90 font-light leading-relaxed">
                                {t('consent.checkboxes.cookies')}
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 space-y-4">
                        <button
                            disabled={!allChecked}
                            onClick={allChecked ? onAccept : undefined}
                            className={`w-full py-4 rounded-xl font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${allChecked
                                ? 'bg-brand-primary text-brand-deep hover:bg-brand-primary/90 shadow-[0_0_20px_rgba(45,212,191,0.3)] scale-100'
                                : 'bg-red-500/10 border border-red-500/20 text-red-400 cursor-not-allowed'
                                }`}
                        >
                            {!allChecked ? (
                                <>
                                    <span>{t('consent.buttons.decline')}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </>
                            ) : (
                                <>
                                    <span>{t('consent.buttons.accept')}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </>
                            )}
                        </button>

                        {/* Footer Text */}
                        <div className="text-center text-[10px] text-brand-secondary/40 font-light leading-relaxed whitespace-pre-line px-4">
                            {t('consent.footer')}
                        </div>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConsentPopup;
