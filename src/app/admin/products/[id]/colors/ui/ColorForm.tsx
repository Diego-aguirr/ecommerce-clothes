"use client";

import { useState } from "react";
import { createColor } from "@/actions/admin/colors";

interface Props {
  productId: string;
}

export const ColorForm = ({ productId }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    color: "",
    label: "",
    hexCode: "#808080",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const result = await createColor({
      productId,
      color: formData.color.toLowerCase().replace(/\s+/g, "_"),
      label: formData.label,
      hexCode: formData.hexCode,
    });

    if (result.ok) {
      setMessage({ type: "success", text: "Color creado correctamente" });
      setFormData({ color: "", label: "", hexCode: "#808080" });
    } else {
      setMessage({ type: "error", text: result.message || "Error al crear color" });
    }

    setIsLoading(false);
  };

  // Generar nombre técnico desde label
  const generateTechnicalName = (label: string) => {
    return label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre mostrado */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Nombre visible
        </label>
        <input
          type="text"
          value={formData.label}
          onChange={(e) => {
            const label = e.target.value;
            setFormData({
              ...formData,
              label,
              color: formData.color || generateTechnicalName(label),
            });
          }}
          placeholder="ej: Negro"
          required
          className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:ring-2 focus:ring-foreground focus:border-transparent"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Nombre que verán los clientes
        </p>
      </div>

      {/* Nombre técnico */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Nombre técnico
        </label>
        <input
          type="text"
          value={formData.color}
          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          placeholder="ej: negro"
          required
          className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:ring-2 focus:ring-foreground focus:border-transparent"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Identificador único (ej: negro, azul_marino)
        </p>
      </div>

      {/* Código de color */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Color (hex)
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={formData.hexCode}
            onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })}
            className="w-12 h-10 rounded border border-input cursor-pointer"
          />
          <input
            type="text"
            value={formData.hexCode}
            onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })}
            placeholder="#000000"
            pattern="^#[0-9A-Fa-f]{6}$"
            className="flex-1 px-3 py-2 border border-input rounded-lg text-sm focus:ring-2 focus:ring-foreground focus:border-transparent uppercase"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Color que se mostrará en el selector
        </p>
      </div>

      {/* Preview */}
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-xs font-medium text-muted-foreground mb-2">Vista previa:</p>
        <div className="flex items-center gap-3">
          <span
            className="w-8 h-8 rounded-full border border-border"
            style={{ backgroundColor: formData.hexCode }}
          />
          <span className="text-sm font-medium text-foreground">
            {formData.label || "Nombre del color"}
          </span>
        </div>
      </div>

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
        disabled={isLoading || !formData.label || !formData.color}
        className="w-full py-2.5 px-4 bg-foreground text-background text-sm font-semibold rounded-lg hover:bg-foreground transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Creando..." : "Crear Color"}
      </button>
    </form>
  );
};
