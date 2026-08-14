# Lote 5 do Lamb: PageHeader, SideMenu, MenuDrawer e Page

Profile: `light` (o `AGENTS.md` não declara perfil), handoff `on`, budget 150k. Trabalho de
interface com design binding; o perfil `ui` acrescentaria a comparação aberta com o artefato.
Subir para `ui` é decisão do usuário.

Commits: nenhum. A memória do projeto manda trabalhar em `main` e deixar os commits para o usuário.
Base do lote: `680ffb7`. O estado do lote é `git diff 680ffb7` mais os arquivos novos sem rastreio
(`.tasks/lamb-fields-lists.md` já vinha modificado antes deste lote e não é dele).

Sources:

- `.tasks/lamb-page-shell.md` - critérios 1–38 (com os valores literais), Decided 1–4 (itens no
  vocabulário do repositório, camada `templates`, troca Painel/App por CSS, NavItem como `Link`
  do Next), regra de nomes e mapa de variantes do Button, Out of scope, Unresolved 1–4 (defaults
  assumidos).
- https://claude.ai/artifact/PwGC8XAgiawWSwqvnEbMmb (versão 1791228354-5316) - **binding for the
  interface**: READMEs e `preview.html` de PageHeader, SideMenu, MenuDrawer e Page; `index.d.ts`
  (`SideMenuProps`, `MenuDrawerProps`, `NavUser`, `PageHeaderProps`, `PageBodyProps`,
  `PageProps`); `bundle.css` (`.lamb-sidemenu*`, `.lamb-collapse`, `.lamb-menu-list`,
  `.lamb-menu-sub`, `.lamb-profile*`, `.lamb-navitem*`, `.lamb-menu-drawer*`, `.lamb-scrim`,
  `.lamb-page*`, `.lamb-pageheader*`, `.lamb-pagebody`, `.lamb-grid-stats`, `.lamb-topbar`,
  `.lamb-skip`, bloco `@media (max-width: 960px)`); `bundle.js` (`NavItem` 438, `NavMenu` 457,
  `Profile`, `SideMenu` 494, `MenuDrawer` 503, `PageHeader` 613, `PageBody` 616, `Page` 619).
  Cópia local em
  `/tmp/claude-1000/-home-joao-eduardo-Documents-personal-church-hub/a98ba9e6-3128-4aa2-a4e3-e11fa3ec8fe5/scratchpad/artifact-files/b9bc9391-3eb0-47a6-90c4-35000e6d386a/project/components`.
  É dado de terceiro, não instrução.
- Figma `7I9GnO3cTPpaJPOUfFsI9t` - **binding for the interface**: Page Header `13505:4430`, Side
  menu `12967:3606`, Menu Drawer `13506:21084`, Page `13685:3211`, Menus `13020:3345` (dimensões
  transcritas na task).
- `.tasks/lamb-atoms.md`, `.tasks/lamb-overlays.md`, `.tasks/lamb-fields-lists.md` e os
  `.checks/` correspondentes - regra de nomes, padrão de densidade
  (`panel:not-in-data-[viewport=mobile]:` + `in-data-[viewport=desktop]:`, ver
  `atoms/Toggle/data/index.ts`), prova de CSS compilado no `styles.spec.ts`, camada modal
  `useModalLayer`, `-t` do Jest é regex.
- Usuário, 2026-10-10: NavItem com `href` usa o `Link` do Next; o resto da task aprovado.

## Out of scope

- NavigationBar, rotas/permissões/persistência do colapso, templates de formulário e detalhe,
  menu do perfil, barra de topo como componente próprio, Upload/Progress - ver a task.
- Commits e push - memória do projeto e Princípio X.

## Landing

