// =============================================================================
// src/components/layouts/product-grid.tsx
// Server Component — fetches products from Supabase via Drizzle.
// No "use client" directive — this runs on the server.
// =============================================================================

import { getProducts } from "@/app/actions/products";
import { ProductCard } from "@/components/layouts/product-card";

export async function ProductGrid() {
  // Server-side fetch — no loading state needed, Next.js handles SSR streaming
  const products = await getProducts();

  if (products.length === 0) {
    return (
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black tracking-tight">Menu Pilihan Kami</h2>
          <p className="text-lg text-muted-foreground">
            Belum ada produk yang tersedia saat ini. Silakan cek kembali nanti.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-12">
      {/* Section Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black tracking-tight">
          Menu Pilihan Kami
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Nikmati berbagai pilihan makanan tradisional dan modern yang dibuat
          dengan bahan-bahan segar dan bumbu autentik
        </p>
      </div>

      {/* Product Count */}
      <div className="text-center">
        <p className="text-muted-foreground">
          Menampilkan semua {products.length} menu
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              description: product.description,
              category: product.category,
              isNew: product.isNew,
            }}
          />
        ))}
      </div>
    </section>
  );
}
