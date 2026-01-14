import { z } from "zod";

/**
 * Validation schema for user preferences form
 */
export const userPreferencesSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .min(2, "Username must be at least 2 characters")
      .regex(
        /^[a-zA-Z0-9.]+$/,
        "Username can only contain letters, numbers, and periods"
      ),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // If password is provided, it must meet requirements
      if (data.newPassword && data.newPassword.length > 0) {
        return data.newPassword.length >= 8;
      }
      return true;
    },
    {
      message: "Password must be at least 8 characters long",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword.length > 0) {
        return /[A-Z]/.test(data.newPassword);
      }
      return true;
    },
    {
      message: "Password must contain at least one uppercase letter",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword.length > 0) {
        return /[a-z]/.test(data.newPassword);
      }
      return true;
    },
    {
      message: "Password must contain at least one lowercase letter",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword.length > 0) {
        return /[0-9]/.test(data.newPassword);
      }
      return true;
    },
    {
      message: "Password must contain at least one number",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword.length > 0) {
        return /[^A-Za-z0-9]/.test(data.newPassword);
      }
      return true;
    },
    {
      message: "Password must contain at least one special character",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      // If either password field has a value, both must match
      if (data.newPassword || data.confirmPassword) {
        return data.newPassword === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export type UserPreferencesFormValues = z.infer<typeof userPreferencesSchema>;
