# Pending — Design System vs. Prototype

Itens identificados após análise do protótipo do Backoffice
([node-id=570-12730](https://www.figma.com/design/HQ5Vfbwug9vzIskrlSIXJW/Backoffice?node-id=570-12730&m=dev))
comparado ao estado atual de `packages/ui` e `apps/web`.

---

## 1. Componentes DS ausentes no código

| Componente DS | Figma                                                                                                           | Status                            |
| ------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **ScrollBar** | [node-id=154-2022](https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=154-2022&p=f) | Não implementado em `packages/ui` |

---

## 2. Componentes presentes no protótipo sem correspondência no DS

Esses elementos aparecem no protótipo do Dashboard mas **não têm um componente Lamb** definido — precisam de decisão: criar componente DS ou tratar como UI específica de `apps/web`.

### 2a. Tira de calendário horizontal (Agenda)

A seção "Agenda" usa uma faixa de dias da semana (Seg–Dom) com seleção de dia ativo e indicadores de eventos. Não corresponde ao `DatePicker` do DS (que é um picker de data completo). Possíveis abordagens:

- Novo componente DS `CalendarStrip` / `WeekStrip`
- Componente local em `apps/web/app/` (se for só desta tela)

### 2b. EventCard (card colorido de evento)

Cartão com barra lateral colorida (laranja / roxo / verde), título e subtítulo (local + data). Não há equivalente no DS. Possíveis abordagens:

- Novo componente DS ou variante de `ListItem`
- Componente local de `apps/web`

### 2c. Indicador de hora (linha sobre o calendário)

Linha horizontal posicionada absolutamente sobre a lista de eventos indicando o horário atual. Elemento purely visual, provavelmente componente local de `apps/web`.

---

## 3. Variações/props em uso no protótipo — verificadas ✓

Verificação concluída (ver `.tasks/backoffice-prototipo-variacoes.md`). Todos os quatro itens
já estavam implementados; nenhuma extensão foi necessária.

### 3a. StatCard — sub-info com ícone + contagem ✓

`StatCardProps.subs?: SubInfoProps[]` existe. O componente renderiza um `SubInfo` por entrada.
Story `Default` demonstra dois sub-items.

### 3b. Button com ícone duplo (leading + trailing) ✓

`ButtonProps` expõe `startIcon` e `endIcon` independentemente. Ambos são renderizados
simultaneamente via `getClonedResizedIcons`. Story `Default` fornece os dois.

### 3c. Paginator com inputs embutidos ✓

`PageSizeSelect` ("Linhas por página") aparece sempre. `PageJumpField` ("Ir para página")
aparece quando `totalPages >= 6` (`MIN_PAGES_FOR_JUMP`). Com os 300 itens do protótipo e
pageSize 10 → 30 páginas → campo visível. Limiar é decisão de DS, não um gap.

### 3d. SideMenu — user info footer com `MoreOptions` ✓

`SideMenuProps.user?: NavUser` (name, role, src) + `onProfileClick` já existem. Variação
`WithoutUser` confirma que o footer é omitido quando `user` não é passado.

---

## 4. Tela do protótipo não implementada em `apps/web`

| Tela                   | Rota                | Status                                      |
| ---------------------- | ------------------- | ------------------------------------------- |
| **Dashboard (Início)** | `/` ou `/dashboard` | `apps/web` é placeholder; página não existe |

A tela usa: `SideMenu`, `PageHeader`, 4× `StatCard`, `Section` + tira de calendário + lista de eventos + `Paginator`. Os componentes DS já existem; falta a página da rota e os componentes custom (itens 2a–2c acima).

---

## 5. URLs dos stories corrigidas (commit pendente)

18 stories tinham URLs do Figma apontando para nós errados. Todas foram atualizadas para os nós canônicos fornecidos (ver `docs/figma/links.md`). Componentes com URL que estava correta e permaneceu: `Avatar`, `Typography`.
