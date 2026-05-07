import type { CartProduct } from "@/interfaces";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface state {
  cart: CartProduct[];
  version: number; // ✅ NUEVO: Para migración de carritos viejos

  addProductToCart: (product: CartProduct) => void;

  updateProductQuantity: (product: CartProduct, quantity: number) => void;
  removeProduct: (product: CartProduct) => void;

  getSummaryInformation: () => {
    subTotal: number;
    tax: number;
    total: number;
    itemsInCart: number;
  };

  clearCart: () => void;
}

// ✅ NUEVO: Versión actual del schema del carrito
const CART_VERSION = 2;

export const useCartStore = create<state>()(
  persist(
    (set, get) => ({
      cart: [],
      version: CART_VERSION,

      // ✅ ACTUALIZADO: Usa variantId como clave única
      addProductToCart: (product: CartProduct) => {
        const { cart } = get();
        
        // Check if product variant already exists in cart (by variantId)
        const productInCart = cart.some(
          (item) => item.variantId === product.variantId
        );
        
        if (!productInCart) {
          set({ cart: [...cart, product] });
          return;
        }
        
        // Product variant exists, increase quantity
        const updatedCartProducts = cart.map((item) => {
          if (item.variantId === product.variantId) {
            return { ...item, quantity: item.quantity + product.quantity };
          }
          return item;
        });

        set({ cart: updatedCartProducts });
      },

      // ✅ ACTUALIZADO: Usa variantId
      updateProductQuantity: (product: CartProduct, quantity: number) => {
        const { cart } = get();
        const updatedCart = cart.map((item) => {
          if (item.variantId === product.variantId) {
            return { ...item, quantity };
          }
          return item;
        });
        set({ cart: updatedCart });
      },

      // ✅ ACTUALIZADO: Usa variantId
      removeProduct: (product: CartProduct) => {
        const { cart } = get();
        const updatedCart = cart.filter(
          (item) => item.variantId !== product.variantId
        );
        set({ cart: updatedCart });
      },

      getSummaryInformation: () => {
        const { cart } = get();
        
        const subTotal = cart.reduce(
          (subTotal, product) => product.quantity * product.price + subTotal,
          0
        );

        const tax = subTotal * 0.21; // Example 21% IVA
        const total = subTotal + tax;
        const itemsInCart = cart.reduce(
          (total, item) => total + item.quantity,
          0
        );

        return {
          subTotal,
          tax,
          total,
          itemsInCart,
        };
      },

      clearCart: () => {
        set({ cart: [] });
      },
    }),

    { 
      name: "cart-storage",
      // ✅ NUEVO: Migración de versiones
      onRehydrateStorage: () => (state) => {
        if (state && state.version !== CART_VERSION) {
          // Versión antigua detectada, limpiar carrito
          console.log("🛒 Versión antigua del carrito detectada, limpiando...");
          state.cart = [];
          state.version = CART_VERSION;
        }
      }
    }
  )
);
