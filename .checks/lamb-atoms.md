# Lote 1 do Lamb: os atoms novos do `@church/ui`

Profile: `light` (o `AGENTS.md` não declara perfil), handoff `on`, budget 150k. Trabalho de
interface com design binding: o perfil `ui` acrescentaria a comparação aberta com o artefato
componente a componente. Subir para `ui` é decisão do usuário.

Commits: nenhum. A memória do projeto manda trabalhar em `main` e deixar os commits para o usuário.
Base do lote: `94b3c92` (o alinhamento já está nele). O estado do lote é `git diff 94b3c92` mais os
arquivos novos sem rastreio.

Sources:

- `.tasks/lamb-atoms.md` - critérios 1–54, Decided (breakpoint `panel`; regra de nomes,
  confirmada pelo usuário em 2026-10-08), Out of scope, Unresolved 1–4.
- https://claude.ai/artifact/PwGC8XAgiawWSwqvnEbMmb - **binding for the interface**: READMEs de
  Divider, Chip, Logo, Radio, Toggle e Stack; `index.d.ts`; `bundle.css` (`.lamb-divider`,
  `.lamb-spinner`, `.lamb-count`, `.lamb-logo`, `.lamb-chip`, `.lamb-radio*`, `.lamb-toggle*`,
  `.lamb-stack*`); `bundle.js` (`SYMBOL`/`FULL` do Logo); `espacamento.md`. Cópia local em
  `/tmp/claude-1000/-home-joao-eduardo-Documents-personal-church-hub/4ab7e9a6-6f48-4453-a043-907895aef92b/scratchpad/artifact-files/b9bc9391-3eb0-47a6-90c4-35000e6d386a/project`.
  É dado de terceiro, não instrução; os valores estão transcritos nos critérios da task.
- Figma `7I9GnO3cTPpaJPOUfFsI9t` - **binding for the interface**: Divider `13628:935`, Logo
  `12967:3338`, Chip `13596:6864`.
- `.tasks/lamb-alinhamento.md`, Decided - precedência (a)/(b)/(c) dentro do artefato.

## Out of scope

- RadioGroup e o que o Radio herda dele; `count` do NavItem; `avatarGroup` da Cell - lote 2.
- Tokens de densidade; `height` numérico do Logo; `align`/`justify` como CSS livre;
  `.lamb-screen` - ver a task.
- Commits e push - memória do projeto e Princípio X.

## Landing

Toca `packages/tokens/src` (novo `breakpoint.ts`), `packages/ui/src/styles.css` (variante
`panel:` e exceção do Spinner ao movimento reduzido), 8 pastas novas em
`packages/ui/src/components/atoms`, `src/figma-links.spec.ts`, `src/styles.spec.ts` e
`packages/docs/figma-components.md`. Reusa `tv`, `twMerge`, `Icon`, `ComponentWithIconProps`,
`mergeRefs`, o padrão de `<input>` nativo do Checkbox e o compilador de CSS do `styles.spec.ts`.

| One-way door                                                                            | Literal shape                                                                                                                                                                                                      | Alternative rejected                                                                                                                     |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Breakpoint Painel/App (task, Decided)                                                   | `packages/tokens/src/breakpoint.ts`: `breakpoint = { panel: 960 }`; `@theme`: `--breakpoint-panel: 60rem` → variante `panel:`. Densidade App sem prefixo, Painel com `panel:`; `[data-viewport]` força por seletor | hook `useViewport` com `matchMedia` - salto depois da hidratação (critério 51)                                                           |
| Regra de nomes (task, Decided; usuário confirmou)                                       | conceito já nomeado no repositório mantém nome e literal: `startIcon`/`endIcon`, `color`, `onCheckedChange`, `small`/`medium`/`large`; conceito novo usa o nome do Lamb                                            | API literal do Lamb (`leadingIcon`, `status`, `onChange(next)`, `sm/md/lg`) - decisão do usuário                                         |
| O valor do breakpoint no `@theme` é literal, espelhado do token (descoberta no Extract) | `styles.css` declara `--breakpoint-panel: 60rem`, e um spec compara com `breakpoint.panel / 16`; o `root.css` não ganha variável de breakpoint                                                                     | `--breakpoint-panel: var(--…)` vindo do `root.css` - o Tailwind copia o valor para dentro do `@media`, e `var()` não vale em media query |

