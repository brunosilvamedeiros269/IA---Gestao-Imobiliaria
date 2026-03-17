'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Building2,
    Users,
    Home,
    Settings,
    Inbox,
    Target,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Coins,
    Globe
} from 'lucide-react'
import { useState } from 'react'
import { hasPermission, UserRole } from '@/utils/rbac'

export function Sidebar({ agency, role }: { agency: any, role: string }) {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    const navigation = [
        { name: 'Início', href: '/', icon: Home },
        { name: 'Inventário', href: '/inventory', icon: Building2 },
        { name: 'Leads (CRM)', href: '/crm', icon: Inbox },
        { name: 'Radar de Mercado', href: '/hunter', icon: Target },
        ...(hasPermission(role as UserRole, 'view_finance') ? [
            { name: 'Financeiro', href: '/finance', icon: Coins },
        ] : []),
        ...(hasPermission(role as UserRole, 'manage_team') ? [
            { name: 'Equipe', href: '/team', icon: Users },
        ] : []),
        ...(hasPermission(role as UserRole, 'manage_settings') ? [
            { name: 'Integrações', href: '/settings/integrations', icon: Globe },
            { name: 'Configurações', href: '/settings', icon: Settings },
        ] : []),
    ]

    return (
        <div className={`flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
            <div className="flex h-16 items-center flex-shrink-0 px-4 justify-between border-b border-zinc-100 dark:border-zinc-800">
                {!collapsed && (
                    <Link href="/" className="flex items-center gap-2 overflow-hidden whitespace-nowrap hover:opacity-80 transition-opacity">
                        <div className="flex bg-primary/10 p-1.5 rounded-md text-primary shrink-0">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-sm truncate">{agency?.name || 'Imobiliária'}</span>
                    </Link>
                )}
                {collapsed && (
                    <Link href="/" className="flex w-full justify-center hover:opacity-80 transition-opacity">
                        <Building2 className="h-6 w-6 text-primary" />
                    </Link>
                )}

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 ${collapsed ? 'hidden' : ''}`}
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
            </div>

            <nav className="flex-1 space-y-1 px-2 py-4 mt-2 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                                } ${collapsed ? 'justify-center' : ''}`}
                            title={collapsed ? item.name : undefined}
                        >
                            <item.icon
                                className={`flex-shrink-0 ${collapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'} ${isActive ? 'text-primary' : 'text-zinc-400 group-hover:text-zinc-500 dark:group-hover:text-zinc-300'
                                    }`}
                                aria-hidden="true"
                            />
                            {!collapsed && <span>{item.name}</span>}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
                <form action="/auth/signout" method="post">
                    <button
                        type="submit"
                        className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ${collapsed ? 'justify-center' : ''}`}
                        title={collapsed ? 'Sair' : undefined}
                    >
                        <LogOut className={`flex-shrink-0 ${collapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'}`} />
                        {!collapsed && <span>Sair da conta</span>}
                    </button>
                </form>
            </div>
        </div>
    )
}
