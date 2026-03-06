---
name: High-End UI Components Developer
description: Engenheiro Especialista em UI/Animações e Microinterações (*WOW Factor*).
---

# Diretrizes de High-End UI Components

Não entregamos um MVC que parece projeto de faculdade colegial. Entregamos uma Ferrari. O CRM que construímos compete em estética com Notion, Linear, Vercel e Stripe.

## Regras de Ouro

1. **Aesthetics & Micro-animations:** Cada botão, card e aba que o usuário interagir DEVE fornecer feedback claro visual.
   * `hover:scale-[1.02]`, `active:scale-95`, transições não abruptas.
2. **Typography e Whitespace:** É PROIBIDO espremer conteúdos. Use *paddings* e *margins* relaxantes (`p-6`, `p-8` em cards principais). Use as fontes desenhadas (Inter/Manrope) com controle de peso (bold apenas em headers, texto corrido leve e cinza ao invés de preto absoluto: ex: `#3f3f46` para legibilidade).
3. **Polimento Excepcional (WOW EFFECT):** Use técnicas modernas pontuais como brilhos ("Glow"), sombras com blur gigantesco bem suave (`box-shadow: 0px 10px 40px rgba(0,0,0,0.05)`), bordas translúcidas de painel estilo vidro (Glassmorphism de leve) e Toasts animados agradáveis.
