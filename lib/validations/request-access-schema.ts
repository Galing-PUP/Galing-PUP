import { z } from 'zod'
import {
  ACCEPTED_IMAGE_TYPES,
  EMAIL_SCHEMA,
  FILE_SIZE_5MB,
  PASSWORD_SCHEMA,
  passwordMatchRefine,
} from './common-schemas'

/**
 * Schema for user request access form
 * Validates form data for staff/user registration requests
 * Includes file upload for ID verification
 */
export const requestAccessSchema = z
  .object({
    username: z.string().min(2, 'Full name must be at least 2 characters'),
    college: z.coerce.number().positive('Please select a college'),
    email: EMAIL_SCHEMA,
    idNumber: z.string().min(1, 'ID Number is required'),
    password: PASSWORD_SCHEMA,
    confirmPassword: z.string(),
    idImage: z
      .instanceof(File, { message: 'ID Image is required' })
      .refine((file) => file.size <= FILE_SIZE_5MB, 'Max file size is 5MB')
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        'Only .jpg, .jpeg, .png and .webp formats are supported',
      ),
  })
  .refine((data) => data.password === data.confirmPassword, passwordMatchRefine)

export type RequestAccessFormValues = z.infer<typeof requestAccessSchema>
