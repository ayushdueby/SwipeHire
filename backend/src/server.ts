import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from '@/lib/db';
import { initializeSocketIO } from '@/sockets';
import { errorHandler, notFound } from '@/middleware/errorHandler';
import { generalRateLimit, authRateLimit } from '@/middleware/rateLimit';

// Route imports
import authRouter from '@/routes/auth';
import { meRouter } from '@/routes/me';
import { jobsRouter } from '@/routes/jobs';
import { jobsMockRouter } from '@/routes/jobs.mock';
import { swipesRouter } from '@/routes/swipes';
import { matchesRouter } from '@/routes/matches';
import { orgsRouter } from '@/routes/orgs';
import { candidatesRouter } from '@/routes/candidates';
import { featuresRouter } from '@/routes/features';
import { messagesRouter } from '@/routes/messages';
import { reportsRouter } from '@/routes/reports';

// Environment variables
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    // Skip database for now - using in-memory mock
    console.log('✓ Using in-memory database for development');

    // Create Express app
    const app = express();
    const httpServer = createServer(app);

    // Initialize Socket.IO
    const io = initializeSocketIO(httpServer);

    // Make io available in routes via app.locals
    app.locals.io = io;

    // Security middleware
    app.use(helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false
    }));

    // CORS configuration
    app.use(cors({
      origin: CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Body parsing middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Trust proxy for rate limiting (when behind reverse proxy)
    app.set('trust proxy', 1);

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        version: '1.0.0'
      });
    });

    // API routes (ALL RATE LIMITING DISABLED FOR DEVELOPMENT)
    app.use('/api/v1/auth', authRouter);
    app.use('/api/v1/me', meRouter);
    app.use('/api/v1/jobs', jobsRouter);
    app.use('/api/v1/jobs2', jobsMockRouter);
    app.use('/api/v1/swipes', swipesRouter);
    app.use('/api/v1/matches', matchesRouter);
    app.use('/api/v1/messages', messagesRouter);
    app.use('/api/v1/reports', reportsRouter);
    app.use('/api/v1/orgs', orgsRouter);
    app.use('/api/v1/candidates', candidatesRouter);
    app.use('/api/v1/features', featuresRouter);

    // Catch 404 and forward to error handler
    app.use(notFound);

    // Error handling middleware (must be last)
    app.use(errorHandler);

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`
🚀 SwipeHire Backend Server Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 HTTP Server: http://localhost:${PORT}
🔌 WebSocket: ws://localhost:${PORT}
🌍 Environment: ${NODE_ENV}
🔗 CORS Origin: ${CORS_ORIGIN}
⏰ Timezone: Asia/Kolkata
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n📤 Received ${signal}. Starting graceful shutdown...`);
      
      httpServer.close(async () => {
        console.log('🔌 HTTP server closed');
        
        try {
          // Close Socket.IO
          io.close();
          console.log('📡 Socket.IO server closed');
          
          // Close database connection
          const mongoose = await import('mongoose');
          await mongoose.connection.close();
          console.log('🗄️  Database connection closed');
          
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
