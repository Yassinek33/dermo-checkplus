import React, { useState, useEffect } from 'react';
import { cmsService, Post } from '../../services/cmsService';

const categories = ['skincare', 'conditions', 'prevention', 'treatments', 'lifestyle'];

export const AdminPosts: React.FC = () => {
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [tagInput, setTagInput] = useState('');

    const [editingPost, setEditingPost] = useState<Partial<Post>>({
        title: '', content: '', excerpt: '', status: 'draft',
        seo_title: '', seo_description: '', tags: [], featured_image_url: ''
    });

    useEffect(() => {
        if (view === 'list') loadPosts();
    }, [view]);

    const loadPosts = async () => {
        setLoading(true);
        try { setPosts(await cmsService.getPosts()); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSave = async (status: 'draft' | 'published') => {
        setIsSaving(true);
        try {
            await cmsService.savePost({ ...editingPost, status });
            setView('list');
        } catch (e) { alert("Erreur lors de l'enregistrement."); console.error(e); }
        finally { setIsSaving(false); }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Supprimer cet article définitivement ?")) {
            await cmsService.deletePost(id);
            loadPosts();
        }
    };

    const openEditor = (post?: Post) => {
        setEditingPost(post ?? { title: '', content: '', excerpt: '', status: 'draft', seo_title: '', seo_description: '', tags: [], featured_image_url: '' });
        setView('editor');
    };

    const addTag = () => {
        const tag = tagInput.trim();
        if (tag && !editingPost.tags?.includes(tag)) {
            setEditingPost({ ...editingPost, tags: [...(editingPost.tags || []), tag] });
        }
        setTagInput('');
    };

    const removeTag = (tag: string) => {
        setEditingPost({ ...editingPost, tags: editingPost.tags?.filter(t => t !== tag) });
    };

    const autoSlug = (title: string) => title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const seoTitleLen = editingPost.seo_title?.length || 0;
    const seoDescLen = editingPost.seo_description?.length || 0;
    const seoScore = seoTitleLen >= 40 && seoTitleLen <= 60 && seoDescLen >= 100 && seoDescLen <= 160 ? 'Excellent' : seoTitleLen > 0 && seoDescLen > 0 ? 'Moyen' : 'Incomplet';
    const seoScoreColor = seoScore === 'Excellent' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : seoScore === 'Moyen' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20';

    const filteredPosts = posts.filter(p => {
        if (filterStatus !== 'all' && p.status !== filterStatus) return false;
        if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const insertMarkdown = (prefix: string, suffix = '') => {
        const textarea = document.getElementById('post-content') as HTMLTextAreaElement;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = textarea.value.substring(start, end);
        const newVal = textarea.value.substring(0, start) + prefix + selected + suffix + textarea.value.substring(end);
        setEditingPost({ ...editingPost, content: newVal });
    };

    if (view === 'editor') {
        return (
            <div className="max-w-6xl mx-auto pb-20">
                {/* Sticky Toolbar */}
                <div className="sticky top-0 z-20 bg-[#030305]/90 backdrop-blur-lg border-b border-white/[0.06] -mx-4 md:-mx-8 px-4 md:px-8 py-4 mb-8 flex items-center justify-between gap-4">
                    <button onClick={() => setView('list')} className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Retour
                    </button>
                    <div className="flex gap-2">
                        <button onClick={() => handleSave('draft')} disabled={isSaving} className="px-4 py-2 text-sm bg-white/[0.05] hover:bg-white/10 text-white/80 hover:text-white rounded-xl border border-white/10 transition-colors disabled:opacity-40">
                            {isSaving ? '...' : 'Brouillon'}
                        </button>
                        <button onClick={() => handleSave('published')} disabled={isSaving} className="px-5 py-2 text-sm bg-brand-primary text-[#030305] rounded-xl font-bold hover:bg-brand-primary/90 transition-colors disabled:opacity-40 shadow-[0_0_15px_rgba(45,212,191,0.25)]">
                            {isSaving ? '...' : '🚀 Publier'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main column */}
                    <div className="lg:col-span-2 space-y-6">
                        <input
                            type="text"
                            placeholder="Titre de l'article..."
                            value={editingPost.title || ''}
                            onChange={(e) => {
                                const title = e.target.value;
                                setEditingPost({ ...editingPost, title, slug: editingPost.id ? editingPost.slug : autoSlug(title) });
                            }}
                            className="w-full bg-transparent text-4xl md:text-5xl font-display font-bold text-white placeholder-white/15 border-none focus:outline-none focus:ring-0 px-0 leading-tight"
                            autoFocus
                        />

                        {/* Slug */}
                        <div className="flex items-center gap-2">
                            <span className="text-white/30 text-sm font-mono">Slug :</span>
                            <input
                                type="text"
                                value={editingPost.slug || ''}
                                onChange={(e) => setEditingPost({ ...editingPost, slug: autoSlug(e.target.value) })}
                                className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-white/70 font-mono text-sm focus:outline-none focus:border-brand-primary/40"
                            />
                        </div>

                        {/* Excerpt */}
                        <div>
                            <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider">Extrait (résumé)</label>
                            <textarea
                                rows={2}
                                placeholder="Un court résumé affiché sur la liste du blog..."
                                value={editingPost.excerpt || ''}
                                onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white/80 placeholder-white/20 focus:outline-none focus:border-brand-primary/40 resize-none text-sm"
                            />
                        </div>

                        {/* Content Editor */}
                        <div className="glass-panel rounded-2xl border border-white/[0.06] overflow-hidden">
                            <div className="px-4 py-3 border-b border-white/[0.06] flex flex-wrap gap-1 bg-[#0a0b0d]/50">
                                {[
                                    { label: 'B', action: () => insertMarkdown('**', '**') },
                                    { label: 'I', action: () => insertMarkdown('*', '*') },
                                    { label: 'H2', action: () => insertMarkdown('\n## ') },
                                    { label: 'H3', action: () => insertMarkdown('\n### ') },
                                    { label: '"', action: () => insertMarkdown('\n> ') },
                                    { label: '—', action: () => insertMarkdown('\n---\n') },
                                    { label: '• List', action: () => insertMarkdown('\n- ') },
                                    { label: '1. List', action: () => insertMarkdown('\n1. ') },
                                    { label: '🔗 Lien', action: () => insertMarkdown('[texte]', '(url)') },
                                    { label: '🖼️ Image', action: () => insertMarkdown('![alt]', '(url)') },
                                ].map(btn => (
                                    <button
                                        key={btn.label}
                                        onClick={btn.action}
                                        className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white text-xs font-mono transition-colors border border-white/[0.04]"
                                    >
                                        {btn.label}
                                    </button>
                                ))}
                            </div>
                            <textarea
                                id="post-content"
                                placeholder="Rédigez votre article ici en Markdown..."
                                value={editingPost.content || ''}
                                onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                                className="w-full min-h-[500px] bg-transparent text-white/80 placeholder-white/20 focus:outline-none resize-none leading-relaxed text-base p-6 font-mono"
                            />
                        </div>

                        {/* SEO Panel */}
                        <div className="glass-panel p-6 rounded-2xl border border-white/[0.06] space-y-5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-white font-bold">🔍 SEO & Méta</h3>
                                <span className={`text-[10px] px-2.5 py-1 rounded-full border font-mono uppercase tracking-wider ${seoScoreColor}`}>Score: {seoScore}</span>
                            </div>

                            {/* Google Preview */}
                            <div className="bg-white rounded-xl p-4">
                                <p className="text-blue-700 text-base font-medium leading-tight mb-0.5 truncate">{editingPost.seo_title || editingPost.title || 'Titre de l\'article'}</p>
                                <p className="text-green-700 text-xs mb-1">dermato-check.com/{editingPost.slug || 'slug'}</p>
                                <p className="text-gray-600 text-xs line-clamp-2">{editingPost.seo_description || 'La méta description apparaîtra ici dans les résultats Google...'}</p>
                            </div>

                            <div>
                                <label className="flex justify-between text-xs text-white/40 mb-2 uppercase tracking-wider">
                                    <span>Titre SEO</span>
                                    <span className={seoTitleLen > 60 ? 'text-red-400' : seoTitleLen >= 40 ? 'text-emerald-400' : 'text-white/40'}>{seoTitleLen}/60</span>
                                </label>
                                <input type="text" value={editingPost.seo_title || ''} onChange={(e) => setEditingPost({ ...editingPost, seo_title: e.target.value })}
                                    className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-primary/50" />
                                <div className="h-1 w-full bg-white/5 mt-2 rounded overflow-hidden"><div className={`h-full transition-all ${seoTitleLen > 60 ? 'bg-red-500' : seoTitleLen >= 40 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(seoTitleLen / 60 * 100, 100)}%` }} /></div>
                            </div>
                            <div>
                                <label className="flex justify-between text-xs text-white/40 mb-2 uppercase tracking-wider">
                                    <span>Méta Description</span>
                                    <span className={seoDescLen > 160 ? 'text-red-400' : seoDescLen >= 100 ? 'text-emerald-400' : 'text-white/40'}>{seoDescLen}/160</span>
                                </label>
                                <textarea rows={3} value={editingPost.seo_description || ''} onChange={(e) => setEditingPost({ ...editingPost, seo_description: e.target.value })}
                                    className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-primary/50 resize-none" />
                                <div className="h-1 w-full bg-white/5 mt-2 rounded overflow-hidden"><div className={`h-full transition-all ${seoDescLen > 160 ? 'bg-red-500' : seoDescLen >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(seoDescLen / 160 * 100, 100)}%` }} /></div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5">
                        {/* Publish */}
                        <div className="glass-panel p-5 rounded-2xl border border-white/[0.06] space-y-4">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">État & Publication</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/50">Statut</span>
                                    <span className={editingPost.status === 'published' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                                        {editingPost.status === 'published' ? '🟢 Publié' : '🟡 Brouillon'}
                                    </span>
                                </div>
                                {editingPost.created_at && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Créé</span>
                                        <span className="text-white/70 font-mono text-xs">{new Date(editingPost.created_at).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                )}
                            </div>
                            <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-2">
                                <button onClick={() => handleSave('published')} disabled={isSaving} className="w-full py-2.5 bg-brand-primary text-[#030305] rounded-xl font-bold text-sm hover:bg-brand-primary/90 transition-colors shadow-[0_0_15px_rgba(45,212,191,0.2)] disabled:opacity-40">
                                    🚀 Publier
                                </button>
                                <button onClick={() => handleSave('draft')} disabled={isSaving} className="w-full py-2.5 bg-white/[0.04] text-white/70 rounded-xl text-sm hover:bg-white/[0.08] transition-colors border border-white/[0.06] disabled:opacity-40">
                                    Enregistrer brouillon
                                </button>
                            </div>
                        </div>

                        {/* Category */}
                        <div className="glass-panel p-5 rounded-2xl border border-white/[0.06]">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Catégorie</h3>
                            <select
                                value={(editingPost as any).category || ''}
                                onChange={(e) => setEditingPost({ ...editingPost, ...{ category: e.target.value } })}
                                className="w-full bg-[#0a0b0d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-primary/50"
                            >
                                <option value="">Aucune catégorie</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Tags */}
                        <div className="glass-panel p-5 rounded-2xl border border-white/[0.06]">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Tags</h3>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    placeholder="Ajouter un tag..."
                                    className="flex-1 bg-[#0a0b0d] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-primary/50"
                                />
                                <button onClick={addTag} className="px-3 py-2 bg-brand-primary/20 text-brand-primary rounded-lg text-sm border border-brand-primary/30 hover:bg-brand-primary/30">+</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {editingPost.tags?.map(tag => (
                                    <span key={tag} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.05] text-white/60 rounded-full text-xs border border-white/[0.08]">
                                        {tag}
                                        <button onClick={() => removeTag(tag)} className="text-white/30 hover:text-white/60">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Featured Image */}
                        <div className="glass-panel p-5 rounded-2xl border border-white/[0.06]">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Image à la une</h3>
                            {editingPost.featured_image_url ? (
                                <div className="relative rounded-xl overflow-hidden group mb-3">
                                    <img src={editingPost.featured_image_url} alt="Featured" className="w-full h-32 object-cover" />
                                    <button onClick={() => setEditingPost({ ...editingPost, featured_image_url: '' })}
                                        className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm transition-opacity">
                                        🗑️ Supprimer
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full h-24 bg-white/[0.03] border border-dashed border-white/15 rounded-xl flex items-center justify-center text-white/30 text-xs mb-3">Aucune image</div>
                            )}
                            <input type="text" placeholder="URL de l'image..." value={editingPost.featured_image_url || ''}
                                onChange={(e) => setEditingPost({ ...editingPost, featured_image_url: e.target.value })}
                                className="w-full bg-[#0a0b0d] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-primary/50" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">Articles</h1>
                    <p className="text-white/40 mt-1 text-sm">Gérez le contenu de votre blog ({posts.length} articles)</p>
                </div>
                <button onClick={() => openEditor()} className="flex items-center gap-2 bg-brand-primary text-[#030305] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-primary/90 transition-colors shadow-[0_0_15px_rgba(45,212,191,0.2)] self-start">
                    ✍️ Nouvel article
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
                    {(['all', 'published', 'draft'] as const).map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
                            {s === 'all' ? 'Tous' : s === 'published' ? 'Publiés' : 'Brouillons'} ({
                                s === 'all' ? posts.length :
                                    s === 'published' ? posts.filter(p => p.status === 'published').length :
                                        posts.filter(p => p.status === 'draft').length
                            })
                        </button>
                    ))}
                </div>
                <input type="text" placeholder="Rechercher un article..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-brand-primary/40 placeholder-white/20" />
            </div>

            {/* Table */}
            <div className="glass-panel rounded-2xl border border-white/[0.06] overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-white/30">Chargement...</div>
                ) : filteredPosts.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-4xl mb-3">📝</div>
                        <p className="text-white/40">Aucun article trouvé.</p>
                        <button onClick={() => openEditor()} className="mt-4 text-brand-primary text-sm hover:underline">Créer le premier article →</button>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/[0.06] text-white/30 text-[10px] uppercase tracking-widest font-mono">
                                <th className="px-5 py-3">Titre</th>
                                <th className="px-4 py-3 hidden md:table-cell">Statut</th>
                                <th className="px-4 py-3 hidden lg:table-cell">Auteur</th>
                                <th className="px-4 py-3 hidden lg:table-cell">Date</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {filteredPosts.map(post => (
                                <tr key={post.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => openEditor(post)}>
                                    <td className="px-5 py-4">
                                        <p className="text-white font-medium group-hover:text-brand-primary transition-colors">{post.title || '(Sans titre)'}</p>
                                        <p className="text-white/30 text-xs font-mono mt-0.5">/{post.slug}</p>
                                    </td>
                                    <td className="px-4 py-4 hidden md:table-cell">
                                        <span className={`text-[10px] uppercase font-mono px-2.5 py-1 rounded-full border ${post.status === 'published' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-amber-400 border-amber-500/20 bg-amber-500/10'}`}>
                                            {post.status === 'published' ? '● Publié' : '○ Brouillon'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-white/50 text-sm hidden lg:table-cell">{post.author_name || 'Admin'}</td>
                                    <td className="px-4 py-4 text-white/30 text-sm font-mono hidden lg:table-cell">{new Date(post.created_at).toLocaleDateString('fr-FR')}</td>
                                    <td className="px-4 py-4 text-right">
                                        <button onClick={(e) => handleDelete(post.id, e)}
                                            className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-bold transition-all border border-red-500/20">
                                            Suppr.
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
