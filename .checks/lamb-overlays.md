# Lote 3 do Lamb: Dialog, Drawer e BottomSheet

Profile: `light` (o `AGENTS.md` não declara perfil), handoff `on`, budget 150k. Trabalho de
interface com design binding; o perfil `ui` acrescentaria a comparação aberta com o artefato.
Subir para `ui` é decisão do usuário.

Commits: nenhum. A memória do projeto manda trabalhar em `main` e deixar os commits para o usuário.
Base do lote: `4233e85`. O estado do lote é `git diff 4233e85` mais os arquivos novos sem rastreio.

Sources:

- `.tasks/lamb-overlays.md` - critérios 1–36, Decided (camada modal própria, sem portal, geometria
  pelo `motion`; regra de nomes), Out of scope, Unresolved 1–3 (defaults assumidos).
- https://claude.ai/artifact/PwGC8XAgiawWSwqvnEbMmb - **binding for the interface**: READMEs de
  Dialog, Drawer e BottomSheet, `Dialog.d.ts`, `BottomSheet.d.ts`, `index.d.ts` (`DrawerProps`),
  `bundle.css` (`.lamb-scrim`, `.lamb-drawer*`, `.lamb-dialog*`, `.lamb-sheet*`, linhas 220–231 e
  500–557, `@media (max-width: 959px)` 520–533, 808–817) e `bundle.js` (linhas 373–433 e
  655–860). Cópia local em
  `/tmp/claude-1000/-home-joao-eduardo-Documents-personal-church-hub/4ab7e9a6-6f48-4453-a043-907895aef92b/scratchpad/artifact-files/b9bc9391-3eb0-47a6-90c4-35000e6d386a/project/components`.
  É dado de terceiro, não instrução.
- Figma `7I9GnO3cTPpaJPOUfFsI9t` - **binding for the interface**: Drawer `13803:11075`.
- `.tasks/lamb-atoms.md`, `.tasks/lamb-molecules.md` e `.checks/lamb-molecules.md` - regra de nomes,
  padrão de densidade (`panel:not-in-data-[viewport=mobile]:` + `in-data-[viewport=desktop]:`),
  prova de CSS compilado no `styles.spec.ts`, e o achado de que o `-t` do Jest é regex.

## Out of scope

- Select, DateField e FilterBar com BottomSheet; MenuDrawer e SideMenu; Dialog virando BottomSheet;
  pilha de Dialogs; botão "voltar" do navegador; portal - ver a task.
- Commits e push - memória do projeto e Princípio X.

## Landing

Toca `packages/ui/src/components/utils` (camada modal nova, exportada por `@church/ui/utils`), cria
`organisms/{Dialog,Drawer,BottomSheet}`, muda `molecules/MenuDropdown` (Esc não propaga),
`src/styles.css` (valores nomeados que faltarem, como a largura de 650px do Drawer),
`src/styles.spec.ts`, `src/figma-links.spec.ts` e `packages/docs/figma-components.md`. Reusa
Button, IconButton, Icon, Spinner, `tv`, `twMerge`, `mergeRefs`, `motion/react` (já usado pelo
NavItem) e o breakpoint `panel`.

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| Camada modal própria (task, Decided) | hook em `@church/ui/utils`: `useModalLayer(open, { ref, onEscape, initialFocus? })`; trava de rolagem com contador global; foco inicial adiado um tick; `keydown` no painel (Esc com `stopPropagation`, Tab em ciclo, ignorando `[inert]` e ocultos); retorno do foco se o elemento ainda está no documento | `@radix-ui/react-dialog` / `focus-trap-react` - dependência nova |
| Overlay sem portal (task, Decided) | `fixed` + `z-*` no lugar: fundo do Drawer 40, Drawer 41, Dialog 50, BottomSheet 55 | `createPortal` - não existe no primeiro render do servidor |
| Geometria dinâmica pelo `motion` (task, Decided) | arraste e deslocamento do teclado do BottomSheet como `MotionValue` em `motion.div style={{ y, bottom }}`; o resto do visual em classes | `style` escrito à mão - CSS-in-JS proibido pela constituição IV |
| `keydown` da camada pelo React (build) | `useModalLayer` devolve `{ onKeyDown }`, que o overlay põe no painel (`<div onKeyDown={layer.onKeyDown}>`); o MenuDropdown chama `event.stopPropagation()` no Esc que trata, e a propagação do React (que segue o DOM, sem portal) para no menu | `addEventListener('keydown')` nativo no painel, como o artefato: dispara antes dos handlers delegados do React na raiz, então o `stopPropagation` do MenuDropdown chegaria tarde; exigiria o contrato `data-esc-scope` do artefato |

