'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
    ArrowLeft, Loader2, MapPin, Building, Ruler, Bed, 
    Bath, Car, Percent, Lock, User, Phone, Sparkles,
    CheckCircle2, Home, Star, Waves, Dumbbell, ShieldCheck,
    PawPrint, Sofa, Banknote, Eye, EyeOff
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
import { createProperty } from './actions'
import { generatePropertyDescription } from './ai-actions'
import { toast } from 'sonner'
import { PropertyGallery } from '@/components/property-gallery'
import { cn } from '@/lib/utils'

const AMENITIES_OPTIONS = [
    { id: 'pool', label: 'Piscina', icon: Waves },
    { id: 'gym', label: 'Academia', icon: Dumbbell },
    { id: 'party_room', label: 'Salão de Festas', icon: Home },
    { id: 'barbecue', label: 'Churrasqueira', icon: Sparkles },
    { id: 'security', label: 'Portaria 24h', icon: ShieldCheck },
    { id: 'playground', label: 'Playground', icon: Star },
]

export default function NewInventoryPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [cepLoading, setCepLoading] = useState(false)
    const [isGeneratingAI, setIsGeneratingAI] = useState(false)

    // Form States
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [cep, setCep] = useState('')
    const [street, setStreet] = useState('')
    const [number, setNumber] = useState('')
    const [neighborhood, setNeighborhood] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('SP')

    const [listingType, setListingType] = useState('sale')
    const [propertyType, setPropertyType] = useState('apartment')
    const [bedrooms, setBedrooms] = useState('2')
    const [suites, setSuites] = useState('0')
    const [bathrooms, setBathrooms] = useState('1')
    const [parkingSpots, setParkingSpots] = useState('1')
    const [usefulArea, setUsefulArea] = useState('')

    const [price, setPrice] = useState('')
    const [condominio, setCondominio] = useState('')
    const [iptu, setIptu] = useState('')
    const [commission, setCommission] = useState('6')

    const [photos, setPhotos] = useState<string[]>([])
    const [amenities, setAmenities] = useState<string[]>([])

    // Switches (V2.0)
    const [isExclusive, setIsExclusive] = useState(false)
    const [isFurnished, setIsFurnished] = useState(false)
    const [petsAllowed, setPetsAllowed] = useState(true)
    const [acceptsFinancing, setAcceptsFinancing] = useState(true)
    const [showFullAddress, setShowFullAddress] = useState(true)

    // AI Generator Handler
    const handleGenerateAI = async () => {
        if (!title || !price) {
            toast.error("Preencha ao menos o Título e o Preço para gerar a descrição com IA.")
            return
        }

        setIsGeneratingAI(true)
        try {
            const res = await generatePropertyDescription({
                title,
                type: propertyType,
                listingType,
                price: parseFloat(price.replace(/[^\d]/g, "")) / 100,
                bedrooms: parseInt(bedrooms),
                bathrooms: parseInt(bathrooms),
                suites: parseInt(suites),
                area: parseFloat(usefulArea),
                isFurnished,
                petsAllowed,
                amenities: amenities.map(id => AMENITIES_OPTIONS.find(a => a.id === id)?.label || id),
                neighborhood,
                city
            })

            if (res.error) {
                toast.error(res.error)
            } else if (res.description) {
                setDescription(res.description)
                toast.success("Descrição gerada com sucesso!")
            }
        } catch (error) {
            toast.error("Erro interno ao gerar descrição.")
        } finally {
            setIsGeneratingAI(false)
        }
    }

    // Formatting utilities
    const formatCurrency = (val: string) => {
        const clean = val.replace(/\D/g, "")
        if (!clean) return ""
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseInt(clean) / 100)
    }

    const formatCEP = (val: string) => {
        const clean = val.replace(/\D/g, "")
        if (clean.length > 5) return clean.replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9)
        return clean
    }

    const toggleAmenity = (id: string) => {
        setAmenities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
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
        if (cleanCep.length === 8) {
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
                        setStreet('')
                        setNeighborhood('')
                        setCity('')
                        toast.error('CEP não encontrado na base pública. Preencha manualmente.')
                    }
                })
                .catch(() => toast.error('Erro ao buscar o CEP.'))
                .finally(() => setCepLoading(false))
        }
    }, [cep])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        const formData = new FormData(e.currentTarget)
        
        // Append additional states not naturally in FormData
        formData.append('is_exclusive', String(isExclusive))
        formData.append('is_furnished', String(isFurnished))
        formData.append('pets_allowed', String(petsAllowed))
        formData.append('accepts_financing', String(acceptsFinancing))
        formData.append('show_full_address', String(showFullAddress))
        formData.append('amenities', JSON.stringify(amenities))

        try {
            const res = await createProperty(formData)
            if (res && res.error) {
                toast.error(res.error)
                setIsSubmitting(false)
            } else {
                toast.success('Imóvel cadastrado com sucesso!')
                router.push('/inventory')
                router.refresh()
            }
        } catch (error) {
            toast.error('Erro fatal ao criar imóvel.')
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto w-full pb-12 px-4 md:px-0">
            <div className="flex items-center gap-4 py-8">
                <Button variant="outline" size="icon" asChild className="h-9 w-9 rounded-lg">
                    <Link href="/inventory">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter uppercase">Nova Captação</h1>
                    <p className="text-xs text-zinc-500 font-medium">CADASTRO DE PROPRIEDADE V2.0</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Gestão Interna (Private Card) */}
                <Card className="border-indigo-100 dark:border-indigo-900/30 overflow-hidden shadow-sm">
                    <div className="bg-indigo-50/50 dark:bg-indigo-950/10 px-6 py-3 border-b border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                            <Lock className="h-4 w-4" />
                            <span className="text-xs font-black uppercase tracking-widest">Informações de Gestão Interna</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200 uppercase font-black">Somente Equipe</Badge>
                    </div>
                    <CardContent className="p-6 grid gap-6 md:grid-cols-2">
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Contrato de Exclusividade</Label>
                                <p className="text-xs text-zinc-500">Este imóvel é exclusividade da sua agência?</p>
                            </div>
                            <Switch checked={isExclusive} onCheckedChange={setIsExclusive} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="owner_name" className="text-xs font-bold text-zinc-500 uppercase">Nome do Proprietário</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                    <Input id="owner_name" name="owner_name" placeholder="Nome Completo" className="pl-9" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="owner_phone" className="text-xs font-bold text-zinc-500 uppercase">Telefone de Contato</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                    <Input id="owner_phone" name="owner_phone" placeholder="(00) 00000-0000" className="pl-9" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Informações Públicas do Anúncio */}
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-black uppercase tracking-tight">Primeiro Passo: O Imóvel</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    onClick={handleGenerateAI}
                                    disabled={isGeneratingAI}
                                    className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-2 text-xs font-bold"
                                >
                                    {isGeneratingAI ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                                    Gerar Descrição IA
                                </Button>
                            </div>
                        </div>
                        <CardDescription>Escolha a finalidade e o tipo do imóvel para começar.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="space-y-2">
                                <Label htmlFor="listing_type">Objetivo da Transação</Label>
                                <Select name="listing_type" defaultValue={listingType} onValueChange={setListingType}>
                                    <SelectTrigger id="listing_type" className="h-12 border-zinc-300 dark:border-zinc-700">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sale">Venda Direta</SelectItem>
                                        <SelectItem value="rent">Locação Mensal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="property_type">Tipo de Unidade</Label>
                                <Select name="property_type" defaultValue={propertyType} onValueChange={setPropertyType}>
                                    <SelectTrigger id="property_type" className="h-12 border-zinc-300 dark:border-zinc-700">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="apartment">Apartamento</SelectItem>
                                        <SelectItem value="house">Casa de Rua</SelectItem>
                                        <SelectItem value="condo">Casa em Condomínio</SelectItem>
                                        <SelectItem value="commercial">Conjunto Comercial</SelectItem>
                                        <SelectItem value="land">Terreno / Lote</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-zinc-500 uppercase font-black text-[10px] tracking-wide">Título do Anúncio (Público)</Label>
                            <Input 
                                id="title" 
                                name="title" 
                                placeholder="Ex: Loft Industrial Reformado no Itaim Bibi" 
                                required 
                                className="h-12 font-medium"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-zinc-500 uppercase font-black text-[10px] tracking-wide">Apresentação Geral</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Descreva os diferenciais, a vista, a vizinhança e o estado de conservação..."
                                className="min-h-32 resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* Estrutura Detalhada */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5 uppercase">
                                    <Bed className="h-3 w-3" /> Quartos
                                </Label>
                                <Input id="bedrooms" name="bedrooms" type="number" min="0" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5 uppercase">
                                    <CheckCircle2 className="h-3 w-3" /> Suítes
                                </Label>
                                <Input id="suites_count" name="suites_count" type="number" min="0" value={suites} onChange={(e) => setSuites(e.target.value)} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5 uppercase">
                                    <Bath className="h-3 w-3" /> Banheiros
                                </Label>
                                <Input id="bathrooms" name="bathrooms" type="number" min="0" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5 uppercase">
                                    <Car className="h-3 w-3" /> Vagas
                                </Label>
                                <Input id="parking_spots" name="parking_spots" type="number" min="0" value={parkingSpots} onChange={(e) => setParkingSpots(e.target.value)} className="h-11" />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <Label className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5 uppercase">
                                    <Ruler className="h-3 w-3" /> Área Útil
                                </Label>
                                <div className="relative">
                                    <Input id="useful_area" name="useful_area" type="number" min="0" className="h-11 pr-8" placeholder="0" value={usefulArea} onChange={(e) => setUsefulArea(e.target.value)} />
                                    <span className="absolute right-3 top-3 text-[10px] font-bold text-zinc-400">m²</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                             <div className="space-y-2">
                                <Label htmlFor="price" className="text-zinc-900 font-bold">Valor do Imóvel *</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    placeholder="R$ 0,00"
                                    required
                                    value={price}
                                    onChange={(e) => setPrice(formatCurrency(e.target.value))}
                                    className="h-12 border-primary/20 bg-primary/5 text-lg font-black text-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="commission_percentage" className="text-zinc-500 font-bold">Comissão (%)</Label>
                                <div className="relative">
                                    <Percent className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400" />
                                    <Input 
                                        id="commission_percentage" 
                                        name="commission_percentage" 
                                        type="number" 
                                        step="0.1" 
                                        value={commission}
                                        onChange={(e) => setCommission(e.target.value)}
                                        className="h-12 pl-10" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="condominio_fee" className="text-zinc-500 font-bold">Condomínio / IPTU</Label>
                                <div className="flex gap-2">
                                    <Input
                                        name="condominio_fee"
                                        placeholder="Cond. R$"
                                        value={condominio}
                                        onChange={(e) => setCondominio(formatCurrency(e.target.value))}
                                        className="h-12 text-sm"
                                    />
                                    <Input
                                        name="iptu"
                                        placeholder="IPTU R$"
                                        value={iptu}
                                        onChange={(e) => setIptu(formatCurrency(e.target.value))}
                                        className="h-12 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Comodidades e Diferenciais (New V2.0 Card) */}
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-black uppercase tracking-tight">O que o imóvel oferece?</CardTitle>
                        <CardDescription>Destaque os principais diferenciais que valorizam o anúncio.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-8">
                        {/* Switches Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white dark:bg-zinc-800 p-2 rounded-lg shadow-sm">
                                        <Sofa className="h-4 w-4 text-zinc-500" />
                                    </div>
                                    <Label className="text-sm font-bold">Imóvel Mobiliado</Label>
                                </div>
                                <Switch checked={isFurnished} onCheckedChange={setIsFurnished} />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white dark:bg-zinc-800 p-2 rounded-lg shadow-sm">
                                        <PawPrint className="h-4 w-4 text-zinc-500" />
                                    </div>
                                    <Label className="text-sm font-bold">Aceita Pets</Label>
                                </div>
                                <Switch checked={petsAllowed} onCheckedChange={setPetsAllowed} />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white dark:bg-zinc-800 p-2 rounded-lg shadow-sm">
                                        <Banknote className="h-4 w-4 text-zinc-500" />
                                    </div>
                                    <Label className="text-sm font-bold">Financiamento</Label>
                                </div>
                                <Switch checked={acceptsFinancing} onCheckedChange={setAcceptsFinancing} />
                            </div>
                        </div>

                        {/* Amenities Tags */}
                        <div className="space-y-4">
                            <Label className="text-xs font-black uppercase text-zinc-400 tracking-widest pl-1">Lazer e Infraestrutura do Condomínio</Label>
                            <div className="flex flex-wrap gap-3">
                                {AMENITIES_OPTIONS.map((item) => {
                                    const Icon = item.icon
                                    const isActive = amenities.includes(item.id)
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => toggleAmenity(item.id)}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-bold transition-all",
                                                isActive 
                                                    ? "bg-primary border-primary text-white shadow-md shadow-primary/20 scale-105" 
                                                    : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
                                            )}
                                        >
                                            <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-zinc-400")} />
                                            {item.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Mídia e Fotos */}
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                        <CardTitle className="text-lg font-black uppercase tracking-tight">Fotos do Imóvel</CardTitle>
                        <CardDescription>Upload inteligente: fotos são comprimidas automaticamente para máxima performance.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <PropertyGallery value={photos} onChange={setPhotos} />
                        <input type="hidden" name="photos" value={JSON.stringify(photos)} />
                    </CardContent>
                </Card>

                {/* 5. Localização e Privacidade */}
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-black uppercase tracking-tight">Endereço & Geolocalização</CardTitle>
                        <CardDescription>O endereço completo é usado para indexação. Você escolhe o que o cliente vê.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-8">
                        <div className="flex items-center justify-between p-4 bg-orange-50/50 dark:bg-orange-950/10 rounded-xl border border-orange-100 dark:border-orange-900/30">
                            <div className="flex items-center gap-3">
                                <div className="bg-white dark:bg-zinc-800 p-2 rounded-lg shadow-sm">
                                    {showFullAddress ? <Eye className="h-4 w-4 text-orange-600" /> : <EyeOff className="h-4 w-4 text-zinc-500" />}
                                </div>
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Mostrar endereço completo no portal</Label>
                                    <p className="text-xs text-zinc-500">Se desativado, apenas o bairro e cidade serão exibidos.</p>
                                </div>
                            </div>
                            <Switch checked={showFullAddress} onCheckedChange={setShowFullAddress} />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="address_zipcode" className="flex items-center gap-2 text-xs font-black uppercase text-zinc-400">
                                            CEP
                                            {cepLoading && <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />}
                                        </Label>
                                        <Input
                                            id="address_zipcode"
                                            name="address_zipcode"
                                            placeholder="00000-000"
                                            value={cep}
                                            onChange={(e) => setCep(formatCEP(e.target.value))}
                                            maxLength={9}
                                            className="h-11 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address_number" className="text-xs font-black uppercase text-zinc-400">Número</Label>
                                        <Input id="address_number" name="address_number" placeholder="123" value={number} onChange={(e) => setNumber(e.target.value)} className="h-11" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address_street" className="text-xs font-black uppercase text-zinc-400">Logradouro / Rua</Label>
                                    <Input id="address_street" name="address_street" value={street} onChange={(e) => setStreet(e.target.value)} className="h-11" />
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="sm:col-span-2 space-y-2">
                                        <Label htmlFor="address_neighborhood" className="text-xs font-black uppercase text-zinc-400">Bairro</Label>
                                        <Input id="address_neighborhood" name="address_neighborhood" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="h-11" />
                                    </div>
                                    <div className="sm:col-span-1 space-y-2">
                                        <Label htmlFor="address_city" className="text-xs font-black uppercase text-zinc-400">Cidade</Label>
                                        <Input id="address_city" name="address_city" value={city} onChange={(e) => setCity(e.target.value)} className="h-11" />
                                    </div>
                                    <div className="sm:col-span-1 space-y-2">
                                        <Label htmlFor="address_state" className="text-xs font-black uppercase text-zinc-400">UF</Label>
                                        <Input id="address_state" name="address_state" value={state} onChange={(e) => setState(e.target.value)} maxLength={2} className="h-11 uppercase" />
                                    </div>
                                </div>
                            </div>

                            <div className="h-full min-h-[300px] w-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative shadow-inner">
                                {generateMapUrl() ? (
                                    <iframe src={generateMapUrl()!} width="100%" height="100%" loading="lazy" className="absolute inset-0 z-10" />
                                ) : (
                                    <div className="text-center p-6 text-zinc-400 flex flex-col items-center justify-center h-full">
                                        <MapPin className="h-10 w-10 mb-3 opacity-20" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Mapa Indisponível</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-end gap-4 py-8 border-t border-zinc-200 dark:border-zinc-800">
                    <Button variant="ghost" asChild type="button" className="font-bold text-zinc-500 hover:text-zinc-900">
                        <Link href="/inventory">Descartar Alterações</Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting} size="lg" className="px-12 rounded-full font-black uppercase tracking-tighter shadow-xl shadow-primary/20">
                        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Concluir Captação
                    </Button>
                </div>
            </form>
        </div>
    )
}
