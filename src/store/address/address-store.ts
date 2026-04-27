import { create } from "zustand";
import { persist } from "zustand/middleware";

type ShippingMethod = "delivery" | "pickup";

interface State {
  address: {
    fullname: string;
    street?: string;
    apartment?: string;
    zip?: string;
    city?: string;
    provinceId?: string;
    phone: string;
    dni: string;
    description?: string;
  };

  shippingMethod: ShippingMethod;

  //Methods
  setAddress: (address: State["address"]) => void;
  setShippingMethod: (method: ShippingMethod) => void;
}

export const useAddressStore = create<State>()(
  persist(
    (set) => ({
      address: {
        fullname: "",
        street: "",
        apartment: "",
        zip: "",
        city: "",
        provinceId: "",
        phone: "",
        dni: "",
        description: "",
      },

      shippingMethod: "delivery",

      setAddress: (address) => set({ address }),
      setShippingMethod: (shippingMethod) => set({ shippingMethod }),
    }),
    {
      name: "address-storage",
    },
  ),
);
