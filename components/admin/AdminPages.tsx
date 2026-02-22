import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cmsService, Page } from '../../services/cmsService';

// All pages that exist in the real site — with their metadata
const SITE_PAGES_DEFAULTS: Partial<Page>[] = [
    { id: 'home', title: 'Accueil', path: '/', status: 'published' },
    { id: 'about', title: 'À propos', path: '/about', status: 'published' },
    { id: 'blog', title: 'Blog & Articles', path: '/blog', status: 'published' },
    { id: 'contact', title: 'Contact', path: '/contact', status: 'published' },
    { id: 'faq', title: 'FAQ', path: '/faq', status: 'published' },
    { id: 'dictionary', title: 'Dictionnaire médical', path: '/dictionary', status: 'published' },
    { id: 'info', title: 'Informations médicales', path: '/info', status: 'published' },
    { id: 'find-dermatologist', title: 'Trouver un dermatologue', path: '/find-dermatologist', status: 'published' },
    { id: 'questionnaire', title: 'Auto-analyse (IA)', path: '/questionnaire', status: 'published' },
    { id: 'legal', title: 'Mentions légales', path: '/legal', status: 'published' },
    { id: 'privacy', title: 'Politique de confidentialité', path: '/privacy', status: 'published' },
    { id: 'auth', title: 'Connexion / Inscription', path: '/auth', status: 'published' },
];

