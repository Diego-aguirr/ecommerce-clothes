import { z } from "zod";

/**
 * Unified error handler for Server Actions
 * Returns standardized { ok: false, message: string }
 */
export function handleActionError(
  error: unknown,
  context?: string
): { ok: false; message: string } {
  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return { ok: false, message: error.issues[0].message };
  }

  // Log for debugging (with context)

  // Return generic message for unknown errors (security)
  return { ok: false, message: "Ha ocurrido un error. Intente nuevamente." };
}

/**
 * Custom error class for business logic errors
 */
export class ActionError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ActionError";
  }
}
