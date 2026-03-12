import Link from 'next/link'
import { Instagram, Facebook, Linkedin, MapPin, Phone, Mail } from 'lucide-react'

interface PublicFooterProps {
    agency: any
}

export function PublicFooter({ agency }: PublicFooterProps) {
    const year = new Date().getFullYear()

    return (
        <footer className="bg-zinc-950 text-white pt-20 pb-10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Branding */}
                    <div className="space-y-6 col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2">
                             {agency.logo_url ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={agency.logo_url} alt={agency.name} className="h-10 w-auto brightness-0 invert" />
                             ) : (
                                <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
                                    <span className="text-white font-black text-xl uppercase">{agency.name.charAt(0)}</span>
                                </div>
                             )}
                             <span className="text-xl font-black tracking-tight">{agency.name}</span>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            {agency.tagline || 'Sua parceira ideal para encontrar o imóvel dos seus sonhos com inteligência e transparência.'}
                        </p>
                        <div className="flex gap-4">
                            {agency.instagram_url && (
                                <Link href={agency.instagram_url} target="_blank" className="p-2 bg-zinc-900 rounded-full hover:bg-primary transition-colors">
                                    <Instagram className="h-5 w-5" />
                                </Link>
                            )}
                            {agency.facebook_url && (
                                <Link href={agency.facebook_url} target="_blank" className="p-2 bg-zinc-900 rounded-full hover:bg-primary transition-colors">
                                    <Facebook className="h-5 w-5" />
                                </Link>
                            )}
                            {agency.linkedin_url && (
                                <Link href={agency.linkedin_url} target="_blank" className="p-2 bg-zinc-900 rounded-full hover:bg-primary transition-colors">
                                    <Linkedin className="h-5 w-5" />
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary">Navegação</h4>
                        <nav className="flex flex-col gap-4 text-zinc-400 text-sm font-bold">
                            <Link href={`/${agency.slug}/imoveis?type=sale`} className="hover:text-white transition-colors">Comprar Imóvel</Link>
                            <Link href={`/${agency.slug}/imoveis?type=rent`} className="hover:text-white transition-colors">Aluguel Mensal</Link>
                            <Link href="#" className="hover:text-white transition-colors">Lançamentos</Link>
                            <Link href="#" className="hover:text-white transition-colors">Sobre Nós</Link>
                        </nav>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6 col-span-1 md:col-span-2">
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary">Atendimento</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex gap-4">
                                <div className="p-3 bg-zinc-900 rounded-2xl h-fit">
                                    <Phone className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Telefone</p>
                                    <p className="text-sm font-bold">{agency.phone || agency.whatsapp_number}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="p-3 bg-zinc-900 rounded-2xl h-fit">
                                    <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Localização</p>
                                    <p className="text-sm font-bold leading-tight">{agency.address || 'Consulte nosso atendimento'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    <p>© {year} {agency.name} - TODOS OS DIREITOS RESERVADOS.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-white">Políticas de Privacidade</Link>
                        <Link href="#" className="hover:text-white">Termos de Uso</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
