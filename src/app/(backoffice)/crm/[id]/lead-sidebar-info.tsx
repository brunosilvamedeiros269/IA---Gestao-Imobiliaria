import { 
    Phone, Mail, Calendar, User, Building, MapPin, 
    MessageCircle, Zap, Instagram, Globe, Users, Target,
    ThermometerSnowflake, ThermometerSun, Flame, TrendingUp
} from 'lucide-react'
import { LeadWithProperty } from '../actions'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const SOURCES: Record<string, { label: string, icon: any }> = {
    'direct': { label: 'Direto / Site', icon: Globe },
    'whatsapp': { label: 'WhatsApp', icon: MessageCircle },
    'instagram': { label: 'Instagram', icon: Instagram },
    'zap': { label: 'Portal ZAP', icon: Zap },
    'vivareal': { label: 'VivaReal', icon: Zap },
    'indication': { label: 'Indicação', icon: Users },
}

const URGENCY_LEVELS: Record<number, { label: string, icon: any, color: string, bg: string }> = {
    1: { label: 'Frio', icon: ThermometerSnowflake, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
    3: { label: 'Morno', icon: ThermometerSun, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20' },
    5: { label: 'Quente', icon: Flame, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/20' },
}

export function LeadSidebarInfo({ lead }: { lead: any }) { // Using any temporarily if types are not updated
    const formattedDate = format(new Date(lead.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    
    // Fallback for new fields in V2.0
    const source = SOURCES[lead.source as string] || SOURCES['direct']
    const SourceIcon = source.icon
    const urgency = URGENCY_LEVELS[lead.urgency_score as number] || URGENCY_LEVELS[1]
    const UrgencyIcon = urgency.icon

    const whatsappLink = lead.phone 
        ? `https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${lead.name.split(' ')[0]}, tudo bem? Sou o seu corretor e vi seu interesse no imóvel ${lead.properties?.title || 'em nosso catálogo'}. Como posso te ajudar hoje?`)}`
        : null

    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            {whatsappLink && (
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 rounded-xl shadow-lg shadow-emerald-500/20 gap-2 overflow-hidden group" asChild>
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-5 w-5 fill-current group-hover:scale-110 transition-transform" />
                        Iniciar Conversa no WhatsApp
                    </a>
                </Button>
            )}

            {/* Sales Intel Card (V2.0) */}
            <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-zinc-950 rounded-xl border border-indigo-100 dark:border-indigo-900/50 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-5 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Inteligência de Vendas
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-widest pl-0.5">Origem</p>
                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30">
                            <SourceIcon className="h-4 w-4 text-indigo-500" />
                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{source.label}</span>
                        </div>
                    </div>
                    
                    <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-widest pl-0.5">Temperatura</p>
                        <div className={`flex items-center gap-2 p-2.5 rounded-lg border dark:border-zinc-800 ${urgency.bg} border-transparent`}>
                            <UrgencyIcon className={`h-4 w-4 ${urgency.color}`} />
                            <span className={`text-xs font-bold ${urgency.color}`}>{urgency.label}</span>
                        </div>
                    </div>

                    <div className="col-span-2 space-y-1.5 pt-1">
                        <p className="text-[10px] font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-widest pl-0.5">Expectativa de Orçamento</p>
                        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-400 uppercase font-black">Min</span>
                                <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                                    {lead.budget_min ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(lead.budget_min) : 'N/A'}
                                </span>
                            </div>
                            <div className="h-8 w-px bg-indigo-50 dark:bg-indigo-900" />
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-zinc-400 uppercase font-black">Max</span>
                                <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                                    {lead.budget_max ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(lead.budget_max) : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Informações de Contato
                </h3>
                <div className="space-y-4">
                    {lead.phone ? (
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-md">
                                <Phone className="h-4 w-4 text-zinc-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Telefone</p>
                                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-200">{lead.phone}</p>
                            </div>
                        </div>
                    ) : null}

                    {lead.email ? (
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-md">
                                <Mail className="h-4 w-4 text-zinc-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">E-mail</p>
                                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-200">{lead.email}</p>
                            </div>
                        </div>
                    ) : null}

                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-md">
                            <Calendar className="h-4 w-4 text-zinc-500" />
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Captado em</p>
                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-200">{formattedDate}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interest Card */}
            {lead.properties && (
                <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-0 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <Building className="h-4 w-4 text-primary" />
                            Imóvel de Interesse
                        </h3>
                    </div>

                    <div className="relative h-40 w-full bg-zinc-100 dark:bg-zinc-900">
                        {lead.properties.photos && lead.properties.photos.length > 0 ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={lead.properties.photos[0]} alt="Prop" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400">Sem fotos</div>
                        )}
                        <div className="absolute top-2 right-2">
                            <Badge className="bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 backdrop-blur-sm border-none shadow-sm">
                                {lead.properties.listing_type === 'sale' ? 'Venda' : 'Locação'}
                            </Badge>
                        </div>
                    </div>

                    <div className="p-4 space-y-3">
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">{lead.properties.title}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="line-clamp-1">{lead.properties.address_summary || 'Endereço não informado'}</span>
                        </div>
                        <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 mt-2">
                            <p className="text-sm font-black text-primary">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.properties.price)}
                            </p>
                            <Link href={`/inventory/${lead.property_id}`} className="text-xs font-bold text-primary hover:underline group flex items-center gap-1">
                                Ver Detalhes
                                <TrendingUp className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
            {children}
        </span>
    )
}
