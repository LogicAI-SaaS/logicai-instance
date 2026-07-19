/**
 * SettingsPage â€“ Application settings with a lateral navigation aside.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  Users,
  Bell,
  Shield,
  UserPlus,
  Search,
  X,
  Check,
  ChevronDown,
  Crown,
  Pencil,
  Eye,
  Trash2,
  MoreVertical,
  RefreshCw,
  Clock,
  Mail,
  Globe,
  Cloud,
  Server,
  Monitor,
} from 'lucide-react';
import AppLayout from '../components/layouts/AppLayout';
import { localApiRequest } from '../config/api';
import { LanguageSelector } from '../components/ui/LanguageSelector';

type Tab = 'general' | 'membres' | 'notifications' | 'securite' | 'cloud';
type Role = 'admin' | 'editor' | 'viewer';

const TABS: { id: Tab; tKey: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'general',       tKey: 'settings.tabs.general',       icon: Settings },
  { id: 'membres',       tKey: 'settings.tabs.members',       icon: Users },
  { id: 'notifications', tKey: 'settings.tabs.notifications', icon: Bell },
  { id: 'securite',      tKey: 'settings.tabs.security',      icon: Shield },
  { id: 'cloud',         tKey: 'settings.tabs.cloud',         icon: Cloud  },
];

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Role definitions
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ROLE_META: Record<Role, {
  color: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  perms: { tKey: string; allowed: boolean }[];
}> = {
  admin: {
    color: 'text-orange-300',
    badgeColor: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    icon: Crown,
    perms: [
      { tKey: 'seeEdit',      allowed: true },
      { tKey: 'credentials',  allowed: true },
      { tKey: 'inviteManage', allowed: true },
      { tKey: 'editRoles',    allowed: true },
      { tKey: 'fullSettings', allowed: true },
    ],
  },
  editor: {
    color: 'text-blue-300',
    badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    icon: Pencil,
    perms: [
      { tKey: 'seeEdit',      allowed: true },
      { tKey: 'credentials',  allowed: true },
      { tKey: 'invite',       allowed: true },
      { tKey: 'editRoles',    allowed: false },
      { tKey: 'fullSettings', allowed: false },
    ],
  },
  viewer: {
    color: 'text-gray-300',
    badgeColor: 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
    icon: Eye,
    perms: [
      { tKey: 'seeOnly',      allowed: true },
      { tKey: 'credentials',  allowed: false },
      { tKey: 'invite',       allowed: false },
      { tKey: 'editRoles',    allowed: false },
      { tKey: 'fullSettings', allowed: false },
    ],
  },
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function getInitials(u: { firstName?: string; lastName?: string; email?: string }) {
  if (u.firstName && u.lastName) return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
  if (u.firstName) return u.firstName[0].toUpperCase();
  if (u.email) return u.email[0].toUpperCase();
  return 'U';
}

function getDisplayName(u: { firstName?: string; lastName?: string; email?: string }, fallback = 'User') {
  if (u.firstName && u.lastName) return `${u.firstName} ${u.lastName}`;
  if (u.firstName) return u.firstName;
  return u.email ?? fallback;
}

function Avatar({ u, size = 'md' }: { u: any; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shrink-0 font-bold text-white`}>
      {getInitials(u)}
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const { t } = useTranslation();
  const meta = ROLE_META[role];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium ${meta.badgeColor}`}>
      <Icon className="w-3 h-3" />
      {t(`settings.members.roles.${role}`)}
    </span>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Invite modal
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface InviteModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function InviteModal({ onClose, onSuccess }: InviteModalProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any | null | 'none'>('none');
  const [searchLoading, setSearchLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('viewer');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Click outside role dropdown
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setShowRoleDropdown(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Debounced search
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim() || query.length < 2) { setSearchResult('none'); return; }
    timerRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await localApiRequest(`/api/members/search?q=${encodeURIComponent(query)}`);
        const d = await res.json();
        setSearchResult(d.data ?? null);
        if (d.data?.email) setEmail(d.data.email);
      } catch {}
      setSearchLoading(false);
    }, 400);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  const handleSelectUser = (u: any) => {
    setEmail(u.email);
    setQuery('');
    setSearchResult('none');
  };

  const handleSubmit = async () => {
    if (!email.trim()) { setError(t('settings.members.invite.emailRequired')); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await localApiRequest('/api/members/invite', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), role }),
      });
      const d = await res.json();
      if (!d.success) { setError(d.message); return; }
      onSuccess();
      onClose();
    } catch { setError(t('settings.members.invite.networkError')); }
    setSubmitting(false);
  };

  const RoleMeta = ROLE_META[role];
  const RoleIcon = RoleMeta.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{t('settings.members.invite.title')}</h3>
              <p className="text-xs text-gray-500">{t('settings.members.invite.subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Search field */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('settings.members.invite.searchLabel')}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('settings.members.invite.searchPlaceholder')}
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors"
              />
              {searchLoading && <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 animate-spin" />}
            </div>

            {/* Search result */}
            {searchResult !== 'none' && (
              <div className="rounded-xl border border-white/10 overflow-hidden">
                {searchResult ? (
                  <button
                    onClick={() => handleSelectUser(searchResult)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
                  >
                    <Avatar u={searchResult} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{getDisplayName(searchResult, t('common.user'))}</p>
                      <p className="text-xs text-gray-500 truncate">{searchResult.email}</p>
                    </div>
                    <span className="text-xs text-orange-400">{t('settings.members.invite.selectUser')}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 p-3 text-xs text-gray-500">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span>{t('settings.members.invite.noUser')}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Email field */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('settings.members.invite.emailLabel')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('settings.members.invite.emailPlaceholder')}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors"
            />
          </div>

          {/* Role selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('settings.members.invite.roleLabel')}</label>
            <div ref={roleRef} className="relative">
              <button
                onClick={() => setShowRoleDropdown((v) => !v)}
                className="w-full flex items-center justify-between bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <RoleIcon className={`w-4 h-4 ${RoleMeta.color}`} />
                  <span>{t(`settings.members.roles.${role}`)}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showRoleDropdown && (
                <div className="absolute top-full mt-1 w-full bg-[#111] border border-white/10 rounded-xl shadow-xl z-20 overflow-y-auto max-h-72">
                  {(Object.keys(ROLE_META) as Role[]).map((r) => {
                    const m = ROLE_META[r];
                    const Ic = m.icon;
                    return (
                      <button
                        key={r}
                        onClick={() => { setRole(r); setShowRoleDropdown(false); }}
                        className={`w-full flex items-start gap-3 p-3 hover:bg-white/5 transition-colors text-left ${role === r ? 'bg-white/5' : ''}`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${m.badgeColor}`}>
                          <Ic className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${m.color}`}>{t(`settings.members.roles.${r}`)}</p>
                          <div className="mt-1 space-y-0.5">
                            {m.perms.map((p, i) => (
                              <p key={i} className={`text-[11px] flex items-center gap-1 ${p.allowed ? 'text-gray-400' : 'text-gray-600 line-through'}`}>
                                {p.allowed ? <Check className="w-2.5 h-2.5 text-green-500 shrink-0" /> : <X className="w-2.5 h-2.5 text-red-500/50 shrink-0" />}
                                {t(`settings.members.rolePerms.${p.tKey}`)}
                              </p>
                            ))}
                          </div>
                        </div>
                        {role === r && <Check className="w-4 h-4 text-orange-400 shrink-0 mt-1" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-black/20">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            {t('settings.members.invite.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !email.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            {t('settings.members.invite.send')}
          </button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Membres tab
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function MembresTab() {
  const { t } = useTranslation();
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, iRes] = await Promise.all([
        localApiRequest('/api/members'),
        localApiRequest('/api/members/invitations'),
      ]);
      const [mD, iD] = await Promise.all([mRes.json(), iRes.json()]);
      if (mD.success) setMembers(mD.data);
      if (iD.success) setInvitations(iD.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Close context menu on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleRoleChange = async (memberId: string, role: Role) => {
    setOpenMenu(null);
    await localApiRequest(`/api/members/${memberId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    load();
  };

  const handleRemove = async (memberId: string) => {
    setOpenMenu(null);
    if (!confirm(t('settings.members.actions.confirmRemove'))) return;
    await localApiRequest(`/api/members/${memberId}`, { method: 'DELETE' });
    load();
  };

  const handleCancelInvite = async (id: string) => {
    if (!confirm(t('settings.members.actions.cancelInvite'))) return;
    await localApiRequest(`/api/members/invitations/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <>
      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onSuccess={load}
        />
      )}

      <div className="max-w-2xl p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">{t('settings.members.title')}</h2>
            <p className="text-sm text-gray-500">{t('settings.members.subtitle')}</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            {t('common.invite')}
          </button>
        </div>

        {/* Permission table */}
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <div className="px-4 py-3 bg-white/5 border-b border-white/10">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('settings.members.rolesTitle')}</p>
          </div>
          <div className="divide-y divide-white/5">
            {/* Header row */}
            <div className="grid grid-cols-4 px-4 py-2 text-[11px] text-gray-600 uppercase tracking-wider font-medium">
              <span>{t('settings.members.permissions.header')}</span>
              <span className="text-center">{t('settings.members.permissions.admin')}</span>
              <span className="text-center">{t('settings.members.permissions.editor')}</span>
              <span className="text-center">{t('settings.members.permissions.viewer')}</span>
            </div>
            {[
              t('settings.members.permissions.editWorkflows'),
              t('settings.members.permissions.credentials'),
              t('settings.members.permissions.inviteMembers'),
              t('settings.members.permissions.manageRoles'),
              t('settings.members.permissions.instanceSettings'),
            ].map((perm, i) => {
              const allowed: [boolean, boolean, boolean][] = [
                [true, true, false],
                [true, true, false],
                [true, true, false],
                [true, false, false],
                [true, false, false],
              ];
              return (
                <div key={i} className="grid grid-cols-4 px-4 py-2.5 items-center hover:bg-white/3 transition-colors">
                  <span className="text-xs text-gray-400">{perm}</span>
                  {allowed[i].map((a, j) => (
                    <span key={j} className="flex justify-center">
                      {a
                        ? <Check className="w-4 h-4 text-green-400" />
                        : <X className="w-4 h-4 text-gray-700" />}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Members list */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('settings.members.activeMembersCount', { count: members.length })}</p>
          {loading ? (
            <div className="py-8 text-center text-gray-600 text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> {t('settings.members.loading')}
            </div>
          ) : members.length === 0 ? (
            <div className="py-8 text-center text-gray-600 text-sm">{t('settings.members.noMembers')}</div>
          ) : (
            <div className="rounded-xl border border-white/10 overflow-hidden divide-y divide-white/5" ref={menuRef}>
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors">
                  <Avatar u={m} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{getDisplayName(m, t('common.user'))}</p>
                    <p className="text-xs text-gray-500 truncate">{m.email}</p>
                  </div>
                  <RoleBadge role={m.role as Role} />
                  {/* Context menu */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/10 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenu === m.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-[#111] border border-white/10 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                        <p className="px-3 py-1.5 text-[10px] text-gray-600 uppercase tracking-wider font-medium">{t('settings.members.actions.changeRole')}</p>
                        {(Object.keys(ROLE_META) as Role[]).map((r) => {
                          const m2 = ROLE_META[r];
                          const Ic = m2.icon;
                          return (
                            <button
                              key={r}
                              onClick={() => handleRoleChange(m.id, r)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left hover:bg-white/5 ${m.role === r ? m2.color : 'text-gray-400'}`}
                            >
                              <Ic className="w-4 h-4 shrink-0" />
                              {t(`settings.members.roles.${r}`)}
                              {m.role === r && <Check className="w-3.5 h-3.5 ml-auto" />}
                            </button>
                          );
                        })}
                        <div className="border-t border-white/10 mt-1 pt-1">
                          <button
                            onClick={() => handleRemove(m.id)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                          >
                            <Trash2 className="w-4 h-4 shrink-0" />
                            {t('settings.members.actions.removeFromProject')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending invitations */}
        {invitations.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t('settings.members.pendingInvitationsCount', { count: invitations.length })}
            </p>
            <div className="rounded-xl border border-white/10 overflow-hidden divide-y divide-white/5">
              {invitations.map((inv) => (
                <div key={inv.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-full bg-gray-800 border border-dashed border-white/20 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-300 truncate">{inv.email}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-gray-600" />
                      <p className="text-xs text-gray-600">
                        {t('settings.members.invitation.expiresOn', { date: new Date(inv.expiresAt).toLocaleDateString() })}
                      </p>
                    </div>
                  </div>
                  <RoleBadge role={inv.role as Role} />
                  <button
                    onClick={() => handleCancelInvite(inv.id)}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title={t('settings.members.invite.cancel')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// General tab
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function GeneralTab() {
  const { t, i18n } = useTranslation();
  return (
    <div className="max-w-2xl p-8 space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">{t('settings.general.title')}</h2>
        <p className="text-sm text-gray-500">{t('settings.general.subtitle')}</p>
      </div>
      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-white/5 divide-y divide-white/5">
          <div className="p-5">
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('settings.general.instanceName')}</label>
            <input
              type="text"
              defaultValue="LogicAI"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors"
            />
            <p className="text-xs text-gray-600 mt-2">{t('settings.general.instanceNameHint')}</p>
          </div>
          <div className="p-5">
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-500" />
              {t('language.label')}
            </label>
            <LanguageSelector variant="full" />
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">{t('settings.general.darkMode')}</p>
              <p className="text-xs text-gray-600 mt-0.5">{t('settings.general.darkModeHint')}</p>
            </div>
            <button className="relative w-11 h-6 rounded-full bg-orange-500 transition-colors">
              <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow" />
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
            {t('settings.general.save')}
          </button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Notifications tab
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const NOTIF_ITEMS: { tLabel: string; tDesc: string; defaultOn: boolean }[] = [
  { tLabel: 'executionFail',    tDesc: 'executionFailDesc',    defaultOn: true  },
  { tLabel: 'executionSuccess', tDesc: 'executionSuccessDesc', defaultOn: false },
  { tLabel: 'systemUpdates',    tDesc: 'systemUpdatesDesc',    defaultOn: true  },
  { tLabel: 'securityAlerts',   tDesc: 'securityAlertsDesc',   defaultOn: true  },
];

function NotificationsTab() {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState<boolean[]>(NOTIF_ITEMS.map((i) => i.defaultOn));
  const toggle = (i: number) => setEnabled((prev) => { const n = [...prev]; n[i] = !n[i]; return n; });

  return (
    <div className="max-w-2xl p-8 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">{t('settings.notifications.title')}</h2>
        <p className="text-sm text-gray-500">{t('settings.notifications.subtitle')}</p>
      </div>
      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-white/5 divide-y divide-white/5">
          {NOTIF_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-gray-300">{t(`settings.notifications.${item.tLabel}`)}</p>
                <p className="text-xs text-gray-600 mt-0.5">{t(`settings.notifications.${item.tDesc}`)}</p>
              </div>
              <button
                onClick={() => toggle(i)}
                className={`relative w-11 h-6 rounded-full transition-colors ${enabled[i] ? 'bg-orange-500' : 'bg-white/10'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${enabled[i] ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
            {t('settings.notifications.save')}
          </button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SÃ©curitÃ© tab
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SecuriteTab() {
  const { t } = useTranslation();
  return (
    <div className="max-w-2xl p-8 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">{t('settings.security.title')}</h2>
        <p className="text-sm text-gray-500">{t('settings.security.subtitle')}</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 divide-y divide-white/5">
        <div className="p-5">
          <p className="text-sm font-medium text-gray-300 mb-4">{t('settings.security.changePassword')}</p>
          <div className="space-y-3">
            <input type="password" placeholder={t('settings.security.currentPassword')} autoComplete="current-password"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors" />
            <input type="password" placeholder={t('settings.security.newPassword')} autoComplete="new-password"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors" />
            <input type="password" placeholder={t('settings.security.confirmPassword')} autoComplete="new-password"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors" />
          </div>
          <div className="flex justify-end mt-4">
            <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
              {t('settings.security.updatePassword')}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-gray-300">{t('settings.security.activeSessions')}</p>
            <p className="text-xs text-gray-600 mt-0.5">{t('settings.security.activeSessionsDesc')}</p>
          </div>
          <button className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-white/30 transition-colors">
            {t('settings.security.view')}
          </button>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-red-400">{t('settings.security.deleteAccount')}</p>
            <p className="text-xs text-gray-600 mt-0.5">{t('settings.security.deleteAccountDesc')}</p>
          </div>
          <button className="text-xs px-3 py-1.5 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
            {t('settings.security.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Main page
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ──────────────────────────────────────────────────
// Cloud tab
// ──────────────────────────────────────────────────
function CloudTab() {
  const { t } = useTranslation();
  const [cloudEnabled, setCloudEnabled] = useState(false);
  const [instanceMode, setInstanceMode] = useState<'local' | 'online'>('local');
  const [realtimeSync, setRealtimeSync] = useState(true);
  const [endpoint, setEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1200);
  };

  return (
    <div className="max-w-2xl p-8 space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">{t('settings.cloud.title')}</h2>
        <p className="text-sm text-gray-500">{t('settings.cloud.subtitle')}</p>
      </div>

      {/* Enable cloud toggle */}
      <div className="rounded-xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">{t('settings.cloud.enable')}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t('settings.cloud.enableDesc')}</p>
            </div>
          </div>
          <button
            onClick={() => setCloudEnabled(v => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors ${cloudEnabled ? 'bg-blue-500' : 'bg-white/10'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${cloudEnabled ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {cloudEnabled && (
        <>
          {/* Instance mode */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('settings.cloud.instanceMode')}</p>
            <div className="grid grid-cols-2 gap-3">
              {(['local', 'online'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setInstanceMode(mode)}
                  className={`flex flex-col gap-3 p-4 rounded-xl border transition-all text-left ${
                    instanceMode === mode
                      ? 'border-blue-500/50 bg-blue-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    {mode === 'local'
                      ? <Server className="w-5 h-5 text-gray-400" />
                      : <Globe className="w-5 h-5 text-blue-400" />}
                    {instanceMode === mode && <Check className="w-4 h-4 text-blue-400" />}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${instanceMode === mode ? 'text-blue-300' : 'text-gray-300'}`}>
                      {t(`settings.cloud.${mode}Instance`)}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">{t(`settings.cloud.${mode}InstanceDesc`)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cloud config — online mode only */}
          {instanceMode === 'online' && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  {t('settings.cloud.endpoint')}
                </label>
                <input
                  type="url"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder={t('settings.cloud.endpointPlaceholder')}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  {t('settings.cloud.apiKey')}
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="••••••••••••••••"
                  autoComplete="off"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Real-time sync */}
          <div className="rounded-xl border border-white/10 bg-white/5">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-200">{t('settings.cloud.realtimeSync')}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t('settings.cloud.realtimeSyncDesc')}</p>
                </div>
              </div>
              <button
                onClick={() => setRealtimeSync(v => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${realtimeSync ? 'bg-green-500' : 'bg-white/10'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${realtimeSync ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Connection status */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('settings.cloud.statusLabel')}</p>
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                instanceMode === 'online'
                  ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                  : 'bg-gray-600'
              }`} />
              <span className="text-sm text-gray-300">
                {instanceMode === 'online' ? t('settings.cloud.status.online') : t('settings.cloud.status.local')}
              </span>
            </div>
            {instanceMode === 'online' && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Monitor className="w-3.5 h-3.5 shrink-0" />
                <span>{t('settings.cloud.connectedDevices', { count: 1 })}</span>
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
          {t('settings.cloud.save')}
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('general');

  return (
    <AppLayout>
      <div className="flex h-full overflow-hidden">
        {/* ─── Lateral settings navigation ─── */}
        <aside className="w-52 border-r border-white/10 p-3 flex flex-col shrink-0 bg-black/10">
          <p className="px-3 pt-3 pb-3 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
            {t('settings.title')}
          </p>
          <nav className="space-y-0.5">
            {TABS.map(({ id, tKey, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                  activeTab === id
                    ? 'bg-orange-500/10 text-amber-500 border border-orange-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {t(tKey)}
              </button>
            ))}
          </nav>
        </aside>

        {/* â”€â”€â”€ Tab content â”€â”€â”€ */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'general'       && <GeneralTab />}
          {activeTab === 'membres'       && <MembresTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'securite'      && <SecuriteTab />}
          {activeTab === 'cloud'         && <CloudTab />}
        </div>
      </div>
    </AppLayout>
  );
}

