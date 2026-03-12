'use client'

import { useState, useTransition } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Shield, User, Loader2 } from 'lucide-react'
import { updateMemberRole } from './actions'
import { toast } from 'sonner'

interface MemberActionsButtonProps {
    memberId: string
    currentRole: 'admin' | 'broker'
    isCurrentUser: boolean
}

export function MemberActionsButton({ memberId, currentRole, isCurrentUser }: MemberActionsButtonProps) {
    const [isPending, startTransition] = useTransition()

    const handleRoleChange = (newRole: 'admin' | 'broker') => {
        if (newRole === currentRole) return

        startTransition(async () => {
            const res = await updateMemberRole(memberId, newRole)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success(`Cargo atualizado para ${newRole === 'admin' ? 'Administrador' : 'Corretor'}`)
            }
        })
    }

    if (isCurrentUser) return null

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                    <span className="sr-only">Abrir menu</span>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => handleRoleChange('admin')}
                    disabled={currentRole === 'admin'}
                    className="gap-2"
                >
                    <Shield className="h-4 w-4 text-primary" />
                    Tornar Administrador
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleRoleChange('broker')}
                    disabled={currentRole === 'broker'}
                    className="gap-2"
                >
                    <User className="h-4 w-4 text-zinc-500" />
                    Tornar Corretor
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
