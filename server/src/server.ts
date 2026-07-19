import 'dotenv/config';
import createApp from './app';
import databaseService from './services/databaseService';
import { initCollaborationServer } from './websocket/collaborationServer';
import { restoreRunningDatabases } from './services/localDbService';
import { createServer } from 'http';

const PORT = process.env.PORT || 3001;

/**
 * Start server
 */
async function startServer() {
  try {
    // Check database connection
    console.log('Checking database connection...');
    const isConnected = await databaseService.checkConnection();

    if (!isConnected) {
      console.error('Failed to connect to database');
      process.exit(1);
    }

    console.log('Database connected successfully');

    // Create Express app
    const app = createApp();

    // Create HTTP server for WebSocket
    const server = createServer(app);

    // Initialize WebSocket server (attaches to HTTP server)
    initCollaborationServer(server);

    // Restore any databases that were running before the last restart
    restoreRunningDatabases().catch((err) =>
      console.error('[localDb] restore error:', err),
    );

    // Start listening
    server.listen(PORT, () => {
      console.log(`\n🚀 LogicAI-N8N Server running on port ${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/health`);
      console.log(`   API base URL: http://localhost:${PORT}/api`);
      console.log(`   Webhook base URL: http://localhost:${PORT}/webhook/:workflowId`);
      console.log(`   WebSocket server: ws://localhost:${PORT}/ws\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await databaseService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await databaseService.disconnect();
  process.exit(0);
});

// Start server
startServer();
