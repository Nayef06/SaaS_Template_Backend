import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include user with role
// This is already done in auth.middleware.ts sort of, but let's be explicit
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export const checkRole = (requiredRole: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as AuthenticatedRequest).user;

        if (!user || !user.role) {
            return res.status(403).json({ error: 'Access denied. No role found.' });
        }

        if (user.role !== requiredRole) {
            return res.status(403).json({ error: `Access denied. Requires ${requiredRole} role.` });
        }

        next();
    };
};
