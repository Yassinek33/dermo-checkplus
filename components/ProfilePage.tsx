import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabaseClient';

interface ProfilePageProps {
    user: any;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

const ACCENT = '#00d4b4';
const BG = '#060d0f';
const SURFACE = '#0d1a1e';
const SURFACE2 = '#122028';
const BORDER = 'rgba(0,210,180,0.12)';
const MUTED = '#5a8080';
const MUTED2 = '#8ab0b0';
const TEXT = '#e8f4f3';
const WARN = '#ff6b6b';

// ─── Severity helpers ─────────────────────────────────────────────────────────
function getSeverity(text: string): 'low' | 'medium' | 'high' {
    const t = (text || '').toLowerCase();
    if (t.includes('urgent') || t.includes('immédiat') || t.includes('grave') || t.includes('malin')) return 'high';
    if (t.includes('surveill') || t.includes('follow') || t.includes('attention')) return 'medium';
    return 'low';
}

const SEVERITY_LABELS: Record<string, Record<string, string>> = {
    fr: { low: 'Bénin', medium: 'À surveiller', high: 'Urgent' },
    en: { low: 'Benign', medium: 'Monitor', high: 'Urgent' },
    nl: { low: 'Goedaardig', medium: 'Controleer', high: 'Dringend' },
    es: { low: 'Benigno', medium: 'Vigilar', high: 'Urgente' },
};

const severityStyle = {
    low: { background: 'rgba(0,212,180,0.1)', color: ACCENT, border: 'rgba(0,212,180,0.2)' },
    medium: { background: 'rgba(255,180,0,0.1)', color: '#ffb400', border: 'rgba(255,180,0,0.2)' },
    high: { background: 'rgba(255,107,107,0.1)', color: WARN, border: 'rgba(255,107,107,0.2)' },
};

// ─── Emoji / icon picker from analysis text ───────────────────────────────────
function getEmoji(text: string): string {
    const t = (text || '').toLowerCase();
    if (t.includes('cuir chevelu') || t.includes('scalp') || t.includes('haar')) return '💆';
    if (t.includes('visage') || t.includes('face')) return '🧑';
    if (t.includes('cou') || t.includes('neck')) return '🦒';
    if (t.includes('dos') || t.includes('back')) return '🫀';
    if (t.includes('main') || t.includes('hand')) return '🖐️';
    if (t.includes('pied') || t.includes('foot')) return '🦶';
    return '🔬';
}

function cleanText(text: string): string {
    if (!text) return '';
    return text
        .replace(/\[FINAL_REPORT\]/g, '')
        .replace(/1\.\s*\*\*⚠️\s*IMPORTANT WARNING:\*\*.*?(?=\n\n|\n2)/s, '')
        .replace(/1\.\s*\*\*⚠️\s*AVERTISSEMENT MÉDICAL\s*\(.*?\):\*\*.*?(?=\n\n|\n2)/s, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim();
}

// ─── Sub-components ────────────────────────────────────────────────────────────
const SvgDashboard = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
);
const SvgSearch = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
    </svg>
);
const SvgHistory = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);
const SvgDerma = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    </svg>
);
const SvgBook = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);
const SvgSettings = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
    </svg>
);
const SvgLogout = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);
const SvgChevron = ({ deg = 0 }: { deg?: number }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        style={{ transform: `rotate(${deg}deg)`, transition: 'transform 0.2s' }}>
        <path d="M9 18l6-6-6-6" />
    </svg>
);
const SvgChevronDown = ({ open }: { open: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s' }}>
        <path d="M6 9l6 6 6-6" />
    </svg>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar: React.FC<{ onNavigate: (p: string) => void; onLogout: () => void; historyCount: number }> = ({
    onNavigate, onLogout, historyCount
}) => {
    const navItems = [
        { label: 'Dashboard', icon: <SvgDashboard />, page: 'profile', active: true },
        { label: 'Nouvelle Analyse', icon: <SvgSearch />, page: 'questionnaire', badge: 'IA' },
        { label: 'Historique', icon: <SvgHistory />, page: 'profile', badge: String(historyCount) },
    ];
    const resourceItems = [
        { label: 'Trouver un Dermato', icon: <SvgDerma />, page: 'dermatologist' },
        { label: 'Bibliothèque cutanée', icon: <SvgBook />, page: 'blog' },
    ];

    const itemBase: React.CSSProperties = {
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
        borderRadius: 10, color: MUTED2, fontSize: 14, cursor: 'pointer',
        transition: 'all 0.2s', textDecoration: 'none', border: '1px solid transparent',
    };
    const activeStyle: React.CSSProperties = {
        background: 'rgba(0,212,180,0.1)', color: ACCENT, fontWeight: 500,
        border: '1px solid rgba(0,212,180,0.15)',
    };
    const badge = (text: string) => (
        <span style={{
            marginLeft: 'auto', background: ACCENT, color: BG,
            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
        }}>{text}</span>
    );

    return (
        <aside style={{
            position: 'fixed', top: 80, left: 0, bottom: 0, width: 240,
            background: 'rgba(13,26,30,0.6)', borderRight: `1px solid ${BORDER}`,
            padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 4,
            overflowY: 'auto', zIndex: 50,
        }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: MUTED, textTransform: 'uppercase', padding: '16px 12px 8px' }}>Navigation</div>
            {navItems.map(it => (
                <button key={it.label} onClick={() => onNavigate(it.page)}
                    style={{ ...itemBase, ...(it.active ? activeStyle : {}), background: it.active ? 'rgba(0,212,180,0.1)' : undefined }}
                    onMouseEnter={e => { if (!it.active) (e.currentTarget as HTMLElement).style.background = SURFACE2; }}
                    onMouseLeave={e => { if (!it.active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                    {it.icon} {it.label} {it.badge && badge(it.badge)}
                </button>
            ))}
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: MUTED, textTransform: 'uppercase', padding: '16px 12px 8px' }}>Ressources</div>
            {resourceItems.map(it => (
                <button key={it.label} onClick={() => onNavigate(it.page)}
                    style={itemBase}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = SURFACE2; (e.currentTarget as HTMLElement).style.color = TEXT; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = MUTED2; }}
                >
                    {it.icon} {it.label}
                </button>
            ))}
            <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
                <button onClick={onLogout}
                    style={itemBase}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,107,107,0.08)'; (e.currentTarget as HTMLElement).style.color = WARN; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = MUTED2; }}
                >
                    <SvgLogout /> Se déconnecter
                </button>
            </div>
        </aside>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────
const ProfilePage: React.FC<ProfilePageProps> = ({ user, onNavigate, onLogout }) => {
    const { t, language } = useLanguage();
    const lang = ((language as string) || 'fr').slice(0, 2) as 'fr' | 'en' | 'nl' | 'es';
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'medium' | 'low'>('all');

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('analyses')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                if (!error) setHistory(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user]);

    const initials = useMemo(() => {
        const name = user?.user_metadata?.full_name || '';
        if (name) return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
        return (user?.email || 'U').substring(0, 2).toUpperCase();
    }, [user]);

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur';
    const firstName = displayName.split(' ')[0];
    const lastName = displayName.split(' ').slice(1).join(' ');

    // Stats
    const benign = history.filter(h => getSeverity(cleanText(h.prediction?.full_text || h.notes || '')) === 'low').length;
    const toWatch = history.filter(h => getSeverity(cleanText(h.prediction?.full_text || h.notes || '')) !== 'low').length;
    const lastDate = history.length > 0
        ? new Date(history[0].created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : lang === 'nl' ? 'nl-NL' : lang === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'short' })
        : '—';
    const lastDaysAgo = history.length > 0
        ? Math.floor((Date.now() - new Date(history[0].created_at).getTime()) / 86400000)
        : null;

    const filteredHistory = activeTab === 'all' ? history
        : history.filter(h => {
            const sev = getSeverity(cleanText(h.prediction?.full_text || h.notes || ''));
            return activeTab === 'medium' ? sev !== 'low' : sev === 'low';
        });

    const tabLabels: Record<string, Record<string, string>> = {
        fr: { all: `Toutes (${history.length})`, medium: 'À surveiller', low: 'Bénignes' },
        en: { all: `All (${history.length})`, medium: 'Monitor', low: 'Benign' },
        nl: { all: `Alle (${history.length})`, medium: 'Controleer', low: 'Goedaardig' },
        es: { all: `Todas (${history.length})`, medium: 'Vigilar', low: 'Benignas' },
    };
    const labels = tabLabels[lang] || tabLabels.fr;

    const statCards = [
        { icon: '🔬', value: String(history.length), label: lang === 'en' ? 'Analyses done' : lang === 'nl' ? 'Analyses uitgevoerd' : lang === 'es' ? 'Análisis realizados' : 'Analyses réalisées', change: lang === 'en' ? 'This month' : 'Ce mois-ci' },
        { icon: '✅', value: String(benign), label: lang === 'en' ? 'Benign results' : lang === 'nl' ? 'Goedaardige resultaten' : lang === 'es' ? 'Resultados benignos' : 'Résultats bénins', change: lang === 'en' ? 'No urgency detected' : 'Aucune urgence' },
        { icon: '⚠️', value: String(toWatch), label: lang === 'en' ? 'To monitor' : lang === 'nl' ? 'Te controleren' : lang === 'es' ? 'A vigilar' : 'À surveiller', change: lang === 'en' ? 'Follow-up recommended' : 'Suivi recommandé', warn: toWatch > 0 },
        { icon: '📅', value: lastDate, label: lang === 'en' ? 'Last analysis' : lang === 'nl' ? 'Laatste analyse' : lang === 'es' ? 'Último análisis' : 'Dernière analyse', change: lastDaysAgo !== null ? (lastDaysAgo === 0 ? "Aujourd'hui" : `Il y a ${lastDaysAgo}j`) : '—' },
    ];

    const greeting = {
        fr: 'Bonjour, bonne journée',
        en: 'Hello, have a great day',
        nl: 'Hallo, fijne dag verder',
        es: 'Hola, que tengas un buen día',
    }[lang] || 'Bonjour';

    // ── Styles ──────────────────────────────────────────────────────────────
    const cardStyle: React.CSSProperties = {
        background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16,
        padding: 24, position: 'relative', overflow: 'hidden', transition: 'transform 0.2s, border-color 0.2s',
    };

    return (
        <div style={{ background: BG, minHeight: '100vh', color: TEXT, fontFamily: "'DM Sans', sans-serif" }}>
            {/* Background glows */}
            <div style={{ position: 'fixed', top: '-30%', right: '-20%', width: 700, height: 700, background: 'radial-gradient(circle, rgba(0,180,150,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(0,100,120,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

            {/* Sidebar */}
            <Sidebar onNavigate={onNavigate} onLogout={onLogout} historyCount={history.length} />

            {/* Main */}
            <main style={{ marginLeft: 240, padding: '100px 36px 60px', position: 'relative', zIndex: 1 }}>

                {/* Page header */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
                    style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: MUTED2, marginBottom: 4 }}>
                            <span style={{ width: 20, height: 1, background: ACCENT, display: 'inline-block' }} />
                            {greeting}
                        </div>
                        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, letterSpacing: -1, lineHeight: 1.1 }}>
                            {firstName} <span style={{ color: ACCENT }}>{lastName}</span> 👋
                        </h1>
                    </div>
                    <button
                        onClick={() => onNavigate('questionnaire')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px',
                            background: ACCENT, color: BG, border: 'none', borderRadius: 12,
                            fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer',
                            boxShadow: '0 0 30px rgba(0,212,180,0.25)', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(0,212,180,0.35)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(0,212,180,0.25)'; }}
                    >
                        <SvgSearch /> {lang === 'en' ? 'Analyse my skin' : lang === 'nl' ? 'Analyseer mijn huid' : lang === 'es' ? 'Analizar mi piel' : 'Analyser ma peau'}
                    </button>
                </motion.div>

                {/* Stats grid */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 28 }}>
                    {statCards.map((s, i) => (
                        <div key={i} style={cardStyle}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,180,0.25)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}>
                            {/* Top accent line */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${ACCENT}, transparent)`, opacity: 0.6 }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(0,212,180,0.1)', border: '1px solid rgba(0,212,180,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{s.icon}</div>
                                <div>
                                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>{s.value}</div>
                                    <div style={{ fontSize: 13, color: MUTED2, marginTop: 4 }}>{s.label}</div>
                                    <div style={{ marginTop: 6, fontSize: 12, color: s.warn ? WARN : ACCENT, fontWeight: 500 }}>{s.change}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Content grid */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.2 }}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>

                    {/* History panel */}
                    <div style={{ ...cardStyle, borderRadius: 20, padding: 28 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700 }}>
                                {lang === 'en' ? 'Analysis history' : lang === 'nl' ? 'Analysegeschiedenis' : lang === 'es' ? 'Historial de análisis' : 'Historique des analyses'}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: 4, background: SURFACE2, borderRadius: 10, padding: 4, marginBottom: 24 }}>
                            {(['all', 'medium', 'low'] as const).map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                    flex: 1, padding: '8px 16px', borderRadius: 7, fontSize: 13, fontWeight: 500,
                                    fontFamily: "'Syne', sans-serif", cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                                    background: activeTab === tab ? SURFACE : 'transparent',
                                    color: activeTab === tab ? TEXT : MUTED2,
                                    boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                                }}>
                                    {labels[tab]}
                                </button>
                            ))}
                        </div>

                        {/* Items */}
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '48px 0', color: MUTED }}>{t('profile.loading')}</div>
                        ) : filteredHistory.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px 0', color: MUTED }}>
                                <div style={{ fontSize: 40, marginBottom: 16 }}>🔬</div>
                                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, marginBottom: 8 }}>{t('profile.empty_title')}</div>
                                <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>{t('profile.empty_desc')}</p>
                                <button onClick={() => onNavigate('questionnaire')} style={{
                                    padding: '10px 24px', background: ACCENT, color: BG, border: 'none',
                                    borderRadius: 99, fontWeight: 700, cursor: 'pointer', fontFamily: "'Syne', sans-serif",
                                }}>{t('profile.start')}</button>
                            </div>
                        ) : filteredHistory.map(item => {
                            const fullText = cleanText(item.prediction?.full_text || item.notes || '');
                            const sev = getSeverity(fullText);
                            const sevStyle = severityStyle[sev];
                            const sevLabel = (SEVERITY_LABELS[lang] || SEVERITY_LABELS.fr)[sev];
                            const isOpen = expandedId === item.id;
                            const dateStr = new Date(item.created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

                            return (
                                <div key={item.id} onClick={() => setExpandedId(isOpen ? null : item.id)}
                                    style={{
                                        display: 'flex', alignItems: 'flex-start', gap: 16, padding: 18,
                                        borderRadius: 14, background: SURFACE2, marginBottom: 12,
                                        border: isOpen ? `1px solid rgba(0,212,180,0.25)` : '1px solid transparent',
                                        cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                                    }}
                                    onMouseEnter={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
                                    onMouseLeave={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}
                                >
                                    <div style={{ width: 56, height: 56, borderRadius: 10, background: 'linear-gradient(135deg, #0d2a2a, #122030)', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                                        {getEmoji(fullText)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: 11, color: MUTED, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{dateStr}</span>
                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: sevStyle.background, color: sevStyle.color, border: `1px solid ${sevStyle.border}` }}>{sevLabel}</span>
                                        </div>
                                        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {lang === 'en' ? 'Skin analysis' : lang === 'nl' ? 'Huidanalyse' : lang === 'es' ? 'Análisis cutáneo' : 'Analyse cutanée'} #{String(item.id).slice(-4)}
                                        </div>
                                        <AnimatePresence initial={false}>
                                            {isOpen ? (
                                                <motion.div key="full" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                                                    <div style={{ fontSize: 13, color: MUTED2, lineHeight: 1.6, marginTop: 8, whiteSpace: 'pre-wrap' }}
                                                        dangerouslySetInnerHTML={{
                                                            __html: fullText
                                                                .replace(/\*\*(.*?)\*\*/g, `<strong style="color:${TEXT}">$1</strong>`)
                                                                .replace(/^- (.*)/gm, '• $1')
                                                        }}
                                                    />
                                                </motion.div>
                                            ) : (
                                                <div style={{ fontSize: 12, color: MUTED2, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as any}>
                                                    {fullText.substring(0, 160)}...
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <div style={{ color: isOpen ? ACCENT : MUTED, alignSelf: 'center', flexShrink: 0, transition: 'color 0.2s' }}>
                                        <SvgChevronDown open={isOpen} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* Profile card */}
                        <div style={{ ...cardStyle, borderRadius: 20, padding: 28, textAlign: 'center', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(135deg, rgba(0,212,180,0.08), rgba(0,100,120,0.05))' }} />
                            <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, #00a896, ${ACCENT})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, color: BG, margin: '0 auto 16px', position: 'relative', zIndex: 1, border: '3px solid rgba(0,212,180,0.3)', boxShadow: '0 0 30px rgba(0,212,180,0.2)' }}>
                                {initials}
                            </div>
                            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 4, position: 'relative', zIndex: 1 }}>{displayName}</div>
                            <div style={{ fontSize: 12, color: MUTED2, marginBottom: 20, position: 'relative', zIndex: 1, wordBreak: 'break-all' }}>{user?.email}</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                                <div style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12 }}>
                                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: ACCENT }}>{history.length}</div>
                                    <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{lang === 'en' ? 'Analyses' : 'Analyses'}</div>
                                </div>
                                <div style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12 }}>
                                    <div style={{ fontSize: 20 }}>🌍</div>
                                    <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{lang === 'en' ? 'Member' : 'Membre'}</div>
                                </div>
                            </div>
                            <button onClick={onLogout} style={{
                                width: '100%', padding: 11, background: 'transparent', border: `1px solid ${BORDER}`,
                                borderRadius: 10, color: MUTED2, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,107,107,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,107,107,0.3)'; (e.currentTarget as HTMLElement).style.color = WARN; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.color = MUTED2; }}>
                                <SvgLogout /> {t('profile.logout')}
                            </button>
                        </div>

                        {/* Quick actions */}
                        <div style={{ ...cardStyle, borderRadius: 20, padding: 24 }}>
                            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 16 }}>
                                {lang === 'en' ? 'Quick actions' : lang === 'nl' ? 'Snelle acties' : lang === 'es' ? 'Acciones rápidas' : 'Actions rapides'}
                            </div>
                            {[
                                { icon: '🔬', color: 'rgba(0,212,180,0.1)', border: 'rgba(0,212,180,0.2)', title: lang === 'en' ? 'New AI analysis' : lang === 'nl' ? 'Nieuwe AI-analyse' : lang === 'es' ? 'Nuevo análisis IA' : 'Nouvelle analyse IA', sub: lang === 'en' ? 'Photo + questionnaire' : 'Photo + questionnaire', page: 'questionnaire' },
                                { icon: '🩺', color: 'rgba(0,120,200,0.1)', border: 'rgba(0,120,200,0.2)', title: lang === 'en' ? 'Find a dermatologist' : lang === 'nl' ? 'Vind een dermatoloog' : lang === 'es' ? 'Encontrar dermatólogo' : 'Trouver un dermatologue', sub: lang === 'en' ? 'Near you' : 'Près de chez vous', page: 'dermatologist' },
                                { icon: '📚', color: 'rgba(120,80,210,0.1)', border: 'rgba(120,80,210,0.2)', title: lang === 'en' ? 'Skin library' : lang === 'nl' ? 'Huidbibliotheek' : lang === 'es' ? 'Biblioteca cutánea' : 'Bibliothèque cutanée', sub: lang === 'en' ? 'Articles & tips' : 'Articles & conseils', page: 'blog' },
                            ].map(qa => (
                                <button key={qa.page} onClick={() => onNavigate(qa.page)} style={{
                                    display: 'flex', alignItems: 'center', gap: 14, padding: 14, borderRadius: 12,
                                    cursor: 'pointer', transition: 'all 0.2s', marginBottom: 8, width: '100%',
                                    background: 'transparent', border: 'none', textAlign: 'left',
                                }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = SURFACE2; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: qa.color, border: `1px solid ${qa.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{qa.icon}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 500, color: TEXT, fontFamily: "'Syne', sans-serif" }}>{qa.title}</div>
                                        <div style={{ fontSize: 12, color: MUTED }}>{qa.sub}</div>
                                    </div>
                                    <SvgChevron />
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default ProfilePage;
