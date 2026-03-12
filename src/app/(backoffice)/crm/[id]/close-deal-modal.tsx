'use client'

import { useState, useTransition } from 'react'
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Coins, CheckCircle2, Loader2 } from 'lucide-react'
import { closeDeal } from '../../finance/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface CloseDealModalProps {
    lead: any
}

export function CloseDealModal({ lead }: CloseDealModalProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        
        startTransition(async () => {
            const res = await closeDeal(formData)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success('Negócio fechado com sucesso!')
                setOpen(false)
                router.push('/finance')
            }
        })
    }

    if (lead.funnel_status === 'won') return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4" />
                    Fechar Negócio
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <input type="hidden" name="lead_id" value={lead.id} />
                    <input type="hidden" name="property_id" value={lead.property_id || ''} />
                    
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-600">
                            <Coins className="h-5 w-5" />
                            Confirmar Venda / Locação
                        </DialogTitle>
                        <DialogDescription>
                            Ao fechar este negócio, o sistema calculará automaticamente as comissões e gerará o registro financeiro.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-zinc-500">Valor Total da Transação (R$)</Label>
                            <Input 
                                name="total_value" 
                                type="number" 
                                step="0.01" 
                                placeholder="Ex: 500000.00"
                                required 
                                className="text-lg font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-zinc-500">Tipo de Negócio</Label>
                            <select 
                                name="type" 
                                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                                required
                            >
                                <option value="sale">Venda</option>
                                <option value="rent">Locação</option>
                            </select>
                        </div>

                        {lead.property_id ? (
                            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
                                <p className="text-[10px] uppercase font-black text-zinc-400 mb-1">Imóvel Vinculado</p>
                                <p className="text-xs font-bold">{lead.properties?.title || 'Imóvel selecionado no CRM'}</p>
                            </div>
                        ) : (
                            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-700">
                                <p className="text-xs font-bold leading-tight">
                                    Atenção: Este lead não possui um imóvel vinculado. Vincule um imóvel antes de fechar o negócio para garantir o split do captador.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={isPending || !lead.property_id} className="bg-emerald-600 hover:bg-emerald-700">
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Confirmar e Gerar Split
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
