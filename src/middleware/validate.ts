import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../utils/AppError';

export const validate = (schema: z.ZodType<any>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            const issues = (error as any).errors;
            const errorMessage = issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
            next(new AppError(errorMessage, 400));
        } else {
            next(new AppError('Validation failed', 400));
        }
    }
};
