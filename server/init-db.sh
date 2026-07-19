#!/bin/sh
set -e

echo "Checking database..."

# Créer la base de données si elle n'existe pas
if [ ! -f /app/data/dev.db ]; then
    echo "Database not found. Initializing..."
    npx prisma db push --skip-generate
    echo "Database initialized successfully!"
else
    echo "Database already exists."
fi

echo "Starting LogicAI-N8N server..."
exec npx tsx src/server.ts
