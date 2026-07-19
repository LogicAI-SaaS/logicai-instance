/**
 * MembersPanel - Panel de gestion des membres de l'instance
 * Features:
 * - Liste des membres avec leurs rôles
 * - Invitation de nouveaux membres
 * - Gestion des permissions (Admin, Editor, Viewer)
 * - Indicateur de présence en temps réel
 * - Suppression/promotion des membres
 */

import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Crown,
  Eye,
  Edit,
  MoreVertical,
  Copy,
  Loader2,
} from 'lucide-react';
import { localApiRequest } from '../../config/api';
import { useTranslation } from 'react-i18next';

export type MemberRole = 'admin' | 'editor' | 'viewer';

export interface Member {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: MemberRole;
  avatar?: string;
  isOnline?: boolean;
  isInvitation?: boolean;
  invitedBy?: string;
  invitedAt?: string;
  joinedAt?: string;
  lastSeen?: string;
  cursor?: {
    x: number;
    y: number;
    color: string;
  };
}

interface MembersPanelProps {
  instanceId: string;
  currentUserId?: string;
  isOnline?: boolean;
}

const ROLE_CONFIG = {
  admin: {
    label: 'members.role.admin',
    description: 'Accès complet',
    icon: Crown,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
  },
  editor: {
    label: 'members.role.editor',
    description: 'Peut modifier les workflows',
    icon: Edit,
    color: 'text-brand-blue',
    bgColor: 'bg-brand-blue/10',
  },
  viewer: {
    label: 'members.role.viewer',
    description: 'Lecture seule',
    icon: Eye,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
  },
} as const;

