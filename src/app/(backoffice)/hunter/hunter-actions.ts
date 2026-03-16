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

import OpenAI from "openai";

// Helper to initialize OpenAI with Agency Key or Env
async function getOpenAIClient(supabase: any, agencyId: string) {
    const { data: agency } = await supabase
        .from('agencies')
        .select('openai_api_key')
        .eq('id', agencyId)
        .single();
    
    const apiKey = agency?.openai_api_key || process.env.OPENAI_API_KEY;
    if (!apiKey) return null;

    return new OpenAI({ apiKey });
}

export async function runHunterIA() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autorizado' }

    const { data: profile } = await supabase
        .from('users_profile')
        .select('agency_id')
        .eq('id', user.id)
        .single()

    if (!profile) return { error: 'Perfil não encontrado' }

    return await executeHunterJob(profile.agency_id);
}

/**
 * Executa o robô de busca de imóveis (Hunter IA)
 * Este job pode ser chamado manualmente via UI ou automaticamente via Vercel Cron
 */
export async function executeHunterJob(agencyId: string) {
    const supabase = await createClient()
    
    // 1. Busca configurações de busca da agência
    const { data: configs } = await supabase
        .from('hunter_configs')
        .select('*')
        .eq('agency_id', agencyId)
        .eq('is_active', true);

    if (!configs || configs.length === 0) {
        return { error: 'Nenhuma configuração ativa encontrada para o Hunter IA.' };
    }

    const openai = await getOpenAIClient(supabase, agencyId);
    if (!openai) return { error: 'API Key da OpenAI não configurada para esta agência.' };

    let totalFound = 0;

    for (const config of configs) {
        const locations = config.locations || [];
        const types = config.property_types || ['casa', 'apartamento'];
        
        for (const location of locations) {
            // 2. Realiza a busca na web
            // DICA: Para produção real, substitua simulatedSearchAPI por uma chamada à SERPER.DEV ou TAVILY
            const query = `imóveis à venda ${types.join(' ou ')} em ${location} direto com proprietário olx vivareal zap`;
            
            console.log(`Hunter IA: Buscando em ${location} para agência ${agencyId}...`);
            const searchResults = await simulatedSearchAPI(query); 

            for (const result of searchResults) {
                // 3. Extração e Reescrita com IA
                const extractionPrompt = `
                    Analise o seguinte resultado de busca de imóvel:
                    Título: ${result.title}
                    Snippet: ${result.snippet}
                    URL: ${result.link}

                    Extraia os seguintes campos em JSON:
                    {
                        "title": "Título curto e atraente",
                        "price": 0,
                        "neighborhood": "Bairro extraído",
                        "city": "Cidade extraída",
                        "property_type": "Casa/Apartamento/etc",
                        "bedrooms": 0,
                        "bathrooms": 0,
                        "area": 0,
                        "description": "Resumo do que foi encontrado",
                        "analysis": "Uma análise curta por que este imóvel é uma boa oportunidade de captação"
                    }
                `;

                try {
                    const completion = await openai.chat.completions.create({
                        messages: [{ role: "user", content: extractionPrompt }],
                        model: "gpt-4o-mini",
                        response_format: { type: "json_object" }
                    });

                    const data = JSON.parse(completion.choices[0].message.content || '{}');

                    // 4. Salva a oportunidade evitando duplicatas (conflito por URL)
                    const { error: insertError } = await supabase
                        .from('hunter_opportunities')
                        .upsert({
                            agency_id: agencyId,
                            external_url: result.link,
                            portal_name: result.displayLink || 'Web',
                            title: data.title || result.title,
                            description: data.description,
                            rewritten_description: data.analysis,
                            price: data.price,
                            address_city: data.city,
                            address_neighborhood: data.neighborhood,
                            property_type: data.property_type,
                            bedrooms: data.bedrooms,
                            bathrooms: data.bathrooms,
                            useful_area: data.area,
                            status: 'pending',
                            photos: result.photos || []
                        }, { onConflict: 'external_url' });

                    if (!insertError) totalFound++;
                } catch (e) {
                    console.error("Erro ao processar imóvel com IA:", e);
                }
            }
        }
    }

    revalidatePath('/hunter')
    return { success: true, count: totalFound }
}

async function simulatedSearchAPI(query: string) {
    // Placeholder para uma API de Search real (ex: Serper, Google Custom Search)
    return [
        {
            title: "Apartamento 2 quartos em " + (query.split('em ')[1]?.split(' ')[0] || 'São Paulo'),
            snippet: "Excelente oportunidade direto com proprietário. 70m², varanda, andar alto. Valor R$ 450.000",
            link: "https://www.olx.com.br/imoveis/anuncio-placeholder-" + Math.floor(Math.random() * 100000),
            displayLink: "OLX",
            photos: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"]
        },
        {
            title: "Casa de Vila aconchegante",
            snippet: "Linda casa com 3 dormitórios, recém reformada. Próximo ao metrô. R$ 890.000",
            link: "https://www.vivareal.com.br/imovel/casa-placeholder-" + Math.floor(Math.random() * 100000),
            displayLink: "VivaReal",
            photos: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80"]
        }
    ];
}

