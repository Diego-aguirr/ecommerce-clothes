/**
 * Seed Orchestrator
 *
 * Punto de entrada principal para el seed de desarrollo.
 * Orchestra: limpieza → provincias → usuarios → categorías → productos → orden test.
 *
 * prisma/seed.ts llama a esta función.
 */

import "dotenv/config";
import { PrismaClient, Size } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { v2 as cloudinary } from "cloudinary";
import { join } from "path";

import { initialData } from "./seed";
import { provinces } from "./seed-province";

// ─── Prisma Client ───────────────────────────────────────────────

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({ adapter });

// ─── Cloudinary Config ───────────────────────────────────────────

if (!process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// ─── Cloudinary Helpers ──────────────────────────────────────────

async function uploadToCloudinary(
  localPath: string,
  folder: string
): Promise<{ url: string; publicId: string }> {
  const fullPath = join(process.cwd(), localPath);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      fullPath,
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Error subiendo a Cloudinary"));
        } else {
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      }
    );
  });
}

async function imageExistsInCloudinary(
  publicId: string
): Promise<{ url: string; publicId: string } | null> {
  try {
    const result = await cloudinary.api.resource(publicId);
    return { url: result.secure_url, publicId: result.public_id };
  } catch {
    return null;
  }
}

function localPathToPublicId(localPath: string): string {
  const cleanPath = localPath.replace(/\.(jpeg|jpg|png|webp)$/i, "");
  return `seed/${cleanPath}`;
}

// ─── Main Seed Function ──────────────────────────────────────────

export async function seed() {
  console.log("🌱 Seeding con imágenes reales...\n");

  // ☁️ Verify Cloudinary
  const cloudinaryConfigured = !!(
    process.env.CLOUDINARY_URL ||
    (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET)
  );

  if (!cloudinaryConfigured) {
    console.error(
      "❌ CLOUDINARY no está configurado en .env\n" +
      "   Necesitás: CLOUDINARY_URL o CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET\n"
    );
    process.exit(1);
  }

  console.log("☁️  Cloudinary configurado\n");

  // 🧹 Clean existing data
  console.log("🧹 Limpiando datos...");
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
  console.log("   ✅ Limpieza completada\n");

  const { categories, products, users } = initialData;

  // 📍 Provinces
  await prisma.province.createMany({ data: provinces });
  console.log(`📍 ${provinces.length} provincias`);

  // 👤 Users
  await prisma.user.createMany({ data: users });
  console.log(`👤 ${users.length} usuarios`);

  // 🏷️ Categories
  await prisma.category.createMany({
    data: categories.map((name) => ({ name })),
  });
  console.log(`🏷️  ${categories.length} categorías`);

  const categoriesDB = await prisma.category.findMany();
  const categoriesMap = categoriesDB.reduce(
    (map, cat) => ({ ...map, [cat.name.toLowerCase()]: cat.id }),
    {} as Record<string, string>
  );

  // 📦 Products + Cloudinary Upload + Colors + Variants
  console.log("\n📸 Subiendo imágenes y creando productos...\n");

  let imagesUploaded = 0;
  let imagesReused = 0;

  for (const product of products) {
    const { type, images, sizes, colors, ...rest } = product;
    console.log(`   📦 ${rest.title}`);

    // Upload product images
    const uploadedImages: { url: string; publicId: string }[] = [];

    for (const imgPath of images) {
      const publicId = localPathToPublicId(imgPath);
      const existing = await imageExistsInCloudinary(publicId);

      if (existing) {
        uploadedImages.push(existing);
        imagesReused++;
        console.log(`      ♻️  ${imgPath.split("/").pop()}`);
      } else {
        try {
          const uploaded = await uploadToCloudinary(imgPath, "seed/products");
          uploadedImages.push(uploaded);
          imagesUploaded++;
          console.log(`      ✅ ${imgPath.split("/").pop()}`);
        } catch (error) {
          console.error(`      ❌ ${imgPath.split("/").pop()}:`, error);
          uploadedImages.push({
            url: "https://res.cloudinary.com/do8xmj9ws/image/upload/v1/seed/products/placeholder.jpg",
            publicId: "seed/products/placeholder",
          });
        }
      }
    }

    // Create product
    const dbProduct = await prisma.product.create({
      data: {
        ...rest,
        categoryId: categoriesMap[type],
        sizes: { set: sizes as Size[] },
      },
    });

    // Create ProductImage (backward compatibility)
    await prisma.productImage.createMany({
      data: uploadedImages.map((img) => ({
        url: img.url,
        publicId: img.publicId,
        productId: dbProduct.id,
      })),
    });

    // Create colors
    const productColors =
      colors && colors.length > 0
        ? colors
        : [{ color: "default", label: "Único", hexCode: "#808080" }];

    const createdColors = [];

    for (const colorData of productColors) {
      const colorImages =
        "images" in colorData && colorData.images
          ? await Promise.all(
              colorData.images.map(async (imgPath: string) => {
                const publicId = localPathToPublicId(imgPath);
                const existing = await imageExistsInCloudinary(publicId);
                if (existing) return existing;
                try {
                  return await uploadToCloudinary(imgPath, "seed/products");
                } catch {
                  return {
                    url: "https://res.cloudinary.com/do8xmj9ws/image/upload/v1/seed/products/placeholder.jpg",
                    publicId: "seed/products/placeholder",
                  };
                }
              })
            )
          : uploadedImages;

      const dbColor = await prisma.productColor.create({
        data: {
          productId: dbProduct.id,
          color: colorData.color,
          label: colorData.label,
          hexCode: colorData.hexCode,
        },
      });

      await prisma.productColorImage.createMany({
        data: colorImages.map((img, index: number) => ({
          url: img.url,
          productColorId: dbColor.id,
          order: index,
        })),
      });

      createdColors.push(dbColor);
    }

    // Create variants (color × size)
    const sizesArray = sizes.length > 0 ? sizes : ["UNICO"];
    const DEFAULT_STOCK = 10;

    for (const color of createdColors) {
      for (const size of sizesArray) {
        const colorSuffix =
          color.color === "default" ? "DEF" : color.color.toUpperCase();
        const sku = `${rest.slug.toUpperCase().replace(/-/g, "_")}-${colorSuffix}-${size}`;

        await prisma.productVariant.create({
          data: {
            productId: dbProduct.id,
            sku,
            size: size as Size,
            color: color.color,
            stock: DEFAULT_STOCK,
            isActive: true,
          },
        });
      }
    }

    console.log(`      → ${createdColors.length} colores, ${sizesArray.length} tallas\n`);
  }

  // 📊 Summary
  const variantCount = await prisma.productVariant.count();
  const colorCount = await prisma.productColor.count();
  const colorImageCount = await prisma.productColorImage.count();
  const productImageCount = await prisma.productImage.count();

  console.log("═══════════════════════════════════════════════");
  console.log("✅ SEED COMPLETADO");
  console.log("═══════════════════════════════════════════════");
  console.log(`   📦 Productos: ${products.length}`);
  console.log(`   🎨 Colores: ${colorCount}`);
  console.log(`   📐 Variantes: ${variantCount}`);
  console.log(`   🖼️  Imágenes: ${productImageCount + colorImageCount}`);
  console.log(`      - Nuevas: ${imagesUploaded}`);
  console.log(`      - Reutilizadas: ${imagesReused}`);
  console.log("═══════════════════════════════════════════════\n");

  // 🧾 Test order
  await createTestOrder();

  console.log("🌱 Seed terminado correctamente");
}

