import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Sanitizes a string to make it safe for use as a filename.
 * Removes or replaces characters that are invalid in filenames across different operating systems.
 *
 * @param filename - The string to sanitize
 * @returns A sanitized string safe for use as a filename
 *
 * @example
 * sanitizeFilename('My Document: Test/Draft #1') // Returns: 'My Document Test Draft #1'
 * sanitizeFilename('Report<2024>') // Returns: 'Report(2024)'
 */
export function sanitizeFilename(filename: string): string {
  return (
    filename
      // Replace problematic characters with safe alternatives
      .replace(/[<>]/g, (match) => (match === '<' ? '(' : ')')) // Angle brackets to parentheses
      .replace(/[:"\/\\|?*]/g, ' ') // Colons, slashes, quotes, pipes, wildcards to space
      // Remove control characters and other invalid characters
      .replace(/[\x00-\x1F\x7F]/g, '')
      // Normalize multiple spaces/dashes to single space
      .replace(/[\s-]+/g, ' ')
      // Trim whitespace and dots from start/end (Windows doesn't allow)
      .replace(/^[\s.]+|[\s.]+$/g, '')
      .trim() || 'document' // Fallback if result is empty
  )
}
