import { redisClient } from '../config/redis';

// Set a value in cache with expiration (in seconds)
export const setCache = async (key: string, value: any, ttlSeconds: number = 3600) => {
    try {
        const data = JSON.stringify(value);
        await redisClient.setEx(key, ttlSeconds, data);
        return true;
    } catch (error) {
        console.error(`Error setting cache for key ${key}:`, error);
        return false;
    }
};

// Get a value from cache
export const getCache = async <T>(key: string): Promise<T | null> => {
    try {
        const data = await redisClient.get(key);
        if (!data) return null;
        return JSON.parse(data) as T;
    } catch (error) {
        console.error(`Error getting cache for key ${key}:`, error);
        return null;
    }
};

// Delete a value from cache
export const deleteCache = async (key: string) => {
    try {
        await redisClient.del(key);
        return true;
    } catch (error) {
        console.error(`Error deleting cache for key ${key}:`, error);
        return false;
    }
};

// Clear cache by pattern (be careful with this in production!)
export const clearCachePattern = async (pattern: string) => {
    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
        return true;
    } catch (error) {
        console.error(`Error clearing cache pattern ${pattern}:`, error);
        return false;
    }
};
