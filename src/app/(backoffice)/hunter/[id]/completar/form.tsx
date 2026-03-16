'use client'

import { useState, useTransition, useRef } from 'react'
import { convertOpportunityToProperty } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Home, MapPin, DollarSign, CheckCircle2,
    Loader2, ChevronRight, ChevronLeft, Flame, Star, Search
} from 'lucide-react'
import { toast } from 'sonner'

type Step = 1 | 2

function maskCep(value: string) {
    return value.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2')
}

function maskCurrency(value: string) {
    const numeric = value.replace(/\D/g, '')
    if (!numeric) return ''
    const cents = parseInt(numeric, 10)
    return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function currencyToNumber(value: string) {
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0
}

export function CompletarCadastroForm({ opportunity }: { opportunity: any }) {
    const [step, setStep] = useState<Step>(1)
    const [isPending, startTransition] = useTransition()
    const [isExclusive, setIsExclusive] = useState(false)
    const [listingType, setListingType] = useState<'sale' | 'rent'>('sale')

    // Step 1 — all stored in state so they survive when step 2 mounts
    const [title, setTitle] = useState(opportunity.title || '')
    const [price, setPrice] = useState(String(opportunity.price || ''))
    const [propertyType, setPropertyType] = useState(opportunity.property_type || 'Apartamento')
    const [bedrooms, setBedrooms] = useState(String(opportunity.bedrooms || 0))
    const [bathrooms, setBathrooms] = useState(String(opportunity.bathrooms || 0))
    const [parkingSpots, setParkingSpots] = useState(String(opportunity.parking_spots || 0))
    const [usefulArea, setUsefulArea] = useState(String(opportunity.useful_area || ''))
    const [description, setDescription] = useState(opportunity.rewritten_description || opportunity.description || '')

    // Step 2
    const [cep, setCep] = useState('')
    const [cepLoading, setCepLoading] = useState(false)
    const [street, setStreet] = useState('')
    const [addressNumber, setAddressNumber] = useState('')
    const [neighborhood, setNeighborhood] = useState(opportunity.address_neighborhood || '')
    const [city, setCity] = useState(opportunity.address_city || '')
    const [uf, setUf] = useState('')
    const [iptuDisplay, setIptuDisplay] = useState('')
    const [condominioDisplay, setCondominioDisplay] = useState('')
    const [commission, setCommission] = useState('6')

    const streetRef = useRef<HTMLInputElement>(null)

    async function handleCepChange(rawValue: string) {
        const masked = maskCep(rawValue)
        setCep(masked)
        const digits = masked.replace(/\D/g, '')
        if (digits.length === 8) {
            setCepLoading(true)
            try {
                const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${digits}`)
                if (!res.ok) throw new Error('not found')
                const data = await res.json()
                setStreet(data.street || '')
                setNeighborhood(data.neighborhood || '')
                setCity(data.city || '')
                setUf(data.state || '')
                setTimeout(() => streetRef.current?.focus(), 100)
                toast.success('Endereço encontrado!')
            } catch {
                toast.error('CEP não encontrado ou inválido.')
            } finally {
                setCepLoading(false)
            }
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!title.trim()) { toast.error('Título é obrigatório.'); setStep(1); return }
        if (!price) { toast.error('Preço é obrigatório.'); setStep(1); return }

        const formData = new FormData()
        formData.set('listing_type', listingType)
        formData.set('title', title)
        formData.set('price', price)
        formData.set('property_type', propertyType)
        formData.set('bedrooms', bedrooms)
        formData.set('bathrooms', bathrooms)
        formData.set('parking_spots', parkingSpots)
        formData.set('useful_area', usefulArea)
        formData.set('description', description)
        formData.set('address_zipcode', cep.replace(/\D/g, ''))
        formData.set('address_street', street)
        formData.set('address_number', addressNumber)
        formData.set('address_neighborhood', neighborhood)
        formData.set('address_city', city)
        formData.set('address_state', uf)
        formData.set('iptu', String(currencyToNumber(iptuDisplay)))
        formData.set('condominio_fee', String(currencyToNumber(condominioDisplay)))
        formData.set('commission_percentage', commission)
        formData.set('is_exclusive', String(isExclusive))

        startTransition(async () => {
            const result = await convertOpportunityToProperty(opportunity.id, formData)
            if (result?.error) toast.error(result.error)
        })
    }

    return (
        <form onSubmit={handleSubmit}>
            {/* Progress */}
            <div className="flex items-center gap-3 mb-6">
                <div className={`flex items-center gap-2 text-sm font-bold transition-colors ${step === 1 ? 'text-primary' : 'text-green-500'}`}>
                    {step === 1
                        ? <span className="h-6 w-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-black">1</span>
                        : <CheckCircle2 className="h-5 w-5" />}
                    Dados Básicos
                </div>
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                <div className={`flex items-center gap-2 text-sm font-bold transition-colors ${step === 2 ? 'text-primary' : 'text-zinc-400'}`}>
                    <span className={`h-6 w-6 rounded-full text-xs flex items-center justify-center font-black ${step === 2 ? 'bg-primary text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>2</span>
                    Detalhes do Imóvel
                </div>
            </div>

            {/* ── STEP 1 ── */}
            {step === 1 && (
                <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Home className="h-4 w-4 text-primary" />
                            Tipo e Dados Principais
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Tipo de Negócio *</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => setListingType('sale')}
                                    className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${listingType === 'sale' ? 'border-primary bg-primary/10 text-primary' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300'}`}>
                                    🏠 Venda
                                </button>
                                <button type="button" onClick={() => setListingType('rent')}
                                    className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${listingType === 'rent' ? 'border-primary bg-primary/10 text-primary' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300'}`}>
                                    🔑 Locação
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Título do Imóvel *</Label>
                            <Input value={title} onChange={e => setTitle(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Preço (R$) *</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <Input type="number" value={price} onChange={e => setPrice(e.target.value)} className="pl-9" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Tipo de Imóvel</Label>
                            <Input value={propertyType} onChange={e => setPropertyType(e.target.value)} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Quartos</Label>
                                <Input type="number" value={bedrooms} onChange={e => setBedrooms(e.target.value)} min={0} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Banheiros</Label>
                                <Input type="number" value={bathrooms} onChange={e => setBathrooms(e.target.value)} min={0} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Vagas</Label>
                                <Input type="number" value={parkingSpots} onChange={e => setParkingSpots(e.target.value)} min={0} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Área Útil (m²)</Label>
                                <Input type="number" value={usefulArea} onChange={e => setUsefulArea(e.target.value)} min={0} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Descrição</Label>
                            <p className="text-[10px] text-zinc-400">Pré-preenchida pela análise do Hunter IA. Você pode editar.</p>
                            <Textarea rows={5} value={description} onChange={e => setDescription(e.target.value)} />
                        </div>

                        <div className="flex justify-end">
                            <Button type="button" onClick={() => setStep(2)} className="gap-2">
                                Próximo Passo <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
                <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            Endereço e Condições Comerciais
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {/* CEP */}
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">CEP</Label>
                            <div className="relative">
                                <Input
                                    value={cep}
                                    onChange={e => handleCepChange(e.target.value)}
                                    placeholder="00000-000"
                                    maxLength={9}
                                    className="pr-10"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                                    {cepLoading
                                        ? <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        : <Search className="h-4 w-4" />
                                    }
                                </div>
                            </div>
                            {cep.replace(/\D/g, '').length === 8 && !cepLoading && street && (
                                <p className="text-[10px] text-emerald-600">✓ Endereço preenchido automaticamente. Ajuste se necessário.</p>
                            )}
                        </div>

                        {/* Street + Number */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Logradouro</Label>
                                <Input ref={streetRef} value={street} onChange={e => setStreet(e.target.value)} placeholder="Rua das Flores" />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Número</Label>
                                <Input value={addressNumber} onChange={e => setAddressNumber(e.target.value)} placeholder="123" />
                            </div>
                        </div>

                        {/* Bairro + Cidade + UF */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Bairro</Label>
                                <Input value={neighborhood} onChange={e => setNeighborhood(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Cidade</Label>
                                <Input value={city} onChange={e => setCity(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">UF</Label>
                                <Input value={uf} onChange={e => setUf(e.target.value)} placeholder="SP" maxLength={2} className="uppercase" />
                            </div>
                        </div>

                        {/* IPTU + Condomínio */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">IPTU Mensal</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">R$</span>
                                    <Input className="pl-9" inputMode="numeric" value={iptuDisplay}
                                        onChange={e => setIptuDisplay(maskCurrency(e.target.value))} placeholder="0,00" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Condomínio</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">R$</span>
                                    <Input className="pl-9" inputMode="numeric" value={condominioDisplay}
                                        onChange={e => setCondominioDisplay(maskCurrency(e.target.value))} placeholder="0,00" />
                                </div>
                            </div>
                        </div>

                        {/* Comissão */}
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase tracking-wider text-zinc-500">Comissão Acordada (%)</Label>
                            <Input type="number" value={commission} onChange={e => setCommission(e.target.value)} min={0} max={20} step={0.5} />
                        </div>

                        {/* Exclusividade */}
                        <button type="button" onClick={() => setIsExclusive(!isExclusive)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${isExclusive ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20' : 'border-zinc-200 dark:border-zinc-800'}`}>
                            <div className="flex items-center gap-3">
                                <Star className={`h-5 w-5 ${isExclusive ? 'text-amber-500 fill-amber-400' : 'text-zinc-400'}`} />
                                <div className="text-left">
                                    <div className={`text-sm font-bold ${isExclusive ? 'text-amber-700 dark:text-amber-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                        Imóvel com Exclusividade
                                    </div>
                                    <div className="text-[11px] text-zinc-500">
                                        Contrato de exclusividade firmado com o proprietário
                                    </div>
                                </div>
                            </div>
                            <div className={`h-6 w-10 rounded-full transition-colors relative ${isExclusive ? 'bg-amber-400' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                                <div className={`absolute top-1 h-4 w-4 bg-white rounded-full shadow transition-transform ${isExclusive ? 'translate-x-5' : 'translate-x-1'}`} />
                            </div>
                        </button>

                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={() => setStep(1)} className="gap-2 flex-shrink-0">
                                <ChevronLeft className="h-4 w-4" /> Voltar
                            </Button>
                            <Button type="submit" disabled={isPending} className="flex-1 gap-2 font-bold">
                                {isPending
                                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando no Inventário...</>
                                    : <><Flame className="h-4 w-4" /> Salvar no Inventário</>
                                }
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </form>
    )
}
