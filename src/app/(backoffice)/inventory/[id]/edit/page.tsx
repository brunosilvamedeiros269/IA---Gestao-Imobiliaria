import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EditPropertyForm } from './edit-form'

interface PageProps {
    params: {
        id: string
    }
}

export default async function EditPropertyPage({ params }: PageProps) {
    const supabase = await createClient()
    const resolvedParams = await params

    const { data: property, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', resolvedParams.id)
        .single()

    if (error || !property) {
        return notFound()
    }

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto w-full pb-12">
            <div className="flex items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <Button variant="outline" size="icon" asChild className="h-9 w-9">
                    <Link href={`/inventory/${property.id}`}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">Editar Imóvel</h1>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Atualize as informações, status e gerencie a galeria de fotos deste imóvel.
                    </p>
                </div>
            </div>

            <EditPropertyForm property={property} />
        </div>
    )
}
