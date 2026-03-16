import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getOpportunityById } from './actions'
import { CompletarCadastroForm } from './form'
import { ArrowLeft, Target } from 'lucide-react'
import Link from 'next/link'

export default async function CompletarCadastroPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const opportunity = await getOpportunityById(id)
    if (!opportunity) notFound()

    if (opportunity.status === 'converted' && opportunity.property_id) {
        redirect(`/inventory/${opportunity.property_id}`)
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href="/hunter" className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <Target className="h-6 w-6 text-primary" />
                        Complementar Cadastro
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Converta esta oportunidade em um imóvel no seu inventário.
                    </p>
                </div>
            </div>

            {/* Hunter Source Banner */}
            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl text-sm">
                <span className="text-primary font-black text-[10px] uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-md mt-0.5 flex-shrink-0">
                    {opportunity.portal_name}
                </span>
                <div>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">{opportunity.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                        Os campos abaixo já foram pré-preenchidos pelo Hunter IA. Revise, complete o que falta e salve no inventário.
                    </p>
                </div>
            </div>

            <CompletarCadastroForm opportunity={opportunity} />
        </div>
    )
}
