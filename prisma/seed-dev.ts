import { PrismaClient, Size } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { provinces } from "@/seed/seed-province";
import { PRODUCTION_CATEGORIES } from "@/seed/seed-categories";

/**
 * 🌱 SEED DE DESARROLLO — 100% LOCAL
 *
 * Este script SOLO funciona en desarrollo local.
 * Usa imágenes locales de public/products/ en lugar de Cloudinary.
 *
 * ⚠️ PROTECCIONES:
 *   1. Bloquea si NODE_ENV === "production"
 *   2. Bloquea si DATABASE_URL apunta a Neon
 *   3. Bloquea si DATABASE_URL no es localhost/db/127.0.0.1
 *
 * Uso:
 *   docker exec <container> npx tsx prisma/seed-dev.ts
 *   o
 *   npx tsx prisma/seed-dev.ts (si tenés DB local)
 */

// ═════════════════════════════════════════════════════════════════
// 🛡️ PROTECCIONES ANTI-PRODUCCIÓN
// ═════════════════════════════════════════════════════════════════

const env = process.env.NODE_ENV || "development";
const dbUrl = process.env.DATABASE_URL || "";

if (env === "production") {
  console.error("\n🛑 BLOQUEADO: NODE_ENV es 'production'");
  process.exit(1);
}

if (dbUrl.includes("neon.tech")) {
  console.error("\n🛑 BLOQUEADO: DATABASE_URL apunta a Neon (producción)");
  process.exit(1);
}

const isLocalDb =
  dbUrl.includes("localhost") ||
  dbUrl.includes("127.0.0.1") ||
  dbUrl.includes("@db:") || // Docker service name
  dbUrl.includes("://db:"); // Docker internal

if (!isLocalDb) {
  console.error(
    "\n🛑 BLOQUEADO: DATABASE_URL no parece ser una base de datos local."
  );
  console.error("   URL actual:", dbUrl.replace(/\/\/.*@/, "//***@"));
  process.exit(1);
}

console.log("\n✅ Protecciones pasadas — Modo desarrollo confirmado\n");

// ═════════════════════════════════════════════════════════════════
// 🔧 PRISMA CLIENT
// ═════════════════════════════════════════════════════════════════

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// ═════════════════════════════════════════════════════════════════
// 👤 USUARIOS DE TEST
// ═════════════════════════════════════════════════════════════════

const TEST_PASSWORD_HASH = bcrypt.hashSync("r", 10);

const users = [
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
    id: "usr_user_001",
    name: "Usuario Test",
    email: "user@test.com",
    emailVerified: new Date(),
    password: TEST_PASSWORD_HASH,
    role: "user" as const,
    isSuperAdmin: false,
    status: "ACTIVE" as const,
  },
];

// ═════════════════════════════════════════════════════════════════
// 📦 PRODUCTOS CON IMÁGENES LOCALES
// ═════════════════════════════════════════════════════════════════

const products = [
  {
    title: "Remera Básica Algodón",
    description:
      "Remera de algodón 100% de corte clásico. Disponible en varios colores y talles.",
    price: 12000,
    slug: "remera-basica-algodon",
    gender: "men" as const,
    type: "remeras",
    tags: ["básica", "algodón", "casual"],
    isActive: true,
    sizes: ["S", "M", "L", "XL"],
    images: ["remeras.avif", "remeras1.avif"],
  },
  {
    title: "Vestido Casual Mujer",
    description:
      "Vestido casual de temporada. Look fresco y cómodo para el día a día.",
    price: 25000,
    slug: "vestido-casual-mujer",
    gender: "women" as const,
    type: "remeras",
    tags: ["vestido", "casual", "mujer"],
    isActive: true,
    sizes: ["XS", "S", "M", "L"],
    images: ["mujer.avif", "mujer2.jpg"],
  },
  {
    title: "Cartera de Mano Elegante",
    description:
      "Cartera de mano con diseño elegante. Ideal para eventos o uso diario.",
    price: 18000,
    slug: "cartera-mano-elegante",
    gender: "women" as const,
    type: "accesorios",
    tags: ["cartera", "elegante", "mujer"],
    isActive: true,
    sizes: ["UNICO"],
    images: ["cartera.jpg", "cartera2.avif"],
  },
  {
    title: "Conjunto Niño Verano",
    description:
      "Conjunto fresco para niños. Ideal para los días de calor.",
    price: 15000,
    slug: "conjunto-nino-verano",
    gender: "kid" as const,
    type: "remeras",
    tags: ["niños", "verano", "conjunto"],
    isActive: true,
    sizes: ["S", "M", "L"],
    images: ["niños.avif", "niños1.avif"],
  },
  {
    title: "Anteojos de Sol Modernos",
    description:
      "Anteojos de sol con diseño moderno y protección UV.",
    price: 22000,
    slug: "anteojos-sol-modernos",
    gender: "unisex" as const,
    type: "accesorios",
    tags: ["anteojos", "sol", "moderno"],
    isActive: true,
    sizes: ["UNICO"],
    images: ["anteojos.avif", "anteojos1.jpg"],
  },
  {
    title: "Cartera con Correa Mujer",
    description:
      "Cartera práctica con correa ajustable. Perfecta para el día a día.",
    price: 19500,
    slug: "cartera-correa-mujer",
    gender: "women" as const,
    type: "accesorios",
    tags: ["cartera", "mujer", "práctica"],
    isActive: true,
    sizes: ["UNICO"],
    images: ["mujercartera.avif", "mujercarte1.jpg"],
  },
];

