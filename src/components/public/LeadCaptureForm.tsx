'use client'

import { useState } from 'react'
import { submitPublicLead } from '@/app/(public)/[agencySlug]/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Send, CheckCircle2, Loader2, User, Phone, Mail, MessageSquare, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeadCaptureFormProps {
    agencyId: string
    propertyId?: string
    title?: string
    subtitle?: string
    compact?: boolean
}

export function LeadCaptureForm({ agencyId, propertyId, title, subtitle, compact = false }: LeadCaptureFormProps) {
    const [isPending, setIsPending] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsPending(true)

        const formData = new FormData(e.currentTarget)
        if (propertyId) {
            formData.append('property_id', propertyId)
        }

        const result = await submitPublicLead(agencyId, formData)

        setIsPending(false)
        if (result.success) {
            setIsSuccess(true)
            toast.success('Contato enviado com sucesso!')
        } else {
            toast.error(result.error || 'Erro ao enviar contato.')
        }
    }

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900/30 animate-in zoom-in duration-500">
                <div className="h-20 w-20 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                    <CheckCircle2 size={40} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tighter">Solicitação Recebida!</h3>
                    <p className="text-zinc-600 dark:text-zinc-400 font-medium max-w-[280px] mx-auto">
                        Um de nossos especialistas entrará em contato com você em breve.
                    </p>
                </div>
                <Button 
                    variant="ghost" 
                    onClick={() => setIsSuccess(false)}
                    className="font-bold text-emerald-700 hover:bg-emerald-100 rounded-full"
                >
                    Enviar outra mensagem
                </Button>
            </div>
        )
    }

    return (
        <div className={cn(
            "w-full relative overflow-hidden transition-all",
            !compact && "bg-white dark:bg-zinc-950 p-8 md:p-12 rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-zinc-100 dark:border-zinc-800"
        )}>
            {/* Value Props & Header */}
            <div className="relative z-10 space-y-8">
                {(title || subtitle) && (
                    <div className="space-y-3 text-center md:text-left border-b border-zinc-50 pb-8">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 uppercase leading-[0.9]">
                            {title || 'Fale com um especialista'}
                        </h2>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg leading-snug">
                            {subtitle || 'Deixe seus dados e receba o material completo deste imóvel ainda hoje.'}
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
                                <User className="h-3 w-3" /> Nome Completo
                            </label>
                            <div className="relative group">
                                <Input 
                                    name="name" 
                                    required 
                                    placeholder="Como prefere ser chamado?" 
                                    className="h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all px-6 font-bold text-zinc-900 dark:text-white placeholder:text-zinc-300 shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Phone Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
                                <Phone className="h-3 w-3" /> Telefone / WhatsApp
                            </label>
                            <div className="relative group">
                                <Input 
                                    name="phone" 
                                    required 
                                    placeholder="(00) 00000-0000" 
                                    className="h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all px-6 font-bold text-zinc-900 dark:text-white placeholder:text-zinc-300 shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
                                <Mail className="h-3 w-3" /> E-mail Profissional
                            </label>
                            <div className="relative group">
                                <Input 
                                    name="email" 
                                    type="email" 
                                    placeholder="seu@dominio.com" 
                                    className="h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all px-6 font-bold text-zinc-900 dark:text-white placeholder:text-zinc-300 shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Message Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
                                <MessageSquare className="h-3 w-3" /> Como podemos ajudar?
                            </label>
                            <Textarea 
                                name="message" 
                                placeholder="Dúvidas, agendamentos ou propostas..." 
                                className="min-h-[140px] rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all px-6 py-5 font-bold text-zinc-900 dark:text-white placeholder:text-zinc-300 resize-none shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <Button 
                            type="submit" 
                            disabled={isPending}
                            className="w-full h-18 py-8 rounded-[1.5rem] bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-sm shadow-2xl shadow-zinc-200 group transition-all active:scale-[0.98]"
                        >
                            {isPending ? (
                                <Loader2 className="mr-3 h-6 w-6 animate-spin text-primary" />
                            ) : (
                                <div className="flex flex-col items-center">
                                    <span className="flex items-center gap-2">
                                        Solicitar Atendimento VIP <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </span>
                                    <span className="text-[8px] font-bold opacity-50 mt-1">Resposta média em 15 minutos</span>
                                </div>
                            )}
                        </Button>

                        <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                            <ShieldCheck className="h-3 w-3 text-emerald-500" /> Seus dados estão protegidos pela LGPD
                        </div>
                    </div>
                </form>
            </div>

            {/* Decorative background elements only if not compact */}
            {!compact && (
                <>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px] pointer-events-none" />
                </>
            )}
        </div>
    )
}
