#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const localesDir = path.join(__dirname, 'locales');

const patch = {
  fr: 'Rechercher une langue…',
  en: 'Search language…',
  es: 'Buscar idioma…',
  it: 'Cerca lingua…',
  de: 'Sprache suchen…',
  pt: 'Pesquisar idioma…',
};

for (const [lang, searchLabel] of Object.entries(patch)) {
  const filePath = path.join(localesDir, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!data.language) data.language = {};
  if (!data.language.search) {
    data.language.search = searchLabel;
    console.log(`[${lang}] Added language.search`);
  } else {
    console.log(`[${lang}] Already has language.search`);
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}
console.log('Done!');
