import { Resend } from "resend";

// Initialize Resend client with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY as string);

/**
 * Sends an email using Resend.
 * @param to - Recipient email address (or array of addresses)
 * @param subject - Email subject line
 * @param html - HTML content of the email
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
  const { data, error } = await resend.emails.send({
    from: process.env.MAIL_FROM as string,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw error;
  }

  return data;
}
