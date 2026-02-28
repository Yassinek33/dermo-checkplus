import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabaseClient';

interface Review {
    id: string;
    author_name: string;
    rating: number;
    comment: string | null;
    language: string;
    created_at: string;
}

const StarRating: React.FC<{ rating: number; interactive?: boolean; onRate?: (r: number) => void; size?: number }> = ({
    rating, interactive = false, onRate, size = 22
}) => {
    const [hovered, setHovered] = useState(0);
    const display = hovered || rating;

    return (
        <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map(i => (
                <button
                    key={i}
                    type="button"
                    disabled={!interactive}
                    onClick={() => interactive && onRate?.(i)}
                    onMouseEnter={() => interactive && setHovered(i)}
                    onMouseLeave={() => interactive && setHovered(0)}
                    style={{
                        background: 'none', border: 'none', padding: '2px',
                        cursor: interactive ? 'pointer' : 'default',
                        transform: interactive && hovered >= i ? 'scale(1.15)' : 'scale(1)',
                        transition: 'transform 0.15s ease',
                    }}
                    aria-label={`${i} star${i > 1 ? 's' : ''}`}
                >
                    <svg width={size} height={size} viewBox="0 0 24 24" fill={display >= i ? '#f59e0b' : 'none'}
                        stroke={display >= i ? '#f59e0b' : 'rgba(148,163,184,0.3)'} strokeWidth="1.5">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                </button>
            ))}
        </div>
    );
};

