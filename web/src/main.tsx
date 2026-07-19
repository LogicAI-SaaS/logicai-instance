import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.tsx'
import { initTauriIntegration } from './utils/tauriIntegration'

// Initialiser l'intégration Tauri si on est dans une iframe
initTauriIntegration()

createRoot(document.getElementById('root')!).render(
  React.createElement(React.StrictMode, null,
    React.createElement(App)
  )
)
