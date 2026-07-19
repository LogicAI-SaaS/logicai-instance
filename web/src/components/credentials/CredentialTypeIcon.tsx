/**
 * Credential Type Icons
 *
 * Returns the appropriate icon for each credential type
 */

import React from 'react';
import {
  Key,
  Lock,
  Shield,
  Database,
  Globe,
  Cloud,
  Code,
  Mail,
  MessageSquare,
  FileText,
} from 'lucide-react';

export interface CredentialTypeIconProps {
  type: string;
  className?: string;
}

const ICONS: Record<string, React.FC<{ className?: string }>> = {
  apiKey: Key,
  basicAuth: Lock,
  oauth1: Shield,
  oauth2: Shield,
  awsSignature: Cloud,
  digestAuth: Lock,
  headerAuth: Lock,
  queryAuth: Key,

  // Service-specific
  http: Globe,
  google: Cloud,
  slack: MessageSquare,
  discord: MessageSquare,
  mongodb: Database,
  smtp: Mail,
  imap: Mail,
  github: Code,
  openai: Code,
  notion: FileText,
};

export const CredentialTypeIcon: React.FC<CredentialTypeIconProps> = ({ type, className = 'w-5 h-5' }) => {
  const IconComponent = ICONS[type] || Key;

  return <IconComponent className={className} />;
};

export default CredentialTypeIcon;
