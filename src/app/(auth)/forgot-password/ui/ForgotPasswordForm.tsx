"use client";

import { forgotPassword } from "@/lib/api/auth";
import { useState } from "react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      await forgotPassword(email);

      setSent(true);
    } catch {
      setError("Ocurrió un error. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <p className="text-green-600">
        Si el email existe, te enviamos un enlace para recuperar tu contraseña.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label htmlFor="email" className="block text-sm font-medium text-neutral-800">
        Correo electrónico
      </label>
      <input
        id="email"
        type="email"
        required
        placeholder="Tu email"
        className="border p-2 w-full rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Correo electrónico"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded"
      >
        {loading ? "Enviando..." : "Enviar enlace"}
      </button>
    </form>
  );
}
