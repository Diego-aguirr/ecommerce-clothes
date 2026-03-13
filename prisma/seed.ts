import { PrismaClient } from "@/generated/prisma/client";
import { initialData } from "@/seed  /seed";
import { provinces } from "@/seed  /seed-province";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export async function seed() {
  // Limpiar tablas en orden correcto (respetar foreign keys)
  await Promise.all([
    prisma.orderAddress.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.userAddress.deleteMany(),
    prisma.user.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.province.deleteMany(),
  ]);
  const { categories, products, users } = initialData;

  // Provincias
  await prisma.province.createMany({ data: provinces });

  // USUARIOS
  await prisma.user.createMany({ data: users });

  //CATEGORIAS
  const categoriesData = categories.map((name) => ({ name }));

  await prisma.category.createMany({ data: categoriesData });
  const categoriesDB = await prisma.category.findMany();

  const categoriesMap = categoriesDB.reduce(
    (map, category) => {
      map[category.name.toLowerCase()] = category.id;
      return map;
    },
    {} as Record<string, string>,
  );

  // Productos
  products.forEach(async (product) => {
    const { type, images, ...rest } = product;

    const dbProduct = await prisma.product.create({
      data: {
        ...rest,
        categoryId: categoriesMap[type],
      },
    });

    //images

    const imagesData = images.map((image) => ({
      url: image,
      productId: dbProduct.id,
    }));

    await prisma.productImage.createMany({ data: imagesData });
  });

  console.log("Ejecutado Correctamente ");

  // ──────────────────────────────────────────────────────
  // SEED DE ÓRDENES (descomentar cuando se necesite testear)
  // ──────────────────────────────────────────────────────
  // const usersDB = await prisma.user.findMany();
  // const productsDB = await prisma.product.findMany();
  //
  // if (usersDB.length > 0 && productsDB.length >= 2) {
  //   const testUser = usersDB[0];
  //   const product1 = productsDB[0];
  //   const product2 = productsDB[1];
  //
  //   const subTotal = product1.price * 1 + product2.price * 2;
  //   const tax = subTotal * 0.21;
  //   const shipping = subTotal > 50000 ? 0 : 2500;
  //   const total = subTotal + tax + shipping;
  //
  //   const order = await prisma.order.create({
  //     data: {
  //       userId: testUser.id,
  //       itemsInOrder: 3,
  //       subTotal,
  //       tax,
  //       shipping,
  //       total,
  //       status: "pending",
  //       OrderItem: {
  //         createMany: {
  //           data: [
  //             {
  //               productId: product1.id,
  //               quantity: 1,
  //               size: product1.sizes[0] ?? "M",
  //               price: product1.price,
  //             },
  //             {
  //               productId: product2.id,
  //               quantity: 2,
  //               size: product2.sizes[0] ?? "L",
  //               price: product2.price,
  //             },
  //           ],
  //         },
  //       },
  //       OrderAddress: {
  //         create: {
  //           fullname: "Usuario Test",
  //           street: "Av. Corrientes 1234",
  //           apartment: "5B",
  //           zip: "H3500AAB",
  //           city: "Resistencia",
  //           phone: "11 2345-6789",
  //           dni: "12345678",
  //           description: "Casa con reja negra",
  //           provinceId: provinces[0].id,
  //         },
  //       },
  //     },
  //   });
  //
  //   console.log("Orden de prueba creada:", order.id);
  // }
}

(() => {
  if ((globalThis as any).process.env.NODE_ENV === "production") return;
  seed();
})();
