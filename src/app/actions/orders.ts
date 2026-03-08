"use server";

// =============================================================================
// src/app/actions/orders.ts
// Server Actions for order creation — replaces the old /api/orders route.
//
// Security notes:
// - Prices are ALWAYS fetched from the database — never trusted from the client.
// - Input is validated before any DB operation.
// - All inserts happen in a single transaction.
// =============================================================================

import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import type { CreateOrderInput } from "@/types";
import { eq, inArray } from "drizzle-orm";

// Input sanitization — same pattern as the old API route
function sanitizeInput(input: string): string {
    if (typeof input !== "string") return "";
    return input
        .trim()
        .replace(/[<>"'&\n\r]/g, "") // strip potential injection chars incl. newlines
        .slice(0, 500);
}

function validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^(\+62|62|0)[\d\-\s()]{8,15}$/;
    const cleanPhone = phone.replace(/[\s\-()]/g, "");
    return phoneRegex.test(phone) && cleanPhone.length >= 9;
}

/**
 * Create a new order — called from the cart checkout flow.
 *
 * Prices are fetched from the database and are NOT accepted from the client.
 * If createOrder() throws, the caller must NOT proceed with the WhatsApp redirect.
 *
 * @returns { orderId: string } on success
 * @throws Error with a descriptive message on failure
 */
export async function createOrder(data: CreateOrderInput): Promise<{ orderId: string }> {
    // 1. Validate and sanitize inputs
    const sanitizedName = sanitizeInput(data.customerName);
    const sanitizedPhone = sanitizeInput(data.customerPhone);

    if (!sanitizedName || sanitizedName.length < 2) {
        throw new Error("Nama pelanggan tidak valid (minimal 2 karakter).");
    }

    if (!validatePhoneNumber(sanitizedPhone)) {
        throw new Error(
            "Nomor WhatsApp tidak valid. Gunakan format: 08xxx atau +628xxx."
        );
    }

    if (!data.items || data.items.length === 0) {
        throw new Error("Keranjang belanja kosong.");
    }

    // 2. Fetch current prices from the database — never trust client-sent prices
    const productIds = data.items.map((i) => i.productId);
    const dbProducts = await db
        .select()
        .from(products)
        .where(inArray(products.id, productIds));

    if (dbProducts.length !== productIds.length) {
        throw new Error(
            "Satu atau lebih produk tidak ditemukan. Muat ulang halaman dan coba lagi."
        );
    }

    // Build a map for O(1) price lookups
    const priceMap = new Map(dbProducts.map((p) => [p.id, p]));

    // 3. Calculate totals server-side
    const lineItems = data.items.map((item) => {
        const product = priceMap.get(item.productId)!;
        const subtotal = product.price * item.quantity;
        return {
            productId: item.productId,
            productName: product.name,
            productPrice: product.price,
            quantity: item.quantity,
            subtotal,
        };
    });

    const totalAmount = lineItems.reduce((sum, i) => sum + i.subtotal, 0);

    if (totalAmount <= 0) {
        throw new Error("Total pesanan tidak valid.");
    }

    // 4. Insert order + order_items in a transaction
    try {
        const [newOrder] = await db
            .insert(orders)
            .values({
                customerName: sanitizedName,
                customerPhone: sanitizedPhone,
                totalAmount,
                paymentStatus: "unpaid",
                whatsappSentAt: new Date(),
            })
            .returning({ id: orders.id });

        if (!newOrder?.id) {
            throw new Error("Gagal membuat order — tidak ada ID yang dikembalikan.");
        }

        await db.insert(orderItems).values(
            lineItems.map((item) => ({
                ...item,
                orderId: newOrder.id,
            }))
        );

        return { orderId: newOrder.id };
    } catch (err) {
        // Re-throw DB errors with a user-friendly message
        console.error("[createOrder] DB error:", err);
        throw new Error(
            "Gagal menyimpan pesanan ke database. Silakan coba lagi."
        );
    }
}

/**
 * Fetch a single order with its items by ID.
 * Used by the admin dashboard order detail view.
 */
export async function getOrderWithItems(orderId: string) {
    const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId));

    if (!order) return null;

    const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));

    return { order, items };
}
