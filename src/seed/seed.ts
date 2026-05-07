import { Gender, Role, Size, UserStatus } from "@/generated/prisma/client";
import bcryptjs from "bcryptjs";

// ✅ NUEVO: Interfaz para colores de producto
interface SeedProductColor {
  color: string;
  label: string;
  hexCode?: string;
  images?: string[]; // Si no se especifica, usa las imágenes principales
}

// ✅ ACTUALIZADO: Producto con soporte para colores
interface SeedProduct {
  description: string;
  images: string[];
  price: number;
  sizes: Size[];
  slug: string;
  tags: string[];
  title: string;
  type: string;
  gender: Gender;
  colors?: SeedProductColor[];
}

interface SeedUser {
  email: string;
  password: string;
  name: string;
  role: Role;
  isSuperAdmin?: boolean;
  status?: UserStatus;
  emailVerified?: Date;
}

interface SeedData {
  users: SeedUser[];
  categories: string[];
  products: SeedProduct[];
}

export const initialData: SeedData = {
  users: [
    // 🔥 SUPER ADMIN (control total del sistema)
    {
      email: "javagutierrrez@gmail.com",
      password: bcryptjs.hashSync("a244#DDSSA09", 10),
      name: "Java Gutierrez",
      role: Role.admin,
      isSuperAdmin: true,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
    {
      email: "superadmin@shop.com",
      password: bcryptjs.hashSync("admin123", 10),
      name: "Super Admin",
      role: Role.admin,
      isSuperAdmin: true,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },

    // 🔥 ADMIN NORMAL (gestiona tienda pero no todo)
    {
      email: "admin@shop.com",
      password: bcryptjs.hashSync("admin123", 10),
      name: "Admin",
      role: Role.admin,
      isSuperAdmin: false,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },

    // 👤 USER NORMAL
    {
      email: "user@shop.com",
      password: bcryptjs.hashSync("user123", 10),
      name: "User",
      role: Role.user,
      isSuperAdmin: false,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  ],

  categories: ["Shirts", "Pants", "Hoodies", "Hats", "Accessories"],

  products: [
    {
      description: "Women's Chill Half Zip Cropped Hoodie premium fleece.",
      images: ["mujer.avif", "mujer2.jpg"],
      price: 130,
      sizes: [Size.XS, Size.S, Size.M, Size.XXL],
      slug: "women_chill_half_zip_cropped_hoodie",
      type: "hoodies",
      tags: ["hoodie"],
      title: "Women's Chill Half Zip Cropped Hoodie",
      gender: Gender.women,
      colors: [
        { color: "negro", label: "Negro", hexCode: "#000000" },
        { color: "gris", label: "Gris", hexCode: "#808080" },
      ],
    },

    {
      description: "Kids Cybertruck Long Sleeve Tee.",
      images: ["niños.avif", "niños1.avif"],
      price: 30,
      sizes: [Size.XS, Size.S, Size.M],
      slug: "kids_cybertruck_long_sleeve_te",
      type: "shirts",
      tags: ["shirt"],
      title: "Kids Cybertruck Long Sleeve Tee",
      gender: Gender.kid,
    },

    {
      description: "Classic silk tie for formal occasions.",
      images: ["remeras.avif", "remeras1.avif"],
      price: 45,
      sizes: [Size.XS, Size.S, Size.M, Size.XXL],
      slug: "silk_tie",
      type: "accessories",
      tags: ["tie", "silk"],
      title: "Classic Silk Tie",
      gender: Gender.men,
      colors: [
        { color: "azul_marino", label: "Azul Marino", hexCode: "#000080" },
        { color: "negro", label: "Negro", hexCode: "#000000" },
        { color: "rojo", label: "Rojo", hexCode: "#FF0000" },
      ],
    },

    {
      description: "Anteojos de sol premium con protección UV 400.",
      images: ["anteojos.avif", "anteojos1.jpg"],
      price: 120,
      sizes: [Size.UNICO],
      slug: "anteojos_sol_premium",
      type: "accessories",
      tags: ["anteojos", "sol", "uv"],
      title: "Anteojos de Sol Premium",
      gender: Gender.unisex,
      colors: [
        { color: "negro", label: "Negro Brillante", hexCode: "#000000" },
        { color: "marron", label: "Carey", hexCode: "#8B4513" },
      ],
    },
  ],
};
