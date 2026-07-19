#!/bin/sh
set -e

# Script de démarrage de l'instance LogicAI (conteneur Docker).
cd /app/server

echo "==> Initialisation de la base de données (prisma db push)..."
npx prisma db push --skip-generate || echo "(db push ignoré — base déjà à jour)"

echo "==> Démarrage du serveur LogicAI sur le port ${PORT:-3000}..."
exec npx tsx src/server.ts
