import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/user'
import DashboardUI from './dashboard-ui'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {

    redirect('/login')
  }

  if (user.setupStatus === 'pending_vault') {
    redirect('/vault-setup')
  }

  // Auth passed, render client UI
  return <DashboardUI>{children}</DashboardUI>
}
