'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createLead } from '../actions'
import { Button } from '@/components/ui/button'
import { 
    Loader2, User, Phone, Mail, Building, Filter, 
    TrendingUp, Zap, Instagram, MessageCircle, Globe, Users,
    ThermometerSnowflake, ThermometerSun, Flame, Target
} from 'lucide-react'
import { toast } from 'sonner'
import { IMaskInput } from 'react-imask'

const SOURCES = [
    { id: 'direct', label: 'Direto / Site', icon: Globe },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'instagram', label: 'Instagram', icon: Instagram },
    { id: 'zap', label: 'Portal ZAP', icon: Zap },
    { id: 'vivareal', label: 'VivaReal', icon: Zap },
    { id: 'indication', label: 'Indicação', icon: Users },
]

const URGENCY_LEVELS = [
    { value: 1, label: 'Frio', icon: ThermometerSnowflake, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
    { value: 3, label: 'Morno', icon: ThermometerSun, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20' },
    { value: 5, label: 'Quente', icon: Flame, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/20' },
]

export function NewLeadForm({ properties }: { properties: { id: string, title: string, listing_type: string }[] }) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [phoneValue, setPhoneValue] = useState('')
    const [budgetMin, setBudgetMin] = useState('')
    const [budgetMax, setBudgetMax] = useState('')
    const [selectedUrgency, setSelectedUrgency] = useState(1)

    const formatCurrency = (val: string) => {
        const clean = val.replace(/\D/g, "")
        if (!clean) return ""
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseInt(clean) / 100)
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsSubmitting(true)
        const formData = new FormData(e.currentTarget)
        formData.append('urgency_score', selectedUrgency.toString())

        try {
            const res = await createLead(formData)
            if (res && res.error) {
                toast.error(res.error)
            } else {
                toast.success('Lead cadastrado com sucesso!')
                router.push('/crm')
                router.refresh()
            }
        } catch (error) {
            toast.error('Erro fatal ao criar Lead.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-10 bg-white dark:bg-zinc-950 p-6 sm:p-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
            {/* Sec 1: Identificação */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-900">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Identificação do Cliente</h3>
                        <p className="text-xs text-zinc-500">Dados básicos de contato para o primeiro atendimento.</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">
                            Nome Completo *
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            placeholder="Ex: João da Silva"
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm font-medium transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">
                            Celular / WhatsApp
                        </label>
                        <IMaskInput
                            mask="(00) 00000-0000"
                            name="phone"
                            id="phone"
                            placeholder="(11) 98765-4321"
                            value={phoneValue}
                            onAccept={(value: string) => setPhoneValue(value)}
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm font-medium transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="joao@email.com"
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm font-medium transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Sec 2: Inteligência de Mercado */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-900">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <Target className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Inteligência de Mercado</h3>
                        <p className="text-xs text-zinc-500">Campos estratégicos para qualificação e conversão.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Origem */}
                    <div className="space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">
                            Origem do Lead
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {SOURCES.map((source) => {
                                const Icon = source.icon
                                return (
                                    <label 
                                        key={source.id} 
                                        className="relative flex items-center gap-2 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 group"
                                    >
                                        <input type="radio" name="source" value={source.id} defaultChecked={source.id === 'direct'} className="hidden" />
                                        <Icon className="h-4 w-4 text-zinc-400 group-has-[:checked]:text-primary" />
                                        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 group-has-[:checked]:text-zinc-900 dark:group-has-[:checked]:text-zinc-100">
                                            {source.label}
                                        </span>
                                    </label>
                                )
                            })}
                        </div>
                    </div>

                    {/* Urgência */}
                    <div className="space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">
                            Temperatura / Urgência
                        </label>
                        <div className="flex gap-2">
                            {URGENCY_LEVELS.map((level) => {
                                const Icon = level.icon
                                const isActive = selectedUrgency === level.value
                                return (
                                    <button
                                        key={level.value}
                                        type="button"
                                        onClick={() => setSelectedUrgency(level.value)}
                                        className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                            isActive 
                                            ? `border-zinc-900 dark:border-white ${level.bg}` 
                                            : 'border-transparent bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                                        }`}
                                    >
                                        <Icon className={`h-6 w-6 mb-2 ${level.color}`} />
                                        <span className="text-xs font-extrabold uppercase tracking-tight">{level.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Orçamento */}
                    <div className="md:col-span-2 space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">
                            Expectativa de Investimento
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">Min</span>
                                <input
                                    type="text"
                                    name="budget_min"
                                    placeholder="R$ 0,00"
                                    value={budgetMin}
                                    onChange={(e) => setBudgetMin(formatCurrency(e.target.value))}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                                />
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">Max</span>
                                <input
                                    type="text"
                                    name="budget_max"
                                    placeholder="R$ 0,00"
                                    value={budgetMax}
                                    onChange={(e) => setBudgetMax(formatCurrency(e.target.value))}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sec 3: Contexto */}
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900 space-y-6">
                <div className="flex items-center gap-3 pb-2">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                        <Building className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Interesse e Status</h3>
                        <p className="text-xs text-zinc-500">Onde posicionar o lead no início da jornada.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="property_id" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">
                            Imóvel de Interesse
                        </label>
                        <select
                            name="property_id"
                            id="property_id"
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none appearance-none"
                        >
                            <option value="none">Nenhum imóvel específico</option>
                            {properties.map((prop) => (
                                <option key={prop.id} value={prop.id}>
                                    {prop.title} ({prop.listing_type === 'sale' ? 'Venda' : 'Aluguel'})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">
                            Fase Funil
                        </label>
                        <select
                            name="status"
                            id="status"
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none appearance-none"
                            defaultValue="new"
                        >
                            <option value="new">Novo Lead</option>
                            <option value="in_progress">Em Atendimento</option>
                            <option value="visit">Visita Agendada</option>
                            <option value="won">Proposta Aberta</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="pt-10 border-t border-zinc-100 dark:border-zinc-900 flex flex-col-reverse sm:flex-row justify-end gap-4">
                <Button variant="ghost" type="button" onClick={() => router.push('/crm')} disabled={isSubmitting} className="font-bold sm:w-32">
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="font-extrabold sm:w-48 gap-2 shadow-lg shadow-primary/20">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="h-4 w-4 fill-current" />}
                    {isSubmitting ? 'Processando...' : 'Finalizar Cadastro'}
                </Button>
            </div>
        </form>
    )
}
