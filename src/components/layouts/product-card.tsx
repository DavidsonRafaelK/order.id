"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CartProduct } from "@/types";

interface ProductCardProps {
  product: CartProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart, items } = useCart();

  const isInCart = items.some((item) => item.id === product.id);
  const cartItem = items.find((item) => item.id === product.id);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product);
    setTimeout(() => setIsAdding(false), 300);
  };

  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-card">
      {/* Product Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={product.imageUrl || "/images/fallback.jpg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          {product.category && (
            <Badge
              variant="secondary"
              className="bg-background/90 backdrop-blur-sm"
            >
              {product.category}
            </Badge>
          )}
          {product.isNew && (
            <Badge
              variant="default"
              className="bg-green-500 hover:bg-green-600 text-white backdrop-blur-sm"
            >
              Menu Baru
            </Badge>
          )}
        </div>

        {/* In Cart Indicator */}
        {isInCart && (
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg">
            <Check className="w-4 h-4" />
          </div>
        )}

        {/* Price Overlay */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="text-lg font-bold text-primary">
              Rp {product.price.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isAdding}
          aria-label={
            isInCart
              ? `${product.name} sudah di keranjang`
              : `Tambah ${product.name} ke keranjang`
          }
          className={`w-full gap-2 ${isInCart
            ? "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30"
            : ""
            }`}
          variant={isInCart ? "outline" : "default"}
        >
          {isAdding ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              Menambahkan...
            </>
          ) : isInCart ? (
            <>
              <Check className="w-4 h-4" />
              Di Keranjang ({cartItem?.quantity})
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Tambah ke Keranjang
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Pesan langsung via WhatsApp • Tanpa registrasi
        </p>
      </CardContent>
    </Card>
  );
}
