import nodemailer from "nodemailer";

interface SendResetPasswordEmailProps {
  to: string;
  token: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true solo si es 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendResetPasswordEmail({
  to,
  token,
}: SendResetPasswordEmailProps) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Recuperar contraseña",
    html: `
      <h2>Recuperación de contraseña</h2>
      <p>Solicitaste restablecer tu contraseña.</p>
      <p>
        <a href="${resetUrl}" target="_blank">
          Restablecer contraseña
        </a>
      </p>
      <p>Este enlace vence en 1 hora.</p>
      <p>Si no fuiste vos, ignorá este mensaje.</p>
    `,
  });
}
