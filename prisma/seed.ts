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
  await Promise.all([
    prisma.user.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.province.deleteMany(),
  ]);
  const { categories, products, users } = initialData;

  // Provincias
  await prisma.province.createMany({ data: provinces });

  //USUARIOS
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
}

(() => {
  if ((globalThis as any).process.env.NODE_ENV === "production") return;
  seed();
})();