const ReviewCard: React.FC<{ review: Review; index: number }> = ({ review, index }) => {
    const colors = ['#2dd4bf', '#06b6d4', '#818cf8', '#f472b6', '#34d399'];
    const color = colors[index % colors.length];
    const initial = review.author_name.charAt(0).toUpperCase();

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: index * 0.1 }}
            style={{
                background: 'rgba(255,255,255,0.028)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                transition: 'border-color 0.25s, background 0.25s',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `${color}40`;
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.028)';
            }}
        >
            {/* Stars */}
            <StarRating rating={review.rating} size={18} />

            {/* Comment */}
            {review.comment && (
                <p style={{
                    color: 'rgba(226,232,240,0.82)', fontSize: '14px',
                    lineHeight: '1.7', fontWeight: 300, flexGrow: 1,
                }}>
                    "{review.comment}"
                </p>
            )}

            {/* Author */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 'auto' }}>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg, ${color}25, ${color}10)`,
                    border: `1px solid ${color}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color, fontWeight: 700, fontSize: '15px',
                }}>
                    {initial}
                </div>
                <div>
                    <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '14px', margin: 0 }}>
                        {review.author_name}
                    </p>
                    <p style={{ color: 'rgba(148,163,184,0.45)', fontSize: '12px', margin: 0 }}>
                        {new Date(review.created_at).toLocaleDateString('fr-BE', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export const ReviewSection: React.FC<{ onNavigateToAuth?: () => void }> = ({ onNavigateToAuth }) => {
    const { t, language } = useLanguage();
    const tr = (t('home.reviews') as any) || {};
    const form = tr.form || {};

    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Handle ?review=X URL param from email link
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const reviewParam = params.get('review');
        if (reviewParam) {
            const val = parseInt(reviewParam, 10);
            if (val >= 1 && val <= 5) {
                setRating(val);
                setShowModal(true);
            }
            // Clean URL
            const url = new URL(window.location.href);
            url.searchParams.delete('review');
            window.history.replaceState({}, '', url.toString());
        }
    }, []);

    // Fetch user
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setCurrentUser(data.user);
            if (data.user?.user_metadata?.full_name) {
                setName(data.user.user_metadata.full_name.split(' ')[0] || '');
            }
        });
    }, []);

    // Fetch reviews
    const fetchReviews = useCallback(async () => {
        setLoadingReviews(true);
        const { data } = await supabase
            .from('reviews')
            .select('*')
            .eq('approved', true)
            .order('created_at', { ascending: false })
            .limit(9);
        setReviews(data || []);
        setLoadingReviews(false);
    }, []);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    const avgRating = reviews.length
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || rating === 0) return;
        setSubmitting(true);
        setSubmitError(null);

        const { error } = await supabase.from('reviews').insert({
            user_id: currentUser?.id || null,
            author_name: name.trim(),
            rating,
            comment: comment.trim() || null,
            language,
        });

        if (error) {
            setSubmitError(form.error || 'Error');
            setSubmitting(false);
        } else {
            setSubmitSuccess(true);
            setSubmitting(false);
            setTimeout(() => {
                setShowModal(false);
                setSubmitSuccess(false);
                setRating(0);
                setComment('');
                fetchReviews();
            }, 2200);
        }
    };

    const openModal = () => {
        if (!currentUser) {
            onNavigateToAuth?.();
            return;
        }
        setShowModal(true);
        setSubmitError(null);
        setSubmitSuccess(false);
    };

    return (
        <section style={{ padding: '80px 0', position: 'relative', overflow: 'hidden' }}>
            {/* Background glows */}
            <div style={{
                position: 'absolute', top: '20%', right: '-10%',
                width: '400px', height: '400px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(45,212,191,0.07) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '10%', left: '-5%',
                width: '350px', height: '350px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(129,140,248,0.06) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    style={{ textAlign: 'center', marginBottom: '56px' }}
                >
                    {/* Badge */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '6px 16px',
                            background: 'rgba(45,212,191,0.08)',
                            border: '1px solid rgba(45,212,191,0.2)',
                            borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                            color: '#2dd4bf',
                        }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#2dd4bf">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            {tr.badge || 'Verified Reviews'}
                        </span>
                    </div>

                    <h2 style={{
                        fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800,
                        color: '#ffffff', marginBottom: '14px',
                        fontFamily: "'Syne', sans-serif", letterSpacing: '-0.5px',
                    }}>
                        {tr.title || 'What our users say'}
                    </h2>
                    <p style={{
                        color: 'rgba(148,163,184,0.65)', fontSize: '16px',
                        maxWidth: '500px', margin: '0 auto 28px', lineHeight: '1.6',
                    }}>
                        {tr.subtitle}
                    </p>

                    {/* Avg rating + CTA row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
                        {reviews.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b' }}>
                                    {avgRating.toFixed(1)}
                                </span>
                                <div>
                                    <StarRating rating={Math.round(avgRating)} size={16} />
                                    <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '12px', margin: '2px 0 0' }}>
                                        {reviews.length} {tr.total_label || 'reviews'}
                                    </p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={openModal}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                padding: '12px 28px',
                                background: 'linear-gradient(135deg, #2dd4bf, #06b6d4)',
                                color: '#030305', fontWeight: 700, fontSize: '14px',
                                borderRadius: '999px', border: 'none', cursor: 'pointer',
                                boxShadow: '0 0 24px rgba(45,212,191,0.25)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(45,212,191,0.4)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(45,212,191,0.25)';
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            {!currentUser ? (tr.signin_prompt || 'Sign in to review') : (tr.cta || 'Leave my review')}
                        </button>
                    </div>
                </motion.div>

                {/* Reviews grid */}
                {loadingReviews ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            border: '3px solid rgba(45,212,191,0.2)',
                            borderTopColor: '#2dd4bf',
                            animation: 'spin 0.8s linear infinite',
                        }} />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : reviews.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ textAlign: 'center', padding: '60px 20px' }}
                    >
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⭐</div>
                        <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '16px' }}>
                            {tr.empty || 'Be the first to share your experience!'}
                        </p>
                    </motion.div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '20px',
                    }}>
                        {reviews.map((review, i) => (
                            <ReviewCard key={review.id} review={review} index={i} />
                        ))}
                    </div>
                )}
            </div>

            {/* ── REVIEW FORM MODAL ── */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 9999,
                            background: 'rgba(3,3,5,0.85)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '16px',
                        }}
                        onClick={() => !submitting && setShowModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.25 }}
                            style={{
                                background: 'linear-gradient(135deg, #0f172a, #0a1628)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '28px',
                                padding: '36px 32px 32px',
                                maxWidth: '480px',
                                width: '100%',
                                boxShadow: '0 30px 70px rgba(0,0,0,0.65)',
                                position: 'relative',
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Top accent bar */}
                            <div style={{
                                position: 'absolute', top: 0, left: '10%', right: '10%', height: '3px',
                                background: 'linear-gradient(90deg, #2dd4bf, #06b6d4, #818cf8)',
                                borderRadius: '0 0 4px 4px',
                            }} />

                            {/* Close */}
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    position: 'absolute', top: '16px', right: '16px',
                                    background: 'rgba(255,255,255,0.05)', border: 'none',
                                    borderRadius: '50%', width: '32px', height: '32px',
                                    cursor: 'pointer', color: 'rgba(148,163,184,0.6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '18px', transition: 'background 0.2s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                            >
                                ×
                            </button>

                            {submitSuccess ? (
                                // Success state
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{ textAlign: 'center', padding: '20px 0' }}
                                >
                                    <div style={{
                                        width: '64px', height: '64px', borderRadius: '50%',
                                        background: 'rgba(45,212,191,0.1)',
                                        border: '2px solid rgba(45,212,191,0.3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 20px', fontSize: '28px',
                                    }}>✓</div>
                                    <h3 style={{ color: '#2dd4bf', fontWeight: 700, fontSize: '20px', marginBottom: '10px' }}>
                                        {form.success || 'Thank you!'}
                                    </h3>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    {/* Title */}
                                    <h3 style={{
                                        color: '#ffffff', fontWeight: 700, fontSize: '20px',
                                        marginBottom: '24px', paddingRight: '32px',
                                    }}>
                                        {form.title || 'Your review'}
                                    </h3>

                                    {/* Name */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{
                                            display: 'block', color: 'rgba(148,163,184,0.7)',
                                            fontSize: '12px', fontWeight: 600,
                                            letterSpacing: '0.06em', textTransform: 'uppercase',
                                            marginBottom: '8px',
                                        }}>
                                            {form.name_label || 'Your first name'} *
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            required
                                            maxLength={40}
                                            style={{
                                                width: '100%', padding: '12px 16px',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px', color: '#ffffff',
                                                fontSize: '14px', outline: 'none',
                                                transition: 'border-color 0.2s',
                                                boxSizing: 'border-box',
                                            }}
                                            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(45,212,191,0.4)')}
                                            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                                            placeholder="Sophie"
                                        />
                                    </div>

                                    {/* Star rating */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{
                                            display: 'block', color: 'rgba(148,163,184,0.7)',
                                            fontSize: '12px', fontWeight: 600,
                                            letterSpacing: '0.06em', textTransform: 'uppercase',
                                            marginBottom: '10px',
                                        }}>
                                            {form.rating_label || 'Overall rating'} *
                                        </label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <StarRating rating={rating} interactive onRate={setRating} size={32} />
                                            {rating > 0 && (
                                                <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '16px' }}>
                                                    {rating}/5
                                                </span>
                                            )}
                                        </div>
                                        {rating === 0 && (
                                            <p style={{ color: 'rgba(148,163,184,0.35)', fontSize: '12px', marginTop: '6px' }}>
                                                Click on a star to rate
                                            </p>
                                        )}
                                    </div>

                                    {/* Comment */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{
                                            display: 'block', color: 'rgba(148,163,184,0.7)',
                                            fontSize: '12px', fontWeight: 600,
                                            letterSpacing: '0.06em', textTransform: 'uppercase',
                                            marginBottom: '8px',
                                        }}>
                                            {form.comment_label || 'Your experience'}
                                        </label>
                                        <textarea
                                            value={comment}
                                            onChange={e => setComment(e.target.value)}
                                            rows={4}
                                            maxLength={500}
                                            style={{
                                                width: '100%', padding: '12px 16px',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px', color: '#ffffff',
                                                fontSize: '14px', outline: 'none', resize: 'vertical',
                                                lineHeight: '1.6', fontFamily: 'inherit',
                                                transition: 'border-color 0.2s',
                                                boxSizing: 'border-box',
                                            }}
                                            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(45,212,191,0.4)')}
                                            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                                            placeholder={form.comment_placeholder || 'Share your experience…'}
                                        />
                                        <p style={{
                                            textAlign: 'right', color: 'rgba(148,163,184,0.25)',
                                            fontSize: '11px', marginTop: '4px',
                                        }}>
                                            {comment.length}/500
                                        </p>
                                    </div>

                                    {/* Error */}
                                    {submitError && (
                                        <div style={{
                                            padding: '10px 14px', borderRadius: '10px',
                                            background: 'rgba(239,68,68,0.1)',
                                            border: '1px solid rgba(239,68,68,0.2)',
                                            color: '#f87171', fontSize: '13px', marginBottom: '16px',
                                        }}>
                                            {submitError}
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={submitting || rating === 0 || !name.trim()}
                                        style={{
                                            width: '100%', padding: '14px',
                                            background: (submitting || rating === 0 || !name.trim())
                                                ? 'rgba(45,212,191,0.3)'
                                                : 'linear-gradient(135deg, #2dd4bf, #06b6d4)',
                                            color: '#030305', fontWeight: 700, fontSize: '15px',
                                            borderRadius: '999px', border: 'none',
                                            cursor: (submitting || rating === 0 || !name.trim()) ? 'not-allowed' : 'pointer',
                                            transition: 'opacity 0.2s',
                                            boxShadow: '0 0 20px rgba(45,212,191,0.2)',
                                        }}
                                    >
                                        {submitting ? (form.submitting || 'Publishing…') : (form.submit || 'Publish my review')}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default ReviewSection;
