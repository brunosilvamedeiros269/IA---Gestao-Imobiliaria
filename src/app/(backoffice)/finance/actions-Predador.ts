'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createManualTransaction(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await supabase
        .from('users_profile')
        .select('agency_id')
        .eq('id', user.id)
        .single()

    if (!profile?.agency_id) throw new Error('Agência não encontrada')

    const propertyId = formData.get('property_id') as string
    const leadId = formData.get('lead_id') as string || null
    const totalValue = Number(formData.get('total_value')) || 0
    const commissionRate = Number(formData.get('commission_rate')) || 6
    const type = formData.get('type') as 'sale' | 'rent'
    const closingDate = formData.get('closing_date') as string || new Date().toISOString()
    const status = formData.get('status') as 'pending' | 'paid' | 'cancelled' || 'pending'

    if (!propertyId || !totalValue) {
        return { error: 'Imóvel e valor total são obrigatórios.' }
    }

    const commissionTotal = (totalValue * commissionRate) / 100

    // Get agency split config
    const { data: agency } = await supabase
        .from('agencies')
        .select('split_agency, split_captador, split_vendedor')
        .eq('id', profile.agency_id)
        .single()

    // Create Transaction
    const { data: tx, error: txError } = await supabase
        .from('transactions')
        .insert({
            agency_id: profile.agency_id,
            property_id: propertyId,
            lead_id: leadId,
            total_value: totalValue,
            commission_total: commissionTotal,
            type,
            status,
            closing_date: closingDate
        })
        .select()
        .single()

    if (txError) {
        console.error('Error creating manual transaction:', txError)
        return { error: 'Falha ao salvar transação: ' + txError.message }
    }

    // Create Splits
    const splitAgencyPerc = agency?.split_agency || 50
    const splitCaptadorPerc = agency?.split_captador || 25
    const splitVendedorPerc = agency?.split_vendedor || 25

    const splits: any[] = [
        {
            transaction_id: tx.id,
            role: 'agency',
            percentage: splitAgencyPerc,
            amount: (commissionTotal * splitAgencyPerc) / 100,
            status: status === 'paid' ? 'paid' : 'pending'
        }
    ]

    // If we have a captador/vendedor (based on property/lead or manual entry), we should add them
    // For manual transaction, let's keep it simple for now or fetch property owner
    const { data: property } = await supabase.from('properties').select('broker_id').eq('id', propertyId).single()
    if (property?.broker_id) {
        splits.push({
            transaction_id: tx.id,
            user_profile_id: property.broker_id,
            role: 'captador' as const,
            percentage: splitCaptadorPerc,
            amount: (commissionTotal * splitCaptadorPerc) / 100,
            status: status === 'paid' ? 'paid' : 'pending'
        })
    }

    if (leadId) {
        const { data: lead } = await supabase.from('leads').select('id').eq('id', leadId).single()
        // If lead was handled by a broker, we'd add him as vendedor. 
        // For now, let's just insert what we have.
    }

    await supabase.from('commissions_split').insert(splits)

    // Update lead status if leadId is present
    if (leadId) {
        await supabase
            .from('leads')
            .update({ 
                funnel_status: 'won',
                current_step_id: 'won' // assumindo que 'won' é um ID de etapa válido ou apenas marcando status
            })
            .eq('id', leadId)
    }

    revalidatePath('/finance')
    revalidatePath('/crm')
    return { success: true }
}

export const closeDeal = createManualTransaction

export async function getPropertiesForSelect() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('users_profile')
        .select('agency_id')
        .eq('id', user.id)
        .single()

    if (!profile?.agency_id) return []

    const { data } = await supabase
        .from('properties')
        .select('id, title')
        .eq('agency_id', profile.agency_id)
        .eq('status', 'active')
        .order('title')

    return data || []
}

export async function getLeadsForSelect() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('users_profile')
        .select('agency_id')
        .eq('id', user.id)
        .single()

    if (!profile?.agency_id) return []

    const { data } = await supabase
        .from('leads')
        .select('id, name')
        .eq('agency_id', profile.agency_id)
        .order('name')

    return data || []
}
