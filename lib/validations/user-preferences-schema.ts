import { z } from 'zod'
import { OPTIONAL_PASSWORD_SCHEMA, USERNAME_SCHEMA } from './common-schemas'

/**
 * Validation schema for user preferences form
 * Allows updating username and optionally setting a new password
 * Password is optional and only validated if provided
 */
export const userPreferencesSchema = z
  .object({
    username: USERNAME_SCHEMA,
    newPassword: OPTIONAL_PASSWORD_SCHEMA,
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // If either password field has a value, both must match
      if (data.newPassword || data.confirmPassword) {
        return data.newPassword === data.confirmPassword
      }
      return true
    },
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    },
  )

export type UserPreferencesFormValues = z.infer<typeof userPreferencesSchema>
