import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireSubscription } from '../middleware/subscription.middleware';

const router = Router();

router.get('/dashboard', authenticateToken, (req: Request, res: Response) => {
    res.json({
        message: 'Welcome to the protected dashboard',
        user: (req as any).user
    });
});

router.get('/premium', authenticateToken, requireSubscription, (req: Request, res: Response) => {
    res.json({
        message: 'Welcome to the premium content!',
        user: (req as any).user
    });
});

export default router;