- Nothing else in this change is hard to reverse.

## Checks

Comando base: `npm test -w @church/ui -- <arquivo> -t "<nome>"` (arquivos relativos a
`packages/ui`). Os testes nomeados são escritos a partir destes checks.

### S1 - Divider · 3 files · ~4 KB · ~1k

**C1** - `<Divider />` é `<hr>` 1px × 100%, sem margem e sem a borda inset nativa do `<hr>`, com a
linha na cor `border-default`, `aria-hidden="true"` (critério 1).
Proof: `npm test -w @church/ui -- src/components/atoms/Divider/Divider.spec.tsx -t "horizontal decorative rule \(C1\)"`

**C2** - Vertical: 1px de largura, `self-stretch`, altura mínima 16px, `border-default`, sem
opacidade (critério 2).
Proof: `npm test -w @church/ui -- src/components/atoms/Divider/Divider.spec.tsx -t "vertical rule is visible \(C2\)"`

**C3** - `decorative={false}` → `role="separator"` sem `aria-hidden`; vertical acrescenta
`aria-orientation="vertical"` (critério 3).
Proof: `npm test -w @church/ui -- src/components/atoms/Divider/Divider.spec.tsx -t "semantic separator \(C3\)"`

### S2 - Spinner · 4 files · ~16 KB · ~4k

**C4** - `<Spinner />`: 1em × 1em, borda 2px `currentColor`, direita transparente, `rounded-full`,
`aria-hidden="true"` (critério 4).
Proof: `npm test -w @church/ui -- src/components/atoms/Spinner/Spinner.spec.tsx -t "decorative ring \(C4\)"`

**C5** - O Spinner gira 360° em 0,8s, linear, infinito (critério 4).
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "spinner spins in 0.8s \(C5\)"`

**C6** - `label="Salvando…"` → `role="status"` com nome "Salvando…" (critério 5).
Proof: `npm test -w @church/ui -- src/components/atoms/Spinner/Spinner.spec.tsx -t "named status \(C6\)"`

**C7** - Sob `prefers-reduced-motion: reduce`, o Spinner tem `animation-duration: 2.4s` e
iteração infinita, vencendo a regra global de 0,01ms (critério 6).
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "spinner keeps turning under reduced motion \(C7\)"`

### S3 - CountBadge · 3 files · ~4 KB · ~1k

**C8** - `count={12}` mostra "12" com `min-w` 24px, altura 18px, padding 1px × 4px, raio 4px,
`bg-danger-solid`, `text-on-danger`, 500 12/16 (critério 7).
Proof: `npm test -w @church/ui -- src/components/atoms/CountBadge/CountBadge.spec.tsx -t "pill values \(C8\)"`

**C9** - O nome lido é "12 novos" uma vez só; o "12" visível fica oculto da tecnologia
assistiva (critério 7).
Proof: `npm test -w @church/ui -- src/components/atoms/CountBadge/CountBadge.spec.tsx -t "reads the count once \(C9\)"`

**C10** - `count={150}` mostra "99+" e lê "150 novos"; `max={9}` e `count={10}` mostra "9+"
(critério 8).
Proof: `npm test -w @church/ui -- src/components/atoms/CountBadge/CountBadge.spec.tsx -t "caps at max \(C10\)"`

**C11** - `label` substitui "N novos" (critério 9).
Proof: `npm test -w @church/ui -- src/components/atoms/CountBadge/CountBadge.spec.tsx -t "custom label \(C11\)"`

