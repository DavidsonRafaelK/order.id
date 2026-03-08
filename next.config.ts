import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // All product images are stored locally in /public — no external image hostnames needed.
  // The previous wildcard hostname (**) has been removed as it was a security risk (SEC-03).
  images: {},

  // HTTP Security Headers (SEC-07)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
