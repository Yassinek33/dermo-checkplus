import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface AuthMarqueeProps {
    onNavigate: (pageId: string) => void;
}

// ─── SVG icons ────────────────────────────────────────────────────────────────
const IconShield = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const IconChart = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);
const IconStar = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);
const IconFlash = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);
const IconHeart = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);
const IconArrow = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
);
const IconUser = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
const IconSparkle = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
);

// ─── Fluorescent neon accent color ────────────────────────────────────────────
// Using bright cyan-teal for max pop
const NEON = 'rgba(0,255,200,1)';
const NEON_DIM = 'rgba(0,255,200,0.55)';

// ─── Messages — purely motivational, no technical jargon ──────────────────────
const ITEMS: Record<string, { icon: React.ReactNode; text: string }[]> = {
    fr: [
        { icon: <IconFlash />, text: 'Obtenez votre analyse cutanée en 60 secondes' },
        { icon: <IconStar />, text: 'Rejoignez plus de 50 000 utilisateurs satisfaits' },
        { icon: <IconShield />, text: 'Vos résultats sauvegardés, accessibles partout' },
        { icon: <IconHeart />, text: 'Prenez soin de votre peau dès aujourd\'hui' },
        { icon: <IconChart />, text: 'Suivez l\'évolution de votre santé cutanée' },
        { icon: <IconSparkle />, text: 'Un espace santé personnalisé, rien que pour vous' },
        { icon: <IconUser />, text: 'Créez votre profil en moins de 30 secondes' },
        { icon: <IconArrow />, text: 'Accédez à votre historique médical en un clic' },
    ],
    en: [
        { icon: <IconFlash />, text: 'Get your skin analysis in 60 seconds' },
        { icon: <IconStar />, text: 'Join over 50,000 satisfied users' },
        { icon: <IconShield />, text: 'Your results saved and accessible anywhere' },
        { icon: <IconHeart />, text: 'Take care of your skin starting today' },
        { icon: <IconChart />, text: 'Track the evolution of your skin health' },
        { icon: <IconSparkle />, text: 'A personalized health space, just for you' },
        { icon: <IconUser />, text: 'Create your profile in under 30 seconds' },
        { icon: <IconArrow />, text: 'Access your medical history in one click' },
    ],
    nl: [
        { icon: <IconFlash />, text: 'Ontvang uw huidanalyse in 60 seconden' },
        { icon: <IconStar />, text: 'Sluit u aan bij meer dan 50 000 tevreden gebruikers' },
        { icon: <IconShield />, text: 'Uw resultaten opgeslagen en overal toegankelijk' },
        { icon: <IconHeart />, text: 'Zorg vandaag nog voor uw huid' },
        { icon: <IconChart />, text: 'Volg de evolutie van uw huidgezondheid' },
        { icon: <IconSparkle />, text: 'Een gepersonaliseerde gezondheidsruimte, alleen voor u' },
        { icon: <IconUser />, text: 'Maak uw profiel aan in minder dan 30 seconden' },
        { icon: <IconArrow />, text: 'Toegang tot uw medische geschiedenis met één klik' },
    ],
    es: [
        { icon: <IconFlash />, text: 'Obtén tu análisis cutáneo en 60 segundos' },
        { icon: <IconStar />, text: 'Únete a más de 50 000 usuarios satisfechos' },
        { icon: <IconShield />, text: 'Tus resultados guardados, accesibles en cualquier lugar' },
        { icon: <IconHeart />, text: 'Cuida tu piel a partir de hoy' },
        { icon: <IconChart />, text: 'Sigue la evolución de tu salud cutánea' },
        { icon: <IconSparkle />, text: 'Un espacio de salud personalizado, solo para ti' },
        { icon: <IconUser />, text: 'Crea tu perfil en menos de 30 segundos' },
        { icon: <IconArrow />, text: 'Accede a tu historial médico con un clic' },
    ],
};

const CTA: Record<string, { action: string; sub: string; login: string }> = {
    fr: { action: 'Créer mon espace', sub: 'Gratuit · Immédiat', login: 'Se connecter' },
    en: { action: 'Create my account', sub: 'Free · Instant', login: 'Sign in' },
    nl: { action: 'Account aanmaken', sub: 'Gratis · Direct', login: 'Inloggen' },
    es: { action: 'Crear mi espacio', sub: 'Gratis · Inmediato', login: 'Iniciar sesión' },
};

