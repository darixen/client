import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/user'

export const dynamic = 'force-dynamic'

export default async function SetupLayout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUser()

    // Only allow users in setup process to access these pages
    if (!user) {
        redirect('/login')
    }

    // Users in setup process can access setup pages
    if (user.setupStatus === 'pending_vault') {
        // Allow access to setup pages
        return <>{children}</>
    } else {
        redirect('/')
    }
    
}

