import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/zod";
import prisma from "@/lib/prisma";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/auth/login",
  },

  providers: [
    Google,

    Credentials({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        // 1️⃣ Validación con Zod
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // 2️⃣ Buscar usuario
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user || !user.password) return null;

        // 3️⃣ Comparar password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        // 4️⃣ Verificar email

        // 5️⃣ Devolver usuario sin password
        const { password: _, ...safeUser } = user;
        return safeUser;
      },
    }),
  ],
};
