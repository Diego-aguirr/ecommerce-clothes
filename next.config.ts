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
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // Imágenes subidas via Cloudinary
      },
    ],
    formats: ["image/webp", "image/avif"], // Formatos modernos
  },
  experimental: {
    optimizeCss: true,
  },
  turbopack: {
    root: "/home/clyde/Documentos/work/new-ecommerce-java",
  },
};

export default nextConfig;
