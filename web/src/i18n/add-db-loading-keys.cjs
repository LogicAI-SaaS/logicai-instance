#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'locales');

const newKeys = {
  fr: { loadingConnections: 'Chargement des connexions…', chooseTable: '— choisir une table —' },
  en: { loadingConnections: 'Loading connections…', chooseTable: '— choose a table —' },
  es: { loadingConnections: 'Cargando conexiones…', chooseTable: '— elegir una tabla —' },
  it: { loadingConnections: 'Caricamento connessioni…', chooseTable: '— scegliere una tabella —' },
  de: { loadingConnections: 'Verbindungen laden…', chooseTable: '— Tabelle auswählen —' },
  pt: { loadingConnections: 'A carregar conexões…', chooseTable: '— escolher uma tabela —' },
};

for (const [lang, keys] of Object.entries(newKeys)) {
  const filePath = path.join(localesDir, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!data.db) data.db = {};
  for (const [k, v] of Object.entries(keys)) {
    if (!data.db[k]) {
      data.db[k] = v;
      console.log(`[${lang}] Added db.${k}`);
    } else {
      console.log(`[${lang}] Skipped db.${k} (exists)`);
    }
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}
console.log('Done!');
