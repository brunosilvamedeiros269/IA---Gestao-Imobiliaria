import { getLeads } from './actions'
import { PipelineBoard } from './pipeline-board'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function CRMPage() {
    const leads = await getLeads()

    return (
        <div className="flex flex-col h-full w-full pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">Pipeline de Vendas</h1>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Acompanhe seus leads desde o primeiro contato até o fechamento.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Add Filters/Search later here */}
                    <Button asChild>
                        <Link href="/crm/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Lead
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Kanban Board Area */}
            <div className="flex-1 mt-6 h-full min-h-[600px] overflow-hidden">
                <PipelineBoard initialLeads={leads} />
            </div>
        </div>
    )
}
