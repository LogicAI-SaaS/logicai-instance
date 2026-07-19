#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'locales');

const newKeys = {
  fr: {
    changelogDate: 'Mars 2026',
    changelogC1: 'Nœud If avec constructeur de conditions avancé',
    changelogC2: 'Sorties True / False colorées sur le canvas',
    changelogC3: 'Support SFTP/FTP avec navigateur de dossiers intégré',
    changelogC4: 'Notes Markdown affichées directement sur le canvas',
    changelogC5: 'Onglet Paramètres dans chaque nœud (Execute Once, Retry…)',
    changelogC6: 'Panneau Aide & Mises à jour',
    changelogC7: 'Correction authentification JWT pour les routes FTP/SFTP',
  },
  en: {
    changelogDate: 'March 2026',
    changelogC1: 'If node with advanced condition builder',
    changelogC2: 'True / False outputs colored on the canvas',
    changelogC3: 'SFTP/FTP support with built-in folder browser',
    changelogC4: 'Markdown notes displayed directly on the canvas',
    changelogC5: 'Settings tab in each node (Execute Once, Retry…)',
    changelogC6: 'Help & Updates panel',
    changelogC7: 'Fix JWT authentication for FTP/SFTP routes',
  },
  es: {
    changelogDate: 'Marzo 2026',
    changelogC1: 'Nodo If con constructor de condiciones avanzado',
    changelogC2: 'Salidas True / False coloreadas en el canvas',
    changelogC3: 'Soporte SFTP/FTP con explorador de carpetas integrado',
    changelogC4: 'Notas Markdown mostradas directamente en el canvas',
    changelogC5: 'Pestaña Configuración en cada nodo (Execute Once, Retry…)',
    changelogC6: 'Panel Ayuda & Actualizaciones',
    changelogC7: 'Corrección autenticación JWT para rutas FTP/SFTP',
  },
  it: {
    changelogDate: 'Marzo 2026',
    changelogC1: 'Nodo If con costruttore di condizioni avanzato',
    changelogC2: 'Uscite True / False colorate sul canvas',
    changelogC3: 'Supporto SFTP/FTP con browser di cartelle integrato',
    changelogC4: 'Note Markdown visualizzate direttamente sul canvas',
    changelogC5: 'Scheda Impostazioni in ogni nodo (Execute Once, Retry…)',
    changelogC6: 'Pannello Guida & Aggiornamenti',
    changelogC7: 'Correzione autenticazione JWT per le route FTP/SFTP',
  },
  de: {
    changelogDate: 'März 2026',
    changelogC1: 'If-Knoten mit erweitertem Bedingungsersteller',
    changelogC2: 'True/False-Ausgaben farbig auf dem Canvas',
    changelogC3: 'SFTP/FTP-Unterstützung mit integriertem Ordner-Browser',
    changelogC4: 'Markdown-Notizen direkt auf dem Canvas angezeigt',
    changelogC5: 'Einstellungs-Tab in jedem Knoten (Execute Once, Retry…)',
    changelogC6: 'Hilfe & Updates-Panel',
    changelogC7: 'JWT-Authentifizierungsfehler für FTP/SFTP-Routen behoben',
  },
  pt: {
    changelogDate: 'Março 2026',
    changelogC1: 'Nó If com construtor de condições avançado',
    changelogC2: 'Saídas True / False coloridas no canvas',
    changelogC3: 'Suporte SFTP/FTP com navegador de pastas integrado',
    changelogC4: 'Notas Markdown exibidas diretamente no canvas',
    changelogC5: 'Aba Configurações em cada nó (Execute Once, Retry…)',
    changelogC6: 'Painel Ajuda & Atualizações',
    changelogC7: 'Correção autenticação JWT para rotas FTP/SFTP',
  },
};

for (const [lang, keys] of Object.entries(newKeys)) {
  const filePath = path.join(localesDir, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!data.help) data.help = {};
  for (const [k, v] of Object.entries(keys)) {
    if (!data.help[k]) {
      data.help[k] = v;
      console.log(`[${lang}] Added help.${k}`);
    } else {
      console.log(`[${lang}] Skipped help.${k} (already exists)`);
    }
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

console.log('Done!');