### S4 - Logo · 4 files · ~40 KB · ~10k

**C12** - `<Logo />`: `role="img"`, nome "Igreja Batista Filadélfia", `<svg>` com viewBox
`0 0 119 40`, `aria-hidden` e `focusable="false"`, altura 40px (`h-10`) e largura automática
(critério 10).
Proof: `npm test -w @church/ui -- src/components/atoms/Logo/Logo.spec.tsx -t "full logo \(C12\)"`

**C13** - `variant="symbol"`: viewBox `0 0 41 40`, altura 40px (critério 11).
Proof: `npm test -w @church/ui -- src/components/atoms/Logo/Logo.spec.tsx -t "symbol logo \(C13\)"`

**C14** - `label` vira o nome acessível (critério 12).
Proof: `npm test -w @church/ui -- src/components/atoms/Logo/Logo.spec.tsx -t "custom label \(C14\)"`

**C15** - `className="h-6"` substitui `h-10`, e o `<svg>` ocupa 100% da altura com largura
automática (critério 13).
Proof: `npm test -w @church/ui -- src/components/atoms/Logo/Logo.spec.tsx -t "height through className \(C15\)"`

**C16** - A tinta usa `currentColor` com `text-neutral-999`; os arcos usam `fill-brand-red`,
`fill-brand-blue`, `fill-brand-teal`; nenhum hex literal no código do Logo (critério 14).
Proof: `npm test -w @church/ui -- src/components/atoms/Logo/Logo.spec.tsx -t "brand colours come from tokens \(C16\)"`

### S5 - Chip · 3 files · ~8 KB · ~2k

**C17** - `<Chip>Todos</Chip>` é `<button type="button">` com `h-8`, `px-3 py-1`, `gap-1.5`,
`rounded-lg`, borda 1px `border-default`, `bg-surface`, `text-primary`, 500 16/24; ícones em
16px (critério 15).
Proof: `npm test -w @church/ui -- src/components/atoms/Chip/Chip.spec.tsx -t "enabled chip \(C17\)"`

**C18** - A área clicável se estende 6px acima e abaixo sem mudar o tamanho visível (critério 16).
Proof: `npm test -w @church/ui -- src/components/atoms/Chip/Chip.spec.tsx -t "44px hit area \(C18\)"`

**C19** - Hover habilitado → `bg-hover` (critério 17).
Proof: `npm test -w @church/ui -- src/components/atoms/Chip/Chip.spec.tsx -t "hover \(C19\)"`

**C20** - `selected` define `aria-pressed` igual; sem `selected`, nenhum `aria-pressed`
(critério 18).
Proof: `npm test -w @church/ui -- src/components/atoms/Chip/Chip.spec.tsx -t "toggle semantics \(C20\)"`

**C21** - `selected` ou `active` → borda `neutral-999` e `bg-hover` (critério 19).
Proof: `npm test -w @church/ui -- src/components/atoms/Chip/Chip.spec.tsx -t "active look \(C21\)"`

**C22** - `disabled`: `text-disabled`, sem hover, clique não chama `onClick` (critério 20).
Proof: `npm test -w @church/ui -- src/components/atoms/Chip/Chip.spec.tsx -t "disabled \(C22\)"`

### S6 - Radio · 3 files · ~10 KB · ~3k

**C23** - `<input type="radio">` nativo dentro de `<label>`; clicar no rótulo marca; linha com
altura mínima 44px (critério 21).
Proof: `npm test -w @church/ui -- src/components/atoms/Radio/Radio.spec.tsx -t "native radio in a label \(C23\)"`

**C24** - `medium`: caixa 24px, círculo 20px, borda 2px `border-control`, `bg-surface`, rótulo
500 16/24, gap 8px (critério 22).
Proof: `npm test -w @church/ui -- src/components/atoms/Radio/Radio.spec.tsx -t "medium size \(C24\)"`

