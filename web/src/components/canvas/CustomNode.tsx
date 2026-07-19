/**
 * CustomNode - Custom React Flow Node Component
 * Features:
 * - Dark mode styling with TailwindCSS
 * - Dynamic Lucide icons based on node type
 * - Real brand SVG logos for major services
 * - Input/Output handles
 * - Status badge (idle, running, success, error)
 * - Type-specific border colors
 */

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Handle, Position, useReactFlow, useEdges } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import ReactMarkdown from 'react-markdown';
import {
  Webhook, Globe, Variable, GitBranch, UserCheck, Sparkles, Shield, Search, FileText,
  Bug, Eye, Zap, Ghost, Edit, Code, Filter, Hash, Grid, Clock, AlertCircle,
  PlaySquare, Activity, FileInput, Rss, Upload, Terminal, Database, Mail,
  MessageSquare, MessageCircle, Send, HardDrive, CheckSquare,
  Smartphone, Laptop, Monitor, Radio, Server, MousePointerClick, RefreshCw,
  Cpu, Archive, Lock, ArrowUpDown, File, GitMerge, Mic, Wrench, Plus,
} from 'lucide-react';
import type { CustomNodeData } from '../../types/node';
import {
  StripeIcon, PayPalIcon, SquareIcon, ShopifyIcon, WooCommerceIcon,
  SalesforceIcon, HubSpotIcon, ZendeskIcon, TwilioIcon, SendGridIcon,
  MailchimpIcon, AsanaIcon, LinearIcon, DropboxIcon, OneDriveIcon,
  BoxIcon, OpenAIIcon, GitHubIcon, FigmaIcon, GoogleSheetsIcon,
  GoogleDriveIcon, AirtableIcon, NotionIcon, TrelloIcon, PostgreSQLIcon,
  MongoDBIcon, RedisIcon, SupabaseIcon, InstagramIcon, FacebookIcon,
  TwitterIcon, LinkedInIcon, TikTokIcon, TwitchIcon, YouTubeIcon, KickIcon,
  SnapchatIcon, AnthropicIcon, GeminiIcon, PerplexityIcon, GLMIcon,
  OpenRouterIcon, OllamaIcon, FirebaseIcon, SQLiteIcon, S3Icon, DiscordIcon,
  SlackIcon,
} from '../icons/BrandIcons';
import '@xyflow/react/dist/style.css';

