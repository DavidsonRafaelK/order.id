"use client";

// =============================================================================
// src/hooks/useRealtimeOrders.ts
// Custom hook for subscribing to live order updates via Supabase Realtime.
// Uses postgres_changes on the 'orders' table — requires Realtime to be
// enabled for that table in the Supabase dashboard.
//
// ⚠️  [ACTION REQUIRED] Before using this hook:
// 1. Go to Supabase Dashboard → Database → Replication
// 2. Enable replication for the 'orders' table
// 3. Alternatively: run `ALTER PUBLICATION supabase_realtime ADD TABLE orders;`
//    in the Supabase SQL Editor
// =============================================================================

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types";

interface UseRealtimeOrdersOptions {
    initialOrders: Order[];
    onNewOrder?: (order: Order) => void;
}

export function useRealtimeOrders({
    initialOrders,
    onNewOrder,
}: UseRealtimeOrdersOptions) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
    const supabaseRef = useRef(createClient());
    // Store onNewOrder in a ref so the subscription effect doesn't need to
    // re-subscribe when the callback identity changes between renders.
    const onNewOrderRef = useRef(onNewOrder);
    useEffect(() => { onNewOrderRef.current = onNewOrder; }, [onNewOrder]);

    useEffect(() => {
        const supabase = supabaseRef.current;

        const channel = supabase
            .channel("admin-orders-feed")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "orders",
                },
                (payload) => {
                    const newOrder = payload.new as Order;
                    // Prepend new orders to the top of the list
                    setOrders((prev) => [newOrder, ...prev]);
                    // Mark as "new" for visual indicator
                    setNewOrderIds((prev) => new Set([...prev, newOrder.id]));
                    // Notify parent — use ref to avoid stale closure
                    onNewOrderRef.current?.(newOrder);
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "orders",
                },
                (payload) => {
                    const updatedOrder = payload.new as Order;
                    // Update the specific order in-place without a full re-fetch
                    setOrders((prev) =>
                        prev.map((order) =>
                            order.id === updatedOrder.id ? updatedOrder : order
                        )
                    );
                }
            )
            .subscribe();

        // Cleanup subscription on unmount
        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty deps intentional — subscribe once on mount, use ref for callback

    const markOrderAsRead = (orderId: string) => {
        setNewOrderIds((prev) => {
            const next = new Set(prev);
            next.delete(orderId);
            return next;
        });
    };

    const markAllAsRead = () => setNewOrderIds(new Set());

    return { orders, newOrderIds, markOrderAsRead, markAllAsRead };
}
