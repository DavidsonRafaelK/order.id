// =============================================================================
// src/db/schema.ts
// Drizzle ORM schema — single source of truth for the Supabase database.
// All monetary values are stored as integers (Indonesian Rupiah, no decimals).
// =============================================================================

import {
    boolean,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// products — the catalog of items for sale in the pre-order system
// ---------------------------------------------------------------------------
export const products = pgTable("products", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    price: integer("price").notNull(), // IDR, no decimals
    imageUrl: text("image_url"),
    category: text("category"),
    isAvailable: boolean("is_available").default(true),
    isNew: boolean("is_new").default(false),
    stock: integer("stock"), // null = unlimited
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ---------------------------------------------------------------------------
// orders — one record per customer checkout
// ---------------------------------------------------------------------------
export const orders = pgTable("orders", {
    id: uuid("id").primaryKey().defaultRandom(),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    totalAmount: integer("total_amount").notNull(), // IDR
    paymentStatus: text("payment_status")
        .default("unpaid")
        .$type<"unpaid" | "paid" | "cancelled">(),
    paymentMethod: text("payment_method"), // filled by admin after confirmation
    notes: text("notes"), // admin notes
    whatsappSentAt: timestamp("whatsapp_sent_at", { withTimezone: true }), // when WA redirect happened
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }), // when admin confirmed payment
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ---------------------------------------------------------------------------
// order_items — individual line items for each order
// Product name and price are snapshotted at order time so historical data
// remains accurate even if the product is later updated or removed.
// ---------------------------------------------------------------------------
export const orderItems = pgTable("order_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
        .notNull()
        .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id),
    productName: text("product_name").notNull(), // snapshot at order time
    productPrice: integer("product_price").notNull(), // snapshot at order time (IDR)
    quantity: integer("quantity").notNull(),
    subtotal: integer("subtotal").notNull(), // productPrice * quantity (IDR)
});

// ---------------------------------------------------------------------------
// Inferred TypeScript types — use these throughout the app instead of
// manually defining interfaces. Import from "@/db/schema".
// ---------------------------------------------------------------------------
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
