/**
 * Credential Types System - N8N-Style
 *
 * Supports multiple authentication methods:
 * - API Key (Header or Query Param)
 * - Basic Auth
 * - Bearer Token
 * - Digest Auth
 * - OAuth1
 * - OAuth2
 * - AWS Signature v4
 * - Custom Headers
 */

import { ICredentialDataDecryptedObject } from '../types';

/**
 * Authentication types supported
 */
export type AuthType =
  | 'apiKey'
  | 'basicAuth'
  | 'bearerToken'
  | 'digestAuth'
  | 'oAuth1'
  | 'oAuth2'
  | 'awsSignature'
  | 'customAuth'
  | 'none';

/**
 * OAuth2 grant types
 */
export type OAuth2GrantType =
  | 'authorizationCode'
  | 'implicit'
  | 'password'
  | 'clientCredentials'
  | 'deviceCode'
  | 'refreshToken';

/**
 * API Key credential configuration
 */
export interface APIKeyCredential {
  name: string;
  type: 'apiKey';
  data: {
    apiKey: string;
    authentication: 'header' | 'query' | 'genericCredentialType';
    name: string; // Header name or query param name (e.g., 'X-API-Key')
    value?: string; // If not using apiKey field
  };
}

/**
 * Basic Auth credential configuration
 */
export interface BasicAuthCredential {
  name: string;
  type: 'basicAuth';
  data: {
    user: string;
    password: string;
  };
}

/**
 * Bearer Token credential configuration
 */
export interface BearerTokenCredential {
  name: string;
  type: 'bearerToken';
  data: {
    token: string;
    prefix?: string; // Default: 'Bearer'
  };
}

/**
 * Digest Auth credential configuration
 */
export interface DigestAuthCredential {
  name: string;
  type: 'digestAuth';
  data: {
    user: string;
    password: string;
    realm?: string;
    algorithm?: 'MD5' | 'MD5-sess';
    qop?: 'auth' | 'auth-int';
  };
}

/**
 * OAuth1 credential configuration
 */
export interface OAuth1Credential {
  name: string;
  type: 'oAuth1';
  data: {
    consumerKey: string;
    consumerSecret: string;
    token?: string;
    tokenSecret?: string;
    signatureMethod?: 'HMAC-SHA1' | 'RSA-SHA1' | 'PLAINTEXT';
    realm?: string;
  };
}

/**
 * OAuth2 credential configuration
 */
export interface OAuth2Credential {
  name: string;
  type: 'oAuth2';
  data: {
    clientId: string;
    clientSecret: string;
    grantType: OAuth2GrantType;
    accessToken?: string;
    refreshToken?: string;
    tokenType?: string;
    expiresAt?: Date;
    scope?: string[];
    redirectUrl?: string;
    authUrl?: string;
    accessTokenUrl?: string;
  };
}

/**
 * AWS Signature v4 credential configuration
 */
export interface AWSSignatureCredential {
  name: string;
  type: 'awsSignature';
  data: {
    accessKeyId: string;
    secretAccessKey: string;
    region?: string;
    service?: string;
    sessionToken?: string;
  };
}

/**
 * Generic credential type
 */
export interface GenericCredentialType {
  name: string;
  type: 'genericCredentialType';
  data: Record<string, string>;
}

/**
 * Credential data (union of all types)
 */
export type CredentialData =
  | APIKeyCredential
  | BasicAuthCredential
  | BearerTokenCredential
  | DigestAuthCredential
  | OAuth1Credential
  | OAuth2Credential
  | AWSSignatureCredential
  | GenericCredentialType;

/**
 * Credential schema for validation
 */
export interface CredentialSchema {
  type: AuthType;
  displayName: string;
  name: string;
  properties: CredentialSchemaProperty[];
  documentationUrl?: string;
}

/**
 * Credential property schema
 */
export interface CredentialSchemaProperty {
  displayName: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
  required?: boolean; // Optional for backwards compatibility
  default?: any;
  placeholder?: string;
  description?: string;
  typeOptions?: {
    password?: boolean;
    rows?: number;
    options?: Array<{ name: string; value: any }>;
    minValue?: number;
    maxValue?: number;
  };
}

