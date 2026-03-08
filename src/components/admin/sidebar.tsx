"use client";

// =============================================================================
// src/components/admin/sidebar.tsx
// Admin sidebar — desktop navigation + logout button
// =============================================================================

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
    { href: "/admin/orders", label: "Orders", icon: "📋", exact: false },
    { href: "/admin/products", label: "Produk", icon: "🛍️", exact: false },
];

export function AdminSidebar({ userEmail }: { userEmail: string }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/admin/login");
        router.refresh();
    };

    return (
        <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-card border-r z-30">
            {/* Brand */}
            <div className="px-6 py-6 border-b">
                <h1 className="text-lg font-bold text-foreground">PO Galang Dana</h1>
                <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Admin navigasi">
                {navItems.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <span aria-hidden>{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* User + Logout */}
            <div className="px-3 py-4 border-t space-y-2">
                <p className="text-xs text-muted-foreground px-3 truncate">{userEmail}</p>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                    🚪 Logout
                </button>
            </div>
        </aside>
    );
}
