import { z } from 'zod'
import {
  EMAIL_SCHEMA,
  PASSWORD_SCHEMA,
  USERNAME_SCHEMA,
  passwordMatchRefine,
} from './common-schemas'

/**
 * Schema for user sign-in
 * Accepts either email or username for flexibility
 */
export const signInSchema = z.object({
  email: z.string().min(1, 'Email or Username is required'),
  password: z.string().min(1, 'Password is required'),
})

/**
 * Schema for user registration
 * Enforces strong password requirements and username constraints
 */
export const signUpSchema = z
  .object({
    username: USERNAME_SCHEMA,
    email: EMAIL_SCHEMA,
    password: PASSWORD_SCHEMA,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, passwordMatchRefine)

export type SignInFormValues = z.infer<typeof signInSchema>
export type SignUpFormValues = z.infer<typeof signUpSchema>
