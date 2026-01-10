import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const requestAccessSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    college: z.string().min(1, "Please select a college"),
    email: z.string().email("Please enter a valid email address"),
    idNumber: z.string().min(1, "ID Number is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    idImage: z
      .instanceof(File, { message: "ID Image is required" })
      .refine((file) => file.size <= MAX_FILE_SIZE, "Max file size is 5MB")
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        "Only .jpg, .jpeg, .png and .webp formats are supported"
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RequestAccessFormValues = z.infer<typeof requestAccessSchema>;