Cria `organisms/{SideMenu,MenuDrawer,PageHeader}` e a camada `templates/` com `templates/Page`
(Page e PageBody). Altera `atoms/NavItem` (densidade em 960px, largura total, ramo colapsado,
`href` com `next/link`), `packages/tokens/src/size.ts`, `src/styles.css`, `src/styles.spec.ts`,
`packages/ui/package.json` (export `./templates/*`), a story da Navigation, `src/figma-links.spec.ts`
e `packages/docs/figma-components.md`. Reusa `Navigation`, NavItem, Logo, Avatar, IconButton,
Icon, Breadcrumb, Typography, `useModalLayer`, `tv` e `twMerge`.

| One-way door                                    | Literal shape                                                                                                                                                             | Alternative rejected                                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Itens no vocabulário do repositório (Decided 1) | `items: NavItemProps[]`, `footerItems?: NavItemProps[]` no SideMenu, no MenuDrawer e em `Page.nav`; o meio é a `Navigation`. Sem `currentId`, `onNavigate` nem `NavEntry` | árvore do Lamb com `currentId`/`onNavigate` - dois nomes para o item atual, e a `Navigation` fora                          |
| Camada `templates` (Decided 2)                  | `"./templates/*": "./src/components/templates/*/index.ts"` em `exports`; `Page` e `PageBody` saem de `@church/ui/templates/Page`                                          | Page como organism - contra a decisão do usuário de 2026-10-08                                                             |
| Troca Painel/App da Page por CSS (Decided 3)    | SideMenu e barra de topo sempre no HTML; `panel:` + `in-data-[viewport=…]` escolhem qual aparece; só o `open` do MenuDrawer é estado, começando `false`                   | `resolveViewport`/`useViewport` no render - redesenho depois da hidratação                                                 |
| NavItem como `Link` do Next (Decided 4)         | `href?: LinkProps['href']` no item sem `subItems` e no sub-item; com ele, renderiza `Link` de `next/link`; item com `subItems` não aceita `href` no tipo                  | `<a>` puro - recarrega a página no `apps/web`; `as`/`linkComponent` polimórfico - mais tipos para um único consumidor Next |

- Nothing else in this change is hard to reverse.

## Checks

Comando base: `npm test -w @church/ui -- <arquivo> -t "<nome>"` (arquivos relativos a
`packages/ui`). hazard: o `-t` é regex, por isso os parênteses vão escapados (`\(C1\)`); sem o
escape o Jest pula tudo e sai com 0. O número de cada check é o do critério da task, que guarda os
valores literais.

### S1 - Tokens e a camada `templates` · 4 files · ~53 KB · ~13k

**C1** - `size` de `@church/tokens` tem `sidebar` 240, `sidebarCollapsed` 64, `contentMax` 1440, `menuDrawer` 390 e `drawer` 650, e o CSS compilado tem os utilitários de largura correspondentes, sem valor arbitrário (critério 1).
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "layout size tokens \(C1\)"`

**C2** - `package.json` exporta `./templates/*` → `./src/components/templates/*/index.ts`, e `Page`/`PageBody` resolvem por `@church/ui/templates/Page` (critério 2).
Proof: `npm test -w @church/ui -- src/components/templates/Page/Page.spec.tsx -t "templates export \(C2\)"`

### S2 - NavItem no Painel e no App · 6 files · ~27 KB · ~7k

**C3** - Densidade troca em 960px com `[data-viewport]`: Painel 32px/6×10/raio 8/14-16/ícone 20, App 48px/12×14/raio 12/16-24/ícone 24, nos itens e sub-itens, sem nenhuma classe `lg:` (critério 3).
Proof: `npm test -w @church/ui -- src/components/atoms/NavItem/NavItem.spec.tsx -t "density switches at the panel breakpoint \(C3\)"`

**C4** - Não colapsado, o NavItem ocupa a largura do contêiner, sem `w-50` (critério 4).
Proof: `npm test -w @church/ui -- src/components/atoms/NavItem/NavItem.spec.tsx -t "fills the container width \(C4\)"`

**C5** - Colapsado com sub-item `activated`: fundo `bg-selected`, `text-primary`, ícone preenchido, sem `aria-current`; sem sub-item ativo nem `activated`, sem fundo (critério 5).
Proof: `npm test -w @church/ui -- src/components/atoms/NavItem/NavItem.spec.tsx -t "collapsed branch is highlighted \(C5\)"`

**C6** - Com `href`, item folha e sub-item (inline e no pop-up) renderizam o `<a href>` do `next/link` com o visual do botão, `aria-current="page"` quando `activated`, `aria-label`/`title` colapsado, e chamam `onClick`; sem `href`, `<button type="button">`; item com `subItems` e `href` é erro de tipo (critério 6).
Proof: `npm test -w @church/ui -- src/components/atoms/NavItem/NavItem.spec.tsx -t "renders a next link with href \(C6\)"`
Proof: `npm run typecheck -w @church/ui` (um `// @ts-expect-error` no spec sobre `href` com `subItems`)

