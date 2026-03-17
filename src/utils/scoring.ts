/**
 * Utilitário para cálculo de Lead Scoring (Qualificação de Leads)
 * Baseado no perfil do lead, engajamento e match de dados.
 */

interface LeadScoringData {
    email?: string | null;
    phone?: string | null;
    budget_min?: number | null;
    budget_max?: number | null;
    source?: string | null;
    urgency_score?: number | null;
}

/**
 * Calcula a pontuação de um lead de 0 a 100.
 * 
 * Critérios:
 * - Dados de Contato (50%): Email (+20), Telefone (+30)
 * - Perfil Comercial (20%): Possui orçamento (+20)
 * - Origem do Lead (15%): Hunter IA (+15), Outros (+5)
 * - Urgência Declarada (15%): Score de Urgência * 3 (Max +15)
 */
export function calculateLeadScore(lead: LeadScoringData): number {
    let score = 0;

    // 1. Dados de Contato
    if (lead.email && lead.email.includes('@')) {
        score += 20;
    }
    
    if (lead.phone && lead.phone.length >= 8) {
        score += 30;
    }

    // 2. Perfil Comercial (Orçamento)
    if ((lead.budget_min && lead.budget_min > 0) || (lead.budget_max && lead.budget_max > 0)) {
        score += 20;
    }

    // 3. Origem (Confiança na fonte)
    if (lead.source === 'hunter') {
        score += 15;
    } else if (lead.source === 'direct' || lead.source?.includes('portal')) {
        score += 5;
    }

    // 4. Urgência (1-5)
    if (lead.urgency_score) {
        score += Math.min(lead.urgency_score * 3, 15);
    }

    return Math.min(score, 100);
}

/**
 * Retorna uma label visual baseada no score
 */
export function getLeadScoreLabel(score: number): { label: string, color: string } {
    if (score >= 80) return { label: '🔥 Hot', color: 'text-red-500 bg-red-50 dark:bg-red-900/20' };
    if (score >= 50) return { label: '⚡ Warm', color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' };
    if (score >= 20) return { label: '💧 Cold', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' };
    return { label: '🧊 Ice', color: 'text-zinc-500 bg-zinc-50 dark:bg-zinc-900/20' };
}
