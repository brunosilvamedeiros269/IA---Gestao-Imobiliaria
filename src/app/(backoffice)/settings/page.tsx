import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForm } from './settings-form'
import { Settings as SettingsIcon } from 'lucide-react'

export default async function SettingsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) {
        throw new Error('Perfil não encontrado')
    }

    // Fetch agency info
    const { data: agency } = await supabase
        .from('agencies')
        .select('*')
        .eq('id', profile.agency_id)
        .single()

    if (!agency) {
        throw new Error('Agência não encontrada')
    }

    // Fetch all hunter configs for this agency (multi-agent)
    const { data: hunterConfigs } = await supabase
        .from('hunter_configs')
        .select('*')
        .eq('agency_id', agency.id)
        .order('created_at', { ascending: true })

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                    <SettingsIcon className="h-8 w-8 text-primary" />
                    Configurações
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                    Personalize sua experiência e gerencie os dados da sua organização.
                </p>
            </div>

            <SettingsForm 
                profile={profile} 
                agency={agency} 
                role={profile.role} 
                hunterConfigs={hunterConfigs || []}
            />
        </div>
    )
}
