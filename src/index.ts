import express, { Express, Request, Response } from 'express';
// @ts-ignore
import helmet from 'helmet';
import protectedRoutes from './routes/protected.routes';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import stripeRoutes from './routes/stripe.routes';
import webhookRoutes from './routes/webhook.routes';
import { rateLimitMiddleware } from './middleware/rateLimit.middleware';
import { sanitize } from './middleware/sanitize';
import errorHandler from './middleware/error.middleware';
import { env } from './config/env';
import { connectRedis, redisClient } from './config/redis';
import { PrismaClient } from '@prisma/client';

const app: Express = express();
const port = env.PORT;
const startTime = new Date();
const prisma = new PrismaClient(); // Instantiate prisma for graceful shutdown

// Security Headers
app.use(helmet());

// Webhook route must be registered before express.json() to handle raw body
app.use('/api/webhooks', webhookRoutes);

app.use(express.json());

// Sanitize inputs
app.use(sanitize);

// Apply rate limiting globally (or you could apply it only to specific routes)
app.use(rateLimitMiddleware);

// Connect to Redis
connectRedis();

app.get('/', (req: Request, res: Response) => {
  res.send("The server's up");
});

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/protected', protectedRoutes);
app.use('/api/stripe', stripeRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    startTime: startTime.toISOString(),
    currentTime: new Date().toISOString(),
    uptimeSec: process.uptime()
  });
});

// Global Error Handler
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`Server is running @ http://localhost:${port}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});

// Graceful Shutdown
const shutdown = async (signal: string) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  server.close(() => {
    console.log('HTTP server closed.');
  });

  try {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');

    if (redisClient.isOpen) {
      await redisClient.quit();
      console.log('Redis client disconnected.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
