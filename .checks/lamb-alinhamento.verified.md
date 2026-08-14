# Alinhamento ao Lamb: verificação

**Verdict**: PASS (45/45 checks com prova verde e asserção localizada; achados abaixo, nenhum é condição de FAIL no perfil `light`)
**Profile**: light (o `AGENTS.md` não declara perfil)
**Diff range**: `5b8f934..working-tree` (nada commitado; `git diff 5b8f934` + 20 arquivos não rastreados)
**Round**: 1 - full, verificado no working tree em 2026-10-07
**Verifier**: sub-agente independente (author != verifier), somente leitura. `git status --porcelain` igual antes e depois (md5 `4c7a2d8c…`)

## Passos que não rodaram

- **Passo 1 (comparação com as fontes binding)**: não roda no `light`. O artefato Lamb
  (`tokens.json`, `bundle.css`, READMEs) **não** foi comparado tela a tela com os checks. A
  fidelidade de composição e arranjo das stories segue **não verificada contra o design**.
  Exceção pontual: os 16 literais de sombra do C2 foram conferidos contra a cópia local de
  `tokens.json` e batem.
- **Passo 4 (injeção de falhas)**: não roda no `light`. Nenhum mutante foi injetado. A capacidade
  das asserções de pegar regressão não foi medida.
- **Join de `Coverage` e linhas de `Test policy`**: só rodam em `standard`/`ui`. O artefato não tem
  `## Test policy`.

## Provas

Uma única invocação do Jest com os 20 arquivos e a alternância `-t` dos 86 nomes de prova do
checklist (`--json`, 423 passed, 0 failed; os 74 skipped são testes fora do filtro). Cruzei cada par
(arquivo, nome) com os testes que de fato passaram: **86/86 nomes casam pelo menos um teste
`passed` no arquivo indicado. Nenhum filtro vazio.** Grep do C3 rodado à parte (exit 0, sem
ocorrências). Gate C45 rodado duas vezes: `npm run verify` (7/10 do cache do turbo) e
`npx turbo run typecheck lint test --force` (0 do cache).

## Checks

Caminhos relativos a `packages/ui/src/`.

