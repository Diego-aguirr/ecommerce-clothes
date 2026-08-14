"use client";

import { VariantMatrix } from "./variant-matrix";

type Color = {
  color: string;
  label: string;
  hexCode: string;
};

type Variant = {
  sku: string;
  size: string;
  color: string;
  stock: number;
};

type StepVariantsProps = {
  colors: Color[];
  sizes: string[];
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
  productName?: string;
};

export function StepVariants({
  colors,
  sizes,
  variants,
  onChange,
}: StepVariantsProps) {
  const totalVariants = colors.length * sizes.length;
  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {variants.length} de {totalVariants} variantes — Seteá el stock para
          cada combinación de color × talla
        </span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {colors.length}
          </div>
          <div className="text-xs text-gray-500">Colores</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {sizes.length}
          </div>
          <div className="text-xs text-gray-500">Tallas</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-900">{totalStock}</div>
          <div className="text-xs text-gray-500">Stock total</div>
        </div>
      </div>

      {/* Matrix */}
      <VariantMatrix
        colors={colors}
        sizes={sizes}
        variants={variants}
        onChange={onChange}
      />

      {colors.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          Primero agregá colores en el paso anterior.
        </div>
      )}

      {colors.length > 0 && sizes.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          Seleccioná al menos una talla en el paso 1.
        </div>
      )}
    </div>
  );
}
