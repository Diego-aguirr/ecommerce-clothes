/**
 * Interfaces para el sistema de variantes de productos
 * FASE 1: Modelo de Datos
 */

// Tipos de color permitidos
export type ProductColorName = 
  | "negro"
  | "blanco"
  | "gris"
  | "gris_melange"
  | "azul"
  | "azul_marino"
  | "rojo"
  | "verde"
  | "beige"
  | "camel"
  | "marron"
  | "crema"
  | (string & {}); // Permitir colores personalizados sin perder autocompletado

// Tipos de tallas (del enum Size de Prisma)
export type Size =
  | "XS"
  | "S"
  | "M"
  | "L"
  | "XL"
  | "XXL"
  | "XXXL"
  | "UNICO"
  | "AJUSTABLE";

// ✅ NUEVO: Variante de producto
export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size: Size;
  color: string;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ NUEVO: Color de producto con imágenes
export interface ProductColor {
  id: string;
  productId: string;
  color: ProductColorName;
  label: string;
  hexCode?: string;
  images: ProductColorImage[];
  createdAt: Date;
  updatedAt: Date;
}

// ✅ NUEVO: Imagen específica por color
export interface ProductColorImage {
  id: string;
  productColorId: string;
  url: string;
  order: number;
}

// ✅ ACTUALIZADO: Producto con variantes
export interface Product {
  id: string;
  description: string;
  images: string[];
  price: number;
  sizes: Size[];
  slug: string;
  tags: string[];
  title: string;
  gender: ProductGender;
  variants?: ProductVariant[];
  colors?: ProductColor[];
}

// ✅ ACTUALIZADO: Producto con variantes incluidas (para queries)
export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
  colors: ProductColor[];
}

// ✅ ACTUALIZADO: Producto en el carrito
export interface CartProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  quantity: number;
  size: Size;
  image: string;
  // ✅ NUEVO:
  variantId?: string;
  color?: string;
  sku?: string;
}

export interface ProductImage {
  id: number;
  url: string;
  productId: string;
}

export type ProductGender = "men" | "women" | "kid" | "unisex" | "outfits";
export type Type = "shirts" | "pants" | "hoodies" | "hats";

// ✅ NUEVO: Input para crear variante
export interface CreateVariantInput {
  productId: string;
  sku: string;
  size: Size;
  color: string;
  stock?: number;
}

// ✅ NUEVO: Input para crear color de producto
export interface CreateProductColorInput {
  productId: string;
  color: string;
  label: string;
  hexCode?: string;
  images?: { url: string }[];
}

// ✅ NUEVO: Agrupación de variantes por color para UI
export interface VariantsByColor {
  color: string;
  label: string;
  hexCode?: string;
  images: string[];
  variants: {
    id: string;
    size: Size;
    stock: number;
    sku: string;
    isActive: boolean;
  }[];
}
