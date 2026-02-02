// lib/sendVerificationEmail.ts
import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Verificá tu email",
    html: `
      <h2>Verificación de email</h2>
      <p>Para continuar usando tu cuenta, verificá tu email:</p>
      <p>
        <a href="${verifyUrl}" target="_blank">
          Verificar email
        </a>
      </p>
      <p>Este enlace vence en 24 horas.</p>
    `,
  });
}
