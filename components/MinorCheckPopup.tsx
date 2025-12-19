
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { appConfig } from '../config';

interface MinorCheckPopupProps {
    onConfirmAdult: () => void;
    onConfirmMinor: () => void;
}

const MinorCheckPopup: React.FC<MinorCheckPopupProps> = ({ onConfirmAdult, onConfirmMinor }) => {
    const themeConfig = appConfig.app.theme;
    const modalRef = useRef<HTMLDivElement>(null);
    const triggerElementRef = useRef<HTMLElement | null>(null);

    // Callback to disable/enable tabIndex for elements outside the modal
    const toggleTabIndexForMainContent = useCallback((enable: boolean) => {
        const mainAppContainer = document.querySelector('.flex.flex-col.min-h-screen.font-sans');
        if (mainAppContainer) {
            const focusableElements = mainAppContainer.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            focusableElements.forEach(element => {
                if (element instanceof HTMLElement) {
                    if (enable) {
                        const originalTabIndex = element.dataset.originalTabIndex;
                        if (originalTabIndex) {
                            element.tabIndex = parseInt(originalTabIndex, 10);
                            delete element.dataset.originalTabIndex;
                        } else if (element.tabIndex === -1) {
                            element.tabIndex = 0;
                        }
                    } else {
                        if (element.tabIndex !== -1 && !element.hasAttribute('disabled')) {
                            element.dataset.originalTabIndex = element.tabIndex.toString();
                            element.tabIndex = -1;
                        }
                    }
                }
            });
        }
    }, []);

    // Effect for focus trapping
    useEffect(() => {
        triggerElementRef.current = document.activeElement as HTMLElement;
        toggleTabIndexForMainContent(false);

        const modalElement = modalRef.current;
        if (modalElement) {
            const focusableElements = modalElement.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            firstElement?.focus();

            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Tab') {
                    if (event.shiftKey) { // Shift + Tab
                        if (document.activeElement === firstElement) {
                            lastElement?.focus();
                            event.preventDefault();
                        }
                    } else { // Tab
                        if (document.activeElement === lastElement) {
                            firstElement?.focus();
                            event.preventDefault();
                        }
                    }
                }
            };

            window.addEventListener('keydown', handleKeyDown);

            return () => {
                window.removeEventListener('keydown', handleKeyDown);
                toggleTabIndexForMainContent(true);

                if (triggerElementRef.current) {
                    triggerElementRef.current.focus();
                }
            };
        }
    }, [toggleTabIndexForMainContent]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030305]/80 backdrop-blur-sm animate-fade-in p-4"
            role="dialog" aria-modal="true" aria-labelledby="profile-selection-title"
        >
            <div
                ref={modalRef}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl minor-check-popup-scale-in"
            >
                <div className="mb-6 flex justify-center text-5xl opacity-90 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]">
                    <span role="img" aria-label="Doctor">⚕️</span>
                </div>
                <h2 id="profile-selection-title" className="text-2xl font-display font-bold text-white mb-4">Bienvenue sur DERMO-CHECK</h2>
                <p className="text-brand-secondary/70 text-base mb-6 font-light">
                    Pour personnaliser votre expérience, veuillez indiquer votre profil.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={onConfirmAdult}
                        className="px-6 py-3 bg-brand-primary text-brand-deep text-base rounded-full hover:bg-brand-primary/90 transition-all font-semibold shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:shadow-[0_0_30px_rgba(45,212,191,0.4)]"
                    >
                        Je suis majeur
                    </button>
                    <button
                        onClick={onConfirmMinor}
                        className="px-6 py-3 border border-white/20 rounded-full transition-colors font-medium text-brand-secondary hover:bg-white/5 hover:border-white/40"
                    >
                        Je suis mineur
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes minor-check-popup-scale-in-animation {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                .minor-check-popup-scale-in {
                    animation: minor-check-popup-scale-in-animation 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default MinorCheckPopup;
