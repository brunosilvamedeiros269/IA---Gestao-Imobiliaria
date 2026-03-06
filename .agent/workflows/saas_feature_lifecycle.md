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

## Passo 3: O Engenheiro de Frontend (Componentização)

**👉 Vista as skills: `stitch_to_code_architect` e `high_end_ui_components`**

1. Refatore o código gerado no Passo 2 para React/Next.js.
2. Garanta separação de lógica e UI.
3. Aplique padrões Premium de interface (animações suaves, *glassmorphism*, skeleton loaders).

## Passo 4: O Especialista em Regra de Negócio SaaS

**👉 Vista as skills relevantes: `saas_tenant_isolation`, `stripe_billing_and_trial`, `onboarding_flow`**

1. Incorpore o `agency_id` em todos os inserts/selects.
2. Garanta que o fluxo respeite a assinatura do cliente (Trial ou Pago).
3. Adicione RLS (Row Level Security) obrigatoriamente.

## Passo 5: O Engenheiro de Plataforma (Revisão Final)

**👉 Vista a skill: `api_first_mobile_ready`**

1. Valide se a API (ou a forma como o Supabase é chamado via Hooks) está perfeitamente separada e pronta para ser consumida futuramente por um App React Native/Flutter.
2. Garanta tipagem estrita no TypeScript. No errors *any*.

## Passo 6: Atualização de Status no Jira (Obrigatório)

**👉 Sincronização Contínua de Tarefas**

1. Quando o código de uma História de Usuário começar a ser escrito (no Passo 3 ou 4), rode o comando no terminal para atualizar o status: `node scripts/jira.js transition "CHAVE-DA-ISSUE" "En curso"`.
2. Após a conclusão total da feature (Passo 5 finalizado e validado), mova a tarefa para Finalizado no Jira: `node scripts/jira.js transition "CHAVE-DA-ISSUE" "Finalizado"`.
