import { MercadoPagoConfig } from "mercadopago";

let mpClient: MercadoPagoConfig | null = null;

/**
 * Obtiene o crea el cliente de MercadoPago de forma lazy.
 * En desarrollo sin token configurado, retorna null y loguea advertencia.
 */
export function getMpClient(): MercadoPagoConfig | null {
  if (mpClient) return mpClient;

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    console.warn(
      "⚠️  MERCADOPAGO_ACCESS_TOKEN no está configurado. Los pagos con MercadoPago no funcionarán."
    );
    return null;
  }

  mpClient = new MercadoPagoConfig({
    accessToken: token,
  });

  return mpClient;
}

/**
 * @deprecated Usar getMpClient() en su lugar.
 * Export legacy para compatibilidad con código existente.
 */
export { mpClient as _mpClient };
