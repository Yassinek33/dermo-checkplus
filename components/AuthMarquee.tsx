import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface AuthMarqueeProps {
    onNavigate: (pageId: string) => void;
    user?: any;
}

const NEON = 'rgba(0,255,200,1)';
const NEON_DIM = 'rgba(0,255,200,0.55)';

// ─── Short punchy marquee items (not logged in) ────────────────────────────────
const ITEMS: Record<string, string[]> = {
    fr: [
        '⚡ Analyse IA en 60 sec',
        '🔒 Données 100% sécurisées',
        '✦ Gratuit · Sans engagement',
        '📄 Rapport PDF inclus',
        '⭐ +50 000 utilisateurs',
        '🌍 FR · NL · EN · ES',
        '⚡ Résultat immédiat',
        '✦ Inscription en 30 sec',
    ],
    en: [
        '⚡ AI analysis in 60 sec',
        '🔒 100% secure data',
        '✦ Free · No commitment',
        '📄 PDF report included',
        '⭐ +50,000 users',
        '🌍 FR · NL · EN · ES',
        '⚡ Instant result',
        '✦ Sign up in 30 sec',
    ],
    nl: [
        '⚡ AI-analyse in 60 sec',
        '🔒 100% beveiligde data',
        '✦ Gratis · Geen verplichting',
        '📄 PDF-rapport inbegrepen',
        '⭐ +50.000 gebruikers',
        '🌍 FR · NL · EN · ES',
        '⚡ Onmiddellijk resultaat',
        '✦ Aanmelden in 30 sec',
    ],
    es: [
        '⚡ Análisis IA en 60 seg',
        '🔒 Datos 100% seguros',
        '✦ Gratis · Sin compromiso',
        '📄 Informe PDF incluido',
        '⭐ +50.000 usuarios',
        '🌍 FR · NL · EN · ES',
        '⚡ Resultado inmediato',
        '✦ Registro en 30 seg',
    ],
};

// ─── CTA labels ───────────────────────────────────────────────────────────────
const CTA: Record<string, { main: string; sub: string; login: string }> = {
    fr: { main: 'Se connecter', sub: 'Inscription gratuite · 30 sec', login: 'Déjà inscrit ?' },
    en: { main: 'Sign in', sub: 'Free sign up · 30 sec', login: 'Already registered?' },
    nl: { main: 'Inloggen', sub: 'Gratis aanmelden · 30 sec', login: 'Al geregistreerd?' },
    es: { main: 'Iniciar sesión', sub: 'Registro gratuito · 30 seg', login: '¿Ya registrado?' },
};

// ─── CSS keyframes ─────────────────────────────────────────────────────────────
const KEYFRAMES = `
@keyframes marquee-left  { from { transform: translateX(0) } to { transform: translateX(-50%) } }
@keyframes marquee-right { from { transform: translateX(-50%) } to { transform: translateX(0) } }
@keyframes neon-pulse { 0%,100% { box-shadow: 0 0 12px rgba(0,255,200,0.3), 0 0 30px rgba(0,255,200,0.1); } 50% { box-shadow: 0 0 24px rgba(0,255,200,0.6), 0 0 60px rgba(0,255,200,0.25), 0 0 4px rgba(0,255,200,0.8) inset; } }
@keyframes scan-h { from { transform: translateY(-100%); opacity: 0.6; } to { transform: translateY(400%); opacity: 0; } }
`;
let injected = false;
function ensureKeyframes() {
    if (injected || typeof document === 'undefined') return;
    const s = document.createElement('style');
    s.innerHTML = KEYFRAMES;
    document.head.appendChild(s);
    injected = true;
}

