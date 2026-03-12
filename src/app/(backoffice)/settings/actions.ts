'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const fullName = formData.get('full_name') as string

    if (!fullName) {
        return { error: 'O nome completo é obrigatório.' }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('users_profile')
        .update({
            full_name: fullName
        })
        .eq('id', user.id)

    if (error) {
        return { error: 'Erro ao atualizar perfil: ' + error.message }
    }

    revalidatePath('/settings')
    return { success: true }
}

export async function uploadAvatar(formData: FormData) {
    const supabase = await createClient()
    const file = formData.get('file') as File
    
    if (!file) return { error: 'Nenhum arquivo enviado.' }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const fileExt = file.name.split('.').pop()
    const filePath = `avatars/${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
        .from('branding')
        .upload(filePath, file)

    if (uploadError) return { error: 'Erro no upload: ' + uploadError.message }

    const { data: { publicUrl } } = supabase.storage
        .from('branding')
        .getPublicUrl(filePath)

    await supabase
        .from('users_profile')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

    revalidatePath('/settings')
    return { success: true, url: publicUrl }
}

export async function uploadAgencyLogo(formData: FormData) {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    const file = formData.get('file') as File

    if (!file) return { error: 'Nenhum arquivo enviado.' }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await supabase
        .from('users_profile')
        .select('agency_id, role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin' || !profile?.agency_id) {
        return { error: 'Apenas administradores podem alterar o logo.' }
    }

    const fileExt = file.name.split('.').pop()
    const filePath = `logos/${profile.agency_id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await adminSupabase.storage
        .from('branding')
        .upload(filePath, file)

    if (uploadError) return { error: 'Erro no upload: ' + uploadError.message }

    const { data: { publicUrl } } = adminSupabase.storage
        .from('branding')
        .getPublicUrl(filePath)

    await adminSupabase
        .from('agencies')
        .update({ logo_url: publicUrl })
        .eq('id', profile.agency_id)

    revalidatePath('/settings')
    return { success: true, url: publicUrl }
}

export async function updateAgency(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const primaryColor = formData.get('primary_color') as string
    const tagline = formData.get('tagline') as string
    const seoTitle = formData.get('seo_title') as string
    const seoDescription = formData.get('seo_description') as string
    const whatsapp = formData.get('whatsapp_number') as string
    const instagram = formData.get('instagram_url') as string
    const facebook = formData.get('facebook_url') as string
    const linkedin = formData.get('linkedin_url') as string

    // Financial Configs
    const defaultCommissionRate = parseFloat(formData.get('default_commission_rate') as string)
    const splitAgency = parseFloat(formData.get('split_agency') as string)
    const splitCaptador = parseFloat(formData.get('split_captador') as string)
    const splitVendedor = parseFloat(formData.get('split_vendedor') as string)

    if (!name) {
        return { error: 'O nome da agência é obrigatório.' }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 1. Get user profile and verify if admin
    const { data: profile } = await supabase
        .from('users_profile')
        .select('agency_id, role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin' || !profile?.agency_id) {
        return { error: 'Apenas administradores podem alterar os dados da agência.' }
    }

    // 2. Update agency
    const { error } = await supabase
        .from('agencies')
        .update({
            name,
            phone,
            address,
            primary_color: primaryColor,
            tagline,
            seo_title: seoTitle,
            seo_description: seoDescription,
            whatsapp_number: whatsapp,
            instagram_url: instagram,
            facebook_url: facebook,
            linkedin_url: linkedin,
            // New Financial Fields
            default_commission_rate: !isNaN(defaultCommissionRate) ? defaultCommissionRate : undefined,
            split_agency: !isNaN(splitAgency) ? splitAgency : undefined,
            split_captador: !isNaN(splitCaptador) ? splitCaptador : undefined,
            split_vendedor: !isNaN(splitVendedor) ? splitVendedor : undefined
        })
        .eq('id', profile.agency_id)

    if (error) {
        return { error: 'Erro ao atualizar agência: ' + error.message }
    }

    revalidatePath('/settings')
    return { success: true }
}
