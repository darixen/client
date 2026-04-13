import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/user'

export const dynamic = 'force-dynamic'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUser()

    // Public auth pages: redirect authenticated users
    if (user) {
        if (user.setupStatus === 'pending_vault') {
            redirect('/vault-setup')
        }
        // Completed users always go to dashboard
        redirect('/')
    }

    // Unauthenticated users can access auth pages (login, register, recovery)
    return <>{children}</>
}

