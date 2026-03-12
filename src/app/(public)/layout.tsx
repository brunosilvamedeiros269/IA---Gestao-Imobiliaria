import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { PublicHeader } from '@/components/public/PublicHeader'
import { PublicFooter } from '@/components/public/PublicFooter'
import { Inter, Outfit } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

interface LayoutProps {
    children: React.ReactNode
    params: {
        agencySlug: string
    }
}

export default async function PublicLayout({ children, params }: LayoutProps) {
    const supabase = await createClient()
    const resolvedParams = await params
    const slug = resolvedParams.agencySlug

    const { data: agency, error } = await supabase
        .from('agencies')
        .select('*')
        .eq('slug', slug)
        .single()

    if (error || !agency) {
        return notFound()
    }

    // Dynamic styles based on agency branding
    const primaryColor = agency.primary_color || '#4f46e5'

    return (
        <div className={`${inter.variable} ${outfit.variable} font-sans min-h-screen flex flex-col bg-white text-zinc-900`}>
            {/* Inject Dynamic CSS Variables for Branding */}
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
