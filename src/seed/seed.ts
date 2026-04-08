import { Gender, Role, Size, UserStatus } from "@/generated/prisma/client";
import bcryptjs from "bcryptjs";

interface SeedProduct {
  description: string;
  images: string[];
  inStock: number;
  price: number;
  sizes: Size[];
  slug: string;
  tags: string[];
  title: string;
  type: string;
  gender: Gender;
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
      inStock: 10,
      price: 130,
      sizes: [Size.XS, Size.S, Size.M, Size.XXL],
      slug: "women_chill_half_zip_cropped_hoodie",
      type: "hoodies",
      tags: ["hoodie"],
      title: "Women's Chill Half Zip Cropped Hoodie",
      gender: Gender.women,
    },

    {
      description: "Kids Cybertruck Long Sleeve Tee.",
      images: ["niños.avif", "niños1.avif"],
      inStock: 10,
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
      inStock: 28,
      price: 45,
      sizes: [Size.XS, Size.S, Size.M, Size.XXL],
      slug: "silk_tie",
      type: "accessories",
      tags: ["tie", "silk"],
      title: "Classic Silk Tie",
      gender: Gender.men,
    },

    {
      description: "Anteojos de sol premium con protección UV 400.",
      images: ["anteojos.avif", "anteojos1.jpg"],
      inStock: 15,
      price: 120,
      sizes: [Size.UNICO],
      slug: "anteojos_sol_premium",
      type: "accessories",
      tags: ["anteojos", "sol", "uv"],
      title: "Anteojos de Sol Premium",
      gender: Gender.unisex,
    },
  ],
};
