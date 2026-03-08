// =============================================================================
// src/types/index.ts
// Shared TypeScript types — single source of truth for the entire app.
//
// DB types (Product, Order, OrderItem) are inferred from Drizzle schema and
// re-exported here so components don't need to import from src/db/schema directly.
// ==============================================================================

// Import DB-inferred types locally (needed for use within this file)
// and re-export them as the single source of truth for the whole app.
import type {
    NewOrder,
    NewOrderItem,
    NewProduct,
    Order,
    OrderItem,
    Product,
} from "@/db/schema";

export type {
    NewOrder,
    NewOrderItem,
    NewProduct,
    Order,
    OrderItem,
    Product,
};

// ---------------------------------------------------------------------------
// Cart types — client-side only, not persisted to the database
// ---------------------------------------------------------------------------

/**
 * A product as displayed in the storefront catalog.
 * Matches the Product DB type but some fields are required for UI display.
 */
export interface CartProduct {
    id: string; // UUID from Supabase
    name: string;
    price: number; // IDR integer
    imageUrl: string | null;
    description: string | null;
    category: string | null;
    isNew: boolean | null;
}

/** An item in the shopping cart — product + quantity */
export interface CartItem extends CartProduct {
    quantity: number;
}

// ---------------------------------------------------------------------------
// Order submission types — used in the createOrder server action
// ---------------------------------------------------------------------------

export interface OrderItemInput {
    productId: string; // UUID
    quantity: number;
}

export interface CreateOrderInput {
    customerName: string;
    customerPhone: string;
    items: OrderItemInput[];
}

// ---------------------------------------------------------------------------
// Admin types — used in admin dashboard components
// ---------------------------------------------------------------------------

export type PaymentStatus = "unpaid" | "paid" | "cancelled";

/** An order with its associated items — used in admin dashboard */
export interface OrderWithItems {
    order: Order;
    items: OrderItem[];
}
