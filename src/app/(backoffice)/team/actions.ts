'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function getTeamMembers() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await supabase
        .from('users_profile')
        .select('agency_id')
        .eq('id', user.id)
        .single()

    if (!profile?.agency_id) throw new Error('No agency found')

    // Fetch team members
    const { data: members, error } = await supabase
        .from('users_profile')
        .select('*')
        .eq('agency_id', profile.agency_id)
        .order('full_name')

    if (error) {
        console.error('Error fetching team members:', error)
        return []
    }

    // For each member, let's get their property count
    const membersWithStats = await Promise.all(members.map(async (member) => {
        const { count } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('broker_id', member.id)

        return {
            ...member,
            propertyCount: count || 0
        }
    }))

    return membersWithStats
}

export async function updateMemberRole(userId: string, newRole: 'admin' | 'broker') {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Verify if current user is admin
    const { data: currentUserProfile } = await supabase
        .from('users_profile')
        .select('role, agency_id')
        .eq('id', user.id)
        .single()

    if (currentUserProfile?.role !== 'admin') {
        return { error: 'Apenas administradores podem alterar cargos.' }
    }

    const { error } = await supabase
        .from('users_profile')
        .update({ role: newRole })
        .eq('id', userId)
        .eq('agency_id', currentUserProfile.agency_id) // Safety check

    if (error) {
        return { error: 'Erro ao atualizar cargo: ' + error.message }
    }

    revalidatePath('/team')
    return { success: true }
}

export async function inviteTeamMember(email: string, role: 'admin' | 'broker') {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')

    // 1. Verify if current user is admin
    const { data: currentUserProfile } = await supabase
        .from('users_profile')
        .select('role, agency_id')
        .eq('id', currentUser.id)
        .single()

    if (currentUserProfile?.role !== 'admin') {
        return { error: 'Apenas administradores podem convidar membros.' }
    }

    // 2. Invite user via Supabase Auth Admin API
    const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
        data: {
            agency_id: currentUserProfile.agency_id,
            role: role
        }
    })

    if (inviteError) {
        return { error: 'Erro ao enviar convite: ' + inviteError.message }
    }

    // 3. Create placeholder profile
    if (inviteData.user) {
        const { error: profileError } = await adminSupabase.from('users_profile').insert({
            id: inviteData.user.id,
            agency_id: currentUserProfile.agency_id!,
            role: role,
            email: email,
            full_name: 'Pendente' // Placeholder until they set it
        })

        if (profileError) {
            console.error('Error creating placeholder profile:', profileError)
            // We don't return error here because the email was already sent
        }
    }

    revalidatePath('/team')
    return { success: true }
}