// Icon mapping for ALL node types (50+ nodes)
export const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  // CORE NODES (Logic & Data)
  webhook: Webhook,
  httpRequest: Globe,
  setVariable: Variable,
  editFields: Edit,
  code: Code,
  filter: Filter,
  switch: GitBranch,
  merge: GitMerge,
  splitInBatches: Grid,
  wait: Clock,
  errorTrigger: AlertCircle,
  executeWorkflow: PlaySquare,
  limit: Hash,
  sort: ArrowUpDown,

  // TRIGGER NODES
  schedule: Clock,
  onSuccessFailure: Activity,
  formTrigger: FileInput,
  chatTrigger: MessageCircle,
  clickTrigger: MousePointerClick,
  emailTrigger: Mail,
  httpPollTrigger: RefreshCw,
  cronTrigger: Clock,

  // HTTP & DATA
  htmlExtract: Globe,
  rssRead: Rss,
  ftp: Upload,
  ssh: Terminal,

  // DATABASE
  mySQL: Database,
  postgreSQL: PostgreSQLIcon as any,
  mongoDB: MongoDBIcon as any,
  redis: RedisIcon as any,
  supabase: SupabaseIcon as any,

  // COMMUNICATION
  email: Mail,
  slack: SlackIcon as any,
  discord: DiscordIcon as any,
  telegram: Send,
  whatsApp: MessageSquare,
  twilio: TwilioIcon as any,
  sendgrid: SendGridIcon as any,
  mailchimp: MailchimpIcon as any,

  // CLOUD PRODUCTIVITY
  googleSheets: GoogleSheetsIcon as any,
  googleDrive: GoogleDriveIcon as any,
  airtable: AirtableIcon as any,
  notion: NotionIcon as any,
  trello: TrelloIcon as any,

  // PROJECT MANAGEMENT
  asana: AsanaIcon as any,
  linear: LinearIcon as any,

  // CLOUD STORAGE
  dropbox: DropboxIcon as any,
  onedrive: OneDriveIcon as any,
  box: BoxIcon as any,

  // PAYMENT & E-COMMERCE
  stripe: StripeIcon as any,
  paypal: PayPalIcon as any,
  square: SquareIcon as any,
  shopify: ShopifyIcon as any,
  wooCommerce: WooCommerceIcon as any,

  // CRM & CUSTOMER SUPPORT
  salesforce: SalesforceIcon as any,
  hubspot: HubSpotIcon as any,
  zendesk: ZendeskIcon as any,

  // AI/LLM
  openAI: OpenAIIcon as any,
  aiAgent: Mic,
  vectorStore: Database,
  embeddings: Cpu,

  // BINARY
  readWriteBinaryFile: File,
  compression: Archive,
  crypto: Lock,

  // EXCLUSIVE CUSTOM NODES
  humanInTheLoop: UserCheck,
  smartDataCleaner: Sparkles,
  aiCostGuardian: Shield,
  noCodeBrowserAutomator: Globe,
  aggregatorMultiSearch: Search,
  pdfIntelligentParser: FileText,
  liveCanvasDebugger: Bug,
  socialMockupPreview: Eye,
  rateLimiterBypass: Zap,
  ghost: Ghost,

  // ADVANCED INTEGRATION NODES
  appleEcosystem: Laptop,
  androidEcosystem: Smartphone,
  gitHub: GitHubIcon as any,
  figma: FigmaIcon as any,
  windowsControl: Monitor,
  streaming: Radio,
  infrastructure: Server,

  // INDIVIDUAL APPLE NODES
  imessage: MessageCircle,
  icloudReminders: CheckSquare,
  icloudNotes: FileText,
  icloudCalendar: Clock,
  icloudDrive: HardDrive,

  // INDIVIDUAL ANDROID NODES
  androidMessages: MessageSquare,
  androidContacts: Database,
  androidADB: Terminal,
  androidAPK: Archive,
  androidNotifications: AlertCircle,

  // SOCIAL MEDIA NODES
  instagram: InstagramIcon as any,
  facebook: FacebookIcon as any,
  twitter: TwitterIcon as any,
  linkedin: LinkedInIcon as any,
  tiktok: TikTokIcon as any,

  // TIKTOK SUB-NODES
  tiktokUploadVideo: TikTokIcon as any,
  tiktokGetVideoInfo: TikTokIcon as any,
  tiktokGetUserInfo: TikTokIcon as any,

  // SOCIAL SUB-NODES
  instagramPost: InstagramIcon as any,
  instagramStory: InstagramIcon as any,
  instagramReels: InstagramIcon as any,
  facebookPost: FacebookIcon as any,
  facebookUploadPhoto: FacebookIcon as any,
  facebookPagePost: FacebookIcon as any,
  twitterTweet: TwitterIcon as any,
  twitterReply: TwitterIcon as any,
  twitterLike: TwitterIcon as any,
  twitterRetweet: TwitterIcon as any,
  linkedinPost: LinkedInIcon as any,
  linkedinShareArticle: LinkedInIcon as any,
  linkedinMessage: LinkedInIcon as any,
  whatsappSendMessage: MessageSquare,
  whatsappSendMedia: MessageSquare,
  whatsappSendLocation: MessageSquare,
  telegramSendMessage: Send,
  telegramSendPhoto: Send,
  telegramBotCommand: Send,
  discordSendMessage: DiscordIcon as any,
  discordSendEmbed: DiscordIcon as any,
  discordManageChannel: DiscordIcon as any,
  slackSendMessage: SlackIcon as any,
  slackUpdateMessage: SlackIcon as any,
  slackUploadFile: SlackIcon as any,

  // STREAMING PLATFORMS
  twitch: TwitchIcon as any,
  youtube: YouTubeIcon as any,
  kick: KickIcon as any,
  snapchat: SnapchatIcon as any,

  // AI/LLM NODES
  anthropic: AnthropicIcon as any,
  gemini: GeminiIcon as any,
  perplexity: PerplexityIcon as any,
  glm: GLMIcon as any,
  openrouter: OpenRouterIcon as any,
  ollama: OllamaIcon as any,

  // DATABASE & STORAGE
  firebase: FirebaseIcon as any,
  sqlite: SQLiteIcon as any,
  s3: S3Icon as any,

  // LOGIC NODES
  loop: RefreshCw,
  date: Clock,
  uuid: Hash,
  textFormatter: Edit,
  if: GitBranch,

  // AI SUB-NODE PLACEHOLDERS
  memory: Database,
  tool: Wrench,
};

