import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    group?: string;
}

interface AdminLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onNavigate: (tabId: string) => void;
    onLogoutAdmin: () => void;
}

const Icon = ({ path, className = "w-5 h-5" }: { path: string, className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

const navGroups = [
    {
        label: 'Principal',
        items: [
            { id: 'dashboard', label: 'Tableau de bord', icon: <Icon path="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /> },
            { id: 'posts', label: 'Articles', icon: <Icon path="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /> },
            { id: 'pages', label: 'Pages', icon: <Icon path="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /> },
            { id: 'media', label: 'Médiathèque', icon: <Icon path="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /> },
        ]
    },
    {
        label: 'Visibilité',
        items: [
            { id: 'seo', label: 'SEO & Méta', icon: <Icon path="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803zM13.5 10.5h-6" /> },
            { id: 'users', label: 'Utilisateurs', icon: <Icon path="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /> },
        ]
    },
    {
        label: 'Personnalisation',
        items: [
            { id: 'appearance', label: 'Apparence', icon: <Icon path="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" /> },
            { id: 'settings', label: 'Paramètres', icon: <Icon path="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> },
        ]
    }
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab, onNavigate, onLogoutAdmin }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const allItems = navGroups.flatMap(g => g.items);
    const currentItem = allItems.find(i => i.id === activeTab);

    return (
        <div className="min-h-screen bg-[#030305] text-slate-100 flex relative">
            {/* Ambient BG */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-brand-primary/5 blur-[150px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-900/10 blur-[150px]" />
            </div>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                animate={{ width: sidebarCollapsed ? 72 : 260 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`fixed top-0 left-0 h-full bg-[#080a0c]/90 border-r border-white/[0.06] backdrop-blur-xl z-40 flex flex-col overflow-hidden
                    ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} transition-transform lg:transition-none`}
            >
                {/* Logo */}
                <div className={`h-16 flex items-center border-b border-white/[0.06] px-4 gap-3 flex-shrink-0`}>
                    <div className="w-8 h-8 rounded-lg bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-brand-primary font-bold text-xs">DC</span>
                    </div>
                    {!sidebarCollapsed && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-w-0">
                            <p className="font-display font-bold text-white text-sm truncate">Dermato-Check</p>
                            <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">CMS Pro</p>
                        </motion.div>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="hidden lg:flex w-6 h-6 rounded-md items-center justify-center text-white/30 hover:text-white hover:bg-white/5 flex-shrink-0 transition-colors"
                    >
                        <Icon path={sidebarCollapsed ? "M8.25 4.5l7.5 7.5-7.5 7.5" : "M15.75 19.5L8.25 12l7.5-7.5"} className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
                    {navGroups.map(group => (
                        <div key={group.label} className="mb-2">
                            {!sidebarCollapsed && (
                                <p className="text-[9px] text-white/25 font-mono uppercase tracking-widest px-3 py-2">{group.label}</p>
                            )}
                            {group.items.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => { onNavigate(item.id); setMobileSidebarOpen(false); }}
                                    title={sidebarCollapsed ? item.label : ''}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group mb-0.5
                                        ${activeTab === item.id
                                            ? 'bg-brand-primary/15 text-brand-primary border border-brand-primary/20'
                                            : 'text-white/50 hover:bg-white/[0.04] hover:text-white border border-transparent'
                                        }`}
                                >
                                    <span className={`flex-shrink-0 transition-colors ${activeTab === item.id ? 'text-brand-primary' : 'text-white/40 group-hover:text-white/70'}`}>
                                        {item.icon}
                                    </span>
                                    {!sidebarCollapsed && (
                                        <span className="text-sm font-medium truncate">{item.label}</span>
                                    )}
                                    {activeTab === item.id && !sidebarCollapsed && (
                                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary flex-shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* Bottom */}
                <div className="p-2 border-t border-white/[0.06] space-y-1 flex-shrink-0">
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10`}>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                        {!sidebarCollapsed && <span className="text-xs text-emerald-400 font-mono">Supabase Connecté</span>}
                    </div>
                    <button
                        onClick={onLogoutAdmin}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all font-medium text-sm"
                    >
                        <Icon path="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" className="w-5 h-5 flex-shrink-0" />
                        {!sidebarCollapsed && <span>Déconnexion</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
                {/* Top Bar */}
                <header className="h-16 bg-[#080a0c]/60 backdrop-blur-xl border-b border-white/[0.06] flex items-center px-4 md:px-8 gap-4 z-20 sticky top-0 flex-shrink-0">
                    <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden text-white/50 hover:text-white">
                        <Icon path="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" className="w-5 h-5" />
                    </button>

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/30">Admin</span>
                        <Icon path="M8.25 4.5l7.5 7.5-7.5 7.5" className="w-3 h-3 text-white/20" />
                        <span className="text-white font-medium">{currentItem?.label || 'Dashboard'}</span>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        <a href="/" target="_blank" rel="noopener noreferrer"
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs transition-all">
                            <Icon path="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" className="w-3.5 h-3.5" />
                            Voir le site
                        </a>
                        <div className="w-8 h-8 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center">
                            <span className="text-brand-primary text-xs font-bold">AD</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};