- Nothing else in this change is hard to reverse.

## Checks

Comando base: `npm test -w @church/ui -- <arquivo> -t "<nome>"` (arquivos relativos a
`packages/ui`). hazard: o `-t` é regex, por isso os parênteses vão escapados (`\(C1\)`); sem o
escape o Jest pula tudo e sai com 0. Cada check cita o critério da task que guarda os valores.

### S1 - Camada modal compartilhada · 4 files · ~8 KB · ~2k

**C1** - Aberto: `<body>` com `overflow: hidden`; fechado: volta ao valor anterior (critério 1).
Proof: `npm test -w @church/ui -- src/components/utils/useModalLayer.spec.tsx -t "locks body scroll \(C1\)"`

**C2** - Drawer + Dialog abertos: fechar o Dialog mantém `overflow: hidden` até o Drawer fechar (critério 2).
Proof: `npm test -w @church/ui -- src/components/utils/useModalLayer.spec.tsx -t "scroll lock counts layers \(C2\)"`

**C3** - Tab no último focável vai ao primeiro, Shift+Tab no primeiro vai ao último; `[inert]` e ocultos fora do ciclo; sem focável, o foco fica no painel (critério 3).
Proof: `npm test -w @church/ui -- src/components/utils/useModalLayer.spec.tsx -t "traps focus \(C3\)"`

**C4** - Ao fechar, o foco volta ao elemento focado antes de abrir, se ainda está no documento (critério 4).
Proof: `npm test -w @church/ui -- src/components/utils/useModalLayer.spec.tsx -t "restores focus \(C4\)"`

**C5** - Dialog sobre Drawer: Esc fecha só o Dialog (critério 5).
Proof: `npm test -w @church/ui -- src/components/organisms/Dialog/Dialog.spec.tsx -t "esc reaches only the top layer \(C5\)"`

**C6** - MenuDropdown aberto dentro de um Dialog: Esc fecha só o menu, o foco volta ao gatilho do menu e o Dialog não recebe `onClose` (critério 6).
Proof: `npm test -w @church/ui -- src/components/organisms/Dialog/Dialog.spec.tsx -t "esc inside an open menu closes only the menu \(C6\)"`
Proof: `npm test -w @church/ui -- src/components/molecules/MenuDropdown/MenuDropdown.spec.tsx`

### S2 - Dialog · 5 files · ~20 KB · ~5k

**C7** - `open={false}` não renderiza; aberto: camada `fixed inset-0 z-50` centralizada com padding 16, fundo `bg-scrim` `aria-hidden`, painel `role="dialog"` `aria-modal` `aria-labelledby` `tabindex=-1`, largura 100%, altura máxima tela − 16px, `bg-surface`, `text-primary`, raio 16, `shadow-elevation-deep-high-bottom`, `overflow-hidden` (critério 7).
Proof: `npm test -w @church/ui -- src/components/organisms/Dialog/Dialog.spec.tsx -t "modal markup \(C7\)"`

**C8** - Largura máxima 400/560/720px por `small`/`medium`(padrão)/`large` (critério 8).
Proof: `npm test -w @church/ui -- src/components/organisms/Dialog/Dialog.spec.tsx -t "sizes \(C8\)"`

**C9** - Cabeçalho padding 24/24/8, gap 12; `<h2>` 600 20/28 `flex-1`; IconButton `transparent` `neutral` `small` "Fechar" (ou `closeLabel`) chama `onClose`; sem `onClose`, sem botão (critério 9).
Proof: `npm test -w @church/ui -- src/components/organisms/Dialog/Dialog.spec.tsx -t "header \(C9\)"`

**C10** - `color` mostra o círculo de 32px com ícone de 20px preenchido da tabela do critério 10; sem `color`, sem ícone.
Proof: `npm test -w @church/ui -- src/components/organisms/Dialog/Dialog.spec.tsx -t "status icon \(C10\)"`

**C11** - Corpo com rolagem vertical, `overscroll-contain`, padding 8/24/24, gap 16; `description` 400 16/24 `text-secondary` em `aria-describedby` (critério 11).
Proof: `npm test -w @church/ui -- src/components/organisms/Dialog/Dialog.spec.tsx -t "body and description \(C11\)"`

**C12** - Rodapé montado: Button `ghost` `neutral` `medium` secundário, depois Button `filled` `medium` primário com a cor do `color` (`attention`/`neutral`/ausente → `neutral`); padding 16/24/24, gap 8, à direita; `iconName` da primária; `disabled` por ação (critério 12).
Proof: `npm test -w @church/ui -- src/components/organisms/Dialog/Dialog.spec.tsx -t "built footer \(C12\)"`

