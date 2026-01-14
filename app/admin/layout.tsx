import { AdminLayoutShell } from '@/components/admin/layout-shell'
import { getCurrentUser } from '@/lib/actions'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return <AdminLayoutShell user={user}>{children}</AdminLayoutShell>
}
