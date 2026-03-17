'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/utils/supabase/database.types'
import { calculateLeadScore } from '@/utils/scoring'
import { hasPermission, UserRole } from '@/utils/rbac'

export type LeadWithProperty = Database['public']['Tables']['leads']['Row'] & {
    properties: {
        title: string
        photos: string[]
        property_type: string
        listing_type: string
        address_summary: string | null
        price: number
    } | null
    users_profile: {
        full_name: string
        avatar_url: string | null
    } | null
    lead_score: number | null
}

export type LeadNoteWithBroker = Database['public']['Tables']['lead_notes']['Row'] & {
    users_profile: {
        full_name: string
    }
}

export async function getLeads(): Promise<LeadWithProperty[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    const { data: profile } = await supabase
        .from('users_profile')
        .select('agency_id')
        .eq('id', user.id)
        .single()

    if (!profile?.agency_id) {
        throw new Error('No agency found')
    }

    // Fetch leads and join with properties to show the property thumbnail/title
    const { data: leads, error } = await supabase
        .from('leads')
        .select(`
            *,
            properties (
                title,
                photos,
                property_type,
                listing_type
            ),
            users_profile (
                full_name,
                avatar_url
            ),
            lead_score
        `)
        .eq('agency_id', profile.agency_id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Failed to fetch leads:', error)
        return []
    }

    return leads as unknown as LeadWithProperty[]
}

export async function updateLeadStatus(leadId: string, newStatus: Database['public']['Enums']['funnel_status']) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('leads')
        .update({ funnel_status: newStatus })
        .eq('id', leadId)

    if (error) {
        console.error('Error updating lead status:', error)
        return { error: error.message }
    }

    return { success: true }
}

export async function getActiveProperties() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('users_profile')
        .select('agency_id')
        .eq('id', user.id)
        .single()

    if (!profile?.agency_id) return []

    const { data, error } = await supabase
        .from('properties')
        .select('id, title, listing_type')
        .eq('agency_id', profile.agency_id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Failed to fetch properties for dropdown:', error)
        return []
    }

    return data
}

export async function createLead(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await supabase
        .from('users_profile')
        .select('agency_id')
        .eq('id', user.id)
        .single()

    if (!profile?.agency_id) throw new Error('User has no agency')

    const name = formData.get('name') as string
    const email = formData.get('email') as string || null
    const phone = formData.get('phone') as string || null
    const property_id = formData.get('property_id') as string || null
    const status = formData.get('status') as Database['public']['Enums']['funnel_status'] || 'new'
    
    // Novas colunas V2.0
    const source = formData.get('source') as string || 'direct'
    const budget_min = Number(formData.get('budget_min')?.toString().replace(/\D/g, '')) || 0
    const budget_max = Number(formData.get('budget_max')?.toString().replace(/\D/g, '')) || 0
    const urgency_score = Number(formData.get('urgency_score')) || 1

    const lead_score = calculateLeadScore({
        email,
        phone,
        budget_min: budget_min / 100,
        budget_max: budget_max / 100,
        source,
        urgency_score
    })

    if (!name) return { error: 'O Nome do Cliente é obrigatório.' }

    const { error } = await supabase
        .from('leads')
        .insert({
            agency_id: profile.agency_id,
            name,
            email,
            phone,
            property_id: property_id && property_id !== 'none' ? property_id : null,
            funnel_status: status,
            source,
            budget_min: budget_min / 100, 
            budget_max: budget_max / 100,
            urgency_score,
            broker_id: user.id, // Automáticamente atribui ao criador
            lead_score
        })

    if (error) {
        console.error('Failed to create lead:', error)
        return { error: 'Falha ao salvar o lead: ' + error.message }
    }

    revalidatePath('/crm')
    return { success: true }
}

export async function getLeadById(id: string): Promise<LeadWithProperty | null> {
    const supabase = await createClient()

    const { data: lead, error } = await supabase
        .from('leads')
        .select(`
            *,
            properties (
                title,
                photos,
                property_type,
                listing_type,
                address_summary,
                price
            )
        `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Failed to fetch lead:', error)
        return null
    }

    return lead as unknown as LeadWithProperty
}

export async function getLeadNotes(leadId: string): Promise<LeadNoteWithBroker[]> {
    const supabase = await createClient()

    const { data: notes, error } = await supabase
        .from('lead_notes')
        .select(`
            *,
            users_profile (
                full_name
            )
        `)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Failed to fetch lead notes:', error)
        return []
    }

    return notes as unknown as LeadNoteWithBroker[]
}

export async function createLeadNote(leadId: string, content: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await supabase
        .from('users_profile')
        .select('agency_id')
        .eq('id', user.id)
        .single()

    if (!profile?.agency_id) throw new Error('User has no agency')

    const { error } = await supabase
        .from('lead_notes')
        .insert({
            lead_id: leadId,
            broker_id: user.id,
            agency_id: profile.agency_id,
            content
        })

    if (error) {
        console.error('Failed to create lead note:', error)
        return { error: error.message }
    }

    revalidatePath(`/crm/${leadId}`)
    return { success: true }
}

export async function deleteLeadNote(noteId: string, leadId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('lead_notes')
        .delete()
        .eq('id', noteId)

    if (error) {
        console.error('Failed to delete lead note:', error)
        return { error: error.message }
    }

    revalidatePath(`/crm/${leadId}`)
    return { success: true }
}

export async function searchLeads(query: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('users_profile')
        .select('agency_id')
        .eq('id', user.id)
        .single()

    if (!profile?.agency_id) return []

    // Search by name or phone
    const { data, error } = await supabase
        .from('leads')
        .select('id, name, phone, email')
        .eq('agency_id', profile.agency_id)
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('name', { ascending: true })
        .limit(10)

    if (error) {
        console.error('Failed to search leads:', error)
        return []
    }

    return data
}

export async function linkLeadToProperty(leadId: string, propertyId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('leads')
        .update({ property_id: propertyId })
        .eq('id', leadId)

    if (error) {
        console.error('Failed to link lead to property:', error)
        return { error: error.message }
    }

    revalidatePath(`/inventory/${propertyId}`)
    revalidatePath('/crm')
    return { success: true }
}