// Color mapping for ALL node types
const COLOR_MAP: Record<string, string> = {
  // CORE NODES
  webhook: 'border-purple-500',
  httpRequest: 'border-blue-500',
  setVariable: 'border-green-500',
  editFields: 'border-indigo-400',
  code: 'border-violet-400',
  filter: 'border-cyan-400',
  switch: 'border-orange-400',
  merge: 'border-pink-400',
  splitInBatches: 'border-teal-400',
  wait: 'border-gray-400',
  errorTrigger: 'border-red-400',
  executeWorkflow: 'border-emerald-400',
  limit: 'border-lime-400',
  sort: 'border-sky-400',

  // TRIGGER NODES
  schedule: 'border-amber-500',
  onSuccessFailure: 'border-rose-500',
  formTrigger: 'border-blue-400',
  chatTrigger: 'border-indigo-500',
  clickTrigger: 'border-pink-500',
  emailTrigger: 'border-gray-500',
  httpPollTrigger: 'border-teal-500',
  cronTrigger: 'border-yellow-500',

  // HTTP & DATA
  htmlExtract: 'border-green-400',
  rssRead: 'border-orange-400',
  ftp: 'border-purple-400',
  ssh: 'border-gray-500',

  // DATABASE
  mySQL: 'border-blue-600',
  mongoDB: 'border-green-600',
  redis: 'border-red-600',
  supabase: 'border-emerald-500',

  // COMMUNICATION
  email: 'border-gray-500',
  slack: 'border-purple-600',
  discord: 'border-indigo-500',
  telegram: 'border-cyan-500',
  whatsApp: 'border-green-500',

  // CLOUD PRODUCTIVITY
  googleSheets: 'border-green-600',
  googleDrive: 'border-yellow-500',
  airtable: 'border-blue-500',
  notion: 'border-gray-400',
  trello: 'border-orange-500',

  // AI/LLM
  openAI: 'border-emerald-400',
  aiAgent: 'border-violet-400',
  vectorStore: 'border-pink-400',
  embeddings: 'border-cyan-400',

  // BINARY
  readWriteBinaryFile: 'border-gray-400',
  compression: 'border-orange-400',
  crypto: 'border-red-400',

  // EXCLUSIVE CUSTOM NODES
  humanInTheLoop: 'border-pink-500',
  smartDataCleaner: 'border-yellow-500',
  aiCostGuardian: 'border-cyan-500',
  noCodeBrowserAutomator: 'border-indigo-500',
  aggregatorMultiSearch: 'border-teal-500',
  pdfIntelligentParser: 'border-rose-500',
  liveCanvasDebugger: 'border-lime-500',
  socialMockupPreview: 'border-violet-500',
  rateLimiterBypass: 'border-amber-500',
  ghost: 'border-gray-400',

  // ADVANCED INTEGRATION NODES
  appleEcosystem: 'border-gray-300',
  androidEcosystem: 'border-green-400',
  gitHub: 'border-gray-300',
  figma: 'border-pink-400',
  windowsControl: 'border-blue-400',
  streaming: 'border-purple-400',
  infrastructure: 'border-orange-400',

  // INDIVIDUAL APPLE NODES
  imessage: 'border-blue-400',
  icloudReminders: 'border-blue-400',
  icloudNotes: 'border-blue-400',
  icloudCalendar: 'border-blue-400',
  icloudDrive: 'border-blue-400',

  // INDIVIDUAL ANDROID NODES
  androidMessages: 'border-green-400',
  androidContacts: 'border-green-400',
  androidADB: 'border-green-400',
  androidAPK: 'border-green-400',
  androidNotifications: 'border-green-400',

  // SOCIAL MEDIA NODES
  instagram: 'border-pink-500',
  facebook: 'border-blue-600',
  twitter: 'border-sky-500',
  linkedin: 'border-blue-700',
  tiktok: 'border-gray-800',

  // TIKTOK SUB-NODES
  tiktokUploadVideo: 'border-gray-800',
  tiktokGetVideoInfo: 'border-gray-800',
  tiktokGetUserInfo: 'border-gray-800',

  // SOCIAL SUB-NODES
  instagramPost: 'border-pink-500',
  instagramStory: 'border-pink-500',
  instagramReels: 'border-pink-500',
  facebookPost: 'border-blue-600',
  facebookUploadPhoto: 'border-blue-600',
  facebookPagePost: 'border-blue-600',
  twitterTweet: 'border-sky-500',
  twitterReply: 'border-sky-500',
  twitterLike: 'border-sky-500',
  twitterRetweet: 'border-sky-500',
  linkedinPost: 'border-blue-700',
  linkedinShareArticle: 'border-blue-700',
  linkedinMessage: 'border-blue-700',
  whatsappSendMessage: 'border-green-500',
  whatsappSendMedia: 'border-green-500',
  whatsappSendLocation: 'border-green-500',
  telegramSendMessage: 'border-cyan-500',
  telegramSendPhoto: 'border-cyan-500',
  telegramBotCommand: 'border-cyan-500',
  discordSendMessage: 'border-indigo-500',
  discordSendEmbed: 'border-indigo-500',
  discordManageChannel: 'border-indigo-500',
  slackSendMessage: 'border-purple-700',
  slackUpdateMessage: 'border-purple-700',
  slackUploadFile: 'border-purple-700',

  // STREAMING PLATFORMS
  twitch: 'border-purple-600',
  youtube: 'border-red-600',
  kick: 'border-green-500',
  snapchat: 'border-yellow-400',

  // AI/LLM NODES
  anthropic: 'border-amber-600',
  gemini: 'border-blue-500',
  perplexity: 'border-teal-500',
  glm: 'border-blue-600',
  openrouter: 'border-purple-500',
  ollama: 'border-gray-700',

  // DATABASE & STORAGE
  firebase: 'border-yellow-500',
  sqlite: 'border-blue-700',
  s3: 'border-orange-500',

  // LOGIC NODES
  loop: 'border-purple-400',
  date: 'border-blue-400',
  uuid: 'border-green-400',
  textFormatter: 'border-cyan-400',
  if: 'border-orange-400',

  // SUB-NODE PLACEHOLDERS
  memory: 'border-violet-500',
  tool: 'border-amber-500',
};

