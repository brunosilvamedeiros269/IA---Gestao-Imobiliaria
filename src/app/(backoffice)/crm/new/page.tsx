import { getActiveProperties } from '../actions'
import { NewLeadForm } from './new-lead-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewLeadPage() {
    // Fetch properties to feed the "Property of Interest" dropdown
    const properties = await getActiveProperties()

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <Link
                    href="/crm"
                    className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para o Pipeline
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Novo Lead
                </h1>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    Registre um novo cliente no seu funil de vendas.
                </p>
            </div>

            <NewLeadForm properties={properties} />
        </div>
    )
}