/**
 * All credential type schemas
 */
export const CREDENTIAL_TYPE_SCHEMAS: Record<AuthType, CredentialSchema> = {
  apiKey: {
    type: 'apiKey',
    displayName: 'API Key',
    name: 'apiKey',
    properties: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        required: true,
        placeholder: 'e.g., X-API-Key',
        description: 'The header or query parameter name',
      },
      {
        displayName: 'Value',
        name: 'apiKey',
        type: 'string',
        required: true,
        typeOptions: { password: true },
        placeholder: 'sk-...',
        description: 'The API key value',
      },
      {
        displayName: 'Authentication',
        name: 'authentication',
        type: 'select',
        required: true,
        default: 'header',
        typeOptions: {
          options: [
            { name: 'Generic Credential Type', value: 'genericCredentialType' },
            { name: 'Header Auth', value: 'header' },
            { name: 'Query Auth', value: 'query' },
          ],
        },
        description: 'Where to include the API key',
      },
    ],
  },

  basicAuth: {
    type: 'basicAuth',
    displayName: 'Basic Auth',
    name: 'basicAuth',
    properties: [
      {
        displayName: 'Username',
        name: 'user',
        type: 'string',
        required: true,
        placeholder: 'username',
      },
      {
        displayName: 'Password',
        name: 'password',
        type: 'string',
        required: true,
        typeOptions: { password: true },
        placeholder: 'password',
      },
    ],
  },

  bearerToken: {
    type: 'bearerToken',
    displayName: 'Bearer Token',
    name: 'bearerToken',
    properties: [
      {
        displayName: 'Token',
        name: 'token',
        type: 'string',
        required: true,
        typeOptions: { password: true },
        placeholder: 'eyJhbGciOiJIUzI1NiIs...',
      },
      {
        displayName: 'Prefix',
        name: 'prefix',
        type: 'string',
        default: 'Bearer',
        placeholder: 'Bearer',
        description: 'Token prefix (usually "Bearer")',
      },
    ],
  },

  digestAuth: {
    type: 'digestAuth',
    displayName: 'Digest Auth',
    name: 'digestAuth',
    properties: [
      {
        displayName: 'Username',
        name: 'user',
        type: 'string',
        required: true,
        placeholder: 'username',
      },
      {
        displayName: 'Password',
        name: 'password',
        type: 'string',
        required: true,
        typeOptions: { password: true },
        placeholder: 'password',
      },
      {
        displayName: 'Realm',
        name: 'realm',
        type: 'string',
        placeholder: 'realm',
      },
      {
        displayName: 'Algorithm',
        name: 'algorithm',
        type: 'select',
        default: 'MD5',
        typeOptions: {
          options: [
            { name: 'MD5', value: 'MD5' },
            { name: 'MD5-sess', value: 'MD5-sess' },
          ],
        },
      },
      {
        displayName: 'Quality of Protection',
        name: 'qop',
        type: 'select',
        typeOptions: {
          options: [
            { name: 'Auth', value: 'auth' },
            { name: 'Auth-Int', value: 'auth-int' },
          ],
        },
      },
    ],
  },

  oAuth1: {
    type: 'oAuth1',
    displayName: 'OAuth1',
    name: 'oAuth1',
    properties: [
      {
        displayName: 'Consumer Key',
        name: 'consumerKey',
        type: 'string',
        required: true,
        typeOptions: { password: true },
        placeholder: 'consumer key',
      },
      {
        displayName: 'Consumer Secret',
        name: 'consumerSecret',
        type: 'string',
        required: true,
        typeOptions: { password: true },
        placeholder: 'consumer secret',
      },
      {
        displayName: 'Token',
        name: 'token',
        type: 'string',
        typeOptions: { password: true },
        placeholder: 'access token',
      },
      {
        displayName: 'Token Secret',
        name: 'tokenSecret',
        type: 'string',
        typeOptions: { password: true },
        placeholder: 'access token secret',
      },
      {
        displayName: 'Signature Method',
        name: 'signatureMethod',
        type: 'select',
        default: 'HMAC-SHA1',
        typeOptions: {
          options: [
            { name: 'HMAC-SHA1', value: 'HMAC-SHA1' },
            { name: 'RSA-SHA1', value: 'RSA-SHA1' },
            { name: 'PLAINTEXT', value: 'PLAINTEXT' },
          ],
        },
      },
      {
        displayName: 'Realm',
        name: 'realm',
        type: 'string',
        placeholder: 'realm',
      },
    ],
  },

  oAuth2: {
    type: 'oAuth2',
    displayName: 'OAuth2',
    name: 'oAuth2',
    properties: [
      {
        displayName: 'Grant Type',
        name: 'grantType',
        type: 'select',
        required: true,
        default: 'authorizationCode',
        typeOptions: {
          options: [
            { name: 'Authorization Code', value: 'authorizationCode' },
            { name: 'Implicit', value: 'implicit' },
            { name: 'Password', value: 'password' },
            { name: 'Client Credentials', value: 'clientCredentials' },
            { name: 'Device Code', value: 'deviceCode' },
            { name: 'Refresh Token', value: 'refreshToken' },
          ],
        },
      },
      {
        displayName: 'Client ID',
        name: 'clientId',
        type: 'string',
        required: true,
        placeholder: 'client_id',
      },
      {
        displayName: 'Client Secret',
        name: 'clientSecret',
        type: 'string',
        required: true,
        typeOptions: { password: true },
        placeholder: 'client_secret',
      },
      {
        displayName: 'Authorization URL',
        name: 'authUrl',
        type: 'string',
        placeholder: 'https://api.example.com/oauth/authorize',
        description: 'OAuth2 authorization endpoint',
      },
      {
        displayName: 'Access Token URL',
        name: 'accessTokenUrl',
        type: 'string',
        placeholder: 'https://api.example.com/oauth/token',
        description: 'OAuth2 token endpoint',
      },
      {
        displayName: 'Scope',
        name: 'scope',
        type: 'string',
        placeholder: 'read write',
        description: 'OAuth2 scope (space-separated)',
      },
      {
        displayName: 'Authentication',
        name: 'authentication',
        type: 'select',
        default: 'body',
        typeOptions: {
          options: [
            { name: 'Body', value: 'body' },
            { name: 'Header', value: 'header' },
          ],
        },
      },
    ],
  },

  awsSignature: {
    type: 'awsSignature',
    displayName: 'AWS Signature v4',
    name: 'awsSignature',
    properties: [
      {
        displayName: 'Access Key ID',
        name: 'accessKeyId',
        type: 'string',
        required: true,
        placeholder: 'AKIAIOSFODNN7EXAMPLE',
      },
      {
        displayName: 'Secret Access Key',
        name: 'secretAccessKey',
        type: 'string',
        required: true,
        typeOptions: { password: true },
        placeholder: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      },
      {
        displayName: 'Region',
        name: 'region',
        type: 'select',
        default: 'us-east-1',
        typeOptions: {
          options: [
            { name: 'US East (N. Virginia)', value: 'us-east-1' },
            { name: 'US East (Ohio)', value: 'us-east-2' },
            { name: 'US West (Oregon)', value: 'us-west-2' },
            { name: 'EU (Ireland)', value: 'eu-west-1' },
            { name: 'EU (London)', value: 'eu-west-2' },
            { name: 'Asia Pacific (Tokyo)', value: 'ap-northeast-1' },
          ],
        },
      },
      {
        displayName: 'Service',
        name: 'service',
        type: 'string',
        default: 'execute-api',
        placeholder: 'execute-api',
        description: 'AWS service name',
      },
    ],
  },

  customAuth: {
    type: 'customAuth',
    displayName: 'Custom Auth',
    name: 'customAuth',
    properties: [],
    documentationUrl: 'https://docs.example.com/custom-auth',
  },

  none: {
    type: 'none',
    displayName: 'None',
    name: 'none',
    properties: [],
  },
};

