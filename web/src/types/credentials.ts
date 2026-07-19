/**
 * Credentials Types
 * Secure credential storage system for API keys, tokens, and database connections
 */

export type CredentialType =
  | 'openai'
  | 'anthropic'
  | 'stripe'
  | 'paypal'
  | 'salesforce'
  | 'hubspot'
  | 'zendesk'
  | 'twilio'
  | 'sendgrid'
  | 'mailchimp'
  | 'slack'
  | 'discord'
  | 'telegram'
  | 'whatsapp'
  | 'google'
  | 'notion'
  | 'airtable'
  | 'trello'
  | 'github'
  | 'figma'
  | 'dropbox'
  | 'onedrive'
  | 'box'
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'linkedin'
  | 'tiktok'
  | 'custom';

export interface Credential {
  id: string;
  type: CredentialType;
  name: string;
  description?: string;
  credentials: Record<string, string>;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
}

export interface CredentialField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'number' | 'boolean' | 'select';
  required: boolean;
  placeholder?: string;
  description?: string;
  masked?: boolean; // For passwords/API keys
  icon?: string; // Optional icon for the field
  options?: string[]; // For select type
  defaultValue?: any; // Default value for the field
}

// Credential field definitions for each service
export const CREDENTIAL_FIELDS: Partial<Record<CredentialType, CredentialField[]>> = {
  // AI/LLM
  openai: [
    { key: 'apiKey', label: 'API Key', type: 'text', required: true, placeholder: 'sk-...', description: 'Your OpenAI API key', masked: true },
    { key: 'organizationId', label: 'Organization ID', type: 'text', required: false, placeholder: 'org-...' },
  ],
  anthropic: [
    { key: 'apiKey', label: 'API Key', type: 'text', required: true, placeholder: 'sk-ant-...', description: 'Your Anthropic API key', masked: true },
  ],

  // Payment
  stripe: [
    { key: 'secretKey', label: 'Secret Key', type: 'password', required: true, placeholder: 'sk_live_...', description: 'Stripe secret key', masked: true },
    { key: 'publishableKey', label: 'Publishable Key', type: 'text', required: true, placeholder: 'pk_live_...', description: 'Stripe publishable key', masked: true },
    { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: false, placeholder: 'whsec_...', description: 'Webhook signing secret', masked: true },
  ],
  paypal: [
    { key: 'clientId', label: 'Client ID', type: 'text', required: true, placeholder: 'AX...' },
    { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true, placeholder: 'EK...' },
  ],

  // CRM
  salesforce: [
    { key: 'instanceUrl', label: 'Instance URL', type: 'text', required: true, placeholder: 'https://your-instance.my.salesforce.com' },
    { key: 'apiVersion', label: 'API Version', type: 'select', required: false, options: ['v56.0', 'v55.0', 'v54.0'], defaultValue: 'v56.0' },
    { key: 'username', label: 'Username', type: 'text', required: false },
    { key: 'password', label: 'Password', type: 'password', required: false },
  ],
  hubspot: [
    { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'pat-na1-...', description: 'HubSpot API key', masked: true },
  ],

  // Customer Support
  zendesk: [
    { key: 'subdomain', label: 'Subdomain', type: 'text', required: true, placeholder: 'your-domain' },
    { key: 'email', label: 'Admin Email', type: 'text', required: true, placeholder: 'admin@example.com' },
    { key: 'apiToken', label: 'API Token', type: 'password', required: true, placeholder: 'Your API token', masked: true },
  ],

  // Communication
  twilio: [
    { key: 'accountSid', label: 'Account SID', type: 'text', required: true, placeholder: 'AC...' },
    { key: 'authToken', label: 'Auth Token', type: 'password', required: true, placeholder: 'your_auth_token', masked: true },
  ],
  sendgrid: [
    { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'SG.xxx', masked: true },
  ],
  mailchimp: [
    { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'your-apikey-usxx', masked: true },
    { key: 'dataCenter', label: 'Data Center', type: 'select', required: false, options: ['us1', 'us2', 'us3', 'us4', 'us5', 'us6', 'us7', 'us8', 'us9', 'us10', 'us11', 'us12'], defaultValue: 'us1' },
  ],

  // Social Media
  instagram: [
    { key: 'accessToken', label: 'Access Token', type: 'password', required: true, placeholder: 'IGQWR...', description: 'Instagram Graph API access token', masked: true },
    { key: 'appId', label: 'App ID', type: 'text', required: true, placeholder: 'Your Instagram App ID' },
  ],
  facebook: [
    { key: 'accessToken', label: 'Access Token', type: 'password', required: true, placeholder: 'EAA...', description: 'Facebook Graph API access token', masked: true },
    { key: 'appId', label: 'App ID', type: 'text', required: true, placeholder: 'Your Facebook App ID' },
  ],
  twitter: [
    { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'Your Twitter API key', masked: true },
    { key: 'apiKeySecret', label: 'API Key Secret', type: 'password', required: true, placeholder: 'Your Twitter API secret', masked: true },
    { key: 'bearerToken', label: 'Bearer Token', type: 'password', required: false, placeholder: 'AAAAAAAA...', description: 'Twitter Bearer token (alternative)', masked: true },
  ],
  linkedin: [
    { key: 'clientId', label: 'Client ID', type: 'text', required: true },
    { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
    { key: 'accessToken', label: 'Access Token', type: 'password', required: false, masked: true },
  ],

  // Cloud Storage
  dropbox: [
    { key: 'accessToken', label: 'Access Token', type: 'password', required: true, placeholder: 'sl.B...', masked: true },
    { key: 'appKey', label: 'App Key', type: 'password', required: true, placeholder: 'your_app_key', masked: true },
    { key: 'appSecret', label: 'App Secret', type: 'password', required: true, placeholder: 'your_app_secret', masked: true },
  ],
  onedrive: [
    { key: 'clientId', label: 'Client ID', type: 'text', required: true },
    { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
    { key: 'tenantId', label: 'Tenant ID', type: 'text', required: false },
    { key: 'refreshToken', label: 'Refresh Token', type: 'password', required: false },
  ],
  box: [
    { key: 'accessToken', label: 'Access Token', type: 'password', required: true, placeholder: 'Box...', masked: true },
  ],

  // Databases
  // Productivity
  google: [
    { key: 'oauthClientId', label: 'OAuth Client ID', type: 'text', required: true },
    { key: 'oauthClientSecret', label: 'OAuth Client Secret', type: 'password', required: true },
    { key: 'refreshToken', label: 'Refresh Token', type: 'password', required: false },
  ],
  notion: [
    { key: 'integrationToken', label: 'Integration Token', type: 'password', required: true, placeholder: 'secret_xxx...', masked: true },
  ],
  airtable: [
    { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'keyxxx...', masked: true },
    { key: 'baseId', label: 'Base ID', type: 'text', required: true, placeholder: 'app...' },
  ],
  trello: [
    { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'key...', masked: true },
    { key: 'token', label: 'OAuth Token', type: 'password', required: false, placeholder: 'xxx...', masked: true },
    { key: 'appKey', label: 'App Key', type: 'text', required: false },
  ],

  // DevOps
  github: [
    { key: 'personalAccessToken', label: 'Personal Access Token', type: 'password', required: true, placeholder: 'ghp_xxx...', masked: true },
    { key: 'oauthAppClientId', label: 'OAuth App Client ID', type: 'text', required: false },
    { key: 'oauthAppClientSecret', label: 'OAuth App Client Secret', type: 'password', required: false },
  ],
  figma: [
    { key: 'accessToken', label: 'Access Token', type: 'password', required: true, placeholder: 'figd_xxx...', masked: true },
  ],

  // Communication (missing entries)
  slack: [
    { key: 'botToken', label: 'Bot Token', type: 'password', required: true, placeholder: 'xoxb-...', description: 'Slack bot token', masked: true },
    { key: 'signingSecret', label: 'Signing Secret', type: 'password', required: false, placeholder: 'Slack signing secret', masked: true },
  ],
  discord: [
    { key: 'botToken', label: 'Bot Token', type: 'password', required: true, placeholder: 'Token de votre application Discord', description: 'Discord bot token', masked: true },
    { key: 'clientId', label: 'Client ID', type: 'text', required: false, placeholder: '123456789012345678' },
    { key: 'clientSecret', label: 'Client Secret', type: 'password', required: false, masked: true },
  ],
  telegram: [
    { key: 'botToken', label: 'Bot Token', type: 'password', required: true, placeholder: '123456789:AAF...', description: 'Token fourni par @BotFather', masked: true },
  ],
  whatsapp: [
    { key: 'accessToken', label: 'Access Token', type: 'password', required: true, description: 'WhatsApp Business API access token', masked: true },
    { key: 'phoneNumberId', label: 'Phone Number ID', type: 'text', required: true, placeholder: '123456789' },
    { key: 'businessAccountId', label: 'Business Account ID', type: 'text', required: false },
  ],
  tiktok: [
    { key: 'clientKey', label: 'Client Key', type: 'text', required: true },
    { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true, masked: true },
    { key: 'accessToken', label: 'Access Token', type: 'password', required: false, masked: true },
  ],
};

// Service metadata
export const SERVICE_INFO: Partial<Record<CredentialType, {
  name: string;
  description: string;
  icon: string;
  category: 'ai' | 'payment' | 'ecommerce' | 'crm' | 'communication' | 'marketing' | 'productivity' | 'storage' | 'database' | 'social' | 'devops' | 'other';
}>> = {
  openai: { name: 'OpenAI', description: 'GPT-4, DALL-E, Whisper API', icon: '🤖', category: 'ai' },
  anthropic: { name: 'Anthropic', description: 'Claude API', icon: '🧠', category: 'ai' },
  stripe: { name: 'Stripe', description: 'Payment processing', icon: '💳', category: 'payment' },
  paypal: { name: 'PayPal', description: 'Online payments', icon: '💰', category: 'payment' },
  salesforce: { name: 'Salesforce', description: 'CRM platform', icon: '☁️', category: 'crm' },
  hubspot: { name: 'HubSpot', description: 'Marketing & CRM', icon: '🧲', category: 'crm' },
  zendesk: { name: 'Zendesk', description: 'Customer support', icon: '💬', category: 'communication' },
  twilio: { name: 'Twilio', description: 'SMS/Voice/Email', icon: '📞', category: 'communication' },
  sendgrid: { name: 'SendGrid', description: 'Email marketing', icon: '📧', category: 'marketing' },
  mailchimp: { name: 'Mailchimp', description: 'Email campaigns', icon: '🐵', category: 'marketing' },
  instagram: { name: 'Instagram', description: 'Social media', icon: '📸', category: 'social' },
  facebook: { name: 'Facebook', description: 'Social media', icon: '👤', category: 'social' },
  twitter: { name: 'Twitter/X', description: 'Social media', icon: '🐦', category: 'social' },
  linkedin: { name: 'LinkedIn', description: 'Professional network', icon: '💼', category: 'social' },
  tiktok: { name: 'TikTok', description: 'Social media', icon: '🎵', category: 'social' },
  dropbox: { name: 'Dropbox', description: 'Cloud storage', icon: '📦', category: 'storage' },
  onedrive: { name: 'OneDrive', description: 'Microsoft cloud', icon: '☁️', category: 'storage' },
  box: { name: 'Box', description: 'Cloud storage', icon: '📦', category: 'storage' },
  google: { name: 'Google', description: 'Google services', icon: '🔵', category: 'productivity' },
  notion: { name: 'Notion', description: 'Productivity', icon: '📝', category: 'productivity' },
  airtable: { name: 'Airtable', description: 'Database/spreadsheet', icon: '📋', category: 'productivity' },
  trello: { name: 'Trello', description: 'Project management', icon: '📋', category: 'productivity' },
  github: { name: 'GitHub', description: 'Development', icon: '🐙', category: 'devops' },
  figma: { name: 'Figma', description: 'Design tool', icon: '🎨', category: 'devops' },
  slack: { name: 'Slack', description: 'Team communication', icon: '💬', category: 'communication' },
  discord: { name: 'Discord', description: 'Team communication', icon: '🎮', category: 'communication' },
  telegram: { name: 'Telegram', description: 'Messaging', icon: '✈️', category: 'communication' },
  whatsapp: { name: 'WhatsApp', description: 'Messaging', icon: '📱', category: 'communication' },
  custom: { name: 'Custom', description: 'Custom service', icon: '🔧', category: 'other' },
};

// Maps node type → credential type required by that node
export const NODE_CREDENTIAL_MAP: Partial<Record<string, CredentialType>> = {
  // AI
  openAI: 'openai', anthropic: 'anthropic', gemini: 'google',
  // Payment
  stripe: 'stripe', paypal: 'paypal',
  // CRM
  salesforce: 'salesforce', hubspot: 'hubspot', zendesk: 'zendesk',
  // Communication
  slack: 'slack', slackSendMessage: 'slack', slackUpdateMessage: 'slack', slackUploadFile: 'slack',
  discord: 'discord', discordSendMessage: 'discord', discordSendEmbed: 'discord', discordManageChannel: 'discord',
  telegram: 'telegram', telegramSendMessage: 'telegram', telegramSendPhoto: 'telegram', telegramBotCommand: 'telegram',
  twilio: 'twilio', twilioSendSMS: 'twilio', twilioReceiveSMS: 'twilio', twilioMakeCall: 'twilio', twilioSendWhatsApp: 'twilio',
  whatsapp: 'whatsapp', whatsappSendMessage: 'whatsapp', whatsappSendMedia: 'whatsapp', whatsappSendLocation: 'whatsapp',
  sendgrid: 'sendgrid', mailchimp: 'mailchimp',
  // Social
  instagram: 'instagram', instagramPost: 'instagram', instagramStory: 'instagram', instagramReels: 'instagram',
  facebook: 'facebook', facebookPost: 'facebook', facebookUploadPhoto: 'facebook', facebookPagePost: 'facebook',
  twitter: 'twitter', twitterTweet: 'twitter', twitterReply: 'twitter', twitterLike: 'twitter', twitterRetweet: 'twitter',
  linkedin: 'linkedin', linkedinPost: 'linkedin', linkedinShareArticle: 'linkedin', linkedinMessage: 'linkedin',
  tiktok: 'tiktok', tiktokUploadVideo: 'tiktok', tiktokGetVideoInfo: 'tiktok', tiktokGetUserInfo: 'tiktok',
  // Productivity
  googleSheets: 'google', googleDrive: 'google',
  notion: 'notion', airtable: 'airtable', trello: 'trello',
  // Storage
  dropbox: 'dropbox', onedrive: 'onedrive', box: 'box',
  // DevOps
  gitHub: 'github', figma: 'figma',
};

/**
 * Maps credential field keys → node config field keys where they differ (1:1 by default).
 * Used when applying a saved credential to a node's config.
 */
export const CREDENTIAL_FIELD_MAP: Partial<Record<CredentialType, Record<string, string>>> = {
  stripe: { secretKey: 'apiKey' },
};

/** Apply a stored credential's values to a node config patch object */
export function applyCredentialToConfig(
  credType: CredentialType,
  fields: Record<string, string>,
): Record<string, unknown> {
  const mapping = CREDENTIAL_FIELD_MAP[credType] ?? {};
  const patch: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    patch[mapping[key] ?? key] = value;
  }
  return patch;
}
