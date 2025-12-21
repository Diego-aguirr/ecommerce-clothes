import type { CartProduct } from "@/interfaces";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface state {
  cart: CartProduct[];

  addProductToCart: (product: CartProduct) => void;

  updateProductQuantity: (product: CartProduct, quantity: number) => void;
  removeProduct: (product: CartProduct) => void;
}

export const useCartStore = create<state>()(
  persist(
    (set, get) => ({
      cart: [],

      //method

      addProductToCart: (product: CartProduct) => {
        const { cart } = get();
        //1. Check if product already exists in cart
        const productIncart = cart.some(
          (item) => item.id === product.id && item.size === product.size
        );
        if (!productIncart) {
          set({ cart: [...cart, product] });
          return;
        }
        //2. I know the product exists in different sizes; I need to increase quantity.

        const updatedCartProducts = cart.map((item) => {
          if (item.id === product.id && item.size === product.size) {
            return { ...item, quantity: item.quantity + product.quantity };
          }
          return item;
        });

        set({ cart: updatedCartProducts });
      },

      updateProductQuantity: (product: CartProduct, quantity: number) => {
        const { cart } = get();
        const updatedCart = cart.map((item) => {
          if (item.id === product.id && item.size === product.size) {
            return { ...item, quantity };
          }
          return item;
        });
        set({ cart: updatedCart });
      },

      removeProduct: (product: CartProduct) => {
        const { cart } = get();
        const updatedCart = cart.filter(
          (item) => item.id !== product.id || item.size !== product.size
        );
        set({ cart: updatedCart });
      },
    }),

    { name: "cart-storage" }
  )
);
