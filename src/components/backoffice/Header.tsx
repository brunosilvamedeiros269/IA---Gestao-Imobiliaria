'use client'

import { Bell, Search, User } from 'lucide-react'

export function Header({ user }: { user: { name: string, email?: string } }) {
    return (
        <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-4 items-center justify-between">
            <div className="flex flex-1">
                <div className="max-w-md w-full relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                    </div>
                    <input
                        id="search"
                        name="search"
                        className="block w-full rounded-md border-0 bg-zinc-50 dark:bg-zinc-900 py-1.5 pl-10 pr-3 text-zinc-900 dark:text-zinc-100 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                        placeholder="Busca global (leads, imóveis...)"
                        type="search"
                    />
                </div>
            </div>

            <div className="ml-4 flex items-center md:ml-6 gap-4">
                <button
                    type="button"
                    className="rounded-full bg-white dark:bg-zinc-900 p-1 text-zinc-400 hover:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                    <span className="sr-only">Ver notificações</span>
                    <Bell className="h-5 w-5" aria-hidden="true" />
                </button>

                {/* Profile dropdown stub */}
                <div className="relative ml-3 flex items-center gap-2">
                    <div className="flex flex-col text-right hidden md:block">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-none">{user.name}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{user.email}</span>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        <User className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </header>
    )
}
