"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Product, CartProduct, Size } from "@/interfaces";
import { useCartStore } from "@/store/cart/cart-store";
import { SizeSelector } from "@/components/product/size-selector/SizeSelector";
import { IoCheckmarkCircleOutline, IoCartOutline } from "react-icons/io5";

interface Props {
  product: Product;
}

export const QuickAddToCart = ({ product }: Props) => {
  const addProductToCart = useCartStore((state) => state.addProductToCart);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<Size | undefined>();
  const [hasAdded, setHasAdded] = useState(false);
  const [errorPrompt, setErrorPrompt] = useState(false);

  // Funciones strictas para control de propagación debido a que
  // el contenedor padre es usualmente un <Link> a la PDP.
  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    setErrorPrompt(false);
    setSelectedSize(undefined);
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedSize) {
      setErrorPrompt(true);
      return;
    }

    const cartProduct: CartProduct = {
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      quantity: 1,
      size: selectedSize,
      image: product.images[0],
    };

    addProductToCart(cartProduct);
    
    // Feedback visual
    setHasAdded(true);
    setTimeout(() => {
      setHasAdded(false);
      setIsOpen(false);
    }, 2500);
  };

  return (
    <>
      {/* ── BOTÓN DISPARADOR (Overlay en tarjeta de producto) ── */}
      <button
        onClick={handleOpen}
        disabled={hasAdded}
        className="w-full bg-[#111] hover:bg-[#333] text-white py-2.5 px-3 flex items-center justify-center gap-2 font-medium text-sm transition-all rounded-md shadow-sm disabled:bg-gray-400 group"
      >
        {hasAdded ? (
          <>
            <IoCheckmarkCircleOutline size={18} />
            <span>Agregado</span>
          </>
        ) : (
          <>
            <IoCartOutline size={18} className="transition-transform group-hover:scale-110" />
            <span>Agregar</span>
          </>
        )}
      </button>

      {/* ── MODAL LAZY LOADED CON PORTAL (Para evadir Stacking Context) ── */}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            // Backdrop oscuro
            onClick={handleClose}
            className="fixed inset-0 z-[9999] bg-black/60 flex items-end sm:items-center justify-center transition-opacity"
          >
            {/* Contenido del Modal */}
            <div
              onClick={stopPropagation}
              className="bg-white w-full sm:w-[400px] h-auto rounded-t-2xl sm:rounded-2xl p-6 pb-8 shadow-2xl animate-slide-up flex flex-col gap-5 border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">
                    Elegí tu talle
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {product.title}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2 -mr-2 -mt-2 bg-gray-50 rounded-full"
                  aria-label="Cerrar modal"
                >
                  ✕
                </button>
              </div>

              {hasAdded ? (
                <div className="flex flex-col items-center justify-center py-6 gap-3">
                  <IoCheckmarkCircleOutline className="text-green-500 text-6xl animate-bounce" />
                  <p className="text-gray-900 font-semibold">Producto agregado</p>
                  <p className="text-sm text-gray-500">Perfecto, ya está en tu carrito.</p>
                </div>
              ) : (
                <>
                  <div className="py-2">
                    <SizeSelector
                      selectedSize={selectedSize}
                      availableSizes={product.sizes}
                      onSizeChanged={(size) => {
                        setSelectedSize(size);
                        if (errorPrompt) setErrorPrompt(false);
                      }}
                    />
                    {errorPrompt && (
                      <p className="text-sm text-red-500 mt-3 font-medium bg-red-50 p-2 rounded px-3 transition-all">
                        ⚠️ Seleccioná un talle por favor.
                      </p>
                    )}
                  </div>

                  <div className="mt-2 flex gap-3">
                    <button
                      onClick={handleAdd}
                      className="flex-1 bg-[#111] hover:bg-[#333] text-white py-3.5 rounded-lg font-bold text-base shadow-md transition-all active:scale-[0.98]"
                    >
                      Confirmar talle
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
