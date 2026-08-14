"use client";

import { useState } from "react";
import { FiX, FiPlus } from "react-icons/fi";

type Color = {
  color: string;
  label: string;
  hexCode: string;
};

type StepColorsProps = {
  colors: Color[];
  onChange: (colors: Color[]) => void;
};

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

export function StepColors({ colors, onChange }: StepColorsProps) {
  const [showForm, setShowForm] = useState(false);
  const [newColor, setNewColor] = useState<Color>({
    color: "",
    label: "",
    hexCode: "#000000",
  });
  const [error, setError] = useState<string | null>(null);

  const addColor = () => {
    if (!newColor.label.trim()) {
      setError("El nombre del color es obligatorio");
      return;
    }
    if (!HEX_REGEX.test(newColor.hexCode)) {
      setError("El formato HEX debe ser #RRGGBB");
      return;
    }

    const technicalName = newColor.label
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

    // Check duplicate
    if (colors.some((c) => c.color === technicalName)) {
      setError("Ya existe un color con ese nombre");
      return;
    }

    onChange([
      ...colors,
      {
        color: technicalName,
        label: newColor.label.trim(),
        hexCode: newColor.hexCode.toUpperCase(),
      },
    ]);

    setNewColor({ color: "", label: "", hexCode: "#000000" });
    setShowForm(false);
    setError(null);
  };

  const removeColor = (colorToRemove: string) => {
    if (colors.length <= 1) {
      setError("Debe haber al menos un color");
      return;
    }
    onChange(colors.filter((c) => c.color !== colorToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {colors.length} color{colors.length !== 1 && "es"} — Elegí los colores
          que tiene tu producto
        </span>
      </div>

      {/* Color chips */}
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <div
            key={color.color}
            className="flex items-center gap-2 pl-2 pr-1 py-1 bg-gray-50 rounded-lg border border-gray-200"
          >
            <span
              className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
              style={{ backgroundColor: color.hexCode }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">
                {color.label}
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                {color.hexCode}
              </span>
            </div>
            {colors.length > 1 && (
              <button
                type="button"
                onClick={() => removeColor(color.color)}
                className="ml-1 p-1 rounded hover:bg-gray-200 transition text-gray-400 hover:text-red-500"
              >
                <FiX size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add color form */}
      {showForm ? (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
          {error && (
            <p className="text-red-500 text-xs">{error}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Nombre del color
              </label>
              <input
                type="text"
                placeholder="Ej: Rojo, Azul Marino, Verde Oliva..."
                value={newColor.label}
                onChange={(e) => {
                  setNewColor({ ...newColor, label: e.target.value });
                  setError(null);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Color HEX
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={newColor.hexCode}
                  onChange={(e) =>
                    setNewColor({ ...newColor, hexCode: e.target.value })
                  }
                  className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  placeholder="#FF0000"
                  value={newColor.hexCode}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    if (val === "" || /^#[0-9A-F]{0,6}$/.test(val)) {
                      setNewColor({ ...newColor, hexCode: val });
                    }
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          {newColor.label && HEX_REGEX.test(newColor.hexCode) && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <span
                className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm"
                style={{ backgroundColor: newColor.hexCode }}
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  {newColor.label}
                </span>
                <span className="text-xs text-gray-400 ml-2 font-mono">
                  {newColor.hexCode}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={addColor}
              className="flex-1 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition"
            >
              Agregar color
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError(null);
                setNewColor({ color: "", label: "", hexCode: "#000000" });
              }}
              className="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition"
        >
          <FiPlus size={16} />
          Agregar color
        </button>
      )}

      {colors.length === 0 && (
        <div className="text-center py-6 text-gray-400 text-sm">
          Agregá al menos un color para continuar.
        </div>
      )}
    </div>
  );
}
