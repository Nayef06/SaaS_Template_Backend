import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';

export const requireSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: No user found' });
        }

        // Check for active subscription
        // We look for 'active' or 'trialing' status
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: userId,
                status: {
                    in: ['active', 'trialing']
                },
                // We can also check expiry, but status acts as the source of truth from Stripe
            }
        });

        if (!subscription) {
            return res.status(403).json({
                error: 'Forbidden: Active subscription required',
                code: 'SUBSCRIPTION_REQUIRED'
            });
        }

        next();
    } catch (error) {
        console.error('Subscription middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
