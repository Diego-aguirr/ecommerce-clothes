"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Product, CartProduct, Size } from "@/interfaces";
import { useCartStore } from "@/store/cart/cart-store";
import { SizeSelector } from "@/components/product/size-selector/SizeSelector";
import { IoCheckmarkCircleOutline, IoCartOutline } from "react-icons/io5";
import { getVariantForQuickAdd, QuickVariantInfo } from "@/actions/product/get-variant-for-quick-add";

interface Props {
  product: Product;
}

export const QuickAddToCart = ({ product }: Props) => {
  const addProductToCart = useCartStore((state) => state.addProductToCart);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<Size | undefined>();
  const [selectedVariant, setSelectedVariant] = useState<QuickVariantInfo | null>(null);
  const [hasAdded, setHasAdded] = useState(false);
  const [errorPrompt, setErrorPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    setSelectedVariant(null);
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Cuando el usuario selecciona talla, buscamos la variante
  const handleSizeChange = async (size: Size | undefined) => {
    setSelectedSize(size);
    setSelectedVariant(null);
    
    if (errorPrompt) setErrorPrompt(false);
    
    if (size) {
      setIsLoading(true);
      try {
        const variant = await getVariantForQuickAdd(product.id, size);
        if (variant) {
          setSelectedVariant(variant);
        }
      } catch (error) {
        console.error("Error fetching variant:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedSize || !selectedVariant) {
      setErrorPrompt(true);
      return;
    }

    // Si no hay stock, mostrar error
    if (selectedVariant.stock <= 0) {
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
      // ✅ AHORA SÍ: Datos de variante necesarios para el carrito
      variantId: selectedVariant.id,
      color: selectedVariant.color,
      sku: selectedVariant.sku,
    };

    addProductToCart(cartProduct);
    
    // Feedback visual
    setHasAdded(true);
    setTimeout(() => {
      setHasAdded(false);
      setIsOpen(false);
      setSelectedSize(undefined);
      setSelectedVariant(null);
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
                    {selectedVariant 
                      ? `Agregar ${selectedVariant.color.replace(/_/g, " ")}` 
                      : "Elegí tu talle"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {product.title}
                  </p>
                  {selectedVariant && (
                    <p className="text-xs text-gray-400 mt-1">
                      Talle: {selectedSize}
                    </p>
                  )}
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
                    {/* ✅ NUEVO: Mostrar color seleccionado */}
                    {selectedVariant && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">Color seleccionado:</span>{" "}
                          <span className="capitalize">{selectedVariant.color.replace(/_/g, " ")}</span>
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          SKU: {selectedVariant.sku}
                        </p>
                      </div>
                    )}

                    <SizeSelector
                      selectedSize={selectedSize}
                      availableSizes={product.sizes}
                      disabledSizes={[]} // Podríamos deshabilitar las sin stock
                      onSizeChanged={handleSizeChange}
                    />
                    
                    {/* Info de stock */}
                    {selectedVariant && (
                      <p className={`text-sm mt-3 font-medium px-3 py-2 rounded transition-all ${
                        selectedVariant.stock > 0 
                          ? 'text-green-600 bg-green-50' 
                          : 'text-red-600 bg-red-50'
                      }`}>
                        {selectedVariant.stock > 0 
                          ? `✓ Stock disponible: ${selectedVariant.stock} unidades` 
                          : '✗ Sin stock disponible'
                        }
                      </p>
                    )}
                    
                    {isLoading && (
                      <p className="text-sm text-gray-500 mt-3 px-3">
                        Verificando disponibilidad...
                      </p>
                    )}
                    
                    {errorPrompt && !selectedVariant && (
                      <p className="text-sm text-red-500 mt-3 font-medium bg-red-50 p-2 rounded px-3 transition-all">
                        ⚠️ Seleccioná un talle disponible.
                      </p>
                    )}
                  </div>

                  <div className="mt-2 flex gap-3">
                    <button
                      onClick={handleAdd}
                      disabled={!selectedSize || !selectedVariant || selectedVariant.stock <= 0 || isLoading}
                      className={`flex-1 py-3.5 rounded-lg font-bold text-base shadow-md transition-all active:scale-[0.98] ${
                        !selectedSize || !selectedVariant || selectedVariant.stock <= 0 || isLoading
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-[#111] hover:bg-[#333] text-white'
                      }`}
                    >
                      {isLoading 
                        ? 'Verificando...' 
                        : selectedVariant && selectedVariant.stock <= 0
                        ? 'Sin stock'
                        : selectedVariant
                        ? `Agregar ${selectedVariant.color.replace(/_/g, " ")} - ${selectedSize}`
                        : 'Confirmar talle'
                      }
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
