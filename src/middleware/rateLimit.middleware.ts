import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { Request } from 'express';

export const rateLimitMiddleware = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req: Request) => {
        // Use user ID if authenticated, otherwise use IP
        if (req.user && req.user.userId) {
            return req.user.userId;
        }
        return ipKeyGenerator(req.ip || '127.0.0.1');
    },
    validate: {
        ip: true,
    },
    handler: (req, res) => {
        res.status(429).json({
            error: "Too many requests, please try again later."
        });
    }
});
