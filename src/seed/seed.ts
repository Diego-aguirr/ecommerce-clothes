import { Gender, Role, Size } from "@/generated/prisma/client";
import bcryptjs from "bcryptjs";

interface SeedProduct {
  description: string;
  images: string[];
  inStock: number;
  price: number;
  sizes: Size[]; // ✅ Prisma enum
  slug: string;
  tags: string[];
  title: string;
  type: string;
  gender: Gender; // ✅ Prisma enum
}

interface SeedUser {
  email: string;
  password: string;
  name: string;
  role: Role; // ✅ Prisma enum
  emailVerified?: Date;
}

interface SeedData {
  users: SeedUser[];
  categories: string[];
  products: SeedProduct[];
}

export const initialData: SeedData = {
  users: [
    {
      email: "diegoalexisaguirre@hotmail.com",
      password: bcryptjs.hashSync("admin123", 10),
      name: "Admin",
      role: Role.admin, // ✅
      emailVerified: new Date(),
    },
    {
      email: "morado@hotmail.com",
      password: bcryptjs.hashSync("admin123", 10),
      name: "User",
      role: Role.user, // ✅
      emailVerified: new Date(),
    },
  ],

  categories: ["Shirts", "Pants", "Hoodies", "Hats", "Accessories"],

  products: [
    // MUJER
    {
      description:
        "Introducing the Tesla Chill Collection. The Women's Chill Half Zip Cropped Hoodie has a premium, soft fleece exterior.",
      images: ["mujer.avif", "mujer2.jpg"],
      inStock: 10,
      price: 130,
      sizes: [Size.XS, Size.S, Size.M, Size.XXL], // ✅
      slug: "women_chill_half_zip_cropped_hoodie",
      type: "hoodies",
      tags: ["hoodie"],
      title: "Women's Chill Half Zip Cropped Hoodie",
      gender: Gender.women, // ✅
    },

    // NIÑOS
    {
      description:
        "Designed for fit, comfort and style, the Kids Cybertruck Graffiti Long Sleeve Tee.",
      images: ["niños.avif", "niños1.avif"],
      inStock: 10,
      price: 30,
      sizes: [Size.XS, Size.S, Size.M], // ✅
      slug: "kids_cybertruck_long_sleeve_te",
      type: "shirts",
      tags: ["shirt"],
      title: "Kids Cybertruck Long Sleeve Tee",
      gender: Gender.kid, // ✅
    },

    // HOMBRE - Camisetas
    {
      description:
        "Classic tie made from high-quality silk. Perfect for formal occasions and business meetings.",
      images: ["remeras.avif", "remeras1.avif"],
      inStock: 28,
      price: 45,
      sizes: [Size.XS, Size.S, Size.M, Size.XXL], // ✅
      slug: "silk_tie",
      type: "accessories",
      tags: ["tie", "silk"],
      title: "Classic Silk Tie",
      gender: Gender.men, // ✅
    },

    // HOMBRE - Accesorios
    {
      description:
        "Anteojos de sol premium con protección UV 400. Diseño moderno y elegante perfecto para el día a día.",
      images: ["anteojos.avif", "anteojos1.jpg"],
      inStock: 15,
      price: 120,
      sizes: [Size.UNICO], // ✅ CLAVE
      slug: "anteojos_sol_premium",
      type: "accessories",
      tags: ["anteojos", "sol", "proteccion-uv", "accesorio"],
      title: "Anteojos de Sol Premium",
      gender: Gender.unisex, // ✅
    },
  ],
};
