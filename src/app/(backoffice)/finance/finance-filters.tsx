'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search, Filter, X } from 'lucide-react'
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useState, useCallback } from 'react'

export function FinanceFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const [search, setSearch] = useState(searchParams.get('search') || '')
    const [status, setStatus] = useState(searchParams.get('status') || 'all')
    const [type, setType] = useState(searchParams.get('type') || 'all')

    const updateFilters = useCallback((newFilters: { search?: string, status?: string, type?: string }) => {
        const params = new URLSearchParams(searchParams.toString())
        
        if (newFilters.search !== undefined) {
            if (newFilters.search) params.set('search', newFilters.search)
            else params.delete('search')
        }
        
        if (newFilters.status !== undefined) {
            if (newFilters.status !== 'all') params.set('status', newFilters.status)
            else params.delete('status')
        }

        if (newFilters.type !== undefined) {
            if (newFilters.type !== 'all') params.set('type', newFilters.type)
            else params.delete('type')
        }

        router.push(`/finance?${params.toString()}`)
    }, [router, searchParams])

    return (
        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
            <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                <Input 
                    placeholder="Buscar por imóvel, lead ou ID..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && updateFilters({ search })}
                    className="pl-9 h-11 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl"
                />
                {search && (
                    <button 
                        onClick={() => { setSearch(''); updateFilters({ search: '' }); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
                <Select value={type} onValueChange={(val) => { setType(val); updateFilters({ type: val }); }}>
                    <SelectTrigger className="w-[130px] h-11 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl font-bold">
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="all" className="font-bold">Todos Tipos</SelectItem>
                        <SelectItem value="sale" className="font-bold">Venda</SelectItem>
                        <SelectItem value="rent" className="font-bold">Locação</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={status} onValueChange={(val) => { setStatus(val); updateFilters({ status: val }); }}>
                    <SelectTrigger className="w-[140px] h-11 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl font-bold">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="all" className="font-bold">Todos Status</SelectItem>
                        <SelectItem value="pending" className="font-bold">Pendente</SelectItem>
                        <SelectItem value="paid" className="font-bold">Pago</SelectItem>
                        <SelectItem value="cancelled" className="font-bold">Cancelado</SelectItem>
                    </SelectContent>
                </Select>

                {(search || status !== 'all' || type !== 'all') && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                            setSearch(''); setStatus('all'); setType('all');
                            router.push('/finance');
                        }}
                        className="h-11 w-11 rounded-xl text-zinc-400 hover:text-red-500"
                    >
                        <X size={18} />
                    </Button>
                )}
            </div>
        </div>
    )
}
