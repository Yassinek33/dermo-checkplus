import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabaseClient';

/* ── Security: sanitize user input to prevent XSS ── */
function sanitize(input: string): string {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/* ── Rate limiter: prevent spam (1 comment per article per 60s) ── */
const rateLimitMap = new Map<string, number>();
function canSubmit(articleSlug: string): boolean {
    const lastTime = rateLimitMap.get(articleSlug) || 0;
    return Date.now() - lastTime >= 60_000;
}
function markSubmitted(articleSlug: string): void {
    rateLimitMap.set(articleSlug, Date.now());
}

interface Comment {
    id: string;
    author_name: string;
    content: string;
    created_at: string;
}

const AVATAR_COLORS = ['#2dd4bf', '#06b6d4', '#818cf8', '#f472b6', '#34d399', '#fbbf24'];

const translations = {
    fr: {
        title: 'Commentaires',
        empty: 'Soyez le premier à commenter cet article !',
        login_prompt: 'Connectez-vous pour commenter',
        form_title: 'Laisser un commentaire',
        name_label: 'Votre prénom',
        comment_label: 'Votre commentaire',
        comment_placeholder: 'Partagez votre avis sur cet article…',
        submit: 'Publier mon commentaire',
        submitting: 'Publication…',
        success: 'Merci ! Votre commentaire sera visible après validation.',
        error: 'Une erreur est survenue. Veuillez réessayer.',
        rate_limit: 'Veuillez attendre 60 secondes avant de poster un nouveau commentaire.',
        name_too_short: 'Le prénom doit contenir au moins 2 caractères.',
        comment_too_short: 'Le commentaire doit contenir au moins 10 caractères.',
    },
    en: {
        title: 'Comments',
        empty: 'Be the first to comment on this article!',
        login_prompt: 'Sign in to comment',
        form_title: 'Leave a comment',
        name_label: 'Your first name',
        comment_label: 'Your comment',
        comment_placeholder: 'Share your thoughts on this article…',
        submit: 'Post my comment',
        submitting: 'Posting…',
        success: 'Thank you! Your comment will be visible after moderation.',
        error: 'An error occurred. Please try again.',
        rate_limit: 'Please wait 60 seconds before posting another comment.',
        name_too_short: 'Name must be at least 2 characters.',
        comment_too_short: 'Comment must be at least 10 characters.',
    },
    nl: {
        title: 'Reacties',
        empty: 'Wees de eerste om op dit artikel te reageren!',
        login_prompt: 'Log in om te reageren',
        form_title: 'Laat een reactie achter',
        name_label: 'Uw voornaam',
        comment_label: 'Uw reactie',
        comment_placeholder: 'Deel uw mening over dit artikel…',
        submit: 'Plaats mijn reactie',
        submitting: 'Publiceren…',
        success: 'Bedankt! Uw reactie wordt zichtbaar na goedkeuring.',
        error: 'Er is een fout opgetreden. Probeer het opnieuw.',
        rate_limit: 'Wacht 60 seconden voordat u een nieuwe reactie plaatst.',
        name_too_short: 'De naam moet minstens 2 tekens bevatten.',
        comment_too_short: 'De reactie moet minstens 10 tekens bevatten.',
    },
    es: {
        title: 'Comentarios',
        empty: '¡Sé el primero en comentar este artículo!',
        login_prompt: 'Inicia sesión para comentar',
        form_title: 'Dejar un comentario',
        name_label: 'Tu nombre',
        comment_label: 'Tu comentario',
        comment_placeholder: 'Comparte tu opinión sobre este artículo…',
        submit: 'Publicar mi comentario',
        submitting: 'Publicando…',
        success: '¡Gracias! Tu comentario será visible tras la moderación.',
        error: 'Ocurrió un error. Inténtalo de nuevo.',
        rate_limit: 'Espera 60 segundos antes de publicar otro comentario.',
        name_too_short: 'El nombre debe tener al menos 2 caracteres.',
        comment_too_short: 'El comentario debe tener al menos 10 caracteres.',
    },
};

interface CommentSectionProps {
    articleSlug: string;
    onNavigateToAuth?: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ articleSlug, onNavigateToAuth }) => {
    const { language } = useLanguage();
    const lang = (language === 'fr' || language === 'en' || language === 'nl' || language === 'es') ? language : 'en';
    const tr = translations[lang];

    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setCurrentUser(data.user);
            if (data.user?.user_metadata?.full_name) {
                setName(data.user.user_metadata.full_name.split(' ')[0] || '');
            }
        });
    }, []);

    const fetchComments = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase
            .from('blog_comments')
            .select('id, author_name, content, created_at')
            .eq('article_slug', articleSlug)
            .eq('approved', true)
            .order('created_at', { ascending: true })
            .limit(50);
        setComments(data || []);
        setLoading(false);
    }, [articleSlug]);

    useEffect(() => { fetchComments(); }, [fetchComments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        const trimmedName = name.trim();
        const trimmedContent = content.trim();

        // Client-side validation
        if (trimmedName.length < 2) { setSubmitError(tr.name_too_short); return; }
        if (trimmedContent.length < 10) { setSubmitError(tr.comment_too_short); return; }

        // Rate limiting
        if (!canSubmit(articleSlug)) { setSubmitError(tr.rate_limit); return; }

        setSubmitting(true);

        const { error } = await supabase.from('blog_comments').insert({
            article_slug: articleSlug,
            user_id: currentUser?.id || null,
            author_name: sanitize(trimmedName).slice(0, 50),
            content: sanitize(trimmedContent).slice(0, 1000),
            language,
        });

        if (error) {
            setSubmitError(tr.error);
            setSubmitting(false);
        } else {
            markSubmitted(articleSlug);
            setSubmitSuccess(true);
            setSubmitting(false);
            setContent('');
            setTimeout(() => {
                setShowForm(false);
                setSubmitSuccess(false);
            }, 3000);
        }
    };

    const openForm = () => {
        if (!currentUser) { onNavigateToAuth?.(); return; }
        setShowForm(true);
        setSubmitError(null);
        setSubmitSuccess(false);
    };

    const getLocale = () => {
        switch (lang) {
            case 'fr': return 'fr-FR';
            case 'nl': return 'nl-NL';
            case 'es': return 'es-ES';
            default: return 'en-GB';
        }
    };

    return (
        <section className="mt-16 pt-10 border-t border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {tr.title}
                    {comments.length > 0 && (
                        <span style={{
                            fontSize: '13px', fontWeight: 600,
                            padding: '2px 10px', borderRadius: '999px',
                            background: 'rgba(45,212,191,0.1)',
                            color: '#2dd4bf',
                        }}>
                            {comments.length}
                        </span>
                    )}
                </h3>

                <button
                    onClick={openForm}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '10px 22px',
                        background: 'linear-gradient(135deg, #2dd4bf, #06b6d4)',
                        color: '#030305', fontWeight: 700, fontSize: '13px',
                        borderRadius: '999px', border: 'none', cursor: 'pointer',
                        boxShadow: '0 0 16px rgba(45,212,191,0.2)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 28px rgba(45,212,191,0.35)';
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(45,212,191,0.2)';
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    {!currentUser ? tr.login_prompt : tr.form_title}
                </button>
            </div>

            {/* Comments list */}
            {loading ? (
                <div className="flex justify-center py-10">
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        border: '3px solid rgba(45,212,191,0.15)',
                        borderTopColor: '#2dd4bf',
                        animation: 'spin 0.8s linear infinite',
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-10">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,0.3)" strokeWidth="1.5" style={{ margin: '0 auto 12px' }}>
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '15px' }}>{tr.empty}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment, i) => {
                        const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                        const initial = comment.author_name.charAt(0).toUpperCase();
                        return (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                className="p-5 rounded-2xl bg-white/[0.03] border border-white/5"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                                        background: `linear-gradient(135deg, ${color}25, ${color}10)`,
                                        border: `1px solid ${color}35`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color, fontWeight: 700, fontSize: '14px',
                                    }}>
                                        {initial}
                                    </div>
                                    <div>
                                        <span className="text-white font-medium" style={{ fontSize: '14px' }}>
                                            {comment.author_name}
                                        </span>
                                        <span style={{ color: 'rgba(148,163,184,0.35)', fontSize: '12px', marginLeft: '10px' }}>
                                            {new Date(comment.created_at).toLocaleDateString(getLocale(), {
                                                day: 'numeric', month: 'long', year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-white/70 text-sm leading-relaxed" style={{ marginLeft: '48px' }}>
                                    {comment.content}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* ── COMMENT FORM ── */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className="mt-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                            {submitSuccess ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{ textAlign: 'center', padding: '16px 0' }}
                                >
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '50%',
                                        background: 'rgba(45,212,191,0.1)',
                                        border: '2px solid rgba(45,212,191,0.3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 14px', fontSize: '22px', color: '#2dd4bf',
                                    }}>✓</div>
                                    <p style={{ color: '#2dd4bf', fontWeight: 600, fontSize: '15px' }}>
                                        {tr.success}
                                    </p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <h4 style={{ color: '#ffffff', fontWeight: 700, fontSize: '16px', marginBottom: '20px' }}>
                                        {tr.form_title}
                                    </h4>

                                    {/* Name */}
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{
                                            display: 'block', color: 'rgba(148,163,184,0.7)',
                                            fontSize: '11px', fontWeight: 600,
                                            letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px',
                                        }}>
                                            {tr.name_label} *
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            required
                                            minLength={2}
                                            maxLength={50}
                                            style={{
                                                width: '100%', padding: '10px 14px',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '10px', color: '#ffffff',
                                                fontSize: '14px', outline: 'none',
                                                transition: 'border-color 0.2s', boxSizing: 'border-box',
                                            }}
                                            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(45,212,191,0.4)')}
                                            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                                        />
                                    </div>

                                    {/* Comment */}
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{
                                            display: 'block', color: 'rgba(148,163,184,0.7)',
                                            fontSize: '11px', fontWeight: 600,
                                            letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px',
                                        }}>
                                            {tr.comment_label} *
                                        </label>
                                        <textarea
                                            value={content}
                                            onChange={e => setContent(e.target.value)}
                                            required
                                            minLength={10}
                                            maxLength={1000}
                                            rows={4}
                                            style={{
                                                width: '100%', padding: '10px 14px',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '10px', color: '#ffffff',
                                                fontSize: '14px', outline: 'none', resize: 'vertical',
                                                lineHeight: '1.6', fontFamily: 'inherit',
                                                transition: 'border-color 0.2s', boxSizing: 'border-box',
                                            }}
                                            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(45,212,191,0.4)')}
                                            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                                            placeholder={tr.comment_placeholder}
                                        />
                                        <p style={{ textAlign: 'right', color: 'rgba(148,163,184,0.25)', fontSize: '11px', marginTop: '3px' }}>
                                            {content.length}/1000
                                        </p>
                                    </div>

                                    {submitError && (
                                        <div style={{
                                            padding: '8px 12px', borderRadius: '8px',
                                            background: 'rgba(239,68,68,0.1)',
                                            border: '1px solid rgba(239,68,68,0.2)',
                                            color: '#f87171', fontSize: '13px', marginBottom: '14px',
                                        }}>
                                            {submitError}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                            style={{
                                                padding: '10px 20px',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '999px', color: 'rgba(148,163,184,0.7)',
                                                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                            }}
                                        >
                                            ✕
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting || content.trim().length < 10 || name.trim().length < 2}
                                            style={{
                                                flex: 1, padding: '10px',
                                                background: (submitting || content.trim().length < 10 || name.trim().length < 2)
                                                    ? 'rgba(45,212,191,0.3)'
                                                    : 'linear-gradient(135deg, #2dd4bf, #06b6d4)',
                                                color: '#030305', fontWeight: 700, fontSize: '14px',
                                                borderRadius: '999px', border: 'none',
                                                cursor: (submitting || content.trim().length < 10 || name.trim().length < 2) ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            {submitting ? tr.submitting : tr.submit}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default CommentSection;