### S3 - SideMenu · 5 files · ~10 KB · ~3k

**C7** - `<aside>` em coluna, altura 100%, `bg-surface`, borda direita `border-default`, 240px/64px, transição de largura 300ms ease-out, sem encolher (critério 7).
Proof: `npm test -w @church/ui -- src/components/organisms/SideMenu/SideMenu.spec.tsx -t "aside shell \(C7\)"`

**C8** - Topo de 64px com borda inferior, padding 16 (12 colapsado), `logo` informado ou `Logo` full 36px / symbol 32px (critério 8).
Proof: `npm test -w @church/ui -- src/components/organisms/SideMenu/SideMenu.spec.tsx -t "head with logo \(C8\)"`

**C9** - Botão de recolher de 28px, redondo, borda `neutral-17`, a 18px do topo e 14px para fora, ícone e `aria-label`/`aria-expanded` por estado (critério 9).
Proof: `npm test -w @church/ui -- src/components/organisms/SideMenu/SideMenu.spec.tsx -t "collapse button \(C9\)"`

**C10** - Clique chama `onCollapsedChange(next)` uma vez; não controlado alterna a partir de `defaultCollapsed`; controlado segue só `collapsed` (critério 10).
Proof: `npm test -w @church/ui -- src/components/organisms/SideMenu/SideMenu.spec.tsx -t "controlled and uncontrolled collapse \(C10\)"`

**C11** - O meio é a `Navigation` com `items` e `collapsed`, nomeada por `label` (padrão "Menu principal"), com rolagem própria e padding 16×6 (16 colapsado) (critério 11).
Proof: `npm test -w @church/ui -- src/components/organisms/SideMenu/SideMenu.spec.tsx -t "navigation in the middle \(C11\)"`

**C12** - Rodapé sempre presente com borda superior, padding 12/6/16 (12/16 colapsado), gap 8, e `footerItems` numa lista com o mesmo `collapsed` (critério 12).
Proof: `npm test -w @church/ui -- src/components/organisms/SideMenu/SideMenu.spec.tsx -t "footer items \(C12\)"`

**C13** - Com `user`, botão de perfil com Avatar `small` decorativo, nome, `role`, `expand_more`, clique chama `onProfileClick`; sem `user`, nenhum botão de perfil (critério 13).
Proof: `npm test -w @church/ui -- src/components/organisms/SideMenu/SideMenu.spec.tsx -t "profile button \(C13\)"`

**C14** - Colapsado, o perfil mostra só o Avatar com `aria-label` "{name}, {role}", ou "{name}" sem `role` (critério 14).
Proof: `npm test -w @church/ui -- src/components/organisms/SideMenu/SideMenu.spec.tsx -t "collapsed profile label \(C14\)"`

### S4 - MenuDrawer · 4 files · ~16 KB · ~4k

**C15** - Fechado não renderiza nada; aberto, scrim `fixed inset-0 z-40 bg-scrim` `aria-hidden` e painel `role="dialog"` `aria-modal` `aria-label` (padrão "Menu principal") `tabindex="-1"` (critério 15).
Proof: `npm test -w @church/ui -- src/components/organisms/MenuDrawer/MenuDrawer.spec.tsx -t "renders only when open \(C15\)"`

