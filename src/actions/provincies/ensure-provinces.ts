"use server";

import prisma from "@/lib/prisma";
import { provinces } from "@/seed/seed-province";

/**
 * Verifica que las provincias existan en la DB.
 * Si no hay provincias, las crea automáticamente.
 * Esto evita errores de FK al crear órdenes.
 */
export async function ensureProvincesExist(): Promise<boolean> {
  try {
    // Verificar si hay provincias
    const count = await prisma.province.count();
    
    if (count > 0) {
      console.log(`✅ Provincias ya existen (${count} registros)`);
      return true;
    }
    
    console.log("🌱 Seeding provincias...");
    
    // Crear provincias desde el seed
    await prisma.province.createMany({
      data: provinces,
      skipDuplicates: true,
    });
    
    const newCount = await prisma.province.count();
    console.log(`✅ ${newCount} provincias creadas`);
    
    return true;
  } catch (error) {
    console.error("❌ Error seeding provincias:", error);
    return false;
  }
}

/**
 * Obtiene las provincias, asegurándose de que existan primero
 */
export async function getProvincesWithSeed() {
  await ensureProvincesExist();
  
  return prisma.province.findMany({
    orderBy: { name: "asc" },
  });
}
