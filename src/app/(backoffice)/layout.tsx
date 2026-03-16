import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Header } from '@/components/backoffice/Header'
import { Sidebar } from '@/components/backoffice/Sidebar'
import { logger } from '@/utils/logger'
import { Toaster } from 'sonner'

export default async function BackofficeLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        redirect('/login')
    }

    // Fetch user profile and agency info to pass down or just to verify access
    const { data: profile, error: profileError } = await supabase
        .from('users_profile')
        .select('role, full_name, agency_id, agencies(name, slug)')
        .eq('id', user.id)
        .single()

    if (profileError) {
        logger.error("Layout Access", `Error fetching profile for user ${user.id}`, profileError)
    }

    if (!profile) {
        logger.warn("Layout Access", `Profile not found for user ${user.id}`)
        redirect('/login?message=' + encodeURIComponent('Perfil não encontrado. Contate o suporte.'))
    }

    return (
        <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
            <Sidebar agency={profile.agencies} role={profile.role} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header user={{ name: profile.full_name, email: user.email }} />
                <main className="w-full grow p-6">
                    {children}
                </main>
            </div>
            <Toaster richColors position="top-right" />
        </div>
    )
}
