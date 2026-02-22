import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cmsService, Post } from '../../services/cmsService';

const StatCard = ({ label, value, color, icon, sub }: { label: string, value: string | number, color: string, icon: string, sub?: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 rounded-2xl border border-white/[0.06] relative overflow-hidden group hover:border-white/10 transition-colors"
    >
        <div className={`absolute -right-4 -top-4 w-28 h-28 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity ${color}`} />
        <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
                <span className="text-2xl">{icon}</span>
                {sub && <span className="text-[10px] bg-white/5 text-white/40 px-2 py-0.5 rounded-full font-mono">{sub}</span>}
            </div>
            <div className="text-4xl font-display font-bold text-white mb-1">{value}</div>
            <div className="text-sm text-white/50">{label}</div>
        </div>
    </motion.div>
);

export const AdminDashboard: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
    const [stats, setStats] = useState({ totalPosts: 0, totalUsers: 0, totalMedia: 0 });
    const [recentPosts, setRecentPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [now] = useState(new Date());

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [data, posts] = await Promise.all([
                    cmsService.getDashboardStats(),
                    cmsService.getPosts()
                ]);
                setStats(data);
                setRecentPosts(posts.slice(0, 5));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const navigate = (tab: string) => onNavigate?.(tab);

    const greetingHour = now.getHours();
    const greeting = greetingHour < 12 ? 'Bonjour' : greetingHour < 18 ? 'Bon après-midi' : 'Bonsoir';

    return (
        <div className="space-y-8 max-w-7xl">
            {/* Header */}
            <div>
                <p className="text-white/40 text-sm font-mono mb-1">{now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <h1 className="text-3xl font-display font-bold text-white">{greeting}, <span className="text-brand-primary">Administrateur</span> 👋</h1>
                <p className="text-white/50 mt-1">Voici un résumé de l'état de votre site Dermato-Check.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard label="Articles publiés" value={loading ? '—' : stats.totalPosts} color="bg-brand-primary" icon="✍️" sub="posts" />
                <StatCard label="Utilisateurs inscrits" value={loading ? '—' : stats.totalUsers} color="bg-blue-500" icon="👥" sub="users" />
                <StatCard label="Médias uploadés" value={loading ? '—' : stats.totalMedia} color="bg-purple-500" icon="🖼️" sub="files" />
                <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 bg-emerald-900/10 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-28 h-28 rounded-full blur-2xl opacity-20 bg-emerald-400" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest">EN LIGNE</span>
                        </div>
                        <div className="text-lg font-bold text-white mb-0.5">Supabase</div>
                        <div className="text-sm text-emerald-400/80">Base de données connectée</div>
                        <div className="text-[10px] text-white/30 mt-2 font-mono">CMS Pro v2.1</div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent Posts */}
                <div className="xl:col-span-2 glass-panel rounded-2xl border border-white/[0.06] overflow-hidden">
                    <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
                        <h3 className="text-white font-bold">Articles récents</h3>
                        <button onClick={() => navigate('posts')} className="text-xs text-brand-primary hover:text-brand-primary/80 font-mono transition-colors">Voir tous →</button>
                    </div>
                    {loading ? (
                        <div className="p-8 text-center text-white/30 text-sm">Chargement...</div>
                    ) : recentPosts.length === 0 ? (
                        <div className="p-8 text-center text-white/30 text-sm">Aucun article encore.</div>
                    ) : (
                        <div className="divide-y divide-white/[0.04]">
                            {recentPosts.map(post => (
                                <div key={post.id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-brand-primary text-sm">✍️</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium truncate">{post.title}</p>
                                        <p className="text-white/40 text-xs mt-0.5">/{post.slug}</p>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded border font-mono flex-shrink-0 ${post.status === 'published'
                                            ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                                            : 'text-amber-400 border-amber-500/20 bg-amber-500/10'
                                        }`}>{post.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="glass-panel rounded-2xl border border-white/[0.06] overflow-hidden">
                    <div className="p-5 border-b border-white/[0.06]">
                        <h3 className="text-white font-bold">Actions rapides</h3>
                    </div>
                    <div className="p-4 space-y-2">
                        {[
                            { icon: '✍️', label: 'Nouvel article', tab: 'posts', accent: true },
                            { icon: '📄', label: 'Gérer les pages', tab: 'pages', accent: false },
                            { icon: '🖼️', label: 'Médiathèque', tab: 'media', accent: false },
                            { icon: '🔍', label: 'Configurer le SEO', tab: 'seo', accent: false },
                            { icon: '🎨', label: 'Personnaliser l\'apparence', tab: 'appearance', accent: false },
                            { icon: '⚙️', label: 'Paramètres du site', tab: 'settings', accent: false },
                        ].map(action => (
                            <button
                                key={action.tab}
                                onClick={() => navigate(action.tab)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all text-sm ${action.accent
                                        ? 'bg-brand-primary/15 text-brand-primary border border-brand-primary/25 hover:bg-brand-primary/25 font-semibold'
                                        : 'bg-white/[0.03] text-white/70 border border-white/[0.05] hover:bg-white/[0.06] hover:text-white'
                                    }`}
                            >
                                <span className="text-base flex-shrink-0">{action.icon}</span>
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* System Status */}
            <div className="glass-panel rounded-2xl border border-white/[0.06] p-6">
                <h3 className="text-white font-bold mb-4">État du Système</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'CMS Version', value: 'v2.1 Pro', status: 'ok' },
                        { label: 'Database', value: 'Supabase', status: 'ok' },
                        { label: 'Stockage', value: 'Storage S3', status: 'ok' },
                        { label: 'Auth', value: 'Supabase Auth', status: 'ok' },
                    ].map(item => (
                        <div key={item.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'ok' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                <span className="text-[10px] text-white/30 font-mono uppercase">{item.label}</span>
                            </div>
                            <p className="text-white text-sm font-medium">{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
