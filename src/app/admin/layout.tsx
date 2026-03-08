// =============================================================================
// src/app/admin/layout.tsx
// Admin area layout — sidebar navigation + header
// All routes under /admin are protected by middleware.ts
// =============================================================================

import { type ReactNode } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata = {
    title: "Admin — PO Galang Dana",
    description: "Dashboard admin untuk manajemen pre-order UMKM Gereja MBK",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Extra server-side guard (middleware is primary guard)
    if (!user) redirect("/admin/login");

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar — hidden on mobile, shown on md+ */}
            <AdminSidebar userEmail={user.email ?? ""} />

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-h-screen md:ml-64">
                {/* Mobile top bar */}
                <header className="md:hidden border-b bg-card px-4 py-3 flex items-center justify-between">
                    <Link href="/admin" className="text-lg font-bold">
                        Admin Panel
                    </Link>
                    <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {user.email}
                    </span>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 md:p-8 overflow-auto">
                    {children}
                </main>

                {/* Mobile bottom nav */}
                <nav className="md:hidden border-t bg-card px-4 py-2 flex justify-around">
                    <Link href="/admin" className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1">
                        📊 Dashboard
                    </Link>
                    <Link href="/admin/orders" className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1">
                        📋 Orders
                    </Link>
                    <Link href="/admin/products" className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1">
                        🛍️ Produk
                    </Link>
                </nav>
            </div>
        </div>
    );
}
