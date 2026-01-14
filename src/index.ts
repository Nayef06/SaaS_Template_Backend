import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const startTime = new Date();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send("The server's up");
});

app.use('/auth', authRoutes);

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
