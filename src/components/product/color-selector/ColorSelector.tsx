"use client";

import clsx from "clsx";

interface ColorOption {
  color: string;
  label: string;
  hexCode?: string;
}

interface Props {
  colors: ColorOption[];
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export const ColorSelector = ({ colors, selectedColor, onColorChange }: Props) => {
  // Si solo hay un color (default), no mostrar selector
  if (colors.length <= 1 && colors[0]?.color === "default") {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold uppercase tracking-wide text-foreground">
          Color
        </span>
        <span className="text-sm text-muted-foreground">
          {colors.find((c) => c.color === selectedColor)?.label || selectedColor}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {colors.map((colorOption) => (
          <button
            key={colorOption.color}
            type="button"
            onClick={() => onColorChange(colorOption.color)}
            aria-pressed={colorOption.color === selectedColor}
            aria-label={`Seleccionar color ${colorOption.label}`}
            className={clsx(
              "group relative w-10 h-10 rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              {
                "ring-2 ring-foreground ring-offset-2": colorOption.color === selectedColor,
                "hover:scale-110": colorOption.color !== selectedColor,
              }
            )}
            style={{
              backgroundColor: colorOption.hexCode || "#808080",
            }}
            title={colorOption.label}
          >
            {/* Indicador de selección */}
            {colorOption.color === selectedColor && (
              <span className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white drop-shadow-md"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
            
            {/* Borde para colores claros */}
            <span 
              className="absolute inset-0 rounded-full border-2 border-border group-hover:border-border"
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
