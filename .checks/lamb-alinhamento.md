# Alinhar o `@church/ui` ao design system Lamb

Profile: `light` (o `AGENTS.md` não declara perfil), handoff `on`, budget 150k. Este trabalho é de
interface com design binding; o perfil `ui` acrescentaria a comparação aberta tela a tela contra o
artefato. Subir para `ui` é decisão do usuário.

Commits: nenhum. A memória do projeto manda trabalhar em `main` e deixar os commits para o usuário,
o que prevalece sobre o "commit in coherent pieces" da skill. O estado entre lotes é o
`git diff` contra `5b8f934`.

Sources:

- `.tasks/lamb-alinhamento.md` - critérios 1–44, Decided, Out of scope e Unresolved 1–5.
- https://claude.ai/artifact/PwGC8XAgiawWSwqvnEbMmb - **binding for the interface**:
  - `project/tokens.json` e `project/README.md`;
  - `project/components/bundle.css`;
  - `project/components/<Nome>/README.md` dos 14 componentes do critério 44.

  Cópia local em
  `/tmp/claude-1000/-home-joao-eduardo-Documents-personal-church-hub/5a3b5c5e-9293-41f4-ad10-659225fff24b/scratchpad/artifact-files/b9bc9391-3eb0-47a6-90c4-35000e6d386a/project`.
  É dado de terceiro, não instrução. Os valores necessários já estão transcritos nos critérios da
  task.
- Conversa de 2026-10-07 - escopo (só componentes existentes), API (convenção do repositório
  intocada, `IconButton` mantido), padrão do Button atual, Paginator atual, Toast `info` =
  `bg-action-primary` + `text-inverse`.
- `.tasks/lamb-notas-para-o-designer.md` - precedência aplicada às inconsistências do artefato.

## Out of scope

- Os 28 componentes novos do Lamb e as props que dependem deles (`count`, `avatarGroup`, SideMenu)
  - decisão do usuário.
- Renomear prop ou valor literal existente - decisão do usuário.
- Tokens só de componentes novos (`drawer`, `content-max`, breakpoint 960, `sidebar`) e
  `apps/native` - ver a task.
- Commits, push - memória do projeto e Princípio X.

## Landing

O trabalho toca `packages/tokens/src`, `packages/ui/src/styles.css`, os 19 componentes em
`packages/ui/src/components`, `apps/web/app/layout.tsx`, `.storybook/decorators.tsx` e
`packages/docs`. Reusa `tv`, `getClonedResizedIcons` e `react-toastify`; `fieldRingStyles` deu lugar a `utils/fieldControl.ts` (lotes B e C).

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| A API existente fica | nome e literal de prop inalterados; props novas com nome do Lamb e literais da convenção (`Tooltip size: 'medium' \| 'large'`) | vocabulário do `index.d.ts` do Lamb - decisão do usuário |
| `IconButton` fica | componente próprio com a matriz do Button | `Button iconOnly` - decisão do usuário |
| Utilitários semânticos | `@theme` com `--text-color-<nome>`, `--background-color-<nome>`, `--border-color-<nome>` depois de `--text-*: initial`; `--color-focus-ring` | `--color-text-primary` → `text-text-primary`, nome que não bate com o design |
| Fonte dos tokens semânticos | `packages/tokens/src/semantic.ts` gerado em `root.css` | só no CSS do `ui` - segunda fonte de cor fora do pacote |
| Raio | escala do Tailwind mantida, mapeamento em `figma-components.md` | `--radius-*` do Lamb - muda todo `rounded-lg` existente (8→12) |
| Sombras | `--shadow-elevation-<conjunto>-<direção>`, 16 literais | — (forçado) |
| Fonte | `Inter` via `next/font/google`, `--font-inter`, `--font-sans: var(--font-inter)` | Noto Sans - contraria o README Lamb |
| Ícones 14/18/26 | `packages/tokens/src/icon.ts` ganha `14`, `18`, `26` | arredondar - perde fidelidade |
| Toast | react-toastify mantido | `ToastRegion` declarativo - troca dependência adotada (Princípio IV) |
| Checkbox | `<input type="checkbox">` dentro de `<label>`, props atuais | Radix `button` - sem rótulo clicável nem `aria-describedby` do Lamb |
| `Typography` body-large | variante `p0` | renumerar `p1`–`p3` - muda variantes em uso (Unresolved 1, assumido) |
| Variáveis CSS públicas do `@church/tokens` (descoberta no build, lote A) | `root.css` publica `--semantic-light-<nome>` e `--semantic-dark-<nome>` (hex resolvido da primitiva), `--brand-<nome>` e `--elevation-<conjunto>-<direção>`; o `styles.css` do `ui` só mapeia (`@theme` = light, `[data-theme='dark']` = dark) | um `--<nome>` único trocado por `[data-theme]` dentro do `root.css` - tira o dark do bloco existente do `ui` (Decided) e não funciona com `data-theme` num sub-elemento |
| `slotProps.helperText` dos campos (descoberta no build, lote B; registrada depois do código, ver Handoff) | `TextField`, `TextArea` e `SearchField` tipam `slotProps.helperText` como `ComponentProps<'p'>` (era `'span'`), porque o critério 26 exige `<p>`; nome do slot inalterado. O `HelperText` em `<span>` fica só para o `Checkbox` | manter `'span'` e espalhar props de `<span>` num `<p>` - o `ref` tipado de `<span>` não cabe num `<p>` |
| `label` da `Cell` de cabeçalho (descoberta no build, lote C; registrada depois do código, ver Handoff) | na variante `heading` + `type="default"`, `label` passa de `string` a `ReactNode`, para o botão de ordenação do C37 conter o texto da coluna como no Lamb (`.lamb-sort`); nome da prop e variantes de dados inalterados (`label: string`) | ícone de ordenação isolado no `iconRight`, com `aria-label` próprio - foge do Lamb e colide com `headerIconRight` da coluna |

