import bcrypt from "bcryptjs";

// Password hasheado para testing: "password123"
const TEST_PASSWORD_HASH = bcrypt.hashSync("r", 10);

export const initialData = {
  users: [
    {
      id: "usr_superadmin_001",
      name: "Super Admin",
      email: "superadmin@test.com",
      emailVerified: new Date(),
      password: TEST_PASSWORD_HASH,
      role: "admin" as const,
      isSuperAdmin: true,
      status: "ACTIVE" as const,
    },
    {
      id: "usr_admin_001",
      name: "Admin Test",
      email: "admin@test.com",
      emailVerified: new Date(),
      password: TEST_PASSWORD_HASH,
      role: "admin" as const,
      isSuperAdmin: false,
      status: "ACTIVE" as const,
    },
    {
      id: "usr_user_001",
      name: "Usuario Test",
      email: "user@test.com",
      emailVerified: new Date(),
      password: TEST_PASSWORD_HASH,
      role: "user" as const,
      isSuperAdmin: false,
      status: "ACTIVE" as const,
    },
  ],

  categories: ["remeras", "pantalones", "buzos", "camperas", "accesorios"],

  products: [
    // ── 1 IMAGEN (SingleImageLayout) ──
    {
      title: "Remera Básica Algodón",
      description: "Remera básica de algodón 100%, perfecta para el día a día.",
      price: 15000,
      slug: "remera-basica-algodon",
      gender: "men" as const,
      type: "remeras",
      tags: ["básica", "algodón"],
      isActive: true,
      sizes: ["S", "M", "L", "XL"],
      colors: [
        {
          color: "negro",
          label: "Negro",
          hexCode: "#000000",
          images: [
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg",
          ],
        },
        {
          color: "blanco",
          label: "Blanco",
          hexCode: "#FFFFFF",
          images: [
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/car-interior-design.jpg",
          ],
        },
      ],
      images: [
        "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg",
      ],
    },

    // ── 2 IMÁGENES (TwoImageLayout) ──
    {
      title: "Remera Oversized Streetwear",
      description:
        "Remera oversized con estampado frontal. Tendencia streetwear.",
      price: 22000,
      slug: "remera-oversized-streetwear",
      gender: "women" as const,
      type: "remeras",
      tags: ["oversized", "streetwear"],
      isActive: true,
      sizes: ["XS", "S", "M", "L"],
      colors: [
        {
          color: "azul_maron",
          label: "Azul Marón",
          hexCode: "#1a1a2e",
          images: [
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png",
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg",
          ],
        },
      ],
      images: [
        "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png",
        "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg",
      ],
    },

    // ── 3 IMÁGENES (MultiImageLayout) ──
    {
      title: "Jean Slim Fit Classic",
      description: "Jean corte slim fit, denim de alta calidad.",
      price: 45000,
      slug: "jean-slim-fit-classic",
      gender: "men" as const,
      type: "pantalones",
      tags: ["jean", "slim"],
      isActive: true,
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: [
        {
          color: "azul_claro",
          label: "Azul Claro",
          hexCode: "#6890c8",
          images: [
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/car-interior-design.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png",
          ],
        },
        {
          color: "azul_oscuro",
          label: "Azul Oscuro",
          hexCode: "#1a237e",
          images: [
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/car-interior-design.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png",
          ],
        },
      ],
      images: [
        "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/car-interior-design.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png",
      ],
    },

    // ── 4 IMÁGENES (MultiImageLayout) ──
    {
      title: "Buzo Kangaroo Hoodie",
      description: "Buzo con capucha y canguro. Algodón francelés.",
      price: 38000,
      slug: "buzo-kangaroo-hoodie",
      gender: "unisex" as const,
      type: "buzos",
      tags: ["buzo", "kangaroo", "hoodie"],
      isActive: true,
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: [
        {
          color: "negro",
          label: "Negro",
          hexCode: "#000000",
          images: [
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png",
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/car-interior-design.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png",
          ],
        },
        {
          color: "gris_melange",
          label: "Gris Melange",
          hexCode: "#9e9e9e",
          images: [
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/car-interior-design.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png",
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/car-interior-design.jpg",
          ],
        },
      ],
      images: [
        "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png",
        "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/car-interior-design.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png",
      ],
    },

    // ── 1 IMAGEN (SingleImageLayout) ──
    {
      title: "Campera Bomber Nylon",
      description: "Campera tipo bomber nylon. Forro interior malla.",
      price: 65000,
      slug: "campera-bomber-nylon",
      gender: "men" as const,
      type: "camperas",
      tags: ["campera", "bomber"],
      isActive: true,
      sizes: ["M", "L", "XL"],
      colors: [
        {
          color: "verde_militar",
          label: "Verde Militar",
          hexCode: "#2d4a22",
          images: [
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg",
          ],
        },
      ],
      images: [
        "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg",
      ],
    },

    // ── 2 IMÁGENES (TwoImageLayout) ──
    {
      title: "Pantalón Jogger Comfort",
      description: "Jogger deportivo con cierre en tobillo.",
      price: 28000,
      slug: "pantalon-jogger-comfort",
      gender: "unisex" as const,
      type: "pantalones",
      tags: ["jogger", "deportivo"],
      isActive: true,
      sizes: ["S", "M", "L", "XL"],
      colors: [
        {
          color: "negro",
          label: "Negro",
          hexCode: "#000000",
          images: [
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/car-interior-design.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png",
          ],
        },
      ],
      images: [
        "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/car-interior-design.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png",
      ],
    },

    // ── 1 IMAGEN (SingleImageLayout) ──
    {
      title: "Remera Kids Dino Print",
      description: "Remera infantil con estampado de dinosaurios.",
      price: 12000,
      slug: "remera-kids-dino-print",
      gender: "kid" as const,
      type: "remeras",
      tags: ["niño", "dinosaurios"],
      isActive: true,
      sizes: ["XS", "S", "M"],
      colors: [
        {
          color: "azul_celeste",
          label: "Azul Celeste",
          hexCode: "#87ceeb",
          images: [
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png",
          ],
        },
      ],
      images: [
        "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png",
      ],
    },

    // ── 3 IMÁGENES (MultiImageLayout) ──
    {
      title: "Buzo Full Zip Premium",
      description: "Buzo con cierre completo. Tejido franelado.",
      price: 42000,
      slug: "buzo-full-zip-premium",
      gender: "women" as const,
      type: "buzos",
      tags: ["buzo", "cierre"],
      isActive: true,
      sizes: ["XS", "S", "M", "L"],
      colors: [
        {
          color: "rosa",
          label: "Rosa",
          hexCode: "#ffb6c1",
          images: [
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/car-interior-design.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png",
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg",
          ],
        },
        {
          color: "lila",
          label: "Lila",
          hexCode: "#c8a2c8",
          images: [
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png",
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/car-interior-design.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg",
          ],
        },
      ],
      images: [
        "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/car-interior-design.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png",
        "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg",
      ],
    },

    // ── 1 IMAGEN (SingleImageLayout) ──
    {
      title: "Gorra Trucker Classic",
      description: "Gorra tipo trucker con malla trasera.",
      price: 8000,
      slug: "gorra-trucker-classic",
      gender: "unisex" as const,
      type: "accesorios",
      tags: ["gorra", "trucker"],
      isActive: true,
      sizes: ["UNICO"],
      colors: [
        {
          color: "negro",
          label: "Negro",
          hexCode: "#000000",
          images: [
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg",
          ],
        },
      ],
      images: [
        "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg",
      ],
    },

    // ── 4 IMÁGENES (MultiImageLayout) ──
    {
      title: "Campera Denim Classic",
      description: "Campera vaquera clásica. Denim lavado medio.",
      price: 55000,
      slug: "campera-denim-classic",
      gender: "women" as const,
      type: "camperas",
      tags: ["campera", "denim"],
      isActive: true,
      sizes: ["XS", "S", "M", "L"],
      colors: [
        {
          color: "azul_medio",
          label: "Azul Medio",
          hexCode: "#4a7ab5",
          images: [
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/car-interior-design.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg",
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png",
            "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/car-interior-design.jpg",
          ],
        },
      ],
      images: [
        "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/car-interior-design.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png",
        "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/car-interior-design.jpg",
      ],
    },
  ],
};
