import NextAuth from "next-auth";
import prisma from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Email from "next-auth/providers/email";
import { sendEmail } from "@/lib/mailer";
import { magicLinkEmailTemplate } from "@/lib/magic-link-email";
import { isStatusActive } from "@/lib/auth-status";

if (!process.env.AUTH_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is not set. Authentication is insecure without it.");
  }
  console.warn("⚠️  AUTH_SECRET no está configurada. Sesiones inseguras en desarrollo.");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  ...authConfig,
  providers: [
    ...(authConfig.providers ?? []),
    Email({
      id: "email",
      name: "Email",
      maxAge: 5 * 60, // 5 minutes
      // Dummy server config — we use custom sendVerificationRequest with Resend
      server: { host: "localhost", port: 587 },
      from: process.env.MAIL_FROM ?? "noreply@example.com",
      sendVerificationRequest: async ({ identifier, url }) => {
        const user = await prisma.user.findUnique({
          where: { email: identifier },
          select: { name: true },
        });

        const name = user?.name ?? identifier.split("@")[0];

        const html = magicLinkEmailTemplate({
          name,
          magicLinkUrl: url,
        });

        if (process.env.NODE_ENV !== "production") {
          console.log(`🔗 [dev] Magic link para ${identifier}: ${url}`);
        }

        await sendEmail({
          to: identifier,
          subject: "Tu link para iniciar sesión",
          html,
        });
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Email provider: solo permitir si el usuario ya existe (no auto-registrar)
      if (account?.provider === "email") {
        if (!user?.email) return false;

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, emailVerified: true, status: true },
        });

        // No existe → rechazar silenciosamente (respuesta uniforme por seguridad)
        if (!existingUser) return false;

        // BLOCKED ≡ desconocido: misma respuesta uniforme, sin disclosure
        if (!isStatusActive(existingUser.status)) return false;

        // Asignar el id correcto para que el JWT lo use
        user.id = existingUser.id;
        return true;
      }

      // Google provider: auto-link si el email ya existe
      if (account?.provider !== "google" || !user?.email) return true;

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { accounts: true },
      });

      // No existing user — let adapter create everything normally
      if (!existingUser) return true;

      // BLOCKED: reject before the hasGoogle shortcut and before any
      // Account link write — covers linked AND not-yet-linked cases.
      if (!isStatusActive(existingUser.status)) return false;

      // Already has Google linked — nothing to do
      const hasGoogle = existingUser.accounts.some(
        (account) => account.provider === "google"
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
        return token; // sign-in: status already enforced by signIn callback
      }

      // Refresh path: re-check status on every session read so a mid-session
      // block takes effect before token expiry. Returning null clears the cookie.
      const userId = (token.id ?? token.sub) as string | undefined;
      if (!userId) return null;
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { status: true },
      });
      if (!isStatusActive(dbUser?.status)) return null;
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

  events: {
    // Se dispara solo cuando el login se completa (click del magic link
    // o retorno de Google), nunca al enviar el link → identidad probada.
    async signIn({ user }) {
      if (!user.id) return;
      await prisma.user.updateMany({
        where: { id: user.id, emailVerified: null },
        data: { emailVerified: new Date() },
      });
    },
  },
});
