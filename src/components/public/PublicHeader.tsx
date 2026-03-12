'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, Phone, Search } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface PublicHeaderProps {
    agency: any
}

export function PublicHeader({ agency }: PublicHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href={`/${agency.slug}`} className="flex items-center gap-2 group">
                    {agency.logo_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={agency.logo_url} alt={agency.name} className="h-10 w-auto object-contain" />
                    ) : (
                        <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                            <span className="text-white font-black text-xl uppercase">{agency.name.charAt(0)}</span>
                        </div>
                    )}
                    <span className="text-xl font-black tracking-tight text-zinc-900 hidden sm:block">
                        {agency.name}
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href={`/${agency.slug}`} className="text-sm font-bold text-zinc-600 hover:text-primary transition-colors">Início</Link>
                    <Link href={`/${agency.slug}/imoveis?type=sale`} className="text-sm font-bold text-zinc-600 hover:text-primary transition-colors">Comprar</Link>
                    <Link href={`/${agency.slug}/imoveis?type=rent`} className="text-sm font-bold text-zinc-600 hover:text-primary transition-colors">Alugar</Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="hidden sm:flex text-zinc-500" asChild>
                        <Link href={`/${agency.slug}/imoveis`}>
                            <Search className="h-5 w-5" />
                        </Link>
                    </Button>
                    <Button className="hidden md:flex rounded-full px-6 font-bold" asChild>
                        <Link href={`https://wa.me/${agency.whatsapp_number?.replace(/\D/g, '')}`} target="_blank">
                             Falar Conosco
                        </Link>
                    </Button>
                    
                    {/* Mobile Menu Toggle */}
                    <button 
                        className="md:hidden p-2 text-zinc-600"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b shadow-xl px-4 py-8 space-y-6 animate-in slide-in-from-top duration-300">
                    <nav className="flex flex-col gap-6">
                        <Link href={`/${agency.slug}`} className="text-lg font-black text-zinc-900" onClick={() => setIsMenuOpen(false)}>Início</Link>
                        <Link href={`/${agency.slug}/imoveis?type=sale`} className="text-lg font-black text-zinc-900" onClick={() => setIsMenuOpen(false)}>Comprar Imóvel</Link>
                        <Link href={`/${agency.slug}/imoveis?type=rent`} className="text-lg font-black text-zinc-900" onClick={() => setIsMenuOpen(false)}>Aluguel Mensal</Link>
                    </nav>
                    <div className="pt-6 border-t">
                         <Button className="w-full h-14 rounded-2xl font-black text-lg" asChild>
                             <Link href={`https://wa.me/${agency.whatsapp_number?.replace(/\D/g, '')}`} target="_blank">
                                 <Phone className="mr-2 h-5 w-5" /> WhatsApp Direto
                             </Link>
                         </Button>
                    </div>
                </div>
            )}
        </header>
    )
}
