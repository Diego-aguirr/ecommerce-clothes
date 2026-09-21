import { PRODUCTION_CATEGORIES } from "./seed-categories";

export const initialData = {
  users: [
    {
      id: "usr_superadmin_001",
      name: "Super Admin",
      email: "superadmin@test.com",
      emailVerified: new Date(),
      role: "admin" as const,
      isSuperAdmin: true,
      status: "ACTIVE" as const,
    },
    {
      id: "usr_admin_001",
      name: "Admin Test",
      email: "admin@test.com",
      emailVerified: new Date(),
      role: "admin" as const,
      isSuperAdmin: false,
      status: "ACTIVE" as const,
    },
    {
      id: "usr_user_001",
      name: "Usuario Test",
      email: "user@test.com",
      emailVerified: new Date(),
      role: "user" as const,
      isSuperAdmin: false,
      status: "ACTIVE" as const,
    },
  ],

  categories: [...PRODUCTION_CATEGORIES],

  products: [
    // ═══════════════════════════════════════════════════════════════
    // 🏷️ REMERAS
    // ═══════════════════════════════════════════════════════════════
    {
      title: "Remera Blanca Básica Hombre",
      description:
        "Remera blanca de algodón 100%, corte clásico. Ideal para el día a día.",
      price: 12000,
      slug: "remera-blanca-basica-hombre",
      gender: "men" as const,
      type: "remeras",
      tags: ["básica", "algodón", "blanca"],
      isActive: true,
      sizes: ["S", "M", "L", "XL"],
      colors: [
        {
          color: "blanco",
          label: "Blanco",
          hexCode: "#FFFFFF",
          images: [
            "img/products/remera-blanca-hombre-producto.jpeg",
            "img/products/remera-blanca-hombre-modelo.jpeg",
          ],
        },
      ],
      images: [
        "img/products/remera-blanca-hombre-producto.jpeg",
        "img/products/remera-blanca-hombre-modelo.jpeg",
      ],
    },
    {
      title: "Remera Blanca Básica Mujer",
      description:
        "Remera blanca femenina de algodón 100%, corte regular. Perfecta para combinar.",
      price: 11000,
      slug: "remera-blanca-basica-mujer",
      gender: "women" as const,
      type: "remeras",
      tags: ["básica", "algodón", "blanca"],
      isActive: true,
      sizes: ["XS", "S", "M", "L"],
      colors: [
        {
          color: "blanco",
          label: "Blanco",
          hexCode: "#FFFFFF",
          images: [
            "img/products/remera-blanca-mujer-producto.jpeg",
            "img/products/remera-blanca-mujer-modelo.jpeg",
          ],
        },
      ],
      images: [
        "img/products/remera-blanca-mujer-producto.jpeg",
        "img/products/remera-blanca-mujer-modelo.jpeg",
      ],
    },
    {
      title: "Musculina Blenda Lino",
      description:
        "Musculina premium de blend lino. Tejido liviano y transpirable, ideal para verano.",
      price: 14000,
      slug: "musculina-blenda-lino",
      gender: "women" as const,
      type: "remeras",
      tags: ["musculina", "lino", "verano"],
      isActive: true,
      sizes: ["XS", "S", "M", "L"],
      colors: [
        {
          color: "natural",
          label: "Natural",
          hexCode: "#E8DCC8",
          images: [
            "img/products/musculina-blenda-lino-shorts-jean-bolso-mujer-producto.jpeg",
            "img/products/musculina-blenda-lino-shorts-jean-bolso-mujer-modelo.jpeg",
          ],
        },
      ],
      images: [
        "img/products/musculina-blenda-lino-shorts-jean-bolso-mujer-producto.jpeg",
        "img/products/musculina-blenda-lino-shorts-jean-bolso-mujer-modelo.jpeg",
      ],
    },
    {
      title: "Camisa Formal Algodón",
      description:
        "Camisa formal de algodón Premium. Corte clásico, ideal para oficina o eventos.",
      price: 18000,
      slug: "camisa-formal-algodon",
      gender: "men" as const,
      type: "remeras",
      tags: ["camisa", "formal", "algodón"],
      isActive: true,
      sizes: ["S", "M", "L", "XL"],
      colors: [
        {
          color: "blanco",
          label: "Blanco",
          hexCode: "#FFFFFF",
          images: [
            "img/products/camisa.jpeg",
            "img/products/camisa2.jpeg",
          ],
        },
      ],
      images: [
        "img/products/camisa.jpeg",
        "img/products/camisa2.jpeg",
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    // 🏷️ PANTALONES
    // ═══════════════════════════════════════════════════════════════
    {
      title: "Jeans Denim Campo Dobladillo",
      description:
        "Jeans denim clásico con dobladillo. Corte recto, lavado medio. Denim de alta calidad.",
      price: 35000,
      slug: "jeans-denim-campo-dobladillo",
      gender: "men" as const,
      type: "pantalones",
      tags: ["jeans", "denim", "clásico"],
      isActive: true,
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: [
        {
          color: "azul_medio",
          label: "Azul Medio",
          hexCode: "#4A7AB5",
          images: [
            "img/products/jeans-denim-campo-dobladillo.jpeg",
          ],
        },
      ],
      images: [
        "img/products/jeans-denim-campo-dobladillo.jpeg",
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    // 🏷️ CAMPERAS
    // ═══════════════════════════════════════════════════════════════
    {
      title: "Campera Cuero Negra Biker",
      description:
        "Campera de cuero negro estilo biker. Forro interior, cierre frontal y detalles con remaches.",
      price: 85000,
      slug: "campera-cuero-negra-biker",
      gender: "men" as const,
      type: "camperas",
      tags: ["cuero", "biker", "negra"],
      isActive: true,
      sizes: ["M", "L", "XL"],
      colors: [
        {
          color: "negro",
          label: "Negro",
          hexCode: "#000000",
          images: [
            "img/products/campera-cuero-negra-biker-reloj-hombre-producto.jpeg",
            "img/products/campera-cuero-negra-biker-reloj-hombre-modelo.jpeg",
          ],
        },
      ],
      images: [
        "img/products/campera-cuero-negra-biker-reloj-hombre-producto.jpeg",
        "img/products/campera-cuero-negra-biker-reloj-hombre-modelo.jpeg",
      ],
    },
    {
      title: "Vestido Verde Lino con Bermuda",
      description:
        "Vestido de lino verde con bermuda. Look casual y fresco, ideal para primavera/verano.",
      price: 28000,
      slug: "vestido-verde-lino-bermuda",
      gender: "women" as const,
      type: "camperas",
      tags: ["vestido", "lino", "verde", "verano"],
      isActive: true,
      sizes: ["XS", "S", "M", "L"],
      colors: [
        {
          color: "verde",
          label: "Verde",
          hexCode: "#4A7C59",
          images: [
            "img/products/vestido-verde-lino-bermuda-bolso-mujer-producto.jpeg",
            "img/products/vestido-verde-lino-bermuda-bolso-mujer-modelo.jpeg",
          ],
        },
      ],
      images: [
        "img/products/vestido-verde-lino-bermuda-bolso-mujer-producto.jpeg",
        "img/products/vestido-verde-lino-bermuda-bolso-mujer-modelo.jpeg",
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    // 🏷️ ACCESORIOS
    // ═══════════════════════════════════════════════════════════════
    {
      title: "Billetera Piel con Llavero",
      description:
        "Billetera de piel genuina con llavero incluido. Diseño clásico y compacto.",
      price: 15000,
      slug: "billetera-piel-llavero",
      gender: "unisex" as const,
      type: "accesorios",
      tags: ["billetera", "piel", "llavero"],
      isActive: true,
      sizes: ["UNICO"],
      colors: [
        {
          color: "marron",
          label: "Marrón",
          hexCode: "#8B4513",
          images: [
            "img/products/billetera-piel-llavero-caps.jpeg",
          ],
        },
      ],
      images: [
        "img/products/billetera-piel-llavero-caps.jpeg",
      ],
    },
    {
      title: "Reloj Negro Deportivo",
      description:
        "Reloj deportivo negro con correa de silicona. Resistente al agua y cronómetro integrado.",
      price: 22000,
      slug: "reloj-negro-deportivo",
      gender: "unisex" as const,
      type: "accesorios",
      tags: ["reloj", "deportivo", "negro"],
      isActive: true,
      sizes: ["UNICO"],
      colors: [
        {
          color: "negro",
          label: "Negro",
          hexCode: "#000000",
          images: [
            "img/products/reloj-negro-mochila-guantes-accesorios.jpeg",
          ],
        },
      ],
      images: [
        "img/products/reloj-negro-mochila-guantes-accesorios.jpeg",
      ],
    },
    {
      title: "Mochila Urbana",
      description:
        "Mochila urbana con múltiples compartimentos. Ideal para uso diario o viajes cortos.",
      price: 18000,
      slug: "mochila-urbana",
      gender: "unisex" as const,
      type: "accesorios",
      tags: ["mochila", "urbana", "viaje"],
      isActive: true,
      sizes: ["UNICO"],
      colors: [
        {
          color: "negro",
          label: "Negro",
          hexCode: "#000000",
          images: [
            "img/products/mochila.jpeg",
          ],
        },
      ],
      images: [
        "img/products/mochila.jpeg",
      ],
    },
  ],
};