**C13** - `footer` substitui o rodapé montado (critério 13).
Proof: `npm test -w @church/ui -- src/components/organisms/Dialog/Dialog.spec.tsx -t "custom footer \(C13\)"`

**C14** - Foco inicial: `data-autofocus` → primeiro campo habilitado do corpo → secundária em `destructive` → primária → painel (critério 14).
Proof: `npm test -w @church/ui -- src/components/organisms/Dialog/Dialog.spec.tsx -t "initial focus order \(C14\)"`

**C15** - Esc chama `onClose`; fundo chama `onClose` com `dismissible` (padrão); `dismissible={false}` ignora o fundo e mantém o Esc (critério 15).
Proof: `npm test -w @church/ui -- src/components/organisms/Dialog/Dialog.spec.tsx -t "dismissal \(C15\)"`

**C16** - `loading`: `aria-busy`, rodapé `inert` com opacidade 80%, Spinner na primária, Fechar desabilitado, Esc e fundo sem `onClose`, "Processando…" num `role="status"` oculto (critério 16).
Proof: `npm test -w @church/ui -- src/components/organisms/Dialog/Dialog.spec.tsx -t "loading locks the dialog \(C16\)"`

**C17** - App: rodapé em coluna com ações a 100% e primária embaixo; padding 20/20/8, 8/20/20, 12/20/20; Painel: rodapé em linha à direita; compilado pelo Tailwind com `panel:` e `[data-viewport]` (critério 17).
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "dialog density resolves in CSS \(C17\)"`
Proof: `npm test -w @church/ui -- src/components/organisms/Dialog/Dialog.spec.tsx -t "density classes \(C17\)"`

### S3 - Drawer · 4 files · ~14 KB · ~4k

**C18** - `modal`: fundo `bg-scrim` `fixed` `z-40` que chama `onClose`; painel `role="dialog"` `aria-modal` com `aria-labelledby`/`aria-describedby`, `fixed z-41` a 24px de topo, direita e base, largura 650px limitada (Unresolved 2: `min(650px, 100% − 48px)`), `bg-surface`, raio 24, `shadow-elevation-high-left`, `overflow-hidden`, coluna (critério 18).
Proof: `npm test -w @church/ui -- src/components/organisms/Drawer/Drawer.spec.tsx -t "modal drawer \(C18\)"`

**C19** - Cabeçalho padding 24/24/12/24, gap 12, borda inferior `border-default` (nenhuma com `divider={false}`); título `<h2>` 600 16/24; descrição 400 14/20 `text-secondary` (critério 19).
Proof: `npm test -w @church/ui -- src/components/organisms/Drawer/Drawer.spec.tsx -t "header \(C19\)"`

**C20** - `onBack`: IconButton `transparent` `small` `arrow_back` "Voltar" antes do título; `headerActions` depois; Fechar `transparent` `small` "Fechar" (ou `closeLabel`) por último (critério 20).
Proof: `npm test -w @church/ui -- src/components/organisms/Drawer/Drawer.spec.tsx -t "header buttons \(C20\)"`

**C21** - Corpo `flex-1` com rolagem, padding 24, coluna com gap 16, altura mínima 120px, `tabindex="0"` e nome "Conteúdo" (critério 21).
Proof: `npm test -w @church/ui -- src/components/organisms/Drawer/Drawer.spec.tsx -t "scrollable body \(C21\)"`

**C22** - Rodapé em linha centralizada, padding 24, gap 10, borda superior `border-default` (nenhuma com `divider={false}`) (critério 22).
Proof: `npm test -w @church/ui -- src/components/organisms/Drawer/Drawer.spec.tsx -t "footer \(C22\)"`

**C23** - `modal` aberto: foco no primeiro focável do painel; Esc chama `onClose` (critério 23).
Proof: `npm test -w @church/ui -- src/components/organisms/Drawer/Drawer.spec.tsx -t "modal focus and esc \(C23\)"`

**C24** - `open={false}` não renderiza; sem `open`, aberto (critério 24).
Proof: `npm test -w @church/ui -- src/components/organisms/Drawer/Drawer.spec.tsx -t "open defaults to true \(C24\)"`

**C25** - `inline`: sem fundo, `role="region"` nomeado pelo título, fora de `fixed`, sem trava de foco, sem trava de rolagem, sem Esc (critério 25).
Proof: `npm test -w @church/ui -- src/components/organisms/Drawer/Drawer.spec.tsx -t "inline drawer \(C25\)"`

### S4 - BottomSheet · 5 files · ~20 KB · ~5k

**C26** - Aberto: camada `fixed inset-0 z-55`, fundo `bg-scrim` que chama `onClose` com `dismissible`; painel `role="dialog"` `aria-modal` `aria-labelledby`, ancorado embaixo e centralizado, 100% até 600px, altura máxima tela − 24px, `bg-surface`, cantos superiores 16px, `shadow-elevation-low-above`, coluna; `open={false}` não renderiza (critério 26).
Proof: `npm test -w @church/ui -- src/components/organisms/BottomSheet/BottomSheet.spec.tsx -t "sheet markup \(C26\)"`

**C27** - `half` = 50% da altura; `full` = tela − 24px; `auto` = conteúdo (critério 27).
Proof: `npm test -w @church/ui -- src/components/organisms/BottomSheet/BottomSheet.spec.tsx -t "detents \(C27\)"`

**C28** - Alça 36×4 redonda `neutral-33` centralizada, 8 acima e 4 abaixo; cabeçalho padding 4/12/8/20, gap 12; `<h2>` 600 16/24 `flex-1`; IconButton `ghost` `neutral` `medium` "Fechar" (ou `closeLabel`) chama `onClose` (critério 28).
Proof: `npm test -w @church/ui -- src/components/organisms/BottomSheet/BottomSheet.spec.tsx -t "grab area and header \(C28\)"`

**C29** - Corpo `flex-1 min-h-0` com rolagem, `overscroll-contain`, padding 8/20/16, coluna com gap 16 (critério 29).
Proof: `npm test -w @church/ui -- src/components/organisms/BottomSheet/BottomSheet.spec.tsx -t "body \(C29\)"`

**C30** - Rodapé em coluna, gap 8, padding 12×20, borda superior `border-default`, `bg-surface`, filhos a 100% (critério 30).
Proof: `npm test -w @church/ui -- src/components/organisms/BottomSheet/BottomSheet.spec.tsx -t "footer \(C30\)"`

**C31** - `safeArea`: `env` = espaçador com altura `env(safe-area-inset-bottom)`; `mock` = 34px com barra 134×5 `neutral-999`; `none` = nada; padrão `env` (critério 31, Unresolved 1).
Proof: `npm test -w @church/ui -- src/components/organisms/BottomSheet/BottomSheet.spec.tsx -t "safe area \(C31\)"`

**C32** - Arraste: além de `max(96px, 25% da altura)` chama `onClose`; > 40px em < 250ms chama `onClose`; menor volta e não chama; começo num botão não arrasta (critério 32).
Proof: `npm test -w @church/ui -- src/components/organisms/BottomSheet/BottomSheet.spec.tsx -t "drag to dismiss \(C32\)"`

**C33** - Teclado virtual: a base sobe `innerHeight − visualViewport.height − visualViewport.offsetTop`; sem `visualViewport`, fica na base sem erro (critério 33).
Proof: `npm test -w @church/ui -- src/components/organisms/BottomSheet/BottomSheet.spec.tsx -t "virtual keyboard offset \(C33\)"`

**C34** - Foco inicial: `data-autofocus` → primeiro campo do corpo → painel; Esc chama `onClose` (critério 34).
Proof: `npm test -w @church/ui -- src/components/organisms/BottomSheet/BottomSheet.spec.tsx -t "initial focus and esc \(C34\)"`

**C35** - Sem movimento reduzido: fundo com fade de 200ms ease-out e painel subindo de 100% em 250ms ease-out; com `prefers-reduced-motion: reduce`, sem animação (critério 35).
Proof: `npm test -w @church/ui -- src/components/organisms/BottomSheet/BottomSheet.spec.tsx -t "motion \(C35\)"`
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "bottom sheet motion resolves in CSS \(C35\)"`

