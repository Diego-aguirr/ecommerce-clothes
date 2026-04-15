"use client";

import { IoAddOutline, IoRemoveOutline } from "react-icons/io5";

interface Props {
  quantity: number;
  onQuantityChanged: (quantity: number) => void;
}

export const QuantitySelector = ({ quantity, onQuantityChanged }: Props) => {
  const change = (delta: number) => {
    if (quantity + delta < 1) return;
    onQuantityChanged(quantity + delta);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold uppercase tracking-wide text-gray-700">
        Cantidad
      </span>
      <div className="flex items-center w-fit border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => change(-1)}
          aria-label="Disminuir cantidad"
          className="w-11 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#111] transition-colors"
        >
          <IoRemoveOutline size={18} />
        </button>
        <span className="w-12 h-11 flex items-center justify-center font-semibold text-[#111] border-x border-gray-200 select-none">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => change(1)}
          aria-label="Aumentar cantidad"
          className="w-11 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#111] transition-colors"
        >
          <IoAddOutline size={18} />
        </button>
      </div>
    </div>
  );
};
