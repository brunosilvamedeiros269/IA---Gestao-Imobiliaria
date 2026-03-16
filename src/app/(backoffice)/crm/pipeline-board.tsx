'use client'

import { useState, useTransition, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { LeadWithProperty, updateLeadStatus } from './actions'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
    Phone, Mail, Building, Clock, ChevronRight, ImageIcon,
    ThermometerSnowflake, ThermometerSun, Flame 
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Database } from '@/utils/supabase/database.types'

type FunnelStatus = Database['public']['Enums']['funnel_status']

const COLUMNS: { id: FunnelStatus, title: string, color: string }[] = [
    { id: 'new', title: 'Novo Lead', color: 'border-l-blue-500' },
    { id: 'in_progress', title: 'Em Atendimento', color: 'border-l-amber-500' },
    { id: 'visit', title: 'Visita Agendada', color: 'border-l-purple-500' },
    { id: 'won', title: 'Proposta / Ganho', color: 'border-l-emerald-500' },
    { id: 'lost', title: 'Perdido', color: 'border-l-red-500' },
]

const URGENCY_ICONS: Record<number, { icon: any, color: string }> = {
    1: { icon: ThermometerSnowflake, color: 'text-blue-500' },
    3: { icon: ThermometerSun, color: 'text-orange-500' },
    5: { icon: Flame, color: 'text-red-500' },
}

export function PipelineBoard({ initialLeads }: { initialLeads: LeadWithProperty[] }) {
    const [leads, setLeads] = useState<LeadWithProperty[]>(initialLeads)
    const [isPending, startTransition] = useTransition()
    const [isMounted, setIsMounted] = useState(false)

    // hello-pangea/dnd needs to hide server-rendered mismatch during initial load
    useEffect(() => {
        setIsMounted(true)
    }, [])

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result

        if (!destination) return

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return
        }

        const draggedLeadId = draggableId
        const newStatus = destination.droppableId as FunnelStatus

        // Optimistic update
        setLeads((prevLeads) => prevLeads.map((lead) =>
            lead.id === draggedLeadId ? { ...lead, funnel_status: newStatus } : lead
        ))

        // Server update
        startTransition(async () => {
            const res = await updateLeadStatus(draggedLeadId, newStatus)
            if (res.error) {
                toast.error('Erro ao mover lead: ' + res.error)
                // Revert to initial if fails
                setLeads(initialLeads)
            } else {
                toast.success('Lead atualizado com sucesso!', { position: 'bottom-center' })
            }
        })
    }

    if (!isMounted) return <div className="animate-pulse flex gap-6 h-full"><div className="w-80 h-full bg-zinc-100 dark:bg-zinc-900 rounded-xl"></div></div>

    // Group leads by status
    const getLeadsByStatus = (status: FunnelStatus) => {
        return leads.filter((l) => l.funnel_status === status)
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 h-full overflow-x-auto pb-4 snap-x">
                {COLUMNS.map((column) => (
                    <div key={column.id} className="flex-shrink-0 w-80 h-full flex flex-col bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-800 snap-center">
                        <div className={`p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between border-l-4 rounded-tl-xl ${column.color}`}>
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{column.title}</h3>
                            <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs py-1 px-2 rounded-full font-medium">
                                {getLeadsByStatus(column.id).length}
                            </span>
                        </div>

                        <Droppable droppableId={column.id}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`flex-1 p-3 overflow-y-auto space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-zinc-100/50 dark:bg-zinc-800/50' : ''}`}
                                >
                                    {getLeadsByStatus(column.id).map((lead, index) => (
                                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg shadow-sm group hover:border-primary/50 transition-all ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/20 rotate-2' : ''}`}
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex flex-col gap-1">
                                                            <h4 className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">{lead.name}</h4>
                                                            <div className="flex gap-1">
                                                                {lead.source === 'hunter' && (
                                                                    <Badge className="bg-primary/10 text-primary border-none text-[8px] py-0 px-1 font-bold uppercase tracking-widest">
                                                                        AI Hunter
                                                                    </Badge>
                                                                )}
                                                                {lead.source?.includes('portal') && (
                                                                    <Badge className="bg-indigo-500/10 text-indigo-500 border-none text-[8px] py-0 px-1 font-bold uppercase tracking-widest">
                                                                        Portal
                                                                    </Badge>
                                                                )}
                                                                {lead.source === 'direct' && (
                                                                    <Badge className="bg-zinc-100 text-zinc-500 border-none text-[8px] py-0 px-1 font-bold uppercase tracking-widest">
                                                                        Direto
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Link href={`/crm/${lead.id}`} className="text-zinc-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <ChevronRight className="w-5 h-5" />
                                                        </Link>
                                                    </div>

                                                    {(lead.phone || lead.email) && (
                                                        <div className="space-y-1 mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                                                            {lead.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> <span>{lead.phone}</span></div>}
                                                            {lead.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> <span className="line-clamp-1">{lead.email}</span></div>}
                                                        </div>
                                                    )}

                                                    {/* Property Thumbnail/Link */}
                                                    {lead.properties && (
                                                        <div className="flex items-center gap-3 p-2 bg-zinc-50 dark:bg-zinc-950 rounded border border-zinc-100 dark:border-zinc-800 mb-3">
                                                            <div className="w-10 h-10 rounded overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex-shrink-0 relative">
                                                                {lead.properties.photos && lead.properties.photos.length > 0 ? (
                                                                    // eslint-disable-next-line @next/next/no-img-element
                                                                    <img src={lead.properties.photos[0]} alt="Capa" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <ImageIcon className="w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-400" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-300 line-clamp-1">{lead.properties.title}</p>
                                                                <p className="text-[10px] text-zinc-500 capitalize">{lead.properties.listing_type === 'sale' ? 'Venda' : 'Locação'} • {lead.properties.property_type}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                                        <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                                                            <Clock className="w-3 h-3" />
                                                            <span>Há {formatDistanceToNow(new Date(lead.created_at), { locale: ptBR })}</span>
                                                        </div>
                                                        
                                                        {lead.urgency_score && (
                                                            <div className="flex items-center gap-1">
                                                                {(() => {
                                                                    const score = lead.urgency_score
                                                                    const config = score >= 5 ? URGENCY_ICONS[5] : 
                                                                                  score >= 3 ? URGENCY_ICONS[3] : 
                                                                                  URGENCY_ICONS[1]
                                                                    const Icon = config.icon
                                                                    return <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                                                                })()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    )
}
