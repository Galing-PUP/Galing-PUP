import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

/**
 * Get the authenticated user from Supabase session
 * Returns the user ID from the database (not the Supabase auth ID)
 *
 * @returns User ID if authenticated, null otherwise
 */
export async function getAuthenticatedUserId(): Promise<number | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Find the user in our database using their Supabase auth ID
    const dbUser = await prisma.user.findUnique({
      where: {
        supabaseAuthId: user.id,
      },
      select: {
        id: true,
      },
    })

    return dbUser?.id ?? null
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}

/**
 * Get the authenticated user with full details
 *
 * @returns User object if authenticated, null otherwise
 */
export async function getAuthenticatedUser() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Find the user in our database using their Supabase auth ID
    const dbUser = await prisma.user.findUnique({
      where: {
        supabaseAuthId: user.id,
      },
      include: {
        subscriptionTier: true,
      },
    })

    return dbUser
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}
