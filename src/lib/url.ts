/**
 * Valida que una URL sea local (empieza con / y no con //).
 * Previene open redirect attacks.
 */
export function isLocalUrl(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//");
}