const PAGE_ICONS: Record<string, string> = {
    home: '🏠', about: 'ℹ️', blog: '📝', contact: '📬', faq: '❓',
    dictionary: '📖', info: '🩺', 'find-dermatologist': '🔍',
    questionnaire: '🤖', legal: '⚖️', privacy: '🔒', auth: '🔑',
};
const PAGE_TYPE: Record<string, { label: string; color: string }> = {
    home: { label: 'Principale', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
    blog: { label: 'Listing', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
    questionnaire: { label: 'Outil IA', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    auth: { label: 'Auth', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    legal: { label: 'Légal', color: 'text-gray-400 bg-gray-400/10 border-gray-400/20' },
    privacy: { label: 'Légal', color: 'text-gray-400 bg-gray-400/10 border-gray-400/20' },
};

export const AdminPages: React.FC = () => {
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
    const [editingPage, setEditingPage] = useState<Partial<Page>>({
        title: '', path: '', content: {}, status: 'published'
    });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { if (view === 'list') loadPages(); }, [view]);

    // Merge DB pages with local defaults so all site pages always appear
    const loadPages = async () => {
        setLoading(true);
        try {
            const dbPages = await cmsService.getPages();
            const dbIds = new Set(dbPages.map(p => p.id));

            // Add any missing site pages with placeholder data
            const missing = SITE_PAGES_DEFAULTS.filter(p => !dbIds.has(p.id!)).map(p => ({
                ...p,
                content: p.content || {},
                updated_at: new Date().toISOString()
            })) as Page[];

            setPages([...dbPages, ...missing]);
        } catch (e) {
            // Fallback: show all default site pages
            setPages(SITE_PAGES_DEFAULTS as Page[]);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (status: 'draft' | 'published') => {
        setIsSaving(true);
        setSaveMsg(null);
        try {
            await cmsService.savePage({ ...editingPage, status });
            setSaveMsg({ type: 'ok', text: 'Page sauvegardée ✓' });
            setTimeout(() => { setSaveMsg(null); setView('list'); }, 1200);
        } catch (e: any) {
            setSaveMsg({ type: 'err', text: `Erreur : ${e.message}` });
        } finally {
            setIsSaving(false);
        }
    };

    const openEditor = (page?: Partial<Page>) => {
        const defaults = page?.id ? SITE_PAGES_DEFAULTS.find(p => p.id === page.id) : undefined;
        setEditingPage(page ?? { title: '', path: '', content: {}, status: 'published' });
        setSaveMsg(null);
        setView('editor');
    };

    const autoPath = (title: string) =>
        '/' + title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const filteredPages = pages.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.path?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ===== EDITOR VIEW =====
    if (view === 'editor') {
        const content = (typeof editingPage.content === 'object' && !Array.isArray(editingPage.content))
            ? editingPage.content as any : {};
        const isSystemPage = SITE_PAGES_DEFAULTS.some(p => p.id === editingPage.id);
        const ic = PAGE_ICONS[editingPage.id || ''] || '📄';

        const updateContent = (key: string, val: string) =>
            setEditingPage({ ...editingPage, content: { ...content, [key]: val } });

        return (
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                {/* Sticky toolbar */}
                <div className="sticky top-0 z-20 bg-[#030305]/95 backdrop-blur-lg border-b border-white/[0.06] -mx-4 md:-mx-8 px-4 md:px-8 py-4 flex items-center justify-between gap-4">
                    <button onClick={() => setView('list')} className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Retour aux pages
                    </button>
                    <div className="flex items-center gap-3">
                        {saveMsg && (
                            <span className={`text-xs px-3 py-1.5 rounded-lg ${saveMsg.type === 'ok' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                {saveMsg.text}
                            </span>
                        )}
                        <button onClick={() => handleSave('draft')} disabled={isSaving} className="px-4 py-2 text-sm bg-white/[0.05] hover:bg-white/10 text-white/80 rounded-xl border border-white/10 transition-colors disabled:opacity-40">
                            Brouillon
                        </button>
                        <button onClick={() => handleSave('published')} disabled={isSaving} className="px-5 py-2 text-sm bg-brand-primary text-[#030305] rounded-xl font-bold hover:bg-brand-primary/90 disabled:opacity-40">
                            {isSaving ? '...' : '💾 Sauvegarder'}
                        </button>
                    </div>
                </div>

                {/* Page identity */}
                <div className="flex items-start gap-4">
                    <span className="text-4xl mt-1">{ic}</span>
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Titre de la page..."
                            value={editingPage.title || ''}
                            onChange={e => {
                                const title = e.target.value;
                                setEditingPage({ ...editingPage, title, path: (editingPage.id && isSystemPage) ? editingPage.path : autoPath(title) });
                            }}
                            className="w-full bg-transparent text-3xl font-display font-bold text-white placeholder-white/15 border-none focus:outline-none leading-tight"
                            autoFocus
                        />
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-white/30 text-xs font-mono">URL :</span>
                            <input type="text" value={editingPage.path || ''}
                                onChange={e => setEditingPage({ ...editingPage, path: e.target.value })}
                                readOnly={isSystemPage}
                                className={`flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-white/70 font-mono text-xs focus:outline-none focus:border-brand-primary/40 ${isSystemPage ? 'opacity-50 cursor-not-allowed' : ''}`} />
                            <a href={`http://localhost:3005${editingPage.path || '/'}`} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-brand-primary hover:underline whitespace-nowrap">Voir →</a>
                        </div>
                        {isSystemPage && <p className="text-xs text-amber-400/60 mt-1">⚠️ Page système — l'URL ne peut pas être modifiée</p>}
                    </div>
                </div>

                {/* SEO */}
                <div className="glass-panel rounded-2xl border border-white/[0.06] p-6 space-y-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">🔍 SEO de cette page</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">Titre SEO (balise &lt;title&gt;)</label>
                            <input type="text" value={content.seo_title || ''} onChange={e => updateContent('seo_title', e.target.value)}
                                placeholder={`${editingPage.title} | SkinCheck`}
                                className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-primary/50" />
                        </div>
                        <div>
                            <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">Méta description</label>
                            <textarea rows={2} value={content.seo_description || ''} onChange={e => updateContent('seo_description', e.target.value)}
                                className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-primary/50 resize-none" />
                            <div className="flex justify-between mt-1">
                                <span className="text-xs text-white/20">Idéal : 120–160 caractères</span>
                                <span className={`text-xs ${(content.seo_description?.length || 0) > 160 ? 'text-red-400' : 'text-white/30'}`}>
                                    {content.seo_description?.length || 0}/160
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Google preview */}
                    <div className="mt-2 p-4 bg-white rounded-xl">
                        <div className="text-xs text-gray-500 mb-1">dermatocheck.com{editingPage.path}</div>
                        <div className="text-base text-blue-600 font-medium leading-tight truncate">
                            {content.seo_title || editingPage.title || 'Titre de la page'}
                        </div>
                        <div className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                            {content.seo_description || 'Aucune méta description définie.'}
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <div className="glass-panel rounded-2xl border border-white/[0.06] p-6 space-y-4">
                    <h3 className="text-white font-semibold">📝 Contenu de la page</h3>
                    <div>
                        <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">Titre principal (H1)</label>
                        <input type="text" value={content.h1 || ''} onChange={e => updateContent('h1', e.target.value)}
                            className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-primary/50" />
                    </div>
                    <div>
                        <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">Description / Sous-titre</label>
                        <textarea rows={3} value={content.description || ''} onChange={e => updateContent('description', e.target.value)}
                            className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-primary/50 resize-none" />
                    </div>
                    <div>
                        <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">Contenu libre (Markdown)</label>
                        <textarea rows={14} value={content.body || ''} onChange={e => updateContent('body', e.target.value)}
                            placeholder="## Section&#10;&#10;Votre contenu ici..."
                            className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-3 text-white/80 text-sm focus:outline-none focus:border-brand-primary/50 resize-none font-mono" />
                    </div>
                </div>

                {/* Open Graph */}
                <div className="glass-panel rounded-2xl border border-white/[0.06] p-6 space-y-4">
                    <h3 className="text-white font-semibold">🌐 Open Graph (Réseaux sociaux)</h3>
                    <div>
                        <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">Titre OG</label>
                        <input type="text" value={content.og_title || ''} onChange={e => updateContent('og_title', e.target.value)}
                            placeholder={content.seo_title || editingPage.title || ''}
                            className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-primary/50" />
                    </div>
                    <div>
                        <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">Description OG</label>
                        <textarea rows={2} value={content.og_description || ''} onChange={e => updateContent('og_description', e.target.value)}
                            className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-primary/50 resize-none" />
                    </div>
                    <div>
                        <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">URL image OG (1200×630)</label>
                        <input type="text" value={content.og_image || ''} onChange={e => updateContent('og_image', e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-primary/50" />
                    </div>
                </div>
            </div>
        );
    }

    // ===== LIST VIEW =====
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">Pages du site</h1>
                    <p className="text-white/40 mt-1 text-sm">{pages.length} pages — SEO, contenu et métadonnées</p>
                </div>
                <button onClick={() => openEditor()} className="flex items-center gap-2 bg-brand-primary text-[#030305] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-primary/90 transition-colors self-start">
                    📄 Nouvelle page
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Rechercher une page..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white/80 text-sm focus:outline-none focus:border-brand-primary/40" />
            </div>

            {/* Pages grid */}
            {loading ? (
                <div className="glass-panel rounded-2xl border border-white/[0.06] p-12 text-center text-white/30">Chargement...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredPages.map((page, i) => {
                        const ic = PAGE_ICONS[page.id] || '📄';
                        const typeTag = PAGE_TYPE[page.id];
                        const content = typeof page.content === 'object' && !Array.isArray(page.content) ? page.content as any : {};
                        const hasSEO = !!(content.seo_title || content.seo_description);
                        const isSystem = SITE_PAGES_DEFAULTS.some(p => p.id === page.id);

                        return (
                            <motion.div
                                key={page.id}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                onClick={() => openEditor(page)}
                                className="glass-panel rounded-2xl border border-white/[0.06] p-5 cursor-pointer hover:border-white/10 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <span className="text-2xl">{ic}</span>
                                    <div className="flex items-center gap-2">
                                        {typeTag && (
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${typeTag.color}`}>
                                                {typeTag.label}
                                            </span>
                                        )}
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${page.status === 'published' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-amber-400 border-amber-500/20 bg-amber-500/10'}`}>
                                            {page.status === 'published' ? '● Publié' : '○ Brouillon'}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-white font-semibold text-base mb-1 group-hover:text-brand-primary transition-colors">{page.title}</h3>
                                <p className="text-white/30 text-xs font-mono mb-3">{page.path}</p>

                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        {hasSEO ? (
                                            <span className="text-emerald-400/80 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                SEO OK
                                            </span>
                                        ) : (
                                            <span className="text-amber-400/60 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                                SEO manquant
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-white/20 group-hover:text-brand-primary transition-colors">Éditer →</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
                {[
                    { label: 'Total pages', value: pages.length },
                    { label: 'Publiées', value: pages.filter(p => p.status === 'published').length },
                    {
                        label: 'SEO complet', value: pages.filter(p => {
                            const c = typeof p.content === 'object' && !Array.isArray(p.content) ? p.content as any : {};
                            return !!(c.seo_title && c.seo_description);
                        }).length
                    },
                ].map(stat => (
                    <div key={stat.label} className="glass-panel rounded-xl border border-white/[0.06] p-4">
                        <div className="text-2xl font-bold text-white font-display">{stat.value}</div>
                        <div className="text-xs text-white/30 mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
