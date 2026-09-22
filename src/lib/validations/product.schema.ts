import { z } from "zod";

export const ToggleProductStatusSchema = z.object({
  productId: z.uuid({ error: "ID de producto inválido" }),
  isActive: z.boolean(),
});

export const UpdateProductDetailsSchema = z.object({
  productId: z.uuid({ error: "ID de producto inválido" }),
  data: z.object({
    price: z.number().min(0, { error: "El precio no puede ser negativo" }).optional(),
    title: z.string().min(1, { error: "El título es obligatorio" }).optional(),
  }),
});

export const AdjustStockSchema = z.object({
  productId: z.string().uuid({ message: "ID de producto inválido" }),
  adjustment: z.number(),
  type: z.string().min(1, { message: "El tipo es obligatorio" }),
  note: z.string().optional(),
});

import { Size, Gender } from "@/generated/prisma/enums";

// Schema para colores de producto
export const ProductColorSchema = z.object({
  color: z.string().min(1, "El nombre técnico es requerido"),
  label: z.string().min(1, "El nombre visible es requerido"),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Formato HEX inválido (ej: #FF0000)"),
});

// Schema para variantes de producto
export const ProductVariantSchema = z.object({
  sku: z.string().min(1, "El SKU es requerido"),
  size: z.nativeEnum(Size),
  color: z.string().min(1, "El color es requerido"),
  stock: z.number().int().min(0, "El stock no puede ser negativo"),
});

export const CreateProductSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  price: z.number().min(0, "El precio no puede ser negativo"),
  sizes: z.array(z.nativeEnum(Size)).min(1, "Debes seleccionar al menos una talla"),
  tags: z.array(z.string()).min(0, "Debes agregar al menos una etiqueta"),
  gender: z.nativeEnum(Gender),
  categoryId: z.string().uuid("ID de categoría inválido"),
  images: z
    .array(
      z.object({
        url: z.string().min(1, "La URL de la imagen es requerida"),
        publicId: z.string().min(1, "El publicId es requerido para gestionar imágenes")
      })
    )
    .min(1, "Debes subir al menos una imagen del producto"),
  colors: z.array(ProductColorSchema).min(1, "Debes agregar al menos un color"),
  variants: z.array(ProductVariantSchema).min(1, "Debes agregar al menos una variante"),
});
