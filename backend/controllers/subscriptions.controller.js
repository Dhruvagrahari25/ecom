import { PrismaClient } from "../generated/prisma/client.js";
import { computeNextRunAt } from "../utils/subscriptionSchedule.js";

const prisma = new PrismaClient();

const SUBSCRIPTION_INCLUDE = {
    items: {
        include: { product: true },
    },
};

// ── GET /subscriptions  – list the caller's subscriptions ──────────────────
export const handleGetSubscriptions = async (req, res) => {
    try {
        const userId = req.user.id;
        const subs = await prisma.subscription.findMany({
            where: { userId },
            include: SUBSCRIPTION_INCLUDE,
            orderBy: { createdAt: "desc" },
        });
        res.json(subs);
    } catch (err) {
        console.error("Error fetching subscriptions:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ── GET /subscriptions/:id ──────────────────────────────────────────────────
export const handleGetSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const sub = await prisma.subscription.findUnique({
            where: { id },
            include: SUBSCRIPTION_INCLUDE,
        });
        if (!sub) return res.status(404).json({ error: "Subscription not found" });
        if (sub.userId !== userId) return res.status(403).json({ error: "Not authorized" });
        res.json(sub);
    } catch (err) {
        console.error("Error fetching subscription:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ── POST /subscriptions  – create a new subscription ───────────────────────
export const handleCreateSubscription = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, frequency, dayOfWeek, hour, minute, items } = req.body;

        if (!name || !frequency || hour == null || !items?.length) {
            return res.status(400).json({ error: "name, frequency, hour, and items are required" });
        }
        if (frequency === "WEEKLY" && dayOfWeek == null) {
            return res.status(400).json({ error: "dayOfWeek is required for WEEKLY frequency" });
        }

        const nextRunAt = computeNextRunAt(frequency, hour, minute ?? 0, dayOfWeek ?? null);

        const sub = await prisma.subscription.create({
            data: {
                userId,
                name,
                frequency,
                dayOfWeek: dayOfWeek ?? null,
                hour,
                minute: minute ?? 0,
                nextRunAt,
                items: {
                    create: items.map((i) => ({
                        productId: i.productId,
                        quantity: i.quantity,
                    })),
                },
            },
            include: SUBSCRIPTION_INCLUDE,
        });

        res.status(201).json(sub);
    } catch (err) {
        console.error("Error creating subscription:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ── PATCH /subscriptions/:id  – update schedule, name, items, or active ────
export const handleUpdateSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { name, frequency, dayOfWeek, hour, minute, active, items } = req.body;

        const existing = await prisma.subscription.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: "Subscription not found" });
        if (existing.userId !== userId) return res.status(403).json({ error: "Not authorized" });

        // Recompute nextRunAt if schedule fields changed
        const newFrequency = frequency ?? existing.frequency;
        const newHour = hour ?? existing.hour;
        const newMinute = minute ?? existing.minute;
        const newDayOfWeek = dayOfWeek !== undefined ? dayOfWeek : existing.dayOfWeek;
        const nextRunAt = computeNextRunAt(newFrequency, newHour, newMinute, newDayOfWeek);

        // Replace items if provided
        let itemsUpdate = {};
        if (items) {
            itemsUpdate = {
                deleteMany: {},
                create: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
            };
        }

        const updated = await prisma.subscription.update({
            where: { id },
            data: {
                name: name ?? existing.name,
                frequency: newFrequency,
                dayOfWeek: newDayOfWeek,
                hour: newHour,
                minute: newMinute,
                active: active !== undefined ? active : existing.active,
                nextRunAt,
                items: itemsUpdate,
            },
            include: SUBSCRIPTION_INCLUDE,
        });

        res.json(updated);
    } catch (err) {
        console.error("Error updating subscription:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ── DELETE /subscriptions/:id ───────────────────────────────────────────────
export const handleDeleteSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const existing = await prisma.subscription.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: "Subscription not found" });
        if (existing.userId !== userId) return res.status(403).json({ error: "Not authorized" });

        await prisma.subscription.delete({ where: { id } });
        res.json({ message: "Subscription deleted" });
    } catch (err) {
        console.error("Error deleting subscription:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ── Cron worker: place orders for all due subscriptions ────────────────────
export const runSubscriptionCron = async () => {
    const now = new Date();
    try {
        const due = await prisma.subscription.findMany({
            where: {
                active: true,
                nextRunAt: { lte: now },
            },
            include: {
                items: true,
            },
        });

        for (const sub of due) {
            try {
                // Compute the next run time before doing anything else
                const nextRunAt = computeNextRunAt(
                    sub.frequency,
                    sub.hour,
                    sub.minute,
                    sub.dayOfWeek,
                    now
                );

                // Optimistic lock: advance nextRunAt ONLY if it still matches what we read.
                // If a concurrent cron tick already updated it, count will be 0 and we skip.
                const claimed = await prisma.subscription.updateMany({
                    where: { id: sub.id, nextRunAt: sub.nextRunAt },
                    data: { nextRunAt },
                });

                if (claimed.count === 0) {
                    // Another cron tick already claimed this subscription — skip to avoid duplicate order
                    continue;
                }

                // Verify products are still available
                const productIds = sub.items.map((i) => i.productId);
                const available = await prisma.product.findMany({
                    where: { id: { in: productIds }, available: true },
                    select: { id: true },
                });
                const availableIds = new Set(available.map((p) => p.id));
                const orderableItems = sub.items.filter((i) => availableIds.has(i.productId));

                if (orderableItems.length > 0) {
                    await prisma.order.create({
                        data: {
                            userId: sub.userId,
                            items: {
                                create: orderableItems.map((i) => ({
                                    productId: i.productId,
                                    quantity: i.quantity,
                                })),
                            },
                        },
                    });
                }

                console.log(`[Subscription Cron] Placed order for subscription "${sub.name}" (${sub.id})`);
            } catch (innerErr) {
                console.error(`[Subscription Cron] Failed for subscription ${sub.id}:`, innerErr.message);
            }
        }
    } catch (err) {
        console.error("[Subscription Cron] Error:", err);
    }
};
