import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { PublicHeader } from '@/components/public/PublicHeader'
import { PublicFooter } from '@/components/public/PublicFooter'
import { Inter, Outfit } from 'next/font/google'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ agencySlug: string }> }): Promise<Metadata> {
    const supabase = await createClient()
    const { agencySlug } = await params
    
    const { data: agency } = await supabase
        .from('agencies')
        .select('name, seo_title, seo_description, logo_url')
        .eq('slug', agencySlug)
        .single()

    if (!agency) return { title: 'Agência não encontrada' }

    return {
        title: agency.seo_title || agency.name,
        description: agency.seo_description || `Encontre seu imóvel ideal na ${agency.name}.`,
        icons: agency.logo_url ? [{ url: agency.logo_url }] : [],
    }
}

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

interface LayoutProps {
    children: React.ReactNode
    params: Promise<{ agencySlug: string }>
}

export default async function AgencyLayout({ children, params }: LayoutProps) {
    const supabase = await createClient()
    const { agencySlug: slug } = await params

    const { data: agency, error } = await supabase
        .from('agencies')
        .select('*')
        .eq('slug', slug)
        .single()

    if (error || !agency) {
        return notFound()
    }

    const primaryColor = agency.primary_color || '#4f46e5'

    return (
        <div className={`${inter.variable} ${outfit.variable} font-sans min-h-screen flex flex-col bg-white text-zinc-900`}>
            <style dangerouslySetInnerHTML={{ __html: `
                :root {
                    --primary: ${primaryColor};
                    --primary-foreground: #ffffff;
                }
            `}} />

            <PublicHeader agency={agency} />

            <main className="flex-1">
                {children}
            </main>

            <PublicFooter agency={agency} />
        </div>
    )
}
