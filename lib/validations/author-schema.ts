import { z } from "zod";

/**
 * Author validation schema for creating/editing authors
 */
export const authorFormSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be less than 100 characters"),
  
  middleName: z
    .string()
    .max(100, "Middle name must be less than 100 characters")
    .optional(),
  
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be less than 100 characters"),
  
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
});

export type AuthorFormValues = z.infer<typeof authorFormSchema>;
