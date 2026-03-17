import { Home, Plus, MapPin, BedDouble, Bath, Car, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Database } from '@/utils/supabase/database.types'

type PropertyRow = Database['public']['Tables']['properties']['Row'] & {
    users_profile: {
        full_name: string
    } | null
}

function PropertyCard({ property }: { property: PropertyRow }) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    }

    const placeholderImage = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
    const image = property.photos && property.photos.length > 0 ? property.photos[0] : placeholderImage

    return (
        <div className="group relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
            <div className="aspect-[4/3] w-full overflow-hidden relative">
                <img
                    src={image}
                    alt={property.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                    <span className="inline-flex items-center rounded-md bg-zinc-950/70 backdrop-blur-sm px-2 py-1 text-xs font-medium text-white ring-1 ring-inset ring-zinc-500/20">
                        {property.listing_type === 'sale' ? 'Venda' : 'Aluguel'}
                    </span>
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${property.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400'
                            : 'bg-zinc-50 text-zinc-600 ring-zinc-500/10 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800'
                        }`}>
                        {property.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                </div>
            </div>
            <div className="p-5">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50 line-clamp-1">{property.title}</h3>
                </div>

                <div className="flex items-center justify-between mb-3">
                    <p className="text-xl font-bold text-primary">{formatCurrency(property.price)}</p>
                    {property.users_profile && (
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                            <span className="font-semibold opacity-60 uppercase">Broker:</span>
                            <span className="truncate max-w-[60px]">{property.users_profile.full_name.split(' ')[0]}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400 mb-4 whitespace-nowrap overflow-hidden text-ellipsis">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{property.address_street ? `${property.address_street}, ${property.address_neighborhood || property.address_city}` : 'Endereço não informado'}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-t border-zinc-100 dark:border-zinc-800/50">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                        <BedDouble className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm font-medium">{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                        <Bath className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm font-medium">{property.bathrooms}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                        <Car className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm font-medium">{property.parking_spots}</span>
                    </div>
                </div>

                <Link href={`/inventory/${property.id}`} className="absolute inset-0 z-10">
                    <span className="sr-only">Ver detalhes de {property.title}</span>
                </Link>
            </div>
        </div>
    )
}

export default async function InventoryPage() {
    const supabase = await createClient()

    const { data: properties, error } = await supabase
        .from('properties')
        .select(`
            *,
            users_profile (
                full_name
            )
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching properties:', error)
    }

    const hasProperties = properties && properties.length > 0;

    return (
        <div className="flex flex-col h-full min-h-[calc(100vh-6rem)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">Inventário de Imóveis</h1>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Gerencie todas as captações e anúncios da sua carteira.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/inventory/new"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-zinc-300 bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:bg-primary/90 h-10 px-5 py-2"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Captação
                    </Link>
                </div>
            </div>

            {hasProperties ? (
                <div className="py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {properties.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center mt-12 mb-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center bg-zinc-50/50 dark:bg-zinc-900/10">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 ring-8 ring-primary/5">
                        <Home className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">Nenhum imóvel cadastrado</h3>
                    <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
                        Comece agora mesmo a gerenciar sua carteira. Suas propriedades aparecerão aqui em um grid visual assim que você adicionar a primeira.
                    </p>
                    <div className="mt-8">
                        <Link
                            href="/inventory/new"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-zinc-300 bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 h-10 px-6 py-2"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Imóvel
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
