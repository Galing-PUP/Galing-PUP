import { z } from 'zod'
import { AuthorFormValues } from './author-schema'

/**
 * Author validation schema
 */
export const authorSchema = z.object({
  id: z.number().optional(), // Added for existing authors
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional().nullable(),
  lastName: z.string().min(1, 'Last name is required'),
  fullName: z.string().optional(), // Added for display
  email: z
    .email('Invalid email address')
    .or(z.literal(''))
    .nullable()
    .optional(),
})

/**
 * Publication form validation schema
 * Validates all fields for creating/updating research documents
 */
export const publicationSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title must be less than 500 characters'),

  abstract: z
    .string()
    .min(50, 'Abstract must be at least 50 characters')
    .max(5000, 'Abstract must be less than 5000 characters'),

  keywords: z
    .array(z.string())
    .min(1, 'At least one keyword is required')
    .max(10, 'Maximum 10 keywords allowed'),

  datePublished: z
    .string()
    .min(1, 'Publication date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),

  resourceType: z.enum(
    ['THESIS', 'CAPSTONE', 'DISSERTATION', 'ARTICLE', 'RESEARCH_PAPER'],
    { message: 'Please select a resource type' },
  ),

  authors: z
    .array(authorSchema)
    .min(1, 'At least one author is required')
    .max(20, 'Maximum 20 authors allowed'),

  courseId: z.string().min(1, 'Course selection is required'),

  file: z
    .instanceof(File, { message: 'File is required' })
    .refine(
      (file) => file.size <= 50 * 1024 * 1024,
      'File size must be less than 50MB',
    )
    .refine(
      (file) => ['application/pdf'].includes(file.type),
      'Only PDF is allowed',
    ),
})

/**
 * Schema for editing publications (file is optional)
 * Accepts File, null, or undefined when editing existing publications
 */
export const publicationEditSchema = publicationSchema.extend({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 50 * 1024 * 1024,
      'File size must be less than 50MB',
    )
    .refine(
      (file) => ['application/pdf'].includes(file.type),
      'Only PDF is allowed',
    )
    .nullable()
    .optional(),
})

export type PublicationFormValues = z.infer<typeof publicationSchema>

export interface PublicationFormData {
  title: string
  abstract: string
  keywords: string[]
  datePublished: string
  resourceType: string
  authors: AuthorFormValues[]
  courseId: string
  file: File | null
  // Metadata for edit mode
  originalFileName?: string | null
  fileSize?: number | null
  submissionDate?: string | Date | null
  filePath?: string | null
}