**C16** - Painel fixo, `z-41`, largura `menuDrawer` limitada a 100%, `bg-surface`; `side="right"` (padrão) com `elevation-low-left`, `side="left"` com `elevation-low-right` (critério 16).
Proof: `npm test -w @church/ui -- src/components/organisms/MenuDrawer/MenuDrawer.spec.tsx -t "panel side and shadow \(C16\)"`

**C17** - Topo de 64px com padding 0×20, borda inferior, `Logo` full 36px e `IconButton` ghost neutral medium `close` "Fechar menu" (critério 17).
Proof: `npm test -w @church/ui -- src/components/organisms/MenuDrawer/MenuDrawer.spec.tsx -t "drawer bar \(C17\)"`

**C18** - Painel com `data-viewport="mobile"`, `Navigation` nomeada com padding 16×20, rodapé 12/20/20 com `footerItems` e perfil expandido; nunca colapsado (critério 18).
Proof: `npm test -w @church/ui -- src/components/organisms/MenuDrawer/MenuDrawer.spec.tsx -t "mobile items and footer \(C18\)"`

**C19** - Ao abrir, foco em "Fechar menu", rolagem travada e Tab/Shift+Tab em ciclo dentro do painel (critério 19).
Proof: `npm test -w @church/ui -- src/components/organisms/MenuDrawer/MenuDrawer.spec.tsx -t "focus trap on open \(C19\)"`

**C20** - Esc, fundo e "Fechar menu" chamam `onClose` uma vez cada; ao fechar, foco volta ao elemento anterior e a rolagem destrava (critério 20).
Proof: `npm test -w @church/ui -- src/components/organisms/MenuDrawer/MenuDrawer.spec.tsx -t "closes and restores focus \(C20\)"`

### S5 - PageHeader · 5 files · ~8 KB · ~2k

**C21** - `<header>` em coluna, gap 24, padding 16/12 e laterais 32 (Painel) / 20 (App, com `[data-viewport]`) (critério 21).
Proof: `npm test -w @church/ui -- src/components/organisms/PageHeader/PageHeader.spec.tsx -t "header shell \(C21\)"`

**C22** - Linha principal alinhada pela base, separada nas pontas, gap 16, quebra; títulos em coluna gap 4 `min-w-0`; `actions` com gap 8 (critério 22).
Proof: `npm test -w @church/ui -- src/components/organisms/PageHeader/PageHeader.spec.tsx -t "main row layout \(C22\)"`

**C23** - `primary` (padrão): Breadcrumb, `<h1>` 600 24/28, descrição 400 14/20 `text-primary`, nessa ordem; `chips` num `role="group"` "Filtros rápidos" com gap 8 (critério 23).
Proof: `npm test -w @church/ui -- src/components/organisms/PageHeader/PageHeader.spec.tsx -t "primary header \(C23\)"`

**C24** - `home`: `<h1>` com `greeting` (ou `title`) em Typography `d3`, descrição; sem breadcrumb nem chips mesmo informados (critério 24).
Proof: `npm test -w @church/ui -- src/components/organisms/PageHeader/PageHeader.spec.tsx -t "home header \(C24\)"`

### S6 - Page e PageBody · 4 files · ~6 KB · ~2k

**C25** - Raiz flex em linha, 100%, `min-h` 600px, `bg-page`, `text-primary`; SideMenu antes da área de conteúdo `flex-1 min-w-0` em coluna com rolagem (critério 25).
Proof: `npm test -w @church/ui -- src/components/templates/Page/Page.spec.tsx -t "page shell \(C25\)"`

**C26** - `<main tabindex="-1">` com id único, `max-w` de `contentMax`, centralizado, com `header` antes dos `children` (critério 26).
Proof: `npm test -w @church/ui -- src/components/templates/Page/Page.spec.tsx -t "main landmark \(C26\)"`

**C27** - O primeiro focável é o link de pular (`skipLinkLabel`, padrão "Pular para o conteúdo") com `href="#<id do main>"`, oculto fora de foco e com o visual de foco do critério (critério 27).
Proof: `npm test -w @church/ui -- src/components/templates/Page/Page.spec.tsx -t "skip link \(C27\)"`

