"use client";

import { loginSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { authenticate } from "@/actions";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setError(null);

    startTransition(async () => {
      const response = await authenticate(values);

      if (response?.error) {
        setError(response.error);
        return;
      }

      window.location.replace(callbackUrl);
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      {/* EMAIL */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-neutral-800">Email</label>
        <input
          {...form.register("email")}
          type="email"
          className="
            w-full rounded-md border border-neutral-300
            bg-neutral-100 px-4 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-black
          "
        />
        {form.formState.errors.email && (
          <p className="text-red-600 text-xs">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      {/* PASSWORD */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-neutral-800   ">
          Contraseña
        </label>
        <input
          {...form.register("password")}
          type="password"
          className="
            w-full rounded-md border border-neutral-300
            bg-neutral-100 px-4 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-black
          "
        />
        {form.formState.errors.password && (
          <p className="text-red-600 text-xs">
            {form.formState.errors.password.message}
          </p>
        )}

        {/* 🔑 Recuperar contraseña */}
        <Link
          href="/forgot-password"
          className="mt-1 text-xs text-neutral-600 hover:text-black self-end"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {/* ERROR GENERAL */}
      {error && <p className="text-red-600 text-sm text-center">{error}</p>}

      {/* CTA PRINCIPAL */}
      <button
        type="submit"
        disabled={isPending}
        className="
          mt-2 w-full rounded-md bg-black py-2.5 text-sm font-medium
          text-white transition-colors
          hover:bg-neutral-800
          focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
          disabled:opacity-60 disabled:cursor-not-allowed
        "
      >
        {isPending ? "Ingresando..." : "Ingresar"}
      </button>

      {/* DIVIDER */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 border-t border-neutral-300" />
        <span className="text-xs text-neutral-500">O</span>
        <div className="flex-1 border-t border-neutral-300" />
      </div>

      {/* CTA SECUNDARIO */}
      <Link
        href="/new-account"
        className="
          w-full  rounded-md border border-neutral-300
          py-2.5 text-center text-sm font-medium text-neutral-800
          hover:bg-neutral-100 transition-colors 
        "
      >
        Crear una nueva cuenta
      </Link>
    </form>
  );
};

export default LoginForm;
