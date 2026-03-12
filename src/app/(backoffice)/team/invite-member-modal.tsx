'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Loader2, Mail, ShieldCheck } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { inviteTeamMember } from './actions'

export function InviteMemberModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const role = formData.get('role') as 'admin' | 'broker'

        try {
            const res = await inviteTeamMember(email, role)

            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success('Convite enviado com sucesso para ' + email)
                setIsOpen(false)
            }
        } catch (error) {
            toast.error('Erro inesperado ao enviar convite.')
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 font-bold shadow-lg shadow-primary/20">
                    <UserPlus className="h-4 w-4" />
                    Convidar Corretor
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-none shadow-2xl rounded-2xl overflow-hidden p-0">
                <div className="bg-primary/5 p-6 border-b border-zinc-100 dark:border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            Convidar para a Equipe
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500 text-xs">
                            O usuário receberá um e-mail para ativar sua conta e definir uma senha.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleInvite} className="p-6 space-y-4 bg-white dark:bg-zinc-950">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            E-mail do Corretor
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="exemplo@imobiliaria.com"
                            required
                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Cargo Sugerido</Label>
                        <Select name="role" defaultValue="broker">
                            <SelectTrigger className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                <SelectValue placeholder="Selecione um cargo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="broker">Corretor (Padrão)</SelectItem>
                                <SelectItem value="admin">Administrador</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="font-bold min-w-[120px]">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Enviar Convite
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