// ═════════════════════════════════════════════════════════════════
// 🚀 MAIN SEED FUNCTION
// ═════════════════════════════════════════════════════════════════

async function seedDev() {
  console.log("🌱 Seed de desarrollo — Usando imágenes locales\n");

  // 🧹 Clean existing data (solo local)
  console.log("🧹 Limpiando datos de desarrollo...");
  await prisma.paymentLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.orderAddress.deleteMany();
  await prisma.order.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.productColorImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productColor.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.userAddress.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await prisma.province.deleteMany();
  console.log("   ✅ Datos limpiados\n");

  // 📍 Provincias
  await prisma.province.createMany({ data: provinces });
  console.log(`📍 ${provinces.length} provincias creadas`);

  // 👤 Usuarios
  await prisma.user.createMany({ data: users });
  console.log(`👤 ${users.length} usuarios de test creados`);

  // 🏷️ Categorías
  await prisma.category.createMany({
    data: PRODUCTION_CATEGORIES.map((name) => ({ name })),
  });
  console.log(`🏷️ ${PRODUCTION_CATEGORIES.length} categorías creadas`);

  const categoriesDB = await prisma.category.findMany();
  const categoriesMap = categoriesDB.reduce(
    (map, cat) => ({ ...map, [cat.name.toLowerCase()]: cat.id }),
    {} as Record<string, string>
  );

  // 📦 Productos con imágenes locales
  console.log("\n📦 Creando productos con imágenes locales...\n");

  for (const product of products) {
    const { type, images, sizes, ...rest } = product;
    console.log(`   📦 ${rest.title}`);

    // Crear producto
    const dbProduct = await prisma.product.create({
      data: {
        ...rest,
        categoryId: categoriesMap[type],
        sizes: { set: sizes as Size[] },
      },
    });

    // Crear ProductImage (usando rutas locales)
    await prisma.productImage.createMany({
      data: images.map((url) => ({
        url,
        publicId: url.replace("/products/", ""),
        productId: dbProduct.id,
      })),
    });

    // Crear color default
    const dbColor = await prisma.productColor.create({
      data: {
        productId: dbProduct.id,
        color: "default",
        label: "Único",
        hexCode: "#808080",
      },
    });

    // Crear imágenes para el color
    await prisma.productColorImage.createMany({
      data: images.map((url, index) => ({
        url,
        productColorId: dbColor.id,
        order: index,
      })),
    });

    // Crear variantes (size × color)
    const sizesArray = sizes.length > 0 ? sizes : ["UNICO"];
    const DEFAULT_STOCK = 10;

    for (const size of sizesArray) {
      const sku = `${rest.slug.toUpperCase().replace(/-/g, "_")}-DEF-${size}`;
      await prisma.productVariant.create({
        data: {
          productId: dbProduct.id,
          sku,
          size: size as Size,
          color: "default",
          stock: DEFAULT_STOCK,
          isActive: true,
        },
      });
    }

    console.log(`      ✅ ${images.length} imágenes, ${sizesArray.length} variantes\n`);
  }

  // 📊 Summary
  const productCount = await prisma.product.count();
  const variantCount = await prisma.productVariant.count();
  const imageCount = await prisma.productImage.count();

  console.log("═══════════════════════════════════════════════");
  console.log("✅ SEED DE DESARROLLO COMPLETADO");
  console.log("═══════════════════════════════════════════════");
  console.log(`   📦 Productos: ${productCount}`);
  console.log(`   📐 Variantes: ${variantCount}`);
  console.log(`   🖼️  Imágenes: ${imageCount}`);
  console.log("═══════════════════════════════════════════════\n");
}

// Ejecutar
seedDev()
  .catch((e) => {
    console.error("❌ Error en seed de desarrollo:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