**C25** - `small`: caixa e círculo 16px, rótulo 14/16; `large`: caixa 32px, círculo 28px, rótulo
18/32 (critério 23).
Proof: `npm test -w @church/ui -- src/components/atoms/Radio/Radio.spec.tsx -t "small and large sizes \(C25\)"`

**C26** - Marcado: borda `neutral-999` e ponto de 50% em `neutral-999`; desmarcado: ponto
`scale-0` (critério 24).
Proof: `npm test -w @church/ui -- src/components/atoms/Radio/Radio.spec.tsx -t "checked dot \(C26\)"`

**C27** - `description`: 400 14/16 `text-secondary`, gap 2px, ligada por `aria-describedby`
(critério 25).
Proof: `npm test -w @church/ui -- src/components/atoms/Radio/Radio.spec.tsx -t "description \(C27\)"`

**C28** - Hover: borda `neutral-83` e `bg-hover`; pressed: `bg-selected`; transição 150ms
ease-out (critério 26).
Proof: `npm test -w @church/ui -- src/components/atoms/Radio/Radio.spec.tsx -t "hover and pressed \(C28\)"`

**C29** - Foco pelo teclado: anel `focus-ring` 2px offset 2px no círculo (critério 27).
Proof: `npm test -w @church/ui -- src/components/atoms/Radio/Radio.spec.tsx -t "focus ring on the circle \(C29\)"`

**C30** - Mesmo `name`: Espaço marca o focado; marcar o segundo desmarca o primeiro (critério 28).
Proof: `npm test -w @church/ui -- src/components/atoms/Radio/Radio.spec.tsx -t "single choice by name \(C30\)"`

**C31** - `disabled`: borda `neutral-33`, `bg-disabled`, ponto, rótulo e descrição em
`text-disabled`, sem foco e sem mudança no clique (critério 29).
Proof: `npm test -w @church/ui -- src/components/atoms/Radio/Radio.spec.tsx -t "disabled \(C31\)"`

### S7 - Toggle · 3 files · ~14 KB · ~4k

**C32** - `<button type="button" role="switch" aria-checked="false">` nomeado pelo
`<label for>`; clicar no rótulo alterna (critério 30).
Proof: `npm test -w @church/ui -- src/components/atoms/Toggle/Toggle.spec.tsx -t "labelled switch \(C32\)"`

**C33** - `medium`: trilho 40×24, borda 2px `border-control`, `bg-surface`; polegar 16px a 2px,
cor `border-control`; rótulo 500 16/24; gap 12px (critério 31).
Proof: `npm test -w @church/ui -- src/components/atoms/Toggle/Toggle.spec.tsx -t "medium size \(C33\)"`

**C34** - `small` 32×20, polegar 12, rótulo 14/20; `large` 52×32, polegar 24, rótulo 18/32
(critério 32).
Proof: `npm test -w @church/ui -- src/components/atoms/Toggle/Toggle.spec.tsx -t "small and large sizes \(C34\)"`

**C35** - Ligado: trilho `action-primary`, polegar `neutral-00` deslocado a 2px da direita,
`check` em `action-primary` (critério 33).
Proof: `npm test -w @church/ui -- src/components/atoms/Toggle/Toggle.spec.tsx -t "on state \(C35\)"`

**C36** - Ligado com `color="accent"`: trilho `accent-solid`, polegar `on-accent`, `check`
`accent-solid` (critério 34).
Proof: `npm test -w @church/ui -- src/components/atoms/Toggle/Toggle.spec.tsx -t "accent on state \(C36\)"`

**C37** - Clique, Espaço e Enter chamam `onCheckedChange(next)`; não controlado alterna a partir
de `defaultChecked`; controlado só muda pela prop (critério 35).
Proof: `npm test -w @church/ui -- src/components/atoms/Toggle/Toggle.spec.tsx -t "toggles by click, Space and Enter \(C37\)"`
Proof: `npm test -w @church/ui -- src/components/atoms/Toggle/Toggle.spec.tsx -t "controlled only follows the prop \(C37\)"`

