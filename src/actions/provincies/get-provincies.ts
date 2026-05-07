"use server";
import prisma from "@/lib/prisma";
import { provinces } from "@/seed/seed-province";

/**
 * Obtiene las provincias de la base de datos.
 * Si no hay provincias, las seedea automáticamente.
 */
export const getProvincies = async () => {
  try {
    // Verificar si hay provincias, si no, seedearlas
    const count = await prisma.province.count();
    
    if (count === 0) {
      console.log("🌱 Seeding provincias automáticamente...");
      await prisma.province.createMany({
        data: provinces,
        skipDuplicates: true,
      });
      console.log(`✅ ${provinces.length} provincias creadas`);
    }
    
    const provincies = await prisma.province.findMany({
      orderBy: { name: "asc" },
    });
    return provincies;
  } catch (error) {
    console.error("Error fetching provincies:", error);
    return []; // Retornar un array vacío en caso de error para evitar fallos en el frontend
  }
};
