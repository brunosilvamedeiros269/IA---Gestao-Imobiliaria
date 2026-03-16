'use client'

import { useState } from 'react'
import { submitPublicLead } from '@/app/(public)/[agencySlug]/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Send, CheckCircle2, Loader2 } from 'lucide-react'

interface LeadCaptureFormProps {
    agencyId: string
    propertyId?: string
    title?: string
    subtitle?: string
}

export function LeadCaptureForm({ agencyId, propertyId, title, subtitle }: LeadCaptureFormProps) {
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
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900/30 animate-in zoom-in duration-500">
                <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={32} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tighter">Mensagem Enviada!</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                        Obrigado pelo interesse. Nossa equipe entrará em contato com você em breve.
                    </p>
                </div>
                <Button 
                    variant="outline" 
                    onClick={() => setIsSuccess(false)}
                    className="rounded-full font-bold border-zinc-200 dark:border-zinc-800"
                >
                    Enviar outra mensagem
                </Button>
            </div>
        )
    }

    return (
        <div className="w-full bg-white dark:bg-zinc-950 p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-800 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

            <div className="relative z-10 space-y-8">
                <div className="space-y-2 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 uppercase leading-none">
                        {title || 'Fale com um especialista'}
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                        {subtitle || 'Deixe seus dados e retornaremos ainda hoje.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Nome Completo</label>
                            <Input 
                                name="name" 
                                required 
                                placeholder="Seu nome..." 
                                className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-none focus-visible:ring-2 focus-visible:ring-primary px-6 font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Telefone / WhatsApp</label>
                            <Input 
                                name="phone" 
                                required 
                                placeholder="(00) 00000-0000" 
                                className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-none focus-visible:ring-2 focus-visible:ring-primary px-6 font-bold"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">E-mail (Opcional)</label>
                        <Input 
                            name="email" 
                            type="email" 
                            placeholder="seu@email.com" 
                            className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-none focus-visible:ring-2 focus-visible:ring-primary px-6 font-bold"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Como podemos ajudar?</label>
                        <Textarea 
                            name="message" 
                            placeholder="Conte-nos um pouco sobre o que você procura..." 
                            className="min-h-[120px] rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 border-none focus-visible:ring-2 focus-visible:ring-primary px-6 py-4 font-bold resize-none"
                        />
                    </div>

                    <Button 
                        type="submit" 
                        disabled={isPending}
                        className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-tighter text-lg shadow-xl shadow-primary/20 group transition-all"
                    >
                        {isPending ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                                Quero ser atendido
                            </>
                        )}
                    </Button>
                </form>

                <p className="text-[10px] text-zinc-400 text-center font-bold uppercase tracking-widest">
                    Ao enviar, você concorda com nossos termos de privacidade.
                </p>
            </div>
        </div>
    )
}
