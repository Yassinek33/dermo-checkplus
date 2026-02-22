import React, { useState, useEffect, useRef } from 'react';
import { cmsService } from '../../services/cmsService';
import { supabase } from '../../services/supabaseClient';

const GoogleFonts = ['Inter', 'Syne', 'Instrument Serif', 'Roboto', 'Poppins', 'Montserrat', 'Playfair Display'];

export const AdminAppearance: React.FC = () => {
    const [activeSection, setActiveSection] = useState<'identity' | 'colors' | 'typography'>('identity');
    const [isSaving, setIsSaving] = useState(false);
    const [logoUploading, setLogoUploading] = useState(false);
    const [faviconUploading, setFaviconUploading] = useState(false);
    const [saved, setSaved] = useState(false);
    const logoRef = useRef<HTMLInputElement>(null);
    const faviconRef = useRef<HTMLInputElement>(null);
    const [settings, setSettings] = useState({
        logo_url: '',
        favicon_url: '',
        site_name: 'Dermato-Check',
        tagline: 'Votre assistant dermatologique intelligent',
        theme: {
            primaryColor: '#2DD4BF',
            secondaryColor: '#E2E8F0',
            accentColor: '#6366F1',
        },
        typography: {
            headingFont: 'Syne',
            bodyFont: 'Inter',
        }
    });

    useEffect(() => {
        const load = async () => {
            const data = await cmsService.getSettings();
            setSettings(s => ({
                ...s,
                logo_url: (data as any).logo_url || '',
                favicon_url: (data as any).favicon_url || '',
                site_name: (data as any).site_name || s.site_name,
                tagline: (data as any).tagline || s.tagline,
                theme: data.theme ? { ...s.theme, ...data.theme } : s.theme,
                typography: (data as any).typography || s.typography,
            }));
        };
        load();
    }, []);

    const handleUploadImage = async (file: File, type: 'logo' | 'favicon') => {
        if (type === 'logo') setLogoUploading(true);
        else setFaviconUploading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const media = await cmsService.uploadMedia(file, user?.id || 'admin');
            setSettings(s => ({ ...s, [`${type}_url`]: media.url }));
        } catch (e) {
            alert('Erreur lors de l\'upload.');
        } finally {
            if (type === 'logo') setLogoUploading(false);
            else setFaviconUploading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await Promise.all([
                cmsService.updateSetting('theme', settings.theme),
                cmsService.updateSetting('logo_url', settings.logo_url),
                cmsService.updateSetting('favicon_url', settings.favicon_url),
                cmsService.updateSetting('site_name', settings.site_name),
                cmsService.updateSetting('tagline', settings.tagline),
                cmsService.updateSetting('typography', settings.typography),
            ]);
            // Apply CSS vars immediately
            document.documentElement.style.setProperty('--brand-primary', settings.theme.primaryColor);
            document.documentElement.style.setProperty('--brand-secondary', settings.theme.secondaryColor);
            document.documentElement.style.setProperty('--brand-accent', settings.theme.accentColor);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setIsSaving(false);
        }
    };

    const ColorBlock = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
        <div className="space-y-2">
            <label className="text-xs text-white/50 font-medium uppercase tracking-wider">{label}</label>
            <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl border border-white/15 overflow-hidden flex-shrink-0 cursor-pointer" style={{ backgroundColor: value }}>
                    <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
                <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
                    className="flex-1 bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-brand-primary/50" />
            </div>
        </div>
    );

    const UploadZone = ({
        label, url, uploading, onClick, onChange
    }: {
        label: string, url: string, uploading: boolean, onClick: () => void, onChange: (f: File) => void
    }) => (
        <div>
            <label className="text-xs text-white/50 font-medium uppercase tracking-wider mb-2 block">{label}</label>
            <div className="flex items-center gap-4">
                <div className="w-24 h-16 rounded-xl bg-white/[0.04] border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {url ? <img src={url} alt={label} className="max-w-full max-h-full object-contain p-2" />
                        : uploading ? <div className="text-white/30 text-xs text-center">Upload...</div>
                            : <span className="text-white/20 text-2xl">+</span>}
                </div>
                <div className="flex-1 space-y-2">
                    <button onClick={onClick} disabled={uploading} className="w-full py-2 text-sm bg-white/[0.05] text-white/70 rounded-xl border border-white/10 hover:bg-white/[0.1] transition-colors disabled:opacity-40">
                        {uploading ? '⬆️ Upload...' : '⬆️ Choisir un fichier'}
                    </button>
                    {url && (
                        <input type="text" value={url} onChange={(e) => setSettings(s => ({ ...s, [`${label.toLowerCase().includes('logo') ? 'logo' : 'favicon'}_url`]: e.target.value }))}
                            className="w-full bg-[#0a0b0d] border border-white/10 rounded-lg px-3 py-1.5 text-white/40 text-xs font-mono focus:outline-none focus:border-brand-primary/50" />
                    )}
                </div>
            </div>
        </div>
    );

    const sections = [
        { id: 'identity', label: '🏢 Identité', desc: 'Logo, Favicon, Nom du site' },
        { id: 'colors', label: '🎨 Couleurs', desc: 'Palette de couleurs du site' },
        { id: 'typography', label: '🔤 Typographie', desc: 'Polices de caractères' },
    ];

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">Apparence</h1>
                    <p className="text-white/40 mt-1 text-sm">Personnalisez l'identité visuelle de votre site</p>
                </div>
                <button onClick={handleSave} disabled={isSaving}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all self-start disabled:opacity-40 ${saved ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-brand-primary text-[#030305] hover:bg-brand-primary/90 shadow-[0_0_15px_rgba(45,212,191,0.2)]'}`}>
                    {saved ? '✓ Sauvegardé !' : isSaving ? '...' : '💾 Sauvegarder'}
                </button>
            </div>

            {/* Section Tabs */}
            <div className="flex gap-2 flex-wrap">
                {sections.map(s => (
                    <button key={s.id} onClick={() => setActiveSection(s.id as any)}
                        className={`px-4 py-2.5 rounded-xl text-sm transition-colors border ${activeSection === s.id ? 'bg-brand-primary/15 text-brand-primary border-brand-primary/25' : 'bg-white/[0.03] text-white/50 border-white/[0.06] hover:text-white hover:bg-white/[0.06]'}`}>
                        {s.label}
                    </button>
                ))}
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/[0.06] space-y-8">
                {/* Identity */}
                {activeSection === 'identity' && (
                    <div className="space-y-8">
                        <input type="file" ref={logoRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUploadImage(e.target.files[0], 'logo')} />
                        <input type="file" ref={faviconRef} className="hidden" accept="image/*,.ico" onChange={(e) => e.target.files?.[0] && handleUploadImage(e.target.files[0], 'favicon')} />

                        <UploadZone label="Logo du site" url={settings.logo_url} uploading={logoUploading}
                            onClick={() => logoRef.current?.click()} onChange={(f) => handleUploadImage(f, 'logo')} />
                        <UploadZone label="Favicon (icône d'onglet)" url={settings.favicon_url} uploading={faviconUploading}
                            onClick={() => faviconRef.current?.click()} onChange={(f) => handleUploadImage(f, 'favicon')} />

                        <div className="pt-6 border-t border-white/[0.06] space-y-4">
                            <h3 className="text-white font-semibold">Nom & Slogan</h3>
                            <div>
                                <label className="text-xs text-white/50 mb-2 block uppercase tracking-wider">Nom du site</label>
                                <input type="text" value={settings.site_name} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                                    className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary/50" />
                            </div>
                            <div>
                                <label className="text-xs text-white/50 mb-2 block uppercase tracking-wider">Slogan</label>
                                <input type="text" value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                                    className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary/50" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Colors */}
                {activeSection === 'colors' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                            <div className="h-16 rounded-xl transition-all" style={{ backgroundColor: settings.theme.primaryColor }} title="Couleur principale" />
                            <div className="h-16 rounded-xl transition-all" style={{ backgroundColor: settings.theme.secondaryColor }} title="Couleur secondaire" />
                            <div className="h-16 rounded-xl transition-all" style={{ backgroundColor: settings.theme.accentColor }} title="Couleur d'accent" />
                        </div>

                        <ColorBlock label="Couleur Principale (Primaire)" value={settings.theme.primaryColor}
                            onChange={(v) => setSettings({ ...settings, theme: { ...settings.theme, primaryColor: v } })} />
                        <ColorBlock label="Couleur Secondaire (Textes / fonds clairs)" value={settings.theme.secondaryColor}
                            onChange={(v) => setSettings({ ...settings, theme: { ...settings.theme, secondaryColor: v } })} />
                        <ColorBlock label="Couleur d'Accentuation (Boutons, tags)" value={settings.theme.accentColor}
                            onChange={(v) => setSettings({ ...settings, theme: { ...settings.theme, accentColor: v } })} />

                        <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                            <p className="text-xs text-white/40 font-mono">💡 Les couleurs sont appliquées comme variables CSS (<code className="text-brand-primary">--brand-primary</code>, etc.) et prennent effet instantanément sur tout le site au moment de la sauvegarde.</p>
                        </div>
                    </div>
                )}

                {/* Typography */}
                {activeSection === 'typography' && (
                    <div className="space-y-6">
                        <div>
                            <label className="text-xs text-white/50 mb-2 block uppercase tracking-wider">Police des Titres (Display / Heading)</label>
                            <select value={settings.typography.headingFont} onChange={(e) => setSettings({ ...settings, typography: { ...settings.typography, headingFont: e.target.value } })}
                                className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary/50">
                                {GoogleFonts.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                            <div className="mt-3 p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                                <p className="text-3xl font-bold text-white" style={{ fontFamily: settings.typography.headingFont }}>Aperçu: Dermato-Check</p>
                                <p className="text-lg text-white/60" style={{ fontFamily: settings.typography.headingFont }}>Votre assistant dermatologique intelligent</p>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-white/50 mb-2 block uppercase tracking-wider">Police du Corps (Body / Paragraphes)</label>
                            <select value={settings.typography.bodyFont} onChange={(e) => setSettings({ ...settings, typography: { ...settings.typography, bodyFont: e.target.value } })}
                                className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary/50">
                                {GoogleFonts.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                            <div className="mt-3 p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                                <p className="text-white/70 leading-relaxed" style={{ fontFamily: settings.typography.bodyFont }}>
                                    "Consultez notre analyse dermatologique avancée pour obtenir une évaluation rapide et sécurisée de votre peau. Basée sur des algorithmes d'intelligence artificielle validés par des experts médicaux."
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
