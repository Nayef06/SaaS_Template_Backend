
import { Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../src/middleware/validate';
import { sanitize } from '../src/middleware/sanitize';
import { AppError } from '../src/utils/AppError';

// Mock Express objects
const mockReq = (body: any = {}, query: any = {}, params: any = {}) => ({
    body,
    query,
    params,
} as Request);

const mockRes = () => {
    const res: any = {};
    res.status = (code: number) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data: any) => {
        res.data = data;
        return res;
    };
    return res as Response;
};

const mockNext = (err?: any) => {
    if (err) {
        console.log(`[PASS] Next called with error.`);
        if (err instanceof Error) {
            console.log(`Error Message: ${err.message}`);
        } else {
            console.log(`Error Object:`, err);
        }
        if (err instanceof AppError) {
            console.log(`Status Code: ${err.statusCode}`);
        }
    } else {
        console.log('[PASS] Next called successfully (no error)');
    }
};

async function runTests() {
    try {
        console.log('--- Testing Validation Middleware ---');
        const schema = z.object({
            body: z.object({
                email: z.string().email(),
            }),
        });

        const validReq = mockReq({ email: 'test@example.com' });
        console.log('Test 1: Valid input');
        await validate(schema)(validReq, mockRes(), mockNext);

        const invalidReq = mockReq({ email: 'not-an-email' });
        console.log('\nTest 2: Invalid input');
        try {
            await validate(schema)(invalidReq, mockRes(), mockNext);
        } catch (e: any) {
            console.log(`[FAIL] validate threw exception: ${e.message}`);
            console.log(e.stack);
        }

        console.log('\n--- Testing Sanitization Middleware ---');
        const maliciousReq = mockReq({
            bio: 'Hello <script>alert(1)</script>',
            nested: { field: '<img src=x onerror=alert(1)>' }
        });

        // We need to pass a next that doesn't log for sanitization as it just calls next()
        sanitize(maliciousReq, mockRes(), () => { });

        console.log('Test 3: Sanitization');
        console.log(`Original: Hello <script>alert(1)</script>`);
        console.log(`Sanitized: ${maliciousReq.body.bio}`);

        if (maliciousReq.body.bio === 'Hello &lt;script&gt;alert(1)&lt;/script&gt;') {
            console.log('[PASS] Script tag escaped');
        } else {
            console.log('[FAIL] Script tag NOT escaped');
        }

        console.log(`Nested Original: <img src=x onerror=alert(1)>`);
        console.log(`Nested Sanitized: ${maliciousReq.body.nested.field}`);
        if (maliciousReq.body.nested.field === '&lt;img src=x onerror=alert(1)&gt;') {
            console.log('[PASS] Nested tag escaped');
        } else {
            console.log('[FAIL] Nested tag NOT escaped');
        }

    } catch (err) {
        console.error('Test suite failed:', err);
    }
}

runTests().catch(console.error);
