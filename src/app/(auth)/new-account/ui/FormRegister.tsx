"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { registerSchema } from "@/lib/zod";
import { useRouter } from "next/navigation";
import { registerAction } from "@/actions";

type FormInputs = z.infer<typeof registerSchema>;

export const FormRegister = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: FormInputs) => {
    setErrorMessage(null);

    startTransition(async () => {
      const resp = await registerAction(data);

      if (resp?.error) {
        setErrorMessage(resp.error);
        return;
      }

      router.push("/"); // o donde quieras
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <label>Nombre completo</label>
      <input
        className={clsx("px-5 py-2 border bg-gray-200 rounded mb-5", {
          "border-red-500": errors.name,
        })}
        type="text"
        autoFocus
        {...register("name")}
      />
      {errors.name && (
        <span className="text-red-500">{errors.name.message}</span>
      )}

      <label>Correo electrónico</label>
      <input
        className={clsx("px-5 py-2 border bg-gray-200 rounded mb-5", {
          "border-red-500": errors.email,
        })}
        type="email"
        {...register("email")}
      />
      {errors.email && (
        <span className="text-red-500">{errors.email.message}</span>
      )}

      <label>Contraseña</label>
      <input
        className={clsx("px-5 py-2 border bg-gray-200 rounded mb-5", {
          "border-red-500": errors.password,
        })}
        type="password"
        {...register("password")}
      />
      {errors.password && (
        <span className="text-red-500">{errors.password.message}</span>
      )}

      {errorMessage && <span className="text-red-500">{errorMessage}</span>}

      <button className="btn-primary" disabled={isPending}>
        {isPending ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      <div className="flex items-center my-5">
        <div className="flex-1 border-t border-gray-500"></div>
        <div className="px-2 text-gray-800">O</div>
        <div className="flex-1 border-t border-gray-500"></div>
      </div>

      <Link href="/login" className="btn-secondary text-center">
        Ingresar
      </Link>
    </form>
  );
};
