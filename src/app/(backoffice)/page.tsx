import { getDashboardMetrics } from './dashboard-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Building2,
    Inbox,
    UserPlus,
    Home,
    TrendingUp,
    ChevronRight,
    Search,
    PlusCircle,
    Clock
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function DashboardPage() {
    const metrics = await getDashboardMetrics()

    // Helper to get max count for funnel scaling
    const maxFunnelCount = Math.max(...metrics.funnelDistribution.map(d => d.count), 1)

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header com Boas-vindas */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Olá, {metrics.agentName}! 👋
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Aqui está o resumo da sua operação imobiliária hoje.
                </p>
            </div>

            {/* Métrica Row */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="relative overflow-hidden border-none shadow-lg shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500">Imóveis Ativos</CardTitle>
                        <Home className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.activeProperties}</div>
                        <p className="text-[10px] text-zinc-400 mt-1 flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                            Gestão da carteira ativa
                        </p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-none shadow-lg shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500">Novos Leads (Mês)</CardTitle>
                        <Inbox className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.newLeads}</div>
                        <p className="text-[10px] text-zinc-400 mt-1 flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                            Novas oportunidades este mês
                        </p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-none shadow-lg shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500">Atendimentos Ativos</CardTitle>
                        <Building2 className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.activeServices}</div>
                        <p className="text-[10px] text-zinc-400 mt-1">Conduzindo oportunidades no funil</p>
                    </CardContent>
                </Card>
            </div>

            {/* Ações Rápidas Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    Ações Rápidas
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <Link href="/inventory/new" className="group">
                        <Card className="border-none shadow-md hover:shadow-xl transition-all hover:translate-y-[-2px] bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-900/50 cursor-pointer overflow-hidden relative">
                            <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                <PlusCircle size={100} />
                            </div>
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Home className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Novo Imóvel</h3>
                                    <p className="text-sm text-zinc-500">Cadastrar uma nova captação na carteira</p>
                                </div>
                                <ChevronRight className="ml-auto h-5 w-5 text-zinc-300 group-hover:text-primary transition-colors" />
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/crm/new" className="group">
                        <Card className="border-none shadow-md hover:shadow-xl transition-all hover:translate-y-[-2px] bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-900/50 cursor-pointer overflow-hidden relative">
                            <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                <UserPlus size={100} />
                            </div>
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <UserPlus className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Adicionar Lead</h3>
                                    <p className="text-sm text-zinc-500">Registrar um novo interessado ou oportunidade</p>
                                </div>
                                <ChevronRight className="ml-auto h-5 w-5 text-zinc-300 group-hover:text-indigo-500 transition-colors" />
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>

            {/* Funil de Vendas Visual & Atividade Recente */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold">Atividade Recente</CardTitle>
                        <Button variant="ghost" size="sm" className="text-xs text-primary" asChild>
                            <Link href="/crm">Ver Pipeline</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            {metrics.recentActivity.length > 0 ? (
                                metrics.recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border border-zinc-50 dark:border-zinc-900">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                        <div className="flex-1">
                                            <p className="text-xs font-bold">{activity.title}</p>
                                            <p className="text-[10px] text-zinc-400">
                                                {formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: ptBR })}
                                            </p>
                                        </div>
                                        <Link href={`/crm/${activity.id}`}>
                                            <ChevronRight className="h-3 w-3 text-zinc-300 hover:text-primary transition-colors" />
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-zinc-500 text-center py-4">Nenhuma atividade recente encontrada.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold">Distribuição do Funil</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[200px] flex flex-col justify-end gap-2">
                        <div className="flex items-end gap-1 h-32">
                            {metrics.funnelDistribution.map((d, i) => (
                                <div 
                                    key={d.status} 
                                    className={`flex-1 rounded-t-sm relative group transition-all duration-500 ${
                                        i === 0 ? 'bg-primary/20' : 
                                        i === 1 ? 'bg-indigo-500/20' :
                                        i === 2 ? 'bg-purple-500/20' :
                                        i === 3 ? 'bg-green-500/20' : 'bg-red-500/20'
                                    }`}
                                    style={{ height: `${(d.count / maxFunnelCount) * 100 || 5}%` }}
                                >
                                    <div className="absolute bottom-full left-0 w-full text-center text-[10px] mb-1 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                                        {d.count}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-5 gap-1 text-[8px] font-bold uppercase text-zinc-500 text-center">
                            <span>Novo</span>
                            <span>Proc.</span>
                            <span>Visita</span>
                            <span>Ganho</span>
                            <span>Perda</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
