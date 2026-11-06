import { z } from "zod";

export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email kiriting.")
  .max(254, "Email juda uzun.")
  .email("Email formati noto'g'ri.");

export const passwordField = z
  .string()
  .min(8, "Parol kamida 8 ta belgidan iborat bo'lishi kerak.")
  .max(128, "Parol juda uzun.");

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Ismingizni kiriting.")
    .max(80, "Ism juda uzun."),
  email: emailField,
  password: passwordField,
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Parolni kiriting.").max(128, "Parol juda uzun."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
