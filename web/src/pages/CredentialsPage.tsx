/**
 * Credentials Manager Page — node-aware credential management.
 *
 * Flow:
 *  List view -> "Nouveau" -> Service picker -> Credential form -> saved to localStorage
 *
 * Credentials are tied to a service/integration type (openai, stripe, slack, etc.)
 * and can be selected directly from the Node Config Modal when configuring a node.
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import AppLayout from '../components/layouts/AppLayout';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  X,
} from 'lucide-react';
import type { Credential, CredentialType } from '../types/credentials';
import { CREDENTIAL_FIELDS, SERVICE_INFO, NODE_CREDENTIAL_MAP } from '../types/credentials';
import { NODE_TYPES_METADATA } from '../types/node';
import type { NodeType } from '../types/node';
import { ICON_MAP } from '../components/canvas/CustomNode';
import {
  readCredentials,
  addCredential,
  updateCredential,
  deleteCredential,
} from '../services/credentialService';

// --- Service picker data ---

const ALL_SERVICES = (Object.keys(CREDENTIAL_FIELDS) as CredentialType[])
  .map((type) => ({
    type,
    ...(SERVICE_INFO[type] ?? { name: type, description: '', icon: '🔑', category: 'other' as const }),
    fields: CREDENTIAL_FIELDS[type]!,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const CATEGORY_LABELS: Record<string, string> = {
  ai: 'IA & LLM',
  payment: 'Paiement',
  communication: 'Communication',
  marketing: 'Marketing',
  social: 'Réseaux sociaux',
  crm: 'CRM',
  support: 'Support client',
  productivity: 'Productivité',
  storage: 'Stockage',
  database: 'Bases de données',
  devops: 'DevOps',
  design: 'Design',
  ecommerce: 'E-commerce',
  project: 'Apps',
  other: 'Autre',
};

// Curated display labels for all credential-requiring node types
const NODE_LABELS: Record<string, string> = {
  openAI: 'OpenAI', anthropic: 'Anthropic', gemini: 'Gemini',
  stripe: 'Stripe', paypal: 'PayPal',
  salesforce: 'Salesforce', hubspot: 'HubSpot', zendesk: 'Zendesk',
  slack: 'Slack',
  slackSendMessage: 'Slack — Envoyer message', slackUpdateMessage: 'Slack — Modifier message', slackUploadFile: 'Slack — Upload fichier',
  discord: 'Discord',
  discordSendMessage: 'Discord — Envoyer message', discordSendEmbed: 'Discord — Embed', discordManageChannel: 'Discord — Gérer canal',
  telegram: 'Telegram',
  telegramSendMessage: 'Telegram — Envoyer message', telegramSendPhoto: 'Telegram — Envoyer photo', telegramBotCommand: 'Telegram — Commande bot',
  twilio: 'Twilio',
  twilioSendSMS: 'Twilio — SMS', twilioReceiveSMS: 'Twilio — Recevoir SMS', twilioMakeCall: 'Twilio — Appel', twilioSendWhatsApp: 'Twilio — WhatsApp',
  whatsapp: 'WhatsApp',
  whatsappSendMessage: 'WhatsApp — Message', whatsappSendMedia: 'WhatsApp — Média', whatsappSendLocation: 'WhatsApp — Position',
  sendgrid: 'SendGrid', mailchimp: 'Mailchimp',
  instagram: 'Instagram',
  instagramPost: 'Instagram — Post', instagramStory: 'Instagram — Story', instagramReels: 'Instagram — Reels',
  facebook: 'Facebook',
  facebookPost: 'Facebook — Post', facebookUploadPhoto: 'Facebook — Upload photo', facebookPagePost: 'Facebook — Page post',
  twitter: 'Twitter / X',
  twitterTweet: 'Twitter — Tweet', twitterReply: 'Twitter — Répondre', twitterLike: 'Twitter — Like', twitterRetweet: 'Twitter — Retweet',
  linkedin: 'LinkedIn',
  linkedinPost: 'LinkedIn — Post', linkedinShareArticle: 'LinkedIn — Article', linkedinMessage: 'LinkedIn — Message',
  tiktok: 'TikTok',
  tiktokUploadVideo: 'TikTok — Upload vidéo', tiktokGetVideoInfo: 'TikTok — Info vidéo', tiktokGetUserInfo: 'TikTok — Info utilisateur',
  googleSheets: 'Google Sheets', googleDrive: 'Google Drive',
  notion: 'Notion', airtable: 'Airtable', trello: 'Trello',
  dropbox: 'Dropbox', onedrive: 'OneDrive', box: 'Box',
  gitHub: 'GitHub', figma: 'Figma',
};

// Category display order for the "Par nœud" tab
const CATEGORY_ORDER = ['ai', 'payment', 'crm', 'support', 'communication', 'social', 'marketing', 'productivity', 'storage', 'database', 'devops', 'design', 'ecommerce', 'project', 'other'];

interface CredNodeEntry { nodeType: string; label: string; credType: CredentialType; category: string; svcIcon: string; svcName: string; }

const CREDENTIAL_NODES: CredNodeEntry[] = Object.entries(NODE_CREDENTIAL_MAP)
  .map(([nodeType, credType]) => {
    const meta = NODE_TYPES_METADATA[nodeType as NodeType];
    const svc = SERVICE_INFO[credType!];
    return {
      nodeType,
      label: NODE_LABELS[nodeType] ?? nodeType,
      credType: credType!,
      category: (meta?.category as string) ?? svc?.category ?? 'other',
      svcIcon: svc?.icon ?? '🔑',
      svcName: svc?.name ?? String(credType),
    };
  })
  .sort((a, b) => a.label.localeCompare(b.label));

// Maps each credential type to a representative canvas node type for icon lookup
const CRED_NODE_MAP: Partial<Record<CredentialType, string>> = {
  openai: 'openAI',
  anthropic: 'anthropic',
  stripe: 'stripe',
  paypal: 'paypal',
  salesforce: 'salesforce',
  hubspot: 'hubspot',
  zendesk: 'zendesk',
  twilio: 'twilio',
  sendgrid: 'sendgrid',
  mailchimp: 'mailchimp',
  slack: 'slack',
  discord: 'discord',
  telegram: 'telegram',
  whatsapp: 'whatsApp',
  google: 'googleSheets',
  notion: 'notion',
  airtable: 'airtable',
  trello: 'trello',
  github: 'gitHub',
  figma: 'figma',
  dropbox: 'dropbox',
  onedrive: 'onedrive',
  box: 'box',
  instagram: 'instagram',
  facebook: 'facebook',
  twitter: 'twitter',
  linkedin: 'linkedin',
  tiktok: 'tiktok',
};

/** Renders the canvas icon for a given credential type. */
const CredIcon: React.FC<{ credType: CredentialType }> = ({ credType }) => {
  const nodeType = CRED_NODE_MAP[credType];
  const Icon = nodeType ? ICON_MAP[nodeType] : null;
  if (!Icon) return <Shield className="w-6 h-6 text-gray-500" />;
  // BrandIcons ignore className (self-sized at w-8 h-8); Lucide icons use it.
  return <Icon className="w-6 h-6 text-white" />;
};

