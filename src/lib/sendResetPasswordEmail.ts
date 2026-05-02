import { sendEmail } from "@/lib/mailer";

export async function sendResetPasswordEmail({ to, token }: { to: string; token: string }) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  const html = `
    <h2>Recuperación de contraseña</h2>
    <p>Solicitaste restablecer tu contraseña.</p>
    <p><a href="${resetUrl}" target="_blank">Restablecer contraseña</a></p>
    <p>Este enlace vence en 1 hora.</p>
    <p>Si no fuiste tú, ignorá este mensaje.</p>
  `;

  await sendEmail({
    to,
    subject: "Recuperar contraseña",
    html,
  });
}
