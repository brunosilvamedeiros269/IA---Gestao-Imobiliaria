import { getFinancialSummary } from './finance-actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
    Coins, 
    TrendingUp, 
    Users, 
    ArrowUpRight, 
    Wallet,
    Receipt
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FinanceHeaderActions } from './finance-header-actions'
import { FinanceFilters } from './finance-filters'

interface FinancePageProps {
    searchParams: Promise<{
        search?: string
        status?: string
        type?: string
    }>
}

export default async function FinancePage({ searchParams }: FinancePageProps) {
    const resolvedParams = await searchParams
    const data = await getFinancialSummary(resolvedParams)

    if (!data) return <div>Carregando...</div>

    const { transactions, summary } = data

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">Centro Financeiro</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">Gestão de VGV, comissões e repasses da agência.</p>
                </div>
                <FinanceHeaderActions />
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm bg-white dark:bg-zinc-950 overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">VGV Total</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{formatCurrency(summary.vgv)}</div>
                        <p className="text-[10px] text-zinc-400 font-bold flex items-center gap-1 mt-1 uppercase">
                            Volume Geral de Vendas no período
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white dark:bg-zinc-950 overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Comissão Bruta</CardTitle>
                        <Coins className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{formatCurrency(summary.commissionTotal)}</div>
                        <p className="text-[10px] text-zinc-500 font-medium mt-1">
                            Média de {(summary.commissionTotal / (summary.vgv || 1) * 100).toFixed(1)}% por transação
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white dark:bg-zinc-950 overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Repasses (Corretores)</CardTitle>
                        <Users className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{formatCurrency(summary.repasses)}</div>
                        <p className="text-[10px] text-amber-600 font-bold mt-1 uppercase tracking-tighter">Aguardando Pagamento</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-zinc-900 text-white overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Lucro da Agência</CardTitle>
                        <Wallet className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-emerald-400">{formatCurrency(summary.netAgency)}</div>
                        <p className="text-[10px] text-zinc-500 font-medium mt-1">Receita líquida da casa</p>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50 p-6">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-primary" />
                            Transações
                        </CardTitle>
                        <CardDescription>Lista detalhada de vendas e locações fechadas.</CardDescription>
                    </div>
                    <div className="flex-1 max-w-2xl">
                        <FinanceFilters />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-50/30 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-900">
                                <tr>
                                    <th className="px-6 py-4">Data</th>
                                    <th className="px-6 py-4">Imóvel / Lead</th>
                                    <th className="px-6 py-4">Valor Total</th>
                                    <th className="px-6 py-4">Comissão</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-medium">
                                            {Object.keys(resolvedParams).length > 0 
                                                ? 'Nenhuma transação encontrada para estes filtros.' 
                                                : 'Nenhuma transação registrada ainda.'}
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-zinc-400">
                                                {new Date(tx.closing_date).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight line-clamp-1">{tx.property?.title}</div>
                                                <div className="text-xs text-zinc-500 flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {tx.lead?.name || 'Cliente Direto'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-black">
                                                {formatCurrency(tx.total_value)}
                                                <Badge variant="outline" className="ml-2 text-[8px] font-black uppercase tracking-tighter px-1.5 py-0 h-4 border-zinc-200">
                                                    {tx.type === 'sale' ? 'Venda' : 'Locação'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(tx.commission_total)}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className={`font-black uppercase tracking-widest text-[9px] ${
                                                    tx.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                                                    tx.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {tx.status === 'paid' ? 'Pago' : tx.status === 'pending' ? 'Pendente' : 'Cancelado'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" className="font-bold text-primary">Ver Detalhes</Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
