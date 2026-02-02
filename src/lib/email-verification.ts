import { User } from "@/generated/prisma/client";

export type EmailVerificationReason =
  | "VERIFIED"
  | "GRACE_PERIOD"
  | "EMAIL_VERIFICATION_REQUIRED";

export type EmailVerificationStatus = {
  allowed: boolean;
  reason: EmailVerificationReason;
};

const VERIFICATION_WINDOW_HOURS = 24;

export function getEmailVerificationStatus(user: User) {
  // Usuario ya verificado
  if (user.emailVerified) {
    return {
      allowed: true,
      reason: "VERIFIED",
    };
  }

  // Calculamos horas desde el registro
  const now = new Date();
  const createdAt = new Date(user.createdAt);

  const diffMs = now.getTime() - createdAt.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Dentro de la ventana de gracia (24h)
  if (diffHours < VERIFICATION_WINDOW_HOURS) {
    return {
      allowed: true,
      reason: "GRACE_PERIOD",
    };
  }

  // No verificado y fuera de tiempo
  return {
    allowed: false,
    reason: "EMAIL_VERIFICATION_REQUIRED",
  };
}
