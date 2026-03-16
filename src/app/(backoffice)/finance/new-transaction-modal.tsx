'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createManualTransaction, getPropertiesForSelect, getLeadsForSelect } from './actions'
import { Loader2, Plus } from 'lucide-react'

export function NewTransactionModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const [isPending, setIsPending] = useState(false)
    const [properties, setProperties] = useState<{ id: string, title: string }[]>([])
    const [leads, setLeads] = useState<{ id: string, name: string }[]>([])

    useEffect(() => {
        if (open) {
            getPropertiesForSelect().then(setProperties)
            getLeadsForSelect().then(setLeads)
        }
    }, [open])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsPending(true)

        const formData = new FormData(e.currentTarget)
        const result = await createManualTransaction(formData)

        setIsPending(false)
        if (result.success) {
            toast.success('Transação registrada com sucesso!')
            onOpenChange(false)
        } else {
            toast.error(result.error || 'Erro ao registrar transação.')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-zinc-200 dark:border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Novo Lançamento</DialogTitle>
                    <DialogDescription className="font-medium">
                        Registre uma venda ou locação manualmente no sistema.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Imóvel Vendido/Locado *</label>
                            <Select name="property_id" required>
                                <SelectTrigger className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none font-bold">
                                    <SelectValue placeholder="Selecione o imóvel..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800">
                                    {properties.map(p => (
                                        <SelectItem key={p.id} value={p.id} className="font-bold">{p.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Cliente (Lead) - Opcional</label>
                            <Select name="lead_id">
                                <SelectTrigger className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none font-bold">
                                    <SelectValue placeholder="Selecione o cliente..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800">
                                    {leads.map(l => (
                                        <SelectItem key={l.id} value={l.id} className="font-bold">{l.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Valor do Negócio (R$)*</label>
                                <Input 
                                    name="total_value" 
                                    type="number" 
                                    step="0.01" 
                                    required 
                                    placeholder="0.00" 
                                    className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Comissão (%)*</label>
                                <Input 
                                    name="commission_rate" 
                                    type="number" 
                                    step="0.1" 
                                    defaultValue="6" 
                                    required 
                                    className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none font-bold"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Tipo*</label>
                                <Select name="type" defaultValue="sale">
                                    <SelectTrigger className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800">
                                        <SelectItem value="sale" className="font-bold">Venda</SelectItem>
                                        <SelectItem value="rent" className="font-bold">Locação</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Status Pagamento*</label>
                                <Select name="status" defaultValue="pending">
                                    <SelectTrigger className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800">
                                        <SelectItem value="pending" className="font-bold text-amber-600">Pendente</SelectItem>
                                        <SelectItem value="paid" className="font-bold text-emerald-600">Pago</SelectItem>
                                        <SelectItem value="cancelled" className="font-bold text-red-600">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button 
                            type="submit" 
                            disabled={isPending}
                            className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-tighter shadow-lg shadow-primary/20"
                        >
                            {isPending ? <Loader2 className="animate-spin" /> : 'Confirmar Lançamento'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
