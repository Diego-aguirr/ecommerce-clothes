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
  await prisma.paymentLog.deleteMany();
  await prisma.payment.deleteMany();

  await prisma.orderItem.deleteMany();
  await prisma.orderAddress.deleteMany();
  await prisma.order.deleteMany();

  await prisma.stockMovement.deleteMany();

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

  // 🛍️ Productos
  for (const product of products) {
    const { type, images, sizes, ...rest } = product;

    const dbProduct = await prisma.product.create({
      data: {
        ...rest,
        categoryId: categoriesMap[type],
        sizes: { set: sizes },
      },
    });

    await prisma.productImage.createMany({
      data: images.map((url) => ({
        url,
        productId: dbProduct.id,
      })),
    });
  }

  console.log("✅ Productos creados");

  // ─────────────────────────────────────────────
  // 🧾 ORDENES + PAGOS + STOCK (TEST REAL)
  // ─────────────────────────────────────────────

  const usersDB = await prisma.user.findMany();
  const productsDB = await prisma.product.findMany();

  if (usersDB.length > 0 && productsDB.length >= 2) {
    const user = usersDB[0];
    const product1 = productsDB[0];
    const product2 = productsDB[1];

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
              size: product1.sizes[0] ?? "M",
              price: product1.price,
            },
            {
              productId: product2.id,
              productName: product2.title,
              productDescription: product2.description,
              quantity: 2,
              size: product2.sizes[0] ?? "L",
              price: product2.price,
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
    await prisma.stockMovement.createMany({
      data: [
        {
          productId: product1.id,
          type: "sale",
          quantity: -1,
        },
        {
          productId: product2.id,
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
