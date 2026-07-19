/**
 * AppLayout â€” Shared application layout.
 * Provides header, sidebar, help panel and auth guard for all main pages.
 */

import { useEffect, useState, useRef, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  HelpCircle,
  Home,
  FileText,
  Settings,
  LogOut,
  User,
  X,
  RefreshCw,
  Download,
  CheckCircle,
  AlertCircle,
  Package,
  BookOpen,
  MessageCircle,
  History,
  ExternalLink,
  Loader2,
  Zap,
  Key,
  Database,
  Check,
  UserPlus,
} from 'lucide-react';
import { localApiRequest } from '../../config/api';

interface AppLayoutProps {
  children: ReactNode;
  /** Optional JSX rendered at the right of the header (e.g. a "New workflow" button) */
  headerAction?: ReactNode;
}

export default function AppLayout({ children, headerAction }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [user, setUser] = useState<any>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isHelpPanelOpen, setIsHelpPanelOpen] = useState(false);
  const [helpTab, setHelpTab] = useState<'updates' | 'docs' | 'changelog' | 'support'>('updates');
  const [systemInfo, setSystemInfo] = useState<{ version: string; uptime: number } | null>(null);
  const [updateInfo, setUpdateInfo] = useState<{
    currentVersion: string;
    latestVersion: string;
    hasUpdate: boolean;
    checkFailed?: boolean;
    checkFailedReason?: 'not_configured' | 'network' | 'unknown';
    changelog?: string | null;
    releaseDate?: string | null;
    releaseUrl?: string | null;
  } | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [isNewDropdownOpen, setIsNewDropdownOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => localStorage.getItem('sidebar_collapsed') === 'true'
  );
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [actioningNotif, setActioningNotif] = useState<string | null>(null);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      localStorage.setItem('sidebar_collapsed', String(!prev));
      return !prev;
    });
  };

  const dropdownRef = useRef<HTMLDivElement>(null);
  const newDropdownRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = token ? JSON.parse(localStorage.getItem('auth_user') || 'null') : null;
    if (!token || !userData) {
      navigate('/login', { replace: true });
    } else {
      setUser(userData);
    }
  }, [navigate]);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (newDropdownRef.current && !newDropdownRef.current.contains(event.target as Node)) {
        setIsNewDropdownOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsBellOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load + poll notifications
  const loadNotifications = () => {
    localApiRequest('/api/members/notifications')
      .then((r) => r.json())
      .then((d) => { if (d.success) setNotifications(d.data); })
      .catch(() => {});
  };
  useEffect(() => {
    loadNotifications();
    const tid = setInterval(loadNotifications, 30_000);
    return () => clearInterval(tid);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleAcceptInvitation = async (notif: any) => {
    setActioningNotif(notif.id);
    try {
      const payload = notif.data ? JSON.parse(notif.data) : {};
      const token = payload.invitationToken;
      if (token) {
        await localApiRequest(`/api/members/invitations/${token}/accept`, { method: 'POST' });
      }
      await localApiRequest(`/api/members/notifications/${notif.id}/read`, { method: 'PATCH' });
      loadNotifications();
    } catch {}
    setActioningNotif(null);
  };

  const handleDeclineInvitation = async (notif: any) => {
    setActioningNotif(notif.id);
    try {
      const payload = notif.data ? JSON.parse(notif.data) : {};
      const token = payload.invitationToken;
      if (token) {
        await localApiRequest(`/api/members/invitations/${token}/decline`, { method: 'PATCH' });
      }
      await localApiRequest(`/api/members/notifications/${notif.id}/read`, { method: 'PATCH' });
      loadNotifications();
    } catch {}
    setActioningNotif(null);
  };

  const markAllRead = () => {
    localApiRequest('/api/members/notifications/read-all', { method: 'PATCH' }).catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Load system info + update check silently
  useEffect(() => {
    localApiRequest('/api/system/info')
      .then((r) => r.json())
      .then((d) => { if (d.success) setSystemInfo(d.data); })
      .catch(() => {});
    localApiRequest('/api/system/check-update')
      .then((r) => r.json())
      .then((d) => { if (d.success) setUpdateInfo(d.data); })
      .catch(() => {});
  }, []);

  const getInitials = () => {
    if (!user) return 'U';
    if (user.firstName && user.lastName) return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    if (user.firstName) return user.firstName[0].toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    return 'U';
  };

  const getDisplayName = () => {
    if (!user) return t('common.user');
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    return user.email || t('common.user');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/login', { replace: true });
  };

  const checkForUpdates = async () => {
    setIsCheckingUpdate(true);
    try {
      const res = await localApiRequest('/api/system/check-update');
      const data = await res.json();
      if (data.success) setUpdateInfo(data.data);
    } catch (_err) {}
    setIsCheckingUpdate(false);
  };

  const downloadUpdateScript = () => {
    const version = updateInfo?.latestVersion ?? 'latest';
    const script = `#!/bin/bash\n# =============================================\n# Script de mise Ã  jour LogicAI v${version}\n# =============================================\nset -e\n\necho ""\necho "Mise Ã  jour LogicAI vers la version ${version}..."\necho ""\n\necho "TÃ©lÃ©chargement de la nouvelle image Docker..."\ndocker pull logicai-instance:latest\necho "Nouvelle image tÃ©lÃ©chargÃ©e !"\necho ""\n\nCONTAINER=$(docker ps --filter ancestor=logicai-instance:latest --format "{{.Names}}" | head -1)\nif [ -z "$CONTAINER" ]; then\n  echo "Aucun conteneur logicai-instance actif trouvÃ©."\n  echo "Relancez votre conteneur avec votre commande docker run habituelle."\nelse\n  echo "Conteneur trouvÃ© : $CONTAINER"\n  echo "ArrÃªt du conteneur..."\n  docker stop $CONTAINER\n  docker rm $CONTAINER\n  echo ""\n  echo "Relancez votre conteneur avec votre commande docker run habituelle."\n  echo "Vos donnÃ©es sont conservÃ©es dans le volume Docker."\nfi\n\necho ""\necho "Mise Ã  jour terminÃ©e ! Relancez votre conteneur pour utiliser la version ${version}."\necho ""\n`;
    const blob = new Blob([script], { type: 'text/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'update-logicai.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleNewWorkflow = async () => {
    setIsNewDropdownOpen(false);
    try {
      const response = await localApiRequest('/api/workflows', {
        method: 'POST',
        body: JSON.stringify({ name: t('dashboard.newWorkflowName'), description: '', nodes: [], edges: [] }),
      });
      const result = await response.json();
      navigate(`/workflow/${result.data.id}`);
    } catch (err: any) {
      alert(err?.message || 'Ã‰chec de la crÃ©ation du workflow');
    }
  };

  const currentPath = location.pathname;

  const navMain = [
    { href: '/', icon: Home, label: t('nav.workflows') },
    { href: '/executions', icon: FileText, label: t('nav.executions') },
  ];

  const navData = [
    { href: '/credentials', icon: Key, label: t('nav.credentials') },
    { href: '/database', icon: Database, label: t('nav.database') },
  ];

  const navBottom: { href: string; icon: any; label: string }[] = [];

  const navLinkClass = (href: string) => {
    const isActive = href === '/' ? currentPath === href : currentPath.startsWith(href);
    const color = isActive
      ? 'bg-orange-500/10 text-amber-500 border border-orange-500/30'
      : 'text-gray-400 hover:text-white hover:bg-white/5 transition-colors';
    const layout = isSidebarCollapsed
      ? 'flex items-center justify-center p-3 rounded-lg'
      : 'flex items-center gap-3 px-4 py-3 rounded-lg';
    return `${layout} ${color}`;
  };

  return (
    <div className="h-screen overflow-hidden bg-background-dark flex flex-col">
      {/* â”€â”€â”€ Header â”€â”€â”€ */}
      <header className="bg-bg-card border-b border-white/10 px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/LogicAI.ico" alt="LogicAI" className="w-8 h-8" />
            <h1 className="text-xl font-bold text-white">LogicAI</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* â”€â”€â”€ Global "Nouveau" split-button â”€â”€â”€ */}
            <div className="relative" ref={newDropdownRef}>
              <div className="flex flex-row bg-brand-blue rounded-md">
                <button
                  onClick={handleNewWorkflow}
                  className="h-9 flex items-center gap-2 px-3 rounded-l-md hover:bg-brand-hover transition-colors"
                  title={t('header.newWorkflow')}
                >
                  <Plus className="w-4 h-4 text-white shrink-0" />
                  <span className="text-white text-sm font-medium">{t('header.new')}</span>
                </button>
                <button
                  onClick={() => setIsNewDropdownOpen((o) => !o)}
                  className="w-9 h-9 flex items-center justify-center border-l border-white/50 rounded-r-md hover:bg-brand-hover transition-colors"
                  title={t('header.newExpand')}
                >
                  <ChevronDown className="w-4 h-4 text-white" />
                </button>
              </div>
              {isNewDropdownOpen && (
                <div className="absolute right-0 mt-1 w-62 bg-brand-blue border border-white/10 rounded-lg shadow-xl z-50 py-1">
                  <button
                    onClick={handleNewWorkflow}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-200 hover:bg-white/5 hover:text-white transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4 text-white" />
                    {t('header.newWorkflow')}
                  </button>
                  <button
                    onClick={() => { setIsNewDropdownOpen(false); navigate('/credentials?new=1'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-200 hover:bg-white/5 hover:text-white transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4 text-white" />
                    {t('header.newCredential')}
                  </button>
                  <button
                    onClick={() => { setIsNewDropdownOpen(false); navigate('/database?new=1'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-200 hover:bg-white/5 hover:text-white transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4 text-white" />
                    {t('header.newDatabase')}
                  </button>
                </div>
              )}
            </div>

            {headerAction}

            {/* Notification bell */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => { setIsBellOpen((v) => !v); if (!isBellOpen) markAllRead(); }}
                className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-100" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-orange-400 rounded-full" />
                )}
              </button>

              {isBellOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#0d0d0d] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-semibold text-white">{t('notifications.title')}</p>
                    <button
                      onClick={() => setIsBellOpen(false)}
                      className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-gray-600 text-sm">
                        <Bell className="w-6 h-6 mx-auto mb-2 opacity-30" />
                        {t('notifications.none')}
                      </div>
                    ) : notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 ${notif.read ? '' : 'bg-orange-500/5'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            notif.type === 'invitation' ? 'bg-blue-500/20' : 'bg-white/10'
                          }`}>
                            {notif.type === 'invitation'
                              ? <UserPlus className="w-3.5 h-3.5 text-blue-400" />
                              : <Bell className="w-3.5 h-3.5 text-gray-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white leading-snug">{notif.title}</p>
                            {notif.body && <p className="text-xs text-gray-500 mt-0.5 leading-snug">{notif.body}</p>}
                            {notif.type === 'invitation' && !notif.read && (
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  disabled={actioningNotif === notif.id}
                                  onClick={() => handleAcceptInvitation(notif)}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 text-xs rounded-lg transition-colors disabled:opacity-50"
                                >
                                  <Check className="w-3 h-3" /> {t('notifications.accept')}
                                </button>
                                <button
                                  disabled={actioningNotif === notif.id}
                                  onClick={() => handleDeclineInvitation(notif)}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 text-xs rounded-lg transition-colors disabled:opacity-50"
                                >
                                  <X className="w-3 h-3" /> {t('notifications.decline')}
                                </button>
                              </div>
                            )}
                          </div>
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0 mt-1.5" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{getDisplayName()}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <div
                  className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center hover:shadow-lg hover:shadow-orange-500/50 transition-all"
                  title={getDisplayName()}
                >
                  <span className="text-sm font-bold text-white">{getInitials()}</span>
                </div>
              </div>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-bg-card border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-medium text-white">{getDisplayName()}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">{t('profile.myProfile')}</span>
                    </button>
                    <button
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">{t('profile.settings')}</span>
                    </button>
                  </div>
                  <div className="border-t border-white/10 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('profile.logout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* â”€â”€â”€ Sidebar â”€â”€â”€ */}
        <aside className={`relative ${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-card border-r border-white/10 flex flex-col transition-all duration-200 shrink-0`}>
          {/* Floating collapse/expand toggle on the right border */}
          <button
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? t('nav.expandMenu') : t('nav.collapseMenu')}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-[#0d0d0d] border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all shadow-lg"
          >
            {isSidebarCollapsed
              ? <ChevronRight className="w-3.5 h-3.5" />
              : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
          <nav className="flex-1 p-2 space-y-1 overflow-hidden">
            {navMain.map(({ href, icon: Icon, label }) => (
              <a key={href} href={href} className={navLinkClass(href)} title={isSidebarCollapsed ? label : undefined}>
                <Icon className="w-5 h-5 shrink-0" />
                {!isSidebarCollapsed && <span className="font-medium truncate">{label}</span>}
              </a>
            ))}

            {isSidebarCollapsed ? (
              <div className="my-1 border-t border-white/10" />
            ) : (
              <div className="pt-2 pb-1">
                <p className="px-4 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                  {t('nav.data')}
                </p>
              </div>
            )}

            {navData.map(({ href, icon: Icon, label }) => (
              <a key={href} href={href} className={navLinkClass(href)} title={isSidebarCollapsed ? label : undefined}>
                <Icon className="w-5 h-5 shrink-0" />
                {!isSidebarCollapsed && <span className="font-medium truncate">{label}</span>}
              </a>
            ))}


          </nav>

          {/* Bottom nav (settings, help) */}
          <nav className="p-2 space-y-1 border-t border-white/10">
            <a
              href="/settings"
              title={isSidebarCollapsed ? t('nav.settings') : undefined}
              className={`${isSidebarCollapsed
                ? 'flex items-center justify-center p-3 rounded-lg'
                : 'flex items-center gap-3 px-4 py-3 rounded-lg'
              } ${currentPath.startsWith('/settings')
                ? 'bg-orange-500/10 text-amber-500 border border-orange-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5 transition-colors'}`}
            >
              <Settings className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span>{t('nav.settings')}</span>}
            </a>
            <button
              onClick={() => { setIsHelpPanelOpen((v) => !v); setHelpTab('updates'); }}
              title={isSidebarCollapsed ? t('nav.help') : undefined}
              className={isSidebarCollapsed
                ? 'w-full flex items-center justify-center p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors'
                : 'w-full flex items-center justify-between px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors group'}
            >
              {isSidebarCollapsed ? (
                <div className="relative">
                  <HelpCircle className="w-5 h-5" />
                  {updateInfo?.hasUpdate && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" />
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <HelpCircle className="w-5 h-5" />
                      {updateInfo?.hasUpdate && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" />
                      )}
                    </div>
                    <span>{t('nav.help')}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isHelpPanelOpen ? 'rotate-90' : ''}`} />
                </>
              )}
            </button>
          </nav>

          {/* â”€â”€â”€ Help dropdown (floats over main content) â”€â”€â”€ */}
          {isHelpPanelOpen && (
            <div className="absolute left-full bottom-0 z-50 w-96 h-[420px] max-h-[calc(100vh-4rem)] bg-[#0d0d0d] border border-white/10 rounded-tr-xl shadow-2xl flex flex-col overflow-hidden"
              style={{ marginLeft: '1px' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-gray-400" />
                  <h2 className="text-white font-semibold">{t('help.title')}</h2>
                </div>
                <button
                  onClick={() => setIsHelpPanelOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10 bg-black/20 shrink-0">
                {(['updates', 'docs', 'changelog', 'support'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setHelpTab(tab)}
                    className={`flex-1 py-2.5 text-xs font-medium transition-colors relative ${
                      helpTab === tab
                        ? 'text-white border-b-2 border-blue-500 -mb-px'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {tab === 'updates' ? t('help.tabUpdates') :
                     tab === 'docs' ? t('help.tabDocs') :
                     tab === 'changelog' ? t('help.tabChangelog') : t('help.tabSupport')}
                    {tab === 'updates' && updateInfo?.hasUpdate && (
                      <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Updates */}
                {helpTab === 'updates' && (
                  <div className="p-5 space-y-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t('help.currentVersion')}</p>
                        <p className="text-white font-bold text-xl">{systemInfo?.version ?? 'â€”'}</p>
                        {systemInfo?.uptime != null && (
                          <p className="text-xs text-gray-600 mt-1">
                            {t('help.uptime', { hours: Math.floor(systemInfo.uptime / 3600), minutes: Math.floor((systemInfo.uptime % 3600) / 60) })}
                          </p>
                        )}
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>
                    <button
                      onClick={checkForUpdates}
                      disabled={isCheckingUpdate}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCheckingUpdate ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      {isCheckingUpdate ? t('help.checking') : t('help.checkUpdates')}
                    </button>
                    {updateInfo && !isCheckingUpdate && (
                      <>
                        {updateInfo.checkFailed ? (
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                            <AlertCircle className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs text-gray-400 font-medium mb-0.5">
                                {updateInfo.checkFailedReason === 'not_configured'
                                  ? 'Serveur de mise Ã  jour non configurÃ©'
                                  : updateInfo.checkFailedReason === 'network'
                                  ? 'Impossible de joindre le serveur'
                                  : 'VÃ©rification impossible'}
                              </p>
                              <p className="text-xs text-gray-600">
                                {updateInfo.checkFailedReason === 'not_configured'
                                  ? "Configurez UPDATE_CHECK_URL dans les variables d'environnement du conteneur."
                                  : updateInfo.checkFailedReason === 'network'
                                  ? "VÃ©rifiez que le conteneur a accÃ¨s Ã  internet."
                                  : "Une erreur inattendue s'est produite."}
                              </p>
                            </div>
                          </div>
                        ) : updateInfo.hasUpdate ? (
                          <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-sm text-amber-300 font-semibold">{t('help.updateAvailable')}</p>
                                <p className="text-xs text-amber-400/70 mt-0.5">
                                  {t('help.updateAvailableVersion', { version: updateInfo.latestVersion })}
                                  {updateInfo.releaseDate && ` · ${new Date(updateInfo.releaseDate).toLocaleDateString()}`}
                                </p>
                              </div>
                            </div>
                            {updateInfo.changelog && (
                              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                <p className="text-xs font-medium text-gray-400 mb-2">{t('help.releaseNotes')}</p>
                                <p className="text-xs text-gray-500 whitespace-pre-wrap leading-relaxed">
                                  {updateInfo.changelog.length > 500 ? updateInfo.changelog.slice(0, 500) + '...' : updateInfo.changelog}
                                </p>
                              </div>
                            )}
                            <button
                              onClick={downloadUpdateScript}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl text-sm text-amber-300 hover:text-amber-200 transition-all"
                            >
                              <Download className="w-4 h-4" />
                              {t('help.downloadScript')}
                            </button>
                            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                              <p className="text-xs text-blue-400">
                                {t('help.updateHint')}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-green-500/10 border border-green-500/20">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm text-green-300 font-semibold">{t('help.upToDate')}</p>
                              <p className="text-xs text-green-400/70 mt-0.5">{t('help.upToDateSub', { version: updateInfo.currentVersion })}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                {/* Docs */}
                {helpTab === 'docs' && (
                  <div className="p-5 space-y-3">
                    <p className="text-xs text-gray-600 uppercase tracking-wider font-medium mb-3">{t('help.docsGuides')}</p>
                    {[
                      { label: t('help.docsGettingStarted'), desc: t('help.docsGettingStartedDesc'), icon: BookOpen },
                      { label: t('help.docsNodes'), desc: t('help.docsNodesDesc'), icon: Zap },
                      { label: t('help.docsDocker'), desc: t('help.docsDockerDesc'), icon: Package },
                      { label: t('help.docsFaq'), desc: t('help.docsFaqDesc'), icon: HelpCircle },
                    ].map(({ label, desc, icon: Icon }) => (
                      <button key={label} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-gray-400" /></div>
                        <div className="flex-1 min-w-0"><p className="text-sm text-white font-medium">{label}</p><p className="text-xs text-gray-500">{desc}</p></div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
                {/* Changelog */}
                {helpTab === 'changelog' && (
                  <div className="p-5 space-y-5">
                    {[{
                      version: systemInfo?.version ?? '1.0.0', date: t('help.changelogDate'), current: true,
                      changes: [
                        { type: 'new', text: t('help.changelogC1') },
                        { type: 'new', text: t('help.changelogC2') },
                        { type: 'new', text: t('help.changelogC3') },
                        { type: 'new', text: t('help.changelogC4') },
                        { type: 'new', text: t('help.changelogC5') },
                        { type: 'new', text: t('help.changelogC6') },
                        { type: 'fix', text: t('help.changelogC7') },
                      ],
                    }].map((entry) => (
                      <div key={entry.version} className="space-y-3">
                        <div className="flex items-center gap-2">
                          {entry.current && <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-blue-500/20 text-blue-300">{t('help.changelogCurrent')}</span>}
                          <span className="text-white font-bold">{entry.version}</span>
                          <span className="text-gray-600 text-xs">Â· {entry.date}</span>
                        </div>
                        <div className="space-y-2 pl-3 border-l border-white/10">
                          {entry.changes.map((c, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className={`mt-0.5 text-xs px-1.5 py-px rounded font-bold shrink-0 ${c.type === 'new' ? 'bg-green-500/20 text-green-400' : c.type === 'fix' ? 'bg-amber-500/20 text-amber-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                {c.type === 'new' ? 'NEW' : c.type === 'fix' ? 'FIX' : 'IMP'}
                              </span>
                              <span className="text-sm text-gray-400 leading-snug">{c.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Support */}
                {helpTab === 'support' && (
                  <div className="p-5 space-y-3">
                    <p className="text-xs text-gray-600 uppercase tracking-wider font-medium mb-3">{t('help.supportCommunityTitle')}</p>
                    {[
                      { label: 'Discord', desc: t('help.supportDiscordDesc'), icon: MessageCircle, color: 'text-indigo-400' },
                      { label: 'GitHub', desc: t('help.supportGithubDesc'), icon: History, color: 'text-gray-300' },
                      { label: 'Email', desc: 'support@logicai.io', icon: MessageCircle, color: 'text-blue-400' },
                    ].map(({ label, desc, icon: Icon, color }) => (
                      <button key={label} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0"><Icon className={`w-4 h-4 ${color}`} /></div>
                        <div className="flex-1 min-w-0"><p className="text-sm text-white font-medium">{label}</p><p className="text-xs text-gray-500 truncate">{desc}</p></div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-white/10 bg-black/20 shrink-0">
                <p className="text-xs text-gray-600 text-center">{t('help.footer', { version: systemInfo?.version ?? '' })}</p>
              </div>
            </div>
          )}
        </aside>

        {/* â”€â”€â”€ Main content â”€â”€â”€ */}
        <main className="flex-1 flex flex-col bg-black overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