// ─── Test Order ──────────────────────────────────────────────────

async function createTestOrder() {
  const usersDB = await prisma.user.findMany();
  const productsDB = await prisma.product.findMany();

  if (usersDB.length === 0 || productsDB.length < 2) return;

  const user = usersDB.find((u) => u.role === "user") || usersDB[0];
  const product1 = productsDB[0];
  const product2 = productsDB[1];

  const [variants1, variants2] = await Promise.all([
    prisma.productVariant.findMany({ where: { productId: product1.id } }),
    prisma.productVariant.findMany({ where: { productId: product2.id } }),
  ]);

  const variant1 = variants1[0];
  const variant2 = variants2[0];

  const subTotal = product1.price * 1 + product2.price * 2;
  const tax = subTotal * 0.21;
  const shipping = subTotal > 50000 ? 0 : 2500;
  const total = subTotal + tax + shipping;

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      itemsInOrder: 3,
      subTotal,
      tax,
      shipping,
      total,
      status: "paid",
      deliveryStatus: "pending",
      isPaid: true,
      paidAt: new Date(),
      OrderItem: {
        create: [
          {
            productId: product1.id,
            productName: product1.title,
            productDescription: product1.description,
            quantity: 1,
            size: variant1?.size ?? product1.sizes[0] ?? "M",
            price: product1.price,
            variantId: variant1?.id,
            color: variant1?.color ?? "default",
          },
          {
            productId: product2.id,
            productName: product2.title,
            productDescription: product2.description,
            quantity: 2,
            size: variant2?.size ?? product2.sizes[0] ?? "L",
            price: product2.price,
            variantId: variant2?.id,
            color: variant2?.color ?? "default",
          },
        ],
      },
      OrderAddress: {
        create: {
          fullname: "Usuario Test",
          street: "Av. Corrientes 1234",
          apartment: "5B",
          zip: "C1043AAZ",
          city: "Buenos Aires",
          phone: "11 2345-6789",
          dni: "12345678",
          provinceId: provinces[0].id,
        },
      },
      payments: {
        create: {
          amount: total,
          status: "APPROVED",
          provider: "mercadopago",
          providerPaymentId: "TEST_MP_123456",
        },
      },
    },
  });

  await prisma.stockMovement.createMany({
    data: [
      { productId: product1.id, variantId: variant1?.id, type: "sale", quantity: -1 },
      { productId: product2.id, variantId: variant2?.id, type: "sale", quantity: -2 },
    ],
  });

  console.log(`🧾 Orden de test: ${order.orderNumber}`);
}