// ─── Marquee track ─────────────────────────────────────────────────────────────
const Track: React.FC<{ items: string[]; reverse?: boolean; paused: boolean; speed?: number }> = ({
    items, reverse = false, paused, speed = 30,
}) => {
    useEffect(() => { ensureKeyframes(); }, []);
    const list = [...items, ...items, ...items, ...items];
    return (
        <div className="overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)' }}>
            <div
                className="flex whitespace-nowrap items-center"
                style={{
                    animation: `${reverse ? 'marquee-right' : 'marquee-left'} ${speed}s linear infinite`,
                    animationPlayState: paused ? 'paused' : 'running',
                }}
            >
                {list.map((text, i) => (
                    <React.Fragment key={i}>
                        <span className="inline-flex items-center gap-2 flex-shrink-0 py-0.5">
                            <span className="text-[12.5px] md:text-[13px] font-light tracking-[0.05em]"
                                style={{ color: 'rgba(255,255,255,0.78)' }}>
                                {text}
                            </span>
                        </span>
                        <span className="inline-flex items-center mx-5 flex-shrink-0">
                            <span style={{ display: 'block', width: 2, height: 2, borderRadius: '50%', background: NEON_DIM, boxShadow: `0 0 5px ${NEON}` }} />
                        </span>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

// ─── Logged-in welcome track (with user name) ──────────────────────────────────
const WelcomeTrack: React.FC<{ name: string; lang: string; paused: boolean }> = ({ name, lang, paused }) => {
    useEffect(() => { ensureKeyframes(); }, []);

    const messages: Record<string, string[]> = {
        fr: [
            `👋 Bienvenue, ${name} !`,
            '⚡ Lancez une nouvelle analyse',
            '📋 Consultez votre historique',
            '🔬 Résultats IA en 60 sec',
            '📍 Trouvez un dermatologue',
            `✦ Content de vous revoir, ${name}`,
            '📄 Téléchargez votre rapport PDF',
            '🌿 Prenez soin de votre peau',
        ],
        en: [
            `👋 Welcome back, ${name}!`,
            '⚡ Start a new analysis',
            '📋 Check your history',
            '🔬 AI results in 60 sec',
            '📍 Find a dermatologist',
            `✦ Good to see you, ${name}`,
            '📄 Download your PDF report',
            '🌿 Take care of your skin',
        ],
        nl: [
            `👋 Welkom terug, ${name}!`,
            '⚡ Start een nieuwe analyse',
            '📋 Bekijk uw geschiedenis',
            '🔬 AI-resultaten in 60 sec',
            '📍 Vind een dermatoloog',
            `✦ Fijn u weer te zien, ${name}`,
            '📄 Download uw PDF-rapport',
            '🌿 Zorg voor uw huid',
        ],
        es: [
            `👋 ¡Bienvenido, ${name}!`,
            '⚡ Inicia un nuevo análisis',
            '📋 Consulta tu historial',
            '🔬 Resultados IA en 60 seg',
            '📍 Encuentra un dermatólogo',
            `✦ Me alegra verte, ${name}`,
            '📄 Descarga tu informe PDF',
            '🌿 Cuida tu piel',
        ],
    };

    const items = (messages[lang] || messages.fr);
    const list = [...items, ...items, ...items, ...items];

    return (
        <div className="overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)' }}>
            <div
                className="flex whitespace-nowrap items-center"
                style={{ animation: `marquee-left 35s linear infinite`, animationPlayState: paused ? 'paused' : 'running' }}
            >
                {list.map((text, i) => (
                    <React.Fragment key={i}>
                        <span className="inline-flex items-center flex-shrink-0 py-0.5">
                            <span className="text-[13px] md:text-[13.5px] font-light tracking-[0.04em]"
                                style={{ color: i % (items.length * 2) === 0 ? NEON : 'rgba(255,255,255,0.8)' }}>
                                {text}
                            </span>
                        </span>
                        <span className="inline-flex items-center mx-5 flex-shrink-0">
                            <span style={{ display: 'block', width: 2, height: 2, borderRadius: '50%', background: NEON_DIM, boxShadow: `0 0 5px ${NEON}` }} />
                        </span>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

// ─── Futuristic CTA button (not logged in) ─────────────────────────────────────
const FuturisticCTA: React.FC<{ onClick: () => void; main: string; sub: string }> = ({ onClick, main, sub }) => {
    useEffect(() => { ensureKeyframes(); }, []);
    return (
        <motion.button
            onClick={onClick}
            className="relative flex-shrink-0 flex flex-col items-center justify-center px-6 py-3 cursor-pointer z-20 gap-1 overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, rgba(0,255,200,0.12) 0%, rgba(6,182,212,0.08) 100%)',
                borderRight: `1px solid rgba(0,255,200,0.18)`,
                minWidth: '180px',
                animation: 'neon-pulse 3s ease-in-out infinite',
                border: 'none',
                outline: 'none',
            }}
            whileHover={{ backgroundColor: 'rgba(0,255,200,0.08)' }}
            whileTap={{ scale: 0.97 }}
        >
            {/* Corner accents — futuristic HUD */}
            <span style={{ position: 'absolute', top: 5, left: 5, width: 10, height: 10, borderTop: `1.5px solid ${NEON}`, borderLeft: `1.5px solid ${NEON}`, opacity: 0.7 }} />
            <span style={{ position: 'absolute', top: 5, right: 5, width: 10, height: 10, borderTop: `1.5px solid ${NEON}`, borderRight: `1.5px solid ${NEON}`, opacity: 0.7 }} />
            <span style={{ position: 'absolute', bottom: 5, left: 5, width: 10, height: 10, borderBottom: `1.5px solid ${NEON}`, borderLeft: `1.5px solid ${NEON}`, opacity: 0.7 }} />
            <span style={{ position: 'absolute', bottom: 5, right: 5, width: 10, height: 10, borderBottom: `1.5px solid ${NEON}`, borderRight: `1.5px solid ${NEON}`, opacity: 0.7 }} />

            {/* Animated scan line */}
            <motion.span
                style={{
                    position: 'absolute', left: 0, right: 0, height: '1px',
                    background: `linear-gradient(90deg, transparent, ${NEON}, transparent)`,
                    opacity: 0.5,
                }}
                animate={{ top: ['0%', '100%'] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
            />

            {/* Text */}
            <span style={{ color: NEON, fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase', textShadow: `0 0 12px ${NEON}`, position: 'relative', zIndex: 1, whiteSpace: 'nowrap' }}>
                {main}
            </span>
            <span style={{ color: 'rgba(0,255,200,0.45)', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.08em', position: 'relative', zIndex: 1, whiteSpace: 'nowrap' }}>
                {sub}
            </span>
        </motion.button>
    );
};

// ─── Logged-in left panel ──────────────────────────────────────────────────────
const WelcomePanel: React.FC<{ name: string; lang: string; onClick: () => void }> = ({ name, lang, onClick }) => {
    const labels: Record<string, string> = {
        fr: 'Mon espace', en: 'My space', nl: 'Mijn ruimte', es: 'Mi espacio',
    };
    return (
        <motion.div
            onClick={onClick}
            className="relative flex-shrink-0 flex flex-col items-start justify-center px-6 py-3 cursor-pointer z-20 gap-0.5 overflow-hidden"
            style={{ borderRight: `1px solid rgba(0,255,200,0.12)`, minWidth: '170px' }}
            whileHover={{ backgroundColor: 'rgba(0,255,200,0.04)' }}
        >
            <span style={{ color: 'rgba(0,255,200,0.4)', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {labels[lang] || labels.fr}
            </span>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap' }}>
                👋 {name}
            </span>
            <motion.div
                style={{ height: '1px', background: `linear-gradient(90deg, ${NEON_DIM}, transparent)`, marginTop: '2px' }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
            />
        </motion.div>
    );
};

// ─── Main component ────────────────────────────────────────────────────────────
const AuthMarquee: React.FC<AuthMarqueeProps> = ({ onNavigate, user }) => {
    const { language } = useLanguage();
    const [paused, setPaused] = useState(false);

    const lang = ((language as string) || 'fr').slice(0, 2).toLowerCase();
    const isLoggedIn = !!user;

    const firstName = user?.user_metadata?.full_name?.split(' ')[0]
        || user?.email?.split('@')[0]
        || '';

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
            {/* Neon glow bg */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse 60% 100% at 50% 50%, rgba(0,255,200,0.04) 0%, transparent 80%)',
            }} />

            {/* Moving orb */}
            <motion.div
                className="absolute top-0 bottom-0 pointer-events-none"
                style={{ width: 400, background: 'radial-gradient(ellipse at center, rgba(0,255,200,0.08) 0%, transparent 70%)', filter: 'blur(20px)' }}
                animate={{ left: ['-20%', '110%'] }}
                transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut', repeatType: 'reverse' }}
            />

            {/* Top scan line */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                style={{ background: `linear-gradient(90deg, transparent, ${NEON}, transparent)`, opacity: 0.5 }}
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear', repeatDelay: 5 }}
            />

            {/* ═══ MOBILE ═══ */}
            <div className="flex flex-col md:hidden">
                {!isLoggedIn && (
                    <div className="flex" style={{ borderBottom: `1px solid rgba(0,255,200,0.12)` }}>
                        <motion.div
                            onClick={() => onNavigate('auth')}
                            className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 cursor-pointer"
                            style={{ borderRight: `1px solid rgba(0,255,200,0.12)` }}
                            whileTap={{ backgroundColor: 'rgba(0,255,200,0.07)' }}
                        >
                            <span className="text-[13px] font-bold tracking-[0.06em] uppercase whitespace-nowrap" style={{ color: NEON, textShadow: `0 0 10px ${NEON}` }}>
                                {cta.main}
                            </span>
                            <span className="text-[10px] font-mono tracking-[0.06em]" style={{ color: 'rgba(255,255,255,0.3)' }}>{cta.sub}</span>
                        </motion.div>
                        <motion.div
                            onClick={() => onNavigate('auth')}
                            className="flex-1 flex items-center justify-center py-3 gap-2 cursor-pointer"
                            whileTap={{ backgroundColor: 'rgba(0,255,200,0.04)' }}
                        >
                            <span className="text-[12px] font-medium whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.5)' }}>{cta.login}</span>
                        </motion.div>
                    </div>
                )}
                {isLoggedIn && (
                    <div className="flex items-center justify-center py-2.5" style={{ borderBottom: `1px solid rgba(0,255,200,0.1)` }}>
                        <span style={{ color: NEON, fontWeight: 700, fontSize: '13px' }}>👋 {firstName}</span>
                    </div>
                )}
                <div className="overflow-hidden py-2.5">
                    {isLoggedIn
                        ? <WelcomeTrack name={firstName} lang={lang} paused={paused} />
                        : <Track items={items} paused={paused} speed={26} />}
                </div>
            </div>

            {/* ═══ DESKTOP ═══ */}
            <div className="hidden md:flex items-stretch">

                {/* LEFT — futuristic CTA or welcome */}
                {isLoggedIn ? (
                    <WelcomePanel name={firstName} lang={lang} onClick={() => onNavigate('profile')} />
                ) : (
                    <FuturisticCTA onClick={() => onNavigate('auth')} main={cta.main} sub={cta.sub} />
                )}

                {/* CENTER — marquee */}
                <div className="flex-1 overflow-hidden flex flex-col justify-center gap-2 py-3 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
                        style={{ background: 'linear-gradient(to right, rgb(3,10,16), transparent)' }} />
                    <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
                        style={{ background: 'linear-gradient(to left, rgb(3,10,16), transparent)' }} />
                    {isLoggedIn ? (
                        <>
                            <WelcomeTrack name={firstName} lang={lang} paused={paused} />
                            <div style={{ height: 1, background: `linear-gradient(90deg, transparent, rgba(0,255,200,0.1), transparent)`, marginInline: 32 }} />
                            <WelcomeTrack name={firstName} lang={lang} paused={paused} />
                        </>
                    ) : (
                        <>
                            <Track items={items} paused={paused} speed={32} />
                            <div style={{ height: 1, background: `linear-gradient(90deg, transparent, rgba(0,255,200,0.1), transparent)`, marginInline: 32 }} />
                            <Track items={[...items.slice(4), ...items.slice(0, 4)]} reverse paused={paused} speed={40} />
                        </>
                    )}
                </div>

                {/* RIGHT — login link */}
                <motion.div
                    onClick={() => onNavigate(isLoggedIn ? 'profile' : 'auth')}
                    className="flex-shrink-0 flex flex-col items-end justify-center px-6 py-3 cursor-pointer z-20 gap-1"
                    style={{ borderLeft: `1px solid rgba(0,255,200,0.12)` }}
                    whileHover={{ backgroundColor: 'rgba(0,255,200,0.03)' }}
                >
                    <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                        {isLoggedIn
                            ? (lang === 'fr' ? 'Espace membre' : lang === 'nl' ? 'Ledengebied' : lang === 'es' ? 'Área miembro' : 'Member area')
                            : cta.login}
                    </span>
                    <motion.div className="flex items-center gap-1.5" whileHover={{ x: -2 }} transition={{ duration: 0.15 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: NEON_DIM }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                        </svg>
                        <span style={{ color: NEON_DIM, fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', letterSpacing: '0.03em' }}>
                            {isLoggedIn
                                ? (lang === 'fr' ? 'Mon profil' : lang === 'nl' ? 'Mijn profiel' : lang === 'es' ? 'Mi perfil' : 'My profile')
                                : (lang === 'fr' ? 'Se connecter' : lang === 'nl' ? 'Inloggen' : lang === 'es' ? 'Iniciar sesión' : 'Sign in')}
                        </span>
                    </motion.div>
                </motion.div>
            </div>

            {/* Bottom scan line */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                style={{ background: `linear-gradient(90deg, transparent, ${NEON}, transparent)`, opacity: 0.35 }}
                animate={{ x: ['100%', '-100%'] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'linear', repeatDelay: 5 }}
            />
        </div>
    );
};

export default AuthMarquee;
