/**
 * Configuration de l'API pour le frontend LogicAI-N8N
 *
 * Architecture :
 * - API globale (serveur principal) : gère les utilisateurs (login/register)
 * - API locale (instance) : gère les workflows, nœuds, credentials
 */

// Récupérer l'URL de l'API globale depuis window (injecté par le template HTML)
// @ts-ignore - variable définie dans index.html
declare global {
  interface Window {
    GLOBAL_API_URL?: string;
  }
}

// URL de l'API globale pour l'authentification
const GLOBAL_API_URL = window.GLOBAL_API_URL || 'http://localhost:3000';

// URL de l'API locale pour les workflows
export const LOCAL_API_URL = import.meta.env.PROD
  ? ''  // Chemin relatif dans le conteneur
  : 'http://localhost:3001';  // Port de l'instance en dev

/**
 * Fonction utilitaire pour faire des requêtes à l'API globale (authentification)
 */
export async function globalApiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${GLOBAL_API_URL}${endpoint}`;

  // Ajouter le token si disponible
  const token = localStorage.getItem('auth_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Fonction utilitaire pour faire des requêtes à l'API locale (workflows)
 */
export async function localApiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${LOCAL_API_URL}${endpoint}`;

  // Ajouter le token si disponible
  const token = localStorage.getItem('auth_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

// Par défaut, utiliser l'API globale pour les requêtes auth
export const apiRequest = globalApiRequest;
