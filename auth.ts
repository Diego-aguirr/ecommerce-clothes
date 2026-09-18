import NextAuth from "next-auth";
import prisma from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Email from "next-auth/providers/email";
import { sendEmail } from "@/lib/mailer";
import { magicLinkEmailTemplate } from "@/lib/magic-link-email";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
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
