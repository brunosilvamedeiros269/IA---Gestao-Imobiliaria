'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getHunterConfig() {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado' }

    const { data: profile } = await supabase
        .from('users_profile')
        .select('agency_id')
        .eq('id', user.id)
        .single()

    if (!profile) return { error: 'Perfil não encontrado' }

    const { data: config, error } = await supabase
        .from('hunter_configs')
        .select('*')
        .eq('agency_id', profile.agency_id)
        .single()

    if (error && error.code !== 'PGRST116') {
        return { error: error.message }
    }

    return { config }
}

export async function saveHunterConfig(formData: FormData) {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado' }

    const { data: profile } = await supabase
        .from('users_profile')
        .select('agency_id, role')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'admin') return { error: 'Não autorizado' }

    const locations = (formData.get('locations') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []
    const property_types = formData.getAll('property_types') as string[]
    const min_price = formData.get('min_price') ? Number(formData.get('min_price')) : null
    const max_price = formData.get('max_price') ? Number(formData.get('max_price')) : null
    const min_bedrooms = formData.get('min_bedrooms') ? Number(formData.get('min_bedrooms')) : null
    const min_area = formData.get('min_area') ? Number(formData.get('min_area')) : null
    const only_direct_owner = formData.get('only_direct_owner') === 'on'
    const is_active = formData.get('is_active') === 'on'

    const { error } = await supabase
        .from('hunter_configs')
        .upsert({
            agency_id: profile.agency_id,
            locations,
            property_types,
            min_price,
            max_price,
            min_bedrooms,
            min_area,
            only_direct_owner,
            is_active,
            updated_at: new Date().toISOString()
        })

    if (error) return { error: error.message }

    revalidatePath('/settings')
    return { success: true }
}
