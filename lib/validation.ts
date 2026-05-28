import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name is required."),
    email: z.string().email("Enter a valid email."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your password.")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Password is required.")
});

export const resetRequestSchema = z.object({
  email: z.string().email("Enter a valid email.")
});

export const resetConfirmSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your password.")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

export const importWalletSchema = z.object({
  phrase: z.string().transform((value) => value.trim().toLowerCase()),
  walletName: z.string().optional()
});

export const sendSchema = z.object({
  assetId: z.string().min(1, "Choose an asset."),
  recipient: z.string().min(10, "Enter a recipient address."),
  amount: z.coerce.number().positive("Enter an amount greater than zero.")
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Enter a valid email.")
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your password.")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

export const revealPhraseSchema = z.object({
  password: z.string().min(1, "Password confirmation is required.")
});

export function firstZodError(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.errors[0]?.message ?? "Please check the form.";
  }
  return "Please check the form.";
}
