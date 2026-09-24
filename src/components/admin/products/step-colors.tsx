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
        <span className="text-sm text-muted-foreground">
          {colors.length} color{colors.length !== 1 && "es"} — Elegí los colores
          que tiene tu producto
        </span>
      </div>

      {/* Color chips */}
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <div
            key={color.color}
            className="flex items-center gap-2 pl-2 pr-1 py-1 bg-muted rounded-lg border border-border"
          >
            <span
              className="w-6 h-6 rounded-full border border-border shadow-sm"
              style={{ backgroundColor: color.hexCode }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {color.label}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {color.hexCode}
              </span>
            </div>
            {colors.length > 1 && (
              <button
                type="button"
                onClick={() => removeColor(color.color)}
                className="ml-1 p-1 rounded hover:bg-border transition text-muted-foreground hover:text-red-500"
              >
                <FiX size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add color form */}
      {showForm ? (
        <div className="p-4 bg-muted rounded-xl border border-border space-y-3">
          {error && (
            <p className="text-red-500 text-xs">{error}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
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
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Color HEX
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={newColor.hexCode}
                  onChange={(e) =>
                    setNewColor({ ...newColor, hexCode: e.target.value })
                  }
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
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
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          {newColor.label && HEX_REGEX.test(newColor.hexCode) && (
            <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
              <span
                className="w-10 h-10 rounded-lg border border-border shadow-sm"
                style={{ backgroundColor: newColor.hexCode }}
              />
              <div>
                <span className="text-sm font-medium text-foreground">
                  {newColor.label}
                </span>
                <span className="text-xs text-muted-foreground ml-2 font-mono">
                  {newColor.hexCode}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={addColor}
              className="flex-1 py-2 bg-foreground text-white text-sm font-medium rounded-lg hover:bg-foreground transition"
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
              className="px-4 py-2 border border-border text-sm rounded-lg hover:bg-muted transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm text-primary font-medium transition"
        >
          <FiPlus size={16} />
          Agregar color
        </button>
      )}

      {colors.length === 0 && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          Agregá al menos un color para continuar.
        </div>
      )}
    </div>
  );
}
