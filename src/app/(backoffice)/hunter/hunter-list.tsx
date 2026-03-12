'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { 
    Search, 
    MapPin, 
    Building2, 
    Bed, 
    Bath, 
    Car, 
    Maximize2, 
    ExternalLink, 
    User, 
    Phone, 
    Smartphone,
    CheckCircle2,
    XCircle,
    Brain,
    Loader2,
    RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { claimOpportunity, discardOpportunity, simulateHunt } from './hunter-actions'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function HunterList({ opportunities: initialOpportunities }: { opportunities: any[] }) {
    const [isPending, startTransition] = useTransition()
    const [isSimulating, setIsSimulating] = useState(false)

    const handleClaim = (id: string) => {
        startTransition(async () => {
            const res = await claimOpportunity(id)
            if (res.error) toast.error(res.error)
            else toast.success('Você assumiu esta oportunidade!')
        })
    }

    const handleDiscard = (id: string) => {
        startTransition(async () => {
            const res = await discardOpportunity(id)
            if (res.error) toast.error(res.error)
            else toast.success('Oportunidade descartada.')
        })
    }

    const handleSimulate = async () => {
        setIsSimulating(true)
        try {
            const res = await simulateHunt()
            if (res.error) toast.error(res.error)
            else toast.success('Simulação concluída! Novos imóveis encontrados.')
        } finally {
            setIsSimulating(false)
        }
    }

    const pendingOpportunities = initialOpportunities.filter(o => o.status === 'pending')
    const claimedOpportunities = initialOpportunities.filter(o => o.status === 'claimed')

    return (
        <div className="space-y-8">
            {/* Simulation Banner (Only for PoW during development) */}
            {initialOpportunities.length === 0 && (
                <div className="p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/20 flex flex-col items-center text-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Brain className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold">Nenhum imóvel encontrado no momento</h2>
                        <p className="text-sm text-zinc-500 max-w-md">O Hunter IA monitora o mercado diariamente. Você pode simular uma busca agora para ver o robô em ação.</p>
                    </div>
                    <Button onClick={handleSimulate} disabled={isSimulating} className="font-bold gap-2">
                        {isSimulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        Simular Busca do Hunter IA
                    </Button>
                </div>
            )}

            {pendingOpportunities.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Search className="h-5 w-5 text-primary" />
                        Novas Oportunidades ({pendingOpportunities.length})
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {pendingOpportunities.map((opp) => (
                            <OpportunityCard 
                                key={opp.id} 
                                opportunity={opp} 
                                onClaim={handleClaim} 
                                onDiscard={handleDiscard}
                                isPending={isPending}
                            />
                        ))}
                    </div>
                </div>
            )}

            {claimedOpportunities.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Em Atendimento ({claimedOpportunities.length})
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {claimedOpportunities.map((opp) => (
                            <OpportunityCard 
                                key={opp.id} 
                                opportunity={opp} 
                                onClaim={handleClaim} 
                                onDiscard={handleDiscard}
                                isPending={isPending}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function OpportunityCard({ opportunity, onClaim, onDiscard, isPending }: any) {
    const isClaimed = opportunity.status === 'claimed'

    return (
        <Card className="flex flex-col h-full border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            {/* Header com Imagem ou Placeholder */}
            <div className="aspect-video bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden">
                {opportunity.photos?.[0] ? (
                    <img src={opportunity.photos[0]} alt={opportunity.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 gap-2">
                        <Building2 className="h-10 w-10" />
                        <span className="text-[10px] uppercase font-black tracking-widest">Sem fotos reais</span>
                    </div>
                )}
                
                <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-white/90 dark:bg-zinc-950/90 text-zinc-900 border-none px-2 py-1 font-black text-[10px] uppercase">
                        {opportunity.portal_name}
                    </Badge>
                </div>

                <div className="absolute bottom-3 right-3">
                    <Badge variant="secondary" className="backdrop-blur-md bg-black/50 text-white border-none font-bold">
                        {opportunity.property_type}
                    </Badge>
                </div>
            </div>

            <CardHeader className="p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base font-bold line-clamp-2 leading-tight">
                        {opportunity.title}
                    </CardTitle>
                </div>
                <div className="flex items-center text-xs text-zinc-500 gap-1 font-medium">
                    <MapPin className="h-3 w-3" />
                    {opportunity.address_neighborhood}, {opportunity.address_city}
                </div>
                <div className="text-xl font-black text-primary">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(opportunity.price)}
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-1 space-y-4">
                {/* Atributos */}
                <div className="flex items-center justify-between py-3 border-y border-zinc-100 dark:border-zinc-900">
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1 text-xs font-bold">
                            <Bed className="h-3 w-3 text-zinc-400" />
                            {opportunity.bedrooms}
                        </div>
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-tighter text-center">Quartos</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1 text-xs font-bold">
                            <Bath className="h-3 w-3 text-zinc-400" />
                            {opportunity.bathrooms}
                        </div>
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-tighter text-center">Banheiros</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1 text-xs font-bold">
                            <Maximize2 className="h-3 w-3 text-zinc-400" />
                            {opportunity.useful_area}m²
                        </div>
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-tighter text-center">Área</span>
                    </div>
                </div>

                {/* AI Insight */}
                <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 space-y-1.5 ring-1 ring-inset ring-primary/5">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary">
                        <Brain className="h-3 w-3" />
                        Análise Hunter IA
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed font-medium italic italic">
                        "{opportunity.rewritten_description || opportunity.description}"
                    </p>
                </div>

                {/* Owner Info (Only if claimed) */}
                {isClaimed ? (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50 space-y-2">
                        <div className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Contato Liberado</div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold">
                                <User className="h-3 w-3 text-emerald-500" />
                                {opportunity.owner_name}
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 hover:bg-emerald-100">
                                <Phone className="h-3 w-3" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-black text-zinc-800 dark:text-zinc-100">
                            <Smartphone className="h-4 w-4 text-emerald-500" />
                            {opportunity.owner_phone}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center p-3 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Assuma a oportunidade para ver o contato</span>
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-4 pt-0 gap-2">
                {!isClaimed ? (
                    <>
                        <Button 
                            variant="outline" 
                            className="flex-1 text-xs font-bold text-zinc-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                            onClick={() => onDiscard(opportunity.id)}
                            disabled={isPending}
                        >
                            <XCircle className="h-3.5 w-3.5 mr-2" />
                            Descartar
                        </Button>
                        <Button 
                            className="flex-1 text-xs font-bold gap-2"
                            onClick={() => onClaim(opportunity.id)}
                            disabled={isPending}
                        >
                            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Smartphone className="h-3.5 w-3.5" />}
                            Quero Atender
                        </Button>
                    </>
                ) : (
                    <div className="flex w-full items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7 border border-white">
                                <AvatarImage src={opportunity.broker?.avatar_url} />
                                <AvatarFallback className="text-[10px] font-bold">
                                    {opportunity.broker?.full_name?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-[10px] font-bold text-zinc-500 truncate max-w-[80px]">Você está captando</span>
                        </div>
                        <Button size="sm" className="h-8 text-xs font-bold gap-1.5 bg-zinc-900 hover:bg-black">
                            Complementar Cadastro
                            <ExternalLink className="h-3 w-3" />
                        </Button>
                    </div>
                )}
            </CardFooter>
            
            {/* Timestamp */}
            <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-[10px] text-zinc-400 font-medium">
                <span>Encontrado {formatDistanceToNow(new Date(opportunity.created_at), { addSuffix: true, locale: ptBR })}</span>
                <a href={opportunity.external_url} target="_blank" className="flex items-center gap-1 hover:text-primary transition-colors">
                    Ver Original <ExternalLink className="h-2.5 w-2.5" />
                </a>
            </div>
        </Card>
    )
}
