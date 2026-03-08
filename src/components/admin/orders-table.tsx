"use client";

// =============================================================================
// src/components/admin/orders-table.tsx
// Full-featured orders table with filter, search, sort + Realtime
// =============================================================================

import { useState, useMemo } from "react";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { updatePaymentStatus } from "@/app/actions/admin";
import { useToast } from "@/components/ui/toast";
import type { Order, PaymentStatus } from "@/types";

const STATUS_LABELS: Record<PaymentStatus, string> = {
    unpaid: "Belum Bayar",
    paid: "Lunas",
    cancelled: "Dibatalkan",
};

function formatRp(n: number) {
    return `Rp ${n.toLocaleString("id-ID")}`;
}
function formatDate(d: Date | null | string) {
    if (!d) return "—";
    return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "Asia/Jakarta",
    }).format(new Date(d));
}

type SortKey = "createdAt" | "totalAmount";
type SortDir = "asc" | "desc";

export function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
    const { addToast } = useToast();
    const { orders, newOrderIds } = useRealtimeOrders({ initialOrders });

    const [filterStatus, setFilterStatus] = useState<PaymentStatus | "all">("all");
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("createdAt");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    const filtered = useMemo(() => {
        return orders
            .filter((o) => {
                if (filterStatus !== "all" && o.paymentStatus !== filterStatus) return false;
                if (search) {
                    const q = search.toLowerCase();
                    return (
                        o.customerName.toLowerCase().includes(q) ||
                        o.customerPhone.includes(q)
                    );
                }
                return true;
            })
            .sort((a, b) => {
                let aVal: number, bVal: number;
                if (sortKey === "createdAt") {
                    aVal = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    bVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                } else {
                    aVal = a.totalAmount;
                    bVal = b.totalAmount;
                }
                return sortDir === "desc" ? bVal - aVal : aVal - bVal;
            });
    }, [orders, filterStatus, search, sortKey, sortDir]);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
        else { setSortKey(key); setSortDir("desc"); }
    };

    const handleStatusChange = async (orderId: string, status: PaymentStatus) => {
        try {
            await updatePaymentStatus(orderId, status);
            addToast({ type: "success", title: "Status diperbarui" });
        } catch {
            addToast({ type: "error", title: "Gagal memperbarui status" });
        }
    };

    return (
        <div className="space-y-4">
            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Status filter tabs */}
                <div className="flex gap-1 border rounded-lg p-1 bg-muted w-fit">
                    {(["all", "unpaid", "paid", "cancelled"] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filterStatus === s
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {s === "all" ? "Semua" : STATUS_LABELS[s]}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama atau nomor HP..."
                    className="flex-1 px-4 py-2 border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label="Cari order"
                />
            </div>

            {/* Table */}
            <div className="bg-card border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Pelanggan</th>
                                <th
                                    className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none"
                                    onClick={() => toggleSort("totalAmount")}
                                >
                                    Total {sortKey === "totalAmount" ? (sortDir === "desc" ? "↓" : "↑") : "↕"}
                                </th>
                                <th
                                    className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none"
                                    onClick={() => toggleSort("createdAt")}
                                >
                                    Waktu {sortKey === "createdAt" ? (sortDir === "desc" ? "↓" : "↑") : "↕"}
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-muted-foreground">
                                        Tidak ada order yang sesuai filter
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((order) => (
                                    <tr
                                        key={order.id}
                                        className={`border-b transition-colors ${newOrderIds.has(order.id)
                                                ? "bg-primary/5"
                                                : "hover:bg-muted/50"
                                            }`}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {newOrderIds.has(order.id) && (
                                                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" aria-label="Baru" />
                                                )}
                                                <div>
                                                    <p className="font-medium text-foreground">{order.customerName}</p>
                                                    <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-semibold">{formatRp(order.totalAmount)}</td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(order.createdAt)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${order.paymentStatus === "paid"
                                                    ? "bg-green-100 text-green-800 border-green-200"
                                                    : order.paymentStatus === "cancelled"
                                                        ? "bg-red-100 text-red-800 border-red-200"
                                                        : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                }`}>
                                                {STATUS_LABELS[(order.paymentStatus as PaymentStatus) ?? "unpaid"]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                {(["unpaid", "paid", "cancelled"] as PaymentStatus[]).map((s) => (
                                                    <button
                                                        key={s}
                                                        onClick={() => handleStatusChange(order.id, s)}
                                                        disabled={order.paymentStatus === s}
                                                        className={`text-xs px-2 py-1 rounded border transition-colors ${order.paymentStatus === s
                                                                ? "bg-muted text-muted-foreground cursor-default"
                                                                : "hover:bg-muted text-foreground"
                                                            }`}
                                                        title={STATUS_LABELS[s]}
                                                    >
                                                        {s === "unpaid" ? "⏳" : s === "paid" ? "✅" : "❌"}
                                                    </button>
                                                ))}
                                                <a
                                                    href={`https://wa.me/${order.customerPhone}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs px-2 py-1 rounded border hover:bg-muted transition-colors"
                                                    title="Hubungi via WhatsApp"
                                                >
                                                    💬
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
                    Menampilkan {filtered.length} dari {orders.length} order
                </div>
            </div>
        </div>
    );
}
