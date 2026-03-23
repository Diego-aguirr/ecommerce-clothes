import { MercadoPagoConfig } from "mercadopago";

if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error("MERCADOPAGO_ACCESS_TOKEN no está definido en las variables de entorno");
}

/*
 * Instancia única (Singleton) del cliente de Mercado Pago.
 * Es crucial exportarlo desde aquí para evitar recrear la conexión/configuración 
 * en cada solicitud HTTP o Server Action y agotar recursos inútilmente.
 */
export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  // Opcional: podrías agregar options como timeout, etc aquí
});
