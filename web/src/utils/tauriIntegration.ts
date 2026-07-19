/**
 * Intégration Tauri - Script pour la communication avec l'app desktop
 * Envoie les mises à jour d'URL au parent via postMessage
 */

export function initTauriIntegration() {
  // Vérifier si on est dans une iframe Tauri
  const isInIframe = window.self !== window.top;

  if (!isInIframe) {
    console.log('[Tauri Integration] Not in iframe, skipping integration');
    return;
  }

  console.log('[Tauri Integration] Initializing in iframe mode');

  // Fonction pour envoyer l'URL actuelle au parent
  const sendUrlUpdate = () => {
    try {
      const currentUrl = window.location.href;

      window.parent.postMessage({
        type: 'LOGICAI_URL_UPDATE',
        url: currentUrl
      }, '*');

      console.log('[Tauri Integration] URL update sent:', currentUrl);
    } catch (error) {
      console.error('[Tauri Integration] Error sending URL update:', error);
    }
  };

  // Envoyer l'URL initiale
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(sendUrlUpdate, 100);
    });
  } else {
    setTimeout(sendUrlUpdate, 100);
  }

  // Surveiller les changements d'URL (navigation)
  let lastUrl = window.location.href;

  // Surveiller les changements de hash et d'URL
  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      sendUrlUpdate();
    }
  });

  // Observer le document pour les changements
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Surveiller les événements de navigation
  window.addEventListener('popstate', () => {
    console.log('[Tauri Integration] popstate detected');
    sendUrlUpdate();
  });

  // Surveiller les clics sur les liens internes
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');

    if (link && link.href && link.origin === window.location.origin) {
      // Petit délai pour laisser la navigation se faire
      setTimeout(() => {
        if (window.location.href !== lastUrl) {
          sendUrlUpdate();
        }
      }, 200);
    }
  }, true);

  // Envoyer périodiquement pour être sûr de ne pas manquer de changements
  setInterval(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      sendUrlUpdate();
    }
  }, 1000);

  console.log('[Tauri Integration] URL tracking initialized');
}
