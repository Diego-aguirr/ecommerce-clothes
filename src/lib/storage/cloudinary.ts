import { v2 as cloudinary } from "cloudinary";

if (
  !process.env.CLOUDINARY_URL &&
  (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET)
) {
  console.warn(
    "⚠️ Advertencia: Credenciales de Cloudinary no configuradas en .env",
  );
}

// Si CLOUDINARY_URL está definida en el .env, el SDK se auto-configura.
// Si llamamos a config() con undefined, sobrescribimos esa auto-configuración y provocamos el error de api_key.
if (!process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export { cloudinary };
