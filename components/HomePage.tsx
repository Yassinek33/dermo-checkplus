import React from 'react';
import { motion } from 'framer-motion';
import { PageConfig } from '../types';
import MagneticButton from './MagneticButton';
import { BentoGrid, BentoGridItem } from './BentoGrid';

interface HomePageProps {
    config?: PageConfig;
    onStart: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStart }) => {

    // Staggered Text Reveal
    const textVariant = {
        hidden: { y: 100, opacity: 0 },
        visible: (i: number) => ({ y: 0, opacity: 1, transition: { delay: i * 0.1, duration: 0.8, ease: [0.215, 0.61, 0.355, 1] } })
    };

    return (
        <div className="flex flex-col gap-32">

            {/* HERO SECTION - Full Screen Cinematic */}
            <section className="min-h-[80vh] flex flex-col items-center justify-center text-center relative">
                <motion.div initial="hidden" animate="visible" className="relative z-10 max-w-4xl mx-auto">
                    <div className="overflow-hidden mb-2">
                        <motion.span custom={0} variants={textVariant} className="inline-block px-3 py-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 text-brand-accent text-xs font-mono uppercase tracking-widest backdrop-blur-md mb-6">
                            Medical Intelligence v4.0
                        </motion.span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-display font-bold leading-[0.9] tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">
                        <div className="overflow-hidden">
                            <motion.span custom={1} variants={textVariant} className="block">Dermatologie</motion.span>
                        </div>
                        <div className="overflow-hidden">
                            <motion.span custom={2} variants={textVariant} className="block text-brand-primary">Nouvelle Ère.</motion.span>
                        </div>
                    </h1>

                    <motion.p
                        custom={3}
                        variants={textVariant}
                        className="text-lg md:text-xl text-brand-secondary/60 max-w-2xl mx-auto font-light leading-relaxed mb-12"
                    >
                        Une précision clinique, une interface révolutionnaire.
                        <br /> L'analyse dermatologique assistée par IA, directement depuis votre salon.
                    </motion.p>

                    <motion.div custom={4} variants={textVariant} className="flex gap-4 justify-center">
                        <MagneticButton onClick={onStart}>
                            Démarrer l'analyse
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </MagneticButton>
                        <MagneticButton secondary>
                            En savoir plus
                        </MagneticButton>
                    </motion.div>
                </motion.div>
            </section>

            {/* BENTO GRID - Technology Showcase */}
            <section className="relative z-10">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Technologie de Pointe</h2>
                    <p className="text-brand-secondary/50">L'alliance de la médecine et de l'intelligence artificielle.</p>
                </div>

                <BentoGrid>
                    <BentoGridItem
                        title="Analyse Instantanée"
                        description="Notre moteur IA traite vos images en <2 secondes pour une pré-orientation immédiate."
                        header={<div className="flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-brand-primary/20 to-transparent border border-brand-primary/10" />}
                        icon={<span className="text-4xl">⚡️</span>}
                        cols={2}
                    />
                    <BentoGridItem
                        title="Sécurité Maximale"
                        description="Vos données de santé sont chiffrées de bout en bout. Confidentialité absolue."
                        header={<div className="flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-500/10" />}
                        icon={<span className="text-4xl">🔒</span>}
                    />
                    <BentoGridItem
                        title="Géolocalisation Smart"
                        description="Trouvez les experts les plus proches grâce à notre algorithme de proximité."
                        header={<div className="flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-500/20 to-transparent border border-blue-500/10" />}
                        icon={<span className="text-4xl">📍</span>}
                    />
                    <BentoGridItem
                        title="Réseau Certifié"
                        description="Accès direct aux meilleurs dermatologues de votre région."
                        header={<div className="flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-emerald-500/20 to-transparent border border-emerald-500/10" />}
                        icon={<span className="text-4xl">👨‍⚕️</span>}
                        cols={2}
                    />
                </BentoGrid>
            </section>

            {/* SCROLL TRIGGERED PROCESS STEPS */}
            <section className="py-20 relative">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Comment ça marche ?</h2>
                    <p className="text-brand-secondary/50 uppercase tracking-widest text-xs">Protocole Simple en 3 étapes</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { num: "01", title: "Photographiez", desc: "Prenez une photo nette de la zone à analyser." },
                        { num: "02", title: "Analysez", desc: "L'IA scanne les marqueurs visuels de la lésion." },
                        { num: "03", title: "Consultez", desc: "Obtenez un rapport et trouvez un spécialiste." }
                    ].map((step, i) => (
                        <div key={i} className="relative group p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="text-6xl font-display font-bold text-white/5 absolute top-4 right-6 group-hover:text-brand-primary/20 transition-colors">
                                {step.num}
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-white group-hover:text-brand-primary transition-colors">{step.title}</h3>
                            <p className="text-brand-secondary/60 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
};

export default HomePage;
