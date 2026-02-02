export function verifyEmailTemplate({
  name,
  verifyUrl,
}: {
  name: string;
  verifyUrl: string;
}) {
  return `
  <div style="font-family: Arial, sans-serif; background:#f9f9f9; padding:40px;">
    <div style="max-width:600px; margin:auto; background:#ffffff; padding:30px; border-radius:6px;">
      
      <h2 style="color:#111;">Gracias por registrarte, ${name}</h2>

      <p style="color:#333;">
        Tu cuenta fue creada correctamente.
        Por seguridad, te pedimos confirmar tu correo electrónico.
      </p>

      <p style="text-align:center; margin:40px 0;">
        <a href="${verifyUrl}"
           style="background:#000; color:#fff; padding:14px 24px; text-decoration:none; border-radius:4px; display:inline-block;">
          Confirmar email
        </a>
      </p>

      <p style="color:#555; font-size:14px;">
        Este enlace es válido por <strong>24 horas</strong>.
        Podés comprar normalmente, pero luego de ese tiempo será necesario confirmar tu email para continuar.
      </p>

      <hr style="margin:30px 0;" />

      <p style="font-size:12px; color:#888;">
        Si no creaste esta cuenta, podés ignorar este mensaje.
      </p>
    </div>
  </div>
  `;
}