| Check | Claim | Proof run | Evidence (file:line - asserção) | Result |
|---|---|---|---|---|
| C1 | 33 utilitários semânticos × 2 temas | `styles.spec.ts` "semantic utilities resolve light/dark values" 37+37 passed | `styles.spec.ts:189` `expect(resolveValue(value, scopes.light).toUpperCase()).toBe(light)` · `:198` idem `scopes.dark` → `dark`; tabela legível em `:112-149` = tabela do critério 1 (+ 3 `fill-brand-*`) | PASS |
| C2 | 16 `shadow-elevation-*` | "elevation shadows match tokens" 16 passed | `styles.spec.ts:206-208` `expect(resolveValue(declOf(css, selector, '--tw-shadow'), scopes.light)).toBe(literal)`; literais em `:152-168`, conferidos contra `tokens.json` local | PASS |
| C3 | Inter, sem Noto Sans | "font-sans is Inter" 3 passed; grep exit 0 | `styles.spec.ts:213` `expect(scopes.light.get('--font-sans')).toBe('var(--font-inter)')` · `:224-228` import `Inter` de `next/font/google`, `variable: '--font-inter'`, `not.toMatch(/noto/i)` nas 2 assemblies; grep mais amplo no repo: só a própria spec | PASS |
| C4 | `:focus-visible` 2px `focus-ring` offset 2, clique sem outline | "focus-visible ring" 1 passed | `styles.spec.ts:235` `toBe('2px solid var(--color-focus-ring)')` · `:236` offset `'2px'` · `:237-238` resolve `#27272F` / `#FFFFFF` · `:239` `':focus:not(:focus-visible)'` → `'none'` | PASS |
| C5 | reduced motion ≤ 0,01ms, inclusive `motion` | styles "reduced motion" 1 + NavItem "reduced motion" 2 passed | `styles.spec.ts:257-264` `toEqual({ value: '0.01ms', important: true })` p/ transition e animation · `NavItem.spec.tsx:71` `expect(list).toHaveStyle({ opacity: '1' })` após 1 frame (controle negativo `:80`) | PASS |
| C6 | disabled → `not-allowed` | "disabled cursor" 1 passed | `styles.spec.ts:277-281` `declOf(css, ":disabled, [aria-disabled='true']", 'cursor')).toBe('not-allowed')` e todo `:disabled` = `not-allowed` | PASS |
| C7 | Button medidas, tipo, ícone, gap, `type`, 44px | "sizes" 3+1, "type defaults to button" 1, "small hit area" 1 passed | `Button.spec.tsx:79-81` `toHaveClass('gap-2', ...boxClasses)` / `('font-medium', textClass)` / `(iconClass)` com tabela `:50-68` (`h-8 px-3 py-2 rounded-lg`, `text-size-50`, `text-icon-16!` …) · `:88` `toHaveAttribute('type', 'button')` · `:98-103` `after:-inset-y-1.5` | PASS |
| C8 | matriz 3×4 + disabled por variante | "variant x color matrix" 12, "disabled per variant" 3 passed | `Button.spec.tsx:169-176` rest + `not-disabled:hover:bg-${hover}` + `not-disabled:active:bg-${hover}` + `transition-[background-color]` `duration-150` `ease-out`, tabela `:106-158` · `:192-195` disabled por variante (tabela `:180-183`) | PASS |
| C9 | IconButton quadrado, matriz, 44px | "square sizes" 3, "shares the button matrix" 12, "small hit area" 1 passed | `IconButton.spec.tsx:19-22` (`size-8 p-2 rounded-lg` / `text-icon-16!`…) · `:89-93` rest/hover/active · `:107-110` disabled · `:121-126` hit area · tipo: `atoms/IconButton/IconButton.tsx:31` `'aria-label': string` | PASS |
| C10 | Badge high 11 cores, neutral, padrões, `<span>` | "high colors" 11, "defaults" 2 passed | `Badge.spec.tsx:23-26` `` `bg-${color}-83`, 'text-on-accent' `` (10 cores) · `:37-38` `bg-action-primary text-inverse` + `not.toMatch(/(^\|\s)border/)` · `:45-53` `SPAN`, `inline-flex whitespace-nowrap h-5 text-size-25 bg-neutral-alpha/10 text-neutral-100` | PASS |
| C11 | Tag 11 cores, medidas, padrões | "low colors" 11, "sizes" 3, "defaults" 1 passed | `Tag.spec.tsx:50-53` `` `bg-${color}-alpha/10`, `text-${color}-100` `` · `:69-70` `gap-1` + tabela `:57-59` (`h-5 py-0.5 px-1 rounded-md` / `text-icon-14!` …) · `:78-86` `SPAN`, `bg-blue-alpha/10`, `h-5` | PASS |
| C12 | Avatar tamanhos, cores, iniciais, `className` | "sizes" 7, "initials" 5 passed | `Avatar.spec.tsx:40` + tabela `:32-36` (`size-6/8/12/14/20`) · `:46-54` padrão `size-8`, `bg-neutral-17 text-neutral-100 font-semibold inset-ring inset-ring-neutral-17` · `:79-81` "Fulano de Tal Teste"→`^FT$` · `:68-69` `shrink-0` no wrapper | PASS (ver achado 6) |
| C13 | iniciais quando a imagem falha | "falls back to initials on error" 1 passed | `Avatar.spec.tsx:93-94` `querySelector('img')).toBeNull()` e `toHaveTextContent('PF')` após `fireEvent.error` | PASS |
| C14 | wrapper `role=img` + `aria-label`, `<img alt="">` | "accessible name" 1 passed | `Avatar.spec.tsx:104-106` `aria-label` = alt, `photo` `alt=''`, um único `img` | PASS |
| C15 | 5 aliases + expand_*, `label`, `aria-hidden` | "aliases" 7, "label" 2, "aria-hidden" 1 passed | `Icon.spec.tsx:52-53` glifo presente / alias ausente (tabela `:42-48`) · `:60-61` `role=img` nomeado sem `aria-hidden` · `:68-69` `aria-hidden='true'` mesmo com `aria-hidden={false} role="img"` | PASS |
| C16 | Tooltip cores, caixa, sombra, 8px, tipo, 120ms, 4 placements | "appearance" 4, "size" 3 passed | `Tooltip.spec.tsx:24-37` `bg-neutral-999 text-inverse px-2 py-1 rounded-lg whitespace-nowrap shadow-elevation-high-bottom duration-120 ease-out` + `mb-2/mt-2/mr-2/ml-2`, `children` 0 (sem seta) · `:48` tabela `:42-44` (`text-size-50 leading-5` / `text-size-100` = 18/28 pelo token) | PASS |
| C17 | `Esc` com foco fora, describedby mescla | "escape closes" 2, "merges aria-describedby" 1 passed | `Tooltip.spec.tsx:59` `document.body` com foco → `:63` `data-open 'false'` · `:91` `` `hint ${tooltipId}` `` | PASS |
| C18 | `d3` 24/30, `p0` 18/28 | "d3" 1, "p0" 1 passed | `Typography.spec.tsx:10-16` `font-oswald font-bold text-size-300 leading-7.5` · `:23-25` `P`, `font-sans font-normal text-size-100`, sem `leading-` | PASS |
| C19 | Checkbox nativo, medidas, glifos, estados | "native input" 1, "states" 4 passed | `Checkbox.spec.tsx:304-306` `INPUT` `type=checkbox` dentro de `label` · `:331-344` tabela `:318-325` (`size-4 rounded-md` / `text-icon-14!` / `text-size-50`; large `leading-8`), `border-2 duration-250`, glifo `text-neutral-00` · `:352-377` vazio/hover/marcado/erro/sucesso/disabled; glifo `remove` em `:185` | PASS |
| C20 | describedby, `aria-invalid`, clique no rótulo | "describedby" 1, "aria-invalid" 1, "label click toggles" 1 passed | `Checkbox.spec.tsx:392` `` `extra ${helper.id}` `` · `:408-417` `aria-invalid 'true'` só no erro · `:429`/`:433` alterna pelo `label` e pelo texto | PASS |
| C21 | campo em repouso | Field "rest" 3 passed | `atoms/Field/Field.spec.tsx:32-35` `border border-control bg-surface`, tabela `:24-26` (`h-8 px-3 py-1.5 rounded-lg`…), `text-primary placeholder:text-secondary`, ícone `text-secondary` | PASS (lacuna de amostragem, achado 4) |
| C22 | hover `neutral-83`, foco ring 1px, 150ms | "hover and focus" 1 passed | `Field.spec.tsx:43-55` token `hover:…:border-neutral-83`; `focus-within:border-focus-ring focus-within:ring-1 focus-within:ring-focus-ring transition-[border-color,box-shadow] duration-150` | PASS |
| C23 | erro e sucesso do campo | "error state" 1, "success state" 1 passed | `TextField.spec.tsx:34-39` `border-red-67 ring-1 ring-red-67`, `aria-invalid`, helper `text-danger`, ícone `text-icon-16!` com `'FILL' 1`, nenhum `error` na caixa · `:49-54` `border-green-83`, `text-positive`, `check_circle` | PASS (achados 4 e 6) |
| C24 | disabled do campo | Field "disabled" 1 passed | `Field.spec.tsx:61-71` `bg-hover border-default cursor-not-allowed`, sem `hover:`, input `text-disabled placeholder:text-disabled` | PASS |
| C25 | rótulo, gaps, asterisco, "(Opcional)" | "label" 4, "required marker" 1 passed | `TextField.spec.tsx:67-69` `LABEL`, `font-normal text-primary` + tabela `:58-60` (`text-size-25`/`gap-1`…) · `:77-81` `ml-auto text-size-50 text-secondary`, sem `aria-required` · `:89-96` asterisco irmão `aria-hidden` `text-danger`, `aria-required='true'` | PASS |
| C26 | helper `<p>` 14/20 (12/16 small) em describedby | "helper text" 3 passed | `TextField.spec.tsx:109-117` `text-secondary` + tabela `:100-102`, `aria-describedby` = `helper.id`; `<p>` via `helperOf` `:13` | PASS |
| C27 | senha | "password toggle" 1 passed | `TextField.spec.tsx:127-137` `aria-pressed` false→true, `visibility`→`visibility_off`, sem `lock` | PASS |
| C28 | ids únicos no RHF | "unique ids" 2 passed | `TextField.spec.tsx:155` `expect(first?.id).not.toBe(second?.id)` (RHF) · `:168` (sem RHF) | PASS |
| C29 | contador do TextArea, rows 4, resize, 18/28 | "counter" 2(+1), "textarea" 2 passed | `TextArea.spec.tsx:27-35` `aria-live 'polite'`, `self-end text-size-25 text-secondary`, `'3/10 caracteres'`, depois do campo · `:57-59` no `aria-describedby` · `:70-72` `rows '4'`, `resize-y text-size-100` | PASS (precisão, achado 5) |
| C30 | SearchField | "search landmark" 2, "keyboard" 3, "clear button" 8 passed | `SearchField.spec.tsx:57-61` `role=search`, `aria-label`/`placeholder` "Buscar" · `:81` `onSearch('termo')`, `:92-93`, `:115-119` (RHF) · `:133-134` um botão "Limpar busca", `:165` ausente disabled (2 modos), `:177` ausente vazio, `:197-198` ícone por tamanho, `:206-209` `[&_input::-webkit-search-cancel-button]:appearance-none` | PASS |
| C31 | NavItem desktop/mobile | "appearance" 1 passed | `NavItem.spec.tsx:90-110` `min-h-12 px-3.5 py-3 rounded-xl text-size-75` + `lg:min-h-8 lg:px-2.5 lg:py-1.5 lg:rounded-lg lg:text-size-50`, `text-secondary hover:bg-hover hover:text-primary`, ícone `text-icon-24! lg:text-icon-20!` | PASS |
| C32 | `activated`, `selected`, blur | "activated" 1, "selected" 2, "blur keeps state" 1 passed | `NavItem.spec.tsx:117-119` `bg-selected text-primary`, `aria-current 'page'`, preenchido · `:126-129` sem fundo nem `aria-current` · `:167-171` blur não muda | PASS |
| C33 | expansão e sub-item | "expanded" 1, "sub-item" 1 passed | `NavItem.spec.tsx:186-201` `text-icon-20! duration-200`, `rotate-180`, `aria-expanded`, `aria-controls`=`list.id`, sem `aria-haspopup`, ícone não preenchido · `:220-231` `pl-9.5 before:left-4.75 before:size-1` nos 2 sub-itens, sem `before:` na lista | PASS |
| C34 | colapsado | "collapsed" 1 passed | `NavItem.spec.tsx:240-250` sem texto, `aria-label`/`title`, `w-8`; sem eles fora do modo | PASS |
| C35 | Cell default, heading, icon/avatar, ações | "default" 3, "heading" 6, "icon and avatar" 1, "actions" 1 passed | `atoms/Cell/Cell.spec.tsx:257-263` `font-medium text-size-50 text-primary` / `font-normal text-size-25 text-secondary` / `gap-0.5` · `:269-273` · `:286`, `:296-304` `text-icon-20!`, Avatar `size-8` antes do texto · `:322-328` `size-8 bg-transparent text-primary not-disabled:hover:bg-neutral-alpha/10` | PASS |
| C36 | Table cabeçalho, densidade, estados, colunas, caption | "density" 4, "row states" 2, "caption" 2, "align right" 1 passed | `organisms/Table/Table.spec.tsx:582` `toHaveClass(height)` (tabela `:573-575` `h-12/h-10/h-8`) · `:600-608` `border-b border-default bg-surface`, `aria-selected` + `bg-selected`, `hover:bg-hover` · `:624-632` caption visível / `sr-only` · `:659-664` `w-10`, `tabular-nums` | PASS (achado 4) |
| C37 | ciclo de ordenação | "sort cycle" 5 passed | `Table.spec.tsx:695-701` `aria-sort`=`from`, glifo `text-icon-16!`, `onSortChange('situacao', next)` (tabela `:668-670`) · `:716-719` sem direção → `none` → `ascending` | PASS |
| C38 | rótulos de seleção, padrão, vazio | "selection labels" 1, "selectable default" 1, "empty state" 1 passed | `Table.spec.tsx:736-743` "Selecionar todos", `` `Selecionar ${name}` `` · `:749-750` nenhum checkbox · `:756-760` `px-4 py-10 text-secondary` | PASS |
| C39 | Paginator | "range pt-BR" 1, "page size defaults" 1, "button appearance" 1, "nav label" 1 passed | `molecules/Paginator/Paginator.spec.tsx:363-370` `aria-live 'polite'`, raiz `gap-6 flex-wrap font-normal text-size-25 text-secondary` · `:380` `['10','25','50','100']` (helper `:7-23` não passa `pageSizeOptions`) · `:389-418` páginas, navegação, select · `:423-431` "Paginação" / `label` | PASS |
| C40 | `totalItems` 0 | "empty total" 1 passed | `Paginator.spec.tsx:438-446` `'0-0 de 0 itens'`, `['1']`, `aria-current 'page'` | PASS |
| C41 | Toast cores, caixa, título, `<p>`, fechar | "variant colors" 4, "layout" 2, "close button" 1 passed | `molecules/Toast/Toast.spec.tsx:64` tabela `:52-55` · `:84-95` `rounded-10! p-3! max-w-80! min-h-0! shadow-elevation-high-bottom!`, `gap-2`, título `font-semibold text-size-50 leading-5` · `:101-102` só um `<p>` · `:109-111` `type 'button'`, `size-8 rounded-lg`, `text-icon-20!` | PASS |
| C42 | container, região, roles, 6000ms, pausa | "container" 2, "roles" 4 passed | `Toast.spec.tsx:125-133` região "Notificações", `--bottom-right right-6! bottom-6! gap-2`, `animationDuration '6000ms'` · `:152-172` pausa em hover e foco · `:191` tabela `:177-180` | PASS |
| C43 | ação da story do Toast | "action button" 1 passed | `Toast.spec.tsx:203-210` `h-8 py-2 px-3 rounded-lg bg-neutral-999 text-neutral-00` (de `meta.args.action`) | PASS |
| C44 | 14 nós nas stories e no doc | "story design links" 14, "figma-components doc" 55 passed | `figma-links.spec.ts:60-67` URL começa com `nodeUrl(id)` (tabela `:25-38` = Sources da task) · `:86-87` linha do doc contém cada nó · `:129` mapeamento semântico, `:144-146` raio | PASS (achado 7) |
| C45 | gate completo | `npm run verify` exit 0; `turbo … --force` exit 0 | 10/10 tarefas turbo, 0 do cache no `--force`; `@church/ui` 20 suítes, 497 passed | PASS |

