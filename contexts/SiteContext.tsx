import React, { createContext, useContext, useState, useEffect } from 'react';
import { cmsService, SiteSettings } from '../services/cmsService';

interface SiteContextType {
    settings: SiteSettings | null;
    isLoading: boolean;
}

const SiteContext = createContext<SiteContextType>({
    settings: null,
    isLoading: true
});

export const useSiteSettings = () => useContext(SiteContext);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await cmsService.getSettings();
                setSettings(data);
                applySettings(data);
            } catch (error) {
                console.error("Failed to load site settings", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, []);

    const applySettings = (data: SiteSettings) => {
        // Apply Global SEO
        if (data.seo) {
            if (data.seo.title) document.title = data.seo.title;

            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute('content', data.seo.description || '');
            } else if (data.seo.description) {
                const meta = document.createElement('meta');
                meta.name = 'description';
                meta.content = data.seo.description;
                document.head.appendChild(meta);
            }

            // We can also inject keywords if needed
        }

        // Apply Theme Colors
        if (data.theme) {
            if (data.theme.primaryColor) {
                document.documentElement.style.setProperty('--brand-primary', data.theme.primaryColor);
            }
            if (data.theme.secondaryColor) {
                document.documentElement.style.setProperty('--brand-secondary', data.theme.secondaryColor);
            }
            if (data.theme.accentColor) {
                document.documentElement.style.setProperty('--brand-accent', data.theme.accentColor);
            }
        }
    };

    if (isLoading) {
        // Simple global loader to prevent flashing unstyled content or wrong routes
        return (
            <div className="min-h-screen bg-[#030305] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    // Maintenance Mode Check
    // If maintenance is enabled and we are NOT on the /admin route (handled loosely here or in App)
    if (settings?.maintenance?.enabled) {
        // Only block if not trying to login/admin
        if (!window.location.pathname.startsWith('/admin')) {
            return (
                <div className="min-h-screen bg-[#030305] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] animate-pulse"></div>
                    <h1 className="text-5xl font-display font-bold text-white mb-4 relative z-10">Site en Maintenance</h1>
                    <p className="text-white/60 max-w-md mx-auto relative z-10">Nous effectuons actuellement une mise à jour de notre système pour améliorer votre expérience. Merci de votre patience.</p>
                    <button
                        onClick={() => window.location.href = '/admin'}
                        className="mt-8 relative z-10 text-[10px] text-white/20 uppercase tracking-widest hover:text-white/50"
                    >
                        Accès Administrateur
                    </button>
                </div>
            );
        }
    }

    return (
        <SiteContext.Provider value={{ settings, isLoading }}>
            {children}
        </SiteContext.Provider>
    );
};
