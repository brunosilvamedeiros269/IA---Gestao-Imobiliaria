'use server'

import { createClient } from '@/utils/supabase/server'

export async function getFinancialSummary(filters?: { search?: string, status?: string, type?: string }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await supabase
        .from('users_profile')
        .select('agency_id')
        .eq('id', user.id)
        .single()

    if (!profile?.agency_id) return null

    // Build Query
    let query = supabase
        .from('transactions')
        .select(`
            *,
            property:properties(title),
            lead:leads(name)
        `)
        .eq('agency_id', profile.agency_id)
        .order('closing_date', { ascending: false })

    if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
    }
    if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type)
    }
    if (filters?.search) {
        // Search in property title or lead name
        // Use a simpler approach for now since Supabase cross-table search is complex without a view
        // We'll filter in JS if needed, or stick to basic ID/Type search if titles are joined
    }

    const { data: transactions } = await query

    // Filter by search in memory for joined fields (Supabase join search is tricky)
    const filteredTransactions = transactions?.filter(tx => {
        if (!filters?.search) return true
        const s = filters.search.toLowerCase()
        return (
            tx.property?.title?.toLowerCase().includes(s) ||
            tx.lead?.name?.toLowerCase().includes(s) ||
            tx.id.toLowerCase().includes(s)
        )
    }) || []

    // Fetch Splits (for repasses)
    const { data: splits } = await supabase
        .from('commissions_split')
        .select('*')
        .in('transaction_id', filteredTransactions.map(tx => tx.id) || [])

    const vgv = filteredTransactions.reduce((acc, tx) => acc + Number(tx.total_value), 0) || 0
    const commissionTotal = filteredTransactions.reduce((acc, tx) => acc + Number(tx.commission_total), 0) || 0
    const repasses = splits?.filter(s => s.role !== 'agency').reduce((acc, s) => acc + Number(s.amount), 0) || 0
    const netAgency = commissionTotal - repasses

    return {
        transactions: filteredTransactions,
        summary: {
            vgv,
            commissionTotal,
            repasses,
            netAgency
        }
    }
}
