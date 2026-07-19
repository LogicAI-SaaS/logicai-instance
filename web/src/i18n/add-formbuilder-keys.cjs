const fs = require('fs');
const path = require('path');
const base = 'c:/Users/samy7/Documents/GitHub/LandingPage/docker-instance/web/src/i18n/locales';

const extraKeys = {
  fr: {
    fieldCount_one: '{{count}} champ',
    fieldCount_other: '{{count}} champs',
    noFieldsStart: "Aucun champ \u2014 cliquez sur \u00abAjouter\u00bb pour commencer",
    typeLabel: 'Type de champ'
  },
  en: {
    fieldCount_one: '{{count}} field',
    fieldCount_other: '{{count}} fields',
    noFieldsStart: 'No fields \u2014 click \u00abAdd\u00bb to begin',
    typeLabel: 'Field type'
  },
  es: {
    fieldCount_one: '{{count}} campo',
    fieldCount_other: '{{count}} campos',
    noFieldsStart: 'Sin campos \u2014 haga clic en Agregar para comenzar',
    typeLabel: 'Tipo de campo'
  },
  de: {
    fieldCount_one: '{{count}} Feld',
    fieldCount_other: '{{count}} Felder',
    noFieldsStart: 'Keine Felder \u2014 klicken Sie auf Hinzuf\u00fcgen',
    typeLabel: 'Feldtyp'
  },
  it: {
    fieldCount_one: '{{count}} campo',
    fieldCount_other: '{{count}} campi',
    noFieldsStart: 'Nessun campo \u2014 clicca su Aggiungi per iniziare',
    typeLabel: 'Tipo di campo'
  },
  pt: {
    fieldCount_one: '{{count}} campo',
    fieldCount_other: '{{count}} campos',
    noFieldsStart: 'Nenhum campo \u2014 clique em Adicionar para come\u00e7ar',
    typeLabel: 'Tipo de campo'
  }
};

for (const locale of ['fr', 'en', 'es', 'de', 'it', 'pt']) {
  const f = path.join(base, locale + '.json');
  const raw = fs.readFileSync(f, 'utf8');
  const data = JSON.parse(raw);
  Object.assign(data.modal.formBuilder, extraKeys[locale]);
  const lf = raw.indexOf('\r\n') === -1;
  let json = JSON.stringify(data, null, '  ');
  if (!lf) json = json.replace(/\n/g, '\r\n');
  fs.writeFileSync(f, json, 'utf8');
  console.log(locale + ' OK');
}
