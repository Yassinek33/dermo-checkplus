import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabaseClient';
import { generateAnalysisPDF, shareByEmail } from '../services/pdfService';

interface ProfilePageProps {
    user: any;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

// ─── Theme ─────────────────────────────────────────────────────────────────────
const C = {
    bg: '#060d0f',
    surface: '#0d1a1e',
    surf2: '#122028',
    border: 'rgba(0,210,180,0.12)',
    accent: '#00d4b4',
    muted: '#5a8080',
    muted2: '#8ab0b0',
    text: '#e8f4f3',
    warn: '#ff6b6b',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function cleanText(raw: string): string {
    return (raw || '')
        .replace(/\[FINAL_REPORT\]/g, '')
        .replace(/1\.\s*\*\*⚠️\s*IMPORTANT WARNING:\*\*.*?(?=\n\n|\n2)/s, '')
        .replace(/1\.\s*\*\*⚠️\s*AVERTISSEMENT MÉDICAL\s*\(.*?\):\*\*.*?(?=\n\n|\n2)/s, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim();
}

function getSeverity(text: string): 'low' | 'medium' | 'high' {
    const t = text.toLowerCase();
    if (t.includes('urgent') || t.includes('grave') || t.includes('malin')) return 'high';
    if (t.includes('surveill') || t.includes('attention') || t.includes('follow')) return 'medium';
    return 'low';
}

function getEmoji(text: string): string {
    const t = text.toLowerCase();
    if (t.includes('cuir chevelu') || t.includes('scalp')) return '💆';
    if (t.includes('cou') || t.includes('neck')) return '🦠';
    if (t.includes('visage') || t.includes('face')) return '🧑';
    if (t.includes('dos') || t.includes('back')) return '🫀';
    if (t.includes('main') || t.includes('hand')) return '🖐️';
    return '🔍';
}

const SEV_LABELS: Record<string, Record<string, string>> = {
    fr: { low: 'Bénin', medium: 'À surveiller', high: 'Urgent' },
    en: { low: 'Benign', medium: 'Monitor', high: 'Urgent' },
    nl: { low: 'Goedaardig', medium: 'Controleer', high: 'Dringend' },
    es: { low: 'Benigno', medium: 'Vigilar', high: 'Urgente' },
};
const SEV_COLOR = {
    low: { bg: 'rgba(0,212,180,0.12)', fg: '#00d4b4', bo: 'rgba(0,212,180,0.25)' },
    medium: { bg: 'rgba(255,180,0,0.10)', fg: '#ffb400', bo: 'rgba(255,180,0,0.25)' },
    high: { bg: 'rgba(255,107,107,0.12)', fg: '#ff6b6b', bo: 'rgba(255,107,107,0.25)' },
};

// ─── SVGs ──────────────────────────────────────────────────────────────────────
const IcoGrid = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
const IcoScan = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" /></svg>;
const IcoClock = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const IcoDoc = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>;
const IcoDerm = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>;
const IcoGear = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" /></svg>;
const IcoOut = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const IcoRight = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>;
const IcoDown = ({ open }: { open: boolean }) => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .22s' }}><path d="M6 9l6 6 6-6" /></svg>;

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const SIDEBAR_W = 240;
// Navbar height in the app is ~72px (pt-28 = 7rem = 112px, but external Navbar is ~72px)
const NAV_H = 72;

interface SidebarProps { onNavigate: (p: string) => void; onLogout: () => void; count: number; lang: string }
const Sidebar: React.FC<SidebarProps> = ({ onNavigate, onLogout, count, lang }) => {
    const nav = [
        { icon: <IcoGrid />, label: lang === 'en' ? 'Dashboard' : 'Dashboard', page: 'profile', active: true },
        { icon: <IcoScan />, label: lang === 'en' ? 'New Analysis' : lang === 'nl' ? 'Nieuwe Analyse' : lang === 'es' ? 'Nueva Análisis' : 'Nouvelle Analyse', page: 'questionnaire', badge: 'IA' },
        { icon: <IcoClock />, label: lang === 'en' ? 'History' : lang === 'nl' ? 'Geschiedenis' : lang === 'es' ? 'Historial' : 'Historique', page: 'profile', badge: count > 0 ? String(count) : undefined },
    ];
    const res = [
        { icon: <IcoDerm />, label: lang === 'en' ? 'Find a Dermato' : lang === 'nl' ? 'Vind een Dermato' : lang === 'es' ? 'Buscar Dermato' : 'Trouver un Dermato', page: 'find-dermatologist' },
        { icon: <IcoDoc />, label: lang === 'en' ? 'Skin Library' : lang === 'nl' ? 'Huidbibliotheek' : lang === 'es' ? 'Biblioteca' : 'Bibliothèque cutanée', page: 'blog' },
    ];

    const itm = (label: string, icon: React.ReactNode, page: string, active = false, badge?: string) => (
        <button key={label} onClick={() => onNavigate(page)}
            style={{
                display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px', borderRadius: 10,
                color: active ? C.accent : C.muted2, fontSize: 13.5, cursor: 'pointer', width: '100%',
                background: active ? 'rgba(0,212,180,0.1)' : 'transparent',
                border: active ? '1px solid rgba(0,212,180,0.18)' : '1px solid transparent',
                fontWeight: active ? 500 : 400, transition: 'all .18s',
            }}
            onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = C.surf2; (e.currentTarget as HTMLElement).style.color = C.text; } }}
            onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = C.muted2; } }}
        >
            {icon}
            <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
            {badge && (
                <span style={{ background: C.accent, color: C.bg, fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99 }}>{badge}</span>
            )}
        </button>
    );

    const section = (label: string) => (
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: C.muted, textTransform: 'uppercase', padding: '14px 12px 6px' }}>{label}</div>
    );

    return (
        <aside style={{
            position: 'fixed', top: NAV_H, left: 0, bottom: 0, width: SIDEBAR_W,
            background: 'rgba(13,26,30,0.65)', backdropFilter: 'blur(12px)',
            borderRight: `1px solid ${C.border}`,
            padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: 2,
            overflowY: 'auto', zIndex: 40,
        }}>
            {section(lang === 'en' ? 'Navigation' : 'Navigation')}
            {nav.map(n => itm(n.label, n.icon, n.page, n.active, n.badge))}
            {section(lang === 'en' ? 'Resources' : lang === 'nl' ? 'Bronnen' : lang === 'es' ? 'Recursos' : 'Ressources')}
            {res.map(r => itm(r.label, r.icon, r.page))}
            <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                {itm(lang === 'en' ? 'Settings' : lang === 'nl' ? 'Instellingen' : lang === 'es' ? 'Ajustes' : 'Paramètres', <IcoGear />, 'home')}
            </div>
        </aside>
    );
};

