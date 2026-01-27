
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3000';

async function main() {
    // 1. Register
    const email = `test-${Date.now()}@example.com`;
    const password = 'Password123!'; // Meets complexity requirements

    console.log('1. Registering user...');
    try {
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!regRes.ok) {
            console.error('Registration failed:', await regRes.text());
            return;
        }
    } catch (e) {
        console.error('Connection failed (Server might be down):', e);
        return;
    }

    // 2. Login
    console.log('2. Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        return;
    }
    const loginData = await loginRes.json() as any;
    const token = loginData.accessToken;
    const userId = loginData.user.id;

    // 3. Access Premium (Fail)
    console.log('3. Accessing premium (Expect 403)...');
    const failRes = await fetch(`${API_URL}/protected/premium`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (failRes.status === 403) {
        console.log('SUCCESS: Access forbidden');
    } else {
        console.error(`FAILED: Expected 403, got ${failRes.status}`, await failRes.text());
    }

    // 4. Create Sub
    console.log('4. Creating mock subscription...');
    await prisma.subscription.create({
        data: {
            stripeSubscriptionId: `sub_test_${Date.now()}`,
            userId: userId,
            status: 'active',
            priceId: 'price_test',
            currentPeriodEnd: new Date(Date.now() + 86400000)
        }
    });

    // 5. Access Premium (Pass)
    console.log('5. Accessing premium (Expect 200)...');
    const passRes = await fetch(`${API_URL}/protected/premium`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (passRes.ok) {
        console.log('SUCCESS: Access granted');
    } else {
        console.error(`FAILED: Expected 200, got ${passRes.status}`, await passRes.text());
    }

    // Cleanup
    // await prisma.user.delete({ where: { id: userId } });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
