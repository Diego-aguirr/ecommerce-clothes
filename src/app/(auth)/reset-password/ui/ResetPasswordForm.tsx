"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/lib/api/auth";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      await resetPassword(token, password);

      setSuccess(true);

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Error al cambiar contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-md border border-green-300 bg-green-50 p-4 text-center">
        <p className="text-green-700 font-medium">
          Contraseña actualizada correctamente
        </p>
        <p className="text-green-600 text-sm mt-1">Redirigiendo al login…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-lg font-semibold text-neutral-900">
          Restablecer contraseña
        </h1>
        <p className="text-sm text-neutral-600 mt-1">
          Elegí una nueva contraseña segura para tu cuenta
        </p>
      </div>

      {/* Password input */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-neutral-800">
          Nueva contraseña
        </label>
        <input
          type="password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="
            w-full rounded-md border border-neutral-300
            bg-neutral-100 px-4 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-black
          "
        />
        <p className="text-xs text-neutral-500">Usá al menos 8 caracteres.</p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-600 text-sm text-center" role="alert">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        disabled={loading}
        className="
          mt-2 w-full rounded-md bg-black py-2.5
          text-sm font-medium text-white
          transition-colors hover:bg-neutral-800
          focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
          disabled:opacity-60 disabled:cursor-not-allowed
        "
      >
        {loading ? "Guardando..." : "Cambiar contraseña"}
      </button>

      {/* Security note (opcional pero profesional) */}
      <p className="text-xs text-neutral-500 text-center">
        Por seguridad, este enlace solo puede usarse una vez.
      </p>
    </form>
  );
}
