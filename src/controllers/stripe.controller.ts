import { Request, Response } from 'express';
import { stripe } from '../config/stripe';

export const createCheckoutSession = async (req: Request, res: Response) => {
    try {
        const { priceId } = req.body;
        const userId = (req as any).user?.userId; // Assumes auth middleware populates this

        if (!priceId) {
            return res.status(400).json({ error: 'Price ID is required' });
        }

        // In a real app, you might want to get the user's email or existing customer ID
        // const user = await prisma.user.findUnique({ where: { id: userId } });

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing`,
            metadata: {
                userId: userId ? String(userId) : 'guest', // Pass user ID to webhook
            },
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
};