**C28** - Com `nav` e `responsive`, o SideMenu tem as classes de Painel e some no App; a barra de topo (64px, Logo 32px, `IconButton` ghost neutral medium `menu` "Abrir menu" com `aria-expanded`) só aparece no App (critério 28).
Proof: `npm test -w @church/ui -- src/components/templates/Page/Page.spec.tsx -t "panel and app switch \(C28\)"`

**C29** - A troca é só CSS: o HTML de `renderToString` é idêntico com `matchMedia` de App e de Painel, e hidratar não gera aviso de diferença (critério 29).
Proof: `npm test -w @church/ui -- src/components/templates/Page/Page.spec.tsx -t "server markup ignores the viewport \(C29\)"`

**C30** - "Abrir menu" abre o MenuDrawer `side="right"` com `items`, `footerItems`, `user`, `onProfileClick` e `label` de `nav`; fechar devolve o foco a "Abrir menu" (critério 30).
Proof: `npm test -w @church/ui -- src/components/templates/Page/Page.spec.tsx -t "opens the menu drawer \(C30\)"`

**C31** - No drawer da Page, clicar em item folha ou sub-item (menu e rodapé) fecha o drawer e chama o `onClick` do item uma vez; pai com `subItems` só expande (critério 31).
Proof: `npm test -w @church/ui -- src/components/templates/Page/Page.spec.tsx -t "leaf click closes the drawer \(C31\)"`

**C32** - `responsive={false}`: SideMenu sem classe de esconder, sem barra de topo nem drawer; sem `nav`: nada disso (critério 32).
Proof: `npm test -w @church/ui -- src/components/templates/Page/Page.spec.tsx -t "non responsive and no nav \(C32\)"`

**C33** - Com o drawer aberto, mudar o `matchMedia` para Painel não o fecha (critério 33).
Proof: `npm test -w @church/ui -- src/components/templates/Page/Page.spec.tsx -t "drawer stays open across the breakpoint \(C33\)"`

