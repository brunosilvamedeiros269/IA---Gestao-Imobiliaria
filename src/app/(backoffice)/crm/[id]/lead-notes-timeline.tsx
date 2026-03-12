'use client'

import { useState, useTransition } from 'react'
import { LeadNoteWithBroker, createLeadNote, deleteLeadNote } from '../actions'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Send, Trash2, MessageSquare, History, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function LeadNotesTimeline({ leadId, initialNotes }: { leadId: string, initialNotes: LeadNoteWithBroker[] }) {
    const [notes, setNotes] = useState<LeadNoteWithBroker[]>(initialNotes)
    const [content, setContent] = useState('')
    const [isPending, startTransition] = useTransition()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        startTransition(async () => {
            const res = await createLeadNote(leadId, content)
            if (res.error) {
                toast.error('Erro ao salvar nota: ' + res.error)
            } else {
                toast.success('Nota adicionada ao histórico!')
                setContent('')
                // Refresh local state (in a real app we'd fetch or use revalidatePath trigger)
                // Since initialNotes come from Server Component, revalidatePath in action
                // will trigger a refresh of the page props.
            }
        })
    }

    const handleDelete = async (noteId: string) => {
        if (!confirm('Deseja excluir esta nota permanentemente?')) return

        startTransition(async () => {
            const res = await deleteLeadNote(noteId, leadId)
            if (res.error) {
                toast.error('Fallha ao deletar: ' + res.error)
            } else {
                toast.success('Nota removida.')
            }
        })
    }

    // Sort notes just in case (though DB should handle it)
    const sortedNotes = [...initialNotes].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* New Note Form */}
            <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm border-t-4 border-t-primary">
                <div className="flex items-center gap-2 mb-4 text-zinc-900 dark:text-zinc-100">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Registrar Nova Atividade</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Descreva o que aconteceu (ex: Cliente interessado, liguei e marcamos visita...)"
                        className="w-full min-h-[100px] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all resize-none dark:text-zinc-200"
                        disabled={isPending}
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isPending || !content.trim()} className="gap-2">
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Salvar no Histórico
                        </Button>
                    </div>
                </form>
            </div>

            {/* Timeline View */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                    <History className="h-4 w-4" />
                    <small className="font-bold uppercase tracking-widest text-[10px]">Linha do Tempo de Atendimento</small>
                </div>

                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:via-zinc-200 dark:before:via-zinc-800 before:to-transparent">
                    {sortedNotes.length === 0 ? (
                        <div className="pl-12 py-4">
                            <p className="text-sm text-zinc-500 italic">Nenhuma atividade registrada ainda. Comece anotando algo!</p>
                        </div>
                    ) : (
                        sortedNotes.map((note) => (
                            <div key={note.id} className="relative pl-12 group">
                                {/* Dot */}
                                <div className="absolute left-0 mt-1.5 h-3 w-3 rounded-full border-2 border-primary bg-white dark:bg-zinc-950 ring-4 ring-white dark:ring-zinc-950 transition-all group-hover:scale-125 shadow-sm"></div>

                                <div className="bg-white dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200">{note.users_profile.full_name}</span>
                                            <span className="text-[10px] text-zinc-400">•</span>
                                            <span className="text-[10px] text-zinc-400 lowercase">
                                                {formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: ptBR })}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(note.id)}
                                            className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <div className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                                        {note.content}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* AI Suggestion Box Placeholder */}
            <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 flex gap-4 items-center">
                <div className="bg-primary/20 p-2 rounded-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-primary">Dica do Assistente IA</h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Baseado no histórico, este lead prefere contato via WhatsApp e demonstrou urgência na visita. Sugira o próximo Sábado às 10h.
                    </p>
                </div>
            </div>
        </div>
    )
}