/**
 * Service-specific credential configurations
 * Maps service names to their preferred credential types
 */
export const SERVICE_CREDENTIAL_MAPPING: Record<string, AuthType> = {
  // AI Services
  openai: 'apiKey',
  anthropic: 'apiKey',

  // Payment
  stripe: 'apiKey',
  paypal: 'oAuth2',
  square: 'oAuth2',

  // Communication
  slack: 'oAuth2',
  discord: 'apiKey',
  telegram: 'apiKey',

  // Email
  sendgrid: 'apiKey',
  mailgun: 'apiKey',

  // Cloud Storage
  googleDrive: 'oAuth2',
  dropbox: 'oAuth2',
  onedrive: 'oAuth2',

  // Productivity
  googleSheets: 'oAuth2',
  notion: 'oAuth2',
  trello: 'oAuth2',
  asana: 'oAuth2',

  // Social Media
  twitter: 'oAuth1',
  instagram: 'oAuth2',
  facebook: 'oAuth2',
  linkedin: 'oAuth2',

  // CRM
  salesforce: 'oAuth2',
  hubspot: 'apiKey',
  zendesk: 'oAuth2',

  // Version Control
  github: 'oAuth2',

  // AWS
  aws: 'awsSignature',

  // Databases (usually connection string)
  mysql: 'basicAuth',
  postgresql: 'basicAuth',
  mongodb: 'apiKey',
  redis: 'basicAuth',
};

