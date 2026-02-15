import React from 'react';
import { motion } from 'framer-motion';
import { PageConfig } from '../types';
import MagneticButton from './MagneticButton';
import { BentoGrid, BentoGridItem } from './BentoGrid';
import { useLanguage } from '../context/LanguageContext';

interface HomePageProps {
    config?: PageConfig;
    onStart: () => void;
    onNavigate: (page: string) => void;
}

const ClinicalVisual = ({ type }: { type: 'erythema' | 'scales' | 'scalp' | 'scan' }) => {
    const images = {
        erythema: '/clinical-face.png',
        scales: '/clinical-forehead.png',
        scalp: '/clinical-back-exam.jpg',
        scan: '/clinical-texture.png'
    };

    return (
        <div className="flex-1 w-full h-full min-h-[200px] rounded-t-xl overflow-hidden relative group bg-[#0C0C0E]">
            <img
                src={images[type]}
                alt={`Clinical ${type}`}
                className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
            />

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-full border border-brand-primary/5 relative overflow-hidden">
                    {/* Digital Grid Overlay */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(45,212,191,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.05) 1px, transparent 1px)', backgroundSize: '15px 15px' }} />

                    {/* Scanning Line */}
                    <motion.div
                        animate={{ opacity: [0.2, 0.8, 0.2], top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-x-0 h-px bg-brand-primary shadow-[0_0_15px_rgba(45,212,191,0.8)] z-20"
                    />
                </div>
            </div>

            {/* Deep fade for text visibility */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-deep via-brand-deep/80 to-transparent z-10" />
            <div className="absolute inset-0 border-x border-t border-white/5 rounded-t-xl z-30" />
        </div>
    );
};

const SecurityVisual = () => (
    <div className="flex-1 w-full h-full min-h-[8rem] rounded-xl bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/10 overflow-hidden relative flex items-center justify-center">
        <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute w-32 h-32 rounded-full bg-purple-500 blur-3xl"
        />
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-400 relative z-10">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <motion.path
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                d="M9 12l2 2 4-4"
                strokeWidth="2"
            />
        </svg>
    </div>
);

const RadarVisual = () => (
    <div className="flex-1 w-full h-full min-h-[8rem] rounded-xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10 overflow-hidden relative flex items-center justify-center">
        {[0, 1, 2].map((i) => (
            <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 1, ease: "easeOut" }}
                className="absolute w-12 h-12 rounded-full border border-blue-500/40"
            />
        ))}
        <div className="relative z-10 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
    </div>
);

const HomePage: React.FC<HomePageProps> = ({ config, onStart, onNavigate }) => {
    const { t, language } = useLanguage();

    return (
        <div className="min-h-screen bg-brand-deep text-white px-4 md:px-8 lg:px-12 py-12 md:py-24 space-y-24 md:space-y-32">

            {/* HERO SECTION */}
            <section className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-12 pt-8 md:pt-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-6"
                >

                    <h1 className="text-5xl md:text-8xl lg:text-9xl font-display font-bold tracking-tight leading-[0.9] text-white">
                        DERMO<span className="text-brand-primary italic">CHECK</span>
                    </h1>

                    <p className="text-lg md:text-2xl text-brand-secondary/60 max-w-2xl mx-auto font-light leading-relaxed">
                        {t('home.hero.subtitle')}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="flex flex-wrap items-center justify-center gap-6"
                >
                    <MagneticButton onClick={onStart} className="px-10 py-5 bg-brand-primary text-brand-deep font-bold rounded-2xl text-lg hover:shadow-2xl hover:shadow-brand-primary/20 transition-all duration-300">
                        {t('home.hero.cta_start')}
                    </MagneticButton>
                    <button
                        onClick={() => onNavigate('find-dermatologist')}
                        className="px-10 py-5 border border-white/10 hover:bg-white/5 text-white font-medium rounded-2xl text-lg transition-all duration-300 backdrop-blur-sm"
                    >
                        {t('home.hero.cta_clinics')}
                    </button>
                </motion.div>
            </section>

            {/* MOBILE PROTOCOL CAROUSEL (Visible only on Mobile) */}
            <section className="block md:hidden w-full overflow-hidden py-8">
                <div className="mb-6 text-center px-4">
                    <p className="text-brand-secondary/40 font-mono text-xs uppercase tracking-[0.2em]">{t('home.protocol.subtitle')}</p>
                </div>

                <div className="relative flex w-full h-[320px] items-center">
                    {/* Gradients to fade edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-brand-deep via-brand-deep/80 to-transparent z-20 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-brand-deep via-brand-deep/80 to-transparent z-20 pointer-events-none" />

                    {/* CENTER FOCUS SCANNER */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] z-30 pointer-events-none flex items-center justify-center">
                        <div className="w-full h-full rounded-[1.8rem] border border-brand-primary/30 shadow-[0_0_30px_rgba(45,212,191,0.15)] bg-brand-primary/[0.02] relative overflow-hidden">
                            {/* Scanning line animation */}
                            <motion.div
                                animate={{ top: ["0%", "100%", "0%"] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent shadow-[0_0_15px_rgba(45,212,191,0.5)]"
                            />
                            {/* Corner accents */}
                            <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-brand-primary/50 rounded-tl-lg" />
                            <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-brand-primary/50 rounded-tr-lg" />
                            <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-brand-primary/50 rounded-bl-lg" />
                            <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-brand-primary/50 rounded-br-lg" />
                        </div>
                    </div>

                    <motion.div
                        className="flex delay-0"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 40
                        }}
                        style={{ width: "max-content" }}
                    >
                        {[...Array(4)].map((_, setIndex) => (
                            <div key={setIndex} className="flex gap-4 px-2">
                                {[
                                    { num: "01", title: t('home.protocol.step1.title'), desc: t('home.protocol.step1.desc') },
                                    { num: "02", title: t('home.protocol.step2.title'), desc: t('home.protocol.step2.desc') },
                                    { num: "03", title: t('home.protocol.step3.title'), desc: t('home.protocol.step3.desc') },
                                    { num: "04", title: t('home.protocol.step4.title'), desc: t('home.protocol.step4.desc') }
                                ].map((step, i) => (
                                    <div
                                        key={`${setIndex}-${i}`}
                                        className="relative flex-shrink-0 w-[280px] h-[280px] p-6 rounded-[1.8rem] bg-white/[0.02] border border-white/5 overflow-hidden flex flex-col justify-center group"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary/50" />
                                        <div className="text-5xl font-display font-bold text-white/[0.05] absolute -top-2 -right-2">
                                            {step.num}
                                        </div>
                                        <h3 className="text-lg font-bold mb-2 text-white flex items-center gap-2">
                                            {step.title}
                                        </h3>
                                        <p className="text-brand-secondary/60 text-xs leading-relaxed font-light">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* BRAND SHOWCASE - Clinical Style (Hidden on Mobile) */}
            <section className="hidden md:block relative h-[60vh] md:h-[80vh] w-full overflow-hidden rounded-[3rem] border border-white/10 shadow-3xl bg-[#080809]">
                <div className="absolute inset-0 z-0">
                    <img
                        src={language === 'fr' ? '/clinical-expertise-fr.png' : '/clinical-expertise-en.png'}
                        alt={language === 'fr' ? 'Analyse Expertise Clinique' : 'Clinical Expertise Analysis'}
                        className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/60 via-transparent to-transparent" />

                    {/* Digital Scan Layer */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(45,212,191,0.2) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                    <motion.div
                        animate={{ top: ["-100%", "200%"] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-primary to-transparent shadow-[0_0_30px_rgba(45,212,191,1)] z-10"
                    />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 pb-4 md:px-16 md:pt-16 md:pb-2 z-10 flex flex-col md:flex-row items-end justify-between gap-8">
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="max-w-2xl"
                    >
                        <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-2 leading-tight">
                            {t('home.showcase.title').split(' ')[0]} <span className="text-brand-primary">{t('home.showcase.title').split(' ').slice(1).join(' ')}</span>
                        </h2>
                        <p className="text-lg text-white/60 font-light leading-relaxed">
                            {t('home.showcase.description')}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                        className="flex items-center gap-4"
                    >
                        <div className="h-12 w-px bg-brand-primary" />
                        <span className="text-sm font-mono uppercase tracking-[0.5em] text-brand-primary whitespace-nowrap">
                            {t('home.showcase.badge')}
                        </span>
                    </motion.div>
                </div>
            </section>

            {/* BENTO GRID - Technology Showcase (Hidden on Mobile) */}
            <section className="hidden md:block relative z-10">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 tracking-tight">{t('home.bento.title')}</h2>
                    <p className="text-brand-secondary/40 text-sm md:text-base font-light font-mono uppercase tracking-[0.3em]">{t('home.bento.subtitle')}</p>
                </div>

                <BentoGrid>
                    {/* Row 1 & 2 Left: Erythema (Face) - Tall */}
                    <BentoGridItem
                        title={t('home.bento.erythema.title')}
                        description={t('home.bento.erythema.desc')}
                        header={<ClinicalVisual type="erythema" />}
                        icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-primary"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>}
                        cols={1}
                        rows={2}
                    />

                    {/* Row 1 Right: Scales (Forehead) - Wide */}
                    <BentoGridItem
                        title={t('home.bento.scales.title')}
                        description={t('home.bento.scales.desc')}
                        header={<ClinicalVisual type="scales" />}
                        icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                        cols={2}
                        rows={1}
                    />

                    {/* Row 2 Center: Security - Square */}
                    <BentoGridItem
                        title={t('home.bento.security.title')}
                        description={t('home.bento.security.desc')}
                        header={
                            <div className="flex-1 w-full h-full min-h-[8rem] rounded-xl overflow-hidden relative">
                                <img
                                    src="/data-security-new.png"
                                    alt="Data Security"
                                    className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                        }
                        icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>}
                        cols={1}
                        rows={1}
                    />

                    {/* Row 2 Right: Radar - Square */}
                    <BentoGridItem
                        title={t('home.bento.radar.title')}
                        description={t('home.bento.radar.desc')}
                        header={
                            <div className="flex-1 w-full h-full min-h-[8rem] rounded-xl overflow-hidden relative">
                                <img
                                    src="/scalp-analysis.png"
                                    alt="Scalp Analysis"
                                    className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                        }
                        icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>}
                        cols={1}
                        rows={1}
                    />

                    {/* Row 3 Full: Scalp (Arm) - Banner */}
                    <BentoGridItem
                        title={t('home.bento.scalp.title')}
                        description={t('home.bento.scalp.desc')}
                        header={<ClinicalVisual type="scalp" />}
                        icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-400"><path d="M12 2v20M2 12h20M5.3 5.3l13.4 13.4M18.7 5.3L5.3 18.7" /></svg>}
                        cols={3}
                        rows={1}
                    />
                </BentoGrid>
            </section>

            {/* SCROLL TRIGGERED PROCESS STEPS (Hidden on Mobile) */}
            <section className="hidden md:block py-20 relative">
                <div className="mb-20 text-center">
                    <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 tracking-tight">{t('home.protocol.title')}</h2>
                    <p className="text-brand-secondary/40 font-mono text-xs uppercase tracking-[0.4em]">{t('home.protocol.subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-8">
                    {[
                        { num: "01", title: t('home.protocol.step1.title'), desc: t('home.protocol.step1.desc') },
                        { num: "02", title: t('home.protocol.step2.title'), desc: t('home.protocol.step2.desc') },
                        { num: "03", title: t('home.protocol.step3.title'), desc: t('home.protocol.step3.desc') },
                        { num: "04", title: t('home.protocol.step4.title'), desc: t('home.protocol.step4.desc') }
                    ].map((step, i) => (
                        <div key={i} className="relative group p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all duration-500 overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-0 bg-brand-primary group-hover:h-full transition-all duration-700" />
                            <div className="text-7xl font-display font-bold text-white/[0.03] absolute -top-4 -right-4 group-hover:text-brand-primary/[0.08] transition-colors duration-700">
                                {step.num}
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-white group-hover:text-brand-primary transition-colors flex items-center gap-3">
                                <span className="w-6 h-px bg-white/20 group-hover:w-10 group-hover:bg-brand-primary transition-all duration-500" />
                                {step.title}
                            </h3>
                            <p className="text-brand-secondary/50 text-sm leading-relaxed font-light">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
};

export default HomePage;
