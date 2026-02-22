import React, { useState, useEffect, useRef } from 'react';
import { cmsService, MediaItem } from '../../services/cmsService';
import { supabase } from '../../services/supabaseClient';

export const AdminMedia: React.FC = () => {
    const [items, setItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [selected, setSelected] = useState<MediaItem | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'document'>('all');
    const [copied, setCopied] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { loadMedia(); }, []);

    const loadMedia = async () => {
        setLoading(true);
        try { setItems(await cmsService.getMedia()); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploading(true);
        setUploadProgress(0);
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || 'anonymous';
        try {
            for (let i = 0; i < files.length; i++) {
                await cmsService.uploadMedia(files[i], userId);
                setUploadProgress(Math.round(((i + 1) / files.length) * 100));
            }
            await loadMedia();
        } catch (e) { alert('Erreur lors de l\'upload.'); console.error(e); }
        finally { setUploading(false); }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleUpload(e.dataTransfer.files);
    };

    const handleDelete = async (item: MediaItem, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Supprimer ce fichier définitivement ?')) {
            await cmsService.deleteMedia(item.id, item.url);
            setSelected(null);
            await loadMedia();
        }
    };

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopied(url);
        setTimeout(() => setCopied(null), 2000);
    };

    const getTypeIcon = (type: string) => {
        if (type?.startsWith('image/')) return '🖼️';
        if (type?.startsWith('video/')) return '🎬';
        return '📄';
    };

    const filteredItems = items.filter(item => {
        if (filterType === 'all') return true;
        if (filterType === 'image') return item.file_type?.startsWith('image/');
        if (filterType === 'video') return item.file_type?.startsWith('video/');
        return !item.file_type?.startsWith('image/') && !item.file_type?.startsWith('video/');
    });

    const formatFileSize = (bytes: number) => {
        if (!bytes) return '—';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">Médiathèque</h1>
                    <p className="text-white/40 mt-1 text-sm">{items.length} fichier{items.length > 1 ? 's' : ''} — Stockage Supabase</p>
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-brand-primary text-[#030305] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-primary/90 transition-colors self-start">
                    ⬆️ Importer des médias
                </button>
            </div>

            {/* Drag & Drop Zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragOver ? 'border-brand-primary bg-brand-primary/10' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'}`}
            >
                <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
                {uploading ? (
                    <div className="space-y-3">
                        <div className="text-2xl">⬆️</div>
                        <p className="text-white/60 text-sm">Envoi en cours... {uploadProgress}%</p>
                        <div className="w-full max-w-xs mx-auto h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-primary transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="text-4xl mb-3">📁</div>
                        <p className="text-white/60 text-sm"><span className="text-brand-primary font-semibold">Cliquez pour sélectionner</span> ou déposez vos fichiers ici</p>
                        <p className="text-white/30 text-xs mt-1">Images, vidéos, PDF — Max 50MB</p>
                    </>
                )}
            </div>

            {/* Filters & View Toggle */}
            <div className="flex flex-col md:flex-row justify-between gap-3">
                <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
                    {(['all', 'image', 'video', 'document'] as const).map(type => (
                        <button key={type} onClick={() => setFilterType(type)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === type ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
                            {type === 'all' ? 'Tous' : type === 'image' ? '🖼️ Images' : type === 'video' ? '🎬 Vidéos' : '📄 Documents'}
                        </button>
                    ))}
                </div>
                <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
                    <button onClick={() => setView('grid')} className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zm0 8A1.5 1.5 0 012.5 9h3A1.5 1.5 0 017 10.5v3A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5v-3zm8-8A1.5 1.5 0 0110.5 1h3A1.5 1.5 0 0115 2.5v3A1.5 1.5 0 0113.5 7h-3A1.5 1.5 0 019 5.5v-3zm0 8A1.5 1.5 0 0110.5 9h3a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 13.5v-3z" /></svg>
                    </button>
                    <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                    </button>
                </div>
            </div>

            {/* Main Content - 2 col with detail panel */}
            <div className="flex gap-6">
                {/* Gallery */}
                <div className="flex-1 min-w-0">
                    {loading ? (
                        <div className="glass-panel rounded-2xl border border-white/[0.06] p-12 text-center text-white/30">Chargement...</div>
                    ) : filteredItems.length === 0 ? (
                        <div className="glass-panel rounded-2xl border border-white/[0.06] p-12 text-center">
                            <div className="text-4xl mb-3">🖼️</div>
                            <p className="text-white/40">Aucun média. Importez votre premier fichier !</p>
                        </div>
                    ) : view === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                            {filteredItems.map(item => (
                                <div key={item.id} onClick={() => setSelected(selected?.id === item.id ? null : item)}
                                    className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selected?.id === item.id ? 'border-brand-primary shadow-[0_0_20px_rgba(45,212,191,0.3)]' : 'border-white/[0.06] hover:border-white/20'}`}>
                                    {item.file_type?.startsWith('image/') ? (
                                        <img src={item.url} alt={item.alt_text || item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-white/[0.05] flex flex-col items-center justify-center gap-2">
                                            <span className="text-4xl">{getTypeIcon(item.file_type)}</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                        <p className="text-white text-[10px] truncate w-full font-mono">{item.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-panel rounded-2xl border border-white/[0.06] overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/[0.06] text-white/30 text-[10px] uppercase tracking-widest">
                                        <th className="px-4 py-3 text-left">Fichier</th>
                                        <th className="px-4 py-3 text-left hidden md:table-cell">Type</th>
                                        <th className="px-4 py-3 text-left hidden lg:table-cell">Taille</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04]">
                                    {filteredItems.map(item => (
                                        <tr key={item.id} className="group hover:bg-white/[0.02] cursor-pointer" onClick={() => setSelected(item)}>
                                            <td className="px-4 py-3 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg object-cover overflow-hidden bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                                                    {item.file_type?.startsWith('image/') ? <img src={item.url} className="w-full h-full object-cover" alt="" /> : <span>{getTypeIcon(item.file_type)}</span>}
                                                </div>
                                                <span className="text-white text-sm truncate max-w-[200px]">{item.name}</span>
                                            </td>
                                            <td className="px-4 py-3 text-white/30 text-xs font-mono hidden md:table-cell">{item.file_type}</td>
                                            <td className="px-4 py-3 text-white/30 text-xs hidden lg:table-cell">{formatFileSize(item.file_size)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={(e) => { e.stopPropagation(); copyUrl(item.url); }}
                                                    className="px-2 py-1 text-[10px] bg-white/5 text-white/50 rounded border border-white/10 hover:text-white mr-1">
                                                    {copied === item.url ? '✓ Copié' : 'Copier URL'}
                                                </button>
                                                <button onClick={(e) => handleDelete(item, e)}
                                                    className="opacity-0 group-hover:opacity-100 px-2 py-1 text-[10px] bg-red-500/10 text-red-400 rounded border border-red-500/20 hover:bg-red-500/20">
                                                    Suppr.
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Detail Panel */}
                {selected && (
                    <div className="w-72 flex-shrink-0 glass-panel rounded-2xl border border-white/[0.06] p-5 space-y-4 self-start">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white">Détails</h3>
                            <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white text-lg">×</button>
                        </div>

                        {selected.file_type?.startsWith('image/') && (
                            <img src={selected.url} alt={selected.alt_text} className="w-full rounded-xl object-cover" />
                        )}

                        <div className="space-y-2 text-sm">
                            <div><span className="text-white/40">Nom :</span> <span className="text-white break-all">{selected.name}</span></div>
                            <div><span className="text-white/40">Type :</span> <span className="text-white/70 font-mono">{selected.file_type}</span></div>
                            <div><span className="text-white/40">Taille :</span> <span className="text-white/70">{formatFileSize(selected.file_size)}</span></div>
                            <div><span className="text-white/40">Ajouté :</span> <span className="text-white/70">{new Date(selected.created_at).toLocaleDateString('fr-FR')}</span></div>
                        </div>

                        <div className="pt-3 border-t border-white/[0.06] space-y-2">
                            <label className="text-xs text-white/40 font-mono uppercase">URL du fichier</label>
                            <div className="flex gap-2">
                                <input type="text" readOnly value={selected.url} className="flex-1 min-w-0 bg-[#0a0b0d] border border-white/10 rounded-lg px-3 py-2 text-white/60 text-xs focus:outline-none" />
                                <button onClick={() => copyUrl(selected.url)} className={`px-3 py-2 rounded-lg text-xs border transition-colors flex-shrink-0 ${copied === selected.url ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'}`}>
                                    {copied === selected.url ? '✓' : '📋'}
                                </button>
                            </div>
                        </div>

                        <button onClick={(e) => handleDelete(selected, e)} className="w-full py-2.5 text-sm rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                            🗑️ Supprimer
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
