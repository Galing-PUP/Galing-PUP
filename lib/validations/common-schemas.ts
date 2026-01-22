import { z } from 'zod'

/**
 * Common validation constants and schemas for reuse across the application
 */

// File size limits
export const FILE_SIZE_5MB = 5 * 1024 * 1024
export const FILE_SIZE_50MB = 50 * 1024 * 1024

// Accepted MIME types
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]

// Password validation rules (single source of truth)
export const PASSWORD_SCHEMA = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

/**
 * Optional password schema for update scenarios
 * Validates only if password is provided and non-empty
 */
export const OPTIONAL_PASSWORD_SCHEMA = z
  .string()
  .optional()
  .refine(
    (password) => {
      // If no password or empty string, it's valid
      if (!password || password.length === 0) return true
      // If password provided, must be at least 8 characters
      return password.length >= 8
    },
    { message: 'Password must be at least 8 characters' },
  )
  .refine(
    (password) => {
      if (!password || password.length === 0) return true
      return /[A-Z]/.test(password)
    },
    { message: 'Password must contain at least one uppercase letter' },
  )
  .refine(
    (password) => {
      if (!password || password.length === 0) return true
      return /[a-z]/.test(password)
    },
    { message: 'Password must contain at least one lowercase letter' },
  )
  .refine(
    (password) => {
      if (!password || password.length === 0) return true
      return /[0-9]/.test(password)
    },
    { message: 'Password must contain at least one number' },
  )
  .refine(
    (password) => {
      if (!password || password.length === 0) return true
      return /[^A-Za-z0-9]/.test(password)
    },
    { message: 'Password must contain at least one special character' },
  )

// Username validation (alphanumeric and periods only)
export const USERNAME_SCHEMA = z
  .string()
  .min(2, 'Username must be at least 2 characters')

// Email validation
export const EMAIL_SCHEMA = z.email('Please enter a valid email address')

// Password matching refine helper
export const passwordMatchRefine = {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}