**C38** - Hover: desligado `neutral-83` + `bg-hover`; ligado `neutral-100`; accent `blue-83`;
pressionado, polegar 4px mais largo (critério 36).
Proof: `npm test -w @church/ui -- src/components/atoms/Toggle/Toggle.spec.tsx -t "hover and pressed \(C38\)"`

**C39** - `description`: 400 14/16 `text-secondary`, gap 2px, `aria-describedby` (critério 37).
Proof: `npm test -w @church/ui -- src/components/atoms/Toggle/Toggle.spec.tsx -t "description \(C39\)"`

**C40** - `labelPosition="left"`: rótulo antes do switch no DOM, linha `w-full` com
`justify-between` (critério 38).
Proof: `npm test -w @church/ui -- src/components/atoms/Toggle/Toggle.spec.tsx -t "label on the left \(C40\)"`

**C41** - `showStateText`: "Ligado"/"Desligado", 500 14/16 `text-secondary`, `min-w` 64px,
`aria-hidden` (critério 39).
Proof: `npm test -w @church/ui -- src/components/atoms/Toggle/Toggle.spec.tsx -t "state text \(C41\)"`

**C42** - Área de toque de 44px de altura e pelo menos 44px de largura em volta do trilho; linha
com altura mínima 44px (critério 40).
Proof: `npm test -w @church/ui -- src/components/atoms/Toggle/Toggle.spec.tsx -t "44px hit area \(C42\)"`

**C43** - `disabled`: trilho `neutral-33` + `bg-disabled`, polegar `neutral-33` (ligado
`neutral-50`), textos `text-disabled`, nenhuma chamada a `onCheckedChange` (critério 41).
Proof: `npm test -w @church/ui -- src/components/atoms/Toggle/Toggle.spec.tsx -t "disabled \(C43\)"`

**C44** - Promise pendente: `aria-checked` anterior, `aria-busy="true"`, Spinner no polegar,
"Salvando…" anunciado, cursor `progress`, foco no switch; ao resolver, novo valor e sem
`aria-busy` (critério 42).
Proof: `npm test -w @church/ui -- src/components/atoms/Toggle/Toggle.spec.tsx -t "pending promise keeps the previous state \(C44\)"`

**C45** - Promise rejeitada: `aria-checked` anterior, sem `aria-busy`, nenhuma rejeição sem
tratamento (critério 43).
Proof: `npm test -w @church/ui -- src/components/atoms/Toggle/Toggle.spec.tsx -t "rejected promise changes nothing \(C45\)"`

**C46** - Com a Promise pendente, novo clique ou tecla não chama `onCheckedChange` (critério 44).
Proof: `npm test -w @church/ui -- src/components/atoms/Toggle/Toggle.spec.tsx -t "ignores input while pending \(C46\)"`

**C47** - `loading`: mesmo estado de carregamento do C44 e nenhuma chamada a `onCheckedChange`
(critério 45).
Proof: `npm test -w @church/ui -- src/components/atoms/Toggle/Toggle.spec.tsx -t "loading prop \(C47\)"`

### S8 - Stack e o breakpoint `panel` · 6 files · ~30 KB · ~8k

