## 1. Navegação e ícones (menu e consistência visual)

- [x] 1.1 Atualizar `src/components/layout/AppLayout.vue` para adicionar um item de menu “Créditos de IA” apontando para a rota `ai-credits`.
- [x] 1.2 Corrigir/garantir o item “Planos de estudos” no menu lateral para exibir ícone (via catálogo de ícones do `AppIcon`).
- [x] 1.3 Expandir `src/components/AppIcon.vue` adicionando os ícones faltantes usados pelas telas de créditos de IA e pelo menu (incluindo `book-open`, `lightbulb`, `zap`, `refresh-cw`, `alert-circle`, `inbox`, `edit-2`, `history`, `users`, `arrow-down-left`, `arrow-up-right`, `minus-circle`).

## 2. Ajustes de padrão visual nas telas de uso de IA

- [x] 2.1 Revisar e ajustar `src/views/AiCreditsView.vue` e componentes em `src/components/aiCredits/` para reaproveitar os mesmos padrões de layout/containers e tokens visuais do projeto (bordas, superfícies, tipografia e espaçamentos).
- [x] 2.2 Revisar e ajustar `src/views/admin/AiCreditsManagementView.vue` e componentes em `src/components/aiCredits/` para manter o mesmo padrão visual (incluindo estados vazio/erro e seções de cabeçalho).

## 3. Validação

- [x] 3.1 Verificar manualmente no navegador que os links do menu abrem as telas de créditos de IA e que o item “planos de estudos” exibe ícone.
- [x] 3.2 Verificar manualmente que todos os ícones referenciados em telas de créditos de IA renderizam corretamente (incluindo estados de carregamento/erro/vazio).
- [x] 3.3 Rodar `npm run build` (ou o comando equivalente do projeto) para garantir que a build passa após as mudanças.