## Swept (linhas "existing" relidas no código)

| Row | Constraint cited | Found |
|---|---|---|
| validation: salto de página | `Paginator.spec.tsx` C11 atual | sim, `Paginator.spec.tsx:224-234` (limiar) e `:237-252` (C12, entrada inválida) |
| concurrency: ordem de chegada | react-toastify `newestOnTop` padrão | sim, `molecules/Toast/Toast.tsx:114-132` não define `newestOnTop` (padrão `false`) |
| dependency failure: fontes | `next/font` self-host | sim, `apps/web/app/layout.tsx:1` e `.storybook/decorators.tsx:2` importam de `next/font/google`; Storybook usa `@storybook/nextjs` (`.storybook/main.ts:17`) |

## Achados para o usuário (ordenados)

1. **Passos 1 e 4 não rodaram (perfil `light`).** A interface tem design binding, mas os checks
   não foram confrontados com o artefato Lamb, e nenhum mutante foi injetado. O verde aqui prova
   "o código bate com o checklist", não "o checklist bate com o design". O próprio checklist já
   registra que subir para `ui` é decisão do usuário.
2. **Duas linhas de Landing foram gravadas depois do código**, como o Handoff declara:
   `slotProps.helperText` passa a `ComponentProps<'p'>` (lote B) e `label` da `Cell` de cabeçalho
   vira `ReactNode` (lote C). As duas são mudanças de tipo de API pública que a regra "A API
   existente fica" deveria ter barrado antes. A linha "Variáveis CSS públicas do
   `@church/tokens`" também surgiu no meio do build (lote A). Essas linhas pedem aceite explícito.
