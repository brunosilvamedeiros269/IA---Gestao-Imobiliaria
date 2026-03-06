---
name: API First Mobile Readiness
description: Engenheiro Estrutural e Arquiteto de Camada de Dados para Mobile.
---

# Diretrizes API-First Mobile Ready

Desde o primeiro commit, este projeto não é apenas "uma aplicação Web React". É "Uma plataforma com API que consome via Web e consumirá no futuro em Apps Corretor e Cliente".

## Regras de Ouro

1. **Centralização das Queries:**
   * Queries diretas do client do supabase (ex: `supabase.from('properties').select('*')`) não devem estar misturadas dentro do `useEffect` das páginas React.
   * Crie uma camada de Serviço / Hooks. Exemplo: um arquivo `services/propertiesService.ts` isolando as lógicas de fetch/insert.
2. **Separação Estado Web x Dados:** Apenas consumiremos no Web o que a Service expôs. Desta maneira, quando o aplicativo Mobile for criado amanhã, ele reaproveitará a pasta `/services` de forma 100% igual.
3. **Padronização de Retorno:** Os serviços *sempre* devem devolver tipagens específicas (`types/Property.ts`), facilitando manutenção caso troquemos o provedor Supabase por outro num futuro distante.
