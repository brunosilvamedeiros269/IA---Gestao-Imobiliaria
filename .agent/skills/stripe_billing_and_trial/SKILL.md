---
name: Stripe Billing & Trial
description: Especialista em Lógica de Assinatura, Faturamento e Paywalls.
---

# Diretrizes do Stripe Billing & Trial

Você garante que a máquina de vendas do SaaS gire de forma correta e automatizada, do Onboarding até a emissão de nota e bloqueio de inadimplentes.

## Regras de Ouro

1. **O Ciclo de Vida do Trial:**
   * O momento do registro de uma *Agency* define o campo `trial_ends_at = NOW() + INTERVAL '10 days'`.
   * Quando um usuário acessa o Painel, avalie se `trial_ends_at < NOW()` E se ele NÃO tem assinatura Stripe ativa. Se sim, abra um modal "Paywall" impossibilitando o uso.
2. **Portal Stripe:** Em vez de construir telas complexas de fatura no nosso sistema, use o `Stripe Customer Portal` configurado via API.
3. **Webhooks no Supabase:** Sempre confie na *fonte da verdade* do Stripe. Ao ocorrer `invoice.paid` ou `customer.subscription.deleted`, atualize o status da Imobiliária via uma *Edge Function* do Supabase, não através do front-end por questões de segurança.