3. **Um teste foi enfraquecido.** Em `Checkbox.spec.tsx:106-117`, "requests a visible
   focus-visible ring" afirmava `focus-visible:ring-2` e `ring-neutral-999`. Agora só afirma a
   ausência de `outline-(none|0|hidden)`. O anel positivo passou para a regra global, provada no
   C4 (`styles.spec.ts:235-239`), então a cobertura migrou de nível e não sumiu. Ainda assim, no
   componente a asserção ficou só negativa. As demais remoções em `*.spec.*` foram trocadas por
   asserções iguais ou mais fortes, ou mudam o valor esperado porque um critério manda:
   - `aria-checked` → `toBeChecked`;
   - `horizontal_rule` → `remove`;
   - `[10,20,50]` → `[10,25,50,100]`;
   - "0 itens" → "0-0 de 0 itens" (C40);
   - Avatar 11px → 12px (Unresolved 2).

   Nenhum `.skip`, `.only` ou `xit` foi adicionado.
4. **Lacunas de amostragem e de nível.**
   - **C21:** o claim cobre os quatro campos da base, mas a prova é só no `Field`. A caixa do
     campo de salto do Paginator só tem tamanho afirmado (`Paginator.spec.tsx:134-136`,
     `w-17 h-8 rounded-lg`), sem `border-control` nem `bg-surface`.
   - **C23:** erro e sucesso só são provados no `TextField`. O `TextArea` não tem prova de estado.
   - **C36:** a altura por `density` é afirmada na `Cell` interna de cada célula
     (`cell.firstElementChild`), não no `<tr>`.
   - **Nível visual:** toda prova visual fora do S1 é por classe no jsdom, sem estilo computado.
     O "x" nativo escondido (C30) depende de uma variante arbitrária sem prova visual.
