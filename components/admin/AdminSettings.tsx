import React, { useState, useEffect } from 'react';
import { cmsService } from '../../services/cmsService';

export const AdminSettings: React.FC = () => {
    const [activeSection, setActiveSection] = useState<'general' | 'maintenance' | 'integrations' | 'cache'>('general');
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [settings, setSettings] = useState({
        general: {
            site_url: 'https://dermato-check.vercel.app',
            admin_email: 'admin@dermatocheck.com',
            default_language: 'fr',
            timezone: 'Europe/Paris',
            posts_per_page: 10,
        },
        maintenance: {
            enabled: false,
            message: 'Nous effectuons actuellement une mise à jour de notre système pour améliorer votre expérience. Merci de votre patience.',
            estimated_time: '',
        },
        integrations: {
            ga_id: '',
            gtm_id: '',
            hotjar_id: '',
        }
    });

    useEffect(() => {
        const load = async () => {
            const data = await cmsService.getSettings();
            if ((data as any).general) setSettings(s => ({ ...s, general: { ...s.general, ...(data as any).general } }));
            if (data.maintenance) setSettings(s => ({ ...s, maintenance: { ...s.maintenance, ...(data.maintenance as any) } }));
            if ((data as any).integrations) setSettings(s => ({ ...s, integrations: { ...s.integrations, ...(data as any).integrations } }));
        };
        load();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await Promise.all([
                cmsService.updateSetting('general', settings.general),
                cmsService.updateSetting('maintenance', settings.maintenance),
                cmsService.updateSetting('integrations', settings.integrations),
            ]);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClearCache = () => {
        localStorage.clear();
        sessionStorage.clear();
        alert('✅ Cache local vidé avec succès !');
    };

    const sections = [
        { id: 'general', label: '⚙️ Général' },
        { id: 'maintenance', label: '🔧 Maintenance' },
        { id: 'integrations', label: '🔗 Intégrations' },
        { id: 'cache', label: '🗑️ Cache & Perf.' },
    ];

    const Field = ({ label, value, onChange, type = 'text', note }: { label: string, value: string | number, onChange: (v: string) => void, type?: string, note?: string }) => (
        <div>
            <label className="text-xs text-white/50 mb-2 block uppercase tracking-wider">{label}</label>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
                className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-primary/50" />
            {note && <p className="text-xs text-white/30 mt-1.5">{note}</p>}
        </div>
    );

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">Paramètres</h1>
                    <p className="text-white/40 mt-1 text-sm">Configuration technique et avancée du site</p>
                </div>
                <button onClick={handleSave} disabled={isSaving}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all self-start ${saved ? 'bg-emerald-500 text-white' : 'bg-brand-primary text-[#030305] hover:bg-brand-primary/90'} shadow-[0_0_15px_rgba(45,212,191,0.2)] disabled:opacity-40`}>
                    {saved ? '✓ Sauvegardé !' : isSaving ? '...' : '💾 Sauvegarder'}
                </button>
            </div>

            <div className="flex gap-2 flex-wrap">
                {sections.map(s => (
                    <button key={s.id} onClick={() => setActiveSection(s.id as any)}
                        className={`px-4 py-2 rounded-xl text-sm transition-colors border ${activeSection === s.id ? 'bg-brand-primary/15 text-brand-primary border-brand-primary/25' : 'bg-white/[0.03] text-white/50 border-white/[0.06] hover:text-white hover:bg-white/[0.06]'}`}>
                        {s.label}
                    </button>
                ))}
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/[0.06] space-y-6">
                {activeSection === 'general' && (
                    <>
                        <Field label="URL du site (production)" value={settings.general.site_url}
                            onChange={(v) => setSettings(s => ({ ...s, general: { ...s.general, site_url: v } }))} />
                        <Field label="Email de l'administrateur" type="email" value={settings.general.admin_email}
                            onChange={(v) => setSettings(s => ({ ...s, general: { ...s.general, admin_email: v } }))} />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-white/50 mb-2 block uppercase tracking-wider">Langue par défaut</label>
                                <select value={settings.general.default_language}
                                    onChange={(e) => setSettings(s => ({ ...s, general: { ...s.general, default_language: e.target.value } }))}
                                    className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-primary/50">
                                    {[['fr', 'Français'], ['en', 'English'], ['es', 'Español'], ['nl', 'Nederlands']].map(([v, l]) =>
                                        <option key={v} value={v}>{l}</option>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-white/50 mb-2 block uppercase tracking-wider">Fuseau horaire</label>
                                <select value={settings.general.timezone}
                                    onChange={(e) => setSettings(s => ({ ...s, general: { ...s.general, timezone: e.target.value } }))}
                                    className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-primary/50">
                                    {['Europe/Paris', 'UTC', 'America/New_York', 'America/Los_Angeles', 'Asia/Dubai'].map(tz =>
                                        <option key={tz} value={tz}>{tz}</option>
                                    )}
                                </select>
                            </div>
                        </div>
                        <Field label="Articles par page (pagination blog)" type="number" value={settings.general.posts_per_page}
                            onChange={(v) => setSettings(s => ({ ...s, general: { ...s.general, posts_per_page: Number(v) } }))} />
                    </>
                )}

                {activeSection === 'maintenance' && (
                    <div className="space-y-6">
                        <div className="p-4 rounded-xl border border-red-500/20 bg-red-900/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-white font-semibold">Mode Maintenance</h4>
                                    <p className="text-sm text-white/50 mt-1">Affiche une page bloquante pour les visiteurs non-admin.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer"
                                        checked={settings.maintenance.enabled}
                                        onChange={(e) => setSettings(s => ({ ...s, maintenance: { ...s.maintenance, enabled: e.target.checked } }))} />
                                    <div className="w-12 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500" />
                                </label>
                            </div>
                            {settings.maintenance.enabled && (
                                <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-red-500/20 rounded-lg border border-red-500/30">
                                    <span className="text-red-400 text-sm font-bold">⚠️ Mode maintenance ACTIF</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="text-xs text-white/50 mb-2 block uppercase tracking-wider">Message affiché aux visiteurs</label>
                            <textarea rows={4} value={settings.maintenance.message}
                                onChange={(e) => setSettings(s => ({ ...s, maintenance: { ...s.maintenance, message: e.target.value } }))}
                                className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-primary/50 resize-none" />
                        </div>
                        <div>
                            <label className="text-xs text-white/50 mb-2 block uppercase tracking-wider">Durée estimée (ex: "30 minutes", facultatif)</label>
                            <input type="text" value={settings.maintenance.estimated_time}
                                onChange={(e) => setSettings(s => ({ ...s, maintenance: { ...s.maintenance, estimated_time: e.target.value } }))}
                                className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-primary/50" />
                        </div>
                    </div>
                )}

                {activeSection === 'integrations' && (
                    <div className="space-y-6">
                        <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                            <p className="text-xs text-white/40">Collez vos identifiants de tracking. Ils seront injectés automatiquement dans le <code className="text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded text-xs">&lt;head&gt;</code>.</p>
                        </div>
                        <div>
                            <label className="text-xs text-white/50 mb-2 block uppercase tracking-wider">Google Analytics 4 (Measurement ID)</label>
                            <input type="text" placeholder="G-XXXXXXXXXX" value={settings.integrations.ga_id}
                                onChange={(e) => setSettings(s => ({ ...s, integrations: { ...s.integrations, ga_id: e.target.value } }))}
                                className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-brand-primary/50" />
                        </div>
                        <div>
                            <label className="text-xs text-white/50 mb-2 block uppercase tracking-wider">Google Tag Manager (Container ID)</label>
                            <input type="text" placeholder="GTM-XXXXXXX" value={settings.integrations.gtm_id}
                                onChange={(e) => setSettings(s => ({ ...s, integrations: { ...s.integrations, gtm_id: e.target.value } }))}
                                className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-brand-primary/50" />
                        </div>
                        <div>
                            <label className="text-xs text-white/50 mb-2 block uppercase tracking-wider">Hotjar (Site ID)</label>
                            <input type="text" placeholder="1234567" value={settings.integrations.hotjar_id}
                                onChange={(e) => setSettings(s => ({ ...s, integrations: { ...s.integrations, hotjar_id: e.target.value } }))}
                                className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-brand-primary/50" />
                        </div>
                    </div>
                )}

                {activeSection === 'cache' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                                <h4 className="text-white font-semibold mb-2">Cache Local</h4>
                                <p className="text-white/50 text-sm mb-4">Vide le localStorage et sessionStorage du navigateur.</p>
                                <button onClick={handleClearCache} className="w-full py-2.5 bg-white/[0.05] text-white/70 rounded-xl border border-white/10 hover:bg-white/[0.1] hover:text-white text-sm transition-colors">
                                    🗑️ Vider le cache local
                                </button>
                            </div>
                            <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                                <h4 className="text-white font-semibold mb-2">Hard Reload</h4>
                                <p className="text-white/50 text-sm mb-4">Force le rechargement sans cache du navigateur.</p>
                                <button onClick={() => window.location.reload()} className="w-full py-2.5 bg-white/[0.05] text-white/70 rounded-xl border border-white/10 hover:bg-white/[0.1] hover:text-white text-sm transition-colors">
                                    🔄 Recharger la page
                                </button>
                            </div>
                        </div>

                        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                            <h4 className="text-white font-semibold mb-1">Informations de Build</h4>
                            <div className="mt-3 space-y-2 font-mono text-xs text-white/40">
                                <div className="flex justify-between"><span>Framework</span><span className="text-white/60">React + Vite</span></div>
                                <div className="flex justify-between"><span>Backend</span><span className="text-white/60">Supabase (PostgreSQL)</span></div>
                                <div className="flex justify-between"><span>Storage</span><span className="text-white/60">Supabase Storage</span></div>
                                <div className="flex justify-between"><span>Auth</span><span className="text-white/60">Supabase Auth (JWT)</span></div>
                                <div className="flex justify-between"><span>CMS Version</span><span className="text-brand-primary">v2.1 Pro</span></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
