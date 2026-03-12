import { getFinancialSummary } from './finance-actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
    Coins, 
    TrendingUp, 
    Users, 
    ArrowUpRight, 
    ArrowDownRight, 
    Wallet,
    Receipt,
    Search,
    Filter
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default async function FinancePage() {
    const data = await getFinancialSummary()

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
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Centro Financeiro</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">Gestão de VGV, comissões e repasses da agência.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2 font-bold">
                        <Filter className="h-4 w-4" />
                        Filtros
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2">
                        + Novo Lançamento
                    </Button>
                </div>
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
                        <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                            <ArrowUpRight className="h-3 w-3" />
                            +12.5% em relação ao mês anterior
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
                        <p className="text-[10px] text-zinc-500 font-medium mt-1">Receita líquida retida pela casa</p>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-primary" />
                            Transações Recentes
                        </CardTitle>
                        <CardDescription>Lista detalhada de vendas e locações fechadas no CRM.</CardDescription>
                    </div>
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input placeholder="Buscar transação..." className="pl-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
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
                                            Nenhuma transação registrada ainda. No CRM, feche um negócio para ver os dados aqui.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-zinc-400">
                                                {new Date(tx.closing_date).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-zinc-900 dark:text-zinc-100">{tx.property?.title}</div>
                                                <div className="text-xs text-zinc-500 flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {tx.lead?.name}
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
