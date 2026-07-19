import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import workflowRoutes from './routes/workflows';
import webhookRoutes from './routes/webhooks';
import authRoutes from './routes/auth';
import formsRoutes from './routes/forms';
import chatRoutes from './routes/chat';
import ftpRoutes from './routes/ftp';
import systemRoutes from './routes/system';
import localDbRoutes from './routes/localDatabases';
import membersRoutes from './routes/members';

export function createApp(): Application {
  const app = express();

  // Middleware
  const externalPort = process.env.EXTERNAL_PORT || '3000';
  app.use(cors({
    origin: [
      `http://localhost:${externalPort}`,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5681',
    ],
    credentials: true,
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static frontend files
  app.use(express.static(path.join(__dirname, '../../public')));

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/workflows', workflowRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/forms', formsRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/ftp', ftpRoutes);
  app.use('/api/system', systemRoutes);
  app.use('/api/local-databases', localDbRoutes);
  app.use('/api/members', membersRoutes);
  app.use('/webhook', webhookRoutes);

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    // Don't intercept API routes
    if (req.path.startsWith('/api') || req.path.startsWith('/webhook')) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
      });
    }
    res.sendFile(path.join(__dirname, '../../public/index.html'));
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Not found',
    });
  });

  // Error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal server error',
    });
  });

  return app;
}

export default createApp;
