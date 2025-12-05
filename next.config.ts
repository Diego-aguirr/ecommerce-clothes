import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ],
    formats: ["image/webp", "image/avif"], // Formatos modernos
  },
  experimental: {
    optimizeCss: true,
  },
  turbopack: {
    root: "/home/macaco/Documentos/agentes/Frontend Developer/new-ecommerce/",
  },
};

export default nextConfig;
