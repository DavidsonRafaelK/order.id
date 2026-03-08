"use client";

/*
 * src/components/ui/cart.tsx
 * Shopping cart UI — floating button + cart dialog + order form modal.
 *
 * Key design decisions:
 * - WhatsApp URL built BEFORE the async createOrder() call (fixes popup blocker)
 * - If createOrder() throws, WhatsApp is NOT opened — user sees error toast
 * - Form labels linked to inputs via htmlFor/id for accessibility
 * - Order form uses design system tokens (no raw Tailwind color classes)
 */

import { useState, useEffect, useMemo } from "react";
import { ShoppingCart, Plus, Minus, Trash2, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createOrder } from "@/app/actions/orders";

const CONTACT_PERSON = {
  name: "Panitia",
  phone: "62xxx",
  role: "Panitia PO",
};

function buildWhatsAppUrl(params: {
  contactName: string;
  contactPhone: string;
  customerName: string;
  customerPhone: string;
  orderDetails: string;
  totalPrice: number;
}): string {
  const { contactName, contactPhone, customerName, customerPhone, orderDetails, totalPrice } = params;
  const message = `Halo ${contactName}! Saya ingin memesan:\n\nNama: ${customerName}\nNo. HP: ${customerPhone}\n\n${orderDetails}\n\nTotal: Rp ${totalPrice.toLocaleString("id-ID")}\n\nMohon konfirmasi ketersediaan dan pengiriman. Terima kasih!`;
  return `https://wa.me/${contactPhone}?text=${encodeURIComponent(message)}`;
}

