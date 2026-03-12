import { signup } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function SignupPage({
    searchParams,
}: {
    searchParams: Promise<{ message: string }>
}) {
    const { message } = await searchParams

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Criar Nova Agência</CardTitle>
                    <CardDescription>
                        Preencha os dados abaixo para registrar sua agência imobiliária e criar sua conta de administrador.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="grid gap-4">
                        {message && (
                            <div className="text-sm font-medium text-destructive text-center p-2 bg-destructive/10 rounded-md">
                                {message}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="agency_name">Nome Fantasia da Agência</Label>
                            <Input id="agency_name" name="agency_name" placeholder="Ex: Imobiliária Silva" required />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="agency_slug">Subdomínio (Slug)</Label>
                            <Input id="agency_slug" name="agency_slug" placeholder="Ex: silva-imoveis" required pattern="[a-z0-9-]+" title="Apenas letras minúsculas, números e hífens." />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="full_name">Seu Nome Completo</Label>
                            <Input id="full_name" name="full_name" placeholder="Ex: João Silva" required />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail Profissional</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>

                        <Button formAction={signup} className="w-full mt-2">
                            Finalizar Cadastro
                        </Button>

                        <div className="text-center text-sm mt-4">
                            Já possui uma conta?{' '}
                            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                                Faça Login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
