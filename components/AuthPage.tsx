
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabaseClient';

interface AuthPageProps {
    onNavigate: (page: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onNavigate }) => {
    const { t } = useLanguage();
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    // OTP modal state
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState<string | null>(null);
    const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
    const [pendingEmail, setPendingEmail] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isSignUp) {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error("Les mots de passe ne correspondent pas.");
                }

                const { data, error } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.name,
                        },
                    },
                });

                if (error) throw error;

                if (data.user?.identities && data.user.identities.length === 0) {
                    setError(t('auth.email_already_used'));
                    setLoading(false);
                    return;
                }

                if (data.user && !data.session) {
                    // Show OTP modal for email verification
                    setPendingEmail(formData.email);
                    setOtpValues(['', '', '', '', '', '']);
                    setOtpError(null);
                    setOtpSuccess(null);
                    setShowOtpModal(true);
                    // Start cooldown for resend button
                    startResendCooldown();
                } else {
                    onNavigate('home');
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });

                if (error) throw error;
                onNavigate('home');
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            setError(err.message || "Une erreur est survenue lors de l'authentification.");
        } finally {
            setLoading(false);
        }
    };

    const startResendCooldown = () => {
        setResendCooldown(60);
        const interval = setInterval(() => {
            setResendCooldown(prev => {
                if (prev <= 1) { clearInterval(interval); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    // OTP input handlers
    const handleOtpInput = (index: number, value: string) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        const newValues = [...otpValues];
        newValues[index] = digit;
        setOtpValues(newValues);
        setOtpError(null);
        if (digit && index < 5) {
            otpInputsRef.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
            const newValues = [...otpValues];
            newValues[index - 1] = '';
            setOtpValues(newValues);
            otpInputsRef.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newValues = ['', '', '', '', '', ''];
        text.split('').forEach((char, i) => { if (i < 6) newValues[i] = char; });
        setOtpValues(newValues);
        const nextEmpty = newValues.findIndex(v => !v);
        const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
        setTimeout(() => otpInputsRef.current[focusIndex]?.focus(), 0);
    };

    const handleOtpVerify = async () => {
        const token = otpValues.join('');
        if (token.length !== 6) return;
        setOtpLoading(true);
        setOtpError(null);
        try {
            // Try 'email' type first (for OTP-configured Supabase projects)
            // If it fails, Supabase may require 'signup' type instead
            const { error } = await supabase.auth.verifyOtp({
                email: pendingEmail,
                token,
                type: 'email',
            });
            if (error) throw error;
            onNavigate('home');
        } catch (err: any) {
            // If 'email' type failed, try 'signup' type
            try {
                const { error: err2 } = await supabase.auth.verifyOtp({
                    email: pendingEmail,
                    token,
                    type: 'signup',
                });
                if (err2) throw err2;
                onNavigate('home');
            } catch (err3: any) {
                setOtpError(
                    err3.message?.includes('invalid') || err3.message?.includes('expired')
                        ? 'Code incorrect ou expiré. Vérifiez votre email ou renvoyez un nouveau code.'
                        : (err3.message || 'Code invalide. Veuillez réessayer.')
                );
            }
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setOtpError(null);
        setOtpSuccess(null);
        try {
            const { error } = await supabase.auth.resend({
                email: pendingEmail,
                type: 'signup',
            });
            if (error) throw error;
            setOtpSuccess('Un nouveau code a été envoyé à votre adresse email.');
            setOtpValues(['', '', '', '', '', '']);
            startResendCooldown();
            setTimeout(() => otpInputsRef.current[0]?.focus(), 100);
        } catch (err: any) {
            setOtpError(err.message || 'Erreur lors du renvoi du code.');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });
            if (error) throw error;
        } catch (err: any) {
            console.error("Google login error:", err);
            setError(err.message);
        }
    };

    return (
        <>
            <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-md"
                >
                    {/* Glass Card */}
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-deep/60 backdrop-blur-2xl shadow-2xl shadow-black/40">
                        {/* Gradient accent top */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary via-cyan-400 to-brand-primary" />

                        <div className="p-8 md:p-10">
                            {/* Logo / Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary/20 to-cyan-500/20 border border-white/10 flex items-center justify-center">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-primary">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl md:text-3xl font-display font-bold text-white text-center mb-2">
                                {isSignUp ? t('auth.signup_title') : t('auth.login_title')}
                            </h2>
                            <p className="text-brand-secondary/70 text-center text-sm mb-8">
                                {isSignUp ? t('auth.signup_subtitle') : t('auth.login_subtitle')}
                            </p>

                            {/* Error / Success Messages */}
                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                    {error}
                                </div>
                            )}
                            {message && (
                                <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
                                    {message}
                                </div>
                            )}

                            {/* Tab Switcher */}
                            <div className="flex mb-8 bg-white/5 rounded-full p-1 border border-white/10">
                                <button
                                    onClick={() => { setIsSignUp(false); setError(null); setMessage(null); }}
                                    className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${!isSignUp
                                        ? 'bg-brand-primary text-brand-deep shadow-lg'
                                        : 'text-white/50 hover:text-white'
                                        }`}
                                >
                                    {t('auth.tab_login')}
                                </button>
                                <button
                                    onClick={() => { setIsSignUp(true); setError(null); setMessage(null); }}
                                    className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${isSignUp
                                        ? 'bg-brand-primary text-brand-deep shadow-lg'
                                        : 'text-white/50 hover:text-white'
                                        }`}
                                >
                                    {t('auth.tab_signup')}
                                </button>
                            </div>

                            {/* Form */}
                            <AnimatePresence mode="wait">
                                <motion.form
                                    key={isSignUp ? 'signup' : 'login'}
                                    initial={{ opacity: 0, x: isSignUp ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: isSignUp ? -20 : 20 }}
                                    transition={{ duration: 0.3 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    {/* Name (Sign Up only) */}
                                    {isSignUp && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <label className="block text-xs font-medium text-brand-secondary/60 uppercase tracking-wider mb-1.5">
                                                {t('auth.name')}
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder={t('auth.name_placeholder')}
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all text-sm"
                                            />
                                        </motion.div>
                                    )}

                                    {/* Email */}
                                    <div>
                                        <label className="block text-xs font-medium text-brand-secondary/60 uppercase tracking-wider mb-1.5">
                                            {t('auth.email')}
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder={t('auth.email_placeholder')}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all text-sm"
                                            required
                                        />
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="block text-xs font-medium text-brand-secondary/60 uppercase tracking-wider mb-1.5">
                                            {t('auth.password')}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder={t('auth.password_placeholder')}
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all text-sm pr-12"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                            >
                                                {showPassword ? (
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                        <line x1="1" y1="1" x2="23" y2="23" />
                                                    </svg>
                                                ) : (
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password (Sign Up only) */}
                                    {isSignUp && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <label className="block text-xs font-medium text-brand-secondary/60 uppercase tracking-wider mb-1.5">
                                                {t('auth.confirm_password')}
                                            </label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder={t('auth.confirm_password_placeholder')}
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all text-sm"
                                                required
                                            />
                                        </motion.div>
                                    )}

                                    {/* Forgot Password (Login only) */}
                                    {!isSignUp && (
                                        <div className="text-right">
                                            <button type="button" className="text-xs text-brand-primary/70 hover:text-brand-primary transition-colors">
                                                {t('auth.forgot_password')}
                                            </button>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-cyan-400 text-brand-deep font-bold text-sm uppercase tracking-wider shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? '...' : (isSignUp ? t('auth.signup_button') : t('auth.login_button'))}
                                    </button>

                                    {/* Divider */}
                                    <div className="flex items-center gap-3 my-6">
                                        <div className="flex-1 h-px bg-white/10" />
                                        <span className="text-xs text-white/30 uppercase">{t('auth.or')}</span>
                                        <div className="flex-1 h-px bg-white/10" />
                                    </div>

                                    {/* Social Login Buttons */}
                                    <div className="space-y-3">
                                        <button
                                            type="button"
                                            onClick={handleGoogleLogin}
                                            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            {t('auth.google')}
                                        </button>
                                    </div>
                                </motion.form>
                            </AnimatePresence>

                            {/* Switch prompt */}
                            <p className="text-center text-sm text-white/40 mt-8">
                                {isSignUp ? t('auth.have_account') : t('auth.no_account')}{' '}
                                <button
                                    onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}
                                    className="text-brand-primary font-semibold hover:underline"
                                >
                                    {isSignUp ? t('auth.tab_login') : t('auth.tab_signup')}
                                </button>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ═══════════════════════════════════════════
                OTP VERIFICATION MODAL
            ═══════════════════════════════════════════ */}
            <AnimatePresence>
                {showOtpModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem',
                            background: 'rgba(0,0,0,0.75)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                        }}
                        onClick={(e) => { if (e.target === e.currentTarget) setShowOtpModal(false); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.88, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.88, y: 24 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                position: 'relative',
                                width: '100%',
                                maxWidth: '400px',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(10,14,28,0.97)',
                                backdropFilter: 'blur(24px)',
                                boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)',
                            }}
                        >
                            {/* Top gradient bar */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                                background: 'linear-gradient(90deg, #2dd4bf, #06b6d4, #2dd4bf)',
                            }} />

                            {/* Close button */}
                            <button
                                onClick={() => setShowOtpModal(false)}
                                style={{
                                    position: 'absolute', top: '16px', right: '16px',
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '50%', width: '32px', height: '32px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>

                            <div style={{ padding: '40px 36px 36px' }}>
                                {/* Icon */}
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                                    <div style={{
                                        width: '68px', height: '68px', borderRadius: '20px',
                                        background: 'linear-gradient(135deg, rgba(45,212,191,0.15), rgba(6,182,212,0.15))',
                                        border: '1px solid rgba(45,212,191,0.25)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="1.5">
                                            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, textAlign: 'center', marginBottom: '8px' }}>
                                    Vérification par email
                                </h3>

                                {/* Subtitle */}
                                <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: '13px', textAlign: 'center', marginBottom: '4px' }}>
                                    Un code à 6 chiffres a été envoyé à
                                </p>
                                <p style={{ color: '#2dd4bf', fontSize: '14px', fontWeight: 600, textAlign: 'center', marginBottom: '28px' }}>
                                    {pendingEmail}
                                </p>

                                {/* Error */}
                                {otpError && (
                                    <div style={{
                                        marginBottom: '16px', padding: '12px 16px', borderRadius: '12px',
                                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                        color: '#f87171', fontSize: '12px', textAlign: 'center',
                                    }}>
                                        {otpError}
                                    </div>
                                )}

                                {/* Success (resend) */}
                                {otpSuccess && (
                                    <div style={{
                                        marginBottom: '16px', padding: '12px 16px', borderRadius: '12px',
                                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                                        color: '#4ade80', fontSize: '12px', textAlign: 'center',
                                    }}>
                                        {otpSuccess}
                                    </div>
                                )}

                                {/* OTP Input Boxes */}
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
                                    {otpValues.map((val, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => { otpInputsRef.current[i] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={val}
                                            onChange={(e) => handleOtpInput(i, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            onPaste={i === 0 ? handleOtpPaste : undefined}
                                            autoFocus={i === 0 && showOtpModal}
                                            style={{
                                                width: '48px',
                                                height: '58px',
                                                textAlign: 'center',
                                                fontSize: '22px',
                                                fontWeight: 700,
                                                borderRadius: '14px',
                                                background: val ? 'rgba(45,212,191,0.08)' : 'rgba(255,255,255,0.04)',
                                                border: val ? '1.5px solid rgba(45,212,191,0.5)' : '1.5px solid rgba(255,255,255,0.12)',
                                                color: val ? '#2dd4bf' : '#fff',
                                                outline: 'none',
                                                caretColor: 'transparent',
                                                transition: 'all 0.15s',
                                            }}
                                            onFocus={e => {
                                                e.currentTarget.style.border = '1.5px solid rgba(45,212,191,0.7)';
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(45,212,191,0.15)';
                                            }}
                                            onBlur={e => {
                                                e.currentTarget.style.border = val ? '1.5px solid rgba(45,212,191,0.5)' : '1.5px solid rgba(255,255,255,0.12)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        />
                                    ))}
                                </div>

                                {/* Verify Button */}
                                <button
                                    onClick={handleOtpVerify}
                                    disabled={otpLoading || otpValues.join('').length < 6}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        borderRadius: '14px',
                                        background: otpValues.join('').length < 6
                                            ? 'rgba(45,212,191,0.3)'
                                            : 'linear-gradient(135deg, #2dd4bf, #06b6d4)',
                                        border: 'none',
                                        color: '#0a0e1c',
                                        fontWeight: 700,
                                        fontSize: '14px',
                                        letterSpacing: '0.06em',
                                        textTransform: 'uppercase',
                                        cursor: otpLoading || otpValues.join('').length < 6 ? 'not-allowed' : 'pointer',
                                        opacity: otpLoading ? 0.7 : 1,
                                        transition: 'all 0.2s',
                                        boxShadow: otpValues.join('').length >= 6 ? '0 8px 24px rgba(45,212,191,0.3)' : 'none',
                                    }}
                                >
                                    {otpLoading ? (
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <svg style={{ animation: 'spin 1s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.3" />
                                                <path d="M21 12a9 9 0 00-9-9" />
                                            </svg>
                                            Vérification...
                                        </span>
                                    ) : 'Confirmer mon compte'}
                                </button>

                                {/* Resend */}
                                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                    <span style={{ color: 'rgba(148,163,184,0.5)', fontSize: '13px' }}>
                                        Vous n'avez pas reçu le code ?{' '}
                                    </span>
                                    <button
                                        onClick={handleResendOtp}
                                        disabled={resendCooldown > 0}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: resendCooldown > 0 ? 'rgba(45,212,191,0.4)' : '#2dd4bf',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                                            textDecoration: 'underline',
                                        }}
                                    >
                                        {resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : 'Renvoyer'}
                                    </button>
                                </div>

                                {/* Info note */}
                                <p style={{
                                    marginTop: '16px', color: 'rgba(148,163,184,0.4)',
                                    fontSize: '11px', textAlign: 'center', lineHeight: '1.6',
                                }}>
                                    Vérifiez votre dossier spam si vous ne trouvez pas l'email.<br />
                                    Le code expire dans 10 minutes.
                                </p>
                            </div>

                            {/* Spinner keyframe */}
                            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AuthPage;
