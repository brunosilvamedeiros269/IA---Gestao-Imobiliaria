'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/utils/supabase/database.types'

type PropertyInsert = Database['public']['Tables']['properties']['Insert']

export async function createProperty(formData: FormData) {
    const supabase = await createClient()

    // 1. Get the current user's profile to extract agency_id
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error('Not authenticated')
    }

    const { data: profile } = await supabase
        .from('users_profile')
        .select('agency_id, id')
        .eq('id', user.id)
        .single()

    if (!profile || !profile.agency_id) {
        throw new Error('User does not belong to an agency')
    }

    // 2. Extract Data
    const priceRaw = formData.get('price')?.toString() || '0'
    const price = parseFloat(priceRaw.replace(/\D/g, '')) / 100

    const condominioRaw = formData.get('condominio_fee')?.toString() || '0'
    const condominio_fee = parseFloat(condominioRaw.replace(/\D/g, '')) / 100

    const iptuRaw = formData.get('iptu')?.toString() || '0'
    const iptu = parseFloat(iptuRaw.replace(/\D/g, '')) / 100

    const newProperty: PropertyInsert = {
        agency_id: profile.agency_id,
        broker_id: profile.id,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        listing_type: formData.get('listing_type') as Database['public']['Enums']['listing_type'],
        property_type: formData.get('property_type') as string,
        price,
        condominio_fee,
        iptu,
        bedrooms: parseInt(formData.get('bedrooms') as string || '0', 10),
        suites_count: parseInt(formData.get('suites_count') as string || '0', 10),
        bathrooms: parseInt(formData.get('bathrooms') as string || '0', 10),
        parking_spots: parseInt(formData.get('parking_spots') as string || '0', 10),
        useful_area: parseFloat(formData.get('useful_area') as string || '0'),
        floor_number: formData.get('floor_number') ? parseInt(formData.get('floor_number') as string, 10) : null,
        
        // Intelligence & Management Fields (V2.0)
        is_exclusive: formData.get('is_exclusive') === 'true',
        owner_name: formData.get('owner_name') as string || null,
        owner_phone: formData.get('owner_phone') as string || null,
        is_furnished: formData.get('is_furnished') === 'true',
        pets_allowed: formData.get('pets_allowed') === 'true',
        accepts_financing: formData.get('accepts_financing') === 'true' || formData.get('accepts_financing') === null,
        show_full_address: formData.get('show_full_address') === 'true',
        amenities: JSON.parse((formData.get('amenities') as string) || '[]'),
        commission_percentage: formData.get('commission_percentage') ? parseFloat(formData.get('commission_percentage') as string) : null,

        address_zipcode: formData.get('address_zipcode') as string || null,
        address_street: formData.get('address_street') as string || null,
        address_number: formData.get('address_number') as string || null,
        address_neighborhood: formData.get('address_neighborhood') as string || null,
        address_city: formData.get('address_city') as string || null,
        address_state: formData.get('address_state') as string || null,
        photos: JSON.parse((formData.get('photos') as string) || '[]'),
        status: 'active'
    }

    const { error } = await supabase.from('properties').insert(newProperty)

    if (error) {
        console.error('Failed to insert property:', error)
        return { error: 'Falha ao criar imóvel: ' + error.message }
    }

    revalidatePath('/inventory')

    return { success: true }
}
