/**
 * Configuration de base de données dynamique pour l'isolation des instances
 * Chaque instance LogicAI-N8N aura sa propre base de données SQLite
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export interface DatabaseConfig {
  url: string;
}

// Cache des clients Prisma pour éviter de créer plusieurs instances
const prismaCache = new Map<string, PrismaClient>();

/**
 * Initialise la base de données pour une instance (crée le fichier et applique les migrations)
 * @param instanceId - L'ID de l'instance
 * @param databasePath - Le chemin absolu du fichier de base de données
 */
async function initializeDatabaseForInstance(instanceId: string, databasePath: string): Promise<void> {
  const dbDir = path.dirname(databasePath);
  
  // Créer le dossier s'il n'existe pas
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`📁 Created database directory: ${dbDir}`);
  }

  // Si la base de données n'existe pas, l'initialiser
  if (!fs.existsSync(databasePath)) {
    console.log(`🔧 Initializing database for instance ${instanceId} at ${databasePath}...`);
    
    try {
      // Créer le fichier de base de données vide
      fs.writeFileSync(databasePath, '');
      
      // Appliquer les migrations Prisma
      const databaseUrl = `file:${databasePath}`;
      process.env.DATABASE_URL = databaseUrl;
      
      console.log(`📦 Pushing database schema for ${instanceId}...`);
      execSync('npx prisma db push --skip-generate', {
        stdio: 'inherit',
        cwd: path.join(__dirname, '../../'),
        env: { ...process.env, DATABASE_URL: databaseUrl }
      });
      
      console.log(`✅ Database initialized successfully for instance ${instanceId}`);
    } catch (error) {
      console.error(`❌ Failed to initialize database for instance ${instanceId}:`, error);
      throw error;
    }
  }
}

/**
 * Récupère la configuration de la base de données pour une instance spécifique
 * @param instanceId - L'ID de l'instance
 * @returns Un client Prisma configuré pour cette instance
 */
export function getDatabaseForInstance(instanceId: string): PrismaClient {
  // Vérifier si un client existe déjà pour cette instance
  if (prismaCache.has(instanceId)) {
    return prismaCache.get(instanceId)!;
  }

  // Déterminer le chemin de la base de données
  let databasePath: string;
  
  // En développement local, utiliser le dossier du projet
  if (process.env.NODE_ENV === 'development' || !process.env.INSTANCE_ID) {
    const projectRoot = path.join(__dirname, '../../');
    databasePath = path.join(projectRoot, 'prisma', `instance-${instanceId}.db`);
  } else {
    // En production (Docker), utiliser /app/data
    databasePath = `/app/data/instance-${instanceId}.db`;
  }

  console.log(`📊 Database path for instance ${instanceId}: ${databasePath}`);

  // Initialiser la base de données si nécessaire
  try {
    initializeDatabaseForInstance(instanceId, databasePath).catch(err => {
      console.error('Failed to initialize database:', err);
    });
  } catch (error) {
    console.warn('Warning during database initialization:', error);
  }

  // URL de la base de données spécifique à cette instance
  const databaseUrl = `file:${databasePath}`;

  // Créer un nouveau client Prisma avec l'URL de base de données spécifique
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  // Mettre en cache le client
  prismaCache.set(instanceId, prisma);

  return prisma;
}

/**
 * Ferme toutes les connexions Prisma en cache (utile pour le shutdown)
 */
export async function closeAllConnections(): Promise<void> {
  const disconnectPromises = Array.from(prismaCache.values()).map(
    (prisma) => prisma.$disconnect()
  );

  await Promise.all(disconnectPromises);
  prismaCache.clear();
}
