## Context

Esta mudança envolve apenas o front-end (Vue) e duas áreas compartilhadas do produto: (1) navegação lateral no `AppLayout` e (2) telas e componentes ligados a “créditos de IA”. O objetivo é alinhar as telas de IA ao padrão visual do projeto e garantir acessibilidade/consistência no menu.

## Goals / Non-Goals

**Goals:**
- Adicionar links no menu lateral para as telas de uso de IA (incluindo a rota de `ai-credits`).
- Corrigir o item “planos de estudos” para exibir um ícone (com suporte no sistema de ícones).
- Garantir consistência visual nas telas de IA reaproveitando o mesmo conjunto de componentes/estilos existentes no projeto (tokens de cor, tipografia e superfícies).
- Garantir que os ícones usados nas telas de IA (e no menu) existam no `AppIcon` para evitar “buracos” visuais.

**Non-Goals:**
- Mudanças de APIs/contratos de dados.
- Reescrever fluxos de créditos de IA ou reestruturar stores.
- Alterar rotas existentes além de adicionar entradas no menu.

## Decisions

1) **Centralizar correções de ícones no `AppIcon.vue`**
Racional: as telas de IA e a navegação lateral usam `<AppIcon name="..." />`. Se algum `name` não existir, o SVG não renderiza e a UI fica inconsistente. Ao expandir o catálogo de ícones suportados, garantimos consistência e reduzimos divergência futura.

2) **Atualizar o menu lateral usando o array `navItems` do `AppLayout.vue`**
Racional: isso mantém um padrão único de navegação, com o mesmo layout/estilos e o mesmo componente de ícones.

3) **Ajustar “padrão visual” das telas de IA via reaproveitamento de tokens e componentes existentes**
Racional: ao alinhar classes utilitárias e padrões de cards/headers ao que já é usado em outras telas (com `rounded-xl`, `border-outline-variant`, `bg-surface-container-lowest` etc.), mantemos coerência sem introduzir novos padrões.

## Risks / Trade-offs

- [Risco] A lista de ícones necessários para as telas de IA pode crescer ao longo do desenvolvimento.
  - [Mitigação] Cobrir todos os `name` usados nos componentes de créditos de IA identificados no código e adicionar testes manuais visuais nas telas afetadas.

- [Risco] Ajustes visuais podem ter impacto percebido em telas além das de IA.
  - [Mitigação] Restringir mudanças de CSS/estrutura apenas aos componentes/trechos envolvidos (AI credits e navegação/menu).

## Migration Plan

1) Implementar: adicionar entradas de menu e ícones faltantes.
2) Implementar: ajustar classes/estrutura nas telas de IA quando necessário para alinhar ao padrão visual do projeto.
3) Validar manualmente: navegação lateral (desktop/mobile) e render completo das telas de créditos de IA (incluindo estados vazio/erro/carregando).
