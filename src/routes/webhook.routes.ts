import { Router } from 'express';
import express from 'express';
import { handleStripeWebhook } from '../controllers/webhook.controller';

const router = Router();

// Route must use raw body parser for signature verification
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
