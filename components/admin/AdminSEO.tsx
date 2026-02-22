import React, { useState, useEffect } from 'react';
import { cmsService } from '../../services/cmsService';

interface SeoState {
    site_title: string;
    site_description: string;
    site_keywords: string;
    og_title: string;
    og_description: string;
    og_image: string;
    twitter_title: string;
    twitter_description: string;
    twitter_image: string;
    robots_txt: string;
    json_ld: string;
}

const defaultState: SeoState = {
    site_title: 'Dermato-Check | Votre assistant dermatologique',
    site_description: 'Obtenez une évaluation rapide et sécurisée de votre peau grâce à notre IA experte.',
    site_keywords: 'dermatologue, peau, analyse, IA, santé, dermatologie',
    og_title: 'Dermato-Check | Assistant Dermatologique IA',
    og_description: 'Analysez votre peau en quelques minutes avec notre technologie IA avancée.',
    og_image: '',
    twitter_title: '',
    twitter_description: '',
    twitter_image: '',
    robots_txt: 'User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://dermato-check.vercel.app/sitemap.xml',
    json_ld: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "MedicalOrganization",
        "name": "Dermato-Check",
        "description": "Assistant dermatologique basé sur l'intelligence artificielle",
        "url": "https://dermato-check.vercel.app"
    }, null, 2)
};

