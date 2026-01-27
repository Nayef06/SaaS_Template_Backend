import { Request, Response } from 'express';
import { stripe } from '../config/stripe';
import { upsertSubscription, deleteSubscription } from '../services/subscription.service';
import Stripe from 'stripe';

export const handleStripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
        if (!webhookSecret) {
            throw new Error('Stripe webhook secret is not defined');
        }
        // Verify signature
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;

                // We expect userId to be in metadata, passed during checkout session creation
                const userId = subscription.metadata.userId;

                if (!userId) {
                    console.warn(`Subscription ${subscription.id} missing userId in metadata`);
                    // Can't link to user, so we might skip or log error
                    // If it's a guest checkout, you'd need to handle that logic (e.g., find user by email)
                    break;
                }

                await upsertSubscription({
                    stripeSubscriptionId: subscription.id,
                    userId: userId,
                    status: subscription.status,
                    priceId: subscription.items.data[0].price.id,
                    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                });
                console.log(`Synced subscription ${subscription.id} for user ${userId}`);
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await deleteSubscription(subscription.id);
                console.log(`Marked subscription ${subscription.id} as deleted/canceled`);
                break;
            }
            default:
                // console.log(`Unhandled event type ${event.type}`);
                break;
        }
    } catch (error) {
        console.error(`Error processing webhook ${event.type}:`, error);
        // Return 200 so Stripe doesn't retry indefinitely if it's an internal error we can't fix immediately
        // Or return 500 to retry. For now, 200 with log.
        // Actually, Stripe recommends returning 200 to acknowledge receipt unless you want a retry.
    }

    res.json({ received: true });
};
