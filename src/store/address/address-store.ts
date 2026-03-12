import { create } from "zustand";
import { persist } from "zustand/middleware";
interface State {
  address: {
    fullname: string;
    street: string;
    apartment?: string;
    zip: string;
    city: string;
    provinceId: string;
    phone: string;
    dni: string;
    description?: string;
  };

  //Methods
  setAddress: (adress: State["address"]) => void;
}

export const useAddressStore = create<State>()(
  persist(
    (set, get) => ({
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
      setAddress: (address) => set({ address }),
    }),
    {
      name: "address-storage",
    },
  ),
);
