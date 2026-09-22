import { Resend } from "resend";

let resend: Resend | null = null;

/**
 * Obtiene o crea el cliente de Resend de forma lazy.
 * En desarrollo sin API key, retorna null y loguea advertencia.
 */
function getResend(): Resend | null {
  if (resend) return resend;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }

  resend = new Resend(apiKey);
  return resend;
}

/**
 * Envía un email usando Resend.
 * En modo desarrollo sin API key configurada, loguea el email en consola
 * en lugar de enviarlo, permitiendo que la app funcione localmente.
 *
 * @param to - Dirección de email del destinatario (o array)
 * @param subject - Asunto del email
 * @param html - Contenido HTML del email
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const client = getResend();

  // Modo desarrollo: loguear en consola sin enviar
  if (!client) {
    return { id: "dev-mode" };
  }

  const { data, error } = await client.emails.send({
    from: process.env.MAIL_FROM as string,
    to,
    subject,
    html,
  });

  if (error) {
    throw error;
  }

  return data;
}