// ── AI node canvas style ─────────────────────────────────────────────────────

const AI_CHAT_TYPES = new Set([
  'openAI', 'anthropic', 'gemini', 'perplexity', 'glm', 'openrouter', 'ollama',
]);

interface AiHandle {
  id: string;
  label: string;
  required?: boolean;
  dotColor: string;
  labelColor: string;
  addNodeType: string;
  xPct: number;
}

const AI_AGENT_HANDLES: AiHandle[] = [
  { id: 'chatModel', label: 'Chat Model', required: true,  dotColor: '!bg-blue-500 !border-blue-400',   labelColor: 'text-blue-400',   addNodeType: 'openAI',  xPct: 20 },
  { id: 'memory',    label: 'Memory',     required: false, dotColor: '!bg-violet-500 !border-violet-400', labelColor: 'text-violet-400', addNodeType: 'memory',  xPct: 50 },
  { id: 'tool',      label: 'Tool',       required: false, dotColor: '!bg-amber-500 !border-amber-400',  labelColor: 'text-amber-400',  addNodeType: 'tool',    xPct: 80 },
];

const AI_MODEL_HANDLES: AiHandle[] = [
  { id: 'memory', label: 'Memory', required: false, dotColor: '!bg-violet-500 !border-violet-400', labelColor: 'text-violet-400', addNodeType: 'memory', xPct: 30 },
  { id: 'tool',   label: 'Tool',   required: false, dotColor: '!bg-amber-500 !border-amber-400',  labelColor: 'text-amber-400',  addNodeType: 'tool',   xPct: 70 },
];

const AI_NODE_WIDTH  = 190;
const AI_NODE_HEIGHT = 116;

// ── AI Sub-node (Memory / Tool) ─────────────────────────────────────────────
const AI_SUB_NODE_TYPES = new Set(['memory', 'tool']);
const AI_SUB_NODE_WIDTH  = 168;
const AI_SUB_NODE_HEIGHT = 46;
const AI_SUB_STYLES: Record<string, { bar: string; iconColor: string; handleClass: string }> = {
  memory: { bar: 'bg-violet-500', iconColor: 'text-violet-400', handleClass: '!bg-violet-500 !border-violet-400' },
  tool:   { bar: 'bg-amber-500',  iconColor: 'text-amber-400',  handleClass: '!bg-amber-500  !border-amber-400'  },
};

