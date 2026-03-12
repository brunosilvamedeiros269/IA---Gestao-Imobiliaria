---
description: Ciclo de Vida de Desenvolvimento do SaaS (A Equipe de Agentes)
---

# Fluxo de Trabalho Integrado da Equipe SaaS

Sempre que o usuário solicitar uma nova **funcionalidade (feature)**, **épico** ou **tela** para o SaaS CRM Imobiliário, VOCÊ (o Agente) deve seguir este fluxo passo-a-passo, vestindo o "chapéu" de cada um dos especialistas na ordem correta.

## Passo 1: O Arquiteto (Planejamento)

**👉 Vista a skill: `fullstack_systems_architect`**

1. Não escreva código ainda.
2. Analise os requisitos e modele os dados (Tabelas do Supabase, queries).
3. Atualize o `implementation_plan.md`.

## Passo 2: O Designer de UX (Interface Base)

**👉 Vista a skill: `stitch_ux_engineer`**

1. Se a feature exigir interface visual, formule prompts profissionais detalhando UX/UI.
2. Interaja com o usuário ou o Stitch MCP sugerindo melhorias de usabilidade e fluxos.
3. Obtenha os artefatos visuais e de código-fonte necessários.

## Passo 3: O Squad de Desenvolvimento em Ação

Nesta etapa o "Squad Principal" (Backend, Frontend, DBA e QA) entra em ação. Vista estes chapéus conforme a necessidade arquitetônica:

### 3.1: O Database Administrator (DBA)

**👉 Vista a skill: `dba_specialist`**

1. Com base no modelo de dados aprovado no Passo 1, execute `supabase migration new`.
2. Garanta de forma cega as regras de RLS (Row Level Security) e chaves estrangeiras (`agency_id`).

### 3.2: O Backend Developer

**👉 Vista a skill: `backend_developer`**

1. Programe os *Server Actions* (Next.js) isolando a lógica de negócio do front-end.
2. Trate exceções e prepare as rotinas de comunicação de rede (Supabase Fetch/Storage).

### 3.3: O Frontend Developer

**👉 Vista as skills: `frontend_developer`, `stitch_to_code_architect` e `high_end_ui_components`**

1. Refatore o código gerado no Passo 2 para React/Next.js consumindo as Actions do Passo 3.2.
2. Aplique padrões Premium de interface (animações suaves, *glassmorphism*, skeleton loaders, states do Shadcn UI).

### 3.4: O QA Automation Engineer (Validação)

**👉 Vista a skill: `qa_automation`**

1. Teste a *User Story* como usuário final. A UI está fluida? Os Toasts aparecem?
2. Em caso de gaps de usabilidade sistêmica ou *performance*, lance como Bugs Fixes na Sprint ou 'Débito Técnico' no Jira.

## Passo 4: O Especialista em Regra de Negócio SaaS

**👉 Vista as skills relevantes: `saas_tenant_isolation`, `stripe_billing_and_trial`, `onboarding_flow`**

1. Revise se o Squad vazou `agency_id` ou violou lógica de assinatura.

## Passo 5: Atualização de Status no Jira (Obrigatório)

**👉 Sincronização Contínua de Tarefas**

1. Quando o código de uma História começar a ser escrito (Passo 3), rode o comando no terminal: `node scripts/jira.js transition "CHAVE-DA-ISSUE" "Em curso"`.
2. Após o QA (Passo 3.4 e 4) dar o aceite, mova para: `node scripts/jira.js transition "CHAVE-DA-ISSUE" "Finalizado"`.
