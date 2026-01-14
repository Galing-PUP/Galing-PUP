import { Header } from '@/components/header'
import { getCurrentUser } from '@/lib/actions'

export async function HeaderWrapper() {
  const user = await getCurrentUser()

  // Only pass user if username is not null (required by UserProfile type)
  const validUser =
    user && user.username
      ? { ...user, username: user.username as string }
      : null

  return <Header initialUser={validUser} />
}
