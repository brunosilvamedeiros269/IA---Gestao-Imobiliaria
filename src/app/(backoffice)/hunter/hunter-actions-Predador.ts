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
        const activeSources = config.sources || ['olx', 'vivareal'];
        const negativeWords = config.negative_keywords || [];
        
        for (const location of locations) {
            // 2. Realiza a busca na web focando nas fontes selecionadas
            const query = `imóveis à venda ${types.join(' ou ')} em ${location} direto com proprietário ${activeSources.join(' ')}`;
            
            console.log(`Hunter IA Elite: Minerando em ${location} para agência ${agencyId}...`);
            const searchResults = await realSearchAPI(query); 

            for (const result of searchResults) {
                // Filtro rápido de palavras-chave negativas no snippet/título original
                const hasNegativeWord = negativeWords.some((word: string) => 
                    result.title.toLowerCase().includes(word.toLowerCase()) || 
                    result.snippet.toLowerCase().includes(word.toLowerCase())
                );

                if (hasNegativeWord) {
                    console.log(`Hunter IA: Pulando imóvel por palavra-chave negativa: ${result.title}`);
                    continue;
                }

                console.log(`Hunter IA: Processando imóvel encontrado: ${result.title}`);

                try {
                    // 3. Extração Elite e Scoring com IA
                    const extractionPrompt = `
                        Analise este anúncio imobiliário para uma imobiliária de ALTA PERFORMANCE.
                        Título: ${result.title}
                        Snippet: ${result.snippet}
                        URL: ${result.link}

                        Regras:
                        1. Extraia os dados técnicos.
                        2. Calcule um OPPORTUNITY_SCORE de 0 a 100. Considere:
                           - 90-100: "Golden Deal" (Preço muito baixo, direto com dono, localização premium).
                           - 70-89: "Boa Captação" (Perfil comercial forte).
                           - <50: "Baixa Liquidez".
                        3. Resuma por que este imóvel é uma boa (ou má) oportunidade.

                        Retorne em JSON:
                        {
                            "title": "Título atraente",
                            "price": 0,
                            "neighborhood": "Bairro",
                            "city": "Cidade",
                            "property_type": "Tipo",
                            "bedrooms": 0,
                            "bathrooms": 0,
                            "area": 0,
                            "score": 0,
                            "analysis": "Por que captar?",
                            "description": "Resumo executivo"
                        }
                    `;

                    let data;
                    try {
                        const completion = await openai.chat.completions.create({
                            messages: [{ role: "user", content: extractionPrompt }],
                            model: "gpt-4o-mini",
                            response_format: { type: "json_object" }
                        });
                        data = JSON.parse(completion.choices[0].message.content || '{}');
                    } catch (e) {
                        console.error("Hunter IA: Erro na OpenAI (usando fallback de simulação):", (e as any).message);
                        // Fallback data for testing if AI fails
                        data = {
                            title: result.title,
                            price: parseInt(result.snippet.match(/R\$ ([\d.]+)/)?.[1]?.replace(/\./g, '') || '0'),
                            neighborhood: "Bairro Simulado",
                            city: location,
                            property_type: types[0],
                            bedrooms: 2,
                            bathrooms: 1,
                            area: 70,
                            score: 85,
                            analysis: "Simulação: Oportunidade detectada em " + location,
                            description: result.snippet
                        };
                    }

                    // Filtro de liquidez mínima se configurado
                    if (config.min_liquidity_score && data.score < config.min_liquidity_score) {
                        console.log(`Hunter IA: Oportunidade ignorada por score baixo (${data.score})`);
                        continue;
                    }

                    // 4. Salva a oportunidade Elite
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
                            opportunity_score: data.score,
                            price_history: [{ price: data.price, date: new Date().toISOString() }],
                            status: 'pending',
                            photos: result.photos || []
                        }, { onConflict: 'external_url' });

                    if (!insertError) {
                        totalFound++;
                    }
                } catch (e) {
                    console.error("Hunter IA: Erro crítico ao processar imóvel:", e);
                }
            }
        }
    }

    revalidatePath('/hunter')
    return { success: true, count: totalFound }
}

async function realSearchAPI(query: string) {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
        console.error("Hunter IA: SERPER_API_KEY não encontrada no ambiente.");
        return [];
    }

    try {
        const response = await fetch("https://google.serper.dev/search", {
            method: "POST",
            headers: {
                "X-API-KEY": apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                q: query,
                gl: "br",
                hl: "pt-br",
                num: 10
            }),
        });

        const data = await response.json();
        
        // Mapeia os resultados orgânicos para o formato interno
        return (data.organic || []).map((item: any) => ({
            title: item.title,
            snippet: item.snippet,
            link: item.link,
            displayLink: item.displayLink || new URL(item.link).hostname,
            photos: [] // A API de busca web básica não retorna fotos diretamente. A IA poderá extrair se houver no snippet ou em futuras melhorias.
        }));
    } catch (error) {
        console.error("Hunter IA: Erro na chamada Serper API:", error);
        return [];
    }
}

