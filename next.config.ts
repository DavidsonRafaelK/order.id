import type { NextConfig } from "next";

/*
 * next.config.ts
 * Next.js configuration — image settings and HTTP security headers.
 */

const nextConfig: NextConfig = {
  /*
   * All product images are stored locally in /public — no external image
   * hostnames needed. The previous wildcard hostname (**) has been removed
   * as it was a security risk.
   */
  images: {},

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
