/**
 * Exemple d'utilisation des Simple Icons
 *
 * Ce fichier montre comment utiliser les nouvelles icônes de marque basées sur simple-icons.org
 */

import React from 'react';
import {
  GitHubIcon,
  GoogleIcon,
  StripeIcon,
  OpenAIIcon,
  DiscordIcon,
  SlackIcon,
} from './SimpleBrandIcons';
import { SimpleIcon } from './SimpleIcon';

export default function SimpleIconsExample() {
  return (
    <div className="p-8 space-y-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Exemples d'utilisation des Simple Icons</h1>

      {/* Exemple 1: Utilisation des composants pré-configurés */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">1. Composants pré-configurés (recommandé)</h2>
        <p className="text-gray-400">Utilisez les composants de BrandIcons pour les marques courantes :</p>

        <div className="flex gap-4 items-center p-4 bg-gray-800 rounded-lg">
          <GitHubIcon />
          <GoogleIcon />
          <StripeIcon />
          <OpenAIIcon />
          <DiscordIcon />
          <SlackIcon />
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <pre className="text-sm text-green-400">
{`import { GitHubIcon, GoogleIcon, StripeIcon } from './icons/SimpleBrandIcons';

<GitHubIcon />
<GoogleIcon />
<StripeIcon />`}
          </pre>
        </div>
      </section>

      {/* Exemple 2: Utilisation directe du composant SimpleIcon */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">2. Utilisation directe de SimpleIcon</h2>
        <p className="text-gray-400">Pour n'importe quelle icône sur simple-icons.org :</p>

        <div className="flex gap-4 items-center p-4 bg-gray-800 rounded-lg">
          <SimpleIcon name="github" className="w-6 h-6" />
          <SimpleIcon name="figma" className="w-6 h-6" />
          <SimpleIcon name="notion" className="w-6 h-6" />
          <SimpleIcon name="linear" className="w-6 h-6" />
          <SimpleIcon name="vercel" className="w-6 h-6" />
          <SimpleIcon name="react" className="w-6 h-6" />
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <pre className="text-sm text-green-400">
{`import { SimpleIcon } from './icons/SimpleIcon';

// Le nom doit être en kebab-case (ex: 'google-sheets', not 'GoogleSheets')
<SimpleIcon name="github" className="w-6 h-6" />
<SimpleIcon name="figma" className="w-6 h-6" />
<SimpleIcon name="notion" className="w-6 h-6" />`}
          </pre>
        </div>
      </section>

      {/* Exemple 3: Personnalisation */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">3. Personnalisation</h2>
        <p className="text-gray-400">Vous pouvez personnaliser la taille et la couleur :</p>

        <div className="flex gap-4 items-center p-4 bg-gray-800 rounded-lg">
          <SimpleIcon name="github" className="w-4 h-4" />
          <SimpleIcon name="github" className="w-6 h-6" />
          <SimpleIcon name="github" className="w-8 h-8" />
          <SimpleIcon name="github" className="w-6 h-6" color="#ffffff" />
          <SimpleIcon name="github" className="w-6 h-6" color="#ff6b6b" />
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <pre className="text-sm text-green-400">
{`// Taille personnalisée
<SimpleIcon name="github" size={32} />

// Couleur personnalisée
<SimpleIcon name="github" className="w-6 h-6" color="#ffffff" />

// Avec className
<SimpleIcon name="github" className="w-8 h-8 hover:scale-110 transition-transform" />`}
          </pre>
        </div>
      </section>

      {/* Exemple 4: Trouver le nom d'une icône */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">4. Trouver le nom d'une icône</h2>
        <p className="text-gray-400">
          Visitez{' '}
          <a
            href="https://simpleicons.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            simpleicons.org
          </a>{' '}
          et cherchez votre marque. Le nom de l'icône est en kebab-case :
        </p>

        <div className="bg-gray-800 p-4 rounded-lg space-y-2">
          <div className="flex items-center gap-3">
            <SimpleIcon name="google" className="w-5 h-5" />
            <code className="text-green-400">"google"</code>
            <span className="text-gray-400">→ Google</span>
          </div>
          <div className="flex items-center gap-3">
            <SimpleIcon name="google-sheets" className="w-5 h-5" />
            <code className="text-green-400">"google-sheets"</code>
            <span className="text-gray-400">→ Google Sheets</span>
          </div>
          <div className="flex items-center gap-3">
            <SimpleIcon name="amazonaws" className="w-5 h-5" />
            <code className="text-green-400">"amazonaws"</code>
            <span className="text-gray-400">→ Amazon AWS (S3)</span>
          </div>
          <div className="flex items-center gap-3">
            <SimpleIcon name="x" className="w-5 h-5" />
            <code className="text-green-400">"x"</code>
            <span className="text-gray-400">→ X (anciennement Twitter)</span>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">✨ Avantages de Simple Icons</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>🎨 <strong>Couleurs officielles</strong> : Chaque icône utilise la couleur de la marque</li>
          <li>📦 <strong>Léger</strong> : Que du SVG, pas de dépendances lourdes</li>
          <li>🔄 <strong>Mis à jour</strong> : Les icônes sont régulièrement mises à jour</li>
          <li>🌐 <strong>3000+ marques</strong> : Une immense collection d'icônes</li>
          <li>⚡ <strong>Performant</strong> : SVG inline, chargement instantané</li>
          <li>🎯 <strong>Consistent</strong> : Même style pour toutes les marques</li>
        </ul>
      </section>
    </div>
  );
}
