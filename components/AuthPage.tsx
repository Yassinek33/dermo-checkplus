import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface AuthPageProps {
    onNavigate: (page: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onNavigate }) => {
    const { t } = useLanguage();
    const [isSignUp, setIsSignUp] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // For now, just show a message — real auth would go here
        alert(isSignUp ? t('auth.signup_success') : t('auth.login_success'));
    };

    return (
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

                        {/* Tab Switcher */}
                        <div className="flex mb-8 bg-white/5 rounded-full p-1 border border-white/10">
                            <button
                                onClick={() => setIsSignUp(false)}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${!isSignUp
                                        ? 'bg-brand-primary text-brand-deep shadow-lg'
                                        : 'text-white/50 hover:text-white'
                                    }`}
                            >
                                {t('auth.tab_login')}
                            </button>
                            <button
                                onClick={() => setIsSignUp(true)}
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
                                            required
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
                                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-cyan-400 text-brand-deep font-bold text-sm uppercase tracking-wider shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                                >
                                    {isSignUp ? t('auth.signup_button') : t('auth.login_button')}
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
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-brand-primary font-semibold hover:underline"
                            >
                                {isSignUp ? t('auth.tab_login') : t('auth.tab_signup')}
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
