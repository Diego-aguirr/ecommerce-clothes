"use client";

import { useState, useMemo, useCallback } from "react";
import type { VariantsByColor, Size } from "@/interfaces/product.interface";

interface UseProductVariantReturn {
  // Estado
  selectedColor: string;
  selectedSize: Size | undefined;
  selectedVariant: {
    id: string;
    size: Size;
    stock: number;
    sku: string;
  } | undefined;
  
  // Datos derivados
  availableColors: { color: string; label: string; hexCode?: string }[];
  availableSizes: Size[];
  availableSizesForColor: Size[];
  disabledSizes: Size[];
  currentStock: number;
  
  // Acciones
  handleColorChange: (color: string) => void;
  handleSizeChange: (size: Size) => void;
  
  // Validación
  canAddToCart: boolean;
  isOutOfStock: boolean;
}

export const useProductVariant = (
  variantsByColor: VariantsByColor[]
): UseProductVariantReturn => {
  // Estado inicial: primer color disponible
  const [selectedColor, setSelectedColor] = useState<string>(
    variantsByColor[0]?.color || "default"
  );
  
  const [selectedSize, setSelectedSize] = useState<Size | undefined>(undefined);

  // Colores disponibles
  const availableColors = useMemo(() => {
    return variantsByColor.map((vc) => ({
      color: vc.color,
      label: vc.label,
      hexCode: vc.hexCode,
    }));
  }, [variantsByColor]);

  // Variantes del color seleccionado
  const variantsForSelectedColor = useMemo(() => {
    const colorGroup = variantsByColor.find((vc) => vc.color === selectedColor);
    return colorGroup?.variants || [];
  }, [variantsByColor, selectedColor]);

  // Todas las tallas disponibles (de todos los colores)
  const availableSizes = useMemo(() => {
    const sizes = new Set<Size>();
    variantsByColor.forEach((vc) => {
      vc.variants.forEach((v) => sizes.add(v.size));
    });
    return Array.from(sizes).sort();
  }, [variantsByColor]);

  // Tallas disponibles para el color seleccionado
  const availableSizesForColor = useMemo(() => {
    return variantsForSelectedColor
      .filter((v) => v.stock > 0)
      .map((v) => v.size);
  }, [variantsForSelectedColor]);

  // Tallas deshabilitadas (sin stock para el color seleccionado)
  const disabledSizes = useMemo(() => {
    return variantsForSelectedColor
      .filter((v) => v.stock === 0)
      .map((v) => v.size);
  }, [variantsForSelectedColor]);

  // Variante seleccionada (color + talla)
  const selectedVariant = useMemo(() => {
    if (!selectedSize) return undefined;
    return variantsForSelectedColor.find((v) => v.size === selectedSize);
  }, [variantsForSelectedColor, selectedSize]);

  // Stock actual de la variante seleccionada
  const currentStock = selectedVariant?.stock || 0;

  // ¿Se puede agregar al carrito?
  const canAddToCart = !!selectedVariant && selectedVariant.stock > 0;

  // ¿Está fuera de stock el color seleccionado?
  const isOutOfStock = variantsForSelectedColor.every((v) => v.stock === 0);

  // Handlers
  const handleColorChange = useCallback(
    (color: string) => {
      setSelectedColor(color);
      // Resetear talla seleccionada al cambiar de color
      setSelectedSize(undefined);
    },
    []
  );

  const handleSizeChange = useCallback(
    (size: Size) => {
      setSelectedSize(size);
    },
    []
  );

  return {
    selectedColor,
    selectedSize,
    selectedVariant,
    availableColors,
    availableSizes,
    availableSizesForColor,
    disabledSizes,
    currentStock,
    handleColorChange,
    handleSizeChange,
    canAddToCart,
    isOutOfStock,
  };
};
