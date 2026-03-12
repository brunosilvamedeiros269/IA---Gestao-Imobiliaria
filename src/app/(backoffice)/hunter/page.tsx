import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Target } from 'lucide-react'
import { HunterList } from './hunter-list'
import { getHunterOpportunities } from './hunter-actions'

export default async function HunterPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { opportunities, error } = await getHunterOpportunities()

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                        <Target className="h-8 w-8 text-primary" />
                        Radar de Mercado
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        Oportunidades de captação encontradas automaticamente pelo Hunter IA.
                    </p>
                </div>
            </div>

            <HunterList opportunities={opportunities || []} />
        </div>
    )
}
