import { Request, Response, NextFunction } from 'express';

// Simple sanitizer to replace dangerous characters
const sanitizeString = (str: string): string => {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

// Recursive function to sanitize object values
const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
        return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
    }
    if (typeof obj === 'object' && obj !== null) {
        const sanitized: any = {};
        for (const key in obj) {
            sanitized[key] = sanitizeObject(obj[key]);
        }
        return sanitized;
    }
    return obj;
};

export const sanitize = (req: Request, res: Response, next: NextFunction) => {
    req.body = sanitizeObject(req.body);
    req.query = sanitizeObject(req.query);
    req.params = sanitizeObject(req.params);
    next();
};
