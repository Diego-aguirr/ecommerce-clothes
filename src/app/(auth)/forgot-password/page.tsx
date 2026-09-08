import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperar Contraseña | Satoru Store",
  description: "Solicitá un enlace para restablecer tu contraseña de forma segura.",
};

import ForgotPasswordForm from "@/app/(auth)/forgot-password/ui/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-semibold mb-4">Recuperar contraseña</h1>
      <ForgotPasswordForm />
    </div>
  );
}