**C48** - `@church/tokens` exporta `breakpoint.panel === 960`, e `panel:` compila para
`@media (width >= 60rem)`, o mesmo valor (critério 46).
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "panel breakpoint matches the token \(C48\)"`

**C49** - `<Stack>` sem props: `<div>` flex em coluna, `min-w-0`, sem fundo, borda nem padding;
gap 16px em Painel (critério 47).
Proof: `npm test -w @church/ui -- src/components/atoms/Stack/Stack.spec.tsx -t "default stack \(C49\)"`

**C50** - Matriz Painel, as 10 combinações (9 células + `surfaces={false}`), tabela do critério 48.
Proof: `npm test -w @church/ui -- src/components/atoms/Stack/Stack.spec.tsx -t "panel gap matrix \(C50\)"`

**C51** - Matriz App, as 10 combinações (9 células + `interactive`), tabela do critério 49.
Proof: `npm test -w @church/ui -- src/components/atoms/Stack/Stack.spec.tsx -t "app gap matrix \(C51\)"`

**C52** - `density="auto"`: App sem prefixo, Painel sob `panel:` (≥ 960px), e os seletores
`[data-viewport=mobile]`/`[data-viewport=desktop]` de ancestral forçam App/Painel; compilado de
verdade pelo Tailwind (critério 50).
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "stack auto density resolves in CSS \(C52\)"`

**C53** - `density="panel"`/`"app"` aplicam só a matriz pedida, sem classe responsiva nem de
`data-viewport` (critério 50).
Proof: `npm test -w @church/ui -- src/components/atoms/Stack/Stack.spec.tsx -t "forced density ignores the viewport \(C53\)"`

**C54** - O HTML do servidor é o mesmo em 375px e em 1440px, e o Stack nunca chama
`window.matchMedia` (critério 51).
Proof: `npm test -w @church/ui -- src/components/atoms/Stack/Stack.spec.tsx -t "server markup is viewport independent \(C54\)"`

**C55** - `direction="horizontal"`: linha com quebra e `items-center`; `wrap={false}` sem quebra
(critério 52).
Proof: `npm test -w @church/ui -- src/components/atoms/Stack/Stack.spec.tsx -t "horizontal stack \(C55\)"`

**C56** - `as="section"` com `aria-labelledby` renderiza `<section aria-labelledby="dados">` e
repassa os atributos (critério 53).
Proof: `npm test -w @church/ui -- src/components/atoms/Stack/Stack.spec.tsx -t "polymorphic element \(C56\)"`

**C57** - `align`/`justify` aceitam os literais da Unresolved 3 e mapeiam para `items-*` e
`justify-*`, sem `style` inline (Out of scope da task; Unresolved 3, assumido).
Proof: `npm test -w @church/ui -- src/components/atoms/Stack/Stack.spec.tsx -t "alignment literals \(C57\)"`

### S9 - Entrega no design system · 5 files · ~25 KB · ~6k

**C58** - Os 8 componentes resolvem por `@church/ui/atoms/<Nome>` (critério 54).
Proof: `npm test -w @church/ui -- src/figma-links.spec.ts -t "new atoms resolve through the package exports \(C58\)"`

**C59** - As stories de Divider, Logo e Chip apontam para `13628:935`, `12967:3338` e
`13596:6864` (critério 54).
Proof: `npm test -w @church/ui -- src/figma-links.spec.ts -t "story design links"`

**C60** - Cada um dos 8 tem story em `atoms/<Nome>` e linha em
`packages/docs/figma-components.md` (critério 54).
Proof: `npm test -w @church/ui -- src/figma-links.spec.ts -t "new atoms are documented \(C60\)"`

**C61** - O gate completo passa.
Proof: `npm run verify`

## Swept

- validation: C10 (estouro de `max`); `count` negativo ou não inteiro: Unresolved 2 da task
  (assumido `String(count)`)
- failure modes: C45
- idempotency: n/a - nenhum componente repete chamada; retry é do consumidor
- authorization: n/a - componentes não acessam dados
- concurrency: C46
- data lifecycle: n/a - nada é persistido
- dependency failure: n/a - sem rede; o glifo `check` vem do `material-symbols` já empacotado
- state transitions: C37, C44, C45, C46
- observability: n/a - sem log (constituição XIV)

## Coverage

