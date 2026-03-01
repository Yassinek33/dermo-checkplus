import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface AuthMarqueeProps {
    onNavigate: (pageId: string) => void;
    user?: any;
}

const KEYFRAMES = `
@keyframes marquee-left { from { transform: translateX(0) } to { transform: translateX(-50%) } }
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
    fr: { guest: 'CONNECTEZ-VOUS',  welcome: 'BIENVENUE' },
    en: { guest: 'SIGN IN',         welcome: 'WELCOME BACK' },
    nl: { guest: 'INLOGGEN',        welcome: 'WELKOM TERUG' },
    es: { guest: 'INICIA SESIÓN',   welcome: 'BIENVENIDO' },
};

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

    const items = Array.from({ length: 14 }, (_, i) => i);

    const SEP = (
        <span style={{
            display: 'inline-block',
            width: 3, height: 3,
            borderRadius: '50%',
            background: 'rgba(45,212,191,0.4)',
            margin: '0 40px',
            verticalAlign: 'middle',
            flexShrink: 0,
        }} />
    );

    return (
        <div
            className="relative w-full select-none overflow-hidden cursor-pointer"
            style={{
                height: 72,
                background: 'rgba(3,3,5,0.6)',
                borderTop: '1px solid rgba(45,212,191,0.12)',
                borderBottom: '1px solid rgba(45,212,191,0.12)',
            }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onClick={() => onNavigate(isLoggedIn ? 'profile' : 'auth')}
        >
            {/* Subtle center glow */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse 50% 100% at 50% 50%, rgba(45,212,191,0.03) 0%, transparent 70%)',
            }} />

            {/* Edge fades */}
            <div className="absolute left-0 top-0 bottom-0 w-16 pointer-events-none z-10"
                style={{ background: 'linear-gradient(to right, rgba(3,3,5,0.9), transparent)' }} />
            <div className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none z-10"
                style={{ background: 'linear-gradient(to left, rgba(3,3,5,0.9), transparent)' }} />

            {/* Scrolling text */}
            <div className="absolute inset-0 flex items-center overflow-hidden">
                <div
                    className="flex items-center whitespace-nowrap"
                    style={{
                        animation: `marquee-left ${isLoggedIn ? 22 : 18}s linear infinite`,
                        animationPlayState: paused ? 'paused' : 'running',
                    }}
                >
                    {items.map((i) => (
                        <React.Fragment key={i}>
                            <span style={{
                                color: isLoggedIn ? 'rgba(255,255,255,0.75)' : 'rgba(45,212,191,0.85)',
                                fontSize: 'clamp(13px, 1.4vw, 17px)',
                                fontWeight: 600,
                                letterSpacing: '0.25em',
                                lineHeight: 1,
                                flexShrink: 0,
                                fontFamily: 'Syne, sans-serif',
                                textTransform: 'uppercase',
                            }}>
                                {text}
                            </span>
                            {SEP}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AuthMarquee;
