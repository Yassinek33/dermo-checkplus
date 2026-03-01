import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface AuthMarqueeProps {
    onNavigate: (pageId: string) => void;
    user?: any;
}

const NEON = 'rgba(0,255,200,1)';

const KEYFRAMES = `
@keyframes marquee-left { from { transform: translateX(0) } to { transform: translateX(-50%) } }
@keyframes neon-pulse { 0%,100% { box-shadow: 0 0 12px rgba(0,255,200,0.3), 0 0 30px rgba(0,255,200,0.1); } 50% { box-shadow: 0 0 24px rgba(0,255,200,0.6), 0 0 60px rgba(0,255,200,0.25), 0 0 4px rgba(0,255,200,0.8) inset; } }
`;
let injected = false;
function ensureKeyframes() {
    if (injected || typeof document === 'undefined') return;
    const s = document.createElement('style');
    s.innerHTML = KEYFRAMES;
    document.head.appendChild(s);
    injected = true;
}

const PHRASES: Record<string, { guest: string; welcome: string }> = {
    fr: { guest: 'CONNECTEZ-VOUS', welcome: 'BIENVENUE' },
    en: { guest: 'SIGN IN',        welcome: 'WELCOME BACK' },
    nl: { guest: 'INLOGGEN',       welcome: 'WELKOM TERUG' },
    es: { guest: 'INICIA SESIÓN',  welcome: 'BIENVENIDO' },
};

const SEP = <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: NEON, opacity: 0.5, margin: '0 32px', verticalAlign: 'middle' }} />;

const AuthMarquee: React.FC<AuthMarqueeProps> = ({ onNavigate, user }) => {
    const { language } = useLanguage();
    const [paused, setPaused] = useState(false);

    useEffect(() => { ensureKeyframes(); }, []);

    const lang = ((language as string) || 'fr').slice(0, 2).toLowerCase();
    const isLoggedIn = !!user;

    const firstName = user?.user_metadata?.full_name?.split(' ')[0]
        || user?.email?.split('@')[0]
        || '';

    const p = PHRASES[lang] || PHRASES.fr;
    const text = isLoggedIn ? `${p.welcome}, ${firstName.toUpperCase()} !` : p.guest;

    // Build a long repeating list
    const items = Array.from({ length: 12 }, (_, i) => i);

    return (
        <div
            className="relative w-full select-none overflow-hidden cursor-pointer"
            style={{
                height: 64,
                background: 'linear-gradient(180deg, #020c12 0%, #03111a 50%, #020c12 100%)',
                borderTop: `1px solid rgba(0,255,200,0.18)`,
                borderBottom: `1px solid rgba(0,255,200,0.18)`,
            }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onClick={() => onNavigate(isLoggedIn ? 'profile' : 'auth')}
        >
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse 60% 100% at 50% 50%, rgba(0,255,200,0.04) 0%, transparent 80%)',
            }} />

            {/* Scan line */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                style={{ background: `linear-gradient(90deg, transparent, ${NEON}, transparent)`, opacity: 0.4 }}
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear', repeatDelay: 6 }}
            />

            {/* Edge fades */}
            <div className="absolute left-0 top-0 bottom-0 w-20 pointer-events-none z-10"
                style={{ background: 'linear-gradient(to right, #020c12, transparent)' }} />
            <div className="absolute right-0 top-0 bottom-0 w-20 pointer-events-none z-10"
                style={{ background: 'linear-gradient(to left, #020c12, transparent)' }} />

            {/* Scrolling text */}
            <div className="absolute inset-0 flex items-center overflow-hidden">
                <div
                    className="flex items-center whitespace-nowrap"
                    style={{
                        animation: `marquee-left ${isLoggedIn ? 20 : 16}s linear infinite`,
                        animationPlayState: paused ? 'paused' : 'running',
                    }}
                >
                    {items.map((i) => (
                        <React.Fragment key={i}>
                            <span style={{
                                color: isLoggedIn ? '#fff' : NEON,
                                fontSize: 'clamp(22px, 3.5vw, 36px)',
                                fontWeight: 800,
                                letterSpacing: '0.12em',
                                textShadow: isLoggedIn ? `0 0 20px rgba(0,255,200,0.4)` : `0 0 18px ${NEON}, 0 0 40px rgba(0,255,200,0.3)`,
                                lineHeight: 1,
                                flexShrink: 0,
                            }}>
                                {text}
                            </span>
                            {SEP}
                        </React.Fragment>
                    ))}
                </div>
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
