"use server";

// =============================================================================
// src/app/actions/admin.ts
// Server Actions for admin operations — requires an authenticated admin session.
// All functions here must ONLY be called from protected admin routes.
// =============================================================================

import { db } from "@/db";
import { orders, products } from "@/db/schema";
import type { NewProduct, PaymentStatus } from "@/types";
import { desc, eq } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Order management
// ---------------------------------------------------------------------------

/**
 * Fetch the latest N orders for the admin dashboard feed.
 */
export async function getRecentOrders(limit = 50) {
    return db
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(limit);
}

/**
 * Update the payment status of an order.
 * If status is set to 'paid', confirmedAt is set to the current timestamp.
 */
export async function updatePaymentStatus(
    orderId: string,
    status: PaymentStatus
) {
    const [updated] = await db
        .update(orders)
        .set({
            paymentStatus: status,
            confirmedAt: status === "paid" ? new Date() : null,
        })
        .where(eq(orders.id, orderId))
        .returning();

    return updated;
}

/**
 * Revenue summary for the admin dashboard cards.
 * Uses a single query + JS aggregation to avoid multiple round-trips.
 */
export async function getRevenueSummary() {
    const allOrders = await db
        .select({
            paymentStatus: orders.paymentStatus,
            totalAmount: orders.totalAmount,
            createdAt: orders.createdAt,
        })
        .from(orders);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let paidRevenue = 0;
    let unpaidRevenue = 0;
    let todayCount = 0;
    let pendingCount = 0;

    for (const order of allOrders) {
        if (order.paymentStatus === "paid") paidRevenue += order.totalAmount;
        if (order.paymentStatus === "unpaid") unpaidRevenue += order.totalAmount;
        if (order.createdAt && order.createdAt >= todayStart) todayCount++;
        if (order.paymentStatus === "unpaid") pendingCount++;
    }

    return { paidRevenue, unpaidRevenue, todayCount, pendingCount };
}

// ---------------------------------------------------------------------------
// Product management
// ---------------------------------------------------------------------------

/**
 * Fetch all products including unavailable ones (admin view).
 */
export async function getAllProducts() {
    return db.select().from(products).orderBy(products.createdAt);
}

/**
 * Create a new product.
 */
export async function createProduct(data: Omit<NewProduct, "id" | "createdAt">) {
    const [created] = await db.insert(products).values(data).returning();
    return created;
}

/**
 * Update an existing product.
 */
export async function updateProduct(
    id: string,
    data: Partial<Omit<NewProduct, "id" | "createdAt">>
) {
    const [updated] = await db
        .update(products)
        .set(data)
        .where(eq(products.id, id))
        .returning();
    return updated;
}

/**
 * Toggle a product's availability — one-click enable/disable in the admin UI.
 */
export async function toggleProductAvailability(id: string) {
    // Fetch current state first
    const [product] = await db
        .select({ isAvailable: products.isAvailable })
        .from(products)
        .where(eq(products.id, id));

    if (!product) throw new Error(`Product ${id} not found`);

    const [updated] = await db
        .update(products)
        .set({ isAvailable: !product.isAvailable })
        .where(eq(products.id, id))
        .returning();

    return updated;
}
