
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabaseClient';

interface ProfilePageProps {
    user: any;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onNavigate, onLogout }) => {
    const { t } = useLanguage();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('analyses')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error("Error fetching history:", error);
                    // Table might not exist yet
                } else {
                    setHistory(data || []);
                }
            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get initials or fallback
    const initials = user?.user_metadata?.full_name
        ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        : user?.email?.substring(0, 2).toUpperCase() || 'U';

    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const cleanText = (text: string) => {
        if (!text) return "";
        // Remove [FINAL_REPORT] tag and specific warning if present at start for the preview
        return text.replace(/\[FINAL_REPORT\]/g, '')
            .replace(/1\.\s*\*\*⚠️\s*IMPORTANT WARNING:\*\*.*?(?=\n\n|\n2)/s, '') // Attempt to strip English warning
            .replace(/1\.\s*\*\*⚠️\s*AVERTISSEMENT MÉDICAL\s*\(.*?\):\*\*.*?(?=\n\n|\n2)/s, '') // Attempt to strip French warning
            .replace(/^\s*[\r\n]/gm, '') // Remove leading empty lines
            .trim();
    };

    return (
        <div className="min-h-[70vh] px-4 py-8 md:py-12 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
            >
                {/* Header / Profile Card */}
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-deep/60 backdrop-blur-2xl shadow-2xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar */}
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-brand-primary to-cyan-500 p-1 shadow-lg shadow-brand-primary/20">
                        <div className="w-full h-full rounded-full bg-brand-deep flex items-center justify-center border-4 border-transparent">
                            <span className="text-3xl md:text-4xl font-bold text-white tracking-wider">
                                {initials}
                            </span>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                            {user?.user_metadata?.full_name || "Utilisateur"}
                        </h1>
                        <p className="text-brand-secondary text-lg mb-6 break-all">
                            {user?.email}
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <button
                                onClick={onLogout}
                                className="px-6 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all font-medium text-sm flex items-center gap-2"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                {t('profile.logout')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <h2 className="text-2xl font-display font-bold text-white mt-12 mb-6 px-2">
                    {t('profile.history_title')}
                </h2>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-white/40">{t('profile.loading')}</div>
                    ) : history.length > 0 ? (
                        history.map((item) => {
                            const isExpanded = expandedId === item.id;
                            const fullText = item.prediction?.full_text || item.notes || "";

                            // For preview, we use the cleaned notes or a substring of the full text
                            const previewText = cleanText(item.notes || fullText).substring(0, 150) + "...";

                            return (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={() => toggleExpand(item.id)}
                                    className={`group relative overflow-hidden rounded-2xl border transition-all p-6 cursor-pointer
                                        ${isExpanded
                                            ? 'border-brand-primary/30 bg-white/10 ring-1 ring-brand-primary/20'
                                            : 'border-white/5 bg-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Thumbnail if exists */}
                                        {item.image_url && (
                                            <div className="w-full md:w-32 h-32 rounded-xl bg-black/50 overflow-hidden shrink-0">
                                                <img src={item.image_url} alt="Analyse" className="w-full h-full object-cover" />
                                            </div>
                                        )}

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-brand-primary text-sm font-semibold uppercase tracking-wider bg-brand-primary/10 px-3 py-1 rounded-full">
                                                    {t('profile.analyzed_on')} {formatDate(item.created_at)}
                                                </span>
                                                <motion.div
                                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                                    className="text-white/40"
                                                >
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M6 9l6 6 6-6" />
                                                    </svg>
                                                </motion.div>
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-primary transition-colors">
                                                {t('profile.result')}
                                            </h3>

                                            {/* Preview or Full Content */}
                                            <div className="text-brand-secondary/80 text-sm md:text-base leading-relaxed">
                                                {isExpanded ? (
                                                    <div
                                                        className="whitespace-pre-wrap animate-in fade-in duration-300"
                                                        dangerouslySetInnerHTML={{
                                                            __html: cleanText(fullText)
                                                                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') // Bold
                                                                .replace(/^- (.*)/gm, '• $1') // List items
                                                        }}
                                                    />
                                                ) : (
                                                    <p className="line-clamp-2">{previewText}</p>
                                                )}
                                            </div>

                                            {!isExpanded && (
                                                <div className="mt-2 text-brand-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Cliquez pour voir les détails
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="text-center py-16 rounded-3xl border border-white/5 bg-white/5 border-dashed border-white/10">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
                                    <path d="M12 9v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">{t('profile.empty_title')}</h3>
                            <p className="text-brand-secondary/60 max-w-sm mx-auto mb-6">
                                {t('profile.empty_desc')}
                            </p>
                            <button
                                onClick={() => onNavigate('questionnaire')}
                                className="px-6 py-2.5 rounded-full bg-brand-primary text-brand-deep font-bold hover:bg-white transition-colors"
                            >
                                {t('profile.start')}
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ProfilePage;
