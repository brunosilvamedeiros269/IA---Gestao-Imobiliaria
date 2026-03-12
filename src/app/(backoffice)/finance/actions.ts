'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function closeDeal(formData: FormData) {
    const supabase = await createClient()

    const leadId = formData.get('lead_id') as string
    const propertyId = formData.get('property_id') as string
    const totalValue = parseFloat(formData.get('total_value') as string)
    const type = formData.get('type') as 'sale' | 'rent'

    if (!leadId || !propertyId || isNaN(totalValue)) {
        return { error: 'Dados incompletos para o fechamento.' }
    }

    // 1. Get Session & Profile
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await supabase
        .from('users_profile')
        .select('agency_id, role')
        .eq('id', user.id)
        .single()

    if (!profile?.agency_id) return { error: 'Agência não encontrada.' }

    // 2. Get Agency Configs for Split
    const { data: agency } = await supabase
        .from('agencies')
        .select('default_commission_rate, split_agency, split_captador, split_vendedor')
        .eq('id', profile.agency_id)
        .single()

    // 3. Get Lead and Property details to identifying brokers
    const { data: lead } = await supabase
        .from('leads')
        .select('user_id')
        .eq('id', leadId)
        .single()

    const { data: property } = await supabase
        .from('properties')
        .select('created_by, commission_rate')
        .eq('id', propertyId)
        .single()

    if (!lead || !property) return { error: 'Lead ou Imóvel não encontrado.' }

    // 4. Calculations
    const commissionRate = property.commission_rate || agency?.default_commission_rate || 6.0
    const commissionTotal = (totalValue * commissionRate) / 100

    const splitAgencyPerc = agency?.split_agency || 50
    const splitCaptadorPerc = agency?.split_captador || 25
    const splitVendedorPerc = agency?.split_vendedor || 25

    const amountAgency = (commissionTotal * splitAgencyPerc) / 100
    const amountCaptador = (commissionTotal * splitCaptadorPerc) / 100
    const amountVendedor = (commissionTotal * splitVendedorPerc) / 100

    // 5. Create Transaction (Database Transaction would be ideal, but here we do step-by-step for simplicity)
    const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
            agency_id: profile.agency_id,
            property_id: propertyId,
            lead_id: leadId,
            broker_vendedor_id: lead.user_id,
            broker_captador_id: property.created_by,
            total_value: totalValue,
            commission_total: commissionTotal,
            type: type,
            status: 'pending'
        })
        .select()
        .single()

    if (txError) return { error: 'Erro ao registrar transação: ' + txError.message }

    // 6. Create Splits
    const splits = [
        {
            transaction_id: transaction.id,
            role: 'agency',
            percentage: splitAgencyPerc,
            amount: amountAgency,
            status: 'pending'
        },
        {
            transaction_id: transaction.id,
            user_profile_id: property.created_by,
            role: 'captador',
            percentage: splitCaptadorPerc,
            amount: amountCaptador,
            status: 'pending'
        },
        {
            transaction_id: transaction.id,
            user_profile_id: lead.user_id,
            role: 'vendedor',
            percentage: splitVendedorPerc,
            amount: amountVendedor,
            status: 'pending'
        }
    ]

    const { error: splitError } = await supabase
        .from('commissions_split')
        .insert(splits)

    if (splitError) return { error: 'Erro ao registrar splits: ' + splitError.message }

    // 7. Update Lead Status
    await supabase
        .from('leads')
        .update({ status: 'won' })
        .eq('id', leadId)

    revalidatePath('/crm')
    revalidatePath('/finance')
    
    return { success: true, transactionId: transaction.id }
}
