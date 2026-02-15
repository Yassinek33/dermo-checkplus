import React from 'react';
import ReactDOM from 'react-dom';

import { useLanguage } from '../context/LanguageContext';

interface LocationRequestPopupProps {
    onAllow: () => void;
    onDeny: () => void;
}

const LocationRequestPopup: React.FC<LocationRequestPopupProps> = ({ onAllow, onDeny }) => {
    const { t } = useLanguage();
    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in"
            role="dialog" aria-modal="true" aria-labelledby="location-request-title"
        >
            {/* Dark backdrop with blur */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#030305]/95 via-[#0a0b0d]/95 to-[#030305]/95 backdrop-blur-sm" aria-hidden="true" onClick={onDeny}></div>

            {/* Popup Card */}
            <div
                className="relative w-full max-w-lg bg-gradient-to-b from-[#0a0b0d] via-[#111214] to-[#0a0b0d] rounded-3xl p-8 md:p-10 text-center shadow-2xl border border-white/10 backdrop-blur-xl animate-fade-in-scale"
                style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 0 40px rgba(45, 212, 191, 0.1)'
                }}
            >
                <div className="mb-8 flex justify-center text-6xl animate-icon-bounce drop-shadow-[0_0_30px_rgba(45,212,191,0.8)]">
                    <span role="img" aria-label="Location">📍</span>
                </div>
                <h2 id="location-request-title" className="text-3xl md:text-3xl font-display font-bold text-white mb-5 tracking-tight">
                    {t('dermatologist.popup.title')}
                </h2>
                <p className="text-brand-secondary/80 text-base md:text-lg mb-8 font-light leading-relaxed">
                    <span dangerouslySetInnerHTML={{ __html: t('dermatologist.popup.description').replace('<bold>', '<span class="text-white font-medium">').replace('</bold>', '</span>') }} />
                </p>
                <div className="flex flex-col gap-4 justify-center">
                    <button
                        onClick={onAllow}
                        className="w-full px-8 py-4 bg-brand-primary text-[#030305] text-base md:text-xl rounded-full font-bold transition-all duration-200 hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:ring-offset-2 focus:ring-offset-[#030305] shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_30px_rgba(45,212,191,0.5)] hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {t('dermatologist.popup.allow')}
                    </button>
                    <button
                        onClick={onDeny}
                        className="w-full px-8 py-4 border-2 border-white/20 rounded-full transition-all duration-200 font-semibold text-brand-secondary hover:bg-white/10 hover:border-brand-primary/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#030305] hover:-translate-y-0.5 active:translate-y-0 text-base"
                    >
                        {t('dermatologist.popup.deny')}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default LocationRequestPopup;
