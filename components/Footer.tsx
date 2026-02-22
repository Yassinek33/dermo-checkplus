import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
    onNavigate: (pageId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    const { t } = useLanguage();

    const footerLinks = [
        { label: t('footer.about'), path: 'about' },
        { label: t('footer.legal'), path: 'legal' },
        { label: t('footer.contact'), path: 'contact' },
        { label: t('footer.faq'), path: 'faq' }
    ];

    return (
        <footer className="relative bg-gradient-to-b from-[#0a0b0d] to-black border-t border-white/5 mt-auto">
            {/* Subtle glow effect at top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent"></div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Logo Section */}
                <div className="flex justify-center mb-8">
                    <img
                        src="/nouveau-logo.png"
                        alt="DermatoCheck Logo"
                        className="h-16 w-auto opacity-80 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                        onClick={() => onNavigate('home')}
                    />
                </div>

                {/* Tagline */}
                <p className="text-center text-sm text-gray-400 mb-8 font-light">
                    {t('footer.tagline')}
                </p>

                {/* Navigation Links */}
                <nav className="flex flex-wrap justify-center gap-6 mb-8">
                    {footerLinks.map((link, index) => (
                        <button
                            key={index}
                            onClick={() => onNavigate(link.path)}
                            className="text-sm text-gray-400 hover:text-brand-primary transition-colors duration-200 font-medium"
                        >
                            {link.label}
                        </button>
                    ))}
                </nav>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6"></div>

                {/* Copyright */}
                <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-center text-xs text-gray-500">
                        {t('footer.copyright')}
                    </p>
                    <button
                        onClick={() => onNavigate('admin')}
                        className="w-8 h-8 rounded-full bg-transparent hover:bg-white/5 transition-colors duration-300 opacity-20 hover:opacity-100 flex items-center justify-center text-[10px] text-brand-primary"
                        title="Système Administratif"
                    >
                        ⚡
                    </button>
                </div>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary/0 via-brand-primary/10 to-brand-primary/0"></div>
        </footer>
    );
};
