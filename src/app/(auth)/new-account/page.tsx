import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear Cuenta | Satoru Store",
  description: "Registrate para comenzar a comprar y recibir ofertas exclusivas.",
};

import { FormRegister } from "./ui/FormRegister";

export default function newAccountPage() {
  return (
    <div className="flex flex-col">
      <FormRegister />
    </div>
  );
}
