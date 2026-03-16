'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitPublicLead(agencyId: string, formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const email = formData.get('email') as string || null
    const phone = formData.get('phone') as string || null
    const message = formData.get('message') as string || ''
    const propertyId = formData.get('property_id') as string || null

    if (!name || !phone) {
        return { error: 'Nome e telefone são obrigatórios.' }
    }

    const { error } = await supabase
        .from('leads')
        .insert({
            agency_id: agencyId,
            property_id: propertyId,
            name,
            email,
            phone,
            source: message ? `Portal Público: ${message}` : 'Portal Público',
            funnel_status: 'new',
            urgency_score: 3 // Score inicial médio para contatos diretos
        })

    if (error) {
        console.error('Failed to submit lead:', error)
        return { error: 'Ocorreu um erro ao enviar seus dados. Tente novamente em alguns instantes.' }
    }

    return { success: true }
}