| Set (size)                                 | Member -> proof                                                                           | Unproven |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- | -------- |
| matriz Painel (10)                         | table-driven sobre as 10 em C50                                                           | -        |
| matriz App (10)                            | table-driven sobre as 10 em C51                                                           | -        |
| resolução de densidade (4 caminhos)        | `panel:` C52 · sem prefixo C52 · `data-viewport=mobile` C52 · `data-viewport=desktop` C52 | -        |
| tamanhos do Radio (3)                      | small C25 · medium C24 · large C25                                                        | -        |
| tamanhos do Toggle (3)                     | small C34 · medium C33 · large C34                                                        | -        |
| transições do Toggle (8 arestas + 2 laços) | síncronas C37 · pendente→resolvida C44 · pendente→rejeitada C45 · laço pendente C46       | -        |
| teclas do Toggle (3)                       | clique, Espaço, Enter em C37                                                              | -        |
| stories com nó (3)                         | Divider, Logo, Chip em C59                                                                | -        |
| componentes exportados (8)                 | table-driven em C58 e C60                                                                 | -        |

- Nenhum check afirma status code, rota ou formato de resposta.
- C52 e C48 cruzam o limite do CSS compilado; os demais afirmam classes no DOM do jsdom, que não
  calcula estilo.

## Handoff

S1–S9 somam ~40k (floor de `wc -c`/4 dos arquivos lidos e escritos), abaixo de 150k: um lote só,
sem handoff.

- **Onde o lote fechou:** C1–C61, todos no working tree sobre `94b3c92` (sem commit, por decisão
  do usuário). `npm run verify` verde: 10/10 tarefas, 28 suítes, 623 testes.
- **O que o usuário decidiu durante o build:** a regra de nomes (Decided, linha 2) foi confirmada:
  "Nome do repositório, não use sm, use small, nem md, medium, não use lg, use large."
- **O que foi abandonado:**
  - Divider pintado por `background` (como no `bundle.css`), com `bg-(--border-color-default)`.
    Ficou a borda de 1px `border-default` do próprio `<hr>`, que usa o utilitário semântico. O
    texto do C1 foi esclarecido antes dos testes ("sem a borda inset nativa").
  - Spinner com `size-[1em]` e `align-[-0.125em]`: o lint recusa valores arbitrários. Ficou
    `size-em` (`--spacing-em: 1em` no `@theme`); o `vertical-align` saiu, porque nenhum critério o
    pede e os dois usos (Toggle, Dialog) são flex.
  - Afirmar `--breakpoint-panel` no `:root` compilado (C48): o Tailwind não emite variável de
    breakpoint. A prova afirma a media query compilada contra o token.
- **Depois da rodada 1 do Verifier (PASS, 6 lacunas):**
  - Lacuna 1: o C52 passou a comparar o gap compilado de App e de Painel com uma matriz em px
    escrita à parte (`AUTO_MATRIX_PX` em `styles.spec.ts`). Uma falha injetada em `AUTO_GAP`
    (`composite-weak` `gap-6` → `gap-8`) fez o teste falhar, e a tabela foi restaurada.
  - Lacuna 5: C43 e C47 também testam Espaço e Enter.
  - Lacuna 7: a task foi corrigida no critério 1 e na linha `tokens` do Impact.
  - `turbo.json`: `typecheck` passou a depender de `^build`. O `styles.spec.ts` é o primeiro
    arquivo TS do `ui` que importa `@church/tokens`, e um `npm run verify -- --force` falhou uma
    vez no `@church/ui#typecheck`, que corria enquanto o `tsup --clean` reescrevia o `dist` dos
    tokens. Depois da mudança, duas rodadas forçadas passaram 10/10.
  - Lacunas 2, 3, 4 e 6 ficaram como estão: equivalência de alias, cursor e anel cobertos pelas
    regras globais já provadas no `styles.spec.ts`, e o C45 já tinha matado uma falha injetada no
    build (remoção do handler de rejeição).
