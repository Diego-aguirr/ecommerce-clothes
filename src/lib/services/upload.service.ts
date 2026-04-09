import { cloudinary } from "../storage/cloudinary";
import "server-only";

export async function uploadImageService(file: File, folder: string = "ecommerce"): Promise<{ url: string; publicId: string }> {
  if (file.size === 0) {
    throw new Error("El archivo está vacío");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { 
        folder,
        resource_type: "image", // SEGURIDAD: Solo permite imágenes estrictamente parseables. Bloquea ejecutables/PDFs
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Error desconocido subiendo a Cloudinary"));
        } else {
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      }
    ).end(buffer);
  });
}

export async function deleteImageService(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
