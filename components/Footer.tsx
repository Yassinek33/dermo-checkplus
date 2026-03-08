import React, { useEffect, useState } from 'react';
import { useLanguage, Language } from '../context/LanguageContext';
import { cmsService } from '../services/cmsService';

interface FooterProps {
    onNavigate: (pageId: string) => void;
}

const footerContent: Record<'fr' | 'en' | 'es' | 'nl', {
    about: string;
    links: { label: string; pageId?: string; scrollTo?: string }[];
    badges: { label: string }[];
    copyright: string;
}> = {
    fr: {
        about: 'DermatoCheck est une plateforme d\'analyse cutanée par intelligence artificielle, fondée par un médecin. Évaluation indicative, non substituable à un diagnostic médical.',
        links: [
            { label: 'Comment ça marche', pageId: 'home', scrollTo: 'how-it-works' },
            { label: 'FAQ', pageId: 'faq' },
            { label: 'Blog', pageId: 'blog' },
            { label: 'Mentions légales', pageId: 'legal' },
            { label: 'Politique de confidentialité', pageId: 'privacy-policy' },
            { label: 'Contact', pageId: 'contact' },
        ],
        badges: [
            { label: 'Conforme RGPD' },
            { label: 'Données chiffrées' },
            { label: 'Hébergement sécurisé' },
        ],
        copyright: '© 2024-2026 DermatoCheck. Tous droits réservés. DermatoCheck est un outil d\'aide à l\'orientation dermatologique. Il ne fournit pas de diagnostic médical.',
    },
    en: {
        about: 'DermatoCheck is an AI-powered skin analysis platform, founded by a doctor. Indicative assessment, not a substitute for medical diagnosis.',
        links: [
            { label: 'How it works', pageId: 'home', scrollTo: 'how-it-works' },
            { label: 'FAQ', pageId: 'faq' },
            { label: 'Blog', pageId: 'blog' },
            { label: 'Legal notice', pageId: 'legal' },
            { label: 'Privacy policy', pageId: 'privacy-policy' },
            { label: 'Contact', pageId: 'contact' },
        ],
        badges: [
            { label: 'GDPR compliant' },
            { label: 'Encrypted data' },
            { label: 'Secure hosting' },
        ],
        copyright: '© 2024–2026 DermatoCheck. All rights reserved. DermatoCheck is a tool that supports dermatological guidance. It does not provide a medical diagnosis.',
    },
    es: {
        about: 'DermatoCheck es una plataforma de análisis cutáneo con inteligencia artificial, fundada por un médico. Evaluación orientativa, no sustituye un diagnóstico médico.',
        links: [
            { label: 'Cómo funciona', pageId: 'home', scrollTo: 'how-it-works' },
            { label: 'FAQ', pageId: 'faq' },
            { label: 'Blog', pageId: 'blog' },
            { label: 'Aviso legal', pageId: 'legal' },
            { label: 'Política de privacidad', pageId: 'privacy-policy' },
            { label: 'Contacto', pageId: 'contact' },
        ],
        badges: [
            { label: 'Conforme RGPD' },
            { label: 'Datos cifrados' },
            { label: 'Alojamiento seguro' },
        ],
        copyright: '© 2024–2026 DermatoCheck. Todos los derechos reservados. DermatoCheck es una herramienta de orientación dermatológica. No proporciona diagnóstico médico.',
    },
    nl: {
        about: 'DermatoCheck is een AI-gestuurd platform voor huidanalyse, opgericht door een arts. Indicatieve beoordeling, geen vervanging voor medische diagnose.',
        links: [
            { label: 'Hoe werkt het', pageId: 'home', scrollTo: 'how-it-works' },
            { label: 'FAQ', pageId: 'faq' },
            { label: 'Blog', pageId: 'blog' },
            { label: 'Juridische kennisgeving', pageId: 'legal' },
            { label: 'Privacybeleid', pageId: 'privacy-policy' },
            { label: 'Contact', pageId: 'contact' },
        ],
        badges: [
            { label: 'AVG-conform' },
            { label: 'Versleutelde gegevens' },
            { label: 'Beveiligde hosting' },
        ],
        copyright: '© 2024–2026 DermatoCheck. Alle rechten voorbehouden. DermatoCheck is een hulpmiddel voor dermatologische oriëntatie. Het biedt geen medische diagnose.',
    },
};

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    const { language, setLanguage } = useLanguage();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        cmsService.isAdmin().then(setIsAdmin).catch(console.error);
    }, []);

    const handleLanguageSwitch = (lang: Language) => {
        setLanguage(lang);
    };

    const languages: { code: Language; label: string }[] = [
        { code: 'fr', label: 'Français' },
        { code: 'en', label: 'English' },
        { code: 'es', label: 'Español' },
        { code: 'nl', label: 'Nederlands' },
    ];

    // Select content: all 4 languages have dedicated, others fallback to EN
    const langKey: 'fr' | 'en' | 'es' | 'nl' = (language === 'fr' || language === 'en' || language === 'es' || language === 'nl') ? language : 'en';
    const c = footerContent[langKey];

    return (
        <footer className="relative bg-gradient-to-b from-[#0a0b0d] to-black border-t border-white/5 mt-auto">
            {/* Top glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2DD4BF]/20 to-transparent"></div>

            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <img
                        src="/nouveau-logo.png"
                        alt="DermatoCheck — AI-powered skin analysis platform"
                        className="h-16 w-auto opacity-80 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                        onClick={() => onNavigate('home')}
                    />
                </div>

                {/* À propos */}
                <p className="text-center text-sm text-gray-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                    {c.about}
                </p>

                {/* Navigation Links */}
                <nav className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-10">
                    {c.links.map((link, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                if (link.scrollTo) {
                                    onNavigate(link.pageId || 'home');
                                    setTimeout(() => document.getElementById(link.scrollTo!)?.scrollIntoView({ behavior: 'smooth' }), 300);
                                } else {
                                    onNavigate(link.pageId || 'home');
                                }
                            }}
                            className="text-sm text-gray-400 hover:text-[#2DD4BF] transition-colors duration-200 font-medium"
                        >
                            {link.label}
                        </button>
                    ))}
                </nav>

                {/* Security Badges */}
                <div className="flex flex-wrap justify-center gap-6 mb-10">
                    {[
                        <svg key="b1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
                        <svg key="b2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
                        <svg key="b3" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
                    ].map((icon, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="text-[#2DD4BF]/60">{icon}</span>
                            {c.badges[i].label}
                        </div>
                    ))}
                </div>

                {/* Language Selector */}
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageSwitch(lang.code)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${language === lang.code
                                ? 'bg-[#2DD4BF]/10 border-[#2DD4BF]/30 text-[#2DD4BF]'
                                : 'border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20'
                                }`}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6"></div>

                {/* Copyright + Disclaimer */}
                <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-center text-xs text-gray-500 max-w-xl leading-relaxed">
                        {c.copyright}
                    </p>
                    {isAdmin && (
                        <button
                            onClick={() => onNavigate('admin')}
                            className="w-8 h-8 rounded-full bg-transparent hover:bg-white/5 transition-colors duration-300 opacity-20 hover:opacity-100 flex items-center justify-center text-[10px] text-[#2DD4BF]"
                            title="Admin"
                        >
                            ⚡
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2DD4BF]/0 via-[#2DD4BF]/10 to-[#2DD4BF]/0"></div>
        </footer>
    );
};
