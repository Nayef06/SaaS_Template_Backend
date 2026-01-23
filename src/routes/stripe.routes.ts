import { Router } from 'express';
import { createCheckoutSession } from '../controllers/stripe.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Create a checkout session (protected route, but could be public if you handle auth later)
router.post('/checkout', authenticateToken, createCheckoutSession);

export default router;
