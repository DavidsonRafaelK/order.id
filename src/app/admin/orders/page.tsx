// =============================================================================
// src/app/admin/orders/page.tsx
// Full orders management page — filter, search, sort, realtime table
// =============================================================================

import { getRecentOrders } from "@/app/actions/admin";
import { OrdersTable } from "@/components/admin/orders-table";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Orders — Admin PO Galang Dana",
};

export default async function AdminOrdersPage() {
    const initialOrders = await getRecentOrders(100);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Manajemen Order</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Kelola dan konfirmasi pembayaran pesanan. Update status langsung dari tabel.
                </p>
            </div>
            <OrdersTable initialOrders={initialOrders} />
        </div>
    );
}
