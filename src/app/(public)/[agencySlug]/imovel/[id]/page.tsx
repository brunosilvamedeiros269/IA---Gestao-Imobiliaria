import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PropertyGallery } from '@/components/public/PropertyGallery'
import { Square, Bed, Bath, Car, MapPin, Building, Share2, Heart, Phone, CheckCircle2, Send, ShieldCheck, Loader2, ChevronRight } from 'lucide-react'
import { LeadCaptureForm } from '@/components/public/LeadCaptureForm'
import Link from 'next/link'
import { Metadata } from 'next'
import { cn } from '@/lib/utils'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const supabase = await createClient()
    const { id } = await params
    
    const { data: property } = await supabase
        .from('properties')
        .select('title, agencies(name)')
        .eq('id', id)
        .single()

    if (!property) return { title: 'Imóvel não encontrado' }

    return {
        title: `${property.title} | ${(property.agencies as any)?.name}`,
        description: `Confira os detalhes deste imóvel incrível em ${(property.agencies as any)?.name}.`,
    }
}

interface PageProps {
    params: {
        agencySlug: string
        id: string
    }
}

export default async function PublicPropertyPage({ params }: PageProps) {
    const supabase = await createClient()
    const resolvedParams = await params
    const id = resolvedParams.id
    const slug = resolvedParams.agencySlug

    // Fetch property and agency
    const { data: property, error } = await supabase
        .from('properties')
        .select('*, agencies(*)')
        .eq('id', id)
        .single()

    if (error || !property) return notFound()

    const agency = property.agencies as any
    const theme = agency?.portal_style || 'modern'
    const address = property.show_full_address 
        ? `${property.address_street}, ${property.address_number} - ${property.address_neighborhood}` 
        : `${property.address_neighborhood}, ${property.address_city}`
    const isFeatured = property.is_featured

    return (
        <div className={cn(
            "bg-white pb-32 relative", 
            (isFeatured || theme === 'minimalist') ? "font-serif" : "font-sans"
        )}>
            {/* Theme-Aware Navigation Breadcrumb */}
            <nav className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <Link href={`/${slug}/imoveis`} className="hover:text-primary transition-colors">Imóveis</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-zinc-900">{property.property_type} em {property.address_neighborhood}</span>
                </div>
            </nav>

            <main className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
                    {/* Main Content Column (2/3) */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Premium Header - Now internal for better alignment */}
                        <section>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                <div className="space-y-4 max-w-2xl">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Badge className={cn(
                                            "rounded-full font-black px-4 py-1.5 text-[10px] uppercase border-none tracking-widest",
                                            property.listing_type === 'sale' ? "bg-zinc-900 text-white" : "bg-primary text-white"
                                        )}>
                                            {property.listing_type === 'sale' ? 'À Venda' : 'Para Alugar'}
                                        </Badge>
                                        {property.is_exclusive && (
                                            <Badge className="rounded-full bg-primary/10 text-primary font-black px-4 py-1.5 text-[10px] uppercase border-none tracking-widest">
                                                Exclusividade
                                            </Badge>
                                        )}
                                    </div>
                                    <h1 className={cn(
                                        "text-4xl md:text-6xl lg:text-7xl font-black text-zinc-900 tracking-tighter uppercase leading-[0.85]",
                                        theme === 'minimalist' && "font-serif normal-case tracking-normal"
                                    )}>
                                        {property.title}
                                    </h1>
                                    <div className="flex items-center text-zinc-500 font-bold text-sm tracking-tight">
                                        <MapPin className="h-4 w-4 mr-2 text-primary shrink-0" />
                                        {address}
                                    </div>
                                </div>
                                
                                <div className="flex gap-3 shrink-0">
                                    <Button variant="outline" size="icon" className="rounded-full border-zinc-200 hover:bg-zinc-50 transition-all">
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="rounded-full border-zinc-200 hover:bg-zinc-50 transition-all">
                                        <Heart className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </section>

                        {/* Premium Immersive Gallery Grid & Carousel */}
                        <PropertyGallery photos={property.photos} theme={theme as any} />

                        {/* Property Data Specifications - Hybrid Design */}
                        <div className={cn(
                            "py-10 transition-all",
                            theme === 'minimalist' ? "border-y border-zinc-200" : "bg-white/50 backdrop-blur-xl rounded-[3.5rem] p-8 border border-zinc-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]"
                        )}>
                            <div className={cn(
                                "grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12",
                                theme === 'minimalist' && "flex flex-wrap justify-between"
                            )}>
                                {[
                                    { label: 'Área Total', value: `${property.useful_area}m²`, icon: Square },
                                    { label: 'Quartos', value: property.bedrooms, icon: Bed },
                                    { label: 'Banheiros', value: property.bathrooms, icon: Bath },
                                    { label: 'Vagas', value: property.parking_spots, icon: Car }
                                ].map((stat, idx) => (
                                    <div key={idx} className={cn(
                                        "flex flex-col transition-all group",
                                        theme === 'minimalist' ? "space-y-2" : "items-center text-center p-4 rounded-[2rem] hover:bg-zinc-50 transition-colors"
                                    )}>
                                        {theme === 'minimalist' ? (
                                            <>
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">{stat.label}</p>
                                                <p className="text-4xl font-serif italic text-zinc-900 leading-none">{stat.value}</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="h-14 w-14 rounded-full bg-zinc-50 flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:scale-110 transition-all">
                                                    <stat.icon className="h-6 w-6 text-zinc-400 group-hover:text-primary transition-colors" />
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">{stat.label}</p>
                                                <p className="text-xl font-black text-zinc-900 tracking-tighter">{stat.value}</p>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <h2 className={cn("text-3xl font-black text-zinc-900 uppercase tracking-tight", theme === 'minimalist' && "font-serif normal-case tracking-normal")}>
                                    O Refúgio Perfeito
                                </h2>
                                <div className="h-px flex-1 bg-zinc-100" />
                            </div>
                            <div className={cn("prose prose-zinc prose-lg max-w-none prose-headings:font-black prose-p:leading-relaxed prose-p:text-zinc-600", theme === 'minimalist' && "font-serif leading-loose italic")}>
                                <p className="whitespace-pre-line font-medium text-lg text-zinc-600">
                                    {property.description}
                                </p>
                            </div>
                        </div>

                        {/* Amenities */}
                        {property.amenities && property.amenities.length > 0 && (
                            <div className="space-y-10">
                                <div className="flex items-center gap-4">
                                    <h2 className={cn("text-3xl font-black text-zinc-900 uppercase tracking-tight", theme === 'minimalist' && "font-serif normal-case tracking-normal")}>
                                        Experiência Lifestyle
                                    </h2>
                                    <div className="h-px flex-1 bg-zinc-100" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {property.amenities.map((item: string) => (
                                        <div key={item} className="flex items-center gap-4 p-5 rounded-3xl bg-white border border-zinc-100 hover:border-primary/20 hover:shadow-lg hover:shadow-zinc-200/40 transition-all group">
                                            <div className="bg-primary/5 p-3 rounded-2xl group-hover:bg-primary transition-colors">
                                                <CheckCircle2 className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                                            </div>
                                            <span className="text-sm font-black text-zinc-700 uppercase tracking-widest">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sticky Sidebar (1/3) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 space-y-8">
                            <Card className={cn(
                                "rounded-[3rem] border-none shadow-2xl shadow-zinc-200/80 overflow-hidden",
                                theme === 'minimalist' ? "p-1 rounded-none bg-zinc-50 shadow-none border border-zinc-200" : "bg-zinc-900 text-white"
                            )}>
                                <CardContent className="p-10 space-y-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Investimento</p>
                                            <Badge variant="outline" className="text-[8px] font-black uppercase text-zinc-500 px-3 py-1 border-zinc-800 rounded-full">Atualizado hoje</Badge>
                                        </div>
                                        <h3 className={cn("text-5xl font-black tracking-tighter text-primary", theme === 'minimalist' && "text-zinc-900 font-serif leading-none")}>
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(property.price)}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-800/10">
                                            <div className="space-y-1">
                                                <span className="block text-zinc-500 font-bold uppercase tracking-widest text-[9px]">Condomínio</span>
                                                <span className="font-black text-lg">{property.condominio_fee ? `R$ ${property.condominio_fee}` : 'Isento'}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="block text-zinc-500 font-bold uppercase tracking-widest text-[9px]">IPTU Mensal</span>
                                                <span className="font-black text-lg">{property.iptu ? `R$ ${property.iptu}` : 'Isento'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <Button className="w-full h-16 rounded-2xl font-black text-lg uppercase tracking-tight shadow-xl shadow-primary/30 transition-all hover:scale-[1.02]" asChild>
                                            <Link href={`https://wa.me/${agency.whatsapp_number?.replace(/\D/g, '')}?text=Olá! Tenho interesse no imóvel: ${property.title} (${id})`} target="_blank">
                                                <Phone className="mr-3 h-5 w-5" /> Agendar Visita
                                            </Link>
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className={cn(
                                                "w-full h-16 rounded-2xl font-black text-lg uppercase tracking-tight transition-all",
                                                theme === 'minimalist' 
                                                    ? "border-zinc-800 hover:bg-zinc-800 hover:text-white" 
                                                    : "border-zinc-800 text-white hover:bg-zinc-800 bg-transparent"
                                            )}
                                        >
                                            Falar com Consultor
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <LeadCaptureForm 
                                agencyId={agency.id} 
                                propertyId={id} 
                                title="Interesse no Imóvel?" 
                                subtitle="Deixe seu contato e receba o material completo com exclusividade." 
                            />
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating Quick CTA for Mobile - Enhanced with Glow and Spacing Fix */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] md:hidden w-[92%] flex gap-3 p-1.5 bg-white/20 backdrop-blur-2xl rounded-full border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <Button 
                    className="flex-1 h-12 rounded-full shadow-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
                    asChild
                >
                    <Link href={`https://wa.me/${agency.whatsapp_number?.replace(/\D/g, '')}?text=Olá! Tenho interesse no imóvel: ${property.title} (${id})`} target="_blank">
                        <Phone className="h-3 w-3 mr-2 fill-white" /> WhatsApp
                    </Link>
                </Button>
                <Button 
                    variant="outline" 
                    className="h-12 w-12 rounded-full bg-white/95 backdrop-blur-md shadow-lg border-zinc-200 active:scale-95 transition-all shrink-0"
                >
                    <Heart className="h-4 w-4 text-zinc-900" />
                </Button>
            </div>
        </div>
    )
}
