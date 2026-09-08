import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión | Satoru Store",
  description: "Accedé a tu cuenta para gestionar tus pedidos y datos.",
};

import LoginForm from "./ui/LoginForm";

export default function loginPage() {
  return (
    <div className="flex flex-col">
      <LoginForm />
    </div>
  );
}
