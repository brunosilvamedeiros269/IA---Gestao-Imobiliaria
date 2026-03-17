'use server'

import { createClient } from '@/utils/supabase/server'

export async function getFinancialSummary() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await supabase
        .from('users_profile')
        .select('agency_id')
        .eq('id', user.id)
        .single()

    if (!profile?.agency_id) return null

    // Fetch Transactions
    const { data: transactions } = await supabase
        .from('transactions')
        .select(`
            *,
            property:properties(title),
            lead:leads(name)
        `)
        .eq('agency_id', profile.agency_id)
        .order('closing_date', { ascending: false })

    // Fetch Splits (for repasses)
    const { data: splits } = await supabase
        .from('commissions_split')
        .select('*')
        .in('transaction_id', transactions?.map(tx => tx.id) || [])

    const vgv = transactions?.reduce((acc, tx) => acc + Number(tx.total_value), 0) || 0
    const commissionTotal = transactions?.reduce((acc, tx) => acc + Number(tx.commission_total), 0) || 0
    const repasses = splits?.filter(s => s.role !== 'agency').reduce((acc, s) => acc + Number(s.amount), 0) || 0
    const netAgency = commissionTotal - repasses

    return {
        transactions: transactions || [],
        summary: {
            vgv,
            commissionTotal,
            repasses,
            netAgency
        }
    }
}
