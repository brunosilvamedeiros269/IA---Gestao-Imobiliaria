'use server'

import { createClient } from '@/utils/supabase/server'
import { startOfMonth } from 'date-fns'

export async function getDashboardMetrics() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await supabase
        .from('users_profile')
        .select('agency_id, full_name')
        .eq('id', user.id)
        .single()

    if (!profile?.agency_id) throw new Error('No agency found')

    const monthStart = startOfMonth(new Date()).toISOString()

    // 1. Total Active Properties
    const { count: activeProperties, error: propError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('agency_id', profile.agency_id)
        .eq('status', 'active')

    // 2. New Leads (This Month)
    const { count: newLeads, error: leadError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('agency_id', profile.agency_id)
        .eq('funnel_status', 'new')
        .gte('created_at', monthStart)

    // 3. In Progress Leads (Atendimentos Ativos)
    const { count: activeServices, error: serviceError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('agency_id', profile.agency_id)
        .eq('funnel_status', 'in_progress')

    // 4. Funnel Distribution
    const statuses = ['new', 'in_progress', 'visit', 'won', 'lost']
    const funnelDistribution = await Promise.all(
        statuses.map(async (status) => {
            const { count } = await supabase
                .from('leads')
                .select('*', { count: 'exact', head: true })
                .eq('agency_id', profile.agency_id)
                .eq('funnel_status', status)
            return { status, count: count || 0 }
        })
    )

    // 5. Recent Activity (Latest leads and notes)
    const { data: recentLeads } = await supabase
        .from('leads')
        .select('id, name, created_at, funnel_status')
        .eq('agency_id', profile.agency_id)
        .order('created_at', { ascending: false })
        .limit(5)

    if (propError || leadError || serviceError) {
        console.error('Dashboard Metrics Error:', { propError, leadError, serviceError })
    }

    return {
        activeProperties: activeProperties || 0,
        newLeads: newLeads || 0,
        activeServices: activeServices || 0,
        agentName: profile.full_name || 'Agente',
        funnelDistribution,
        recentActivity: recentLeads?.map(lead => ({
            id: lead.id,
            type: 'lead',
            title: `Novo lead: ${lead.name}`,
            date: lead.created_at,
            status: lead.funnel_status
        })) || []
    }
}