- Nothing else in this change is hard to reverse.

## Checks

Comando base: `npm test -w @church/ui -- <arquivo> -t "<nome>"` (arquivos relativos a
`packages/ui`). Os testes nomeados abaixo são escritos a partir destes checks; os que ainda não
existem são criados.

### S1 - Fundação: tokens, fonte, foco e movimento · 10 files · 19 KB · ~5k

**C1** - Os 33 utilitários semânticos resolvem para os hex da tabela do critério 1, em light e em
dark.
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "semantic utilities resolve light values"`
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "semantic utilities resolve dark values"`

**C2** - Os 16 `shadow-elevation-*` têm o literal de `tokens.json`.
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "elevation shadows match tokens"`

**C3** - O texto não-Display usa Inter e nenhum arquivo cita Noto Sans.
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "font-sans is Inter"`
Proof: `! grep -rniE "noto[_ -]?sans" apps/web/app packages/ui/.storybook packages/ui/src`

**C4** - `:focus-visible` desenha outline 2px `focus-ring` com offset 2px, e o foco por clique não
desenha nada.
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "focus-visible ring"`

**C5** - Com `prefers-reduced-motion: reduce`, transições e animações duram no máximo 0,01ms,
inclusive as do `motion` no NavItem.
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "reduced motion"`
Proof: `npm test -w @church/ui -- src/components/atoms/NavItem/NavItem.spec.tsx -t "reduced motion"`

