'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function captureLead(formData: FormData) {
    const supabase = await createClient()

    const propertyId = formData.get('property_id') as string
    const agencyId = formData.get('agency_id') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const message = formData.get('message') as string

    if (!name || !phone) {
        return { error: 'Nome e telefone são obrigatórios.' }
    }

    // 1. Create the lead
    const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert({
            agency_id: agencyId,
            property_id: propertyId,
            name,
            email,
            phone,
            source: 'Portal Público',
            funnel_status: 'new'
        })
        .select()
        .single()

    if (leadError) {
        return { error: 'Erro ao enviar interesse: ' + leadError.message }
    }

    // 2. Add an initial note with the visitor's message
    if (message) {
        // We might need a broker_id for notes, but for public portal leads
        // we can either leave it null or assign to the property's broker
        const { data: property } = await supabase
            .from('properties')
            .select('broker_id')
            .eq('id', propertyId)
            .single()

        if (property?.broker_id) {
            await supabase
                .from('lead_notes')
                .insert({
                    agency_id: agencyId,
                    lead_id: lead.id,
                    broker_id: property.broker_id,
                    content: `Mensagem do Portal: ${message}`
                })
        }
    }

    return { success: true }
}
