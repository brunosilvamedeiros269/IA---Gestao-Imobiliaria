'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getHunterOpportunities() {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado' }

    const { data: profile } = await supabase
        .from('users_profile')
        .select('agency_id')
        .eq('id', user.id)
        .single()

    if (!profile) return { error: 'Perfil não encontrado' }

    const { data: opportunities, error } = await supabase
        .from('hunter_opportunities')
        .select(`
            *,
            broker:users_profile(full_name, avatar_url)
        `)
        .eq('agency_id', profile.agency_id)
        .order('created_at', { ascending: false })

    if (error) return { error: error.message }

    return { opportunities }
}

export async function claimOpportunity(opportunityId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado' }

    const { error } = await supabase
        .from('hunter_opportunities')
        .update({ 
            broker_id: user.id,
            status: 'claimed',
            updated_at: new Date().toISOString()
        })
        .eq('id', opportunityId)

    if (error) return { error: error.message }

    revalidatePath('/hunter')
    return { success: true }
}

export async function discardOpportunity(opportunityId: string) {
    const supabase = await createClient()
    
    const { error } = await supabase
        .from('hunter_opportunities')
        .update({ 
            status: 'discarded',
            updated_at: new Date().toISOString()
        })
        .eq('id', opportunityId)

    if (error) return { error: error.message }

    revalidatePath('/hunter')
    return { success: true }
}

export async function simulateHunt() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado' }

    const { data: profile } = await supabase
        .from('users_profile')
        .select('agency_id')
        .eq('id', user.id)
        .single()

    if (!profile) return { error: 'Perfil não encontrado' }

    // Mock data for demonstration
    const mocks = [
        {
            agency_id: profile.agency_id,
            portal_name: 'Zap Imóveis',
            title: 'Apartamento Reformado no Itaim Bibi',
            description: 'Lindo apartamento totalmente reformado com 3 suítes, varanda gourmet e 2 vagas. Direto com proprietário.',
            rewritten_description: 'Oportunidade única no Itaim Bibi! Este apartamento de alto padrão foi completamente modernizado, oferecendo 3 suítes amplas e uma varanda gourmet perfeita para receber. Localização privilegiada próxima a centros comerciais.',
            price: 2450000,
            address_city: 'São Paulo',
            address_neighborhood: 'Itaim Bibi',
            property_type: 'Apartamento',
            bedrooms: 3,
            bathrooms: 4,
            parking_spots: 2,
            useful_area: 145,
            owner_name: 'Renato Silva',
            owner_phone: '(11) 98877-6655',
            external_url: 'https://zapimoveis.com.br/anuncio/123',
            status: 'pending'
        },
        {
            agency_id: profile.agency_id,
            portal_name: 'OLX',
            title: 'Casa em Condomínio - Granja Viana',
            description: 'Casa cercada de verde, 4 quartos, piscina, churrasqueira. Urgente por motivo de mudança.',
            rewritten_description: 'Refúgio de tranquilidade na Granja Viana. Casa espaçosa em condomínio fechado com lazer completo privativo (piscina e churrasqueira). Ideal para famílias que buscam contato com a natureza sem abrir mão da segurança.',
            price: 1150000,
            address_city: 'Cotia',
            address_neighborhood: 'Granja Viana',
            property_type: 'Casa',
            bedrooms: 4,
            bathrooms: 3,
            parking_spots: 4,
            useful_area: 280,
            owner_name: 'Maria Oliveira',
            owner_phone: '(11) 97766-5544',
            external_url: 'https://olx.com.br/imoveis/anuncio/456',
            status: 'pending'
        }
    ]

    const { error } = await supabase.from('hunter_opportunities').insert(mocks)
    
    if (error) return { error: error.message }

    revalidatePath('/hunter')
    return { success: true }
}