// ─── Separator bead ────────────────────────────────────────────────────────────
const Dot = () => (
    <span className="inline-flex items-center flex-shrink-0 mx-6">
        <span style={{ display: 'block', width: 3, height: 3, borderRadius: '50%', background: NEON_DIM, boxShadow: `0 0 6px ${NEON}` }} />
    </span>
);

// ─── CSS keyframes injected once ─────────────────────────────────────────────
const KEYFRAMES = `
@keyframes marquee-left  { from { transform: translateX(0) } to { transform: translateX(-50%) } }
@keyframes marquee-right { from { transform: translateX(-50%) } to { transform: translateX(0) } }
`;
let keyframesInjected = false;
function ensureKeyframes() {
    if (keyframesInjected || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.innerHTML = KEYFRAMES;
    document.head.appendChild(style);
    keyframesInjected = true;
}

// ─── Scrolling track ───────────────────────────────────────────────────────────
const Track: React.FC<{
    items: { icon: React.ReactNode; text: string }[];
    reverse?: boolean;
    paused: boolean;
    speed?: number;
}> = ({ items, reverse = false, paused, speed = 32 }) => {
    useEffect(() => { ensureKeyframes(); }, []);
    const list = [...items, ...items, ...items, ...items];
    const animName = reverse ? 'marquee-right' : 'marquee-left';
    return (
        <div className="overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
            <div
                className="flex whitespace-nowrap items-center"
                style={{
                    animation: `${animName} ${speed}s linear infinite`,
                    animationPlayState: paused ? 'paused' : 'running',
                }}
            >
                {list.map((item, i) => (
                    <React.Fragment key={i}>
                        <span className="inline-flex items-center gap-2.5 flex-shrink-0 py-0.5">
                            <span style={{ color: NEON, filter: `drop-shadow(0 0 6px ${NEON})` }}>
                                {item.icon}
                            </span>
                            <span
                                className="text-[13px] md:text-[13.5px] font-light tracking-[0.04em]"
                                style={{ color: 'rgba(255,255,255,0.82)' }}
                            >
                                {item.text}
                            </span>
                        </span>
                        <Dot />
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

// ─── Main component ────────────────────────────────────────────────────────────
const AuthMarquee: React.FC<AuthMarqueeProps> = ({ onNavigate }) => {
    const { language } = useLanguage();
    const [paused, setPaused] = useState(false);

    const lang = ((language as string) || 'fr').slice(0, 2).toLowerCase();
    const items = ITEMS[lang] || ITEMS.fr;
    const cta = CTA[lang] || CTA.fr;

    return (
        <div
            className="relative w-full select-none overflow-hidden"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            style={{
                background: 'linear-gradient(180deg, #020c12 0%, #03111a 50%, #020c12 100%)',
                borderTop: `1px solid rgba(0,255,200,0.15)`,
                borderBottom: `1px solid rgba(0,255,200,0.15)`,
            }}
        >
            {/* ── Deep neon glow background ── */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 60% 100% at 50% 50%, rgba(0,255,200,0.05) 0%, transparent 80%)',
                }}
            />

            {/* ── Moving orb ── */}
            <motion.div
                className="absolute top-0 bottom-0 pointer-events-none"
                style={{
                    width: 400,
                    background: 'radial-gradient(ellipse at center, rgba(0,255,200,0.09) 0%, transparent 70%)',
                    filter: 'blur(20px)',
                }}
                animate={{ left: ['-20%', '110%'] }}
                transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut', repeatType: 'reverse' }}
            />

            {/* ── Top scan line ── */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                style={{ background: `linear-gradient(90deg, transparent, ${NEON}, transparent)`, opacity: 0.6 }}
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear', repeatDelay: 4 }}
            />

            {/* ═══ MOBILE (< md): 2 buttons on top, 1 marquee row below ═══ */}
            <div className="flex flex-col md:hidden">

                {/* ── Mobile: 2 side-by-side action buttons ── */}
                <div className="flex" style={{ borderBottom: `1px solid rgba(0,255,200,0.12)` }}>

                    {/* Créer mon espace */}
                    <motion.div
                        onClick={() => onNavigate('auth')}
                        className="flex-1 flex flex-col items-center justify-center py-3.5 gap-0.5 cursor-pointer"
                        style={{ borderRight: `1px solid rgba(0,255,200,0.12)` }}
                        whileTap={{ backgroundColor: 'rgba(0,255,200,0.07)' }}
                    >
                        <span className="text-[13.5px] font-bold tracking-[0.01em] whitespace-nowrap" style={{ color: NEON }}>
                            {cta.action}
                        </span>
                        <span className="text-[10px] font-mono tracking-[0.08em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            {cta.sub}
                        </span>
                    </motion.div>

                    {/* Se connecter */}
                    <motion.div
                        onClick={() => onNavigate('auth')}
                        className="flex-1 flex flex-col items-center justify-center py-3.5 gap-1 cursor-pointer"
                        whileTap={{ backgroundColor: 'rgba(0,255,200,0.04)' }}
                    >
                        <span className="text-[13.5px] font-semibold tracking-[0.01em] whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.72)' }}>
                            {cta.login}
                        </span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                            style={{ color: NEON_DIM }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                        </svg>
                    </motion.div>
                </div>

                {/* ── Mobile: single marquee row ── */}
                <div className="overflow-hidden py-2.5 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-6 z-10 pointer-events-none"
                        style={{ background: 'linear-gradient(to right, rgb(2,12,18), transparent)' }} />
                    <div className="absolute right-0 top-0 bottom-0 w-6 z-10 pointer-events-none"
                        style={{ background: 'linear-gradient(to left, rgb(2,12,18), transparent)' }} />
                    <Track items={items} paused={paused} speed={28} />
                </div>
            </div>

            {/* ═══ DESKTOP (md+): Left CTA | 2-row marquee | Right login ═══ */}
            <div className="hidden md:flex items-stretch">

                {/* LEFT CTA */}
                <motion.div
                    onClick={() => onNavigate('auth')}
                    className="relative flex-shrink-0 flex flex-col items-start justify-center px-7 py-4 cursor-pointer z-20 gap-2"
                    style={{ borderRight: `1px solid rgba(0,255,200,0.12)` }}
                    whileHover={{ backgroundColor: 'rgba(0,255,200,0.04)' }}
                    transition={{ duration: 0.2 }}
                >
                    <span className="text-[15px] font-semibold whitespace-nowrap tracking-[0.02em]" style={{ color: '#fff' }}>
                        {cta.action}
                    </span>
                    <motion.div className="flex items-center gap-2" whileHover={{ gap: '10px' }}>
                        <span className="text-[11px] font-mono tracking-[0.1em]" style={{ color: NEON_DIM }}>{cta.sub}</span>
                        <motion.div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ border: `1px solid ${NEON_DIM}`, color: NEON, boxShadow: `0 0 8px rgba(0,255,200,0.3)` }}
                            animate={{ boxShadow: ['0 0 6px rgba(0,255,200,0.2)', '0 0 14px rgba(0,255,200,0.6)', '0 0 6px rgba(0,255,200,0.2)'] }}
                            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                        >
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* CENTER — 2 marquee rows */}
                <div className="flex-1 overflow-hidden flex flex-col justify-center gap-2 py-3 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
                        style={{ background: 'linear-gradient(to right, rgb(3,10,16), transparent)' }} />
                    <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
                        style={{ background: 'linear-gradient(to left, rgb(3,10,16), transparent)' }} />
                    <Track items={items} paused={paused} speed={32} />
                    <div style={{ height: 1, background: `linear-gradient(90deg, transparent, rgba(0,255,200,0.12), transparent)`, flexShrink: 0, marginInline: 32 }} />
                    <Track items={[...items.slice(4), ...items.slice(0, 4)]} reverse paused={paused} speed={42} />
                </div>

                {/* RIGHT login */}
                <motion.div
                    onClick={() => onNavigate('auth')}
                    className="flex-shrink-0 flex flex-col items-end justify-center px-7 py-4 cursor-pointer z-20 gap-1.5"
                    style={{ borderLeft: `1px solid rgba(0,255,200,0.12)` }}
                    whileHover={{ backgroundColor: 'rgba(0,255,200,0.03)' }}
                    transition={{ duration: 0.2 }}
                >
                    <span className="text-[10px] font-mono tracking-[0.1em] whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        Déjà inscrit ?
                    </span>
                    <motion.div className="flex items-center gap-1.5" whileHover={{ x: -2 }} transition={{ duration: 0.15 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: NEON_DIM }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                        </svg>
                        <span className="text-[13px] font-medium whitespace-nowrap tracking-[0.03em]" style={{ color: NEON_DIM }}>
                            {cta.login}
                        </span>
                    </motion.div>
                </motion.div>
            </div>

            {/* ── Bottom scan line ── */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                style={{ background: `linear-gradient(90deg, transparent, ${NEON}, transparent)`, opacity: 0.4 }}
                animate={{ x: ['100%', '-100%'] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'linear', repeatDelay: 5 }}
            />
        </div>
    );
};

export default AuthMarquee;