export const AdminSEO: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'global' | 'opengraph' | 'twitter' | 'technical'>('global');
    const [seo, setSeo] = useState<SeoState>(defaultState);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const load = async () => {
            const data = await cmsService.getSettings();
            if ((data as any).seo_global) setSeo(s => ({ ...s, ...(data as any).seo_global }));
        };
        load();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await cmsService.updateSetting('seo_global', seo);
            // Apply to document immediately
            document.title = seo.site_title;
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute('content', seo.site_description);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'global', label: '🌍 SEO Global' },
        { id: 'opengraph', label: '📘 Open Graph' },
        { id: 'twitter', label: '🐦 Twitter Card' },
        { id: 'technical', label: '⚙️ Technique' },
    ];

    const Field = ({ label, value, onChange, textarea = false, note }: { label: string, value: string, onChange: (v: string) => void, textarea?: boolean, note?: string }) => (
        <div>
            <label className="text-xs text-white/50 mb-2 block uppercase tracking-wider font-medium">{label}</label>
            {textarea ? (
                <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-primary/50 resize-none font-mono" />
            ) : (
                <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-primary/50" />
            )}
            {note && <p className="text-xs text-white/30 mt-1.5">{note}</p>}
        </div>
    );

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">SEO & Méta-données</h1>
                    <p className="text-white/40 mt-1 text-sm">Contrôlez comment votre site apparaît dans les moteurs de recherche et les réseaux sociaux</p>
                </div>
                <button onClick={handleSave} disabled={isSaving}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all self-start ${saved ? 'bg-emerald-500 text-white' : 'bg-brand-primary text-[#030305] hover:bg-brand-primary/90'} shadow-[0_0_15px_rgba(45,212,191,0.2)] disabled:opacity-40`}>
                    {saved ? '✓ Sauvegardé !' : isSaving ? '...' : '💾 Sauvegarder'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id as any)}
                        className={`px-4 py-2 rounded-xl text-sm transition-colors border ${activeTab === t.id ? 'bg-brand-primary/15 text-brand-primary border-brand-primary/25' : 'bg-white/[0.03] text-white/50 border-white/[0.06] hover:text-white hover:bg-white/[0.06]'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/[0.06] space-y-6">
                {/* Global SEO */}
                {activeTab === 'global' && (
                    <>
                        {/* Google Preview */}
                        <div>
                            <p className="text-xs text-white/40 mb-3 uppercase tracking-wider font-medium">Aperçu Google Search</p>
                            <div className="bg-white rounded-xl p-5 shadow-inner">
                                <p className="text-[13px] text-green-700 mb-1">dermato-check.vercel.app</p>
                                <p className="text-[18px] text-blue-700 font-medium leading-snug mb-1.5 hover:underline cursor-pointer">{seo.site_title || 'Titre du site'}</p>
                                <p className="text-[13px] text-gray-600 leading-relaxed">{seo.site_description || 'La description de votre site apparaîtra ici...'}</p>
                            </div>
                        </div>

                        <Field label="Titre global du site (60 car. recommandés)" value={seo.site_title}
                            onChange={(v) => setSeo({ ...seo, site_title: v })}
                            note={`${seo.site_title.length}/60 caractères ${seo.site_title.length > 60 ? '⚠️ Trop long' : ''}`} />
                        <Field label="Description globale (méta description — 160 car.)" value={seo.site_description}
                            onChange={(v) => setSeo({ ...seo, site_description: v })} textarea
                            note={`${seo.site_description.length}/160 ${seo.site_description.length > 160 ? '⚠️ Trop long' : ''}`} />
                        <Field label="Mots-clés (séparés par des virgules)" value={seo.site_keywords}
                            onChange={(v) => setSeo({ ...seo, site_keywords: v })}
                            note="Les mots-clés ont peu d'impact direct sur Google, mais sont utilisés par certains moteurs alternatifs." />
                    </>
                )}

                {/* Open Graph */}
                {activeTab === 'opengraph' && (
                    <>
                        <div className="border border-white/10 rounded-xl p-4 bg-white/[0.02]">
                            <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">Aperçu Partage Social (Facebook / LinkedIn)</p>
                            <div className="bg-slate-100 rounded-xl overflow-hidden max-w-sm">
                                {seo.og_image && <img src={seo.og_image} alt="OG" className="w-full h-36 object-cover" />}
                                {!seo.og_image && <div className="w-full h-36 bg-slate-300 flex items-center justify-center text-slate-400">Image OG</div>}
                                <div className="p-3 border-t border-slate-200">
                                    <p className="text-[10px] text-slate-400 uppercase font-mono">DERMATO-CHECK.VERCEL.APP</p>
                                    <p className="text-slate-800 font-semibold text-sm">{seo.og_title || seo.site_title}</p>
                                    <p className="text-slate-500 text-xs mt-0.5">{seo.og_description || seo.site_description}</p>
                                </div>
                            </div>
                        </div>
                        <Field label="Titre Open Graph" value={seo.og_title} onChange={(v) => setSeo({ ...seo, og_title: v })} />
                        <Field label="Description Open Graph" value={seo.og_description} onChange={(v) => setSeo({ ...seo, og_description: v })} textarea />
                        <Field label="Image Open Graph (1200×630 px recommandé — URL)" value={seo.og_image} onChange={(v) => setSeo({ ...seo, og_image: v })} />
                    </>
                )}

                {/* Twitter */}
                {activeTab === 'twitter' && (
                    <>
                        <div className="border border-white/10 rounded-xl p-4 bg-white/[0.02]">
                            <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">Aperçu Twitter Card</p>
                            <div className="bg-black rounded-2xl overflow-hidden max-w-sm border border-white/10">
                                {seo.twitter_image && <img src={seo.twitter_image} alt="Twitter" className="w-full h-40 object-cover" />}
                                {!seo.twitter_image && <div className="w-full h-40 bg-slate-800 flex items-center justify-center text-slate-600">Image Twitter</div>}
                                <div className="p-3">
                                    <p className="text-white font-semibold text-sm">{seo.twitter_title || seo.og_title || seo.site_title}</p>
                                    <p className="text-white/50 text-xs mt-0.5">{seo.twitter_description || seo.og_description || seo.site_description}</p>
                                    <p className="text-white/30 text-xs mt-2">dermato-check.vercel.app</p>
                                </div>
                            </div>
                        </div>
                        <Field label="Titre Twitter (laissez vide = utilise Open Graph)" value={seo.twitter_title} onChange={(v) => setSeo({ ...seo, twitter_title: v })} />
                        <Field label="Description Twitter" value={seo.twitter_description} onChange={(v) => setSeo({ ...seo, twitter_description: v })} textarea />
                        <Field label="Image Twitter (1200×600 recommandé — URL)" value={seo.twitter_image} onChange={(v) => setSeo({ ...seo, twitter_image: v })} />
                    </>
                )}

                {/* Technical */}
                {activeTab === 'technical' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-white font-semibold mb-1">Robots.txt</h3>
                            <p className="text-xs text-white/40 mb-3">Contrôle l'accès des robots d'indexation à votre site.</p>
                            <textarea rows={6} value={seo.robots_txt} onChange={(e) => setSeo({ ...seo, robots_txt: e.target.value })}
                                className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-3 text-white/70 text-sm focus:outline-none focus:border-brand-primary/50 resize-none font-mono" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-1">Données Structurées (JSON-LD)</h3>
                            <p className="text-xs text-white/40 mb-3">Aide Google à comprendre la nature de votre organisation (Schema.org).</p>
                            <textarea rows={12} value={seo.json_ld} onChange={(e) => setSeo({ ...seo, json_ld: e.target.value })}
                                className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-3 text-emerald-400/80 text-xs focus:outline-none focus:border-brand-primary/50 resize-none font-mono" />
                        </div>
                        <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                            <h4 className="text-white text-sm font-medium mb-2">Sitemap</h4>
                            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer"
                                className="text-brand-primary text-sm hover:underline font-mono">
                                /sitemap.xml →
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
