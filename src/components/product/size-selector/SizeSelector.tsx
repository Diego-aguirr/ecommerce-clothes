"use client";

import type { Size } from "@/interfaces";
import clsx from "clsx";

interface Props {
  selectedSize?: Size;
  availableSizes: Size[];
  disabledSizes?: Size[];
  showStockIndicator?: boolean;
  onSizeChanged: (size: Size) => void;
}

export const SizeSelector = ({ 
  selectedSize, 
  availableSizes, 
  disabledSizes = [],
  showStockIndicator = false,
  onSizeChanged 
}: Props) => {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold uppercase tracking-wide text-foreground">
        Talle
      </span>
      <div className="flex flex-wrap gap-2">
        {availableSizes.map((size) => {
          const isDisabled = disabledSizes.includes(size);
          const isSelected = size === selectedSize;
          
          return (
            <button
              key={size}
              type="button"
              onClick={() => !isDisabled && onSizeChanged(size)}
              disabled={isDisabled}
              aria-pressed={isSelected}
              aria-label={`Seleccionar talle ${size}${isDisabled ? ' (sin stock)' : ''}`}
              className={clsx(
                "min-w-[48px] h-12 px-4 flex items-center justify-center rounded-lg border font-semibold text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111] focus-visible:ring-offset-1 relative",
                {
                  "bg-[#111] border-[#111] text-white shadow-sm": isSelected,
                  "bg-card border-border text-foreground hover:border-foreground hover:shadow-sm": !isSelected && !isDisabled,
                  "bg-secondary border-border text-muted-foreground cursor-not-allowed": isDisabled,
                }
              )}
            >
              {size}
              {isDisabled && showStockIndicator && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
      {disabledSizes.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Algunas tallas pueden no estar disponibles para el color seleccionado
        </p>
      )}
    </div>
  );
};
