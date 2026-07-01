"use server";

import { requireAdmin } from "@/lib/admin/auth-utils";
import { uploadImageService, deleteImageService } from "@/services/upload.service";
import { logAdminAction } from "@/lib/admin/audit-logger";

export async function uploadProductImage(formData: FormData): Promise<{ ok: boolean; url?: string; publicId?: string; error?: string }> {
  try {
    const admin = await requireAdmin();

    const file = formData.get("file") as File;
    if (!file) {
      return { ok: false, error: "No se proporcionó ningún archivo de imagen" };
    }

    // SEGURIDAD: Límite de peso (5MB) para evitar ataques DoS al servidor
    if (file.size > 5 * 1024 * 1024) {
      return { ok: false, error: "La imagen excede el límite máximo de 5MB" };
    }

    // SEGURIDAD: Tipos estrictos. Bloqueamos SVG (XSS) u otros formatos raros que el front pueda intentar falsificar
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return { ok: false, error: "El archivo no es seguro. Solo se permiten JPG, PNG o WEBP." };
    }

    const { url, publicId } = await uploadImageService(file, "admin-products");

    await logAdminAction({
      adminId: admin.id,
      action: "UPLOAD_IMAGE",
      targetId: "SYSTEM",
      metadata: { url, publicId }
    });

    return { ok: true, url, publicId };
  } catch (error: unknown) {
    console.error("Error crítico subiendo imagen:", error);
    return { ok: false, error: "Fallo temporal del servicio de alojamiento de imágenes. Intenta más tarde." };
  }
}

export async function removeProductImage(publicId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    // Borrado directo de Cloudinary para limpieza
    await deleteImageService(publicId);
    
    await logAdminAction({
      adminId: admin.id,
      action: "DELETE_IMAGE_DRAFT",
      targetId: "SYSTEM",
      metadata: { publicId }
    });

    return { ok: true };
  } catch (error) {
    console.error("Error eliminando imagen de Cloudinary:", error);
    return { ok: false, error: "Error eliminando imagen previsualizada." };
  }
}
