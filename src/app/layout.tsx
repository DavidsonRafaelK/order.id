import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PO Galang Dana — Rekoleksi Lektor 2025",
  description:
    "Sistem pre-order produk UMKM Gereja Maria Bunda Karmel, Jakarta Barat. Pesan makanan dan merchandise langsung via WhatsApp — tanpa registrasi.",
  keywords:
    "pre-order, galang dana, rekoleksi, lektor, gereja, MBK, Jakarta Barat, makanan, UMKM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