// --- Credential form ---

const CredentialForm: React.FC<{
  credType: CredentialType;
  initial?: Credential;
  onSave: (cred: Credential) => void;
  onCancel: () => void;
}> = ({ credType, initial, onSave, onCancel }) => {
  const { t } = useTranslation();
  const service = SERVICE_INFO[credType];
  const fields = CREDENTIAL_FIELDS[credType] ?? [];

  const [name, setName] = useState(initial?.name ?? (service?.name ? `${service.name} credential` : credType));
  const [values, setValues] = useState<Record<string, string>>(initial?.credentials ?? {});
  const [showMasked, setShowMasked] = useState<Record<string, boolean>>({});

  const setField = (key: string, val: string) => setValues((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initial) {
      updateCredential(initial.id, { name, credentials: values });
      onSave({ ...initial, name, credentials: values, updatedAt: new Date().toISOString() });
    } else {
      const saved = addCredential({ type: credType, name, credentials: values });
      onSave(saved);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10 shrink-0">
        <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl shrink-0">
          <CredIcon credType={credType} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">
            {initial ? t('credentials.formEdit', { name: service?.name ?? credType }) : t('credentials.formNew', { name: service?.name ?? credType })}
          </h2>
          <p className="text-xs text-gray-500">{service?.description}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">{t('credentials.credentialName')}</label>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)} required
            placeholder="ex : Prod Stripe Key"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 text-sm"
          />
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('credentials.authInfo')}</p>
          {fields.map((field) => {
            const isMasked = field.masked && !showMasked[field.key];
            return (
              <div key={field.key}>
                <label className="block text-xs text-gray-400 mb-1">
                  {field.label}{field.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={isMasked ? 'password' : 'text'}
                    value={values[field.key] ?? ''}
                    onChange={(e) => setField(field.key, e.target.value)}
                    placeholder={field.placeholder ?? ''}
                    required={field.required}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 text-sm pr-9 font-mono"
                  />
                  {field.masked && (
                    <button type="button"
                      onClick={() => setShowMasked((p) => ({ ...p, [field.key]: !p[field.key] }))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors"
                    >
                      {showMasked[field.key] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
                {field.description && <p className="mt-1 text-[11px] text-gray-600">{field.description}</p>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 px-6 py-4 border-t border-white/10 shrink-0">
        <button type="button" onClick={onCancel}
          className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 rounded-lg text-sm font-medium transition-colors">
          {t('credentials.cancel')}
        </button>
        <button type="submit"
          className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold transition-colors">
          {initial ? t('credentials.save') : t('credentials.create')}
        </button>
      </div>
    </form>
  );
};

// --- Service picker ---

const ServicePicker: React.FC<{ onPick: (type: CredentialType) => void; onCancel: () => void }> = ({ onPick, onCancel }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<'service' | 'node'>('service');

  // --- service mode ---
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ALL_SERVICES.filter((s) => !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
  }, [search]);

  const byCategory = useMemo(() => {
    const map = new Map<string, typeof ALL_SERVICES>();
    for (const s of filtered) {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push(s);
    }
    return map;
  }, [filtered]);

  // --- node mode ---
  const filteredNodes = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return CREDENTIAL_NODES;
    return CREDENTIAL_NODES.filter((n) =>
      n.label.toLowerCase().includes(q) || n.svcName.toLowerCase().includes(q) || n.nodeType.toLowerCase().includes(q),
    );
  }, [search]);

  const nodesByCategory = useMemo(() => {
    const map = new Map<string, CredNodeEntry[]>();
    for (const n of filteredNodes) {
      if (!map.has(n.category)) map.set(n.category, []);
      map.get(n.category)!.push(n);
    }
    return map;
  }, [filteredNodes]);

  const orderedNodeCategories = useMemo(() => {
    const cats = Array.from(nodesByCategory.keys());
    return [...CATEGORY_ORDER.filter((c) => cats.includes(c)), ...cats.filter((c) => !CATEGORY_ORDER.includes(c))];
  }, [nodesByCategory]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10 shrink-0">
        <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white">{t('credentials.newCredential')}</h2>
          <p className="text-xs text-gray-500">{t('credentials.selectService')}</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 pt-3 pb-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input autoFocus type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={mode === 'service' ? t('credentials.searchService') : t('credentials.searchNode')}
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 text-sm" />
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 px-6 pb-3 border-b border-white/10 shrink-0">
        <button type="button" onClick={() => setMode('service')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            mode === 'service' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-white/5 text-gray-500 hover:text-gray-300 border border-transparent'
          }`}>
          {t('credentials.byService')}
        </button>
        <button type="button" onClick={() => setMode('node')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            mode === 'node' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-white/5 text-gray-500 hover:text-gray-300 border border-transparent'
          }`}>
          {t('credentials.byNode')}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        {mode === 'service' ? (
          <>
            {byCategory.size === 0 && <p className="text-gray-600 text-sm text-center py-8">{t('credentials.noService')}</p>}
            {Array.from(byCategory.entries()).map(([cat, services]) => (
              <div key={cat}>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">{t(`credentials.categories.${cat}`) || CATEGORY_LABELS[cat] || cat}</p>
                <div className="grid grid-cols-2 gap-2">
                  {services.map((s) => (
                    <button key={s.type} type="button" onClick={() => onPick(s.type)}
                      className="flex items-center gap-3 px-3 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/30 rounded-xl text-left transition-all group">
                      <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                        <CredIcon credType={s.type} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate group-hover:text-orange-300 transition-colors">{s.name}</p>
                        <p className="text-[10px] text-gray-600 truncate">{s.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            {orderedNodeCategories.length === 0 && <p className="text-gray-600 text-sm text-center py-8">{t('credentials.noNode')}</p>}
            {orderedNodeCategories.map((cat) => {
              const nodes = nodesByCategory.get(cat) ?? [];
              return (
                <div key={cat}>
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">{t(`credentials.categories.${cat}`) || CATEGORY_LABELS[cat] || cat}</p>
                  <div className="space-y-1">
                    {nodes.map((n) => (
                      <button key={n.nodeType} type="button" onClick={() => onPick(n.credType)}
                        className="w-full flex items-center gap-3 px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/30 rounded-xl text-left transition-all group">
                        <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg shrink-0">
                          {(() => { const Icon = ICON_MAP[n.nodeType] ?? null; return Icon ? <Icon className="w-5 h-5 text-white" /> : <Shield className="w-5 h-5 text-gray-500" />; })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-orange-300 transition-colors">{t('credentials.node.' + n.nodeType, { defaultValue: n.label })}</p>
                          <p className="text-[10px] text-gray-600">{n.svcName}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

// --- Credential card ---

const CredentialCard: React.FC<{ cred: Credential; onEdit: () => void; onDelete: () => void }> = ({ cred, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const svc = SERVICE_INFO[cred.type];
  const fields = CREDENTIAL_FIELDS[cred.type] ?? [];
  const maskedFields = fields.filter((f) => f.masked && cred.credentials[f.key]);

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 flex items-center justify-center bg-white/5 rounded-xl shrink-0">
              <CredIcon credType={cred.type} />
            </div>
          <div>
            <p className="font-semibold text-white leading-tight">{cred.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{svc?.name ?? cred.type}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {maskedFields.map((f) => (
                <span key={f.key} className="inline-flex items-center gap-1 text-[10px] text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">
                  <Shield className="w-2.5 h-2.5" />{f.label} ••••
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onEdit} className="p-2 rounded-lg hover:bg-white/10 text-gray-600 hover:text-white transition-colors" title={t('credentials.edit')}>
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-2 rounded-lg hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-colors" title={t('credentials.delete')}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-[11px] text-gray-700 mt-3">{t('credentials.createdAt', { date: new Date(cred.createdAt).toLocaleDateString() })}</p>
    </div>
  );
};

// --- Main page ---

type View = 'list' | 'pickService' | 'form';

export const CredentialsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<View>('list');
  const [selectedType, setSelectedType] = useState<CredentialType | null>(null);
  const [editingCred, setEditingCred] = useState<Credential | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>(() => readCredentials());
  const [search, setSearch] = useState('');

  const reload = useCallback(() => setCredentials(readCredentials()), []);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setView('pickService');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filteredCreds = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return credentials;
    return credentials.filter((c) =>
      c.name.toLowerCase().includes(q) || (SERVICE_INFO[c.type]?.name ?? c.type).toLowerCase().includes(q),
    );
  }, [credentials, search]);

  const handlePick = (type: CredentialType) => { setSelectedType(type); setView('form'); };
  const handleSaved = () => { reload(); setView('list'); setEditingCred(null); setSelectedType(null); };
  const handleCancel = () => {
    if (view === 'form') setView('pickService');
    else { setView('list'); setEditingCred(null); setSelectedType(null); }
  };
  const handleEdit = (cred: Credential) => { setEditingCred(cred); setSelectedType(cred.type); setView('form'); };
  const handleDelete = (id: string) => {
    if (confirm(t('credentials.deleteConfirm'))) { deleteCredential(id); reload(); }
  };

  const showSidebar = view !== 'list';

  return (
    <AppLayout>
      <div className="flex h-full overflow-hidden">
        {/* Main list */}
        <div className={`flex flex-col flex-1 min-w-0 transition-opacity duration-200 ${showSidebar ? 'opacity-40 pointer-events-none select-none' : ''}`}>
          <div className="px-8 py-6 border-b border-white/10 bg-black/40 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Credentials</h1>
                <p className="text-sm text-gray-500 mt-1">{t('credentials.count', { count: credentials.length })}</p>
              </div>
              <button onClick={() => setView('pickService')}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" />{t('credentials.newCredential')}
              </button>
            </div>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 text-sm" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {filteredCreds.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Shield className="w-16 h-16 mb-4 text-gray-700" />
                <p className="text-lg font-semibold text-gray-500">{search ? t('credentials.noSearchResults') : t('credentials.noneTitle')}</p>
                <p className="text-sm text-gray-600 mt-1">{search ? t('credentials.editSearchHint') : t('credentials.noneHint')}</p>
                {!search && (
                  <button onClick={() => setView('pickService')}
                    className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" />{t('credentials.newCredential')}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-3 max-w-3xl">
                {filteredCreds.map((cred) => (
                  <CredentialCard key={cred.id} cred={cred} onEdit={() => handleEdit(cred)} onDelete={() => handleDelete(cred.id)} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar panel */}
        {showSidebar && (
          <div className="flex flex-col h-full w-[460px] shrink-0 border-l border-white/10 bg-[#0a0a0a] overflow-hidden">
            {view === 'pickService' && <ServicePicker onPick={handlePick} onCancel={() => setView('list')} />}
            {view === 'form' && selectedType && (
              <CredentialForm credType={selectedType} initial={editingCred ?? undefined} onSave={handleSaved} onCancel={handleCancel} />
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CredentialsPage;
