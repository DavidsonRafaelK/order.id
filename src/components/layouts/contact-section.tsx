"use client";

import { MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const contactPersons = [
  {
    name: "Panitia",
    phone: "62xxx",
    role: "Panitia PO",
  },
];

export function ContactSection() {
  const handleWhatsAppContact = (phone: string, name: string) => {
    const message = `Halo ${name}, saya mau pesan PO makanan.`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Ada Pertanyaan? Hubungi Tim Kami
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Tim panitia siap membantu Anda.
          </p>
        </div>

        {/* Single Contact Card - Centered and optimized */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            {contactPersons.map((contact) => (
              <Card
                key={contact.phone}
                className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80"
              >
                <CardContent className="p-6 sm:p-8 text-center space-y-4 sm:space-y-6 relative overflow-hidden">
                  {/* Decorative gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <User className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                    </div>

                    <div className="space-y-3 sm:space-y-4 mt-4">
                      <h3 className="text-2xl sm:text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {contact.name}
                      </h3>
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                        {contact.role}
                      </div>
                    </div>

                    <Button
                      onClick={() =>
                        handleWhatsAppContact(contact.phone, contact.name)
                      }
                      className="w-full gap-2 group-hover:scale-[1.02] transition-transform duration-200 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl mt-6"
                      size="lg"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Chat via WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
