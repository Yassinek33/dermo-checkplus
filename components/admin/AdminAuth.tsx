import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DermatoCheckLogo } from '../icons';
import { supabase } from '../../services/supabaseClient';
import { cmsService } from '../../services/cmsService';

interface AdminAuthProps {
    onLogin: () => void;
    user: any; // Supabase user
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ onLogin, user }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [checkingRole, setCheckingRole] = useState(!!user);

    // If user is already logged in, check if they are admin automatically
    useEffect(() => {
        const checkExistingAdmin = async () => {
            if (user) {
                setCheckingRole(true);
                const isAdmin = await cmsService.isAdmin();
                if (isAdmin) {
                    onLogin();
                } else {
                    setError('Accès refusé. Vous n\'avez pas les privilèges administrateur.');
                    setCheckingRole(false);
                }
            } else {
                setCheckingRole(false);
            }
        };
        checkExistingAdmin();
    }, [user, onLogin]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // --- HARDCODED TEMPORARY ACCESS AS REQUESTED BY USER ---
        setTimeout(() => {
            if (email === 'admin' && password === 'Yassinek33*') {
                onLogin();
            } else {
                setError('Identifiants invalides.');
            }
            setIsLoading(false);
        }, 1000);
    };

    if (checkingRole) {
        return (
            <div className="min-h-screen bg-[#030305] flex flex-col justify-center items-center">
                <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
                <p className="text-white/60 mt-4 font-mono text-sm">Vérification des accréditations...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030305] flex flex-col justify-center items-center p-4 relative overflow-hidden">
            {/* Ambient Backgrounds */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm glass-panel p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl relative z-10 text-center"
            >
                <div className="flex justify-center mb-6">
                    <DermatoCheckLogo size={48} className="drop-shadow-[0_0_20px_rgba(45,212,191,0.6)]" />
                </div>

                <h2 className="text-2xl font-display font-bold text-white mb-2">Accès Restreint</h2>
                <p className="text-sm font-mono text-white/40 mb-8 uppercase tracking-widest">Interface Système Core</p>

                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div>
                        <label className="block text-xs text-white/60 mb-2 uppercase tracking-wide font-medium">Email Administratif</label>
                        <input
                            type="text"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary/50 focus:bg-white/10 transition-colors placeholder:text-white/20"
                            placeholder="Identifiant"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-white/60 mb-2 uppercase tracking-wide font-medium">Mot de passe</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary/50 focus:bg-white/10 transition-colors placeholder:text-white/20"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg text-center">
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-brand-primary text-[#030305] font-bold rounded-xl shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:bg-brand-primary/90 transition-colors uppercase tracking-wider text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {isLoading && <div className="w-4 h-4 border-2 border-[#030305]/20 border-t-[#030305] rounded-full animate-spin"></div>}
                        S'authentifier
                    </button>
                </form>
            </motion.div>
        </div>
    );
};
