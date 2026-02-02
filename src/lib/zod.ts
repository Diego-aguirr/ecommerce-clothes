import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be more than 6 characters")
    .max(32, "Password must be less than 32 characters"),
});

export const registerSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be more than 6 characters")
    .max(32, "Password must be less than 32 characters"),

  name: z
    .string()
    .min(1, "Name is required")
    .max(32, "Name must be less than 32 characters"),
});
