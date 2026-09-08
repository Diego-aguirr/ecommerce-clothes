import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Restablecer Contraseña | Satoru Store",
  description: "Establecé una nueva contraseña para tu cuenta.",
};

import ResetPasswordForm from "@/app/(auth)/reset-password/ui/ResetPasswordForm";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  if (!token) {
    return <p className="text-red-600">Token inválido</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <ResetPasswordForm token={token} />
    </div>
  );
}
