import { MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t mt-20">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Centered container for desktop */}
        <div className="max-w-3xl mx-auto">
          {/* Brand Info - centered */}
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl font-black">PO Galang Dana</h3>
          </div>

          {/* Contact Info - centered with flex layout */}
          <div className="flex flex-col items-center space-y-6 sm:space-y-8">
            <h4 className="text-lg sm:text-xl font-bold text-center">
              Kontak Kami
            </h4>

            <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 justify-center w-full">
              {/* Address */}
              <div className="flex flex-col items-center sm:items-start">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">Alamat</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 text-center sm:text-left">
                  Gereja Maria Bunda Karmel
                  <br />
                  Jakarta Barat
                </p>
              </div>

              {/* Contact Persons */}
              <div className="flex flex-col items-center sm:items-start">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">Kontak Person</span>
                </div>
                <div className="text-sm text-muted-foreground mt-2 text-center sm:text-left">
                  <p>+62 xxx-xxxx-xxxx (Panitia)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright - centered */}
        <div className="mt-12 pt-6 border-t border-muted text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} PO Galang Dana. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
