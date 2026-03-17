import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                        request.nextUrl.pathname.startsWith('/signup') || 
                        request.nextUrl.pathname.startsWith('/auth')

    // Rotas do Backoffice que EXIGEM autenticação
    const isBackofficeRoute = request.nextUrl.pathname === '/' ||
                             request.nextUrl.pathname.startsWith('/inventory') ||
                             request.nextUrl.pathname.startsWith('/crm') ||
                             request.nextUrl.pathname.startsWith('/finance') ||
                             request.nextUrl.pathname.startsWith('/hunter') ||
                             request.nextUrl.pathname.startsWith('/settings') ||
                             request.nextUrl.pathname.startsWith('/team')

    if (!user && isBackofficeRoute && !isAuthRoute) {
        // se não há usuário e tenta acessar backoffice, redireciona para login
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Se já está logado e tenta ir para /login, redirecionamos para o dashboard
    if (user && request.nextUrl.pathname.startsWith('/login')) {
        const url = request.nextUrl.clone()
        url.pathname = '/inventory'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
