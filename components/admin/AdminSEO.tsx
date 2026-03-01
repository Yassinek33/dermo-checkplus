import React, { useState, useEffect, useCallback } from 'react';
import { cmsService } from '../../services/cmsService';
import {
    getAllStaticUrls,
    getBlogArticleUrls,
    notifyGoogleIndexing,
    notifyMultipleUrls,
    pingSitemap,
    getIndexingLogs,
    getPublishedPosts,
} from '../../lib/google-indexing';

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
    robots_txt: 'User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://www.dermatocheck.com/sitemap.xml',
    json_ld: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "MedicalOrganization",
        "name": "DermatoCheck",
        "description": "Assistant dermatologique basé sur l'intelligence artificielle",
        "url": "https://www.dermatocheck.com"
    }, null, 2)
};

// ─── Indexation Tab ────────────────────────────────────────────────────────────

type UrlStatus = 'idle' | 'submitting' | 'success' | 'error';

interface UrlRow {
    url: string;
    label: string;
    status: UrlStatus;
    group: 'static' | 'blog';
}

const IndexationTab: React.FC = () => {
    const secret = (import.meta as any).env?.VITE_INDEXING_SECRET || '';
    const [manualSecret, setManualSecret] = useState('');
    const effectiveSecret = secret || manualSecret;

    const [urlRows, setUrlRows] = useState<UrlRow[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [loadingUrls, setLoadingUrls] = useState(true);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [pingStatus, setPingStatus] = useState<{ done: boolean; success: boolean; message: string } | null>(null);
    const [isPinging, setIsPinging] = useState(false);
    const [batchProgress, setBatchProgress] = useState<{ done: number; total: number } | null>(null);

    // Load URLs on mount
    useEffect(() => {
        const load = async () => {
            setLoadingUrls(true);
            const staticUrls = getAllStaticUrls();
            const staticRows: UrlRow[] = staticUrls.map(url => ({
                url,
                label: url.replace('https://www.dermatocheck.com', ''),
                status: 'idle',
                group: 'static',
            }));

            try {
                const posts = await getPublishedPosts();
                const blogUrls = getBlogArticleUrls(posts);
                const blogRows: UrlRow[] = blogUrls.map((url, i) => ({
                    url,
                    label: posts[i]?.title ? `${posts[i].title}` : url.replace('https://www.dermatocheck.com', ''),
                    status: 'idle',
                    group: 'blog',
                }));
                setUrlRows([...staticRows, ...blogRows]);
            } catch (_) {
                setUrlRows(staticRows);
            }
            setLoadingUrls(false);
        };
        load();
    }, []);

    // Load logs
    const loadLogs = useCallback(async () => {
        setLoadingLogs(true);
        const data = await getIndexingLogs(30);
        setLogs(data);
        setLoadingLogs(false);
    }, []);

    useEffect(() => { loadLogs(); }, [loadLogs]);

    const updateRowStatus = (url: string, status: UrlStatus) => {
        setUrlRows(prev => prev.map(r => r.url === url ? { ...r, status } : r));
    };

    const handleSubmitOne = async (url: string) => {
        if (!effectiveSecret) { alert('Entrez le VITE_INDEXING_SECRET'); return; }
        updateRowStatus(url, 'submitting');
        const result = await notifyGoogleIndexing(url, effectiveSecret);
        updateRowStatus(url, result.success ? 'success' : 'error');
        await loadLogs();
    };

    const handleSubmitAll = async (group?: 'static' | 'blog') => {
        if (!effectiveSecret) { alert('Entrez le VITE_INDEXING_SECRET'); return; }
        const targets = urlRows.filter(r => !group || r.group === group);
        const urls = targets.map(r => r.url);
        targets.forEach(r => updateRowStatus(r.url, 'submitting'));

        setBatchProgress({ done: 0, total: urls.length });
        await notifyMultipleUrls(urls, effectiveSecret, (done, total, lastSuccess) => {
            setBatchProgress({ done, total });
            const url = urls[done - 1];
            updateRowStatus(url, lastSuccess ? 'success' : 'error');
        });
        setBatchProgress(null);
        await loadLogs();
    };

    const handlePing = async () => {
        setIsPinging(true);
        setPingStatus(null);
        const result = await pingSitemap();
        setPingStatus({ done: true, success: result.success, message: result.message });
        setIsPinging(false);
    };

    const StatusIcon = ({ status }: { status: UrlStatus }) => {
        if (status === 'submitting') return <span className="inline-block w-3 h-3 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />;
        if (status === 'success') return <span className="text-emerald-400 text-xs">✓</span>;
        if (status === 'error') return <span className="text-red-400 text-xs">✗</span>;
        return <span className="w-3 h-3 rounded-full bg-white/10 inline-block" />;
    };

    const staticRows = urlRows.filter(r => r.group === 'static');
    const blogRows = urlRows.filter(r => r.group === 'blog');

    return (
        <div className="space-y-6">
            {/* Secret input if not configured via env */}
            {!secret && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-xl">
                    <p className="text-xs text-amber-400 mb-2 font-medium">
                        ⚠️ Variable <code className="font-mono">VITE_INDEXING_SECRET</code> non configurée dans Vercel.
                        Entrez le secret manuellement (ou configurez-le dans Vercel &gt; Settings &gt; Environment Variables) :
                    </p>
                    <input
                        type="password"
                        value={manualSecret}
                        onChange={e => setManualSecret(e.target.value)}
                        placeholder="INDEXING_SECRET..."
                        className="w-full bg-[#0a0b0d] border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-brand-primary/50"
                    />
                </div>
            )}

            {/* Ping Sitemap */}
            <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h3 className="text-white font-semibold text-sm">Ping Sitemap Google</h3>
                    <p className="text-white/40 text-xs mt-0.5">Notifie Google que le sitemap a été mis à jour →{' '}
                        <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline font-mono">/sitemap.xml</a>
                    </p>
                    {pingStatus && (
                        <p className={`text-xs mt-1.5 font-medium ${pingStatus.success ? 'text-emerald-400' : 'text-red-400'}`}>
                            {pingStatus.success ? '✓' : '✗'} {pingStatus.message}
                        </p>
                    )}
                </div>
                <button
                    onClick={handlePing}
                    disabled={isPinging}
                    className="shrink-0 flex items-center gap-2 px-4 py-2 bg-brand-primary/15 border border-brand-primary/25 text-brand-primary rounded-lg text-sm font-semibold hover:bg-brand-primary/25 transition-colors disabled:opacity-40"
                >
                    {isPinging ? (
                        <><span className="inline-block w-3 h-3 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" /> Envoi...</>
                    ) : '📡 Ping Sitemap'}
                </button>
            </div>

            {/* Batch progress bar */}
            {batchProgress && (
                <div className="p-3 bg-brand-primary/10 border border-brand-primary/20 rounded-xl">
                    <div className="flex justify-between text-xs text-brand-primary mb-1.5">
                        <span>Soumission en cours...</span>
                        <span>{batchProgress.done} / {batchProgress.total}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand-primary rounded-full transition-all duration-200"
                            style={{ width: `${(batchProgress.done / batchProgress.total) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Static pages */}
            <div className="border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/[0.06]">
                    <div>
                        <h3 className="text-white font-semibold text-sm">Pages statiques</h3>
                        <p className="text-white/40 text-xs">{staticRows.length} URLs (toutes langues)</p>
                    </div>
                    <button
                        onClick={() => handleSubmitAll('static')}
                        disabled={!!batchProgress || !effectiveSecret}
                        className="text-xs px-3 py-1.5 bg-brand-primary text-[#030305] rounded-lg font-bold hover:bg-brand-primary/90 transition-colors disabled:opacity-40"
                    >
                        Tout soumettre
                    </button>
                </div>
                <div className="divide-y divide-white/[0.04] max-h-72 overflow-y-auto">
                    {loadingUrls ? (
                        <div className="px-4 py-8 text-center text-white/30 text-sm">Chargement...</div>
                    ) : staticRows.map(row => (
                        <div key={row.url} className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <StatusIcon status={row.status} />
                                <span className="text-white/60 text-xs font-mono truncate">{row.label || '/'}</span>
                            </div>
                            <button
                                onClick={() => handleSubmitOne(row.url)}
                                disabled={row.status === 'submitting' || !effectiveSecret}
                                className="shrink-0 ml-3 text-xs px-2.5 py-1 border border-white/10 text-white/50 rounded-lg hover:border-brand-primary/40 hover:text-brand-primary transition-colors disabled:opacity-30"
                            >
                                →
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Blog articles */}
            <div className="border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/[0.06]">
                    <div>
                        <h3 className="text-white font-semibold text-sm">Articles de blog</h3>
                        <p className="text-white/40 text-xs">{blogRows.length} articles publiés</p>
                    </div>
                    {blogRows.length > 0 && (
                        <button
                            onClick={() => handleSubmitAll('blog')}
                            disabled={!!batchProgress || !effectiveSecret}
                            className="text-xs px-3 py-1.5 bg-brand-primary text-[#030305] rounded-lg font-bold hover:bg-brand-primary/90 transition-colors disabled:opacity-40"
                        >
                            Tout soumettre
                        </button>
                    )}
                </div>
                <div className="divide-y divide-white/[0.04] max-h-64 overflow-y-auto">
                    {loadingUrls ? (
                        <div className="px-4 py-8 text-center text-white/30 text-sm">Chargement...</div>
                    ) : blogRows.length === 0 ? (
                        <div className="px-4 py-8 text-center text-white/30 text-sm">Aucun article publié</div>
                    ) : blogRows.map(row => (
                        <div key={row.url} className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <StatusIcon status={row.status} />
                                <span className="text-white/60 text-xs truncate">{row.label}</span>
                            </div>
                            <button
                                onClick={() => handleSubmitOne(row.url)}
                                disabled={row.status === 'submitting' || !effectiveSecret}
                                className="shrink-0 ml-3 text-xs px-2.5 py-1 border border-white/10 text-white/50 rounded-lg hover:border-brand-primary/40 hover:text-brand-primary transition-colors disabled:opacity-30"
                            >
                                →
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Submit All button */}
            <button
                onClick={() => handleSubmitAll()}
                disabled={!!batchProgress || !effectiveSecret}
                className="w-full py-3 bg-gradient-to-r from-brand-primary to-[#06b6d4] text-[#030305] font-bold rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
            >
                🚀 Soumettre toutes les URLs à Google ({urlRows.length})
            </button>

            {/* Indexing history */}
            <div className="border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/[0.06]">
                    <h3 className="text-white font-semibold text-sm">Historique des soumissions</h3>
                    <button onClick={loadLogs} className="text-xs text-white/40 hover:text-white transition-colors">↻ Actualiser</button>
                </div>
                <div className="divide-y divide-white/[0.04] max-h-80 overflow-y-auto">
                    {loadingLogs ? (
                        <div className="px-4 py-8 text-center text-white/30 text-sm">Chargement...</div>
                    ) : logs.length === 0 ? (
                        <div className="px-4 py-8 text-center text-white/30 text-sm">Aucune soumission enregistrée</div>
                    ) : logs.map((log: any) => (
                        <div key={log.id} className="flex items-center gap-3 px-4 py-2.5">
                            <span className={`text-sm ${log.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {log.status === 'success' ? '✓' : '✗'}
                            </span>
                            <span className="text-white/50 text-xs font-mono truncate flex-1">{log.url}</span>
                            <span className="shrink-0 text-white/25 text-xs">
                                {new Date(log.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Setup instructions */}
            <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl text-xs text-white/30 space-y-1.5">
                <p className="text-white/50 font-medium mb-2">⚙️ Configuration requise (Vercel → Settings → Env Vars)</p>
                <p><code className="text-white/40 font-mono">GOOGLE_SERVICE_ACCOUNT_EMAIL</code> — email du compte de service Google</p>
                <p><code className="text-white/40 font-mono">GOOGLE_PRIVATE_KEY</code> — clé privée RSA (depuis le JSON du compte de service)</p>
                <p><code className="text-white/40 font-mono">VITE_INDEXING_SECRET</code> — secret partagé pour sécuriser l'API</p>
                <p><code className="text-white/40 font-mono">SUPABASE_SERVICE_ROLE_KEY</code> — clé service Supabase pour écrire les logs</p>
            </div>
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────

export const AdminSEO: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'global' | 'opengraph' | 'twitter' | 'technical' | 'indexation'>('global');
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
        { id: 'indexation', label: '🔍 Indexation' },
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
                    <h1 className="text-3xl font-display font-bold text-white">SEO & Indexation</h1>
                    <p className="text-white/40 mt-1 text-sm">Contrôlez la visibilité du site dans les moteurs de recherche</p>
                </div>
                {activeTab !== 'indexation' && (
                    <button onClick={handleSave} disabled={isSaving}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all self-start ${saved ? 'bg-emerald-500 text-white' : 'bg-brand-primary text-[#030305] hover:bg-brand-primary/90'} shadow-[0_0_15px_rgba(45,212,191,0.2)] disabled:opacity-40`}>
                        {saved ? '✓ Sauvegardé !' : isSaving ? '...' : '💾 Sauvegarder'}
                    </button>
                )}
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
                        <div>
                            <p className="text-xs text-white/40 mb-3 uppercase tracking-wider font-medium">Aperçu Google Search</p>
                            <div className="bg-white rounded-xl p-5 shadow-inner">
                                <p className="text-[13px] text-green-700 mb-1">www.dermatocheck.com</p>
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
                                    <p className="text-[10px] text-slate-400 uppercase font-mono">DERMATOCHECK.COM</p>
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
                                    <p className="text-white/30 text-xs mt-2">dermatocheck.com</p>
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
                            <h4 className="text-white text-sm font-medium mb-2">Sitemap dynamique</h4>
                            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer"
                                className="text-brand-primary text-sm hover:underline font-mono">
                                /sitemap.xml →
                            </a>
                            <p className="text-white/30 text-xs mt-1">Généré dynamiquement depuis Supabase à chaque requête.</p>
                        </div>
                    </div>
                )}

                {/* Indexation */}
                {activeTab === 'indexation' && <IndexationTab />}
            </div>
        </div>
    );
};
