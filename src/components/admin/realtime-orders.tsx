"use client";

// =============================================================================
// src/components/admin/realtime-orders.tsx
// Realtime order feed — subscribes to live Supabase postgres_changes.
// Used on both the dashboard (feed) and orders page (table).
// =============================================================================

import { useToast } from "@/components/ui/toast";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { updatePaymentStatus } from "@/app/actions/admin";
import type { Order, PaymentStatus } from "@/types";

function formatTimestamp(date: Date | null | string): string {
    if (!date) return "—";
    return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "Asia/Jakarta",
    }).format(new Date(date));
}

function formatRp(amount: number) {
    return `Rp ${amount.toLocaleString("id-ID")}`;
}

const statusConfig: Record<
    PaymentStatus,
    { label: string; className: string }
> = {
    unpaid: { label: "Belum Bayar", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    paid: { label: "Lunas", className: "bg-green-100 text-green-800 border-green-200" },
    cancelled: { label: "Dibatalkan", className: "bg-red-100 text-red-800 border-red-200" },
};

function StatusBadge({ status }: { status: string | null }) {
    const s = (status ?? "unpaid") as PaymentStatus;
    const config = statusConfig[s] ?? statusConfig.unpaid;
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
        >
            {config.label}
        </span>
    );
}

interface OrderRowProps {
    order: Order;
    isNew: boolean;
    onMarkRead: (id: string) => void;
}

function OrderRow({ order, isNew, onMarkRead }: OrderRowProps) {
    const { addToast } = useToast();

    const handleStatusChange = async (newStatus: PaymentStatus) => {
        try {
            await updatePaymentStatus(order.id, newStatus);
        } catch {
            addToast({
                type: "error",
                title: "Gagal mengubah status",
                description: "Coba lagi.",
            });
        }
    };

    const whatsappUrl = `https://wa.me/${order.customerPhone}`;

    return (
        <tr
            className={`border-b transition-colors ${isNew
                    ? "bg-primary/5 animate-pulse-once"
                    : "hover:bg-muted/50"
                }`}
            onClick={() => isNew && onMarkRead(order.id)}
        >
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    {isNew && (
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" aria-label="Order baru" />
                    )}
                    <div>
                        <p className="font-medium text-sm text-foreground">{order.customerName}</p>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-primary transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {order.customerPhone} ↗
                        </a>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 text-sm font-semibold text-foreground">
                {formatRp(order.totalAmount)}
            </td>
            <td className="px-4 py-3 text-xs text-muted-foreground">
                {formatTimestamp(order.createdAt)}
            </td>
            <td className="px-4 py-3">
                <StatusBadge status={order.paymentStatus} />
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                    {(["unpaid", "paid", "cancelled"] as PaymentStatus[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => handleStatusChange(s)}
                            disabled={order.paymentStatus === s}
                            className={`text-xs px-2 py-1 rounded border transition-colors ${order.paymentStatus === s
                                    ? "bg-muted text-muted-foreground cursor-default"
                                    : "hover:bg-muted text-foreground"
                                }`}
                            title={`Ubah ke: ${statusConfig[s].label}`}
                        >
                            {s === "unpaid" ? "⏳" : s === "paid" ? "✅" : "❌"}
                        </button>
                    ))}
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 rounded border hover:bg-muted transition-colors text-foreground"
                        title="Buka WhatsApp"
                    >
                        💬
                    </a>
                </div>
            </td>
        </tr>
    );
}

interface RealtimeOrderFeedProps {
    initialOrders: Order[];
}

export function RealtimeOrderFeed({ initialOrders }: RealtimeOrderFeedProps) {
    const { addToast } = useToast();

    const { orders, newOrderIds, markOrderAsRead, markAllAsRead } =
        useRealtimeOrders({
            initialOrders,
            onNewOrder: (order) => {
                addToast({
                    type: "success",
                    title: "Order Baru! 🔔",
                    description: `${order.customerName} — ${formatRp(order.totalAmount)}`,
                });
            },
        });

    if (orders.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground border rounded-xl bg-card">
                <p className="text-lg">Belum ada order masuk</p>
                <p className="text-sm mt-1">Order baru akan muncul di sini secara otomatis</p>
            </div>
        );
    }

    return (
        <div className="bg-card border rounded-xl overflow-hidden">
            {newOrderIds.size > 0 && (
                <div className="px-4 py-2.5 bg-primary/10 border-b flex items-center justify-between">
                    <p className="text-sm font-medium text-primary">
                        {newOrderIds.size} order baru masuk
                    </p>
                    <button
                        onClick={markAllAsRead}
                        className="text-xs text-primary hover:underline"
                    >
                        Tandai semua dibaca
                    </button>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Pelanggan</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Waktu</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <OrderRow
                                key={order.id}
                                order={order}
                                isNew={newOrderIds.has(order.id)}
                                onMarkRead={markOrderAsRead}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