5. **Lacuna de precisão no C29.** O critério diz que o contador "lê 'N caracteres'". O código
   renderiza "3/10" visível + " caracteres" `sr-only` (`atoms/TextArea/TextArea.tsx:201`), e o
   teste afirma `'3/10 caracteres'`. O valor do checklist é impreciso: falta definir se o
   leitor deve ouvir "3 caracteres" ou "3/10 caracteres".
6. **Semântico afirmado por primitiva.** Avatar `inset-ring-neutral-17` (critério:
   `border-default`). Campo e Checkbox: `border-red-67` (critério: `danger-solid`) e
   `border-green-83` (critério: `positive-solid`). Conferi a equivalência nos dois temas:
   - `styles.css:47/233` ↔ `semantic.ts` `border.default` = grey17 / grey100;
   - `:79/265` red-67 → red-50 = `#F56752` (= `danger-solid` dark);
   - `:29/215` green-83 → green-33 = `#5BD279` (= `positive-solid` dark).

   Os valores batem hoje. Mas se o mapeamento semântico mudar, os testes não percebem.
7. **C44: três stories modificadas ficaram fora do conjunto.** Avatar, Icon e Tooltip foram
   modificadas, mas não têm nó em Sources. Icon e Tooltip não têm nenhum `parameters.design`,
   ausência que já existia em `5b8f934` e contraria a convenção de layout do `AGENTS.md`.
   Avatar ainda aponta o nó antigo `47-342`.
