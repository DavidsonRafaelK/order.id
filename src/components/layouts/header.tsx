export default function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            PO Galang Dana Rekoleksi Lektor 2025
          </h1>
          {/* Hanya tampil di mobile (hp), sembunyi di md (tablet) ke atas */}
          <nav className="mt-2 text-sm md:text-base text-gray-600 md:hidden">
            <ul className="flex flex-col md:flex-row gap-2 justify-center">
              <li>Order via Whatsapp</li>
              <li>Dikirim dari gereja MBK</li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
