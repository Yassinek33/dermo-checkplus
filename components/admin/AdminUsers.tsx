import React, { useState, useEffect } from 'react';
import { cmsService, Profile } from '../../services/cmsService';

const ROLES = ['patient', 'dermatologist', 'admin'] as const;
const roleColors: Record<string, string> = {
    admin: 'text-brand-primary border-brand-primary/30 bg-brand-primary/10',
    dermatologist: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    patient: 'text-white/60 border-white/10 bg-white/5',
};

export const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'dermatologist' | 'patient'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        setLoading(true);
        try { setUsers(await cmsService.getProfiles()); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleRoleChange = async (userId: string, role: string) => {
        setUpdatingId(userId);
        try {
            await cmsService.updateProfileRole(userId, role);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: role as any } : u));
        } catch (e) {
            alert('Erreur lors de la mise à jour du rôle.');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredUsers = users.filter(u => {
        if (filterRole !== 'all' && u.role !== filterRole) return false;
        if (searchQuery && !u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const getInitials = (name: string) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">Utilisateurs</h1>
                    <p className="text-white/40 mt-1 text-sm">{users.length} compte{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}</p>
                </div>
                <div className="flex gap-3 items-center text-sm">
                    <div className="flex gap-2 flex-wrap">
                        {(['all', 'admin', 'dermatologist', 'patient'] as const).map(r => (
                            <span key={r} className={`px-2 py-0.5 rounded-full text-xs border ${r === 'all' ? 'text-white/50 border-white/10' : roleColors[r]}`}>
                                {r === 'all' ? 'Tous' : r} ({r === 'all' ? users.length : users.filter(u => u.role === r).length})
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
                    {(['all', 'admin', 'dermatologist', 'patient'] as const).map(r => (
                        <button key={r} onClick={() => setFilterRole(r)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filterRole === r ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
                            {r === 'all' ? 'Tous' : r}
                        </button>
                    ))}
                </div>
                <input type="text" placeholder="Rechercher par nom..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-brand-primary/40 placeholder-white/20" />
            </div>

            {/* Table */}
            <div className="glass-panel rounded-2xl border border-white/[0.06] overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-white/30">Chargement des utilisateurs...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-4xl mb-3">👥</div>
                        <p className="text-white/40">Aucun utilisateur trouvé.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/[0.06] text-white/30 text-[10px] uppercase tracking-widest font-mono">
                                <th className="px-5 py-3">Utilisateur</th>
                                <th className="px-4 py-3 hidden md:table-cell">Rôle actuel</th>
                                <th className="px-4 py-3 hidden lg:table-cell">Inscrit le</th>
                                <th className="px-4 py-3 text-right">Changer le rôle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${roleColors[user.role] || 'text-white/50 bg-white/5'}`}>
                                                {getInitials(user.full_name)}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{user.full_name || 'Utilisateur'}</p>
                                                <p className="text-white/30 text-xs font-mono">{user.id.substring(0, 8)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 hidden md:table-cell">
                                        <span className={`text-[10px] px-2.5 py-1 rounded-full border font-mono uppercase ${roleColors[user.role] || 'text-white/40 border-white/10'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 hidden lg:table-cell text-white/30 text-sm font-mono">
                                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {updatingId === user.id ? (
                                                <span className="text-xs text-white/30">Mise à jour...</span>
                                            ) : (
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    className="bg-[#0a0b0d] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-brand-primary/50 capitalize"
                                                >
                                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Info card */}
            <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                <p className="text-xs text-white/40">
                    💡 <strong className="text-white/60">Rôles disponibles :</strong> <code className="text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded">admin</code> (accès total), <code className="text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">dermatologist</code> (profil expert), <code className="text-white/50 bg-white/5 px-1.5 py-0.5 rounded">patient</code> (utilisateur standard).
                </p>
            </div>
        </div>
    );
};
