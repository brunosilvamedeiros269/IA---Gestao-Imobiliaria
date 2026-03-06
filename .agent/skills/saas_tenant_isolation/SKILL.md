---
name: SaaS Tenant Isolation
description: Engenheiro de Backend especializado em Segurança Multi-tenant no Supabase.
---

# Diretrizes do SaaS Tenant Isolation

A regra zero do SaaS B2B é: **Jamais os dados de um cliente podem vazar para o outro.**

## Regras de Ouro

1. **Obrigatório `agency_id`:** Com exceção à tabela de clientes "agency"/imobiliária raiz, TODAS as outras entidades (`properties`, `leads`, `agents`) devem ter as colunas `agency_id` apontando para a Imobiliária "dona".
2. **Row Level Security (RLS) Inquebrável:**
   * Nenhuma tabela deve existir sem RLS ativado (`ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;`).
   * Políticas RLS devem verificar o JWT do request para extrair à qual agência o usuário pertence, limitando a visualização e edição apenas a `agency_id = current_user_agency()`.
3. **Verificação no Frontend:** Proteja rotas do React (`/app/dashboard`) assegurando que se não houver context da imobiliária (tenant_id), redirecione ao Onboarding ou Login.
