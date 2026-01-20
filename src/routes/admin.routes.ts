import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { checkRole } from '../middleware/rbac.middleware';
import { Role } from '../utils/roles';

const router = Router();

// Protect all routes in this file
router.use(authenticateToken);

// Admin-only route
router.get('/stats', checkRole(Role.ADMIN), (req: Request, res: Response) => {
    res.json({
        message: 'Admin stats accessed successfully',
        stats: {
            users: 100,
            revenue: 5000,
            activeSubscriptions: 85
        }
    });
});

export default router;
