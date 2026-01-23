import { stripe } from '../config/stripe';

async function seedStripe() {
    try {
        console.log('Seeding Stripe data...');

        // 1. Create a "Basic Plan" product
        const basicProduct = await stripe.products.create({
            name: 'Basic Plan',
            description: 'Standard features for individuals',
        });
        console.log(`Created product: ${basicProduct.name} (${basicProduct.id})`);

        // 2. Create a price for "Basic Plan" ($10.00/month)
        const basicPrice = await stripe.prices.create({
            product: basicProduct.id,
            unit_amount: 1000,
            currency: 'usd',
            recurring: {
                interval: 'month',
            },
            metadata: {
                planType: 'basic',
            },
        });
        console.log(`Created price: $10.00/mo (${basicPrice.id})`);

        // 3. Create a "Pro Plan" product
        const proProduct = await stripe.products.create({
            name: 'Pro Plan',
            description: 'Advanced features for teams',
        });
        console.log(`Created product: ${proProduct.name} (${proProduct.id})`);

        // 4. Create a price for "Pro Plan" ($29.00/month)
        const proPrice = await stripe.prices.create({
            product: proProduct.id,
            unit_amount: 2900,
            currency: 'usd',
            recurring: {
                interval: 'month',
            },
            metadata: {
                planType: 'pro',
            },
        });
        console.log(`Created price: $29.00/mo (${proPrice.id})`);

        console.log('Stripe seeding completed!');
    } catch (error) {
        console.error('Error seeding Stripe data:', error);
        process.exit(1);
    }
}

seedStripe();
