// =============================================================================
// src/app/admin/products/page.tsx
// Product management page — view all products, toggle availability, add/edit
// =============================================================================

import { getAllProducts } from "@/app/actions/admin";
import { ProductsManager } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Produk — Admin PO Galang Dana",
};

export default async function AdminProductsPage() {
    const initialProducts = await getAllProducts();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Manajemen Produk</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Kelola katalog produk. Toggle ketersediaan, tambah produk baru, atau edit yang sudah ada.
                </p>
            </div>
            <ProductsManager initialProducts={initialProducts} />
        </div>
    );
}
