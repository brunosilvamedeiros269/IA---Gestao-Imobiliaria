import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { 
    MapPin, Bed, Bath, Car, Maximize, Edit, Share, ChevronLeft, 
    Image as ImageIcon, ChevronRight, Waves, Dumbbell, Home, 
    Sparkles, ShieldCheck, Star, Sofa, PawPrint, Banknote, 
    Lock, User, Phone, CheckCircle2, Hash
} from 'lucide-react'
import Link from 'next/link'
import { LeadLinkerModal } from './lead-linker-modal'
import { cn } from '@/lib/utils'

const AMENITIES_ICONS: Record<string, any> = {
    pool: Waves,
    gym: Dumbbell,
    party_room: Home,
    barbecue: Sparkles,
    security: ShieldCheck,
    playground: Star,
}

const AMENITIES_LABELS: Record<string, string> = {
    pool: 'Piscina',
    gym: 'Academia',
    party_room: 'Salão de Festas',
    barbecue: 'Churrasqueira',
    security: 'Portaria 24h',
    playground: 'Playground',
}

interface PageProps {
    params: {
        id: string
    }
}

export default async function PropertyDetailsPage({ params }: PageProps) {
    const supabase = await createClient()
    const resolvedParams = await params

    const { data: property, error } = await supabase
        .from('properties')
        .select(`
            *,
            broker:users_profile(*)
        `)
        .eq('id', resolvedParams.id)
        .single()

    if (error || !property) {
        return notFound()
    }

    const { data: { user } } = await supabase.auth.getUser()
    const isOwner = property.broker_id === user?.id
    const isAdmin = (property.broker as any)?.role === 'admin'
    const canSeePrivateData = isOwner || isAdmin

    const formatCurrency = (value: number | null) => {
        if (!value) return 'Sob Consulta'
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    }

    const photos = property.photos as string[] || []
    const mainPhoto = photos.length > 0 ? photos[0] : null
    const thumbnails = photos.slice(1, 5)
    const amenities = property.amenities as string[] || []

    return (
        <div className="space-y-6 pb-12">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild className="pl-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                    <Link href="/inventory">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Voltar para o Inventário
                    </Link>
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Share className="w-4 h-4 mr-2" />
                        Compartilhar
                    </Button>
                    <Button asChild>
                        <Link href={`/inventory/${property.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar Imóvel
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant={property.status === 'active' ? 'default' : 'secondary'} className="uppercase font-black text-[10px] tracking-widest px-2 py-0.5">
                            {property.status === 'active' ? 'Ativo' : property.status}
                        </Badge>
                        <Badge variant="outline" className="uppercase font-black text-[10px] tracking-widest px-2 py-0.5 border-zinc-300">
                            {property.listing_type === 'sale' ? 'Venda' : 'Locação'}
                        </Badge>
                        {property.is_exclusive && (
                            <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white uppercase font-black text-[10px] tracking-widest px-2 py-0.5 border-none">
                                <Star className="w-2.5 h-2.5 mr-1 fill-white" /> EXCLUSIVO
                            </Badge>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-zinc-900 dark:text-zinc-50">{property.title}</h1>
                    <div className="flex items-center text-zinc-500 font-medium">
                        <MapPin className="w-4 h-4 mr-1 text-primary" />
                        <span>
                            {property.show_full_address 
                                ? `${property.address_street}, ${property.address_number && `${property.address_number} - `}${property.address_neighborhood}, ${property.address_city} - ${property.address_state}`
                                : `${property.address_neighborhood}, ${property.address_city} - ${property.address_state}`
                            }
                            {!property.show_full_address && <span className="ml-2 text-[10px] text-zinc-400 font-bold uppercase">(Endereço Protegido)</span>}
                        </span>
                    </div>
                </div>
                <div className="text-right flex flex-col items-start md:items-end">
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">Valor {property.listing_type === 'sale' ? 'de Venda' : 'Mensal'}</p>
                    <h2 className="text-4xl font-black text-primary tracking-tighter">{formatCurrency(property.price)}</h2>
                </div>
            </div>

            {/* Image Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[300px] md:h-[500px]">
                {/* Main Photo */}
                <div className="md:col-span-3 relative rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 h-full min-h-0 shadow-lg group">
                    {mainPhoto ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={mainPhoto} alt={property.title} className="object-cover w-full h-full absolute inset-0 transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center flex-col text-zinc-400">
                            <ImageIcon className="w-12 h-12 mb-2" />
                            <span>Sem fotos</span>
                        </div>
                    )}
                    <div className="absolute bottom-4 left-4 z-10">
                        <Badge className="bg-black/50 backdrop-blur-md text-white border-white/20 px-3 py-1 font-bold text-xs">
                             <ImageIcon className="w-3 h-3 mr-1.5" /> {photos.length} Fotos
                        </Badge>
                    </div>
                </div>

                {/* Thumbnails */}
                <div className="hidden md:grid grid-rows-4 gap-4 h-full min-h-0">
                    {thumbnails.map((thumb: string, index: number) => (
                        <div key={index} className="relative rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 min-h-0 shadow-sm hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={thumb} alt={`Foto ${index + 2}`} className="object-cover w-full h-full absolute inset-0 group-hover:scale-110 transition-transform" />
                        </div>
                    ))}
                    {/* Placeholder for remaining grid slots if less than 4 thumbnails */}
                    {Array.from({ length: Math.max(0, 4 - thumbnails.length) }).map((_, idx) => (
                        <div key={`empty-${idx}`} className="rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 min-h-0 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-zinc-300" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                {/* Content Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Typology Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col items-center justify-center group hover:border-primary/30 transition-colors">
                            <Bed className="w-5 h-5 text-zinc-400 mb-2 group-hover:text-primary" />
                            <span className="text-xl font-black text-zinc-900 dark:text-zinc-50">{property.bedrooms || 0}</span>
                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mt-0.5">Quartos</span>
                            {property.suites_count > 0 && (
                                <span className="text-[9px] font-bold text-primary uppercase mt-1">Sendo {property.suites_count} {property.suites_count === 1 ? 'Suíte' : 'Suítes'}</span>
                            )}
                        </div>
                        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col items-center justify-center group hover:border-primary/30 transition-colors">
                            <Bath className="w-5 h-5 text-zinc-400 mb-2 group-hover:text-primary" />
                            <span className="text-xl font-black text-zinc-900 dark:text-zinc-50">{property.bathrooms || 0}</span>
                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mt-0.5">Banheiros</span>
                        </div>
                        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col items-center justify-center group hover:border-primary/30 transition-colors">
                            <Car className="w-5 h-5 text-zinc-400 mb-2 group-hover:text-primary" />
                            <span className="text-xl font-black text-zinc-900 dark:text-zinc-50">{property.parking_spots || 0}</span>
                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mt-0.5">Vagas</span>
                        </div>
                        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col items-center justify-center group hover:border-primary/30 transition-colors">
                            <Maximize className="w-5 h-5 text-zinc-400 mb-2 group-hover:text-primary" />
                            <span className="text-xl font-black text-zinc-900 dark:text-zinc-50">{property.useful_area || 0}</span>
                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mt-0.5">m² Útil</span>
                        </div>
                    </div>

                    {/* Features & Options (Furnished, Pets, etc) */}
                    <div className="flex flex-wrap gap-3">
                         {property.is_furnished && (
                            <Badge variant="outline" className="rounded-full px-4 py-1.5 border-zinc-200 bg-zinc-50 text-zinc-700 font-bold text-xs flex gap-2 items-center">
                                <Sofa className="w-3.5 h-3.5" /> Mobiliado
                            </Badge>
                         )}
                         {property.pets_allowed && (
                            <Badge variant="outline" className="rounded-full px-4 py-1.5 border-zinc-200 bg-zinc-50 text-zinc-700 font-bold text-xs flex gap-2 items-center">
                                <PawPrint className="w-3.5 h-3.5" /> Aceita Pets
                            </Badge>
                         )}
                         {property.accepts_financing && (
                            <Badge variant="outline" className="rounded-full px-4 py-1.5 border-zinc-200 bg-zinc-50 text-zinc-700 font-bold text-xs flex gap-2 items-center">
                                <Banknote className="w-3.5 h-3.5" /> Financimento
                            </Badge>
                         )}
                         {property.floor_number && (
                            <Badge variant="outline" className="rounded-full px-4 py-1.5 border-zinc-200 bg-zinc-50 text-zinc-700 font-bold text-xs flex gap-2 items-center">
                                <Hash className="w-3.5 h-3.5" /> {property.floor_number}º Andar
                            </Badge>
                         )}
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary rounded-full" />
                            <h3 className="text-xl font-black uppercase tracking-tight">Sobre o Imóvel</h3>
                        </div>
                        <div className="prose prose-zinc dark:prose-invert max-w-none">
                            <p className="whitespace-pre-wrap text-zinc-600 dark:text-zinc-400 leading-relaxed text-base font-medium">
                                {property.description || 'Nenhuma descrição fornecida para este imóvel.'}
                            </p>
                        </div>
                    </div>

                    {/* Amenities (Condominium) */}
                    {amenities.length > 0 && (
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-6 bg-zinc-300 rounded-full" />
                                <h3 className="text-xl font-black uppercase tracking-tight text-zinc-500">Lazer & Condomínio</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {amenities.map((id) => {
                                    const Icon = AMENITIES_ICONS[id] || Sparkles
                                    return (
                                        <div key={id} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                            <div className="bg-white dark:bg-zinc-800 p-2 rounded-lg shadow-sm">
                                                <Icon className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{AMENITIES_LABELS[id] || id}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Radar de Inteligência (Privado) */}
                    {canSeePrivateData && (
                        <Card className="border-indigo-100 dark:border-indigo-900/30 overflow-hidden shadow-sm bg-indigo-50/20">
                            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 px-6 py-3 border-b border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                                    <Lock className="h-4 w-4" />
                                    <span className="text-xs font-black uppercase tracking-widest">Radar de Gestão</span>
                                </div>
                                <Badge variant="outline" className="text-[9px] bg-green-50 text-green-700 border-green-200 uppercase font-black">Confidencial</Badge>
                            </div>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-3">
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-[10px] uppercase font-black text-zinc-400 tracking-tighter">Proprietário</Label>
                                        <div className="flex items-center gap-2 group">
                                            <div className="w-8 h-8 rounded-full bg-white border border-indigo-100 flex items-center justify-center">
                                                <User className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <span className="text-sm font-black text-zinc-900">{property.owner_name || 'Não Informado'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-[10px] uppercase font-black text-zinc-400 tracking-tighter">Contato Direto</Label>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-white border border-indigo-100 flex items-center justify-center">
                                                <Phone className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <span className="text-sm font-black text-zinc-900">{property.owner_phone || 'Não Informado'}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-2 grid grid-cols-2 gap-2">
                                        <div className="p-3 bg-white rounded-xl border border-indigo-50 shadow-sm flex flex-col items-center justify-center text-center">
                                            <span className="text-[10px] font-black uppercase text-zinc-400 mb-1">Comissão</span>
                                            <span className="text-lg font-black text-indigo-700">{property.commission_percentage || '0'}%</span>
                                        </div>
                                        <div className="p-3 bg-white rounded-xl border border-indigo-50 shadow-sm flex flex-col items-center justify-center text-center">
                                            <span className="text-[10px] font-black uppercase text-zinc-400 mb-1">Exclusivo</span>
                                            {property.is_exclusive ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <ChevronRight className="w-5 h-5 text-zinc-200" />}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* CRM / Leads Card */}
                    <Card className="border-primary/20 bg-primary/5 shadow-inner">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                                <Sparkles className="w-4 h-4 text-primary" />
                                Leads Interessados
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Fetch leads for this specific property */}
                            {async function LeadsList() {
                                const { data: leads } = await supabase
                                    .from('leads')
                                    .select('id, name, funnel_status')
                                    .eq('property_id', property.id)
                                    .order('created_at', { ascending: false })

                                const count = leads?.length || 0

                                if (count === 0) {
                                    return (
                                        <div className="text-center py-4">
                                            <p className="text-[10px] font-bold text-zinc-500 mb-4 px-4 uppercase tracking-tighter">Nenhum lead interessado neste imóvel ainda.</p>
                                            <LeadLinkerModal propertyId={property.id} propertyTitle={property.title} />
                                        </div>
                                    )
                                }

                                return (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Pipeline Atual</span>
                                            <Badge variant="default" className="text-[10px] px-1.5 py-0 h-5 font-black">
                                                {count} {count === 1 ? 'Lead' : 'Leads'}
                                            </Badge>
                                        </div>
                                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                            {leads?.map((lead) => (
                                                <Link
                                                    key={lead.id}
                                                    href={`/crm/${lead.id}`}
                                                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-primary/50 transition-all hover:shadow-md group"
                                                >
                                                    <span className="text-xs font-black text-zinc-700 dark:text-zinc-300 group-hover:text-primary truncate max-w-[120px]">
                                                        {lead.name}
                                                    </span>
                                                    <ChevronRight className="w-3 h-3 text-zinc-300 group-hover:text-primary transform group-hover:translate-x-0.5 transition-transform" />
                                                </Link>
                                            ))}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <LeadLinkerModal propertyId={property.id} propertyTitle={property.title} />
                                            <Button className="w-full h-10 rounded-xl font-bold uppercase text-[10px] tracking-widest border-primary/20 hover:bg-white" size="sm" variant="outline" asChild>
                                                <Link href="/crm">Ver no Pipeline</Link>
                                            </Button>
                                        </div>
                                    </div>
                                )
                            }()}
                        </CardContent>
                    </Card>

                    {/* Broker Info */}
                    {property.broker && (
                        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mt-6">
                            <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 py-3">
                                <CardTitle className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Captação Responsável</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden border-2 border-white dark:border-zinc-900 shadow-md">
                                        {((property.broker as any).avatar_url) ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={(property.broker as any).avatar_url} alt="Corretor" className="object-cover w-full h-full" />
                                        ) : (
                                            <span className="text-xl font-black text-zinc-400">
                                                {((property.broker as any).full_name || 'N').charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-black text-zinc-900 dark:text-zinc-50 tracking-tight">{(property.broker as any).full_name || 'Corretor'}</p>
                                        <p className="text-[10px] font-black uppercase text-primary tracking-tighter">{(property.broker as any).role === 'admin' ? 'Gestor de Unidade' : 'Corretor Associado'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
