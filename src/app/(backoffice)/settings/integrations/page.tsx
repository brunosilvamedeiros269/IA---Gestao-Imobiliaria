import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExternalLink, Copy, CheckCircle2, Globe, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function IntegrationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('users_profile')
        .select('*, agencies(slug, name)')
        .eq('id', user.id)
        .single()

    const agency = (profile?.agencies as any)
    const xmlUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL || 'imob.ai'}/api/portals/${agency?.slug}/vrsync.xml`

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                    <Globe className="h-8 w-8 text-primary" />
                    Integrações externa
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                    Conecte seu inventário com os maiores portais imobiliários do Brasil.
                </p>
            </div>

            <div className="grid gap-6">
                {/* XML Feed Card */}
                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-lg">
                                    <Zap className="h-5 w-5 text-indigo-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Feed XML (Padrão VR-Sync)</CardTitle>
                                    <CardDescription>Sincronize com Zap, VivaReal e OLX</CardDescription>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-none font-bold">
                                ATIVO
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Seu Link de Integração</label>
                            <div className="flex gap-2">
                                <Input 
                                    readOnly 
                                    value={xmlUrl} 
                                    className="bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-mono text-xs"
                                />
                                <Button variant="outline" className="shrink-0 gap-2 border-zinc-200 dark:border-zinc-800">
                                    <Copy className="h-4 w-4" />
                                    Copiar
                                </Button>
                            </div>
                        </div>

                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-3">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Como utilizar?
                            </h4>
                            <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-2 list-disc pl-4">
                                <li>Acesse sua conta no **ZAP / VivaReal**.</li>
                                <li>Vá para a seção de **Carga de Dados / Integrações**.</li>
                                <li>Selecione a opção **VrSync XML**.</li>
                                <li>Cole o link acima e salve as configurações.</li>
                                <li>Os imóveis ativos serão atualizados automaticamente a cada 24h.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Comming Soon Integrations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70 grayscale">
                    <Card className="border-dashed border-zinc-300 dark:border-zinc-700 bg-transparent">
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-zinc-400" />
                                Facebook Marketplace
                            </CardTitle>
                            <CardDescription className="text-[10px]">Em breve: Exportação direta</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="border-dashed border-zinc-300 dark:border-zinc-700 bg-transparent">
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-zinc-400" />
                                Mercado Livre
                            </CardTitle>
                            <CardDescription className="text-[10px]">Em breve: Integração via API</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </div>
    )
}