export default function CustomNode({ data, selected, id }: NodeProps) {
  const { t } = useTranslation();
  const nodeData = (data as unknown) as CustomNodeData;
  const Icon = ICON_MAP[nodeData.type] || Variable;
  const isDisabled = !!nodeData.disabled;
  const borderColor = isDisabled ? 'border-gray-700/60' : (COLOR_MAP[nodeData.type] || 'border-gray-600');
  const status = nodeData.status || 'idle';

  const nodeSettings = (nodeData.config as any)?.__settings;
  const showNote = !!(nodeSettings?.displayNotesInFlow && nodeSettings?.notes);
  const noteBg = nodeSettings?.notesBackground ?? '#1e1e2e';
  const noteColor = nodeSettings?.notesTextColor ?? '#e2e8f0';

  const { addNodes, addEdges, getNode } = useReactFlow();
  const edges = useEdges();

  // Returns true if this node already has at least one outgoing edge on the given handle
  const isOutputConnected = useCallback((handle?: string) => {
    return edges.some((e) =>
      e.source === id && (handle ? e.sourceHandle === handle : !e.sourceHandle || e.sourceHandle == null)
    );
  }, [edges, id]);

  const handleAddFromOutput = useCallback((sourceHandle?: string) => {
    const currentNode = getNode(id);
    if (!currentNode) return;
    sessionStorage.setItem('connectFrom', JSON.stringify({
      sourceNodeId: id,
      sourceHandle: sourceHandle || null,
      position: {
        x: currentNode.position.x + 220,
        y: currentNode.position.y,
      },
    }));
    window.dispatchEvent(new CustomEvent('openCommandPalette'));
  }, [id, getNode]);

  // Merge node: dynamic input count & height
  const isMergeNode = nodeData.type === 'merge';
  const mergeInputCount = isMergeNode
    ? Math.max(2, Math.min(8, parseInt(String((nodeData.config as any)?.inputCount ?? 2), 10)))
    : 2;
  const isLoopNode  = nodeData.type === 'loop';
  const isIfNode     = nodeData.type === 'if';
  const isAiChatNode  = AI_CHAT_TYPES.has(nodeData.type);
  const isAiAgentNode = nodeData.type === 'aiAgent';
  const isAiNode      = isAiChatNode || isAiAgentNode;
  const aiHandles     = isAiAgentNode ? AI_AGENT_HANDLES : isAiChatNode ? AI_MODEL_HANDLES : [];
  const isAiSubNode   = AI_SUB_NODE_TYPES.has(nodeData.type);
  const aiSubStyle    = AI_SUB_STYLES[nodeData.type] ?? null;

  // Returns true if an AI agent handle already has an incoming connection
  const isAiHandleConnected = useCallback((handle: string) =>
    edges.some((e) => e.target === id && e.targetHandle === handle)
  , [edges, id]);

  const nodeHeight = isMergeNode
    ? Math.max(64, mergeInputCount * 22 + 20)
    : isLoopNode  ? 72
    : isIfNode    ? 72
    : isAiSubNode ? AI_SUB_NODE_HEIGHT
    : isAiNode    ? AI_NODE_HEIGHT
    : 64;

  function handleAddAiSubNode(handle: AiHandle) {
    const currentNode = getNode(id);
    if (!currentNode) return;
    const newId = `${handle.addNodeType}-${Date.now()}`;
    // Center the sub-node under its corresponding handle slot
    const offsetX = (handle.xPct / 100 - 0.5) * AI_NODE_WIDTH;
    addNodes([{
      id: newId,
      type: 'custom',
      position: {
        x: currentNode.position.x + offsetX,
        y: currentNode.position.y + AI_NODE_HEIGHT + 80,
      },
      data: {
        id: newId,
        type: handle.addNodeType,
        label: handle.label,
        config: {},
        status: 'idle',
      },
    }]);
    addEdges([{
      id: `edge-${newId}-${id}-${handle.id}`,
      source: newId,
      sourceHandle: 'sub-out',
      target: id,
      targetHandle: handle.id,
    }]);
  }

  // Check if this is a brand icon (returns JSX, not a component)
  const isBrandIcon = typeof Icon !== 'function' || (
    nodeData.type in ['stripe', 'paypal', 'square', 'shopify', 'wooCommerce',
      'salesforce', 'hubspot', 'zendesk', 'twilio', 'sendgrid', 'mailchimp',
      'asana', 'linear', 'dropbox', 'onedrive', 'box', 'openAI', 'gitHub',
      'figma', 'googleSheets', 'googleDrive', 'airtable', 'notion', 'trello',
      'postgreSQL', 'mongoDB', 'redis', 'supabase', 'instagram', 'facebook',
      'twitter', 'linkedin', 'tiktok', 'twitch', 'youtube', 'kick', 'snapchat',
      'anthropic', 'gemini', 'perplexity', 'glm', 'openrouter', 'ollama',
      'firebase', 'sqlite', 's3', 'discord', 'slack', 'instagramPost', 'instagramStory', 
      'instagramReels', 'facebookPost', 'facebookUploadPhoto', 'facebookPagePost', 
      'twitterTweet', 'twitterReply', 'twitterLike', 'twitterRetweet', 'linkedinPost',
      'linkedinShareArticle', 'linkedinMessage', 'discordSendMessage', 'discordSendEmbed',
      'discordManageChannel', 'slackSendMessage', 'slackUpdateMessage', 'slackUploadFile',
      'tiktokUploadVideo', 'tiktokGetVideoInfo', 'tiktokGetUserInfo']
  );

  return (
    <div
      className={`
        relative bg-black rounded-lg border-2
        ${isAiNode || isAiSubNode ? '' : 'w-16 flex items-center justify-center'}
        ${borderColor}
        ${selected ? 'ring-2 ring-brand-blue/60 shadow-[0_0_12px_rgba(0,112,255,0.4)]' : 'shadow-md'}
        ${isDisabled ? 'opacity-50 grayscale' : ''}
        hover:shadow-lg
        group
        transition-all duration-200
      `}
      style={{
        backdropFilter: 'blur(10px)',
        cursor: 'grab',
        pointerEvents: 'all',
        transform: 'translate(0, 0)',
        height: `${nodeHeight}px`,
        width: isAiNode ? `${AI_NODE_WIDTH}px` : isAiSubNode ? `${AI_SUB_NODE_WIDTH}px` : undefined,
      }}
      title={`${nodeData.label} (${nodeData.type})${isDisabled ? ' ' + t('canvas.nodeHidden') : ''}`}
    >
      {/* Disabled overlay — diagonal strikethrough */}
      {isDisabled && (
        <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none z-10">
          <div className="absolute inset-0 bg-black/30 rounded-[inherit]" />
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <line x1="8%" y1="8%" x2="92%" y2="92%" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* Input Handle(s) (left side) - NOT shown for trigger nodes */}
      {isMergeNode ? (
        // Merge: N dynamic input handles spaced evenly
        Array.from({ length: mergeInputCount }).map((_, i) => (
          <Handle
            key={`merge-in-${i}`}
            id={`input-${i}`}
            type="target"
            position={Position.Left}
            className="w-3 h-3 !bg-gray-600 !border-2 !border-white/10"
            style={{ top: `${((i + 1) / (mergeInputCount + 1)) * 100}%`, left: '-6px', transform: 'translateY(-50%)' }}
          />
        ))
      ) : (
        !isAiSubNode &&
        nodeData.type !== 'webhook' &&
        nodeData.type !== 'schedule' &&
        nodeData.type !== 'formTrigger' &&
        nodeData.type !== 'chatTrigger' &&
        nodeData.type !== 'clickTrigger' &&
        nodeData.type !== 'emailTrigger' &&
        nodeData.type !== 'httpPollTrigger' &&
        nodeData.type !== 'cronTrigger' &&
        nodeData.type !== 'onSuccessFailure' && (
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 bg-gray-600 border-2 border-white/10 -left-0.5!"
            style={isAiNode ? { top: '30px' } : undefined}
          />
        )
      )}

      {/* ── AI SUB-NODE (Memory / Tool) ────────────────────────────── */}
      {isAiSubNode && aiSubStyle ? (
        <div className="h-full flex items-center overflow-hidden">
          {/* Colored left accent bar */}
          <div className={`w-[3px] self-stretch flex-shrink-0 ${aiSubStyle.bar}`} />
          <div className="flex items-center gap-2 px-3 flex-1 min-w-0">
            <Icon className={`w-4 h-4 ${aiSubStyle.iconColor} shrink-0`} />
            <span className="text-white text-xs font-semibold truncate">{nodeData.label}</span>
          </div>
          {status !== 'idle' && (
            <div className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 border border-black
              ${status === 'running' ? 'bg-blue-500 animate-pulse' : ''}
              ${status === 'success' ? 'bg-green-500' : ''}
              ${status === 'error'   ? 'bg-red-500'   : ''}`}
            />
          )}
        </div>
      ) : null}

      {/* ── AI NODE CONTENT ───────────────────────────────────── */}
      {isAiNode ? (
        <>
          {/* Top section: icon + label */}
          <div
            className="absolute inset-x-0 flex items-center gap-2 px-3"
            style={{ top: 0, height: '60px' }}
          >
            <div className="shrink-0">
              {isBrandIcon ? (
                <Icon />
              ) : (
                <Icon
                  className={`w-6 h-6 ${
                    borderColor
                      .replace('border-', 'text-')
                      .replace('-500', '-400')
                      .replace('-600', '-400')
                  }`}
                />
              )}
            </div>
            <span className="text-white text-sm font-semibold truncate">
              {nodeData.label}
            </span>
            {status !== 'idle' && (
              <div
                className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border border-black ${
                  status === 'running' ? 'bg-blue-500 animate-pulse' : ''
                } ${status === 'success' ? 'bg-green-500' : ''} ${
                  status === 'error' ? 'bg-red-500' : ''
                }`}
              />
            )}
          </div>

          {/* Separator */}
          <div
            className="absolute inset-x-0 border-t border-gray-700/60"
            style={{ top: '60px' }}
          />

          {/* Bottom diamond handles + labels + floating + buttons */}
          {aiHandles.map((h) => {
            const connected = isAiHandleConnected(h.id);
            return (
              <div key={h.id}>
                {/* Diamond handle */}
                <Handle
                  id={h.id}
                  type="target"
                  position={Position.Bottom}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
                    bottom: '38px',
                    left: `${h.xPct}%`,
                    transform: 'translateX(-50%) rotate(45deg)',
                  }}
                  className={h.dotColor}
                />
                {/* Label */}
                <span
                  className={`absolute text-[9px] select-none pointer-events-none ${h.labelColor}`}
                  style={{ bottom: '20px', left: `${h.xPct}%`, transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
                >
                  {h.label}{h.required && <span className="text-red-400"> *</span>}
                </span>
                {/* + button — floats OUTSIDE the node border, visible on hover when unconnected */}
                {!connected && (
                  <button
                    type="button"
                    className="nodrag nopan absolute w-5 h-5 rounded-md border border-gray-600 bg-gray-900 text-gray-400 hover:bg-brand-blue hover:border-brand-blue hover:text-white flex items-center justify-center transition-all"
                    style={{ bottom: '-26px', left: `${h.xPct}%`, transform: 'translateX(-50%)' }}
                    onClick={(e) => { e.stopPropagation(); handleAddAiSubNode(h); }}
                  ><Plus className="w-3 h-3" /></button>
                )}
              </div>
            );
          })}

          {/* Tooltip on hover */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10">
            <div className="font-semibold">{nodeData.label}</div>
            <div className="text-gray-400 text-[10px] capitalize">{nodeData.type}</div>
          </div>
        </>
      ) : (
        <>
          {/* Regular icon */}
          {isBrandIcon ? (
            <Icon />
          ) : (
            <Icon
              className={`w-8 h-8 ${
                borderColor
                  .replace('border-', 'text-')
                  .replace('-500', '-400')
                  .replace('-600', '-400')
              } transition-colors duration-200`}
            />
          )}

          {/* Status indicator dot */}
          {status !== 'idle' && (
            <div
              className={`
                absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-black
                ${status === 'running' ? 'bg-blue-500 animate-pulse' : ''}
                ${status === 'success' ? 'bg-green-500' : ''}
                ${status === 'error' ? 'bg-red-500' : ''}
              `}
            />
          )}

          {/* Label tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10">
            <div className="font-semibold">{nodeData.label}</div>
            <div className="text-gray-400 text-[10px] capitalize">{nodeData.type}</div>
          </div>
        </>
      )}

      {/* Notes overlay below node */}
      {showNote && (
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-xl shadow-lg border border-white/10 text-xs leading-relaxed"
          style={{
            top: `${nodeHeight + 8}px`,
            minWidth: '160px',
            maxWidth: '260px',
            width: 'max-content',
            background: noteBg,
            color: noteColor,
            padding: '8px 10px',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <div className="prose prose-sm max-w-none" style={{ color: noteColor }}>
            <ReactMarkdown>{nodeSettings.notes}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Output Handle(s) (right side) + connector stubs */}
      {isAiSubNode ? (
        // Sub-node: single source handle pointing UP toward the AI agent above
        <Handle
          id="sub-out"
          type="source"
          position={Position.Top}
          style={{ top: '-6px', left: '50%', transform: 'translateX(-50%)' }}
          className={`!w-3 !h-3 ${aiSubStyle?.handleClass ?? '!bg-gray-500 !border-gray-400'}`}
        />
      ) : isAiNode ? (
        <>
          <Handle
            type="source"
            position={Position.Right}
            className="w-3 h-3 !bg-gray-600 !border-2 !border-gray-400"
            style={{ top: '30px', right: '-6px' }}
          />
          {!isOutputConnected() && (
            <div
              className="nodrag nopan absolute flex items-center z-20"
              style={{ right: '-48px', top: '30px', transform: 'translateY(-50%)' }}
            >
              <div className="w-[22px] h-px bg-white/25" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleAddFromOutput(); }}
                className="w-6 h-6 rounded-md border border-white/25 bg-black text-white/50 hover:bg-brand-blue hover:border-brand-blue hover:text-white flex items-center justify-center transition-all shrink-0"
              ><Plus className="w-3.5 h-3.5" /></button>
            </div>
          )}
        </>
      ) : isLoopNode ? (
        <>
          {/* done output */}
          <Handle
            id="done"
            type="source"
            position={Position.Right}
            style={{ top: '28%', right: '-6px' }}
            className="!w-3 !h-3 !bg-gray-600 !border-2 !border-gray-400"
          />
          <span className="absolute text-[9px] text-gray-400 select-none pointer-events-none" style={{ right: '10px', top: '28%', transform: 'translateY(-50%)' }}>done</span>
          {!isOutputConnected('done') && (
            <div
              className="nodrag nopan absolute flex items-center z-20"
              style={{ right: '-48px', top: '28%', transform: 'translateY(-50%)' }}
            >
              <div className="w-[22px] h-px bg-white/25" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleAddFromOutput('done'); }}
                className="w-6 h-6 rounded-md border border-white/25 bg-black text-white/50 hover:bg-brand-blue hover:border-brand-blue hover:text-white flex items-center justify-center transition-all shrink-0"
              ><Plus className="w-3.5 h-3.5" /></button>
            </div>
          )}
          {/* loop output */}
          <Handle
            id="loop"
            type="source"
            position={Position.Right}
            style={{ top: '72%', right: '-6px' }}
            className="!w-3 !h-3 !bg-teal-500 !border-2 !border-teal-300"
          />
          <span className="absolute text-[9px] text-gray-400 select-none pointer-events-none" style={{ right: '10px', top: '72%', transform: 'translateY(-50%)' }}>loop</span>
          {!isOutputConnected('loop') && (
            <div
              className="nodrag nopan absolute flex items-center z-20"
              style={{ right: '-48px', top: '72%', transform: 'translateY(-50%)' }}
            >
              <div className="w-[22px] h-px bg-teal-500/40" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleAddFromOutput('loop'); }}
                className="w-6 h-6 rounded-md border border-teal-500/40 bg-black text-teal-400/60 hover:bg-teal-500 hover:border-teal-400 hover:text-white flex items-center justify-center transition-all shrink-0"
              ><Plus className="w-3.5 h-3.5" /></button>
            </div>
          )}
        </>
      ) : isIfNode ? (
        <>
          {/* true output */}
          <Handle
            id="true"
            type="source"
            position={Position.Right}
            style={{ top: '28%', right: '-6px' }}
            className="!w-3 !h-3 !bg-green-500 !border-2 !border-green-300"
          />
          <span className="absolute text-[9px] text-green-400 font-semibold select-none pointer-events-none" style={{ right: '10px', top: '28%', transform: 'translateY(-50%)' }}>true</span>
          {!isOutputConnected('true') && (
            <div
              className="nodrag nopan absolute flex items-center z-20"
              style={{ right: '-48px', top: '28%', transform: 'translateY(-50%)' }}
            >
              <div className="w-[22px] h-px bg-green-500/40" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleAddFromOutput('true'); }}
                className="w-6 h-6 rounded-md border border-green-500/40 bg-black text-green-400/60 hover:bg-green-500 hover:border-green-400 hover:text-white flex items-center justify-center transition-all shrink-0"
              ><Plus className="w-3.5 h-3.5" /></button>
            </div>
          )}
          {/* false output */}
          <Handle
            id="false"
            type="source"
            position={Position.Right}
            style={{ top: '72%', right: '-6px' }}
            className="!w-3 !h-3 !bg-red-500 !border-2 !border-red-300"
          />
          <span className="absolute text-[9px] text-red-400 font-semibold select-none pointer-events-none" style={{ right: '10px', top: '72%', transform: 'translateY(-50%)' }}>false</span>
          {!isOutputConnected('false') && (
            <div
              className="nodrag nopan absolute flex items-center z-20"
              style={{ right: '-48px', top: '72%', transform: 'translateY(-50%)' }}
            >
              <div className="w-[22px] h-px bg-red-500/40" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleAddFromOutput('false'); }}
                className="w-6 h-6 rounded-md border border-red-500/40 bg-black text-red-400/60 hover:bg-red-500 hover:border-red-400 hover:text-white flex items-center justify-center transition-all shrink-0"
              ><Plus className="w-3.5 h-3.5" /></button>
            </div>
          )}
        </>
      ) : (
        <>
          <Handle
            type="source"
            position={Position.Right}
            className="w-3 h-3 !bg-gray-600 !border-2 !border-gray-400"
          />
          {!isOutputConnected() && (
            <div
              className="nodrag nopan absolute flex items-center z-20"
              style={{ right: '-48px', top: '50%', transform: 'translateY(-50%)' }}
            >
              <div className="w-[22px] h-px bg-white/25" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleAddFromOutput(); }}
                className="w-6 h-6 rounded-md border border-white/25 bg-black text-white/50 hover:bg-brand-blue hover:border-brand-blue hover:text-white flex items-center justify-center transition-all shrink-0"
              ><Plus className="w-3.5 h-3.5" /></button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
