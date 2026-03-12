import { login } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message: string }>
}) {
    const { message } = await searchParams

    return (
        <div className="flex h-screen w-full items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Acesso ao Painel</CardTitle>
                    <CardDescription>
                        Insira seu e-mail abaixo para logar na sua agência imobiliária.
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
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Senha</Label>
                            </div>
                            <Input id="password" name="password" type="password" required />
                        </div>

                        <Button formAction={login} className="w-full mt-4">
                            Entrar
                        </Button>
                    </form>

                    <div className="text-center mt-4 border-t pt-4">
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/signup">Criar Nova Agência</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
