'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/utils/logger'

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const agencyName = formData.get('agency_name') as string
    const agencySlug = formData.get('agency_slug') as string
    const fullName = formData.get('full_name') as string

    // 1. Check if slug is already taken
    const { data: existingAgency } = await supabase
        .from('agencies')
        .select('id')
        .eq('slug', agencySlug)
        .single()

    if (existingAgency) {
        redirect('/signup?message=' + encodeURIComponent('Este subdomínio (slug) já está em uso.'))
    }

    // 2. Cria o usuário contornando os Rate Limits usando a chave administrativa
    const adminSupabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: signUpError, data: { user } } = await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true // Já confirma o e-mail automaticamente
    })

    if (signUpError) {
        logger.error("Signup Action", "Failed to sign up user via admin API", signUpError)
        redirect('/signup?message=' + encodeURIComponent(signUpError.message))
    }

    // 3. Create the Agency and the Admin Profile
    if (!user) {
        logger.warn("Signup Action", `User returned was null for email: ${email}`)
        redirect('/signup?message=' + encodeURIComponent('E-mail já cadastrado.'))
    }

    logger.info("Signup Action", `Provisioning new agency for user ${user.id}`)

    const { data: agencyData, error: agencyError } = await adminSupabase
        .from('agencies')
        .insert({
            name: agencyName,
            slug: agencySlug
        })
        .select()
        .single()

    if (agencyError) {
        logger.error("Signup Action", "Failed to insert agency", agencyError)
        redirect('/signup?message=' + encodeURIComponent('Erro ao criar agência. Contate o suporte.'))
    }

    if (agencyData) {
        logger.info("Signup Action", `Agency ${agencyData.id} created, inserting admin profile.`)

        const { error: profileError } = await adminSupabase.from('users_profile').insert({
            id: user.id,
            agency_id: agencyData.id,
            role: 'admin',
            full_name: fullName
        })

        if (profileError) {
            logger.error("Signup Action", "Failed to create user profile", profileError)
            redirect('/signup?message=' + encodeURIComponent('Erro ao criar perfil de usuário.'))
        }

        logger.info("Signup Action", `Signup fully completed for user ${user.id}`)
    }

    // 4. Force Sign in to generate Auth Cookies in the standard browser Client
    logger.info("Signup Action", `Signing in the newly created user ${user.id} to set browser cookies`)
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (signInError) {
        logger.error("Signup Action", "Failed to auto-sign in user", signInError)
        redirect('/login?message=' + encodeURIComponent('Conta criada com sucesso. Por favor, faça o login.'))
    }

    revalidatePath('/', 'layout')
    redirect('/')
}
