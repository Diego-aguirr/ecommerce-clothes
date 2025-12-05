interface SeedProduct {
  description: string;
  images: string[];
  inStock: number;
  price: number;
  sizes: ValidSizes[];
  slug: string;
  tags: string[];
  title: string;
  type: ValidTypes;
  gender: "men" | "women" | "kid" | "unisex";
}

type ValidSizes =
  | "XS"
  | "S"
  | "M"
  | "L"
  | "XL"
  | "XXL"
  | "XXXL"
  | "Único"
  | "Ajustable";
type ValidTypes = "shirts" | "pants" | "hoodies" | "hats" | "accessories";

interface SeedData {
  categories: string[];
  products: SeedProduct[];
}

export const initialData: SeedData = {
  categories: ["Shirts", "Pants", "Hoodies", "Hats", "Accessories"],
  products: [
    // MUJER

    {
      description:
        "Introducing the Tesla Chill Collection. The Women's Chill Half Zip Cropped Hoodie has a premium, soft fleece exterior.",
      images: ["mujer.avif", "mujer2.jpg"],
      inStock: 10,
      price: 130,
      sizes: ["XS", "S", "M", "XXL"],
      slug: "women_chill_half_zip_cropped_hoodie",
      type: "hoodies",
      tags: ["hoodie"],
      title: "Women's Chill Half Zip Cropped Hoodie",
      gender: "women",
    },

    // NIÑOS
    {
      description:
        "Designed for fit, comfort and style, the Kids Cybertruck Graffiti Long Sleeve Tee.",
      images: ["niños.avif", "niños1.avif"],
      inStock: 10,
      price: 30,
      sizes: ["XS", "S", "M"],
      slug: "kids_cybertruck_long_sleeve_te",
      type: "shirts",
      tags: ["shirt"],
      title: "Kids Cybertruck Long Sleeve Tee",
      gender: "kid",
    },

    // HOMBRE - Camisetas
    {
      description:
        "Classic tie made from high-quality silk. Perfect for formal occasions and business meetings.",
      images: ["remeras.avif", "remeras1.avif"],
      inStock: 28,
      price: 45,
      sizes: ["Único"],
      slug: "silk_tie",
      type: "accessories",
      tags: ["tie", "silk"],
      title: "Classic Silk Tie",
      gender: "men",
    },
    // HOMBRE - Accesorios
    {
      description:
        "Anteojos de sol premium con protección UV 400. Diseño moderno y elegante perfecto para el día a día.",
      images: ["anteojos.avif", "anteojos1.jpg"],
      inStock: 15,
      price: 120,
      sizes: ["Único"],
      slug: "anteojos_sol_premium",
      type: "accessories",
      tags: ["anteojos", "sol", "proteccion-uv", "accesorio"],
      title: "Anteojos de Sol Premium",
      gender: "unisex",
    },
  ],
};
