import { PrismaClient } from "@/generated/prisma/client";
import { provinces } from "@/seed/seed-province";
import { PRODUCTION_CATEGORIES } from "@/seed/seed-categories";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * 🛡️ PRODUCTION SEED
 *
 * Este script SOLO inserta datos base que la app necesita para funcionar:
 * - Provincias (requeridas para checkout)
 * - Categorías (requeridas para administrar productos)
 *
 * NO inserta:
 * - Usuarios (se crean via registro)
 * - Productos (se crean via admin)
 * - Órdenes (se crean via checkout)
 * - Nada de datos de test
 *
 * Uso:
 *   DATABASE_URL="postgresql://..." npx tsx prisma/seed-prod.ts
 */

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function seedProduction() {
  console.log("🌱 Production Seed — Solo datos base\n");

  // Verificar que no esté vacío (safety check)
  const existingProvinces = await prisma.province.count();
  if (existingProvinces > 0) {
    console.log(`✅ Ya existen ${existingProvinces} provincias. Saltando...`);
  } else {
    await prisma.province.createMany({ data: provinces });
    console.log(`✅ ${provinces.length} provincias creadas`);
  }

  const existingCategories = await prisma.category.count();
  if (existingCategories > 0) {
    console.log(`✅ Ya existen ${existingCategories} categorías. Saltando...`);
  } else {
    await prisma.category.createMany({
      data: PRODUCTION_CATEGORIES.map((name) => ({ name })),
    });
    console.log(`✅ ${PRODUCTION_CATEGORIES.length} categorías creadas`);
  }

  console.log("\n🌱 Production seed completado");
}

seedProduction()
  .catch((e) => {
    console.error("❌ Error en production seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
