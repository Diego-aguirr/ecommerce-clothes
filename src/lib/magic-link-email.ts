export function magicLinkEmailTemplate({
  name,
  magicLinkUrl,
}: {
  name: string;
  magicLinkUrl: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; background:#f9f9f9; padding:40px; text-align:center;">
      <div style="max-width:600px; margin:auto; background:#ffffff; padding:30px; border-radius:6px;">
        ${process.env.EMAIL_LOGO_URL ? `<img src="${process.env.EMAIL_LOGO_URL}" alt="${process.env.EMAIL_BRAND_NAME || 'SAURON'} logo" style="max-width:120px; margin-bottom:20px;" />` : ''}
        <h2 style="color:#111;">${process.env.EMAIL_BRAND_NAME || 'SAURON'} – Hola, ${name}</h2>
        <p style="color:#333;">Hacé click en el botón para iniciar sesión en tu cuenta.</p>
        <p style="text-align:center; margin:40px 0;">
          <a href="${magicLinkUrl}" style="background:#000; color:#fff; padding:14px 24px; text-decoration:none; border-radius:4px; display:inline-block;">Iniciar sesión</a>
        </p>
        <p style="color:#555; font-size:14px;">Este enlace es válido por <strong>5 minutos</strong>.</p>
        <hr style="margin:30px 0;" />
        <p style="font-size:12px; color:#888;">Si no solicitaste esto, ignorá este mensaje.</p>
      </div>
    </div>
  `;
}