export function Cart() {
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ name: "", phone: "" });
  const { addToast } = useToast();
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  useEffect(() => {
    try {
      const savedData = localStorage.getItem("lektor-customer-data");
      if (savedData) {
        const { name, phone } = JSON.parse(savedData);
        if (name) setCustomerName(name);
        if (phone) setCustomerPhone(phone);
      }
    } catch {
      /* Silently ignore localStorage errors */
    }
  }, []);

  useEffect(() => {
    if (customerName || customerPhone) {
      try {
        localStorage.setItem(
          "lektor-customer-data",
          JSON.stringify({ name: customerName, phone: customerPhone })
        );
      } catch {
        /* Silently ignore localStorage errors */
      }
    }
  }, [customerName, customerPhone]);

  const handleOrderClick = () => {
    if (items.length === 0) return;
    setErrors({ name: "", phone: "" });
    setShowOrderForm(true);
    setIsOpen(false);
  };

  const validateForm = (): boolean => {
    const newErrors = { name: "", phone: "" };

    if (!customerName.trim()) {
      newErrors.name = "Nama lengkap wajib diisi";
    } else if (customerName.trim().length < 2) {
      newErrors.name = "Nama minimal 2 karakter";
    }

    if (!customerPhone.trim()) {
      newErrors.phone = "Nomor telepon wajib diisi";
    } else {
      const phoneRegex = /^(\+62|62|0)[\d\-\s()]{8,15}$/;
      const cleanPhone = customerPhone.trim().replace(/[\s\-()]/g, "");
      if (!phoneRegex.test(customerPhone.trim()) || cleanPhone.length < 9) {
        newErrors.phone = "Masukkan nomor HP Indonesia yang valid (08xxx atau +628xxx)";
      }
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.phone;
  };

  const resetAfterOrder = () => {
    clearCart();
    setCustomerName("");
    setCustomerPhone("");
    setShowOrderForm(false);
    setIsOpen(false);
    try {
      localStorage.removeItem("lektor-customer-data");
    } catch {
      /* ignore */
    }
  };

  const handleOrder = async () => {
    if (items.length === 0 || !validateForm()) return;

    setIsSubmitting(true);

    const orderDetails = items
      .map(
        (item) =>
          `• ${item.name} x${item.quantity} = Rp ${(item.price * item.quantity).toLocaleString("id-ID")}`
      )
      .join("\n");

    /*
     * Build the WhatsApp URL SYNCHRONOUSLY before any async operation.
     * Browsers block window.open() called after await — this fixes the popup blocker bug.
     */
    const whatsappUrl = buildWhatsAppUrl({
      contactName: CONTACT_PERSON.name,
      contactPhone: CONTACT_PERSON.phone,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      orderDetails,
      totalPrice,
    });

    try {
      await createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });

      addToast({
        type: "success",
        title: "Pesanan Berhasil!",
        description: "Data pesanan telah disimpan dan akan dikirim ke WhatsApp",
      });

      /* Only open WhatsApp AFTER the order is successfully saved to the DB. */
      window.open(whatsappUrl, "_blank");
      resetAfterOrder();
    } catch (error) {
      /* createOrder() threw — do NOT open WhatsApp. */
      const message = error instanceof Error ? error.message : "Terjadi kesalahan tak dikenal.";
      addToast({
        type: "error",
        title: "Gagal Menyimpan Pesanan",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Cart Button */}
      <Dialog open={isOpen && !showOrderForm} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            aria-label={`Buka keranjang belanja, ${totalItems} item`}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg hover:shadow-xl z-40"
          >
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-5 w-5 sm:h-6 sm:w-6 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs">
                {totalItems}
              </Badge>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 w-[95vw] sm:w-full">
          <DialogHeader className="p-4 sm:p-6 pb-0">
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              Keranjang Belanja
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6">
            {items.length === 0 ? (
              <div className="text-center py-8 sm:py-12 space-y-4">
                <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto" />
                <div className="space-y-2">
                  <p className="text-base sm:text-lg font-semibold">Keranjang masih kosong</p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Tambahkan makanan untuk mulai memesan
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 pb-4">
                {items.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                        <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                          <Image
                            src={item.imageUrl || "/images/fallback.jpg"}
                            alt={item.name}
                            fill
                            className="object-cover rounded-lg"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <h3 className="font-semibold text-sm sm:text-base leading-tight">
                            {item.name}
                          </h3>
                          <p className="text-primary font-bold text-sm sm:text-base">
                            Rp {item.price.toLocaleString("id-ID")}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Subtotal: Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              aria-label={`Kurangi ${item.name}`}
                              className="h-7 w-7 sm:h-8 sm:w-8"
                            >
                              <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            <div className="w-8 sm:w-12 text-center font-semibold bg-muted px-1 sm:px-2 py-1 rounded text-sm">
                              {item.quantity}
                            </div>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label={`Tambah ${item.name}`}
                              className="h-7 w-7 sm:h-8 sm:w-8"
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeFromCart(item.id)}
                            aria-label={`Hapus ${item.name} dari keranjang`}
                            className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive sm:ml-2"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t bg-muted/30 p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl sm:text-2xl font-bold">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {totalItems} item{totalItems > 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              <Button
                onClick={handleOrderClick}
                size="lg"
                className="gap-2 w-full h-12"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                Pesan via WhatsApp
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Form Modal */}
      <Dialog open={showOrderForm} onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          setShowOrderForm(false);
          setErrors({ name: "", phone: "" });
          setIsOpen(true);
        }
      }}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Lengkapi Data Anda
            </DialogTitle>
            <p className="text-sm text-center text-muted-foreground">
              Isi data untuk melanjutkan pesanan
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            <div className="space-y-2">
              <label
                htmlFor="customer-name"
                className="block text-sm font-semibold text-foreground"
              >
                Nama Lengkap <span className="text-destructive" aria-hidden>*</span>
              </label>
              <input
                id="customer-name"
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="Masukkan nama lengkap"
                autoComplete="name"
                aria-required="true"
                aria-describedby={errors.name ? "name-error" : undefined}
                className={`w-full px-4 py-3 text-base border-2 rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 transition-all ${errors.name
                  ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                  : "border-border focus:border-ring focus:ring-ring/20"
                  }`}
                autoFocus
              />
              {errors.name && (
                <p id="name-error" role="alert" className="text-destructive text-sm">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="customer-phone"
                className="block text-sm font-semibold text-foreground"
              >
                Nomor WhatsApp <span className="text-destructive" aria-hidden>*</span>
              </label>
              <input
                id="customer-phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9+\-\s()]/g, "");
                  setCustomerPhone(v);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                }}
                placeholder="08123456789"
                autoComplete="tel"
                aria-required="true"
                aria-describedby={errors.phone ? "phone-error" : undefined}
                inputMode="numeric"
                className={`w-full px-4 py-3 text-base border-2 rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 transition-all ${errors.phone
                  ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                  : "border-border focus:border-ring focus:ring-ring/20"
                  }`}
              />
              {errors.phone && (
                <p id="phone-error" role="alert" className="text-destructive text-sm">
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="bg-muted border border-border rounded-xl p-5 space-y-3">
              <h4 className="font-semibold text-foreground text-base">Ringkasan Pesanan</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Pesanan:</span>
                  <span className="font-bold text-lg text-primary">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Jumlah Item:</span>
                  <span className="font-medium">{totalItems}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Panitia:</span>
                  <span className="font-medium">{CONTACT_PERSON.name}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <Button
              onClick={handleOrder}
              className="w-full h-12 font-semibold text-base"
              disabled={isSubmitting || !customerName.trim() || !customerPhone.trim()}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Mengirim Pesanan...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Kirim Pesanan
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowOrderForm(false);
                setErrors({ name: "", phone: "" });
                setIsOpen(true);
              }}
              className="w-full h-10"
              disabled={isSubmitting}
            >
              Batal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
