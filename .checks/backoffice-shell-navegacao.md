# Backoffice — layout da aplicação com menu lateral

Profile: `light` (o repositório não declara `## tlc-implement`) · handoff: `on`, budget 150k

Sources:

- `.tasks/backoffice-shell-navegacao.md` — critérios 1–26, decisões, escopo e Unresolved 1–5
- [Backoffice — Side menu `282:37325`](https://www.figma.com/design/HQ5Vfbwug9vzIskrlSIXJW/Backoffice?node-id=282-37325&m=dev)
  — **binding para a interface**: árvore do menu, linha-guia `Rectangle 1`, rodapé com
  Configurações e perfil
- [Backoffice — tela `141:4443`](https://www.figma.com/design/HQ5Vfbwug9vzIskrlSIXJW/Backoffice?node-id=141-4443&m=dev)
  — **binding para o shell**: SideMenu à esquerda e conteúdo ao lado
- [Lamb — Nav sub-item `13506:10602`](https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13506-10602)
  — **binding** para o ponto só no sub-item ativo
- `docs/backend/ibfc-server.md` — envelope `{ data }`, 204 sem corpo, `GET /perfil`, claim `roles`
- Conversa de 2026-10-19 — árvore inteira com "Em construção"; perfil abre menu com "Sair"

## Out of scope

- Filtrar itens por papel — Unresolved 3 da task
- Persistir o recolhimento entre recargas — ninguém pediu (C6)
- Conteúdo de Início, Ensino, Gestão, Configurações e das abas Visitantes, GCs e Ministérios —
  telas próprias
- Ajustes da tela "Gestão de pessoas" ao `141:4443` (chips, cards, colunas, `PageBody`) — task
  seguinte
- Outros itens no menu do perfil além de "Sair"

## Landing

Toca o `@church/ui` (`NavItem`, `MenuDropdown`, `ProfileButton` do SideMenu, `SideMenu`,
`MenuDrawer` e `Page`) e o `apps/backoffice`: um route group `(painel)` com layout compartilhado,
`lib/navigation.ts`, `services/perfil.ts` e `app/api/perfil/route.ts`. Reusa a `Page`,
`sessionFetch`/`relayError`, `apiFetch`, a Server Action `logout` e o `EmptyState`.

| One-way door                              | Literal shape                                                                                                                                                              | Alternative rejected                                                                                                                                |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Árvore do menu no front end               | `lib/navigation.ts` exporta `buildNavigation(pathname, aba)` → `{ items: NavItemProps[]; footerItems: NavItemProps[] }`, derivando `activated`/`selected` da URL           | Endpoint de menu no backend — não existe; decisão do usuário (task, Decided 1)                                                                      |
| Perfil pelo BFF, buscado no navegador     | `GET /api/perfil` → `200 { nome, papel }` \| `204` \| erro repassado; o shell chama `perfilService.obter()`                                                                | `sessionFetch` no layout de servidor — o refresh grava cookie, proibido durante render (task, Decided 2)                                            |
| Papel lido do claim `roles` do JWT no BFF | `papelDoToken(accessToken)` decodifica o payload base64url sem verificar e escolhe `admin` > `secretaria` > `lider`, ou `null`                                             | Papéis no iron-session — sessões abertas ficariam sem papel (task, Decided 3)                                                                       |
| Abas de Pessoas como query `?aba=`        | `/pessoas?aba=visitantes\|gcs\|ministerios`; o `page.tsx` de `/pessoas` lê `searchParams.aba`                                                                              | `/pessoas/visitantes` — colide com `/pessoas/[id]` (task, Decided 4)                                                                                |
| Menu do perfil no `@church/ui`            | `profileMenuItems?: MenuItemProps[]` em `SideMenuProps` e `MenuDrawerProps`; `ProfileButton` ganha `menuItems` e, com eles, vira o gatilho de um `MenuDropdown side="top"` | Menu montado pelo consumidor — o `ProfileButton` é interno e não há âncora (task, Decided 5)                                                        |
| Direção do `MenuDropdown`                 | `side?: 'bottom' \| 'top'`, padrão `'bottom'` (`top-full mt-1`); `'top'` → `bottom-full mb-1`                                                                              | Medir espaço em JS — salto pós-hidratação (task, Decided 6)                                                                                         |
| Telas "Em construção" num segmento único  | `app/(painel)/[secao]/page.tsx` aceita só `inicio`, `ensino`, `gestao` e `configuracoes`; os outros valores chamam `notFound()`                                            | Quatro `page.tsx` idênticos — cada área nova repetiria o arquivo; um catch-all `[...slug]` — aceitaria caminhos aninhados que não existem na árvore |

- Nothing else in this change is hard to reverse

## Checks

### S1 — Sublista do NavItem como no Figma · 2 files · 27 KB · ~7k

**C1** - Sub-item sem `activated` não tem as classes do ponto (`before:size-1`, `before:rounded-full`, `before:bg-current`); sub-item `activated` as tem, a `before:left-4.75`, com `bg-selected`, `text-primary` e `aria-current="page"` (task 1)
Proof: `npm test -w @church/ui -- src/components/atoms/NavItem/NavItem.spec.tsx -t "dot only on the activated sub-item"`

**C2** - A sublista inline expandida desenha a linha-guia: `relative` e `before:absolute before:inset-y-0 before:left-4.75 before:w-px before:bg-neutral-17` (task 2)
Proof: `npm test -w @church/ui -- src/components/atoms/NavItem/NavItem.spec.tsx -t "vertical guide line"`

**C3** - O pop-up do modo colapsado não tem linha-guia nem ponto (task 2)
Proof: `npm test -w @church/ui -- src/components/atoms/NavItem/NavItem.spec.tsx -t "pop-up has no guide line"`

### S2 — Menu do perfil no design system · 9 files · 68 KB · ~17k

**C4** - `MenuDropdown` sem `side` abre abaixo (`top-full`, `mt-1`); com `side="top"` abre acima (`bottom-full`, `mb-1`) e sem `top-full` (task 24)
Proof: `npm test -w @church/ui -- src/components/molecules/MenuDropdown/MenuDropdown.spec.tsx -t "side"`

**C5** - SideMenu com `user` e `profileMenuItems`: o botão de perfil tem `aria-haspopup="menu"`; o clique abre um `role="menu"` com os itens, posto acima (`bottom-full`), e `aria-expanded="true"` (task 21)
Proof: `npm test -w @church/ui -- src/components/organisms/SideMenu/SideMenu.spec.tsx -t "profile menu"`

**C6** - SideMenu colapsado com `profileMenuItems`: o botão só com Avatar abre o mesmo menu (task 21)
Proof: `npm test -w @church/ui -- src/components/organisms/SideMenu/SideMenu.spec.tsx -t "collapsed profile menu"`

**C7** - Esc fecha o menu do perfil e devolve o foco ao botão de perfil (task 21)
Proof: `npm test -w @church/ui -- src/components/organisms/SideMenu/SideMenu.spec.tsx -t "profile menu closes on Escape"`

**C8** - MenuDrawer com `profileMenuItems`: o botão de perfil do rodapé abre o menu acima (task 22)
Proof: `npm test -w @church/ui -- src/components/organisms/MenuDrawer/MenuDrawer.spec.tsx -t "profile menu"`

**C9** - A `Page` repassa `nav.profileMenuItems` ao MenuDrawer (task 22)
Proof: `npm test -w @church/ui -- src/components/templates/Page/Page.spec.tsx -t "profile menu in the drawer"`

**C10** - Sem `profileMenuItems`, o perfil continua o `<button>` que chama `onProfileClick` e é o último filho do rodapé (task 23)
Proof: `npm test -w @church/ui -- src/components/organisms/SideMenu/SideMenu.spec.tsx -t "profile button \(C13\)"`
Proof: `npm test -w @church/ui -- src/components/organisms/MenuDrawer/MenuDrawer.spec.tsx`

### S3 — Rota `GET /api/perfil` · 4 files · 14 KB · ~4k

**C11** - Com sessão válida e `/perfil` 200 `{ data: { nome, … } }`, a rota responde 200 `{ nome, papel }`, e o papel vem do claim `roles` do token com precedência `admin` > `secretaria` > `lider` (task 18)
Proof: `npm test -w web -- app/api/perfil/route.spec.ts -t "C11"`

**C12** - Token sem payload decodificável, ou sem papel conhecido, dá `papel: null` (task 18)
Proof: `npm test -w web -- app/api/perfil/route.spec.ts -t "C12"`

**C13** - O corpo da resposta 200 tem exatamente as chaves `nome` e `papel` (task 20)
Proof: `npm test -w web -- app/api/perfil/route.spec.ts -t "C13"`

**C14** - `/perfil` 204 → a rota responde 204 sem corpo (task 19)
Proof: `npm test -w web -- app/api/perfil/route.spec.ts -t "C14"`

**C15** - `/perfil` 500 → a rota repassa 500 com o corpo do backend (task 19)
Proof: `npm test -w web -- app/api/perfil/route.spec.ts -t "C15"`

**C16** - Sem sessão → 401 `{ message: "Sua sessão expirou. Entre novamente." }`, sem chamar o backend (task 19)
Proof: `npm test -w web -- app/api/perfil/route.spec.ts -t "C16"`

### S4 — Árvore e item atual · 2 files · 6 KB · ~2k

**C17** - Os itens são, nesta ordem, Início (`home`, `/inicio`), Pessoas (`group`, sem `href`) com Membros `/pessoas`, Visitantes `/pessoas?aba=visitantes`, GCs `/pessoas?aba=gcs` e Ministérios `/pessoas?aba=ministerios`, Ensino (`auto_stories`, `/ensino`) e Gestão (`bar_chart`, `/gestao`); o rodapé tem Configurações (`settings`, `/configuracoes`) (task 7, 8)
Proof: `npm test -w web -- lib/navigation.spec.ts -t "C17"`

**C18** - Em `/pessoas` sem `aba`, com `aba=membros`, com `aba` desconhecida, e em `/pessoas/{id}`, só Membros está `activated`, e Pessoas está `selected` (task 11)
Proof: `npm test -w web -- lib/navigation.spec.ts -t "C18"`

**C19** - Em `/pessoas?aba=visitantes|gcs|ministerios`, só o sub-item correspondente está `activated`, e Pessoas está `selected` (task 12)
Proof: `npm test -w web -- lib/navigation.spec.ts -t "C19"`

**C20** - Em `/inicio`, `/ensino`, `/gestao` e `/configuracoes`, só o item de mesmo `href` está `activated`, e Pessoas não está `selected` (task 13)
Proof: `npm test -w web -- lib/navigation.spec.ts -t "C20"`

### S5 — Shell e telas "Em construção" · 10 files · 30 KB · ~8k

**C21** - O `AppShell` renderiza a `Page` com o SideMenu (`aside` com `nav` "Menu principal") e os filhos dentro de `<main>` (task 3)
Proof: `npm test -w web -- --no-watchman 'app/\(painel\)/AppShell\.spec\.tsx' -t "C21"`

**C22** - O layout `(painel)` envolve os filhos no `AppShell`; `/login` e `/` ficam fora do `(painel)`, e o layout raiz não usa o `AppShell` (task 4)
Proof: `npm test -w web -- app/route-tree.spec.tsx -t "C22"`

**C23** - Os itens com `href` são links do Next (`<a href>`) (task 5)
Proof: `npm test -w web -- --no-watchman 'app/\(painel\)/AppShell\.spec\.tsx' -t "C23"`

**C24** - O menu começa expandido; recolhido, continua recolhido quando a URL muda e o shell não remonta (task 5, 6)
Proof: `npm test -w web -- --no-watchman 'app/\(painel\)/AppShell\.spec\.tsx' -t "C24"`

**C25** - Quando a query muda de `?aba=` para `?aba=visitantes`, o item ativo passa de Membros a Visitantes, sem remontar (task 14)
Proof: `npm test -w web -- --no-watchman 'app/\(painel\)/AppShell\.spec\.tsx' -t "C25"`

**C26** - `[secao]` com `inicio`, `ensino`, `gestao` ou `configuracoes` renderiza o `EmptyState` "Em construção", depois de `verifySession`; outro valor chama `notFound()` (task 9)
Proof: `npm test -w web -- --no-watchman 'app/\(painel\)/\[secao\]/page\.spec\.tsx' -t "C26"`

**C27** - `/pessoas?aba=visitantes|gcs|ministerios` renderiza "Em construção"; sem `aba`, `aba=membros` ou `aba` desconhecida renderiza a `PessoasPage` (task 10)
Proof: `npm test -w web -- --no-watchman 'app/\(painel\)/pessoas/page\.spec\.tsx' -t "C27"`

### S6 — Usuário e "Sair" no backoffice · 3 files · 12 KB · ~3k

**C28** - Com `/api/perfil` → `{ nome: "Fulano Teste", papel: "admin" }`, o rodapé mostra o botão de perfil com "Fulano Teste", "Administrador" e as iniciais "FT"; `secretaria` → "Secretaria", `lider` → "Líder", `null` → só o nome (task 15)
Proof: `npm test -w web -- --no-watchman 'app/\(painel\)/AppShell\.spec\.tsx' -t "C28"`

**C29** - Enquanto `/api/perfil` não resolve, o rodapé tem Configurações e nenhum botão de perfil (task 16)
Proof: `npm test -w web -- --no-watchman 'app/\(painel\)/AppShell\.spec\.tsx' -t "C29"`

**C30** - Se `perfilService.obter()` rejeitar, ou resolver `null` (204), o rodapé fica sem botão de perfil, e o shell não dispara toast próprio (task 17)
Proof: `npm test -w web -- --no-watchman 'app/\(painel\)/AppShell\.spec\.tsx' -t "C30"`

**C31** - `perfilService.obter()` chama `apiFetch('/api/perfil')` e devolve o corpo, ou `null` no 204 (task 17)
Proof: `npm test -w web -- services/perfil.spec.ts -t "C31"`

**C32** - O menu do perfil tem um único item, "Sair", com ícone `logout`; escolhê-lo chama a Server Action `logout` uma vez (task 25)
Proof: `npm test -w web -- --no-watchman 'app/\(painel\)/AppShell\.spec\.tsx' -t "C32"`

**C33** - `logout` destrói o cookie e redireciona para `/login`, mesmo com o backend falhando (task 25, 26; existente)
Proof: `npm test -w web -- app/actions/auth.spec.ts -t "logout — C8"`
Proof: `npm test -w web -- app/actions/auth.spec.ts -t "logout — C9"`

### Gate

**C34** - typecheck, lint e testes do monorepo passam, e o build do backoffice compila as rotas novas
Proof: `npm run verify`
Proof: `npm run build -w web`

## Swept

- validation: C12 — token malformado ou sem papel conhecido dá `papel: null`
- failure modes: C15, C30
- idempotency: n/a — `/api/perfil` é GET; um segundo "Sair" cai no `logout — C10` existente
- authorization: existing — `proxy.ts` (proxy C11–C14) e `verifySession` nas páginas (C26, C27);
  sem sessão, a rota responde 401 (C16)
- concurrency: existing — `refreshOnce` em `lib/server/backend.ts` serializa a renovação
  (backend.spec existente); o perfil sai junto das chamadas da `PessoasPage`
- data lifecycle: n/a — nada é gravado; o recolhimento vive em memória (C24)
- dependency failure: C15, C30, C33
- state transitions: C5, C7, C24, C25, C28–C30
- observability: n/a — o backoffice não tem canal de log; a falha do perfil é visível pelo toast
  do `apiFetch`

## Coverage

| Set (size)                               | Member -> proof                                                                                                                                                                                   | Unproven |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| itens do menu (9)                        | Início · Pessoas · Membros · Visitantes · GCs · Ministérios · Ensino · Gestão · Configurações — C17                                                                                               | -        |
| URL → item ativo (11)                    | `/pessoas` C18 · `?aba=membros` C18 · `?aba=xyz` C18 · `/pessoas/{id}` C18 · `?aba=visitantes` C19 · `?aba=gcs` C19 · `?aba=ministerios` C19 · `/inicio` `/ensino` `/gestao` `/configuracoes` C20 | -        |
| `papel` (4)                              | `admin` C11, C28 · `secretaria` C11, C28 · `lider` C11, C28 · `null` C12, C28                                                                                                                     | -        |
| `/perfil` respostas (4)                  | 200 C11 · 204 C14 · 500 C15 · sem sessão C16                                                                                                                                                      | -        |
| `[secao]` (5)                            | `inicio` · `ensino` · `gestao` · `configuracoes` · desconhecida — C26                                                                                                                             | -        |
| `aba` em `/pessoas` (6)                  | ausente · `membros` · `visitantes` · `gcs` · `ministerios` · desconhecida — C27                                                                                                                   | -        |
| onde o perfil abre o menu (3 assemblies) | SideMenu C5 · SideMenu colapsado C6 · MenuDrawer pela Page C8, C9                                                                                                                                 | -        |
| `MenuDropdown.side` (2)                  | `bottom` C4 · `top` C4                                                                                                                                                                            | -        |

- Claims naming a status code, route or response shape: C11, C13, C14, C15, C16 — each has a
  proof that calls the route handler `GET`
- C21–C25 settle the shell in jsdom; the CSS-only Painel/App switch at 960px is the existing
  `Page` behaviour (`lamb-page-shell` C28–C34) and is not re-proven here

## Handoff

S1–S6 ≈ 41k tokens of reading, all under 150k: one batch, no handoff.

- **Boundary:** S1–S6 and the gate built in one agent, C1–C34. Nothing is committed: in
  church-hub the user commits on `main` (memory `feedback-work-on-main`). The feature is the
  working tree over `066944a`.
- **Settled mid-build:** none beyond the two answers in Sources.
- **Abandoned:** rendering `useSearchParams` in the `(painel)` layout without a guard broke
  `next build` ("useSearchParams() should be wrapped in a suspense boundary at page
  /pessoas"). The layout now `await connection()` first, as the bundled Next docs advise for
  routes meant to be dynamic (`node_modules/next/dist/docs/.../use-search-params.md`). Proven in
  C22 (`connection` called once).
- **Environment:** watchman is in a poisoned state on this machine (inotify limit). Run jest
  with `--no-watchman`, e.g. `npm test -w web -- --no-watchman <path> -t "<name>"`.
- **Pre-existing failures, not from this feature:** `npm run verify` fails on 22 `@church/ui`
  tests in `src/styles.spec.ts`, `src/figma-links.spec.ts` and the C17 stories test in
  `Paginator.spec.tsx`. The same 22 fail at `HEAD` with this work stashed (22 failed, 346
  passed). `turbo run typecheck lint` passes in all 9 workspaces, and `npm run build -w web`
  passes.
