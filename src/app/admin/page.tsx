// =============================================================================
// src/app/admin/page.tsx
// Admin dashboard — revenue summary cards + realtime order feed
// =============================================================================

import { Suspense } from "react";
import { getRecentOrders, getRevenueSummary } from "@/app/actions/admin";
import { RealtimeOrderFeed } from "@/components/admin/realtime-orders";

export const dynamic = "force-dynamic";

function formatRp(amount: number) {
    return `Rp ${amount.toLocaleString("id-ID")}`;
}

async function RevenueSummaryCards() {
    const summary = await getRevenueSummary();

    const cards = [
        {
            title: "Total Revenue (Lunas)",
            value: formatRp(summary.paidRevenue),
            icon: "✅",
            description: "dari semua order yang sudah dikonfirmasi",
            highlight: true,
        },
        {
            title: "Outstanding (Belum Bayar)",
            value: formatRp(summary.unpaidRevenue),
            icon: "⏳",
            description: "menunggu konfirmasi pembayaran",
            highlight: false,
        },
        {
            title: "Order Masuk Hari Ini",
            value: summary.todayCount.toString(),
            icon: "📬",
            description: "order baru hari ini",
            highlight: false,
        },
        {
            title: "Perlu Dikonfirmasi",
            value: summary.pendingCount.toString(),
            icon: "🔔",
            description: "order menunggu konfirmasi admin",
            highlight: summary.pendingCount > 0,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {cards.map((card) => (
                <div
                    key={card.title}
                    className={`bg-card border rounded-xl p-5 space-y-2 ${card.highlight ? "border-primary/50 ring-1 ring-primary/20" : ""
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                        <span className="text-xl" aria-hidden>{card.icon}</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.description}</p>
                </div>
            ))}
        </div>
    );
}

export default async function AdminDashboardPage() {
    const initialOrders = await getRecentOrders(20);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Ringkasan penjualan dan order masuk secara realtime
                </p>
            </div>

            {/* Revenue summary — server-fetched at page load */}
            <Suspense fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-card border rounded-xl p-5 h-28 animate-pulse" />
                    ))}
                </div>
            }>
                <RevenueSummaryCards />
            </Suspense>

            {/* Realtime order feed */}
            <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">
                    Order Masuk (Live)
                </h2>
                <RealtimeOrderFeed initialOrders={initialOrders} />
            </div>
        </div>
    );
}
