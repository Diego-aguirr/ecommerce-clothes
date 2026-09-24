/**
 * Address Service
 *
 * Responsabilidad: CRUD de direcciones de usuario.
 * Usado por: address actions.
 *
 * Reglas:
 * - Un usuario tiene una sola dirección (upsert pattern)
 * - Validar que el usuario esté autenticado en la capa action
 * - No exponer campos internos (userId, sessionId, timestamps)
 * - Usar "server-only" para evitar imports en client components
 */

import prisma from "@/lib/prisma";
import "server-only";

type AddressData = {
  fullname: string;
  street?: string | null;
  apartment?: string | null;
  zip?: string | null;
  city?: string | null;
  provinceId?: string | null;
  phone: string;
  dni: string;
  description?: string | null;
  shippingMethod: string;
};

/**
 * Obtiene la dirección de un usuario.
 * Retorna null si no tiene dirección.
 */
export async function getUserAddressService(userId: string) {
  const address = await prisma.userAddress.findFirst({
    where: { userId },
  });

  if (!address) return null;

  // Excluir campos internos
   
  const { id, userId: _addressUserId, createdAt, updatedAt, ...rest } = address;
  return {
    ...rest,
    apartment: rest.apartment ?? undefined,
    description: rest.description ?? undefined,
  };
}

/**
 * Crea o actualiza la dirección de un usuario (upsert).
 * Si ya tiene dirección, la actualiza. Si no, la crea.
 */
export async function setUserAddressService(userId: string, data: AddressData) {
  const existing = await prisma.userAddress.findFirst({
    where: { userId },
  });

  const addressData = {
    ...data,
    street: data.street ?? null,
    zip: data.zip ?? null,
    city: data.city ?? null,
    provinceId: data.provinceId ?? null,
    apartment: data.apartment ?? null,
    description: data.description ?? null,
    userId,
  };

  if (existing) {
    return prisma.userAddress.update({
      where: { id: existing.id },
      data: addressData,
    });
  }

  return prisma.userAddress.create({
    data: addressData,
  });
}

/** Elimina todas las direcciones de un usuario. */
export async function deleteUserAddressService(userId: string) {
  return prisma.userAddress.deleteMany({
    where: { userId },
  });
}
