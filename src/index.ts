import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timeStamp: new Date().toISOString(),
    uptimeSec: process.uptime()
  });
});

app.listen(port, () => {
  console.log(`Server is running @ http://localhost:${port}`);
});