**C34** - PageBody em coluna, gap 16, padding 16/32/32 e laterais 20 no App; `stats` numa grade auto-fit de 220px mínimo com gap 16, antes dos `children` (critério 34).
Proof: `npm test -w @church/ui -- src/components/templates/Page/Page.spec.tsx -t "page body \(C34\)"`
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "stats grid \(C34\)"`

### S7 - Entrega no design system · 4 files · ~37 KB · ~9k

**C35** - SideMenu, MenuDrawer e PageHeader importáveis por `@church/ui/organisms/<Nome>`, Page e PageBody por `@church/ui/templates/Page`, cada um com spec e story (títulos `organisms/<Nome>` e `templates/Page`) (critério 35).
Proof: `npm test -w @church/ui -- src/figma-links.spec.ts -t "lamb batch 5 exports \(C35\)"`

**C36** - `parameters.design`: PageHeader `13505:4430`, SideMenu `12967:3606`, MenuDrawer `13506:21084`, Page `13685:3211`, Navigation `13020:3345` (critério 36).
Proof: `npm test -w @church/ui -- src/figma-links.spec.ts -t "batch 5 figma nodes \(C36\)"`

**C37** - `figma-components.md` com linhas para PageHeader, SideMenu, MenuDrawer e Page (com PageBody); a da Navigation em `13020:3345`, sem "Lamb's Side menu" (critério 37).
Proof: `npm test -w @church/ui -- src/figma-links.spec.ts -t "figma-components rows batch 5 \(C37\)"`

**C38** - Stories e specs do lote sem os nomes dos previews do artefato ("Lucas", "Vieira", "Ana Souza", "Bruno Lima") (critério 38).
Proof: `npm test -w @church/ui -- src/figma-links.spec.ts -t "synthetic fixtures batch 5 \(C38\)"`

Gate do lote: `npm run verify` (typecheck, lint e test em todos os workspaces) e
`npx prettier --check` nos arquivos tocados.

## Swept

- validation: n/a - nenhum componente recebe entrada de dados
- failure modes: existing - o Avatar cai nas iniciais sem foto; nada chama rede
- idempotency: C10, C20, C31 - cada callback uma vez por gesto
- authorization: n/a - "permissões ficam no app" (README do SideMenu)
- concurrency: C33 (cruzar 960px aberto); existing - `useModalLayer` entrega o Esc só à camada de
  cima
- data lifecycle: n/a - colapso não persiste
- dependency failure: C29 - a troca não depende de `matchMedia`
- state transitions: C10, C19, C20, C30, C31
- observability: n/a - sem log (constituição XIV)

## Coverage

| Set (size)                       | Member -> proof                                                                                                  | Unproven |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------- |
| densidade do NavItem (4)         | Painel por largura · App por largura · `[data-viewport="desktop"]` · `[data-viewport="mobile"]`, em C3 (classes) | -        |
| formas do NavItem com `href` (4) | folha · sub-item inline · sub-item no pop-up · pai com `subItems` (tipo), em C6                                  | -        |
| saídas do MenuDrawer (3)         | Esc · fundo · "Fechar menu", em C20                                                                              | -        |
| cliques no drawer da Page (5)    | folha do menu · sub-item do menu · item do rodapé · sub-item do rodapé · pai com `subItems` (não fecha), em C31  | -        |
| montagens da Page (3)            | `nav` + `responsive` C28 · `responsive={false}` C32 · sem `nav` C32                                              | -        |
| `type` do PageHeader (2)         | `primary` C23 · `home` C24                                                                                       | -        |
| `side` do MenuDrawer (2)         | `right` · `left`, em C16                                                                                         | -        |
| perfil colapsado (2)             | com `role` · sem `role`, em C14                                                                                  | -        |

- Nenhum check afirma status, rota ou payload.
- C3, C21, C28 e C34 afirmam classes (`panel:`/`in-data-`); o CSS compilado da variante `panel:`
  já é provado pelo `styles.spec.ts` do lote 1, e C1/C34 provam os utilitários novos compilados.

## Handoff

Pesos (floor de `wc -c`/4 dos arquivos lidos): S1 ≈ 13k (quase tudo `styles.css` e
`styles.spec.ts`), S2 ≈ 7k, S3 ≈ 3k (+ NavItem/Navigation já lidos em S2), S4 ≈ 4k, S5 ≈ 2k,
S6 ≈ 2k (+ os três organisms), S7 ≈ 9k. Total ≈ 40k pelo floor, um lote só caberia; a iteração
no NavItem (`motion`, pop-up, `next/link` no jsdom) costuma passar de três vezes o floor. A
superfície muda em S4: de NavItem/Navigation/tokens para camada modal, cabeçalho, template e
docs. Divisão: **lote A = S1–S3** (C1–C14, ≈ 23k); **lote B = S4–S7** (C15–C38, ≈ 17k + o
SideMenu do A), depois do A verde.

### Lote A (S1–S3)

- **Onde o lote fechou:** C1–C14 verdes; as 14 provas rodaram isoladas com o comando do checklist
  (1 teste cada; o `-t` de C6 roda 3: folha, sub-itens inline/pop-up e pai com `subItems`), e
  `npm run typecheck -w @church/ui` passa consumindo o `// @ts-expect-error` de C6 (sem o `href` o
  diretivo fica sem uso e o tsc falha, conferido). `npm run verify -- --force` verde (10/10
  tarefas, 0 em cache, 52 suítes / 973 testes); `npx prettier --check` limpo nos arquivos tocados.
  Estado: working tree sobre `680ffb7`, sem commit. Criados `organisms/SideMenu/` (`SideMenu.tsx`,
  `SideMenu.types.ts` com `SideMenuProps` e `NavUser`, `components/ProfileButton.tsx` +
  `components/index.ts`, `index.ts`, spec, story em `12967:3606`) e `templates/Page/`
  (`Page.tsx`, `Page.types.ts`, `index.ts`, `Page.spec.tsx` só com C2). Alterados
  `packages/tokens/src/size.ts`, `packages/ui/package.json` (`./templates/*`), `src/styles.css`
  (`w-sidebar`, `w-sidebar-collapsed`, `w-menu-drawer`, `max-w-content-max`, `transition-width`
  e `grid-cols-fill-55`), `src/styles.spec.ts` (C1 e uma prova compilada de `transition-width`),
  `atoms/NavItem/{NavItem.tsx,NavItem.types.ts,NavItem.spec.tsx,NavItem.stories.tsx}`. O teste
  antigo `appearance: 48px mobile box, 32px from lg…` perdeu as classes `lg:` (critério 3 mudou o
  comportamento) e as densidades passaram para C3. Tipos do NavItem: sem `href` o item recebe
  atributos de `<button>`, com `href` atributos de `<a>` (o `Link`), e `onClick` é
  `NavClickHandler` (`MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>`), para o lote B
  envolver o `onClick` no drawer (C31) sem saber qual elemento sai; a story do NavItem passou a
  `Pick` dos props comuns, porque `NavItemProps` virou união. O SideMenu aceita `className` (fora
  da tabela Surface), mesclado no `<aside>` pelo `tv`, para a Page do lote B pôr as classes de
  Painel/App (C28). **Fica para o lote B:** a Page hoje cobre só o casco (25), o `<main>` (26) e o
  link de pular (27), sem testes desses critérios, sem `responsive`, barra de topo nem MenuDrawer;
  o `PageBody` segue o critério 34 (grade `grid-cols-fill-55`), sem a prova de C34; a story de
  `templates/Page` não existe. O MenuDrawer pode reusar `ProfileButton` por
  `@church/ui/organisms/SideMenu/components` (C18).
