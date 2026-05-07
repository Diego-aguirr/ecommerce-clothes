import { PrismaClient } from "@/generated/prisma/client";
import { initialData } from "@/seed/seed";
import { provinces } from "@/seed/seed-province";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export async function seed() {
  console.log("🌱 Seeding...");

  // 🧹 ORDEN CORRECTO (muy importante)
  // Primero los que tienen foreign keys a otros
  await prisma.paymentLog.deleteMany();
  await prisma.payment.deleteMany();

  await prisma.orderItem.deleteMany();
  await prisma.orderAddress.deleteMany();
  await prisma.order.deleteMany();

  // ✅ NUEVO: Limpiar modelos de variantes ANTES de productos
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

  const { categories, products, users } = initialData;

  // 📍 Provincias
  await prisma.province.createMany({ data: provinces });

  // 👤 Usuarios
  await prisma.user.createMany({ data: users });

  // 🏷️ Categorías
  await prisma.category.createMany({
    data: categories.map((name) => ({ name })),
  });

  const categoriesDB = await prisma.category.findMany();

  const categoriesMap = categoriesDB.reduce(
    (map, category) => {
      map[category.name.toLowerCase()] = category.id;
      return map;
    },
    {} as Record<string, string>,
  );

  // 🛍️ Productos + Colores + Variantes
  for (const product of products) {
    const { type, images, sizes, colors, ...rest } = product;

    const dbProduct = await prisma.product.create({
      data: {
        ...rest,
        categoryId: categoriesMap[type],
        sizes: { set: sizes },
      },
    });

    // ✅ NUEVO: Crear colores del producto
    const productColors = colors && colors.length > 0
      ? colors
      : [{ color: "default", label: "Único", hexCode: "#808080" }];

    const createdColors = [];
    for (const colorData of productColors) {
      const colorImages = colorData.images || images; // Usa imágenes del color o las principales
      
      const dbColor = await prisma.productColor.create({
        data: {
          productId: dbProduct.id,
          color: colorData.color,
          label: colorData.label,
          hexCode: colorData.hexCode,
        },
      });

      // ✅ NUEVO: Crear imágenes para este color
      await prisma.productColorImage.createMany({
        data: colorImages.map((url, index) => ({
          url,
          productColorId: dbColor.id,
          order: index,
        })),
      });

      createdColors.push(dbColor);
    }

    // Crear variantes para cada combinación color + talla
    const sizesArray = sizes.length > 0 ? sizes : ["UNICO"];
    const DEFAULT_STOCK = 10; // Stock por defecto para seed
    
    for (const color of createdColors) {
      for (const size of sizesArray) {
        const colorSuffix = color.color === "default" ? "DEF" : color.color.toUpperCase();
        const sku = `${rest.slug.toUpperCase().replace(/-/g, "_")}-${colorSuffix}-${size}`;

        await prisma.productVariant.create({
          data: {
            productId: dbProduct.id,
            sku,
            size: size as any,
            color: color.color,
            stock: DEFAULT_STOCK,
            isActive: true,
          },
        });
      }
    }

    // Crear ProductImage tradicional (backward compatibility)
    await prisma.productImage.createMany({
      data: images.map((url) => ({
        url,
        productId: dbProduct.id,
      })),
    });
  }

  // ✅ Contar todo lo creado
  const variantCount = await prisma.productVariant.count();
  const colorCount = await prisma.productColor.count();
  const colorImageCount = await prisma.productColorImage.count();
  
  console.log("✅ Productos y variantes creadas:");
  console.log(`   - Productos: ${products.length}`);
  console.log(`   - Colores: ${colorCount}`);
  console.log(`   - Variantes: ${variantCount}`);
  console.log(`   - Imágenes de colores: ${colorImageCount}`);

  // ─────────────────────────────────────────────
  // 🧾 ORDENES + PAGOS + STOCK (TEST REAL)
  // ─────────────────────────────────────────────

  const usersDB = await prisma.user.findMany();
  const productsDB = await prisma.product.findMany();

  if (usersDB.length > 0 && productsDB.length >= 2) {
    const user = usersDB[0];
    const product1 = productsDB[0];
    const product2 = productsDB[1];

    // ✅ NUEVO: Obtener variantes de los productos
    const variants1 = await prisma.productVariant.findMany({
      where: { productId: product1.id },
    });
    const variants2 = await prisma.productVariant.findMany({
      where: { productId: product2.id },
    });

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
              // ✅ NUEVO: Datos de variante
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
              // ✅ NUEVO: Datos de variante
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

    // 📦 Simular movimiento de stock (IMPORTANTE)
    // ✅ NUEVO: Incluir variantId en los movimientos
    await prisma.stockMovement.createMany({
      data: [
        {
          productId: product1.id,
          variantId: variant1?.id, // ✅ NUEVO
          type: "sale",
          quantity: -1,
        },
        {
          productId: product2.id,
          variantId: variant2?.id, // ✅ NUEVO
          type: "sale",
          quantity: -2,
        },
      ],
    });

    console.log("🧾 Orden creada:", order.orderNumber);
  }

  console.log("🌱 Seed terminado correctamente");
}

(() => {
  if (process.env.NODE_ENV === "production") return;
  seed();
})();
