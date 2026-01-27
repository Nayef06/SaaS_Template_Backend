import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import protectedRoutes from './routes/protected.routes';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import stripeRoutes from './routes/stripe.routes';
import webhookRoutes from './routes/webhook.routes';
import { rateLimitMiddleware } from './middleware/rateLimit.middleware';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const startTime = new Date();

// Webhook route must be registered before express.json() to handle raw body
app.use('/api/webhooks', webhookRoutes);

app.use(express.json());

// Apply rate limiting globally (or you could apply it only to specific routes)
// Apply rate limiting globally (or you could apply it only to specific routes)
app.use(rateLimitMiddleware);

// Connect to Redis
import { connectRedis } from './config/redis';
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

app.listen(port, () => {
  console.log(`Server is running @ http://localhost:${port}`);
});
