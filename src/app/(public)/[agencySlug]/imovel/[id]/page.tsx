import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
    MapPin, Bed, Bath, Car, Building, 
    Share2, Heart, Phone, Sparkles, 
    CheckCircle2, Info, ChevronRight,
    Square
} from 'lucide-react'
import { LeadCaptureForm } from '@/components/public/LeadCaptureForm'
import Link from 'next/link'
import { Metadata } from 'next'

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

    const agency = property.agencies
    const address = property.show_full_address 
        ? `${property.address_street}, ${property.address_number} - ${property.address_neighborhood}` 
        : `${property.address_neighborhood}, ${property.address_city}`

    return (
        <div className="bg-white pb-24">
            {/* Image Gallery - Premium Style */}
            <section className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[600px]">
                    <div className="md:col-span-2 relative group overflow-hidden rounded-[2.5rem]">
                        <img 
                            src={property.photos?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                            alt="Main" 
                        />
                        <div className="absolute top-6 left-6 flex gap-2">
                             <Badge className="bg-white/95 text-zinc-900 border-none font-black uppercase text-[10px] px-4 py-1.5 shadow-xl">
                                {property.listing_type === 'sale' ? 'À Venda' : 'Para Alugar'}
                             </Badge>
                             {property.is_exclusive && (
                                <Badge className="bg-primary text-white border-none font-black uppercase text-[10px] px-4 py-1.5 shadow-xl">Exclusividade</Badge>
                             )}
                        </div>
                    </div>
                    <div className="md:col-span-2 grid grid-cols-2 gap-4 h-full">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="relative group overflow-hidden rounded-[2rem]">
                                <img 
                                    src={property.photos?.[i] || 'https://images.unsplash.com/photo-1564013795939-663efc0f23a9'} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    alt={`Extra ${i}`} 
                                />
                                {i === 4 && property.photos?.length > 5 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                        <span className="text-white font-black text-xl">+{property.photos.length - 5} Fotos</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Header Info */}
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant="secondary" className="rounded-full bg-zinc-100 text-zinc-500 font-bold px-3 py-1 text-[10px] uppercase border-none">
                                    {property.property_type}
                                </Badge>
                                <div className="flex items-center text-zinc-400 font-bold text-xs uppercase tracking-widest">
                                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                                    {address}
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tighter uppercase leading-[0.95]">
                                {property.title}
                            </h1>
                        </div>

                        {/* Fast Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-8 border-y border-zinc-100">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Área Útil</p>
                                <div className="flex items-center gap-2">
                                    <Square className="h-5 w-5 text-primary" />
                                    <p className="text-lg font-black">{property.useful_area}m²</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Dormitórios</p>
                                <div className="flex items-center gap-2">
                                    <Bed className="h-5 w-5 text-primary" />
                                    <p className="text-lg font-black">{property.bedrooms} {property.suites_count ? `(${property.suites_count} Suítes)` : ''}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Banheiros</p>
                                <div className="flex items-center gap-2">
                                    <Bath className="h-5 w-5 text-primary" />
                                    <p className="text-lg font-black">{property.bathrooms}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Vagas</p>
                                <div className="flex items-center gap-2">
                                    <Car className="h-5 w-5 text-primary" />
                                    <p className="text-lg font-black">{property.parking_spots}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                Sobre este imóvel
                            </h2>
                            <div className="prose prose-zinc max-w-none">
                                <p className="text-zinc-600 text-lg leading-relaxed whitespace-pre-line font-medium">
                                    {property.description}
                                </p>
                            </div>
                        </div>

                        {/* Amenities */}
                        {property.amenities && property.amenities.length > 0 && (
                            <div className="space-y-6 pb-12">
                                <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Comodidades & Lazer</h2>
                                <div className="flex flex-wrap gap-3">
                                    {property.amenities.map((item: string) => (
                                        <div key={item} className="flex items-center gap-2 bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-3">
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                            <span className="text-sm font-black text-zinc-700 uppercase tracking-tight">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: CTA & Lead Form */}
                    <div className="space-y-8 relative">
                        <div className="sticky top-28 space-y-6">
                            {/* Price Card */}
                            <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-zinc-200/50 overflow-hidden bg-zinc-900 text-white">
                                <CardContent className="p-10 space-y-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Valor total</p>
                                        <h3 className="text-4xl font-black tracking-tighter text-primary">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(property.price)}
                                        </h3>
                                    </div>
                                    
                                    <div className="space-y-3 pt-4 border-t border-zinc-800">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Condomínio</span>
                                            <span className="font-black">{property.condominio_fee ? `R$ ${property.condominio_fee}` : 'Isento'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">IPTU Mensal</span>
                                            <span className="font-black">{property.iptu ? `R$ ${property.iptu}` : 'Isento'}</span>
                                        </div>
                                    </div>

                                    <Button className="w-full h-16 rounded-2xl font-black text-lg uppercase tracking-tight shadow-xl shadow-primary/30" asChild>
                                        <Link href={`https://wa.me/${agency.whatsapp_number?.replace(/\D/g, '')}?text=Olá! Tenho interesse no imóvel: ${property.title} (${id})`} target="_blank">
                                            <Phone className="mr-3 h-6 w-6" /> Agendar Visita
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Lead Capture Form */}
                            <LeadCaptureForm 
                                agencyId={agency.id} 
                                propertyId={id}
                                title="Fale com a gente"
                                subtitle="Tem interesse neste imóvel? Deixe seus dados e retornaremos em breve."
                            />

                            <div className="flex items-center gap-4 px-6 py-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <Info className="h-5 w-5 text-zinc-400" />
                                <p className="text-[10px] font-bold text-zinc-500 uppercase leading-relaxed tracking-wider">
                                    Ao enviar, você concorda com nossos termos de uso e política de privacidade.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
