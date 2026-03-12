import { createClient } from '@/utils/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin, Building, Bed, Bath, Car, ArrowRight, Filter } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
    params: {
        agencySlug: string
    }
    searchParams: {
        type?: string
        category?: string
        city?: string
        minPrice?: string
        maxPrice?: string
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
        .select('id, name, slug')
        .eq('slug', slug)
        .single()

    if (!agency) return null

    // Build Query
    let query = supabase
        .from('properties')
        .select('*')
        .eq('agency_id', agency.id)
        .eq('status', 'active')

    if (sParams.type) query = query.eq('listing_type', sParams.type)
    if (sParams.category) query = query.eq('property_type', sParams.category)
    if (sParams.city) query = query.ilike('address_city', `%${sParams.city}%`)
    
    if (sParams.minPrice) query = query.gte('price', parseInt(sParams.minPrice))
    if (sParams.maxPrice) query = query.lte('price', parseInt(sParams.maxPrice))

    const { data: properties } = await query.order('created_at', { ascending: false })

    return (
        <div className="bg-zinc-50 min-h-screen">
            {/* Filter Header */}
            <div className="bg-white border-b sticky top-20 z-40 py-4 shadow-sm">
                <div className="container mx-auto px-4">
                    <form className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <Input 
                                placeholder="Cidade ou bairro..." 
                                defaultValue={sParams.city}
                                name="city"
                                className="pl-10 h-11 bg-zinc-50 border-zinc-200 rounded-xl font-bold" 
                            />
                        </div>
                        <select 
                            name="type" 
                            defaultValue={sParams.type || ''}
                            className="h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-primary outline-none"
                        >
                            <option value="">Finalidade</option>
                            <option value="sale">Venda</option>
                            <option value="rent">Aluguel</option>
                        </select>
                        <select 
                            name="category" 
                            defaultValue={sParams.category || ''}
                            className="h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-primary outline-none"
                        >
                            <option value="">Tipo de Imóvel</option>
                            <option value="Apartamento">Apartamento</option>
                            <option value="Casa">Casa</option>
                            <option value="Sobrado">Sobrado</option>
                            <option value="Terreno">Terreno</option>
                        </select>
                        <Button className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-xs">
                            <Filter className="mr-2 h-4 w-4" /> Filtrar
                        </Button>
                    </form>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">
                        {properties?.length || 0} Imóveis encontrados
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {properties?.map((property) => (
                        <Link 
                            key={property.id} 
                            href={`/${slug}/imovel/${property.id}`}
                            className="group flex flex-col bg-white rounded-[2rem] overflow-hidden border border-zinc-200 hover:border-primary/30 transition-all hover:shadow-xl"
                        >
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img 
                                    src={property.photos?.[0] || 'https://images.unsplash.com/photo-1564013795939-663efc0f23a9?auto=format&fit=crop&q=80&w=800'} 
                                    alt={property.title} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <Badge className="bg-white/90 backdrop-blur-md text-zinc-900 border-none font-black text-[10px] uppercase px-3 py-1">
                                        {property.listing_type === 'sale' ? 'Venda' : 'Aluguel'}
                                    </Badge>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-zinc-900 group-hover:text-primary transition-colors leading-tight">
                                        {property.title}
                                    </h3>
                                    <div className="flex items-center text-zinc-400 font-bold text-[10px] uppercase tracking-widest">
                                        <MapPin className="h-3 w-3 mr-1 text-primary" />
                                        {property.address_neighborhood}, {property.address_city}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 py-3 border-y border-zinc-100">
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

                                <div className="flex items-center justify-between pt-2">
                                    <p className="text-xl font-black text-primary tracking-tighter">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(property.price)}
                                    </p>
                                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                        {property.useful_area}m² Úteis
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
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