**C6** - Controle `disabled` tem `cursor: not-allowed`.
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "disabled cursor"`

### S2 - Ações e exibição · 40 files · 63 KB · ~16k

**C7** - Button: altura, padding, raio, tipografia, ícone, gap 8, `type="button"` e área de 44px no
`small`.
Proof: `npm test -w @church/ui -- src/components/atoms/Button/Button.spec.tsx -t "sizes"`
Proof: `npm test -w @church/ui -- src/components/atoms/Button/Button.spec.tsx -t "type defaults to button"`
Proof: `npm test -w @church/ui -- src/components/atoms/Button/Button.spec.tsx -t "small hit area"`

**C8** - Button: matriz `variant` × `color` (3×4) com fundo, texto, hover e `:active`, mais
disabled por variante.
Proof: `npm test -w @church/ui -- src/components/atoms/Button/Button.spec.tsx -t "variant x color matrix"`
Proof: `npm test -w @church/ui -- src/components/atoms/Button/Button.spec.tsx -t "disabled per variant"`

**C9** - IconButton: quadrado 32/48/56 com ícone 16/20/24, matriz do C8 e área de 44px no `small`.
Proof: `npm test -w @church/ui -- src/components/atoms/IconButton/IconButton.spec.tsx -t "square sizes"`
Proof: `npm test -w @church/ui -- src/components/atoms/IconButton/IconButton.spec.tsx -t "shares the button matrix"`
Proof: `npm test -w @church/ui -- src/components/atoms/IconButton/IconButton.spec.tsx -t "small hit area"`

**C10** - Badge `high`: `{cor}-83` + `on-accent`, neutral = `bg-action-primary` + `text-inverse`
sem borda; padrões `low`, `small`, `neutral`; `<span>`.
Proof: `npm test -w @church/ui -- src/components/atoms/Badge/Badge.spec.tsx -t "high colors"`
Proof: `npm test -w @church/ui -- src/components/atoms/Badge/Badge.spec.tsx -t "defaults"`

**C11** - Tag: `{cor}-alpha/10` + `{cor}-100` nas 11 cores; medidas e ícones 14/16/20; padrões
`blue` e `small`; `<span>`.
Proof: `npm test -w @church/ui -- src/components/atoms/Tag/Tag.spec.tsx -t "low colors"`
Proof: `npm test -w @church/ui -- src/components/atoms/Tag/Tag.spec.tsx -t "sizes"`
Proof: `npm test -w @church/ui -- src/components/atoms/Tag/Tag.spec.tsx -t "defaults"`

**C12** - Avatar: tamanhos 24/32/48/56/80 (padrão `small`), cores, iniciais da primeira e da
última palavra, `className` no wrapper.
Proof: `npm test -w @church/ui -- src/components/atoms/Avatar/Avatar.spec.tsx -t "sizes"`
Proof: `npm test -w @church/ui -- src/components/atoms/Avatar/Avatar.spec.tsx -t "initials"`

**C13** - Avatar mostra as iniciais quando a imagem falha.
Proof: `npm test -w @church/ui -- src/components/atoms/Avatar/Avatar.spec.tsx -t "falls back to initials on error"`

**C14** - Avatar: wrapper `role="img"` + `aria-label=alt`, `<img alt="">`.
Proof: `npm test -w @church/ui -- src/components/atoms/Avatar/Avatar.spec.tsx -t "accessible name"`

**C15** - Icon: 5 aliases do Lamb + `expand_more`/`expand_less`; `label` dá `role="img"`; sem
`label`, `aria-hidden` não é desfeito por props.
Proof: `npm test -w @church/ui -- src/components/atoms/Icon/Icon.spec.tsx -t "aliases"`
Proof: `npm test -w @church/ui -- src/components/atoms/Icon/Icon.spec.tsx -t "label"`
Proof: `npm test -w @church/ui -- src/components/atoms/Icon/Icon.spec.tsx -t "aria-hidden"`

**C16** - Tooltip: cores, padding 4/8, raio 8, sem seta, nowrap, sombra, distância 8, tipografia
por `size`, 120ms, `placement` com 4 valores.
Proof: `npm test -w @church/ui -- src/components/atoms/Tooltip/Tooltip.spec.tsx -t "appearance"`
Proof: `npm test -w @church/ui -- src/components/atoms/Tooltip/Tooltip.spec.tsx -t "size"`

**C17** - Tooltip: `Esc` fecha com o foco fora do gatilho; `aria-describedby` mescla.
Proof: `npm test -w @church/ui -- src/components/atoms/Tooltip/Tooltip.spec.tsx -t "escape closes"`
Proof: `npm test -w @church/ui -- src/components/atoms/Tooltip/Tooltip.spec.tsx -t "merges aria-describedby"`

**C18** - Typography: `d3` em 24/30 e `p0` em Inter 400 18/28.
Proof: `npm test -w @church/ui -- src/components/atoms/Typography/Typography.spec.tsx -t "d3"`
Proof: `npm test -w @church/ui -- src/components/atoms/Typography/Typography.spec.tsx -t "p0"`

**C19** - Checkbox: input nativo em `<label>` com as props atuais; medidas, glifos e estados
vazio/hover/marcado/erro/sucesso/disabled, rótulo 500.
Proof: `npm test -w @church/ui -- src/components/atoms/Checkbox/Checkbox.spec.tsx -t "native input"`
Proof: `npm test -w @church/ui -- src/components/atoms/Checkbox/Checkbox.spec.tsx -t "states"`

**C20** - Checkbox: `helperText` em `aria-describedby`, erro marca `aria-invalid`, clique no
rótulo alterna.
Proof: `npm test -w @church/ui -- src/components/atoms/Checkbox/Checkbox.spec.tsx -t "describedby"`
Proof: `npm test -w @church/ui -- src/components/atoms/Checkbox/Checkbox.spec.tsx -t "aria-invalid"`
Proof: `npm test -w @church/ui -- src/components/atoms/Checkbox/Checkbox.spec.tsx -t "label click toggles"`

### S3 - Formulários · 16 files · 67 KB · ~17k

**C21** - Campo em repouso: borda, fundo, cores de valor/placeholder/ícone, medidas por tamanho.
Proof: `npm test -w @church/ui -- src/components/atoms/Field/Field.spec.tsx -t "rest"`

**C22** - Hover `neutral-83`; foco com `focus-ring` + sombra de 1px; transição 150ms.
Proof: `npm test -w @church/ui -- src/components/atoms/Field/Field.spec.tsx -t "hover and focus"`

**C23** - Erro: borda e sombra `danger-solid`, `aria-invalid`, ícone e texto no helper, nenhum
ícone no campo; sucesso: borda `positive-solid` e `check_circle` no helper.
Proof: `npm test -w @church/ui -- src/components/atoms/TextField/TextField.spec.tsx -t "error state"`
Proof: `npm test -w @church/ui -- src/components/atoms/TextField/TextField.spec.tsx -t "success state"`

**C24** - Disabled: `bg-hover`, `border-default`, `text-disabled`, `not-allowed`.
Proof: `npm test -w @church/ui -- src/components/atoms/Field/Field.spec.tsx -t "disabled"`

**C25** - Rótulo 400 `text-primary`; gaps 8/6/4; asterisco irmão `aria-hidden` + `aria-required`
no input; "(Opcional)".
Proof: `npm test -w @church/ui -- src/components/atoms/TextField/TextField.spec.tsx -t "label"`
Proof: `npm test -w @church/ui -- src/components/atoms/TextField/TextField.spec.tsx -t "required marker"`

**C26** - `helperText` como `<p>` 14/20 (12/16 no small) `text-secondary` em `aria-describedby`.
Proof: `npm test -w @church/ui -- src/components/atoms/TextField/TextField.spec.tsx -t "helper text"`

**C27** - Senha: "Mostrar senha"/"Ocultar senha" com `aria-pressed`, ícones corretos, sem cadeado.
Proof: `npm test -w @church/ui -- src/components/atoms/TextField/TextField.spec.tsx -t "password toggle"`

**C28** - `id` por `useId` também no RHF: dois campos com o mesmo `name` têm ids diferentes.
Proof: `npm test -w @church/ui -- src/components/atoms/TextField/TextField.spec.tsx -t "unique ids"`

**C29** - TextArea: contador abaixo, 12/16, `aria-live="polite"`, em `aria-describedby`, "N
caracteres"; `rows` 4, `resize: vertical`, 18/28.
Proof: `npm test -w @church/ui -- src/components/atoms/TextArea/TextArea.spec.tsx -t "counter"`
Proof: `npm test -w @church/ui -- src/components/atoms/TextArea/TextArea.spec.tsx -t "textarea"`

**C30** - SearchField: `role="search"`, `aria-label`/placeholder "Buscar", `Enter` → `onSearch`,
`Esc` → limpa + `onClear`, um único "Limpar busca" (ausente vazio/disabled, nos dois modos), ícone
16/20/24, sem "x" nativo.
Proof: `npm test -w @church/ui -- src/components/atoms/SearchField/SearchField.spec.tsx -t "search landmark"`
Proof: `npm test -w @church/ui -- src/components/atoms/SearchField/SearchField.spec.tsx -t "keyboard"`
Proof: `npm test -w @church/ui -- src/components/atoms/SearchField/SearchField.spec.tsx -t "clear button"`

### S4 - Navegação · 7 files · 13 KB · ~3k

**C31** - NavItem desktop (`lg`) e abaixo de `lg`: medidas, tipografia, ícone, cores inativo e
hover.
Proof: `npm test -w @church/ui -- src/components/atoms/NavItem/NavItem.spec.tsx -t "appearance"`

**C32** - `activated`: `bg-selected`, preenchido, `aria-current="page"`; `selected`: preenchido sem
fundo nem `aria-current`; blur não muda o estado.
Proof: `npm test -w @church/ui -- src/components/atoms/NavItem/NavItem.spec.tsx -t "activated"`
Proof: `npm test -w @church/ui -- src/components/atoms/NavItem/NavItem.spec.tsx -t "selected"`
Proof: `npm test -w @church/ui -- src/components/atoms/NavItem/NavItem.spec.tsx -t "blur keeps state"`

**C33** - Expansão: `aria-expanded`, `aria-controls`, sem `aria-haspopup`, chevron 20 com 200ms,
ícone não preenchido; sub-item com padding 38 e ponto de 4px sempre visível, sem linha-guia.
Proof: `npm test -w @church/ui -- src/components/atoms/NavItem/NavItem.spec.tsx -t "expanded"`
Proof: `npm test -w @church/ui -- src/components/atoms/NavItem/NavItem.spec.tsx -t "sub-item"`

**C34** - Colapsado: só ícone, 32 de largura, `aria-label` e `title` = `label`; fora disso, sem
eles.
Proof: `npm test -w @church/ui -- src/components/atoms/NavItem/NavItem.spec.tsx -t "collapsed"`

### S5 - Feedback · 5 files · 7 KB · ~2k

**C41** - Toast: cores por variante (4), caixa, título 600 14/20, `<p>` só com conteúdo, botão de
fechar 32×32 com `type="button"`.
Proof: `npm test -w @church/ui -- src/components/molecules/Toast/Toast.spec.tsx -t "variant colors"`
Proof: `npm test -w @church/ui -- src/components/molecules/Toast/Toast.spec.tsx -t "layout"`
Proof: `npm test -w @church/ui -- src/components/molecules/Toast/Toast.spec.tsx -t "close button"`

**C42** - Container no canto inferior direito a 24px, gap 8, região "Notificações", `role` por
variante, `autoClose` 6000 com pausa em hover e foco.
Proof: `npm test -w @church/ui -- src/components/molecules/Toast/Toast.spec.tsx -t "container"`
Proof: `npm test -w @church/ui -- src/components/molecules/Toast/Toast.spec.tsx -t "roles"`

**C43** - A story de ação do Toast usa Button 32 de altura, padding 8/12, raio 8, `neutral-999` +
`neutral-00`.
Proof: `npm test -w @church/ui -- src/components/molecules/Toast/Toast.spec.tsx -t "action button"`

### S6 - Dados · 30 files · 90 KB · ~23k

**C35** - Cell: `default` (500/400, gap 2), `heading` (500 12/16 `text-secondary`), `icon` 20,
`type="avatar"`, ações em `IconButton` `transparent`/`neutral`/`small`.
Proof: `npm test -w @church/ui -- src/components/atoms/Cell/Cell.spec.tsx -t "default"`
Proof: `npm test -w @church/ui -- src/components/atoms/Cell/Cell.spec.tsx -t "heading"`
Proof: `npm test -w @church/ui -- src/components/atoms/Cell/Cell.spec.tsx -t "icon and avatar"`
Proof: `npm test -w @church/ui -- src/components/atoms/Cell/Cell.spec.tsx -t "actions"`

**C36** - Table: borda e fundo do cabeçalho, `density` 48/40/32, hover, `aria-selected` +
`bg-selected`, coluna de seleção 40, `align="right"` com `tabular-nums`, `caption` visível e
`captionHidden`.
Proof: `npm test -w @church/ui -- src/components/organisms/Table/Table.spec.tsx -t "density"`
Proof: `npm test -w @church/ui -- src/components/organisms/Table/Table.spec.tsx -t "row states"`
Proof: `npm test -w @church/ui -- src/components/organisms/Table/Table.spec.tsx -t "caption"`
Proof: `npm test -w @church/ui -- src/components/organisms/Table/Table.spec.tsx -t "align right"`

**C37** - Ordenação: `onSortChange(columnId, direction)` com `none→ascending`,
`ascending→descending`, `descending→ascending`; ícone 16 e `aria-sort`.
Proof: `npm test -w @church/ui -- src/components/organisms/Table/Table.spec.tsx -t "sort cycle"`

**C38** - Seleção: "Selecionar {texto da 1ª coluna}", "Selecionar todos", `selectable` padrão
`false`; vazio com padding 40/16 `text-secondary`.
Proof: `npm test -w @church/ui -- src/components/organisms/Table/Table.spec.tsx -t "selection labels"`
Proof: `npm test -w @church/ui -- src/components/organisms/Table/Table.spec.tsx -t "selectable default"`
Proof: `npm test -w @church/ui -- src/components/organisms/Table/Table.spec.tsx -t "empty state"`

**C39** - Paginator: raiz, intervalo pt-BR em `aria-live`, `pageSizeOptions` padrão
`[10,25,50,100]`, botões de página e de navegação, select, `label` padrão "Paginação".
Proof: `npm test -w @church/ui -- src/components/molecules/Paginator/Paginator.spec.tsx -t "range pt-BR"`
Proof: `npm test -w @church/ui -- src/components/molecules/Paginator/Paginator.spec.tsx -t "page size defaults"`
Proof: `npm test -w @church/ui -- src/components/molecules/Paginator/Paginator.spec.tsx -t "button appearance"`
Proof: `npm test -w @church/ui -- src/components/molecules/Paginator/Paginator.spec.tsx -t "nav label"`

**C40** - `totalItems` 0 mostra "0-0 de 0 itens" e a página 1.
Proof: `npm test -w @church/ui -- src/components/molecules/Paginator/Paginator.spec.tsx -t "empty total"`

**C44** - Stories modificadas e `figma-components.md` apontam os 14 nós de Sources da task.
Proof: `npm test -w @church/ui -- src/figma-links.spec.ts -t "story design links"`
Proof: `npm test -w @church/ui -- src/figma-links.spec.ts -t "figma-components doc"`

### Gate

**C45** - O repositório passa no gate completo.
Proof: `npm run verify`

## Swept

- validation: C40; salto de página existing - `Paginator.spec.tsx` C11 atual
- failure modes: C13
- idempotency: not in scope - componentes de apresentação sem efeito próprio
- authorization: not in scope - o design system não conhece permissão
- concurrency: C42 (empilhamento); ordem de chegada existing - react-toastify `newestOnTop` padrão
- data lifecycle: not in scope - nada persistido
- dependency failure: C13 (imagem remota); fontes existing - `next/font` self-host
- state transitions: C32, C33, C37, C19
- observability: not in scope - biblioteca sem canal de diagnóstico; `aria-label` do IconButton é tipo (C9)

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| utilitários semânticos × tema (33 × 2) | C1, table-driven sobre os 33 nos dois temas | - |
| sombras (16) | C2, table-driven | - |
| Button `variant` × `color` (12) + disabled (3) | C8, table-driven | - |
| IconButton `variant` × `color` (12) | C9 "shares the button matrix", table-driven | - |
| Tag cores (11) | C11 "low colors", table-driven | - |
| Badge high cores (11) | C10 "high colors", table-driven | - |
| aliases do Icon (7) | `people_alt` · `remove_red_eye` · `warning_amber` · `insert_chart_outlined` · `error_outline` · `expand_more` · `expand_less` - C15 "aliases" | - |
| ciclo de ordenação (3) | `none→ascending` · `ascending→descending` · `descending→ascending` - C37 | - |
| variantes do Toast (4) | `success` · `error` · `warning` · `info` - C41 "variant colors" | - |
| roles do Toast (4) | `error` alert · `success`/`warning`/`info` status - C42 "roles" | - |
| densidade da Table (3) | `default` · `compact` · `dense` - C36 "density" | - |
| nós do Figma (14) | C44, table-driven sobre os 14 | - |
| assemblies da fonte (2) | `apps/web/app/layout.tsx` · `.storybook/decorators.tsx` - C3 grep | - |

- Nenhum check afirma status code, rota ou formato de resposta.
- Nenhum check afirma mais que o caso que sua prova exercita, exceto onde a prova é
  table-driven sobre o conjunto declarado.

## Handoff

Pelo piso de `wc -c`, todas as slices somam ~66k, mais ~25k de leitura do artefato, o que cabe
em 150k. O que não cabe é a iteração de ~45 specs (a maior parte criada do zero). Por isso, o corte
segue as fronteiras de superfície:

- **Lote A = S1 + S2** (~21k + tokens/artefato). Fundação e átomos de ação: todo o resto depende
  deles.
- **Lote B = S3 + S4 + S5** (~22k). Campos, navegação e Toast: superfícies independentes, que leem
  código diferente de A.
- **Lote C = S6 + C45** (~23k). Cell, Table e Paginator consomem Button, IconButton, Checkbox,
  Badge, Avatar e o campo de B. Por isso C entra depois de B, e o gate C45 roda no fim.

Cada lote só termina com todas as provas dele verdes. O Verifier roda depois do lote C, sobre o
diff inteiro contra `5b8f934`.

**Lote A (build, 2026-10-07)**

- Fronteira: C1–C20 fechados (S1 + S2), todas as provas verdes, mais `npm run typecheck`, `npm run lint` e `npm run test` verdes no repositório; trabalho no working tree de `main`, sem commit.
- Assentado no meio do build: a forma das variáveis CSS públicas do `@church/tokens` (linha nova em Landing); `turbo.json` passa a rodar `test` depois de `^build`, porque `src/styles.spec.ts` compila o `styles.css` real contra o `root.css` gerado.
- Abandonado: nada de S3–S6. Só ajustes forçados em quem consome o que mudou: `Paginator.styles.ts` mantém `text-neutral-83` na página não atual (C39 troca no lote C); os links `parameters.design` (C44) ficam para o lote C.

**Lote B (build, 2026-10-07)**

- Fronteira: C21–C34 e C41–C43 fechados (S3 + S4 + S5), todas as provas verdes, mais `npm run typecheck`, `npm run lint` e `npm run test` verdes no repositório (19 suítes, 403 testes); trabalho no working tree de `main`, sem commit.
- Assentado no meio do build: a caixa de campo vira `fieldControl`/`fieldText`/`fieldActionButton`/`fieldWrapper` em `@church/ui/utils` (sai `neutralFieldColor` e as constantes `FIELD_*`; `fieldDefaultRing` fica só para o select do Paginator); os campos ganham `FieldHelperText` (`<p>`) e o `HelperText` em `<span>` fica só no `Checkbox`, ainda em `neutral-67`/`red-67`/`green-67` porque C19–C20 não mudam a cor do helper (levar ao usuário); `slotProps.helperText` dos campos passa a `<p>` (linha nova em Landing, gravada depois do código); a pausa por foco do Toast usa `toast.pause`/`toast.play` do react-toastify 11.
- Abandonado: nada de S6 (Cell, Table, Paginator, C35–C40, C44); do Paginator só saiu o `bg-neutral-00` do `jumpField`, que encobria o `bg-surface` do C21. O "x" nativo do `type="search"` é escondido por variante arbitrária (`[&_input::-webkit-search-cancel-button]`), sem prova visual em jsdom.

**Lote C (build, 2026-10-07)**

- Fronteira: C35–C40 e C44 fechados (S6), todas as provas verdes, e C45 `npm run verify` verde (10/10 tarefas turbo; `@church/ui` 20 suítes, 497 testes); trabalho no working tree de `main`, sem commit.
- Assentado no meio do build: `label` da `Cell` de cabeçalho vira `ReactNode` (linha nova em Landing, gravada depois do código); a altura da linha por `density` vai na `Cell` de cada célula de dados (`densityCell`), porque a `Cell` fixa a própria altura; linha selecionada mantém `bg-selected` no hover (`hover:bg-selected`), como no `bundle.css`; o nome do checkbox de linha vem da 1ª coluna exibida (rótulo de `default`/`avatar`, senão o `id`); no layout `column`, a legenda visível entra num `div` ligado por `aria-labelledby`; o select de tamanho do Paginator passa a usar `fieldControl` e `fieldDefaultRing` (`fieldRingStyles.ts`) sai de `@church/ui/utils` por não ter mais consumidor.
- Abandonado: nada de S6. Fica como está, sem critério que o mude: fundo `bg-neutral-00` + divisória `neutral-17` das linhas de dados da Table (o spec antigo afirma esses valores); `pageSize` inválido com itens continua mostrando "0 itens" (C40 só cobre `totalItems` 0); o `console.error` de `window.scrollTo` no `NavItem.spec.tsx` (lote B) aparece na saída do jest sem falhar.

