# Variações do protótipo do Backoffice — verificação (itens 3a–3d)

> Build this with **tlc-implement**.
> Every criterion below becomes a check with a proof, referenced by its number. Nothing under
> `Unresolved` gets settled while building.

## Intent

`docs/pending.md` listou quatro variações do protótipo do Backoffice (node-id=570-12730) que
precisavam ser verificadas no código de `packages/ui`: sub-info no StatCard, ícone duplo no
Button, inputs embutidos no Paginator e user-footer no SideMenu. Sem verificação, qualquer uma
poderia ter sido construída do zero quando já existe ou, pior, estar implicitamente prometida
por `docs/pending.md` sem existir.

O grounding revelou que **os quatro itens já estão implementados**. Nenhuma extensão é
necessária. O resultado desta tarefa é registrar a prova e fechar os itens no backlog.

4 critérios em 4 slices · 0 one-way doors · 0 open

## Criteria

### 3a — StatCard sub-info

1. `StatCardProps` expõe `subs?: SubInfoProps[]`; quando passado com entradas, o componente
   renderiza um `SubInfo` por entrada abaixo do valor principal. O story `Default` de
   `StatCard.stories.tsx` demonstra dois sub-items (`iconName: 'person_add'` e
   `iconName: 'waving_hand'`).

### 3b — Button com ícone duplo

2. `ButtonProps` expõe `startIcon` e `endIcon` como props independentes; quando ambos são
   passados, o componente renderiza o `startIcon` antes do label e o `endIcon` depois. O
   story `Default` de `Button.stories.tsx` fornece os dois simultaneamente.

### 3c — Paginator com inputs embutidos

3. `Paginator` renderiza `PageSizeSelect` ("Linhas por página") sempre que há ao menos uma
   página.

4. `Paginator` renderiza `PageJumpField` ("Ir para página") quando `totalPages >= 6`
   (`MIN_PAGES_FOR_JUMP`). Com os 300 itens do protótipo e pageSize 10, isso resulta em
   30 páginas — o campo aparece. O story `FewPages` (`totalItems: 50` → 5 páginas) confirma
   que abaixo do limiar o campo não é exibido.

### 3d — SideMenu user-footer

5. `SideMenuProps` expõe `user?: NavUser` (`name`, `role`, `src`) e
   `onProfileClick?: MouseEventHandler<HTMLButtonElement>`; quando `user` é fornecido, o
   SideMenu renderiza Avatar + nome + cargo + botão "mais opções" no rodapé. A variação
   `WithoutUser` confirma que o footer é omitido quando `user` não é passado.

## Out of scope

- Remover ou alterar o limiar `MIN_PAGES_FOR_JUMP = 6` do Paginator — é decisão de DS,
  não um gap.
- Implementar qualquer dos itens 1, 2, 4 e 5 de `docs/pending.md` (ScrollBar, componentes
  custom do Dashboard, tela do Dashboard, story URLs — tratados separadamente).

## Observable

`None - no user-facing surface`

Este é um task de verificação de library; nenhuma tela ou endpoint é exposto.

## Swept

- validation: 4 — `PageJumpField.parsePage` valida que o input é inteiro entre 1 e totalPages
- failure modes: 4 — input inválido no PageJumpField define `state='error'` no Field sem propagar
- idempotency and retry: n/a — componentes de UI puros, sem efeito colateral persistido
- authorization: n/a — biblioteca de UI, sem camada de auth
- concurrency and ordering: n/a — estado local de React, sem shared state externo
- data lifecycle: n/a — nenhum dado persiste; props são passadas pelo consumidor
- external-dependency failure: n/a — sem chamada externa
- state transitions: 4 — texto → válido (jump) / inválido (error) → reset ao novo input
- observability: n/a — componentes de UI; erros visuais são o único sinal; sem logging necessário

## Impact

| Front | What changes |
|---|---|
| nenhum | todos os quatro componentes já existem; nenhum contrato muda |

## Decided

None — verificação pura; nenhuma decisão irreversível tomada.

## Sources

- `docs/pending.md` — itens 3a, 3b, 3c, 3d; fonte da demanda
- Figma Backoffice prototype — [node-id=570-12730](https://www.figma.com/design/HQ5Vfbwug9vzIskrlSIXJW/Backoffice?node-id=570-12730&m=dev) — referência visual dos quatro casos
- `packages/ui/src/components/molecules/StatCard/StatCard.tsx` — `subs?: SubInfoProps[]`
- `packages/ui/src/components/atoms/Button/Button.tsx` — `startIcon` + `endIcon`
- `packages/ui/src/components/molecules/Paginator/Paginator.tsx` — `MIN_PAGES_FOR_JUMP`
- `packages/ui/src/components/molecules/Paginator/components/PageJumpField.tsx` — lógica do campo
- `packages/ui/src/components/organisms/SideMenu/SideMenu.types.ts` — `NavUser`, `onProfileClick`

## Unresolved

| # | Kind | Question | Until answered |
|---|---|---|---|
| — | — | None | — |
