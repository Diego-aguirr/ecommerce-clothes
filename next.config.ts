import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.mercadopago.com https://sdk.mercadopago.com",
      "style-src 'self' 'unsafe-inline' https://*.mercadopago.com",
      "img-src 'self' blob: data: https://*.unsplash.com https://res.cloudinary.com https://via.placeholder.com https://picsum.photos",
      "font-src 'self'",
      "frame-src 'self' https://*.mercadopago.com",
      "connect-src 'self' https://*.mercadopago.com https://api.cloudinary.com https://api.resend.com",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "**.unsplash.com", // Para todos los subdominios de Unsplash
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // Imágenes subidas via Cloudinary
      },
    ],
    formats: ["image/webp", "image/avif"], // Formatos modernos
  },
  reactCompiler: true,
  experimental: {
    optimizeCss: true,
    // cacheComponents: true, // TODO: Migrate revalidate to 'use cache' first
  },
  // turbopack root is auto-detected, no need to set explicitly
};

export default nextConfig;
