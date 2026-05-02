import { sendEmail } from "@/lib/mailer";
import { verifyEmailTemplate } from "@/lib/verify-email";

export async function sendVerificationEmail(email: string, name: string, token: string) {
  // Build verification URL using server APP_URL for consistency
  const verifyUrl = `${process.env.APP_URL}/api/auth/verify?token=${token}`;

  // Generate HTML using shared template (brand name and optional logo)
  const html = verifyEmailTemplate({ name, verifyUrl });

  await sendEmail({
    to: email,
    subject: "Confirmá tu correo electrónico",
    html,
  });
}
