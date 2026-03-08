"use server";

// =============================================================================
// src/app/actions/products.ts
// Server Actions for product data — used by Server Components.
// =============================================================================

import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Fetch all available products for display in the storefront catalog.
 * Called from ProductGrid (Server Component) — no client fetch needed.
 */
export async function getProducts() {
    const result = await db
        .select()
        .from(products)
        .where(eq(products.isAvailable, true))
        .orderBy(products.createdAt);

    return result;
}
