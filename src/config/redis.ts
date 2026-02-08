import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

import { env } from './env';

const redisUrl = env.REDIS_URL;

export const redisClient = createClient({
    url: redisUrl,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

export const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        // Do not exit process, allow app to run without Redis if needed (or fail depending on requirement)
        // For this template, keeping it non-fatal for dev convenience if Redis is missing, 
        // but Auth operations depending on it will fail.
    }
};