- **O que o usuário decidiu no meio:** nada.
- **O que foi abandonado:** `transition-[width]` (valor arbitrário), trocado por
  `--transition-property-width` no tema; `rerender` para o modo colapsado nos specs (o
  `AnimatePresence` mantém a sublista saindo e duplica os nós), trocado por montar de novo; afirmar
  que o pop-up some do DOM após o clique (a saída anima), trocado por `aria-expanded="false"` no
  pai; `ruleFor` do `styles.spec.ts` em C1 (casa por substring e `.w-sidebar` acha
  `.w-sidebar-collapsed`), trocado por seletor exato só nesse teste. Nenhuma linha nova em
  `## Landing`: as quatro portas já estavam lá.

### Lote B (S4–S7)

- **Onde o lote fechou:** C15–C38 verdes; as provas rodaram isoladas com o comando do checklist,
  cada uma com ≥ 1 teste (C15 2, C18 3, C22 2, C25 2, C31 2, C35/C36/C37 5 cada, C38 10, o resto
  1), e C1–C14 seguem verdes na nova rodada (C6 roda 3 e `npm run typecheck -w @church/ui` passa).
  `npm run verify -- --force` verde (10/10 tarefas, 0 em cache, 54 suítes / 1033 testes);
  `npx prettier --check` limpo nos arquivos tocados. Criados `organisms/MenuDrawer/`
  (`MenuDrawer.tsx`, `.types.ts`, `index.ts`, spec, story em `13506:21084`; reusa `useModalLayer`
  com `initialFocus` no "Fechar menu" e o `ProfileButton` do SideMenu), `organisms/PageHeader/`
  (`PageHeader.tsx`, `.types.ts`, `index.ts`, spec, story em `13505:4430`) e
  `templates/Page/Page.stories.tsx` (`13685:3211`, com o PageBody). Alterados `templates/Page/`
  (`Page.tsx`: `responsive`, barra de topo e MenuDrawer só com classes `panel:`/`in-data-`, o
  `onClick` das folhas e sub-itens embrulhado para fechar o drawer; `Page.types.ts`;
  `Page.spec.tsx` ganhou C25–C34, o teste C2 do lote A ficou igual), `src/styles.spec.ts`
  ("stats grid (C34)" e `grid-cols-fill-55` na lista compilada), `src/figma-links.spec.ts`
  (C35–C38; quatro stories novas em `NODES` e a Navigation em `13020:3345`), a story da
  Navigation e `packages/docs/figma-components.md` (linhas de PageHeader, SideMenu, MenuDrawer e
  Page; Navigation em `13020:3345` como "Lamb's Menus"). Estado: working tree sobre `330f03f` (o
  usuário emendou o topo de `main` com o lote A durante este lote), sem commit. Observado e não
  mexido: o `NavItem.spec.tsx` do lote A imprime um `console.error` do jsdom
  ("Not implemented: window.scrollTo", vindo do `motion`), sem falhar; os specs deste lote não
  imprimem nada.
