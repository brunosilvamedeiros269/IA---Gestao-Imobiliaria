import { getTeamMembers } from './actions'
import { createClient } from '@/utils/supabase/server'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Users,
    UserPlus,
    Search,
    Shield,
    User as UserIcon,
    ArrowRight
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { MemberActionsButton } from './member-actions-button'
import { InviteMemberModal } from './invite-member-modal'

export default async function TeamPage() {
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const members = await getTeamMembers()

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                        <Users className="h-8 w-8 text-primary" />
                        Minha Equipe
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        Gerencie os corretores e administradores da sua agência.
                    </p>
                </div>
                <InviteMemberModal />
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="Buscar por nome ou e-mail..."
                        className="pl-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                    />
                </div>
                <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <Button variant="ghost" size="sm" className="bg-white dark:bg-zinc-800 shadow-sm text-xs font-bold px-4">Todos</Button>
                    <Button variant="ghost" size="sm" className="text-zinc-500 text-xs font-bold px-4">Ativos</Button>
                    <Button variant="ghost" size="sm" className="text-zinc-500 text-xs font-bold px-4">Inativos</Button>
                </div>
            </div>

            {/* Team Table */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                        <TableRow>
                            <TableHead className="w-[40%] text-xs font-bold uppercase tracking-wider text-zinc-500">Membro</TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">Cargo</TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500 text-center">Imóveis</TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">Status</TableHead>
                            <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-zinc-500">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.map((member) => (
                            <TableRow key={member.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-white dark:border-zinc-900 shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-800">
                                            <AvatarImage src={member.avatar_url || ''} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                {member.full_name?.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                                {member.full_name}
                                                {member.id === currentUser?.id && (
                                                    <Badge variant="outline" className="text-[10px] py-0 h-4 font-normal text-zinc-400">Você</Badge>
                                                )}
                                            </span>
                                            <span className="text-xs text-zinc-500 dark:text-zinc-400">{member.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {member.role === 'admin' ? (
                                        <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold gap-1 py-1">
                                            <Shield className="h-3 w-3" />
                                            ADMIN
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 text-[10px] font-bold gap-1 py-1">
                                            <UserIcon className="h-3 w-3" />
                                            CORRETOR
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                                        {member.propertyCount}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Ativo</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2 items-center">
                                        <MemberActionsButton
                                            memberId={member.id}
                                            currentRole={member.role}
                                            isCurrentUser={member.id === currentUser?.id}
                                        />
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-primary transition-colors">
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Disclaimer or Tips */}
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <Shield className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-primary">Controle de Acesso</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                        Administradores podem gerenciar imóveis de qualquer corretor, convidar novos membros e alterar permissões.
                        Corretores têm acesso apenas aos seus próprios leads e imóveis vinculados.
                    </p>
                </div>
            </div>
        </div>
    )
}
