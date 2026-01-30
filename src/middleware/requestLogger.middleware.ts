import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const { method, originalUrl } = req;
        const { statusCode } = res;

        let logMessage = `${method} ${originalUrl} ${statusCode} ${duration}ms`;

        if (statusCode >= 400) {
            logger.error(logMessage);
        } else {
            logger.http(logMessage);
        }
    });

    next();
};

export default requestLogger;
