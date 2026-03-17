'use client'

import { useState, useTransition, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { User, Building2, Save, Loader2, Camera, Shield, Upload, Target, Brain, Search, Zap, CheckCircle2, Coins, Receipt, Percent, Sparkles, Phone, Clock, BarChart3, Signal, Globe, Image, LayoutGrid } from 'lucide-react'
import { updateProfile, updateAgency, uploadAvatar, uploadAgencyLogo, updateFinancials } from './actions'
import { saveHunterConfig, deleteHunterConfig } from './hunter-actions'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Trash2, PlusCircle } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

interface SettingsFormProps {
    profile: any
    agency: any
    role: string
    hunterConfig?: any
    hunterConfigs?: any[]
}

export function SettingsForm({ profile, agency, role, hunterConfig, hunterConfigs = [] }: SettingsFormProps) {
    const [isPending, startTransition] = useTransition()
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
    const [isUploadingLogo, setIsUploadingLogo] = useState(false)
    // Use hunterConfigs array if provided; fall back to singleton hunterConfig
    const [agents, setAgents] = useState<any[]>(
        hunterConfigs.length > 0 ? hunterConfigs : (hunterConfig ? [hunterConfig] : [])
    )
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(agents[0]?.id ?? null)
    const selectedAgent = agents.find(a => a.id === selectedAgentId) ?? null

    const avatarInputRef = useRef<HTMLInputElement>(null)
    const logoInputRef = useRef<HTMLInputElement>(null)

    const isAdmin = role === 'admin'

    const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(async () => {
            const res = await updateProfile(formData)
            if (res.error) toast.error(res.error)
            else toast.success('Perfil atualizado com sucesso!')
        })
    }

    const handleAgencySubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(async () => {
            const res = await updateAgency(formData)
            if (res.error) toast.error(res.error)
            else toast.success('Dados atualizados com sucesso!')
        })
    }

    const handleFinancialSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(async () => {
            const res = await updateFinancials(formData)
            if (res.error) toast.error(res.error)
            else toast.success('Regras financeiras salvas!')
        })
    }

    const handleHunterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        if (selectedAgentId) formData.set('config_id', selectedAgentId)
        startTransition(async () => {
            const res = await saveHunterConfig(formData)
            if (res.error) toast.error(res.error)
            else toast.success('Configurações do agente salvas!')
        })
    }

    const handleDeleteAgent = (id: string) => {
        startTransition(async () => {
            const res = await deleteHunterConfig(id)
            if (res.error) toast.error(res.error)
            else {
                const updated = agents.filter(a => a.id !== id)
                setAgents(updated)
                setSelectedAgentId(updated[0]?.id ?? null)
                toast.success('Agente removido.')
            }
        })
    }

    const handleNewAgent = () => {
        setSelectedAgentId(null)
    }

    const onAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploadingAvatar(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await uploadAvatar(formData)
            if (res.error) toast.error(res.error)
            else toast.success('Foto de perfil atualizada!')
        } catch (err) {
            toast.error('Erro ao fazer upload da foto.')
        } finally {
            setIsUploadingAvatar(false)
        }
    }

    const onLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploadingLogo(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await uploadAgencyLogo(formData)
            if (res.error) toast.error(res.error)
            else toast.success('Logo da agência atualizado!')
        } catch (err) {
            toast.error('Erro ao fazer upload do logo.')
        } finally {
            setIsUploadingLogo(false)
        }
    }

    return (
        <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-[800px] mb-8 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <TabsTrigger value="profile" className="gap-2 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800">
                    <User className="h-4 w-4" />
                    Meu Perfil
                </TabsTrigger>
                <TabsTrigger value="agency" className="gap-2 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800">
                    <Building2 className="h-4 w-4" />
                    Agência
                </TabsTrigger>
                {isAdmin && (
                    <TabsTrigger value="finance" className="gap-2 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800">
                        <Coins className="h-4 w-4" />
                        Financeiro
                    </TabsTrigger>
                )}
                {isAdmin && (
                    <TabsTrigger value="hunter" className="gap-2 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800">
                        <Target className="h-4 w-4" />
                        Hunter IA
                    </TabsTrigger>
                )}
            </TabsList>

            <TabsContent value="profile" className="animate-in fade-in slide-in-from-bottom-2 duration-400">
                <form onSubmit={handleProfileSubmit}>
                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
                        <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Informações Pessoais
                            </CardTitle>
                            <CardDescription>
                                Atualize suas informações de contato e foto de perfil.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {/* Avatar Section */}
                            <div className="flex items-center gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-900">
                                <div className="relative group">
                                    <Avatar className="h-24 w-24 border-4 border-white dark:border-zinc-900 shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-800">
                                        <AvatarImage src={profile.avatar_url || ''} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                                            {profile.full_name?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    {isUploadingAvatar ? (
                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                                        </div>
                                    ) : (
                                        <button 
                                            type="button" 
                                            onClick={() => avatarInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg opacity-90 hover:opacity-100 transition-opacity"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </button>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={avatarInputRef} 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={onAvatarFileChange} 
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Sua Foto</h4>
                                    <p className="text-xs text-zinc-500">Recomendado: Quadrada, pelo menos 400x400px.</p>
                                    <div className="flex gap-2 mt-2">
                                        <Button 
                                            type="button" 
                                            size="sm" 
                                            variant="outline" 
                                            className="text-xs font-bold"
                                            onClick={() => avatarInputRef.current?.click()}
                                            disabled={isUploadingAvatar}
                                        >
                                            Alterar
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Nome Completo</Label>
                                    <Input 
                                        id="full_name" 
                                        name="full_name" 
                                        defaultValue={profile.full_name || ''} 
                                        className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-medium" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-zinc-500">E-mail Profissional</Label>
                                    <Input 
                                        id="email" 
                                        value={profile.email || ''} 
                                        disabled 
                                        className="bg-zinc-100 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-400 cursor-not-allowed" 
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 justify-end py-4">
                            <Button type="submit" disabled={isPending} className="font-bold gap-2">
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Salvar Perfil
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </TabsContent>

            <TabsContent value="agency" className="animate-in fade-in slide-in-from-bottom-2 duration-400">
                <form onSubmit={handleAgencySubmit}>
                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
                        <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                Dados da Imobiliária
                            </CardTitle>
                            <CardDescription>
                                {isAdmin 
                                    ? "Gerencie as informações institucionais da sua agência." 
                                    : "Informações públicas da agência (Somente leitura para corretores)."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {/* Logo Section */}
                            <div className="flex items-center gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-900">
                                <div className="h-20 w-40 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900 overflow-hidden relative group">
                                    {isUploadingLogo ? (
                                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                                    ) : agency.logo_url ? (
                                        <img src={agency.logo_url} alt="Logo" className="max-h-full max-w-full object-contain" />
                                    ) : (
                                        <Building2 className="h-8 w-8 text-zinc-300" />
                                    )}
                                    {isAdmin && !isUploadingLogo && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button 
                                                type="button" 
                                                size="sm" 
                                                variant="secondary" 
                                                className="text-[10px] h-7 font-bold"
                                                onClick={() => logoInputRef.current?.click()}
                                            >
                                                Upload Logo
                                            </Button>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={logoInputRef} 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={onLogoFileChange} 
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Logotipo da Empresa</h4>
                                    <p className="text-xs text-zinc-500">SVG ou PNG com fundo transparente prefere-se.</p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Nome Fantasia</Label>
                                    <Input 
                                        id="name" 
                                        name="name" 
                                        defaultValue={agency.name || ''} 
                                        disabled={!isAdmin}
                                        className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-medium disabled:opacity-70" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Subdomínio (Slug)</Label>
                                    <Input 
                                        id="slug" 
                                        value={agency.slug || ''} 
                                        disabled 
                                        className="bg-zinc-100 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-400 cursor-not-allowed" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Telefone Comercial</Label>
                                    <Input 
                                        id="phone" 
                                        name="phone" 
                                        defaultValue={agency.phone || ''} 
                                        disabled={!isAdmin}
                                        placeholder="(11) 99999-9999"
                                        className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-medium disabled:opacity-70" 
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Endereço da Sede</Label>
                                    <Input 
                                        id="address" 
                                        name="address" 
                                        defaultValue={agency.address || ''} 
                                        disabled={!isAdmin}
                                        placeholder="Rua, Número, Bairro, Cidade - UF"
                                        className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-medium disabled:opacity-70" 
                                    />
                                </div>
                            </div>

                            {/* Branding Section */}
                            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900 space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    Identidade Visual & Portal
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="primary_color" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Cor Primária do Portal</Label>
                                        <div className="flex gap-2">
                                            <Input 
                                                id="primary_color" 
                                                name="primary_color" 
                                                type="color"
                                                defaultValue={agency.primary_color || '#4f46e5'} 
                                                disabled={!isAdmin}
                                                className="h-10 w-20 p-1 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 cursor-pointer" 
                                            />
                                            <Input 
                                                value={agency.primary_color || '#4f46e5'} 
                                                disabled
                                                className="bg-zinc-100 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs font-mono" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tagline" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Slogan de Impacto (Tagline)</Label>
                                        <Input 
                                            id="tagline" 
                                            name="tagline" 
                                            defaultValue={agency.tagline || ''} 
                                            disabled={!isAdmin}
                                            placeholder="Ex: Encontre o imóvel dos seus sonhos"
                                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-medium" 
                                        />
                                    </div>
                                    <div className="space-y-4 sm:col-span-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Estilo Visual do Portal (Layout)</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {[
                                                { id: 'modern', name: 'Modern Premium', desc: 'Layout atual, dinâmico e impactante.', icon: Sparkles },
                                                { id: 'minimalist', name: 'High-End Minimalist', desc: 'Limpo, clássico e focado em sofisticação.', icon: Globe },
                                                { id: 'grid', name: 'Visual Grid', desc: 'Foco total em imagens e grid moderno.', icon: Image }
                                            ].map((style) => (
                                                <Label 
                                                    key={style.id}
                                                    className={`relative flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                                                        (agency.portal_style || 'modern') === style.id 
                                                            ? 'border-primary bg-primary/5' 
                                                            : 'border-zinc-100 dark:border-zinc-800'
                                                    }`}
                                                >
                                                    <input 
                                                        type="radio" 
                                                        name="portal_style" 
                                                        value={style.id} 
                                                        className="absolute opacity-0"
                                                        defaultChecked={(agency.portal_style || 'modern') === style.id}
                                                    />
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <style.icon className={`h-4 w-4 ${ (agency.portal_style || 'modern') === style.id ? 'text-primary' : 'text-zinc-400' }`} />
                                                        <span className="text-sm font-black uppercase tracking-tight">{style.name}</span>
                                                    </div>
                                                    <span className="text-[10px] text-zinc-500 leading-tight">{style.desc}</span>
                                                    {(agency.portal_style || 'modern') === style.id && (
                                                        <div className="absolute top-2 right-2">
                                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                                        </div>
                                                    )}
                                                </Label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SEO Section */}
                            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900 space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                    <Search className="h-4 w-4" />
                                    SEO & Indexação (Google)
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="seo_title" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Título da Página (SEO Title)</Label>
                                        <Input 
                                            id="seo_title" 
                                            name="seo_title" 
                                            defaultValue={agency.seo_title || ''} 
                                            disabled={!isAdmin}
                                            placeholder="Ex: Nome da Imobiliária - Venda e Aluguel de Imóveis em Cidade"
                                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-medium" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="seo_description" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Descrição Meta (SEO Description)</Label>
                                        <textarea 
                                            id="seo_description" 
                                            name="seo_description" 
                                            defaultValue={agency.seo_description || ''} 
                                            disabled={!isAdmin}
                                            rows={3}
                                            placeholder="Breve descrição do seu negócio para aparecer nos resultados de busca..."
                                            className="flex w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Digital Presence */}
                            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900 space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Presença Digital & Contatos
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="whatsapp_number" className="text-xs font-bold uppercase tracking-wider text-zinc-500">WhatsApp de Atendimento</Label>
                                        <Input 
                                            id="whatsapp_number" 
                                            name="whatsapp_number" 
                                            defaultValue={agency.whatsapp_number || ''} 
                                            disabled={!isAdmin}
                                            placeholder="Ex: 5511999999999"
                                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-medium" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="instagram_url" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Instagram (Link Completo)</Label>
                                        <Input 
                                            id="instagram_url" 
                                            name="instagram_url" 
                                            defaultValue={agency.instagram_url || ''} 
                                            disabled={!isAdmin}
                                            placeholder="https://instagram.com/sua_agencia"
                                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-medium" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="facebook_url" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Facebook (Link Completo)</Label>
                                        <Input 
                                            id="facebook_url" 
                                            name="facebook_url" 
                                            defaultValue={agency.facebook_url || ''} 
                                            disabled={!isAdmin}
                                            placeholder="https://facebook.com/sua_agencia"
                                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-medium" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="linkedin_url" className="text-xs font-bold uppercase tracking-wider text-zinc-500">LinkedIn (Link Completo)</Label>
                                        <Input 
                                            id="linkedin_url" 
                                            name="linkedin_url" 
                                            defaultValue={agency.linkedin_url || ''} 
                                            disabled={!isAdmin}
                                            placeholder="https://linkedin.com/company/sua_agencia"
                                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-medium" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* AI Configuration Section */}
                            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900 space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                                    <Brain className="h-4 w-4" />
                                    Configurações de Inteligência Artificial
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="openai_api_key" className="text-xs font-bold uppercase tracking-wider text-zinc-500">OpenAI API Key</Label>
                                        <div className="relative group">
                                            <Input 
                                                id="openai_api_key" 
                                                name="openai_api_key" 
                                                type="password"
                                                defaultValue={agency.openai_api_key || ''} 
                                                disabled={!isAdmin}
                                                placeholder="sk-..."
                                                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-mono pr-10" 
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                                                <Zap className="h-4 w-4" />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-zinc-400 font-medium">
                                            Esta chave será usada para gerar descrições de imóveis e processar dados via IA para sua agência.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        {isAdmin && (
                            <CardFooter className="bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 justify-end py-4">
                                <Button type="submit" disabled={isPending} className="font-bold gap-2">
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Salvar Agência
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                </form>
            </TabsContent>

            {isAdmin && (
                <TabsContent value="finance" className="animate-in fade-in slide-in-from-bottom-2 duration-400">
                    <form onSubmit={handleFinancialSubmit}>
                        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
                            <CardHeader className="bg-emerald-900 text-white border-b border-emerald-800">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Coins className="h-5 w-5 text-emerald-400" />
                                    Ajustes Financeiros & Comissões
                                </CardTitle>
                                <CardDescription className="text-emerald-100/70">
                                    Defina as porcentagens padrão de comissão e as regras de split para sua agência.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8 pt-6">
                                {/* Base Commission */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                                        <Receipt className="h-4 w-4" />
                                        Taxas de Corretagem Padrão
                                    </h3>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="default_commission_rate" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Comissão de Venda (%)</Label>
                                            <div className="relative">
                                                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                                                <Input 
                                                    id="default_commission_rate" 
                                                    name="default_commission_rate" 
                                                    type="number"
                                                    step="0.01"
                                                    defaultValue={agency.default_commission_rate || 6.00} 
                                                    className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-bold text-lg" 
                                                />
                                            </div>
                                            <p className="text-[10px] text-zinc-400">Utilizada para preencher automaticamente novos anúncios.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Splits Section */}
                                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900 space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        Divisão de Receita (Internal Split)
                                    </h3>
                                    
                                    <div className="grid gap-6 sm:grid-cols-3">
                                        <div className="space-y-2 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                            <Label htmlFor="split_agency" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Sua Imobiliária</Label>
                                            <div className="relative mt-1">
                                                <Input 
                                                    id="split_agency" 
                                                    name="split_agency" 
                                                    type="number"
                                                    step="0.1"
                                                    defaultValue={agency.split_agency || 50.0} 
                                                    className="bg-transparent border-none text-2xl font-black p-0 h-auto focus-visible:ring-0" 
                                                />
                                                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-300 font-black text-xl">%</span>
                                            </div>
                                            <div className="text-[10px] text-zinc-500 mt-2">Retenção da agência sobre a comissão recebida.</div>
                                        </div>

                                        <div className="space-y-2 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                            <Label htmlFor="split_captador" className="text-[10px] font-black uppercase tracking-widest text-primary/70">Captador do Imóvel</Label>
                                            <div className="relative mt-1">
                                                <Input 
                                                    id="split_captador" 
                                                    name="split_captador" 
                                                    type="number"
                                                    step="0.1"
                                                    defaultValue={agency.split_captador || 25.0} 
                                                    className="bg-transparent border-none text-2xl font-black p-0 h-auto focus-visible:ring-0 text-primary" 
                                                />
                                                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-primary/30 font-black text-xl">%</span>
                                            </div>
                                            <div className="text-[10px] text-primary/60 mt-2">Parte destinada ao corretor que trouxe o imóvel.</div>
                                        </div>

                                        <div className="space-y-2 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                                            <Label htmlFor="split_vendedor" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Corretor Vendedor</Label>
                                            <div className="relative mt-1">
                                                <Input 
                                                    id="split_vendedor" 
                                                    name="split_vendedor" 
                                                    type="number"
                                                    step="0.1"
                                                    defaultValue={agency.split_vendedor || 25.0} 
                                                    className="bg-transparent border-none text-2xl font-black p-0 h-auto focus-visible:ring-0 text-white" 
                                                />
                                                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-700 font-black text-xl">%</span>
                                            </div>
                                            <div className="text-[10px] text-zinc-400 mt-2">Parte destinada ao corretor que fechou o lead.</div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 flex gap-4">
                                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-black uppercase text-emerald-600 tracking-tight">Verificação de Total</h4>
                                            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                                                Certifique-se de que a soma dos três campos de split (Imobiliária + Captador + Vendedor) seja igual a **100%**. 
                                                Estes valores serão usados no novo módulo de Transações.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 justify-end py-4">
                                <Button type="submit" disabled={isPending} className="font-bold gap-2">
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Salvar Regras Financeiras
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </TabsContent>
            )}

            {isAdmin && (
                <TabsContent value="hunter" className="animate-in fade-in slide-in-from-bottom-2 duration-400">
                    <form onSubmit={handleHunterSubmit}>
                        {/* Agent Selector */}
                        <div className="flex items-center gap-3 mb-6 flex-wrap">
                            {agents.map(agent => (
                                <button
                                    key={agent.id}
                                    type="button"
                                    onClick={() => setSelectedAgentId(agent.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 text-sm font-bold transition-all ${
                                        selectedAgentId === agent.id
                                            ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/5'
                                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950'
                                    }`}
                                >
                                    <div className={`h-2 w-2 rounded-full ${agent.is_active ? 'bg-green-500 animate-pulse' : 'bg-zinc-300'}`} />
                                    {agent.name || 'Agente'}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={handleNewAgent}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 border-dashed text-sm font-bold transition-all ${
                                    selectedAgentId === null && agents.length > 0
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                                }`}
                            >
                                <PlusCircle className="h-4 w-4" />
                                Novo Agente Especialista
                            </button>
                        </div>

                        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-950 overflow-hidden relative">
                            {/* Decorative Background Element */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                            
                            <CardHeader className="bg-zinc-900 text-white border-b border-zinc-800 p-8">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <div className="p-2 bg-primary/20 rounded-lg backdrop-blur-md border border-white/10">
                                                <Brain className="h-6 w-6 text-primary" />
                                            </div>
                                            <input
                                                name="agent_name"
                                                defaultValue={selectedAgent?.name || ''}
                                                key={`name-${selectedAgentId}`}
                                                placeholder="Nome do Agente (ex: Especialista Jardins)"
                                                className="bg-transparent border-none text-2xl font-black text-white placeholder:text-zinc-600 focus:outline-none w-full tracking-tight"
                                            />
                                        </div>
                                        <CardDescription className="text-zinc-400 font-medium">
                                            Módulo de Prospecção Ativa com Inteligência Geográfica e Scoring de Liquidez.
                                        </CardDescription>
                                    </div>
                                    <div className="flex flex-col items-end gap-3">
                                        <div className="flex items-center gap-3 bg-zinc-800/50 backdrop-blur-md p-2 rounded-2xl border border-zinc-700/50">
                                            <Switch
                                                name="is_active"
                                                defaultChecked={selectedAgent?.is_active !== false}
                                                key={`active-${selectedAgentId}`}
                                            />
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2 text-zinc-300">
                                                {selectedAgent?.is_active !== false ? 'OPERACIONAL' : 'PAUSADO'}
                                            </span>
                                        </div>
                                        {selectedAgentId && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteAgent(selectedAgentId)}
                                                className="text-[10px] font-bold text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors px-2"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                                REMOVER AGENTE
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-8 space-y-10">
                                {/* Section 1: Target & Geography */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-8 w-1 bg-primary rounded-full" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                            <Search className="h-4 w-4 text-primary" />
                                            Estratégia Geográfica
                                        </h3>
                                    </div>
                                    
                                    <div className="grid gap-8 sm:grid-cols-2">
                                        <div className="space-y-3 sm:col-span-2">
                                            <Label htmlFor="locations" className="text-xs font-black uppercase tracking-widest text-zinc-400">Regiões de Prospecção (Vírgula para múltiplos)</Label>
                                            <div className="relative group">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300 group-focus-within:text-primary transition-colors" />
                                                <Input 
                                                    id="locations" 
                                                    name="locations" 
                                                    defaultValue={selectedAgent?.locations?.join(', ') || ''} 
                                                    key={`locations-${selectedAgentId}`}
                                                    placeholder="Ex: Pinheiros, Vila Madalena, Itaim Bibi"
                                                    className="pl-11 h-12 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-bold text-base rounded-xl transition-all focus:ring-primary/20" 
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Tipologias Focais</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {['Apartamento', 'Casa', 'Sobrado', 'Terreno', 'Comercial', 'Cobertura'].map(type => (
                                                    <div key={type} className="flex items-center space-x-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50 hover:border-primary/30 transition-all cursor-pointer">
                                                        <Checkbox 
                                                            id={`type-${type}`} 
                                                            name="property_types" 
                                                            value={type}
                                                            defaultChecked={selectedAgent?.property_types?.includes(type)}
                                                            key={`type-${type}-${selectedAgentId}`}
                                                            className="h-5 w-5 border-2"
                                                        />
                                                        <label htmlFor={`type-${type}`} className="text-sm font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">{type}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Configurações Base</Label>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-xs font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">Direto com Dono</span>
                                                        <span className="text-[10px] text-zinc-500">Filtrar apenas anúncios particulares</span>
                                                    </div>
                                                    <Switch 
                                                        name="only_direct_owner" 
                                                        defaultChecked={selectedAgent?.only_direct_owner !== false}
                                                        key={`direct-${selectedAgentId}`}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-xs font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 text-emerald-500">Notificar via WhatsApp</span>
                                                        <span className="text-[10px] text-zinc-500">Receba alertas em tempo real no Zap</span>
                                                    </div>
                                                    <Switch 
                                                        name="whatsapp_notifications" 
                                                        defaultChecked={selectedAgent?.whatsapp_notifications === true}
                                                        key={`whatsapp-${selectedAgentId}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Intel & Frequency */}
                                <div className="space-y-6 pt-10 border-t border-zinc-100 dark:border-zinc-900">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-8 w-1 bg-amber-500 rounded-full" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-amber-500" />
                                            Inteligência & Desempenho
                                        </h3>
                                    </div>

                                    <div className="grid gap-8 sm:grid-cols-3">
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Frequência de Busca</Label>
                                            <select 
                                                name="frequency"
                                                defaultValue={selectedAgent?.frequency || '24h'}
                                                key={`freq-${selectedAgentId}`}
                                                className="w-full h-12 px-4 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-bold text-sm focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="1h">🚀 MODO TURBO (A cada 1h)</option>
                                                <option value="6h">A cada 6 horas</option>
                                                <option value="12h">A cada 12 horas</option>
                                                <option value="24h">Uma vez ao dia (Padrão)</option>
                                            </select>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Liquidez Mínima (Score)</Label>
                                            <div className="relative group">
                                                <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300" />
                                                <Input 
                                                    name="min_liquidity_score" 
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    defaultValue={selectedAgent?.min_liquidity_score || 0} 
                                                    key={`score-${selectedAgentId}`}
                                                    placeholder="0-100"
                                                    className="pl-11 h-12 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-black text-lg transition-all" 
                                                />
                                            </div>
                                            <p className="text-[10px] text-zinc-400 font-bold">Ignorar imóveis abaixo deste score IA.</p>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Status do Motor</Label>
                                            <div className="h-12 flex items-center gap-3 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                                <div className="relative flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                                </div>
                                                <span className="text-[10px] font-black tracking-widest text-zinc-600 dark:text-zinc-400 uppercase">Aguardando Ciclo</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 sm:col-span-3">
                                            <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Fontes & Portais de Prospecção</Label>
                                            <div className="flex flex-wrap gap-3">
                                                {['OLX', 'VivaReal', 'Zap', 'Marketplace', 'Properati'].map(source => (
                                                    <div key={source} className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:shadow-md transition-all">
                                                        <Checkbox 
                                                            id={`source-${source}`} 
                                                            name="sources" 
                                                            value={source.toLowerCase()}
                                                            defaultChecked={selectedAgent?.sources?.includes(source.toLowerCase()) || (source === 'OLX' && !selectedAgent?.sources)}
                                                            key={`source-${source}-${selectedAgentId}`}
                                                        />
                                                        <label htmlFor={`source-${source}`} className="text-sm font-black text-zinc-800 dark:text-zinc-200 cursor-pointer">{source}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3 sm:col-span-3">
                                            <Label htmlFor="negative_keywords" className="text-xs font-black uppercase tracking-widest text-zinc-400">Filtro de Exclusão (Palavras-chave negativas)</Label>
                                            <textarea 
                                                id="negative_keywords"
                                                name="negative_keywords"
                                                defaultValue={selectedAgent?.negative_keywords?.join(', ') || ''}
                                                key={`neg-${selectedAgentId}`}
                                                placeholder="Ex: Leilão, Ocupado, Somente à vista, Direitos, Judicial"
                                                className="flex min-h-[80px] w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold ring-offset-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-zinc-800 dark:bg-zinc-900 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-600 shadow-inner"
                                            />
                                            <p className="text-[10px] text-zinc-500 font-medium">O robô ignorará automaticamente anúncios que contenham estes termos no título ou descrição.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 p-8 flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-tight text-zinc-500 max-w-[300px]">
                                        Suas configurações são processadas pelo motor neural. Alterações podem levar até 5 minutos para refletir no ciclo de rastreio.
                                    </p>
                                </div>
                                <Button type="submit" size="lg" disabled={isPending} className="font-black gap-2 h-14 px-10 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all text-base">
                                    {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                    SALVAR E ATUALIZAR AGENTE
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </TabsContent>
            )}

            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-900 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                    <Shield className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Privacidade e Segurança</h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                        Seus dados são criptografados e o acesso é restrito pela sua organização. 
                        Para redefinir sua senha, você receberá um link seguro no seu e-mail cadastrado.
                    </p>
                </div>
            </div>
        </Tabs>
    )
}
