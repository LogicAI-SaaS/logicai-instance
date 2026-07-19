/**
 * InstanceAuthProvider - Component pour gérer l'auth automatique depuis l'app Tauri
 *
 * Ce composant écoute les messages postMessage de la fenêtre parent (app Tauri)
 * et stocke automatiquement le token d'authentification dans localStorage.
 */

import { useEffect } from 'react';
import { localApiRequest } from '../../config/api';

interface InstanceAuthTokenMessage {
  type: 'LOGICAI_INSTANCE_AUTH';
  token: string;
}

export function InstanceAuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Vérifier le type de message
      if (event.data && event.data.type === 'LOGICAI_INSTANCE_AUTH') {
        const message = event.data as InstanceAuthTokenMessage;

        console.log('[Instance Auth] Received auth token from parent window');

        // Stocker le token dans localStorage
        localStorage.setItem('auth_token', message.token);

        console.log('[Instance Auth] Token stored in localStorage');

        // Récupérer les infos utilisateur depuis l'API
        try {
          const response = await localApiRequest('/api/auth/me');
          const data = await response.json();

          if (data.success && data.data.user) {
            // Stocker les infos utilisateur
            localStorage.setItem('auth_user', JSON.stringify(data.data.user));
            console.log('[Instance Auth] User data stored:', data.data.user);
          }
        } catch (error) {
          console.error('[Instance Auth] Error fetching user profile:', error);
          // Même en cas d'erreur, on continue avec le token
        }

        // Recharger la page pour appliquer le token
        // Cela va déclencher une re-render avec le nouveau token
        window.location.reload();
      }
    };

    // Écouter les messages de la fenêtre parent
    window.addEventListener('message', handleMessage);

    console.log('[Instance Auth] Message listener registered');

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return <>{children}</>;
}
