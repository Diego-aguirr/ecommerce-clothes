"use client";

import { useState } from "react";
import { FiCheck, FiMinus } from "react-icons/fi";

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

type VariantMatrixProps = {
  colors: Color[];
  sizes: string[];
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
  readOnly?: boolean;
};

export function VariantMatrix({
  colors,
  sizes,
  variants,
  onChange,
  readOnly = false,
}: VariantMatrixProps) {
  const [bulkStock, setBulkStock] = useState<number>(10);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());

  const getVariant = (color: string, size: string) =>
    variants.find((v) => v.color === color && v.size === size);

  const toggleCell = (key: string) => {
    const next = new Set(selectedCells);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setSelectedCells(next);
  };

  const selectAll = () => {
    const all = new Set<string>();
    colors.forEach((c) => sizes.forEach((s) => all.add(`${c.color}-${s}`)));
    setSelectedCells(all);
  };

  const selectNone = () => setSelectedCells(new Set());

  const applyBulkStock = () => {
    const updated = variants.map((v) => {
      const key = `${v.color}-${v.size}`;
      if (selectedCells.size === 0 || selectedCells.has(key)) {
        return { ...v, stock: bulkStock };
      }
      return v;
    });
    onChange(updated);
    setSelectedCells(new Set());
  };

  const updateStock = (color: string, size: string, stock: number) => {
    const updated = variants.map((v) =>
      v.color === color && v.size === size ? { ...v, stock } : v
    );
    onChange(updated);
  };

  const updateSku = (color: string, size: string, sku: string) => {
    const updated = variants.map((v) =>
      v.color === color && v.size === size ? { ...v, sku } : v
    );
    onChange(updated);
  };

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
  const totalVariants = colors.length * sizes.length;

  if (colors.length === 0 || sizes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        Agregá al menos un color y una talla para ver la matriz de variantes.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">
            {variants.length} de {totalVariants} variantes
          </span>
          <span className="text-sm text-gray-500">
            Stock total: <span className="font-semibold text-gray-900">{totalStock}</span>
          </span>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Seleccionar todo
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={selectNone}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium"
            >
              Limpiar
            </button>
          </div>
        )}
      </div>

      {/* Bulk stock controls */}
      {!readOnly && selectedCells.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-sm text-blue-700 font-medium">
            {selectedCells.size} celdas seleccionadas
          </span>
          <input
            type="number"
            min={0}
            value={bulkStock}
            onChange={(e) => setBulkStock(parseInt(e.target.value) || 0)}
            className="w-20 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={applyBulkStock}
            className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
          >
            Aplicar stock
          </button>
        </div>
      )}

      {/* Matrix table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase border-b">
                Color
              </th>
              {sizes.map((size) => (
                <th
                  key={size}
                  className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase border-b"
                >
                  {size}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {colors.map((color) => (
              <tr key={color.color} className="hover:bg-gray-50">
                <td className="px-4 py-3 border-r">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-full border border-gray-200 shrink-0"
                      style={{ backgroundColor: color.hexCode }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {color.label}
                    </span>
                  </div>
                </td>
                {sizes.map((size) => {
                  const variant = getVariant(color.color, size);
                  const cellKey = `${color.color}-${size}`;
                  const isSelected = selectedCells.has(cellKey);
                  const exists = !!variant;

                  return (
                    <td
                      key={size}
                      className={`px-3 py-2 text-center border-l ${
                        isSelected ? "bg-blue-100" : ""
                      }`}
                    >
                      {exists ? (
                        <div className="space-y-1">
                          {!readOnly && (
                            <div className="flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => toggleCell(cellKey)}
                                className={`w-5 h-5 rounded border flex items-center justify-center transition ${
                                  isSelected
                                    ? "bg-blue-500 border-blue-500 text-white"
                                    : "border-gray-300 hover:border-blue-400"
                                }`}
                              >
                                {isSelected && <FiCheck size={12} />}
                              </button>
                            </div>
                          )}
                          <input
                            type="number"
                            min={0}
                            value={variant.stock}
                            onChange={(e) =>
                              updateStock(
                                color.color,
                                size,
                                parseInt(e.target.value) || 0
                              )
                            }
                            readOnly={readOnly}
                            className={`w-full px-2 py-1 text-xs text-center border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                              variant.stock === 0
                                ? "border-red-300 bg-red-50"
                                : variant.stock < 5
                                ? "border-orange-300 bg-orange-50"
                                : "border-gray-200"
                            } ${readOnly ? "bg-gray-50" : ""}`}
                          />
                          {!readOnly && (
                            <input
                              type="text"
                              value={variant.sku}
                              onChange={(e) =>
                                updateSku(color.color, size, e.target.value)
                              }
                              className="w-full px-1 py-0.5 text-[10px] text-center text-gray-400 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                              title="SKU"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-10">
                          <FiMinus size={14} className="text-gray-300" />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded border border-red-300 bg-red-50" />
          Sin stock
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded border border-orange-300 bg-orange-50" />
          Stock bajo (&lt;5)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded border border-gray-200" />
          OK
        </span>
      </div>
    </div>
  );
}
