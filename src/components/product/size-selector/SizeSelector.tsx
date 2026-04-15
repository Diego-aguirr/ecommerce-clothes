import type { Size } from "@/interfaces";
import clsx from "clsx";

interface Props {
  selectedSize?: Size;
  availableSizes: Size[];
  onSizeChanged: (size: Size) => void;
}

export const SizeSelector = ({ selectedSize, availableSizes, onSizeChanged }: Props) => {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold uppercase tracking-wide text-gray-700">
        Talle
      </span>
      <div className="flex flex-wrap gap-2">
        {availableSizes.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => onSizeChanged(size)}
            aria-pressed={size === selectedSize}
            aria-label={`Seleccionar talle ${size}`}
            className={clsx(
              "min-w-[48px] h-12 px-4 flex items-center justify-center rounded-lg border font-semibold text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111] focus-visible:ring-offset-1",
              {
                "bg-[#111] border-[#111] text-white shadow-sm": size === selectedSize,
                "bg-white border-gray-200 text-gray-800 hover:border-gray-400 hover:shadow-sm": size !== selectedSize,
              }
            )}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};
