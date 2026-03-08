"use client";

/*
 * src/hooks/useRealtimeOrders.ts
 * Custom hook for subscribing to live order updates via Supabase Realtime.
 * Uses postgres_changes on the 'orders' table.
 *
 * ⚠️  ACTION REQUIRED — before using this hook:
 * Enable Realtime for the 'orders' table in Supabase Dashboard → Database → Replication,
 * or run: ALTER PUBLICATION supabase_realtime ADD TABLE orders;
 */

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

    /*
     * Store onNewOrder in a ref so the subscription effect doesn't need to
     * re-subscribe when the callback identity changes between renders.
     */
    const onNewOrderRef = useRef(onNewOrder);
    useEffect(() => { onNewOrderRef.current = onNewOrder; }, [onNewOrder]);

    useEffect(() => {
        const supabase = supabaseRef.current;

        const channel = supabase
            .channel("admin-orders-feed")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "orders" },
                (payload) => {
                    const newOrder = payload.new as Order;
                    setOrders((prev) => [newOrder, ...prev]);
                    setNewOrderIds((prev) => new Set([...prev, newOrder.id]));
                    onNewOrderRef.current?.(newOrder);
                }
            )
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "orders" },
                (payload) => {
                    const updatedOrder = payload.new as Order;
                    setOrders((prev) =>
                        prev.map((order) =>
                            order.id === updatedOrder.id ? updatedOrder : order
                        )
                    );
                }
            )
            .subscribe();

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
