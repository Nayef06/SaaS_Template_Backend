import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (err instanceof AppError) {
        logger.warn(`AppError: ${err.message} (Status: ${err.statusCode})`);
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack });

        // In production, don't leak stack traces
        const response: any = {
            status: 'error',
            message: 'Something went wrong',
        };

        if (process.env.NODE_ENV !== 'production') {
            response.message = err.message;
            response.stack = err.stack;
        }

        res.status(500).json(response);
    }
};

export default errorHandler;
