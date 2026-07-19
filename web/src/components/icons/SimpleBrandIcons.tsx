/**
 * SimpleBrandIcons - Icônes de marque populaires basées sur simple-icons.org
 *
 * Ce fichier fournit des composants React pré-configurés pour les marques les plus utilisées.
 * Chaque icône utilise les couleurs officielles de la marque.
 */

import React from 'react';
import { SimpleIcon } from './SimpleIcon';

// Taille par défaut pour les icônes de marque
const DEFAULT_SIZE = 20;
const DEFAULT_CLASS = "w-5 h-5";

/**
 * Icônes de paiement
 */
export const StripeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="stripe" className={DEFAULT_CLASS} {...props} />
);

export const PayPalIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="paypal" className={DEFAULT_CLASS} {...props} />
);

export const SquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="square" className={DEFAULT_CLASS} {...props} />
);

/**
 * Icônes e-commerce
 */
export const ShopifyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="shopify" className={DEFAULT_CLASS} {...props} />
);

export const WooCommerceIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="woocommerce" className={DEFAULT_CLASS} {...props} />
);

/**
 * Icônes CRM & Support
 */
export const SalesforceIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="salesforce" className={DEFAULT_CLASS} {...props} />
);

export const HubSpotIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="hubspot" className={DEFAULT_CLASS} {...props} />
);

export const ZendeskIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="zendesk" className={DEFAULT_CLASS} {...props} />
);

/**
 * Icônes communication
 */
export const TwilioIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="twilio" className={DEFAULT_CLASS} {...props} />
);

export const SendGridIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="sendgrid" className={DEFAULT_CLASS} {...props} />
);

export const MailchimpIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="mailchimp" className={DEFAULT_CLASS} {...props} />
);

export const SlackIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="slack" className={DEFAULT_CLASS} {...props} />
);

export const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="discord" className={DEFAULT_CLASS} {...props} />
);

/**
 * Icônes Productivity & Project Management
 */
export const AsanaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="asana" className={DEFAULT_CLASS} {...props} />
);

export const LinearIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="linear" className={DEFAULT_CLASS} {...props} />
);

/**
 * Icônes Cloud Storage
 */
export const DropboxIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="dropbox" className={DEFAULT_CLASS} {...props} />
);

export const OneDriveIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="onedrive" className={DEFAULT_CLASS} {...props} />
);

export const BoxIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="box" className={DEFAULT_CLASS} {...props} />
);

/**
 * Icônes AI & LLM
 */
export const OpenAIIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="openai" className={DEFAULT_CLASS} {...props} />
);

export const AnthropicIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="anthropic" className={DEFAULT_CLASS} {...props} />
);

export const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="google" className={DEFAULT_CLASS} {...props} />
);

export const GeminiIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="googlegemini" className={DEFAULT_CLASS} {...props} />
);

export const PerplexityIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="perplexity" className={DEFAULT_CLASS} {...props} />
);

/**
 * Icônes Dev & Design
 */
export const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="github" className={DEFAULT_CLASS} {...props} />
);

export const FigmaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="figma" className={DEFAULT_CLASS} {...props} />
);

/**
 * Icônes Google
 */
export const GoogleSheetsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="googlesheets" className={DEFAULT_CLASS} {...props} />
);

export const GoogleDriveIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="googledrive" className={DEFAULT_CLASS} {...props} />
);

/**
 * Icônes Bases de données
 */
export const PostgreSQLIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="postgresql" className={DEFAULT_CLASS} {...props} />
);

export const MongoDBIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="mongodb" className={DEFAULT_CLASS} {...props} />
);

export const RedisIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="redis" className={DEFAULT_CLASS} {...props} />
);

export const SupabaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="supabase" className={DEFAULT_CLASS} {...props} />
);

export const FirebaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="firebase" className={DEFAULT_CLASS} {...props} />
);

export const SQLiteIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="sqlite" className={DEFAULT_CLASS} {...props} />
);

/**
 * Icônes Social Media
 */
export const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="instagram" className={DEFAULT_CLASS} {...props} />
);

export const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="facebook" className={DEFAULT_CLASS} {...props} />
);

export const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="x" className={DEFAULT_CLASS} {...props} />
);

export const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="linkedin" className={DEFAULT_CLASS} {...props} />
);

export const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="tiktok" className={DEFAULT_CLASS} {...props} />
);

export const TwitchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="twitch" className={DEFAULT_CLASS} {...props} />
);

export const YouTubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="youtube" className={DEFAULT_CLASS} {...props} />
);

export const SnapchatIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="snapchat" className={DEFAULT_CLASS} {...props} />
);

export const KickIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="kick" className={DEFAULT_CLASS} {...props} />
);

/**
 * Autres services populaires
 */
export const AirtableIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="airtable" className={DEFAULT_CLASS} {...props} />
);

export const NotionIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="notion" className={DEFAULT_CLASS} {...props} />
);

export const TrelloIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="trello" className={DEFAULT_CLASS} {...props} />
);

export const S3Icon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="amazonaws" className={DEFAULT_CLASS} {...props} />
);

/**
 * Icônes AI/LLM additionnelles
 */
export const GLMIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="zhipuai" className={DEFAULT_CLASS} {...props} />
);

export const OpenRouterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="openrouter" className={DEFAULT_CLASS} {...props} />
);

export const OllamaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SimpleIcon name="ollama" className={DEFAULT_CLASS} {...props} />
);