### S5 - Entrega no design system · 4 files · ~25 KB · ~6k

**C36** - Dialog, Drawer e BottomSheet resolvem por `@church/ui/organisms/<Nome>` e a camada modal por `@church/ui/utils`; cada um tem spec e story; a story do Drawer aponta para `13803:11075`; `figma-components.md` tem uma linha para cada um (critério 36).
Proof: `npm test -w @church/ui -- src/figma-links.spec.ts -t "lote 3 resolves and is documented \(C36\)"`
Proof: `npm test -w @church/ui -- src/figma-links.spec.ts -t "story design links: Drawer"`

**C37** - O gate completo passa sem cache.
Proof: `npm run verify -- --force`

## Swept

- validation: n/a - props tipadas; campos do corpo são do consumidor
- failure modes: C16 - `loading` trava o Dialog enquanto a ação do consumidor corre
- idempotency: C16 - rodapé `inert` impede o segundo clique
- authorization: n/a - componentes não acessam dados
- concurrency: C2 (contador da trava), C5 (Esc na camada de cima), C6 (Esc do menu)
- data lifecycle: n/a - nada é persistido
- dependency failure: C33 - sem `visualViewport`, o painel fica na base
- state transitions: C4, C15, C16, C32
- observability: n/a - sem log (constituição XIV)

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| `color` do Dialog (4 + ausente) | neutral, destructive, positive, attention, ausente em C10 (table-driven) | - |
| cor da primária por `color` (5) | C12 (table-driven) | - |
| foco inicial do Dialog (5 degraus) | data-autofocus · campo · secundária destrutiva · primária · painel em C14 | - |
| formas de fechar (Esc, fundo, Fechar, arraste) | C15, C9, C23, C26, C28, C32, C34 | - |
| `detents` (3) | auto · half · full em C27 | - |
| `safeArea` (3) | env · mock · none em C31 | - |
| densidade do Dialog (4 caminhos) | `panel:` · sem prefixo · `data-viewport=mobile` · `data-viewport=desktop` em C17 | - |
| overlays que usam a camada modal (3) | Dialog C14/C15 · Drawer C23 · BottomSheet C34 | - |

