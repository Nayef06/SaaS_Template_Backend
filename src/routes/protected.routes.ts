import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/dashboard', authenticateToken, (req: Request, res: Response) => {
    res.json({
        message: 'Welcome to the protected dashboard',
        user: req.user
    });
});

export default router;
