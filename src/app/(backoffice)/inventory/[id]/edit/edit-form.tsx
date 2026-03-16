'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
    ArrowLeft, Loader2, MapPin, Bed, Bath, Car, Maximize, 
    Waves, Dumbbell, Home, Sparkles, ShieldCheck, Star, 
    Check, Info, User, Phone, Lock, Eye, EyeOff, SparklesIcon,
    Sofa, PawPrint, Banknote, Percent
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { updateProperty } from './actions'
import { generatePropertyDescription } from '../../new/ai-actions'
import { toast } from 'sonner'
import { PropertyGallery } from '@/components/property-gallery'
import { cn } from '@/lib/utils'
import { Database } from '@/utils/supabase/database.types'

type PropertyRow = Database['public']['Tables']['properties']['Row']

const AMENITIES_OPTIONS = [
    { id: 'pool', label: 'Piscina', icon: Waves },
    { id: 'gym', label: 'Academia', icon: Dumbbell },
    { id: 'party_room', label: 'Salão de Festas', icon: Home },
    { id: 'barbecue', label: 'Churrasqueira', icon: Sparkles },
    { id: 'security', label: 'Portaria 24h', icon: ShieldCheck },
    { id: 'playground', label: 'Playground', icon: Star },
]

export function EditPropertyForm({ property }: { property: PropertyRow }) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [cepLoading, setCepLoading] = useState(false)
    const [isGeneratingIA, setIsGeneratingIA] = useState(false)

    // Form States (Initialized with property data)
    const [title, setTitle] = useState(property.title || '')
    const [description, setDescription] = useState(property.description || '')
    const [listingType, setListingType] = useState(property.listing_type || 'sale')
    const [propertyType, setPropertyType] = useState(property.property_type || 'apartment')

    const formatCurrency = (val: string | number | null) => {
        if (val === null) return ''
        let clean = val.toString().replace(/\D/g, "")
        if (typeof val === 'number') {
            clean = Math.round(val * 100).toString()
        }
        if (!clean) return ""
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseInt(clean) / 100)
    }

    const formatCEP = (val: string) => {
        const clean = val.replace(/\D/g, "")
        if (clean.length > 5) return clean.replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9)
        return clean
    }

    const [cep, setCep] = useState(formatCEP(property.address_zipcode || ''))
    const [street, setStreet] = useState(property.address_street || '')
    const [number, setNumber] = useState(property.address_number || '')
    const [neighborhood, setNeighborhood] = useState(property.address_neighborhood || '')
    const [city, setCity] = useState(property.address_city || '')
    const [state, setState] = useState(property.address_state || 'SP')

    const [price, setPrice] = useState(formatCurrency(property.price))
    const [condominio, setCondominio] = useState(formatCurrency(property.condominio_fee))
    const [iptu, setIptu] = useState(formatCurrency(property.iptu))

    const [bedrooms, setBedrooms] = useState(property.bedrooms || 0)
    const [suitesCount, setSuitesCount] = useState(property.suites_count || 0)
    const [bathrooms, setBathrooms] = useState(property.bathrooms || 0)
    const [parkingSpots, setParkingSpots] = useState(property.parking_spots || 0)
    const [usefulArea, setUsefulArea] = useState(property.useful_area || 0)
    const [floorNumber, setFloorNumber] = useState(property.floor_number || 0)

    const [isExclusive, setIsExclusive] = useState(property.is_exclusive || false)
    const [ownerName, setOwnerName] = useState(property.owner_name || '')
    const [ownerPhone, setOwnerPhone] = useState(property.owner_phone || '')
    const [isFurnished, setIsFurnished] = useState(property.is_furnished || false)
    const [petsAllowed, setPetsAllowed] = useState(property.pets_allowed || false)
    const [acceptsFinancing, setAcceptsFinancing] = useState(property.accepts_financing ?? true)
    const [showFullAddress, setShowFullAddress] = useState(property.show_full_address ?? true)
    const [amenities, setAmenities] = useState<string[]>(property.amenities as string[] || [])
    const [commissionPercentage, setCommissionPercentage] = useState(property.commission_percentage || 6)

    const [photos, setPhotos] = useState<string[]>(property.photos as string[] || [])

    const handleIAButtonClick = async () => {
        if (!title || !propertyType || !price) {
            toast.error("Preencha título, tipo e valor para gerar uma descrição melhor.")
            return
        }

        setIsGeneratingIA(true)
        try {
            const result = await generatePropertyDescription({
                title,
                type: propertyType,
                listingType,
                price: Number(price.replace(/\D/g, '')),
                bedrooms,
                suites: suitesCount,
                bathrooms,
                area: usefulArea,
                isFurnished,
                petsAllowed,
                amenities: amenities.map(a => AMENITIES_OPTIONS.find(opt => opt.id === a)?.label || a),
                neighborhood,
                city
            })

            if (result.error) {
                toast.error(result.error)
            } else if (result.description) {
                setDescription(result.description)
                toast.success("Descrição profissional gerada com IA!")
            }
        } catch (error) {
            toast.error("Falha ao conectar com o Assistente de IA.")
        } finally {
            setIsGeneratingIA(false)
        }
    }

    const toggleAmenity = (id: string) => {
        setAmenities(prev => 
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        )
    }

    // Google Maps Iframe Generator
    const generateMapUrl = () => {
        if (!street || !city || !state) return null;
        const query = encodeURIComponent(`${street}, ${number ? number + ',' : ''} ${neighborhood}, ${city} - ${state}, ${cep}`);
        return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }

    // BrasilAPI Integration
    useEffect(() => {
        const cleanCep = cep.replace(/\D/g, '')
        if (cleanCep.length === 8 && cleanCep !== (property.address_zipcode?.replace(/\D/g, '') || '')) {
            setCepLoading(true)
            fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`)
                .then(res => res.json())
                .then(data => {
                    if (!data.errors && !data.message) {
                        setStreet(data.street || '')
                        setNeighborhood(data.neighborhood || '')
                        setCity(data.city || '')
                        setState(data.state || 'SP')
                        toast.success('Endereço preenchido automaticamente!')
                    } else {
                        toast.error('CEP não encontrado. Preencha manualmente.')
                    }
                })
                .catch(() => toast.error('Erro ao buscar o CEP.'))
                .finally(() => setCepLoading(false))
        }
    }, [cep, property.address_zipcode])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData()
        formData.append('title', title)
        formData.append('description', description)
        formData.append('listing_type', listingType)
        formData.append('property_type', propertyType)
        formData.append('status', e.currentTarget.status.value)
        formData.append('price', price)
        formData.append('condominio_fee', condominio)
        formData.append('iptu', iptu)
        formData.append('bedrooms', bedrooms.toString())
        formData.append('suites_count', suitesCount.toString())
        formData.append('bathrooms', bathrooms.toString())
        formData.append('parking_spots', parkingSpots.toString())
        formData.append('useful_area', usefulArea.toString())
        formData.append('floor_number', floorNumber.toString())
        formData.append('is_exclusive', isExclusive.toString())
        formData.append('owner_name', ownerName)
        formData.append('owner_phone', ownerPhone)
        formData.append('is_furnished', isFurnished.toString())
        formData.append('pets_allowed', petsAllowed.toString())
        formData.append('accepts_financing', acceptsFinancing.toString())
        formData.append('show_full_address', showFullAddress.toString())
        formData.append('amenities', JSON.stringify(amenities))
        formData.append('commission_percentage', commissionPercentage.toString())
        formData.append('address_zipcode', cep)
        formData.append('address_street', street)
        formData.append('address_number', number)
        formData.append('address_neighborhood', neighborhood)
        formData.append('address_city', city)
        formData.append('address_state', state)
        formData.append('photos', JSON.stringify(photos))

        try {
            const res = await updateProperty(property.id, formData)
            if (res && res.error) {
                toast.error(res.error)
                setIsSubmitting(false)
            } else {
                toast.success('Imóvel atualizado com sucesso!')
                router.push(`/inventory/${property.id}`)
                router.refresh()
            }
        } catch (error) {
            toast.error('Erro fatal ao atualizar imóvel. Tente novamente.')
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna Principal */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Status e Básicos */}
                    <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-zinc-900">
                        <CardHeader className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <Info className="w-5 h-5 text-primary" /> Informações do Anúncio
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status no CRM</Label>
                                    <Select name="status" defaultValue={property.status || 'active'}>
                                        <SelectTrigger id="status" className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Ativo (Disponível)</SelectItem>
                                            <SelectItem value="sold">Vendido</SelectItem>
                                            <SelectItem value="rented">Alugado</SelectItem>
                                            <SelectItem value="inactive">Inativo / Pausado</SelectItem>
                                            <SelectItem value="suspended">Suspenso</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="listing_type">Finalidade</Label>
                                    <Select name="listing_type" value={listingType} onValueChange={(v) => setListingType(v as 'sale' | 'rent')}>
                                        <SelectTrigger id="listing_type" className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sale">Venda</SelectItem>
                                            <SelectItem value="rent">Locação</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="property_type">Tipo de Imóvel</Label>
                                    <Select name="property_type" value={propertyType} onValueChange={(v) => setPropertyType(v as any)}>
                                        <SelectTrigger id="property_type" className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="apartment">Apartamento</SelectItem>
                                            <SelectItem value="house">Casa de Rua</SelectItem>
                                            <SelectItem value="condo">Casa em Condomínio</SelectItem>
                                            <SelectItem value="commercial">Comercial</SelectItem>
                                            <SelectItem value="land">Terreno / Lote</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="title">Título do Anúncio *</Label>
                                    <Input 
                                        id="title" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 font-bold"
                                        placeholder="Ex: Apartamento Garden com 3 Suítes..." 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="description" className="font-bold">Descrição Comercial</Label>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={handleIAButtonClick}
                                        disabled={isGeneratingIA}
                                        className="h-8 text-[10px] font-black uppercase tracking-widest border-primary/30 text-primary hover:bg-primary/5 gap-2 rounded-full"
                                    >
                                        {isGeneratingIA ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <SparklesIcon className="w-3.5 h-3.5" />}
                                        {isGeneratingIA ? "Gerando..." : "Assistente IA"}
                                    </Button>
                                </div>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Utilize o assistente de IA para gerar uma descrição vendedora baseada nos dados do imóvel..."
                                    className="min-h-[200px] rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 py-4 resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Características e Tipologia */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <Maximize className="w-5 h-5 text-primary" /> Características Técnicas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><Bed className="w-3.5 h-3.5 text-zinc-400" /> Quartos</Label>
                                    <Input type="number" value={bedrooms} onChange={(e) => setBedrooms(parseInt(e.target.value))} className="h-11 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><Star className="w-3.5 h-3.5 text-zinc-400" /> Suítes</Label>
                                    <Input type="number" value={suitesCount} onChange={(e) => setSuitesCount(parseInt(e.target.value))} className="h-11 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><Bath className="w-3.5 h-3.5 text-zinc-400" /> Banheiros</Label>
                                    <Input type="number" value={bathrooms} onChange={(e) => setBathrooms(parseInt(e.target.value))} className="h-11 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><Car className="w-3.5 h-3.5 text-zinc-400" /> Vagas</Label>
                                    <Input type="number" value={parkingSpots} onChange={(e) => setParkingSpots(parseInt(e.target.value))} className="h-11 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><Maximize className="w-3.5 h-3.5 text-zinc-400" /> Área Útil (m²)</Label>
                                    <Input type="number" value={usefulArea} onChange={(e) => setUsefulArea(parseFloat(e.target.value))} className="h-11 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><Home className="w-3.5 h-3.5 text-zinc-400" /> Andar</Label>
                                    <Input type="number" value={floorNumber} onChange={(e) => setFloorNumber(parseInt(e.target.value))} className="h-11 rounded-xl" placeholder="Ex: 12" />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center space-x-3">
                                    <Switch id="is_furnished" checked={isFurnished} onCheckedChange={setIsFurnished} />
                                    <Label htmlFor="is_furnished" className="font-bold flex gap-2 items-center"><Sofa className="w-4 h-4 text-zinc-400" /> Mobiliado</Label>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Switch id="pets_allowed" checked={petsAllowed} onCheckedChange={setPetsAllowed} />
                                    <Label htmlFor="pets_allowed" className="font-bold flex gap-2 items-center"><PawPrint className="w-4 h-4 text-zinc-400" /> Aceita Pets</Label>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Switch id="accepts_financing" checked={acceptsFinancing} onCheckedChange={setAcceptsFinancing} />
                                    <Label htmlFor="accepts_financing" className="font-bold flex gap-2 items-center"><Banknote className="w-4 h-4 text-zinc-400" /> Financiamento</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lazer e Condomínio */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-500" /> Lazer & Infraestrutura
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {AMENITIES_OPTIONS.map((opt) => {
                                    const Icon = opt.icon
                                    const isSelected = amenities.includes(opt.id)
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => toggleAmenity(opt.id)}
                                            className={cn(
                                                "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left group",
                                                isSelected 
                                                    ? "border-primary bg-primary/5 text-primary" 
                                                    : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 text-zinc-500"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-2 rounded-lg transition-colors",
                                                isSelected ? "bg-primary text-white" : "bg-zinc-50 dark:bg-zinc-800 text-zinc-400 group-hover:text-primary"
                                            )}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold">{opt.label}</span>
                                            {isSelected && <Check className="w-4 h-4 ml-auto" />}
                                        </button>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Galeria de Fotos */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-500" /> Galeria Vision
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <PropertyGallery value={photos} onChange={setPhotos} />
                        </CardContent>
                    </Card>
                </div>

                {/* Coluna Lateral (Gestão e Preço) */}
                <div className="space-y-8">
                    {/* Radar de Gestão (V2.0 Intelligence) */}
                    <Card className="border-none shadow-lg bg-zinc-900 text-white overflow-hidden">
                        <div className="bg-primary px-6 py-3 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> Radar de Gestão</span>
                            <Badge className="bg-black/20 text-[9px] border-none">CONFIDENCIAL</Badge>
                        </div>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="space-y-0.5">
                                    <Label className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Exclusividade</Label>
                                    <p className="text-xs text-zinc-500">Imóvel com contrato de exclusividade.</p>
                                </div>
                                <Switch checked={isExclusive} onCheckedChange={setIsExclusive} className="data-[state=checked]:bg-primary" />
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Nome do Proprietário</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                                        <Input 
                                            value={ownerName}
                                            onChange={(e) => setOwnerName(e.target.value)}
                                            className="h-11 pl-10 rounded-xl bg-white/5 border-white/10 focus:ring-primary" 
                                            placeholder="Ex: Roberto Silva" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Telefone de Contato</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                                        <Input 
                                            value={ownerPhone}
                                            onChange={(e) => setOwnerPhone(e.target.value)}
                                            className="h-11 pl-10 rounded-xl bg-white/5 border-white/10 focus:ring-primary" 
                                            placeholder="(11) 99999-9999" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Comissão do Corretor (%)</Label>
                                    <div className="relative">
                                        <Percent className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                                        <Input 
                                            type="number"
                                            value={commissionPercentage}
                                            onChange={(e) => setCommissionPercentage(parseFloat(e.target.value))}
                                            className="h-11 pl-10 rounded-xl bg-white/5 border-white/10 focus:ring-primary text-xl font-black text-primary" 
                                            placeholder="6" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preços e Taxas */}
                    <Card className="border-none shadow-md overflow-hidden">
                        <CardHeader className="bg-zinc-50 dark:bg-zinc-900 border-b">
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <Banknote className="w-5 h-5 text-green-500" /> Valores
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="price">Valor de {listingType === 'sale' ? 'Venda' : 'Aluguel'}</Label>
                                <Input
                                    id="price"
                                    value={price}
                                    onChange={(e) => setPrice(formatCurrency(e.target.value))}
                                    className="h-14 rounded-2xl text-2xl font-black text-primary border-primary/20 bg-primary/5"
                                    placeholder="R$ 0,00"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="condominio_fee">Taxa Condominial</Label>
                                    <Input
                                        id="condominio_fee"
                                        value={condominio}
                                        onChange={(e) => setCondominio(formatCurrency(e.target.value))}
                                        className="h-11 rounded-xl"
                                        placeholder="R$ 0,00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="iptu">IPTU (Anual)</Label>
                                    <Input
                                        id="iptu"
                                        value={iptu}
                                        onChange={(e) => setIptu(formatCurrency(e.target.value))}
                                        className="h-11 rounded-xl"
                                        placeholder="R$ 0,00"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Endereço */}
                    <Card className="border-none shadow-md overflow-hidden">
                        <CardHeader className="bg-zinc-50 dark:bg-zinc-900 border-b">
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-red-500" /> Localização
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 flex-wrap gap-2">
                                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs uppercase tracking-tighter">
                                    {showFullAddress ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    Exibir Endereço Pleno
                                </div>
                                <Switch checked={showFullAddress} onCheckedChange={setShowFullAddress} />
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">CEP {cepLoading && <Loader2 className="w-3 h-3 animate-spin" />}</Label>
                                        <Input value={cep} onChange={(e) => setCep(formatCEP(e.target.value))} className="h-11 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Número</Label>
                                        <Input value={number} onChange={(e) => setNumber(e.target.value)} className="h-11 rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Rua / Avenida</Label>
                                    <Input value={street} onChange={(e) => setStreet(e.target.value)} className="h-11 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Bairro</Label>
                                    <Input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="h-11 rounded-xl" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Cidade</Label>
                                        <Input value={city} onChange={(e) => setCity(e.target.value)} className="h-11 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>UF</Label>
                                        <Input value={state} readOnly className="h-11 rounded-xl bg-zinc-50" />
                                    </div>
                                </div>
                            </div>

                            <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-950 rounded-2xl overflow-hidden relative border border-zinc-200">
                                {generateMapUrl() ? (
                                    <iframe src={generateMapUrl()!} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-xs font-bold uppercase tracking-widest">Preencha o CEP</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Botões de Ação */}
                    <div className="flex flex-col gap-3 pt-4 pb-12">
                        <Button type="submit" disabled={isSubmitting} className="h-14 rounded-2xl font-black uppercase tracking-widest text-base shadow-lg shadow-primary/20">
                            {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Check className="w-5 h-5 mr-2" />}
                            Salvar Alterações
                        </Button>
                        <Button variant="outline" asChild className="h-12 rounded-2xl font-black uppercase tracking-widest text-xs border-zinc-200">
                            <Link href={`/inventory/${property.id}`}>Descartar e Voltar</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    )
}
