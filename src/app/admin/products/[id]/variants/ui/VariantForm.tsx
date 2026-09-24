"use client";

import { useState } from "react";
import { createVariant } from "@/actions/admin/variants";
import type { ProductVariant, ProductColor } from "@/generated/prisma/client";
import type { Size } from "@/interfaces";

interface Props {
  productId: string;
  existingColors: ProductColor[];
  availableSizes: Size[];
  existingVariants: ProductVariant[];
}

const SIZE_ORDER: Size[] = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "UNICO", "AJUSTABLE"];

export const VariantForm = ({
  productId,
  existingColors,
  availableSizes,
  existingVariants,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    sku: "",
    color: existingColors[0]?.color || "default",
    size: availableSizes[0] || "UNICO",
    stock: 0,
  });

  // Calcular SKU sugerido
  const generateSku = (color: string, size: string) => {
    const colorSuffix = color === "default" ? "DEF" : color.toUpperCase().replace(/-/g, "_");
    return `${productId.slice(0, 8).toUpperCase()}-${colorSuffix}-${size}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const result = await createVariant({
      productId,
      sku: formData.sku || generateSku(formData.color, formData.size),
      color: formData.color,
      size: formData.size,
      stock: Number(formData.stock),
    });

    if (result.ok) {
      setMessage({ type: "success", text: "Variante creada correctamente" });
      // Resetear formulario
      setFormData({
        sku: "",
        color: existingColors[0]?.color || "default",
        size: availableSizes[0] || "UNICO",
        stock: 0,
      });
    } else {
      setMessage({ type: "error", text: result.message || "Error al crear variante" });
    }

    setIsLoading(false);
  };

  // Verificar si la combinación ya existe
  const combinationExists = existingVariants.some(
    (v) => v.color === formData.color && v.size === formData.size
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* SKU */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          SKU
        </label>
        <input
          type="text"
          value={formData.sku}
          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          placeholder={generateSku(formData.color, formData.size)}
          className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:ring-2 focus:ring-foreground focus:border-transparent"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Dejar vacío para generar automáticamente
        </p>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Color
        </label>
        <select
          value={formData.color}
          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:ring-2 focus:ring-foreground focus:border-transparent"
        >
          {existingColors.map((color) => (
            <option key={color.color} value={color.color}>
              {color.label}
            </option>
          ))}
        </select>
        {existingColors.length === 0 && (
          <p className="text-xs text-orange-600 mt-1">
            Primero debes crear colores en &quot;Gestionar Colores&quot;
          </p>
        )}
      </div>

      {/* Talla */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Talla
        </label>
        <select
          value={formData.size}
          onChange={(e) => setFormData({ ...formData, size: e.target.value as Size })}
          className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:ring-2 focus:ring-foreground focus:border-transparent"
        >
          {SIZE_ORDER.filter((size) => availableSizes.includes(size)).map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* Stock */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Stock Inicial
        </label>
        <input
          type="number"
          min="0"
          value={formData.stock}
          onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:ring-2 focus:ring-foreground focus:border-transparent"
        />
      </div>

      {/* Mensaje de error si la combinación existe */}
      {combinationExists && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            Ya existe una variante con este color y talla
          </p>
        </div>
      )}

      {/* Mensaje de resultado */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || combinationExists || existingColors.length === 0}
        className="w-full py-2.5 px-4 bg-foreground text-background text-sm font-semibold rounded-lg hover:bg-foreground transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Creando..." : "Crear Variante"}
      </button>
    </form>
  );
};
