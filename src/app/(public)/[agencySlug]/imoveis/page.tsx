import { createClient } from '@/utils/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin, Building, Bed, Bath, Car, ArrowRight, Filter, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface PageProps {
    params: {
        agencySlug: string
    }
    searchParams: {
        type?: string
        category?: string
        city?: string
        q?: string
        minPrice?: string
        maxPrice?: string
        amenities?: string // Comma separated list
    }
}

export default async function PublicListingPage({ params, searchParams }: PageProps) {
    const supabase = await createClient()
    const resolvedParams = await params
    const slug = resolvedParams.agencySlug
    const sParams = await searchParams

    // Fetch agency
    const { data: agency } = await supabase
        .from('agencies')
        .select('id, name, slug, portal_style')
        .eq('slug', slug)
        .single()

    if (!agency) return null
    const theme = agency.portal_style || 'modern'

    // Build Query
    let query = supabase
        .from('properties')
        .select('*')
        .eq('agency_id', agency.id)
        .eq('status', 'active')

    // ... (rest of query remains the same)
    if (sParams.type) query = query.eq('listing_type', sParams.type)
    if (sParams.category) query = query.eq('property_type', sParams.category)
    if (sParams.q) {
        query = query.or(`title.ilike.%${sParams.q}%,address_city.ilike.%${sParams.q}%,address_neighborhood.ilike.%${sParams.q}%`)
    } else if (sParams.city) {
        query = query.ilike('address_city', `%${sParams.city}%`)
    }
    
    if (sParams.minPrice) query = query.gte('price', parseInt(sParams.minPrice))
    if (sParams.maxPrice) query = query.lte('price', parseInt(sParams.maxPrice))

    if (sParams.amenities) {
        const selectedAmenities = sParams.amenities.split(',')
        query = query.contains('amenities', selectedAmenities)
    }

    const { data: properties } = await query
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })

    return (
        <div className={cn(
            "min-h-screen",
            theme === 'minimalist' ? "bg-white" : "bg-zinc-50"
        )}>
            {/* Filter Header */}
            <div className={cn(
                "sticky top-20 z-40 py-4",
                theme === 'minimalist' ? "bg-white border-b-0" : "bg-white border-b shadow-sm"
            )}>
                <div className="container mx-auto px-4">
                    <form method="GET" className={cn(
                        "flex flex-wrap items-center gap-4",
                        theme === 'minimalist' ? "justify-center" : ""
                    )}>
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <Input 
                                placeholder="O que você busca?" 
                                defaultValue={sParams.q || sParams.city}
                                name="q"
                                className={cn(
                                    "pl-10 h-12 rounded-xl font-bold transition-all",
                                    theme === 'minimalist' 
                                        ? "bg-transparent border-t-0 border-x-0 border-b-2 border-zinc-100 focus:border-black rounded-none shadow-none" 
                                        : "bg-zinc-50 border-zinc-200"
                                )} 
                            />
                        </div>
                        <select 
                            name="type" 
                            defaultValue={sParams.type || ''}
                            className={cn(
                                "h-12 px-4 rounded-xl font-bold text-sm outline-none transition-all",
                                theme === 'minimalist'
                                    ? "bg-transparent border-t-0 border-x-0 border-b-2 border-zinc-100 focus:border-black rounded-none"
                                    : "bg-zinc-50 border border-zinc-200"
                            )}
                        >
                            <option value="">Finalidade</option>
                            <option value="sale">Venda</option>
                            <option value="rent">Aluguel</option>
                        </select>
                        <select 
                            name="category" 
                            defaultValue={sParams.category || ''}
                            className={cn(
                                "h-12 px-4 rounded-xl font-bold text-sm outline-none transition-all",
                                theme === 'minimalist'
                                    ? "bg-transparent border-t-0 border-x-0 border-b-2 border-zinc-100 focus:border-black rounded-none"
                                    : "bg-zinc-50 border border-zinc-200"
                            )}
                        >
                            <option value="">Tipo</option>
                            {['Apartamento', 'Casa', 'Sobrado', 'Terreno', 'Comercial'].map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <select 
                            name="amenities" 
                            defaultValue={sParams.amenities || ''}
                            className={cn(
                                "h-12 px-4 rounded-xl font-bold text-sm outline-none transition-all",
                                theme === 'minimalist'
                                    ? "bg-transparent border-t-0 border-x-0 border-b-2 border-zinc-100 focus:border-black rounded-none"
                                    : "bg-zinc-50 border border-zinc-200"
                            )}
                        >
                            <option value="">Comodidades</option>
                            {['Piscina', 'Academia', 'Churrasqueira', 'Sauna', 'Portaria 24h'].map(a => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </select>
                        <Button type="submit" className={cn(
                            "h-12 px-8 rounded-xl font-black uppercase tracking-widest text-xs",
                            theme === 'minimalist' ? "bg-black text-white hover:bg-zinc-800" : ""
                        )}>
                            Filtrar
                        </Button>
                    </form>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className={cn(
                    "mb-12",
                    theme === 'minimalist' ? "text-center" : ""
                )}>
                    <h1 className={cn(
                        "text-3xl font-black tracking-tight uppercase",
                        theme === 'minimalist' ? "font-serif normal-case" : "text-zinc-900"
                    )}>
                        {properties?.length || 0} Imóveis Disponíveis
                    </h1>
                    {theme === 'minimalist' && (
                        <div className="h-px w-24 bg-black mx-auto mt-4" />
                    )}
                </div>

                <div className={cn(
                    "grid gap-8",
                    theme === 'grid' ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                )}>
                    {properties?.map((property) => {
                        const isFeatured = property.is_featured
                        
                        // Theme Specific Card Rendering
                        if (theme === 'grid') {
                            return (
                                <Link 
                                    key={property.id} 
                                    href={`/${slug}/imovel/${property.id}`}
                                    className="group relative aspect-square overflow-hidden rounded-2xl bg-zinc-100"
                                >
                                    <img 
                                        src={property.photos?.[0] || 'https://images.unsplash.com/photo-1564013795939-663efc0f23a9?auto=format&fit=crop&q=80&w=800'} 
                                        alt={property.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">{property.address_neighborhood}</p>
                                        <h3 className="font-black text-lg leading-tight line-clamp-1">{property.title}</h3>
                                        <p className="mt-2 text-primary font-black">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(property.price)}
                                        </p>
                                    </div>
                                    {isFeatured && (
                                        <div className="absolute top-4 right-4">
                                            <div className="bg-primary p-2 rounded-full">
                                                <Sparkles className="h-4 w-4 text-white fill-white" />
                                            </div>
                                        </div>
                                    )}
                                </Link>
                            )
                        }

                        if (theme === 'minimalist') {
                            return (
                                <Link 
                                    key={property.id} 
                                    href={`/${slug}/imovel/${property.id}`}
                                    className="group flex flex-col space-y-4"
                                >
                                    <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100">
                                        <img 
                                            src={property.photos?.[0]} 
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                        />
                                        <div className="absolute inset-0 border-[20px] border-white opacity-0 group-hover:opacity-20 transition-opacity" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">{property.property_type} em {property.address_neighborhood}</p>
                                        <h3 className="font-serif text-2xl text-zinc-900 group-hover:italic transition-all">{property.title}</h3>
                                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                                            <span className="font-serif text-lg">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(property.price)}
                                            </span>
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">{property.useful_area}m²</span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        }

                        // Default Modern Theme Card
                        return (
                            <Link 
                                key={property.id} 
                                href={`/${slug}/imovel/${property.id}`}
                                className={cn(
                                    "group flex flex-col bg-white overflow-hidden transition-all hover:shadow-2xl active:scale-[0.99]",
                                    isFeatured 
                                        ? "rounded-[3rem] border-2 border-primary/20 lg:col-span-2 lg:flex-row" 
                                        : "rounded-[2rem] border border-zinc-200 hover:border-primary/30"
                                )}
                            >
                                <div className={cn(
                                    "relative overflow-hidden",
                                    isFeatured ? "w-full lg:w-3/5 aspect-video" : "aspect-[4/3]"
                                )}>
                                    <img 
                                        src={property.photos?.[0] || 'https://images.unsplash.com/photo-1564013795939-663efc0f23a9?auto=format&fit=crop&q=80&w=800'} 
                                        alt={property.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <Badge className="bg-white/90 backdrop-blur-md text-zinc-900 border-none font-black text-[10px] uppercase px-3 py-1">
                                            {property.listing_type === 'sale' ? 'Venda' : 'Aluguel'}
                                        </Badge>
                                        {isFeatured && (
                                            <Badge className="bg-primary text-white border-none font-black text-[10px] uppercase px-3 py-1 flex items-center gap-1">
                                                <Sparkles className="h-3 w-3 fill-white" /> Destaque
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="absolute bottom-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        <div className="bg-white/95 p-3 rounded-2xl shadow-xl">
                                            <ArrowRight className="h-5 w-5 text-primary" />
                                        </div>
                                    </div>
                                </div>
                                <div className={cn(
                                    "p-8 flex flex-col justify-between h-full",
                                    isFeatured ? "lg:w-2/5" : ""
                                )}>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-zinc-400 font-bold text-[10px] uppercase tracking-widest mb-1">
                                                <MapPin className="h-3 w-3 mr-1 text-primary" />
                                                {property.address_neighborhood}, {property.address_city}
                                            </div>
                                            <h3 className={cn(
                                                "font-black text-zinc-900 group-hover:text-primary transition-colors leading-tight",
                                                isFeatured ? "text-2xl" : "text-lg"
                                            )}>
                                                {property.title}
                                            </h3>
                                        </div>
                                        
                                        {isFeatured && property.description && (
                                            <p className="text-zinc-500 text-sm line-clamp-3 leading-relaxed">
                                                {property.description}
                                            </p>
                                        )}
                                        
                                        <div className="grid grid-cols-3 gap-2 py-4 border-y border-zinc-100">
                                            <div className="flex flex-col items-center gap-1">
                                                <Bed className="h-4 w-4 text-zinc-300" />
                                                <span className="text-[10px] font-black text-zinc-500">{property.bedrooms} Quartos</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <Bath className="h-4 w-4 text-zinc-300" />
                                                <span className="text-[10px] font-black text-zinc-500">{property.bathrooms} Banhos</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <Car className="h-4 w-4 text-zinc-300" />
                                                <span className="text-[10px] font-black text-zinc-500">{property.parking_spots} Vagas</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6">
                                        <p className={cn(
                                            "font-black text-primary tracking-tighter",
                                            isFeatured ? "text-3xl" : "text-xl"
                                        )}>
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(property.price)}
                                        </p>
                                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                            {property.useful_area}m² Úteis
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>

                {properties?.length === 0 && (
                    <div className="py-24 text-center space-y-4">
                        <Building className="h-16 w-16 text-zinc-200 mx-auto" />
                        <h2 className="text-2xl font-black text-zinc-900 uppercase">Nenhum imóvel encontrado</h2>
                        <p className="text-zinc-500 font-medium">Tente ajustar seus filtros ou buscar em outra região.</p>
                        <Button variant="outline" className="rounded-full font-bold" asChild>
                            <Link href={`/${slug}/imoveis`}>Limpar Filtros</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
