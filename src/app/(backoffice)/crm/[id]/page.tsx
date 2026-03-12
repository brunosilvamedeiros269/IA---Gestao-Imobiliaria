import { getLeadById, getLeadNotes } from '../actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LeadNotesTimeline } from './lead-notes-timeline'
import { LeadSidebarInfo } from './lead-sidebar-info'
import { Badge } from '@/components/ui/badge'
import { CloseDealModal } from './close-deal-modal'

const STATUS_LABELS: Record<string, { label: string, color: string }> = {
// ... existing status labels ...
}

export default async function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const lead = await getLeadById(id)
    const notes = await getLeadNotes(id)

    if (!lead) {
        notFound()
    }

    const status = STATUS_LABELS[lead.funnel_status] || { label: lead.funnel_status, color: 'bg-zinc-100 text-zinc-700' }

    return (
        <div className="flex flex-col min-h-full">
            {/* Header / Breadcrumb */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="space-y-1">
                    <Link
                        href="/crm"
                        className="inline-flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 mb-2 transition-colors"
                    >
                        <ArrowLeft className="mr-1 h-3 w-3" />
                        Voltar para o Pipeline
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{lead.name}</h1>
                        <Badge variant="outline" className={`${status.color} border-none font-semibold px-2.5 py-0.5 rounded-full`}>
                            {status.label}
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <CloseDealModal lead={lead} />
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/crm/${lead.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Interno
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Layout: Info Sidebar | Activity Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
                {/* Left Sidebar: Contact & Interest */}
                <aside className="lg:col-span-4 space-y-6">
                    <LeadSidebarInfo lead={lead} />
                </aside>

                {/* Main Content: Timeline & Actions */}
                <main className="lg:col-span-8 space-y-8">
                    <LeadNotesTimeline leadId={lead.id} initialNotes={notes} />
                </main>
            </div>
        </div>
    )
}
