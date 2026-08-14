## Purpose

Padronizar a experiência do usuário nas telas de uso de IA e na navegação relacionada, assegurando consistência visual e melhor encontrabilidade dos fluxos do produto.

## ADDED Requirements

### Requirement: Telas de uso de IA seguem o padrão visual do projeto
O sistema SHALL apresentar as telas de uso de IA com consistência de design (layout, hierarquia visual e componentes) em relação ao padrão adotado no restante do produto.

#### Scenario: A tela de IA exibe componentes com aparência consistente
- **WHEN** um usuário acessa qualquer tela de uso de IA
- **THEN** os elementos visuais principais (ex.: títulos, botões e cards) exibem a mesma linguagem visual (hierarquia, espaçamento e estilos) esperada para o produto

### Requirement: Menu de navegação fornece links para telas de IA e corrige ícone do menu “planos de estudos”
O sistema SHALL incluir/atualizar links no menu de navegação para permitir acesso às telas de uso de IA e SHALL exibir um ícone no item “planos de estudos”.

#### Scenario: O usuário encontra e acessa uma tela de IA pelo menu
- **WHEN** o usuário abre o menu de navegação
- **THEN** há um link visível para as telas de uso de IA e ao selecionar esse link o usuário é direcionado para a tela correspondente

#### Scenario: O item “planos de estudos” exibe ícone
- **WHEN** o usuário visualiza o menu de navegação
- **THEN** o item “planos de estudos” exibe um ícone ao lado do texto
