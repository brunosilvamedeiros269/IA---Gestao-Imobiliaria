'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getOpportunityById(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('hunter_opportunities')
        .select('*')
        .eq('id', id)
        .single()

    if (error) return null
    return data
}

export async function convertOpportunityToProperty(opportunityId: string, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado' }

    // Verify opportunity exists and belongs to user's agency
    const { data: profile } = await supabase
        .from('users_profile')
        .select('agency_id')
        .eq('id', user.id)
        .single()

    const { data: opp, error: oppError } = await supabase
        .from('hunter_opportunities')
        .select('*')
        .eq('id', opportunityId)
        .eq('agency_id', profile?.agency_id)
        .single()

    if (oppError || !opp) return { error: 'Oportunidade não encontrada ou não autorizado.' }
    if (opp.status === 'converted') return { error: 'Esta oportunidade já foi convertida.' }

    const listing_type = formData.get('listing_type') as 'sale' | 'rent'
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = Number(formData.get('price')) || opp.price || 0
    const property_type = formData.get('property_type') as string
    const bedrooms = Number(formData.get('bedrooms')) || opp.bedrooms || 0
    const bathrooms = Number(formData.get('bathrooms')) || opp.bathrooms || 0
    const parking_spots = Number(formData.get('parking_spots')) || opp.parking_spots || 0
    const useful_area = Number(formData.get('useful_area')) || opp.useful_area || 0

    // Address
    const address_zipcode = formData.get('address_zipcode') as string
    const address_street = formData.get('address_street') as string
    const address_number = formData.get('address_number') as string
    const address_neighborhood = formData.get('address_neighborhood') as string || opp.address_neighborhood
    const address_city = formData.get('address_city') as string || opp.address_city
    const address_state = formData.get('address_state') as string
    const address_summary = [address_street, address_number, address_neighborhood, address_city].filter(Boolean).join(', ')

    // Additional
    const iptu = Number(formData.get('iptu')) || 0
    const condominio_fee = Number(formData.get('condominio_fee')) || 0
    const commission_percentage = Number(formData.get('commission_percentage')) || 6
    const is_exclusive = formData.get('is_exclusive') === 'true'

    if (!listing_type) return { error: 'Tipo de negócio (Venda/Locação) é obrigatório.' }
    if (!title) return { error: 'Título é obrigatório.' }

    // 1. Create property
    const { data: newProperty, error: propError } = await supabase
        .from('properties')
        .insert({
            agency_id: opp.agency_id,
            broker_id: user.id,
            title,
            description,
            listing_type,
            price,
            property_type,
            bedrooms,
            bathrooms,
            parking_spots,
            useful_area,
            address_summary,
            address_zipcode,
            address_street,
            address_number,
            address_neighborhood,
            address_city,
            address_state,
            owner_name: opp.owner_name,
            owner_phone: opp.owner_phone,
            photos: opp.photos || [],
            iptu,
            condominio_fee,
            commission_percentage,
            is_exclusive,
            status: 'active',
        })
        .select('id')
        .single()

    if (propError || !newProperty) {
        return { error: 'Falha ao criar imóvel: ' + propError?.message }
    }

    // 2. Mark opportunity as converted
    await supabase
        .from('hunter_opportunities')
        .update({
            status: 'converted',
            property_id: newProperty.id,
            updated_at: new Date().toISOString()
        })
        .eq('id', opportunityId)

    revalidatePath('/hunter')
    revalidatePath('/inventory')

    redirect(`/inventory/${newProperty.id}`)
}
