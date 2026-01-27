import prisma from '../utils/db';

export const upsertSubscription = async (data: any) => {
    return await prisma.subscription.upsert({
        where: {
            stripeSubscriptionId: data.stripeSubscriptionId,
        },
        update: data,
        create: data,
    });
};

export const deleteSubscription = async (stripeSubscriptionId: string) => {
    // We update status to cancelled rather than deleting strictly
    // Depending on business logic, you might want to delete if it was just created and immediately cancelled (unlikely)
    // or just keep history.
    return await prisma.subscription.update({
        where: {
            stripeSubscriptionId: stripeSubscriptionId
        },
        data: {
            status: 'canceled'
        }
    });
};
