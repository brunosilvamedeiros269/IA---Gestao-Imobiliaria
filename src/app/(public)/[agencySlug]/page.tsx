import { createClient } from '@/utils/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin, ArrowRight, Home, Building, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { LeadCaptureForm } from '@/components/public/LeadCaptureForm'

interface PageProps {
    params: {
        agencySlug: string
    }
}

export default async function AgencyPortalHomePage({ params }: PageProps) {
    const supabase = await createClient()
    const resolvedParams = await params
    const slug = resolvedParams.agencySlug

    // Fetch agency and some highlight properties
    const { data: agency } = await supabase
        .from('agencies')
        .select('*')
        .eq('slug', slug)
        .single()

    const { data: properties } = await supabase
        .from('properties')
        .select('*')
        .eq('agency_id', agency?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6)

    return (
        <div className="flex flex-col w-full">
            {/* Hero Section */}
            <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden bg-zinc-900">
                {/* Background Image/Overlay */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000" 
                        alt="Hero Background" 
                        className="w-full h-full object-cover opacity-60 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center space-y-8">
                    <div className="space-y-4 max-w-4xl mx-auto">
                        <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                            Sua imobiliária de confiança
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.9] uppercase">
                            {agency?.tagline || 'Encontre o lugar onde sua vida acontece.'}
                        </h1>
                        <p className="text-xl md:text-2xl font-medium text-zinc-300 tracking-tight max-w-2xl mx-auto">
                            O maior inventário de imóveis exclusivos em {agency?.address?.split(',').pop()?.trim() || 'sua região'}.
                        </p>
                    </div>

                    {/* Main Search Bar */}
                    <form action={`/${slug}/imoveis`} className="max-w-3xl mx-auto bg-white p-2 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center gap-2 border border-zinc-200/50 backdrop-blur-xl">
                        <div className="flex-1 w-full relative">
                            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                            <Input 
                                name="q"
                                className="h-14 pl-14 border-none bg-transparent shadow-none text-lg font-bold placeholder:text-zinc-400 focus-visible:ring-0" 
                                placeholder="Cidade, bairro ou condomínio..." 
                            />
                        </div>
                        <div className="h-10 w-[1px] bg-zinc-200 hidden md:block" />
                        <div className="flex-1 w-full px-4 hidden md:flex items-center gap-2">
                             <Home className="h-5 w-5 text-zinc-400" />
                             <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Tipo de Imóvel</span>
                        </div>
                        <Button type="submit" className="h-14 px-8 rounded-full font-black uppercase tracking-tighter w-full md:w-auto text-lg shadow-xl shadow-primary/20">
                            <Search className="mr-2 h-5 w-5" /> Buscar
                        </Button>
                    </form>
                </div>
            </section>

            {/* Featured Properties */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 space-y-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-primary">
                                <Sparkles className="h-5 w-5 fill-primary" />
                                <span className="text-sm font-black uppercase tracking-[0.2em]">Oportunidades</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 uppercase">Últimas Captações</h2>
                        </div>
                        <Button variant="outline" className="rounded-full font-bold border-zinc-200 hover:bg-zinc-50" asChild>
                            <Link href={`/${slug}/imoveis`}>
                                Ver Todos <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {properties?.map((property) => (
                            <Link 
                                key={property.id} 
                                href={`/${slug}/imovel/${property.id}`}
                                className="group flex flex-col bg-zinc-50 rounded-[2.5rem] overflow-hidden border border-zinc-100 hover:border-primary/30 transition-all hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98]"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img 
                                        src={property.photos?.[0] || 'https://images.unsplash.com/photo-1564013795939-663efc0f23a9?auto=format&fit=crop&q=80&w=800'} 
                                        alt={property.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <Badge className="bg-white/90 backdrop-blur-md text-zinc-900 border-none font-black text-[10px] uppercase px-3 py-1">
                                            {property.listing_type === 'sale' ? 'Venda' : 'Aluguel'}
                                        </Badge>
                                        {property.is_exclusive && (
                                            <Badge className="bg-primary text-white border-none font-black text-[10px] uppercase px-3 py-1">Exclusivo</Badge>
                                        )}
                                    </div>
                                    <div className="absolute bottom-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        <div className="bg-white/95 p-3 rounded-2xl shadow-xl">
                                            <ArrowRight className="h-5 w-5 text-primary" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 space-y-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center text-zinc-400 font-bold text-xs uppercase tracking-widest">
                                            <MapPin className="h-3 w-3 mr-1 text-primary" />
                                            {property.address_neighborhood}, {property.address_city}
                                        </div>
                                        <h3 className="text-xl font-black text-zinc-900 group-hover:text-primary transition-colors leading-tight">
                                            {property.title}
                                        </h3>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-zinc-200/50">
                                        <p className="text-2xl font-black text-primary tracking-tighter">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(property.price)}
                                        </p>
                                        <div className="flex gap-4 text-xs font-black text-zinc-400">
                                            <span className="flex items-center gap-1"><Building className="h-4 w-4" /> {property.useful_area}m²</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Lead Capture Section */}
            <section className="py-24 bg-zinc-50 border-t border-zinc-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
                        <div className="flex-1 space-y-8 text-center lg:text-left">
                            <div className="space-y-4">
                                <Badge className="bg-primary/10 text-primary border-none px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                                    Dúvidas ou Propostas?
                                </Badge>
                                <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-zinc-900 uppercase leading-[0.9]">
                                    Fale com nossos <span className="text-primary">especialistas</span> hoje mesmo.
                                </h2>
                                <p className="text-xl text-zinc-500 font-medium tracking-tight">
                                    Encontre o imóvel ideal com atendimento personalizado e Inteligência Artificial para acelerar sua busca.
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-8 py-4">
                                <div className="space-y-2">
                                    <h4 className="text-3xl font-black text-zinc-900 tracking-tighter">100%</h4>
                                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Transparência</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-3xl font-black text-zinc-900 tracking-tighter">24h</h4>
                                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Resposta média</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-1 w-full max-w-xl">
                            <LeadCaptureForm agencyId={agency?.id} />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
