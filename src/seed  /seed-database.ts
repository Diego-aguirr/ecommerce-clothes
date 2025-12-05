import { initialData } from "./seed";
import prisma from "../lib/prisma";

export async function main() {
  await prisma.prodcutImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  console.log("Eliminadas las tablas...");

  console.log("Ejecutado Correctamente...");
}

(() => {
  if ((globalThis as any).process.env.NODE_ENV === "production") return;
  main();
})();
