"use server";
import prisma from "@/lib/prisma";

export const getProvincies = async () => {
  try {
    const provincies = await prisma.province.findMany({
      orderBy: { name: "asc" },
    });
    return provincies;
  } catch (error) {
    console.error("Error fetching provincies:", error);
    // Opcional: loguear el error
    return []; // Retornar un array vacío en caso de error para evitar fallos en el frontend
  }
};
