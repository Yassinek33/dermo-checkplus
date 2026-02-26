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

// ─── Sidebar (desktop only) ────────────────────────────────────────────────────
const SIDEBAR_W = 240;
const NAV_H = 72;

interface SidebarProps { onNavigate: (p: string) => void; onLogout: () => void; count: number; lang: string }
const Sidebar: React.FC<SidebarProps> = ({ onNavigate, onLogout, count, lang }) => {
    const nav = [
        { icon: <IcoGrid />, label: 'Dashboard', page: 'profile', active: true },
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

// ─── Mobile Bottom Nav ─────────────────────────────────────────────────────────
interface MobileNavProps { onNavigate: (p: string) => void; onLogout: () => void; lang: string }
const MobileBottomNav: React.FC<MobileNavProps> = ({ onNavigate, lang }) => {
    const items = [
        { icon: <IcoGrid />, label: 'Dashboard', page: 'profile' },
        { icon: <IcoScan />, label: lang === 'en' ? 'Analyse' : 'Analyse', page: 'questionnaire', highlight: true },
        { icon: <IcoDerm />, label: lang === 'en' ? 'Dermato' : 'Dermato', page: 'find-dermatologist' },
        { icon: <IcoGear />, label: lang === 'en' ? 'Settings' : 'Réglages', page: 'home' },
    ];
    return (
        <nav style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
            background: 'rgba(6,13,15,0.97)', backdropFilter: 'blur(16px)',
            borderTop: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-around',
            padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
        }}>
            {items.map(item => (
                <button key={item.page} onClick={() => onNavigate(item.page)}
                    style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        padding: '6px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                        background: item.highlight ? 'rgba(0,212,180,0.15)' : 'transparent',
                        color: item.highlight ? C.accent : C.muted2,
                        transition: 'all .18s', minWidth: 60,
                    }}>
                    {item.icon}
                    <span style={{ fontSize: 10, fontWeight: 500 }}>{item.label}</span>
                </button>
            ))}
        </nav>
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
    const [pdfLoading, setPdfLoading] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (itemId: string) => {
        setDeletingId(itemId);
        try {
            await supabase.from('analyses').delete().eq('id', itemId);
            setHistory(prev => prev.filter(h => h.id !== itemId));
        } finally {
            setDeletingId(null);
        }
    };

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

    const card: React.CSSProperties = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, position: 'relative', overflow: 'hidden' };

    const statCards = [
        { icon: '🔬', val: String(history.length), label: lang === 'en' ? 'Analyses done' : lang === 'nl' ? 'Analyses' : lang === 'es' ? 'Análisis' : 'Analyses réalisées', sub: '+1 ce mois-ci', warn: false },
        { icon: '✅', val: String(benign), label: lang === 'en' ? 'Benign results' : lang === 'nl' ? 'Goedaardig' : lang === 'es' ? 'Benignos' : 'Résultats bénins', sub: lang === 'en' ? 'No urgency' : "Pas d'urgence", warn: false },
        { icon: '⚠️', val: String(toWatch), label: lang === 'en' ? 'To monitor' : lang === 'nl' ? 'Controleer' : lang === 'es' ? 'A vigilar' : 'À surveiller', sub: lang === 'en' ? 'Follow-up recommended' : 'Suivi recommandé', warn: toWatch > 0 },
        { icon: '📅', val: lastDate, label: lang === 'en' ? 'Last analysis' : 'Dernière analyse', sub: lastDiff != null ? (lastDiff === 0 ? "Aujourd'hui" : `Il y a ${lastDiff}j`) : '—', warn: false },
    ];

    const quickActions = [
        { icon: '🔬', color: 'rgba(0,212,180,0.12)', border: 'rgba(0,212,180,0.22)', title: lang === 'en' ? 'New AI analysis' : lang === 'nl' ? 'Nieuwe AI-analyse' : lang === 'es' ? 'Nuevo análisis IA' : 'Nouvelle analyse IA', sub: 'Photo + questionnaire', page: 'questionnaire' },
        { icon: '🩺', color: 'rgba(0,120,200,0.12)', border: 'rgba(0,120,200,0.22)', title: lang === 'en' ? 'Find a dermatologist' : lang === 'nl' ? 'Dermatoloog zoeken' : lang === 'es' ? 'Buscar dermato.' : 'Trouver un dermatologue', sub: lang === 'en' ? 'Near you' : 'Près de chez vous', page: 'find-dermatologist' },
        { icon: '⚠️', color: 'rgba(255,107,107,0.10)', border: 'rgba(255,107,107,0.20)', title: lang === 'en' ? 'Report a change' : lang === 'nl' ? 'Wijziging melden' : lang === 'es' ? 'Informar un cambio' : 'Signaler un changement', sub: lang === 'en' ? 'On an existing lesion' : 'Sur une lésion existante', page: 'questionnaire' },
    ];

    // ── Shared history list (used in both mobile and desktop)
    const HistoryList = ({ isMobileStyle = false }: { isMobileStyle?: boolean }) => (
        <div style={{ ...card, borderRadius: 18, padding: isMobileStyle ? 16 : 26 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: isMobileStyle ? 14 : 16, fontWeight: 700 }}>
                    {lang === 'en' ? 'Analysis history' : lang === 'nl' ? 'Analysegeschiedenis' : lang === 'es' ? 'Historial' : 'Historique des analyses'}
                </span>
                <span style={{ fontSize: 12, color: C.accent, cursor: 'pointer' }}>
                    {lang === 'en' ? 'See all →' : 'Voir tout →'}
                </span>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 3, background: C.surf2, borderRadius: 9, padding: 3, marginBottom: 16 }}>
                {(['all', 'medium', 'low'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        flex: 1, padding: isMobileStyle ? '6px 4px' : '7px 12px', borderRadius: 6,
                        fontSize: isMobileStyle ? 11 : 12.5, cursor: 'pointer',
                        fontFamily: "'Syne', sans-serif", fontWeight: activeTab === tab ? 600 : 400, border: 'none',
                        background: activeTab === tab ? C.surface : 'transparent',
                        color: activeTab === tab ? C.text : C.muted2, transition: 'all .18s',
                        boxShadow: activeTab === tab ? '0 1px 6px rgba(0,0,0,0.28)' : 'none',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
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
                const titleMatch = full.match(/[Aa]nalyse.{0,40}/);
                const title = titleMatch ? titleMatch[0].substring(0, 45) : (lang === 'en' ? 'Skin analysis' : 'Analyse cutanée');

                return (
                    <div key={item.id} onClick={() => setExpandedId(open ? null : item.id)}
                        style={{
                            display: 'flex', alignItems: 'flex-start', gap: isMobileStyle ? 10 : 14,
                            padding: isMobileStyle ? '12px' : '15px 16px', borderRadius: 13,
                            background: C.surf2, marginBottom: 10, cursor: 'pointer',
                            border: open ? '1px solid rgba(0,212,180,0.28)' : '1px solid transparent',
                            transition: 'all .18s',
                        }}
                        onMouseEnter={e => { if (!open) (e.currentTarget as HTMLElement).style.borderColor = C.border; }}
                        onMouseLeave={e => { if (!open) (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}
                    >
                        {/* Thumb */}
                        <div style={{ width: isMobileStyle ? 40 : 52, height: isMobileStyle ? 40 : 52, borderRadius: 10, border: `1px solid ${C.border}`, background: 'linear-gradient(135deg,#0d2a2a,#122030)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobileStyle ? 16 : 20, flexShrink: 0 }}>
                            {getEmoji(full)}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                                <span style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{dateStr}</span>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 99, background: sc.bg, color: sc.fg, border: `1px solid ${sc.bo}` }}>{sl}</span>
                            </div>

                            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: isMobileStyle ? 12.5 : 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>
                                {title}
                            </div>

                            <AnimatePresence initial={false}>
                                {open ? (
                                    <motion.div key="open" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
                                        <div style={{ fontSize: 12, color: C.muted2, lineHeight: 1.65, whiteSpace: 'pre-wrap', marginTop: 4 }}
                                            dangerouslySetInnerHTML={{ __html: full.replace(/\*\*(.*?)\*\*/g, `<strong style="color:${C.text}">$1</strong>`).replace(/^- /gm, '• ') }}
                                        />
                                        <div onClick={e => e.stopPropagation()}
                                            style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
                                            <button
                                                disabled={pdfLoading === item.id}
                                                onClick={async () => {
                                                    setPdfLoading(item.id);
                                                    try { await generateAnalysisPDF(item, user?.email || '', user?.user_metadata?.full_name || user?.email?.split('@')[0] || '', lang); }
                                                    finally { setPdfLoading(null); }
                                                }}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 7,
                                                    padding: '8px 14px', borderRadius: 9,
                                                    background: pdfLoading === item.id ? C.surf2 : C.accent,
                                                    color: pdfLoading === item.id ? C.muted2 : C.bg,
                                                    border: 'none', cursor: pdfLoading === item.id ? 'not-allowed' : 'pointer',
                                                    fontSize: 12, fontWeight: 600, fontFamily: "'Syne',sans-serif", transition: 'all .18s',
                                                }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                                                </svg>
                                                {pdfLoading === item.id ? '...' : 'PDF'}
                                            </button>
                                            <button
                                                onClick={() => shareByEmail(item, user?.email || '', user?.user_metadata?.full_name || user?.email?.split('@')[0] || '', lang)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 7,
                                                    padding: '8px 14px', borderRadius: 9,
                                                    background: 'transparent', color: C.muted2,
                                                    border: `1px solid ${C.border}`,
                                                    cursor: 'pointer', fontSize: 12, fontWeight: 500,
                                                    fontFamily: "'Syne',sans-serif", transition: 'all .18s',
                                                }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                                                </svg>
                                                Email
                                            </button>
                                            <button
                                                disabled={deletingId === item.id}
                                                onClick={() => handleDelete(item.id)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 7,
                                                    padding: '8px 14px', borderRadius: 9,
                                                    background: deletingId === item.id ? C.surf2 : 'rgba(255,107,107,0.12)',
                                                    color: deletingId === item.id ? C.muted2 : '#ff6b6b',
                                                    border: `1px solid ${deletingId === item.id ? C.border : 'rgba(255,107,107,0.25)'}`,
                                                    cursor: deletingId === item.id ? 'not-allowed' : 'pointer',
                                                    fontSize: 12, fontWeight: 600, fontFamily: "'Syne',sans-serif", transition: 'all .18s',
                                                }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                                                </svg>
                                                {deletingId === item.id ? '...' : (lang === 'en' ? 'Delete' : lang === 'nl' ? 'Verwijderen' : lang === 'es' ? 'Eliminar' : 'Supprimer')}
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div key="closed">
                                        <div style={{ fontSize: 11.5, color: C.muted2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as any}>
                                            {full.substring(0, 120)}...
                                        </div>
                                        <div onClick={e => e.stopPropagation()} style={{ marginTop: 8 }}>
                                            <button
                                                disabled={deletingId === item.id}
                                                onClick={() => handleDelete(item.id)}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 5,
                                                    padding: '5px 10px', borderRadius: 7,
                                                    background: 'rgba(255,107,107,0.09)',
                                                    color: '#ff6b6b',
                                                    border: '1px solid rgba(255,107,107,0.2)',
                                                    cursor: deletingId === item.id ? 'not-allowed' : 'pointer',
                                                    fontSize: 11, fontWeight: 600, fontFamily: "'Syne',sans-serif",
                                                    opacity: deletingId === item.id ? 0.5 : 1,
                                                }}>
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                                                </svg>
                                                {deletingId === item.id ? '...' : (lang === 'en' ? 'Delete' : lang === 'nl' ? 'Verwijderen' : lang === 'es' ? 'Eliminar' : 'Supprimer')}
                                            </button>
                                        </div>
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
    );

    // ── Profile card (shared)
    const ProfileCard = ({ isMobileStyle = false }: { isMobileStyle?: boolean }) => (
        <div style={{ ...card, borderRadius: 18, padding: isMobileStyle ? 16 : 24, textAlign: 'center', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(135deg,rgba(0,212,180,0.09),rgba(0,100,120,0.05))' }} />
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg,#00a896,${C.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: C.bg, margin: '0 auto 12px', position: 'relative', zIndex: 1, border: '3px solid rgba(0,212,180,0.3)', boxShadow: '0 0 20px rgba(0,212,180,0.2)' }}>
                {initials}
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, position: 'relative', zIndex: 1 }}>{displayName}</div>
            <div style={{ fontSize: 11, color: C.muted2, marginBottom: 14, position: 'relative', zIndex: 1, wordBreak: 'break-all' }}>{user?.email}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                <div style={{ background: C.surf2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px' }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: C.accent }}>{history.length}</div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>Analyses</div>
                </div>
                <div style={{ background: C.surf2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px' }}>
                    <div style={{ fontSize: 18 }}>🌍</div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{lang === 'en' ? 'Member' : 'Membre'}</div>
                </div>
            </div>

            <button onClick={onLogout} style={{
                width: '100%', padding: '9px 0', background: 'transparent', border: `1px solid ${C.border}`,
                borderRadius: 9, color: C.muted2, fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all .18s',
            }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,107,107,0.09)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,107,107,0.3)'; (e.currentTarget as HTMLElement).style.color = C.warn; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.muted2; }}>
                <IcoOut /> {lang === 'en' ? 'Sign out' : lang === 'nl' ? 'Uitloggen' : lang === 'es' ? 'Cerrar sesión' : 'Se déconnecter'}
            </button>
        </div>
    );

    // ── Quick actions card (shared)
    const QuickActionsCard = ({ isMobileStyle = false }: { isMobileStyle?: boolean }) => (
        <div style={{ ...card, borderRadius: 18, padding: isMobileStyle ? 14 : 22 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                {lang === 'en' ? 'Quick actions' : lang === 'nl' ? 'Snelle acties' : lang === 'es' ? 'Acciones rápidas' : 'Actions rapides'}
            </div>
            {quickActions.map(qa => (
                <button key={qa.page + qa.title} onClick={() => onNavigate(qa.page)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 11, cursor: 'pointer', width: '100%', background: 'transparent', border: 'none', textAlign: 'left', marginBottom: 4, transition: 'background .18s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.surf2; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: qa.color, border: `1px solid ${qa.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{qa.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: C.text, fontFamily: "'Syne',sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{qa.title}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{qa.sub}</div>
                    </div>
                    <IcoRight />
                </button>
            ))}
        </div>
    );

    // ── LAYOUTS ──────────────────────────────────────────────────────────
    const MOBILE_NAV_H = 88; // height of app navbar on mobile
    return (
        <>
            <style>{`
                @media (max-width: 1023px) {
                    .dermo-desktop-layout { display: none !important; }
                    .dermo-mobile-layout { display: block !important; }
                }
                @media (min-width: 1024px) {
                    .dermo-desktop-layout { display: flex !important; }
                    .dermo-mobile-layout { display: none !important; }
                }
            `}</style>

            {/* MOBILE LAYOUT */}
            <div className="dermo-mobile-layout" style={{ minHeight: '100vh', background: C.bg }}>
                <main style={{ padding: `${MOBILE_NAV_H + 16}px 16px 80px` }}>
                    {/* BG glow */}
                    <div style={{ position: 'fixed', top: '20%', right: '-20%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(0,180,150,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                        style={{ marginBottom: 20, position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.muted2, marginBottom: 2 }}>
                            <span style={{ width: 14, height: 1, background: C.accent, display: 'inline-block' }} />
                            {GREET[lang] || GREET.fr}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: -0.5, margin: 0, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {displayName.split(' ')[0]}&nbsp;
                                <span style={{ color: C.accent }}>{displayName.split(' ').slice(1).join(' ')}</span>
                                &nbsp;👋
                            </h1>
                            <button onClick={() => onNavigate('questionnaire')} style={{
                                display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px',
                                background: C.accent, color: C.bg, border: 'none', borderRadius: 10,
                                fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer',
                                boxShadow: '0 0 20px rgba(0,212,180,0.22)', flexShrink: 0,
                            }}>
                                <IcoScan /> {lang === 'en' ? 'Analyse' : 'Analyser'}
                            </button>
                        </div>
                    </motion.div>

                    {/* Stats 2x2 */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.06 }}
                        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16, position: 'relative', zIndex: 1 }}>
                        {statCards.map((s, i) => (
                            <div key={i} style={{ ...card, padding: 14 }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.accent}, transparent)`, opacity: 0.5 }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,212,180,0.09)', border: '1px solid rgba(0,212,180,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{s.icon}</div>
                                    <div>
                                        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: -1, lineHeight: 1 }}>{s.val}</div>
                                        <div style={{ fontSize: 10.5, color: C.muted2, marginTop: 2 }}>{s.label}</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 10.5, color: s.warn ? C.warn : C.accent, fontWeight: 500, marginTop: 6 }}>{s.sub}</div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Profile card */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
                        style={{ marginBottom: 16, position: 'relative', zIndex: 1 }}>
                        <ProfileCard isMobileStyle />
                    </motion.div>

                    {/* History */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.14 }}
                        style={{ marginBottom: 16, position: 'relative', zIndex: 1 }}>
                        <HistoryList isMobileStyle />
                    </motion.div>

                    {/* Quick actions */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.18 }}
                        style={{ position: 'relative', zIndex: 1 }}>
                        <QuickActionsCard isMobileStyle />
                    </motion.div>
                </main>

                {/* Mobile bottom nav */}
                <MobileBottomNav onNavigate={onNavigate} onLogout={onLogout} lang={lang} />
            </div>

            {/* DESKTOP LAYOUT */}
            <div className="dermo-desktop-layout" style={{ minHeight: `calc(100vh - ${NAV_H}px)` }}>
                <Sidebar onNavigate={onNavigate} onLogout={onLogout} count={history.length} lang={lang} />

                <main style={{ marginLeft: SIDEBAR_W, flex: 1, padding: '36px 32px 60px', position: 'relative' }}>
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
                        <HistoryList />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <ProfileCard />
                            <QuickActionsCard />
                        </div>
                    </motion.div>
                </main>
            </div>
        </>
    );
};

export default ProfilePage;
