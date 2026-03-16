"use server";

import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

export async function generatePropertyDescription(data: {
  title: string;
  type: string;
  listingType: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  suites?: number;
  area?: number;
  condominium?: number;
  iptu?: number;
  isFurnished?: boolean;
  petsAllowed?: boolean;
  amenities?: string[];
  neighborhood?: string;
  city?: string;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  // Fetch user profile to get agency_id
  const { data: profile } = await supabase
    .from('users_profile')
    .select('agency_id')
    .eq('id', user.id)
    .single();

  if (!profile) return { error: "Perfil não encontrado" };

  // Fetch agency to get their OpenAI API Key
  const { data: agency } = await supabase
    .from('agencies')
    .select('openai_api_key')
    .eq('id', profile.agency_id)
    .single();

  const apiKey = agency?.openai_api_key || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      error: "API Key da OpenAI não encontrada. Por favor, configure-a no painel de Configurações da Agência.",
    };
  }

  const openai = new OpenAI({
    apiKey: apiKey,
  });

  try {
    const prompt = `
      Você é um copywriter especialista em mercado imobiliário de alto padrão.
      Escreva uma descrição encantadora e profissional para um imóvel com as seguintes características:
      
      - Título: ${data.title}
      - Tipo: ${data.type}
      - Modalidade: ${data.listingType === 'sale' ? 'Venda' : 'Aluguel'}
      - Valor: R$ ${data.price.toLocaleString('pt-BR')}
      ${data.bedrooms ? `- Quartos: ${data.bedrooms}` : ''}
      ${data.suites ? `- Suítes: ${data.suites}` : ''}
      ${data.bathrooms ? `- Banheiros: ${data.bathrooms}` : ''}
      ${data.area ? `- Área: ${data.area}m²` : ''}
      ${data.neighborhood ? `- Bairro: ${data.neighborhood}` : ''}
      ${data.city ? `- Cidade: ${data.city}` : ''}
      ${data.isFurnished ? "- Mobiliado" : ""}
      ${data.petsAllowed ? "- Aceita pets" : ""}
      ${data.amenities?.length ? `- Comodidades/Lazer: ${data.amenities.join(', ')}` : ''}
      
      Instruções adicionais:
      1. Use um tom elegante, persuasivo e focado em benefícios.
      2. Destaque o potencial de valorização ou a qualidade de vida.
      3. Use emojis de forma moderada e profissional.
      4. Organize a descrição em parágrafos curtos.
      5. Finalize com uma chamada para ação (CTA) convidando para agendar uma visita.
      6. A saída deve ser apenas o texto da descrição, sem introduções extras.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em marketing imobiliário que escreve descrições de alta conversão."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const description = response.choices[0].message.content;

    return { description };
  } catch (error: any) {
    console.error("Erro ao gerar descrição com IA:", error);
    return {
      error: "Ocorreu um erro ao gerar a descrição. Verifique os logs do servidor.",
    };
  }
}
