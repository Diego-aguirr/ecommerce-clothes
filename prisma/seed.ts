import { PrismaClient, Prisma } from "@/generated/prisma/client";
import { initialData } from "@/seed  /seed";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export async function seed() {
  await Promise.all([
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.productImage.deleteMany(),
  ]);
  const { categories, products } = initialData;

  //CATEGORIAS
  const categoriesData = categories.map((name) => ({ name }));

  await prisma.category.createMany({ data: categoriesData });
  const categoriesDB = await prisma.category.findMany();

  const categoriesMap = categoriesDB.reduce((map, category) => {
    map[category.name.toLowerCase()] = category.id;
    return map;
  }, {} as Record<string, string>);

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