8. **Pendência funcional fora dos checks.** O `HelperText` do Checkbox continua em
   `neutral-67`/`red-67`/`green-67`. O Intent da task cita o helper em neutral-67 (3,2:1) como
   defeito de contraste, mas C19–C20 não cobrem a cor. O Handoff já pede levar isso ao usuário.
9. **Landing desatualizada.** O texto diz "Reusa … `fieldRingStyles`", mas `fieldRingStyles.ts` e
   `neutralFieldColor.ts` foram apagados, e `@church/ui/utils` deixou de exportá-los. Não sobrou
   referência no repositório; é só registro.
10. **Valores arbitrários e estilo inline.** O regex pedido
    (`^\+.*(\[[#0-9][^\]]*\]|style=\{\{)`) só encontrou falsos positivos: índices de array e uma
    linha de `figma-components.md` que descreve o Figma. Nenhuma cor inline foi introduzida.
    Entraram valores e variantes arbitrários fora do alcance do lint:
    - `transition-[background-color]`, `transition-[opacity,visibility]` e
      `transition-[border-color,box-shadow]`;
    - `[&_input::-webkit-search-cancel-button]:appearance-none`;
    - variantes `data-[state=…]`.

    O `shadow-[inset_0_-1px_0_0_…]` da Table já existia em `5b8f934`.
11. **Ruído na saída do Jest.** `console.error` de `window.scrollTo` e `console.warn` de reduced
    motion do `motion`, ambos no `NavItem.spec.tsx`. Não falham, mas poluem a saída do gate.

## Gate

- `npm run verify`: exit 0. 10/10 tarefas turbo, 7 vindas do cache.
- `npx turbo run typecheck lint test --force`: exit 0. 10/10 tarefas, 0 do cache.
  `@church/ui`: 20 suítes, 497 passed, 0 failed.
