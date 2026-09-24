"use client";

import { IoAddOutline, IoRemoveOutline } from "react-icons/io5";

interface Props {
  quantity: number;
  onQuantityChanged: (quantity: number) => void;
  max?: number;
}

export const QuantitySelector = ({ quantity, onQuantityChanged, max }: Props) => {
  const change = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity < 1) return;
    if (max !== undefined && newQuantity > max) return;
    onQuantityChanged(newQuantity);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold uppercase tracking-wide text-foreground">
        Cantidad
      </span>
      <div className="flex items-center w-fit border border-border rounded-lg overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => change(-1)}
          aria-label="Disminuir cantidad"
          className="w-11 h-11 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <IoRemoveOutline size={18} />
        </button>
        <span className="w-12 h-11 flex items-center justify-center font-semibold text-foreground border-x border-border select-none">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => change(1)}
          aria-label="Aumentar cantidad"
          className="w-11 h-11 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <IoAddOutline size={18} />
        </button>
      </div>
    </div>
  );
};