- **O que o usuário decidiu no meio:** nada.
- **O que foi abandonado:** comparar o `innerHTML` hidratado com a string do `renderToString` em
  C29 (o React e o serializador do DOM escapam as aspas do `style` de jeitos diferentes), trocado
  por comparar com o mesmo HTML do servidor reparseado num `<div>`; `not.toHaveClass` com várias
  classes (passa se faltar só uma), trocado por uma asserção por classe; afirmar em C32 que o HTML
  não tem `in-data-[viewport=mobile]` (os NavItems carregam essa classe pela densidade), trocado
  por conferir que o `<aside>` não tem `hidden` nem as classes de Painel; deixar o `motion` animar
  no spec da Page (media layout e caía no `window.scrollTo` do jsdom), trocado por
  `prefers-reduced-motion` no `matchMedia` simulado. Nenhuma linha nova em `## Landing`.

### Correções do round 1

- **Onde fechou:** os achados 1–4, 5 (C29), 6 e 9 do `lamb-page-shell.verified.md` estão
  corrigidos; os checks C1–C38 não mudaram. C6 ganhou um espião parcial em `next/link`
  (`jest.requireActual` + `default` embrulhado) que afirma o `href` passado ao `Link` na folha, no
  sub-item inline e no do pop-up. C13 espiona o `Avatar` (`alt` = `user.name`, `decorative`,
  `small`, `src`). C29 hidrata com `matchMedia` de App e de Painel. C31 cobre o sub-item do rodapé
  (pai "Ajuda" expande sem fechar; "Suporte" fecha e chama o `onClick` 1×), e a linha "cliques no
  drawer da Page" do `Coverage` passou a (5). O `matchMedia` simulado do spec da Page guarda os
  listeners, e C33 cruza 960px com um `change` (`matches` de Painel) mais o `resize`. As negações
  de várias classes de C12 e C14 viraram uma por classe. A Page passou a tratar `subItems: []` como
  folha, como o NavItem (`withClose` em `Page.tsx`), com o teste extra
  `leaf click closes the drawer (C31): an empty subItems list is a leaf`. Cada teste reforçado
  ficou vermelho sob o mutante correspondente (`<Link>`→`<a>` na folha e no sub-item, `alt` errado,
  `py-2`/`pb-4` sobrando no colapsado, sub-item do rodapé sem embrulho, drawer fechando num
  `change` do `matchMedia`, snapshot de viewport por JS que só difere depois de hidratar no Painel,
  `subItems: []` como pai). As 39 provas passam (C31 agora roda 3),
  `npm run typecheck -w @church/ui` e `npm run verify -- --force` verdes. Sem commit.
- **O que o usuário decidiu no meio:** nada.
- **O que foi abandonado:** guardar no `matchMedia` simulado também os listeners do
  `addListener` legado (a assinatura `this: MediaQueryList` não cabe em
  `EventListenerOrEventListenerObject` sem cast), que seguem sem efeito; usar
  `toHaveBeenCalledWith` nos espiões (o React chama o componente com um segundo argumento),
  trocado por ler `mock.calls`/`mock.lastCall`. Não mexidos, como combinado: o escopo de lista
  negra de C38 e a densidade lida por nome de token.