/**
 * Get credential schema by type
 */
export function getCredentialSchema(authType: AuthType): CredentialSchema | undefined {
  return CREDENTIAL_TYPE_SCHEMAS[authType];
}

/**
 * Get default auth type for a service
 */
export function getDefaultAuthType(serviceName: string): AuthType {
  return SERVICE_CREDENTIAL_MAPPING[serviceName] || 'apiKey';
}

/**
 * Validate credential data against schema
 */
export function validateCredentialData(
  authType: AuthType,
  data: Record<string, any>
): { valid: boolean; errors: string[] } {
  const schema = getCredentialSchema(authType);
  if (!schema) {
    return { valid: false, errors: ['Unknown credential type'] };
  }

  const errors: string[] = [];

  for (const property of schema.properties) {
    if (property.required && !(property.name in data)) {
      errors.push(`Missing required property: ${property.displayName}`);
    }

    if (property.name in data) {
      const value = data[property.name];

      // Type validation
      if (property.type === 'string' && typeof value !== 'string') {
        errors.push(`${property.displayName} must be a string`);
      }

      if (property.type === 'number' && typeof value !== 'number') {
        errors.push(`${property.displayName} must be a number`);
      }

      if (property.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`${property.displayName} must be a boolean`);
      }

      // Value range validation
      if (property.typeOptions) {
        if (property.type === 'number' && typeof value === 'number') {
          if (property.typeOptions.minValue !== undefined && value < property.typeOptions.minValue) {
            errors.push(`${property.displayName} must be at least ${property.typeOptions.minValue}`);
          }
          if (property.typeOptions.maxValue !== undefined && value > property.typeOptions.maxValue) {
            errors.push(`${property.displayName} must be at most ${property.typeOptions.maxValue}`);
          }
        }

        // Select validation
        if (property.type === 'select' && property.typeOptions.options) {
          const validValues = property.typeOptions.options.map((opt) => opt.value);
          if (!validValues.includes(value)) {
            errors.push(`${property.displayName} must be one of: ${validValues.join(', ')}`);
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format credential data for HTTP request headers
 */
export function formatCredentialsForRequest(
  credential: ICredentialDataDecryptedObject
): Record<string, string> {
  const { type, data } = credential;

  switch (type) {
    case 'apiKey':
      if (data.authentication === 'header') {
        return {
          [data.name || 'Authorization']: data.apiKey || data.value || '',
        };
      }
      // Query params are handled separately
      return {};

    case 'basicAuth':
      const auth = Buffer.from(`${data.user}:${data.password}`).toString('base64');
      return {
        Authorization: `Basic ${auth}`,
      };

    case 'bearerToken':
      const prefix = data.prefix || 'Bearer';
      return {
        Authorization: `${prefix} ${data.token}`,
      };

    case 'oAuth2':
      return {
        Authorization: `Bearer ${data.accessToken}`,
      };

    case 'oAuth1':
      // OAuth1 requires request signing - this is handled by the request helper
      return {};

    default:
      return {};
  }
}
