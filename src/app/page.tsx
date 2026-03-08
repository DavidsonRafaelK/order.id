import Footer from "@/components/layouts/footer";
import Header from "@/components/layouts/header";
import { ProductGrid } from "@/components/layouts/product-grid";
import { ContactSection } from "@/components/layouts/contact-section";
import { Cart } from "@/components/ui/cart";

// Page fetches products from DB on every request — disable static prerendering
export const dynamic = "force-dynamic";


export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-20 space-y-32">
        <ProductGrid />
        <ContactSection />
      </main>
      <Footer />
      <Cart />
    </div>
  );
}
