'use client'

import { useState, useTransition, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    UserPlus,
    Search,
    Link as LinkIcon,
    Loader2,
    CheckCircle2,
    User,
    Phone as PhoneIcon,
    Mail
} from 'lucide-react'
import { createLead, searchLeads, linkLeadToProperty } from '../../crm/actions'
import { toast } from 'sonner'
import { IMaskInput } from 'react-imask'

interface LeadLinkerModalProps {
    propertyId: string
    propertyTitle: string
}

export function LeadLinkerModal({ propertyId, propertyTitle }: LeadLinkerModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [phoneValue, setPhoneValue] = useState('')

    // Debounced search for existing leads
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([])
            return
        }

        const timer = setTimeout(async () => {
            setIsSearching(true)
            const results = await searchLeads(searchQuery)
            setSearchResults(results)
            setIsSearching(false)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleCreateNew = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        formData.append('property_id', propertyId)
        formData.append('status', 'new')

        startTransition(async () => {
            const res = await createLead(formData)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success('Novo lead cadastrado e vinculado!')
                setIsOpen(false)
            }
        })
    }

    const handleLinkExisting = async (leadId: string) => {
        startTransition(async () => {
            const res = await linkLeadToProperty(leadId, propertyId)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success('Lead vinculado ao imóvel com sucesso!')
                setIsOpen(false)
            }
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full gap-2" size="sm">
                    <UserPlus className="h-4 w-4" />
                    Vincular Interessado
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                <div className="bg-primary/5 p-6 border-b border-zinc-100 dark:border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                            <LinkIcon className="h-5 w-5 text-primary" />
                            Vincular Interessado
                        </DialogTitle>
                        <p className="text-xs text-zinc-500 mt-1">
                            Vinculando lead ao imóvel: <span className="font-bold text-zinc-700 dark:text-zinc-300">{propertyTitle}</span>
                        </p>
                    </DialogHeader>
                </div>

                <Tabs defaultValue="new" className="w-full">
                    <TabsList className="w-full justify-start rounded-none border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-0 h-12">
                        <TabsTrigger
                            value="new"
                            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-full transition-all text-xs font-semibold"
                        >
                            <UserPlus className="h-3.5 w-3.5 mr-2" />
                            Novo Lead
                        </TabsTrigger>
                        <TabsTrigger
                            value="existing"
                            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-full transition-all text-xs font-semibold"
                        >
                            <Search className="h-3.5 w-3.5 mr-2" />
                            Lead Existente
                        </TabsTrigger>
                    </TabsList>

                    <div className="p-6 bg-white dark:bg-zinc-950">
                        {/* Tab 1: Create New */}
                        <TabsContent value="new" className="mt-0 space-y-4 outline-none">
                            <form onSubmit={handleCreateNew} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Nome Completo *</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        placeholder="Ex: João da Silva"
                                        className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                                        disabled={isPending}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Celular / WhatsApp</Label>
                                        <IMaskInput
                                            mask="(00) 00000-0000"
                                            name="phone"
                                            id="phone"
                                            placeholder="(11) 98765-4321"
                                            value={phoneValue}
                                            onAccept={(value: string) => setPhoneValue(value)}
                                            className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                                            disabled={isPending}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-zinc-500">E-mail</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="joao@email.com"
                                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                                            disabled={isPending}
                                        />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <Button type="submit" className="w-full py-6 font-bold text-lg shadow-lg shadow-primary/20" disabled={isPending}>
                                        {isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                                        Cadastrar e Vincular
                                    </Button>
                                </div>
                            </form>
                        </TabsContent>

                        {/* Tab 2: Existing Lead */}
                        <TabsContent value="existing" className="mt-0 space-y-4 outline-none">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <Input
                                    placeholder="Buscar por nome ou telefone..."
                                    className="pl-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>

                            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                                {isSearching ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                                        <Loader2 className="h-6 w-6 animate-spin mb-2" />
                                        <p className="text-xs">Buscando leads...</p>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((lead) => (
                                        <div
                                            key={lead.id}
                                            className="group flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-default"
                                        >
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-3.5 w-3.5 text-zinc-400" />
                                                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-200 truncate">{lead.name}</p>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    {lead.phone && (
                                                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium">
                                                            <PhoneIcon className="h-2.5 w-2.5" />
                                                            {lead.phone}
                                                        </div>
                                                    )}
                                                    {lead.email && (
                                                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium truncate max-w-[120px]">
                                                            <Mail className="h-2.5 w-2.5" />
                                                            {lead.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleLinkExisting(lead.id)}
                                                disabled={isPending}
                                            >
                                                Vincular
                                            </Button>
                                        </div>
                                    ))
                                ) : searchQuery.length >= 2 ? (
                                    <div className="text-center py-8 text-zinc-400">
                                        <p className="text-xs">Nenhum lead encontrado com "{searchQuery}"</p>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                                        <p className="text-xs italic">Digite pelo menos 2 caracteres para buscar</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