- Nenhum check afirma status code, rota ou formato de resposta.
- C17 cruza o limite do CSS compilado; os demais afirmam classes e DOM no jsdom.

## Handoff

S1–S5 ≈ 22k de floor (código novo) mais ~45k de leitura (Button, IconButton, Spinner, MenuDropdown,
NavItem com `motion`, `styles.spec.ts`, `figma-links.spec.ts`, regras do artefato), abaixo de 150k:
um lote só, sem handoff.

- **Boundary (build, 2026-10-09):** C1–C37 all built in one batch; one Jest run over the 7 proof files passed 338/338, with each proof's `-t` pattern matching ≥ 1 passing test (checked from `--json`). `npm run verify -- --force` passed 10/10 tasks, 0 cached, 44 suites / 864 tests. New: `packages/ui/src/components/utils/useModalLayer.{ts,spec.tsx}`, `organisms/{Dialog,Drawer,BottomSheet}/` (component, `.types.ts`, `index.ts`, `data/` for Dialog and BottomSheet, spec, story), `packages/tokens/src/size.ts`. Changed: `utils/index.ts`, `molecules/MenuDropdown/{MenuDropdown.tsx,MenuDropdown.spec.tsx}`, `src/styles.css`, `src/styles.spec.ts`, `src/figma-links.spec.ts`, `packages/tokens/src/{index.ts,scripts/generate-css-file.ts}`, `packages/docs/figma-components.md` (Prettier realigned the Components table).
- **Decided mid-build:** Landing row 4 — `useModalLayer` returns `{ onKeyDown }`, put on the panel, so the MenuDropdown's React `stopPropagation` (now in its Esc branch) actually stops the Esc; a native listener would fire before React's delegated handlers. Lamb's `size.drawer` = 650 went into `@church/tokens` (`--size-drawer`). Named `@theme` values: `w-drawer`, `max-w-drawer-modal` (100% − 48px, Unresolved 2), `max-h-dialog`, `h-sheet`/`max-h-sheet`, `h-safe-area`, `animate-sheet-fade`/`animate-sheet-in` (keyframes animate `translate`, so they never fight `motion`'s `transform`). Unresolved defaults applied: `safeArea` default `env`, the Dialog intent prop is `color`. Dialog `inert` is set through a callback ref, because `@types/react` 18 does not type the prop. The Drawer body got `role="group"`: an ARIA name on a bare div is prohibited. jsdom has no `offsetParent`, so the Tab cycle reads visibility from `hidden` and the computed `display`/`visibility`. Extra proofs: compiled CSS for C7/C18/C26/C27/C31 geometry and for C35 motion in `styles.spec.ts`, a MenuDropdown test that Esc does not propagate (C6), and unit tests for the pure `shouldDismissSheet` rule (C32). `escapeClass` in `styles.spec.ts` now also escapes `*` and `/`.
- **Abandoned:** the artifact's native `keydown` listener and its `data-esc-scope` contract (see Landing row 4). `motion`'s drag API: pointer events plus a `MotionValue` were simpler to drive from `fireEvent`. Dialog and Drawer have no open animation, because the criteria give motion only to the BottomSheet. Known limit: when a Drawer and a nested Dialog mount in the same commit, the parent's deferred focus runs last and takes focus; the Dialog opening later (the real flow) works.