export default function MembersPanel({ instanceId, currentUserId, isOnline = true }: MembersPanelProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('viewer');
  const [inviting, setInviting] = useState(false);
  const [showMemberMenu, setShowMemberMenu] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    loadMembers();
  }, [instanceId]);

  async function loadMembers() {
    try {
      setLoading(true);
      // TODO: Remplacer par l'API réelle quand elle sera créée
      // const response = await localApiRequest(`/api/instances/${instanceId}/members`);
      // const data = await response.json();
      // setMembers(data.data || []);

      // Données de démonstration
      setMembers([
        {
          id: '1',
          email: 'admin@logiciai.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isOnline: true,
          avatar: 'A',
        },
        {
          id: '2',
          email: 'editor@logiciai.com',
          firstName: 'Editor',
          lastName: 'User',
          role: 'editor',
          isOnline: true,
          avatar: 'E',
          cursor: { x: 100, y: 200, color: '#ff6b6b' },
        },
        {
          id: '3',
          email: 'viewer@logiciai.com',
          firstName: 'Viewer',
          lastName: 'User',
          role: 'viewer',
          isOnline: false,
          avatar: 'V',
        },
      ]);
    } catch (err: any) {
      console.error('Failed to load members:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) {
      return;
    }

    try {
      setInviting(true);
      // TODO: Remplacer par l'API réelle
      // await localApiRequest(`/api/instances/${instanceId}/members/invite`, {
      //   method: 'POST',
      //   body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      // });

      // Simulation
      const newMember: Member = {
        id: Date.now().toString(),
        email: inviteEmail,
        role: inviteRole,
        isInvitation: true,
        invitedAt: new Date().toISOString(),
      };
      setMembers((prev) => [...prev, newMember]);

      setInviteEmail('');
      setShowInviteModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to invite member');
    } finally {
      setInviting(false);
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm(t('members.confirm.removeMember'))) {
      return;
    }

    try {
      // TODO: Remplacer par l'API réelle
      // await localApiRequest(`/api/instances/${instanceId}/members/${memberId}`, {
      //   method: 'DELETE',
      // });
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err: any) {
      alert(err.message || 'Failed to remove member');
    }
  }

  async function handleUpdateRole(memberId: string, newRole: MemberRole) {
    try {
      // TODO: Remplacer par l'API réelle
      // await localApiRequest(`/api/instances/${instanceId}/members/${memberId}`, {
      //   method: 'PUT',
      //   body: JSON.stringify({ role: newRole }),
      // });
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    }
  }

  async function handleResendInvite(memberId: string) {
    try {
      // TODO: Remplacer par l'API réelle
      // await localApiRequest(`/api/instances/${instanceId}/members/${memberId}/resend`, {
      //   method: 'POST',
      // });
      alert(t('members.inviteResent'));
    } catch (err: any) {
      alert(err.message || 'Failed to resend invitation');
    }
  }

  async function handleCopyInviteLink(member: Member) {
    const inviteLink = `${window.location.origin}/invite/${instanceId}/${member.id}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      alert(t('members.inviteLinkCopied'));
    } catch (err) {
      alert(t('members.cannotCopy'));
    }
  }

  function getInitials(firstName?: string, lastName?: string, email?: string) {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`;
    }
    if (firstName) {
      return firstName[0];
    }
    return email?.[0]?.toUpperCase() || '?';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{t('members.title')}</h3>
          <p className="text-sm text-gray-400">
            {t('members.description')}
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-blue hover:bg-brand-hover text-white rounded-lg transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          {t('members.invite')}
        </button>
      </div>

      {/* Members List */}
      <div className="space-y-3">
        {members.map((member) => {
          const roleConfig = ROLE_CONFIG[member.role];
          const RoleIcon = roleConfig.icon;

          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-bg-card border border-white/10 rounded-lg hover:border-white/20 transition-colors group"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                      member.role === 'admin' ? 'bg-gradient-to-br from-orange-500 to-amber-500' : 'bg-brand-blue'
                    }`}
                  >
                    {member.avatar || getInitials(member.firstName, member.lastName, member.email)}
                  </div>
                  {/* Online indicator */}
                  {member.isOnline && !member.isInvitation && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-bg-card rounded-full" />
                  )}
                  {/* Cursor indicator for real-time collaboration */}
                  {member.cursor && (
                    <span
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-bg-card"
                      style={{ backgroundColor: member.cursor.color }}
                    />
                  )}
                </div>

                {/* Member Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">
                      {member.firstName && member.lastName
                        ? `${member.firstName} ${member.lastName}`
                        : member.email}
                    </p>
                    <span
                      className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-md ${roleConfig.bgColor} ${roleConfig.color}`}
                    >
                      <RoleIcon className="w-3 h-3" />
                      {t(roleConfig.label)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {member.isInvitation ? (
                      <p className="text-xs text-orange-400">{t('members.pendingAcceptance')}</p>
                    ) : (
                      <>
                        {member.lastSeen && (
                          <p className="text-xs text-gray-500">
                            {t('members.activeAt', { lastSeen: member.lastSeen })}
                          </p>
                        )}
                        {member.joinedAt && (
                          <p className="text-xs text-gray-500">
                            {t('members.joinedAt', { date: new Date(member.joinedAt).toLocaleDateString() })}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="relative">
                <button
                  onClick={() => setShowMemberMenu(showMemberMenu === member.id ? null : member.id)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {showMemberMenu === member.id && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-bg-card border border-white/10 rounded-lg shadow-xl z-50">
                    <div className="py-1">
                      {member.isInvitation ? (
                        <>
                          <button
                            onClick={() => handleCopyInviteLink(member)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            {t('members.copyLink')}
                          </button>
                          <button
                            onClick={() => handleResendInvite(member.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                            {t('members.resendInvite')}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              handleUpdateRole(
                                member.id,
                                member.role === 'viewer' ? 'editor' : member.role === 'editor' ? 'admin' : 'viewer'
                              );
                              setShowMemberMenu(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            {t('members.changeRole')}
                          </button>
                          {member.id !== currentUserId && (
                            <button
                              onClick={() => {
                                handleRemoveMember(member.id);
                                setShowMemberMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              {t('members.delete')}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {members.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">{t('members.noMembers')}</p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-6 py-3 bg-brand-blue hover:bg-brand-hover text-white rounded-lg transition-colors"
            >
              {t('members.inviteMembers')}
            </button>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowInviteModal(false)}
        >
          <div
            className="bg-bg-card border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">{t('members.inviteTitle')}</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('members.inviteeMail')}</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={t('members.emailPlaceholder')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('members.roleLabel')}</label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(ROLE_CONFIG) as MemberRole[]).map((role) => {
                    const config = ROLE_CONFIG[role];
                    const Icon = config.icon;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setInviteRole(role)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          inviteRole === role
                            ? 'border-brand-blue bg-brand-blue/20'
                            : 'border-white/10 hover:border-white/30 bg-white/5'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${config.color}`} />
                        <span className="text-xs font-medium text-white">{t(config.label)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-3 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  {t('members.cancel')}
                </button>
                <button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim() || inviting}
                  className="flex-1 px-4 py-3 bg-brand-blue hover:bg-brand-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {inviting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {t('members.sending')}
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      {t('members.inviteSend')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
