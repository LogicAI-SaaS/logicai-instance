// Script to add modal.* section to all locale files
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'locales');

const modalSections = {
  fr: {
    dbconn: {
      noDbsFound: "Aucune base de données enregistrée pour ce moteur.",
      newDb: "Nouvelle base de données"
    },
    formBuilder: {
      preview: "Aperçu",
      previewTitle: "Aperçu du formulaire",
      addField: "Ajouter",
      noFields: "Aucun champ",
      nameKey: "Nom (clé JSON)",
      optionsLabel: "Options (séparées par virgule)",
      helpPlaceholder: "Aide contextuelle affichée sous le champ",
      descriptionLabel: "Description (optionnel)"
    },
    node: {
      preview: "Aperçu",
      dropToInsert: "Relâchez pour insérer",
      executed: "● Exécuté",
      notExecuted: "Non exécuté",
      inputsSection: "Entrées (Input)",
      noNodeConnected: "Aucun nœud connecté",
      connectNodes: "Connectez des nœuds pour voir leurs données",
      realDataAvailable: "Données réelles disponibles",
      selectedNode: "Nœud Sélectionné",
      realData: "Données réelles",
      sampleData: "Données sample",
      dragHint: "💡 Développez les objets et glissez les variables dans les champs",
      outputSection: "Données de Sortie",
      lastExecution: "✓ Dernière exécution",
      enabled: "✓ Activé",
      disabled: "Désactivé",
      outputReceiveHint: "Ces nœuds recevront les données"
    },
    sql: {
      generatedSql: "SQL généré",
      configureQuery: "-- Configurez la requête ci-dessus"
    },
    toolbarNav: {
      title: "Actions du Workflow",
      sectionActions: "Actions Principales",
      save: "Sauvegarder",
      saveDesc: "Enregistrer le workflow",
      execute: "Exécuter",
      executeDesc: "Lancer le workflow",
      saveFirst: "Sauvegardez d'abord",
      activate: "Activer",
      deactivate: "Désactiver",
      activateDesc: "Activer le workflow",
      deactivateDesc: "Désactiver le workflow",
      sectionEdit: "Édition",
      deleteSelection: "Supprimer la sélection",
      deleteSelectionDesc: "Supprimer le nœud/edge sélectionné",
      sectionInfo: "Informations",
      statusLabel: "Statut",
      active: "Actif",
      inactive: "Inactif",
      idLabel: "ID",
      new: "Nouveau",
      shortcuts: "Raccourcis clavier",
      shortcutDelete: "Supprimer la sélection",
      shortcutMultiSelect: "Sélection multiple"
    }
  },
  en: {
    dbconn: {
      noDbsFound: "No databases registered for this engine.",
      newDb: "New Database"
    },
    formBuilder: {
      preview: "Preview",
      previewTitle: "Form Preview",
      addField: "Add",
      noFields: "No fields",
      nameKey: "Name (JSON key)",
      optionsLabel: "Options (comma separated)",
      helpPlaceholder: "Contextual help displayed below the field",
      descriptionLabel: "Description (optional)"
    },
    node: {
      preview: "Preview",
      dropToInsert: "Drop to insert",
      executed: "● Executed",
      notExecuted: "Not executed",
      inputsSection: "Inputs",
      noNodeConnected: "No node connected",
      connectNodes: "Connect nodes to see their data",
      realDataAvailable: "Real data available",
      selectedNode: "Selected Node",
      realData: "Real data",
      sampleData: "Sample data",
      dragHint: "💡 Expand objects and drag variables into fields",
      outputSection: "Output Data",
      lastExecution: "✓ Last execution",
      enabled: "✓ Enabled",
      disabled: "Disabled",
      outputReceiveHint: "These nodes will receive the data"
    },
    sql: {
      generatedSql: "Generated SQL",
      configureQuery: "-- Configure the query above"
    },
    toolbarNav: {
      title: "Workflow Actions",
      sectionActions: "Main Actions",
      save: "Save",
      saveDesc: "Save workflow",
      execute: "Execute",
      executeDesc: "Run the workflow",
      saveFirst: "Save first",
      activate: "Activate",
      deactivate: "Deactivate",
      activateDesc: "Activate workflow",
      deactivateDesc: "Deactivate workflow",
      sectionEdit: "Edit",
      deleteSelection: "Delete selection",
      deleteSelectionDesc: "Delete selected node/edge",
      sectionInfo: "Information",
      statusLabel: "Status",
      active: "Active",
      inactive: "Inactive",
      idLabel: "ID",
      new: "New",
      shortcuts: "Keyboard shortcuts",
      shortcutDelete: "Delete selection",
      shortcutMultiSelect: "Multi-select"
    }
  },
  es: {
    dbconn: {
      noDbsFound: "No hay bases de datos registradas para este motor.",
      newDb: "Nueva base de datos"
    },
    formBuilder: {
      preview: "Vista previa",
      previewTitle: "Vista previa del formulario",
      addField: "Agregar",
      noFields: "Sin campos",
      nameKey: "Nombre (clave JSON)",
      optionsLabel: "Opciones (separadas por coma)",
      helpPlaceholder: "Ayuda contextual mostrada bajo el campo",
      descriptionLabel: "Descripción (opcional)"
    },
    node: {
      preview: "Vista previa",
      dropToInsert: "Soltar para insertar",
      executed: "● Ejecutado",
      notExecuted: "No ejecutado",
      inputsSection: "Entradas (Input)",
      noNodeConnected: "Ningún nodo conectado",
      connectNodes: "Conecte nodos para ver sus datos",
      realDataAvailable: "Datos reales disponibles",
      selectedNode: "Nodo Seleccionado",
      realData: "Datos reales",
      sampleData: "Datos de ejemplo",
      dragHint: "💡 Expanda los objetos y arrastre las variables a los campos",
      outputSection: "Datos de salida",
      lastExecution: "✓ Última ejecución",
      enabled: "✓ Activado",
      disabled: "Desactivado",
      outputReceiveHint: "Estos nodos recibirán los datos"
    },
    sql: {
      generatedSql: "SQL generado",
      configureQuery: "-- Configure la consulta arriba"
    },
    toolbarNav: {
      title: "Acciones del Workflow",
      sectionActions: "Acciones Principales",
      save: "Guardar",
      saveDesc: "Guardar workflow",
      execute: "Ejecutar",
      executeDesc: "Ejecutar el workflow",
      saveFirst: "Guarde primero",
      activate: "Activar",
      deactivate: "Desactivar",
      activateDesc: "Activar workflow",
      deactivateDesc: "Desactivar workflow",
      sectionEdit: "Edición",
      deleteSelection: "Eliminar selección",
      deleteSelectionDesc: "Eliminar nodo/enlace seleccionado",
      sectionInfo: "Información",
      statusLabel: "Estado",
      active: "Activo",
      inactive: "Inactivo",
      idLabel: "ID",
      new: "Nuevo",
      shortcuts: "Atajos de teclado",
      shortcutDelete: "Eliminar selección",
      shortcutMultiSelect: "Selección múltiple"
    }
  },
  de: {
    dbconn: {
      noDbsFound: "Keine Datenbanken für diese Engine registriert.",
      newDb: "Neue Datenbank"
    },
    formBuilder: {
      preview: "Vorschau",
      previewTitle: "Formularvorschau",
      addField: "Hinzufügen",
      noFields: "Keine Felder",
      nameKey: "Name (JSON-Schlüssel)",
      optionsLabel: "Optionen (durch Komma getrennt)",
      helpPlaceholder: "Kontexthilfe unter dem Feld angezeigt",
      descriptionLabel: "Beschreibung (optional)"
    },
    node: {
      preview: "Vorschau",
      dropToInsert: "Loslassen zum Einfügen",
      executed: "● Ausgeführt",
      notExecuted: "Nicht ausgeführt",
      inputsSection: "Eingaben (Input)",
      noNodeConnected: "Kein Knoten verbunden",
      connectNodes: "Knoten verbinden, um Daten zu sehen",
      realDataAvailable: "Echte Daten verfügbar",
      selectedNode: "Ausgewählter Knoten",
      realData: "Echte Daten",
      sampleData: "Beispieldaten",
      dragHint: "💡 Objekte aufklappen und Variablen in Felder ziehen",
      outputSection: "Ausgabedaten",
      lastExecution: "✓ Letzte Ausführung",
      enabled: "✓ Aktiviert",
      disabled: "Deaktiviert",
      outputReceiveHint: "Diese Knoten erhalten die Daten"
    },
    sql: {
      generatedSql: "Generiertes SQL",
      configureQuery: "-- Abfrage oben konfigurieren"
    },
    toolbarNav: {
      title: "Workflow-Aktionen",
      sectionActions: "Hauptaktionen",
      save: "Speichern",
      saveDesc: "Workflow speichern",
      execute: "Ausführen",
      executeDesc: "Workflow ausführen",
      saveFirst: "Zuerst speichern",
      activate: "Aktivieren",
      deactivate: "Deaktivieren",
      activateDesc: "Workflow aktivieren",
      deactivateDesc: "Workflow deaktivieren",
      sectionEdit: "Bearbeiten",
      deleteSelection: "Auswahl löschen",
      deleteSelectionDesc: "Ausgewählten Knoten/Kante löschen",
      sectionInfo: "Informationen",
      statusLabel: "Status",
      active: "Aktiv",
      inactive: "Inaktiv",
      idLabel: "ID",
      new: "Neu",
      shortcuts: "Tastenkürzel",
      shortcutDelete: "Auswahl löschen",
      shortcutMultiSelect: "Mehrfachauswahl"
    }
  },
  it: {
    dbconn: {
      noDbsFound: "Nessun database registrato per questo motore.",
      newDb: "Nuovo database"
    },
    formBuilder: {
      preview: "Anteprima",
      previewTitle: "Anteprima del modulo",
      addField: "Aggiungi",
      noFields: "Nessun campo",
      nameKey: "Nome (chiave JSON)",
      optionsLabel: "Opzioni (separate da virgola)",
      helpPlaceholder: "Aiuto contestuale mostrato sotto il campo",
      descriptionLabel: "Descrizione (opzionale)"
    },
    node: {
      preview: "Anteprima",
      dropToInsert: "Rilascia per inserire",
      executed: "● Eseguito",
      notExecuted: "Non eseguito",
      inputsSection: "Ingressi (Input)",
      noNodeConnected: "Nessun nodo connesso",
      connectNodes: "Connetti nodi per vedere i loro dati",
      realDataAvailable: "Dati reali disponibili",
      selectedNode: "Nodo Selezionato",
      realData: "Dati reali",
      sampleData: "Dati di esempio",
      dragHint: "💡 Espandi gli oggetti e trascina le variabili nei campi",
      outputSection: "Dati di Uscita",
      lastExecution: "✓ Ultima esecuzione",
      enabled: "✓ Abilitato",
      disabled: "Disabilitato",
      outputReceiveHint: "Questi nodi riceveranno i dati"
    },
    sql: {
      generatedSql: "SQL generato",
      configureQuery: "-- Configura la query sopra"
    },
    toolbarNav: {
      title: "Azioni Workflow",
      sectionActions: "Azioni Principali",
      save: "Salva",
      saveDesc: "Salva workflow",
      execute: "Esegui",
      executeDesc: "Esegui il workflow",
      saveFirst: "Salva prima",
      activate: "Attiva",
      deactivate: "Disattiva",
      activateDesc: "Attiva workflow",
      deactivateDesc: "Disattiva workflow",
      sectionEdit: "Modifica",
      deleteSelection: "Elimina selezione",
      deleteSelectionDesc: "Elimina nodo/arco selezionato",
      sectionInfo: "Informazioni",
      statusLabel: "Stato",
      active: "Attivo",
      inactive: "Inattivo",
      idLabel: "ID",
      new: "Nuovo",
      shortcuts: "Scorciatoie tastiera",
      shortcutDelete: "Elimina selezione",
      shortcutMultiSelect: "Selezione multipla"
    }
  },
  pt: {
    dbconn: {
      noDbsFound: "Nenhum banco de dados registrado para este motor.",
      newDb: "Novo banco de dados"
    },
    formBuilder: {
      preview: "Pré-visualização",
      previewTitle: "Pré-visualização do formulário",
      addField: "Adicionar",
      noFields: "Nenhum campo",
      nameKey: "Nome (chave JSON)",
      optionsLabel: "Opções (separadas por vírgula)",
      helpPlaceholder: "Ajuda contextual exibida abaixo do campo",
      descriptionLabel: "Descrição (opcional)"
    },
    node: {
      preview: "Pré-visualização",
      dropToInsert: "Soltar para inserir",
      executed: "● Executado",
      notExecuted: "Não executado",
      inputsSection: "Entradas (Input)",
      noNodeConnected: "Nenhum nó conectado",
      connectNodes: "Conecte nós para ver seus dados",
      realDataAvailable: "Dados reais disponíveis",
      selectedNode: "Nó Selecionado",
      realData: "Dados reais",
      sampleData: "Dados de exemplo",
      dragHint: "💡 Expanda os objetos e arraste as variáveis para os campos",
      outputSection: "Dados de Saída",
      lastExecution: "✓ Última execução",
      enabled: "✓ Habilitado",
      disabled: "Desabilitado",
      outputReceiveHint: "Estes nós receberão os dados"
    },
    sql: {
      generatedSql: "SQL gerado",
      configureQuery: "-- Configure a consulta acima"
    },
    toolbarNav: {
      title: "Ações do Workflow",
      sectionActions: "Ações Principais",
      save: "Guardar",
      saveDesc: "Guardar workflow",
      execute: "Executar",
      executeDesc: "Executar o workflow",
      saveFirst: "Guarde primeiro",
      activate: "Ativar",
      deactivate: "Desativar",
      activateDesc: "Ativar workflow",
      deactivateDesc: "Desativar workflow",
      sectionEdit: "Editar",
      deleteSelection: "Excluir seleção",
      deleteSelectionDesc: "Excluir nó/aresta selecionado",
      sectionInfo: "Informações",
      statusLabel: "Estado",
      active: "Ativo",
      inactive: "Inativo",
      idLabel: "ID",
      new: "Novo",
      shortcuts: "Atalhos de teclado",
      shortcutDelete: "Excluir seleção",
      shortcutMultiSelect: "Seleção múltipla"
    }
  }
};

const locales = ['fr', 'en', 'es', 'de', 'it', 'pt'];

for (const locale of locales) {
  const filePath = path.join(localesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.modal = modalSections[locale];
  // Detect line ending
  const raw = fs.readFileSync(filePath, 'utf8');
  const lf = raw.indexOf('\r\n') === -1;
  const indent = '  ';
  let json = JSON.stringify(data, null, indent);
  if (!lf) {
    json = json.replace(/\n/g, '\r\n');
  }
  fs.writeFileSync(filePath, json, 'utf8');
  console.log(`${locale}: OK`);
}
