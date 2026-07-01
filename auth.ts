import NextAuth from "next-auth";
import prisma from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/zod";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  ...authConfig,
  providers: [
    ...(authConfig.providers ?? []),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        const { password: _, ...safeUser } = user;
        return safeUser;
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Auto-link OAuth provider to existing user when email matches
      if (account?.provider !== "google" || !user?.email) return true;

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { accounts: true },
      });

      // No existing user — let adapter create everything normally
      if (!existingUser) return true;

      // Already has Google linked — nothing to do
      const hasGoogle = existingUser.accounts.some(
        (a) => a.provider === "google"
      );
      if (hasGoogle) return true;

      // Link Google account to existing user
      await prisma.account.create({
        data: {
          userId: existingUser.id,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token ?? null,
          access_token: account.access_token ?? null,
          expires_at: account.expires_at ?? null,
          token_type: account.token_type ?? null,
          scope: account.scope ?? null,
          id_token: account.id_token ?? null,
          session_state: String(account.session_state ?? ""),
        },
      });

      // Ensure JWT gets the correct user id
      user.id = existingUser.id;
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "user";
        token.isSuperAdmin = user.isSuperAdmin ?? false;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isSuperAdmin = token.isSuperAdmin as boolean;
      }
      return session;
    },
  },
});