// ─── ProfilePage ──────────────────────────────────────────────────────────────
const ProfilePage: React.FC<ProfilePageProps> = ({ user, onNavigate, onLogout }) => {
    const { t, language } = useLanguage();
    const lang = ((language as string) || 'fr').slice(0, 2) as 'fr' | 'en' | 'nl' | 'es';

    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'medium' | 'low'>('all');
    const [pdfLoading, setPdfLoading] = useState<string | null>(null); // item id being generated

    useEffect(() => {
        if (!user) return;
        supabase.from('analyses').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
            .then(({ data }) => { setHistory(data || []); setLoading(false); });
    }, [user]);

    const initials = useMemo(() => {
        const n = user?.user_metadata?.full_name || user?.email || 'U';
        return n.split(' ').map((x: string) => x[0]).join('').substring(0, 2).toUpperCase();
    }, [user]);

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur';

    // Stats
    const benign = history.filter(h => getSeverity(cleanText(h.prediction?.full_text || h.notes || '')) === 'low').length;
    const toWatch = history.filter(h => getSeverity(cleanText(h.prediction?.full_text || h.notes || '')) !== 'low').length;
    const lastDate = history.length > 0 ? new Date(history[0].created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—';
    const lastDiff = history.length > 0 ? Math.floor((Date.now() - new Date(history[0].created_at).getTime()) / 86400000) : null;

    const filtered = activeTab === 'all' ? history
        : history.filter(h => {
            const s = getSeverity(cleanText(h.prediction?.full_text || h.notes || ''));
            return activeTab === 'medium' ? s !== 'low' : s === 'low';
        });

    const TABS = {
        fr: { all: `Toutes (${history.length})`, medium: 'À surveiller', low: 'Bénignes' },
        en: { all: `All (${history.length})`, medium: 'Monitor', low: 'Benign' },
        nl: { all: `Alle (${history.length})`, medium: 'Controleer', low: 'Goedaardig' },
        es: { all: `Todas (${history.length})`, medium: 'Vigilar', low: 'Benignas' },
    };
    const tabs = TABS[lang] || TABS.fr;

    const GREET = { fr: 'Bonjour, bonne journée', en: 'Hello, have a great day', nl: 'Hallo, fijne dag', es: 'Hola, buen día' };

    // ── Card styles
    const card: React.CSSProperties = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22, position: 'relative', overflow: 'hidden' };

    const statCards = [
        { icon: '🔬', val: String(history.length), label: lang === 'en' ? 'Analyses done' : lang === 'nl' ? 'Analyses' : lang === 'es' ? 'Análisis' : 'Analyses réalisées', sub: '+1 ce mois-ci', warn: false },
        { icon: '✅', val: String(benign), label: lang === 'en' ? 'Benign results' : lang === 'nl' ? 'Goedaardig' : lang === 'es' ? 'Benignos' : 'Résultats bénins', sub: lang === 'en' ? 'No urgency' : "Pas d'urgence détectée", warn: false },
        { icon: '⚠️', val: String(toWatch), label: lang === 'en' ? 'To monitor' : lang === 'nl' ? 'Controleer' : lang === 'es' ? 'A vigilar' : 'À surveiller', sub: lang === 'en' ? 'Follow-up recommended' : 'Suivi recommandé', warn: toWatch > 0 },
        { icon: '📅', val: lastDate, label: lang === 'en' ? 'Last analysis' : 'Dernière analyse', sub: lastDiff != null ? (lastDiff === 0 ? "Aujourd'hui" : `Il y a ${lastDiff} jour${lastDiff > 1 ? 's' : ''}`) : '—', warn: false },
    ];

    const quickActions = [
        { icon: '🔬', color: 'rgba(0,212,180,0.12)', border: 'rgba(0,212,180,0.22)', title: lang === 'en' ? 'New AI analysis' : lang === 'nl' ? 'Nieuwe AI-analyse' : lang === 'es' ? 'Nuevo análisis IA' : 'Nouvelle analyse IA', sub: 'Photo + questionnaire', page: 'questionnaire' },
        { icon: '🩺', color: 'rgba(0,120,200,0.12)', border: 'rgba(0,120,200,0.22)', title: lang === 'en' ? 'Find a dermatologist' : lang === 'nl' ? 'Dermatoloog zoeken' : lang === 'es' ? 'Buscar dermato.' : 'Trouver un dermatologue', sub: lang === 'en' ? 'Near you' : 'Près de chez vous', page: 'find-dermatologist' },
        { icon: '⚠️', color: 'rgba(255,107,107,0.10)', border: 'rgba(255,107,107,0.20)', title: lang === 'en' ? 'Report a change' : lang === 'nl' ? 'Wijziging melden' : lang === 'es' ? 'Informar un cambio' : 'Signaler un changement', sub: lang === 'en' ? 'On an existing lesion' : 'Sur une lésion existante', page: 'questionnaire' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: `calc(100vh - ${NAV_H}px)` }}>
            {/* Sidebar */}
            <Sidebar onNavigate={onNavigate} onLogout={onLogout} count={history.length} lang={lang} />

            {/* Main */}
            <main style={{ marginLeft: SIDEBAR_W, flex: 1, padding: '36px 32px 60px', position: 'relative' }}>

                {/* BG glows */}
                <div style={{ position: 'fixed', top: '20%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(0,180,150,0.055) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                    style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, position: 'relative', zIndex: 1 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.muted2, marginBottom: 3 }}>
                            <span style={{ width: 18, height: 1, background: C.accent, display: 'inline-block' }} />
                            {GREET[lang] || GREET.fr}
                        </div>
                        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 30, fontWeight: 800, letterSpacing: -0.8, margin: 0 }}>
                            {displayName.split(' ')[0]}&nbsp;
                            <span style={{ color: C.accent }}>{displayName.split(' ').slice(1).join(' ')}</span>
                            &nbsp;👋
                        </h1>
                    </div>
                    <button onClick={() => onNavigate('questionnaire')} style={{
                        display: 'flex', alignItems: 'center', gap: 9, padding: '12px 22px',
                        background: C.accent, color: C.bg, border: 'none', borderRadius: 11,
                        fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
                        boxShadow: '0 0 28px rgba(0,212,180,0.22)', transition: 'all .2s',
                    }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
                        <IcoScan /> {lang === 'en' ? 'Analyse my skin' : lang === 'nl' ? 'Analyseer huid' : lang === 'es' ? 'Analizar piel' : 'Analyser ma peau'}
                    </button>
                </motion.div>

                {/* Stats grid */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24, position: 'relative', zIndex: 1 }}>
                    {statCards.map((s, i) => (
                        <div key={i} style={{ ...card, transition: 'transform .18s, border-color .18s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,180,0.28)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.borderColor = C.border; }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.accent}, transparent)`, opacity: 0.55 }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 13, background: 'rgba(0,212,180,0.09)', border: '1px solid rgba(0,212,180,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
                                <div>
                                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 33, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1 }}>{s.val}</div>
                                    <div style={{ fontSize: 12.5, color: C.muted2, marginTop: 3 }}>{s.label}</div>
                                    <div style={{ fontSize: 11.5, color: s.warn ? C.warn : C.accent, fontWeight: 500, marginTop: 5 }}>{s.sub}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Content grid */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.16 }}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, position: 'relative', zIndex: 1 }}>

                    {/* History panel */}
                    <div style={{ ...card, borderRadius: 18, padding: 26 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700 }}>
                                {lang === 'en' ? 'Analysis history' : lang === 'nl' ? 'Analysegeschiedenis' : lang === 'es' ? 'Historial' : 'Historique des analyses'}
                            </span>
                            <span style={{ fontSize: 12.5, color: C.accent, cursor: 'pointer' }}>
                                {lang === 'en' ? 'See all →' : 'Voir tout →'}
                            </span>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: 3, background: C.surf2, borderRadius: 9, padding: 3, marginBottom: 20 }}>
                            {(['all', 'medium', 'low'] as const).map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                    flex: 1, padding: '7px 12px', borderRadius: 6, fontSize: 12.5, cursor: 'pointer',
                                    fontFamily: "'Syne', sans-serif", fontWeight: activeTab === tab ? 600 : 400, border: 'none',
                                    background: activeTab === tab ? C.surface : 'transparent',
                                    color: activeTab === tab ? C.text : C.muted2, transition: 'all .18s',
                                    boxShadow: activeTab === tab ? '0 1px 6px rgba(0,0,0,0.28)' : 'none',
                                }}>
                                    {(tabs as any)[tab]}
                                </button>
                            ))}
                        </div>

                        {/* Items */}
                        {loading ? (
                            <p style={{ textAlign: 'center', padding: '40px 0', color: C.muted }}>{t('profile.loading')}</p>
                        ) : filtered.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '44px 0' }}>
                                <div style={{ fontSize: 36, marginBottom: 12 }}>🔬</div>
                                <p style={{ color: C.muted, fontSize: 13, marginBottom: 18 }}>{t('profile.empty_desc')}</p>
                                <button onClick={() => onNavigate('questionnaire')} style={{ padding: '9px 22px', background: C.accent, color: C.bg, border: 'none', borderRadius: 99, fontWeight: 700, cursor: 'pointer' }}>
                                    {t('profile.start')}
                                </button>
                            </div>
                        ) : filtered.map(item => {
                            const full = cleanText(item.prediction?.full_text || item.notes || '');
                            const sev = getSeverity(full);
                            const sc = SEV_COLOR[sev];
                            const sl = (SEV_LABELS[lang] || SEV_LABELS.fr)[sev];
                            const open = expandedId === item.id;
                            const dateStr = new Date(item.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

                            // Build a smart title from text
                            const titleMatch = full.match(/[Aa]nalyse.{0,40}/);
                            const title = titleMatch ? titleMatch[0].substring(0, 45) : (lang === 'en' ? 'Skin analysis' : 'Analyse cutanée');

                            return (
                                <div key={item.id} onClick={() => setExpandedId(open ? null : item.id)}
                                    style={{
                                        display: 'flex', alignItems: 'flex-start', gap: 14,
                                        padding: '15px 16px', borderRadius: 13,
                                        background: C.surf2, marginBottom: 10, cursor: 'pointer',
                                        border: open ? '1px solid rgba(0,212,180,0.28)' : '1px solid transparent',
                                        transition: 'all .18s',
                                    }}
                                    onMouseEnter={e => { if (!open) (e.currentTarget as HTMLElement).style.borderColor = C.border; }}
                                    onMouseLeave={e => { if (!open) (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}
                                >
                                    {/* Thumb */}
                                    <div style={{ width: 52, height: 52, borderRadius: 10, border: `1px solid ${C.border}`, background: 'linear-gradient(135deg,#0d2a2a,#122030)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                                        {getEmoji(full)}
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {/* Meta row */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                                            <span style={{ fontSize: 10.5, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{dateStr}</span>
                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 99, background: sc.bg, color: sc.fg, border: `1px solid ${sc.bo}` }}>{sl}</span>
                                            {full.toLowerCase().includes('cou') && <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 99, background: 'rgba(0,120,180,0.12)', color: '#60c0f0', border: '1px solid rgba(0,120,180,0.22)' }}>🦴 Cou</span>}
                                            {full.toLowerCase().includes('cuir chevelu') && <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 99, background: 'rgba(0,120,180,0.12)', color: '#60c0f0', border: '1px solid rgba(0,120,180,0.22)' }}>💆 Cuir chevelu</span>}
                                        </div>

                                        {/* Title */}
                                        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>
                                            {title}
                                        </div>

                                        {/* Body */}
                                        <AnimatePresence initial={false}>
                                            {open ? (
                                                <motion.div key="open" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
                                                    <div style={{ fontSize: 12.5, color: C.muted2, lineHeight: 1.65, whiteSpace: 'pre-wrap', marginTop: 4 }}
                                                        dangerouslySetInnerHTML={{ __html: full.replace(/\*\*(.*?)\*\*/g, `<strong style="color:${C.text}">$1</strong>`).replace(/^- /gm, '• ') }}
                                                    />
                                                    {/* Action buttons */}
                                                    <div onClick={e => e.stopPropagation()}
                                                        style={{ display: 'flex', gap: 10, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
                                                        <button
                                                            disabled={pdfLoading === item.id}
                                                            onClick={async () => {
                                                                setPdfLoading(item.id);
                                                                try {
                                                                    await generateAnalysisPDF(
                                                                        item,
                                                                        user?.email || '',
                                                                        user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
                                                                        lang
                                                                    );
                                                                } finally { setPdfLoading(null); }
                                                            }}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: 7,
                                                                padding: '9px 16px', borderRadius: 9,
                                                                background: pdfLoading === item.id ? C.surf2 : C.accent,
                                                                color: pdfLoading === item.id ? C.muted2 : C.bg,
                                                                border: 'none', cursor: pdfLoading === item.id ? 'not-allowed' : 'pointer',
                                                                fontSize: 12.5, fontWeight: 600, fontFamily: "'Syne',sans-serif",
                                                                transition: 'all .18s', opacity: pdfLoading === item.id ? 0.7 : 1,
                                                            }}>
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                                                            </svg>
                                                            {pdfLoading === item.id
                                                                ? (lang === 'en' ? 'Generating...' : lang === 'nl' ? 'Genereren...' : lang === 'es' ? 'Generando...' : 'Génération...')
                                                                : (lang === 'en' ? 'Download PDF' : lang === 'nl' ? 'PDF downloaden' : lang === 'es' ? 'Descargar PDF' : 'Télécharger PDF')}
                                                        </button>
                                                        <button
                                                            onClick={() => shareByEmail(
                                                                item,
                                                                user?.email || '',
                                                                user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
                                                                lang
                                                            )}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: 7,
                                                                padding: '9px 16px', borderRadius: 9,
                                                                background: 'transparent', color: C.muted2,
                                                                border: `1px solid ${C.border}`,
                                                                cursor: 'pointer', fontSize: 12.5, fontWeight: 500,
                                                                fontFamily: "'Syne',sans-serif", transition: 'all .18s',
                                                            }}
                                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,180,0.35)'; (e.currentTarget as HTMLElement).style.color = C.text; }}
                                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.muted2; }}>
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                                                            </svg>
                                                            {lang === 'en' ? 'Send by email' : lang === 'nl' ? 'Per e-mail verzenden' : lang === 'es' ? 'Enviar por email' : 'Envoyer par email'}
                                                        </button>
                                                    </div>
                                                </motion.div>

                                            ) : (
                                                <div style={{ fontSize: 12, color: C.muted2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as any}>
                                                    {full.substring(0, 160)}...
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div style={{ color: open ? C.accent : C.muted, alignSelf: 'center', flexShrink: 0, transition: 'color .18s' }}>
                                        <IcoDown open={open} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Profile card */}
                        <div style={{ ...card, borderRadius: 18, padding: 24, textAlign: 'center', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 72, background: 'linear-gradient(135deg,rgba(0,212,180,0.09),rgba(0,100,120,0.05))' }} />
                            {/* Avatar */}
                            <div style={{ width: 66, height: 66, borderRadius: '50%', background: `linear-gradient(135deg,#00a896,${C.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: C.bg, margin: '0 auto 14px', position: 'relative', zIndex: 1, border: '3px solid rgba(0,212,180,0.3)', boxShadow: '0 0 24px rgba(0,212,180,0.2)' }}>
                                {initials}
                            </div>
                            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 700, position: 'relative', zIndex: 1 }}>{displayName}</div>
                            <div style={{ fontSize: 11.5, color: C.muted2, marginBottom: 18, position: 'relative', zIndex: 1, wordBreak: 'break-all' }}>{user?.email}</div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                                <div style={{ background: C.surf2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 8px' }}>
                                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 19, fontWeight: 800, color: C.accent }}>{history.length}</div>
                                    <div style={{ fontSize: 10.5, color: C.muted, marginTop: 1 }}>{lang === 'en' ? 'Analyses' : 'Analyses'}</div>
                                </div>
                                <div style={{ background: C.surf2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 8px' }}>
                                    <div style={{ fontSize: 19 }}>🌍</div>
                                    <div style={{ fontSize: 10.5, color: C.muted, marginTop: 1 }}>{lang === 'en' ? 'Member' : 'Membre'}</div>
                                </div>
                            </div>

                            <button onClick={onLogout} style={{
                                width: '100%', padding: '9px 0', background: 'transparent', border: `1px solid ${C.border}`,
                                borderRadius: 9, color: C.muted2, fontSize: 12.5, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all .18s',
                            }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,107,107,0.09)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,107,107,0.3)'; (e.currentTarget as HTMLElement).style.color = C.warn; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.muted2; }}>
                                <IcoOut /> {lang === 'en' ? 'Sign out' : lang === 'nl' ? 'Uitloggen' : lang === 'es' ? 'Cerrar sesión' : 'Se déconnecter'}
                            </button>
                        </div>

                        {/* Quick Actions */}
                        <div style={{ ...card, borderRadius: 18, padding: 22 }}>
                            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15.5, fontWeight: 700, marginBottom: 14 }}>
                                {lang === 'en' ? 'Quick actions' : lang === 'nl' ? 'Snelle acties' : lang === 'es' ? 'Acciones rápidas' : 'Actions rapides'}
                            </div>
                            {quickActions.map(qa => (
                                <button key={qa.page + qa.title} onClick={() => onNavigate(qa.page)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 10px', borderRadius: 11, cursor: 'pointer', width: '100%', background: 'transparent', border: 'none', textAlign: 'left', marginBottom: 6, transition: 'background .18s' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.surf2; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 10, background: qa.color, border: `1px solid ${qa.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{qa.icon}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13.5, fontWeight: 500, color: C.text, fontFamily: "'Syne',sans-serif" }}>{qa.title}</div>
                                        <div style={{ fontSize: 11.5, color: C.muted }}>{qa.sub}</div>
                                    </div>
                                    <IcoRight />
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
