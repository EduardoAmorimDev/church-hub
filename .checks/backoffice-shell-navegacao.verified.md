# Backoffice — layout da aplicação com menu lateral · Verification

**Verdict**: PASS (34/34 checks provados; achados não bloqueantes abaixo)
**Profile**: light
**Diff range**: `066944a..working tree` (nada commitado; inclui os 14 arquivos não rastreados e a
movimentação `apps/backoffice/app/pessoas` → `apps/backoffice/app/(painel)/pessoas`)
**Round**: 1 - full
**Verifier**: sub-agente independente (author != verifier), somente leitura

## Passos executados

- **Passo 1 (fontes binding, `ui`)**: não executado — o perfil é `light`. Os nós do Figma
  `282:37325`, `141:4443` e `13506:10602` não foram abertos; nenhuma afirmação sobre
  contradição com o design ou elemento não coberto é feita aqui.
- **Passo 2 (rodar toda prova)**: executado, em lote por workspace, com `--no-watchman` e saída
  `--json` (o condensador de saída deste ambiente suprime as linhas `--verbose`; o JSON lista
  cada teste com o seu `status`).
- **Passo 3 (asserção contra o valor do checklist)**: executado, com `file:line` e expressão.
- **Passo 4 (injeção de falhas, `standard`/`ui`)**: não executado — perfil `light`.
- **Coverage join e Test policy**: não recomputados (só `standard`/`ui`); seguem observações.
- O tree foi conferido antes e depois: `git status --short` com as mesmas 45 entradas.

## Execuções

| Workspace | Comando | Resultado |
|---|---|---|
| `@church/ui` | `npx jest --no-watchman --json NavItem.spec.tsx MenuDropdown.spec.tsx SideMenu.spec.tsx MenuDrawer.spec.tsx Page.spec.tsx` | 65 passed, 0 failed |
| `@church/ui` | o mesmo, com `-t "dot only on the activated sub-item\|vertical guide line\|pop-up has no guide line\|side\|profile menu\|collapsed profile menu\|profile menu closes on Escape\|profile menu in the drawer\|profile button \(C13\)"` | 20 passed, 45 skipped — todo filtro do checklist casa ao menos um teste |
| `web` | `npx jest --no-watchman --json app/api/perfil/route.spec.ts lib/navigation.spec.ts app/route-tree.spec.tsx services/perfil.spec.ts app/actions/auth.spec.ts` | 52 passed, 0 failed |
| `web` | `npx jest --no-watchman --json 'app/\(painel\)/AppShell\.spec\.tsx' 'app/\(painel\)/\[secao\]/page\.spec\.tsx' 'app/\(painel\)/pessoas/page\.spec\.tsx'` | 28 passed, 0 failed |
| `web` | comando literal do checklist: `npm test -w web -- --no-watchman "app/(painel)/AppShell.spec.tsx" -t "C21"` | **exit 1, `Pattern: app/(painel)/AppShell.spec.tsx - 0 matches`** (ver achado 1) |

## Checks

| Check | Claim | Proof run | Evidence | Result |
|---|---|---|---|---|
| C1 | ponto só no sub-item `activated`, `before:left-4.75`, `bg-selected`, `text-primary`, `aria-current` | `NavItem sub-item: 38px left padding and a 4px dot 19px from the edge, dot only on the activated sub-item` passed | `packages/ui/src/components/atoms/NavItem/NavItem.spec.tsx:443` - `const dot = ['before:left-4.75','before:size-1','before:rounded-full','before:bg-current']`; `:451` - `for (const token of dot) expect(idle).not.toHaveClass(token)`; `:452` - `expect(current).toHaveClass('pl-9.5', ...dot)`; `:453` - `expect(current).toHaveClass('bg-selected', 'text-primary')`; `:454` - `expect(current).toHaveAttribute('aria-current', 'page')` | PASS |
| C2 | linha-guia na sublista inline | `NavItem sub-list: a 1px neutral-17 vertical guide line down the dot column` passed | `NavItem.spec.tsx:468` - `expect(list).toHaveClass('relative','before:absolute','before:inset-y-0','before:left-4.75','before:w-px','before:bg-neutral-17')` | PASS |
| C3 | pop-up colapsado sem linha-guia nem ponto | `NavItem collapsed: the sub-item pop-up has no guide line and no dot` passed | `NavItem.spec.tsx:491` - `expect(list?.className ?? '').not.toMatch(/before:/)`; `:492` - `expect(current.className).not.toMatch(/before:/)` (o sub-item ativo); `:493` - idem para `GCs` | PASS |
| C4 | `side` padrão `bottom` (`top-full mt-1`); `top` → `bottom-full mb-1`, sem `top-full` | `MenuDropdown side: bottom by default, top opens above the trigger` passed | `packages/ui/src/components/molecules/MenuDropdown/MenuDropdown.spec.tsx:83` - `expect(menuOf()).toHaveClass('top-full', 'mt-1')`; `:89` - `expect(menuOf()).toHaveClass('bottom-full', 'mb-1')`; `:90` - `expect(menuOf()).not.toHaveClass('top-full')` | PASS |
| C5 | perfil com `aria-haspopup="menu"`; clique abre `role="menu"` acima, `aria-expanded="true"` | `SideMenu profile menu: the profile button opens profileMenuItems above it` passed | `packages/ui/src/components/organisms/SideMenu/SideMenu.spec.tsx:387` - `expect(profile).toHaveAttribute('aria-haspopup', 'menu')`; `:394` - `expect(profile).toHaveAttribute('aria-expanded', 'true')`; `:395` - `expect(menu).toHaveClass('bottom-full', 'mb-1', 'left-0')`; `:397` - `expect(within(menu).getAllByRole('menuitem')).toHaveLength(1)` | PASS |
| C6 | colapsado, o botão só com Avatar abre o mesmo menu | `SideMenu collapsed profile menu: the avatar-only button opens the same menu` passed | `SideMenu.spec.tsx:416` - `expect(within(profile).queryByText('Pessoa Exemplo')).toBeNull()`; `:418` - `expect(within(screen.getByRole('menu', { name: 'Menu do perfil' })).getByRole('menuitem', { name: 'Sair' })).toBeInTheDocument()` | PASS |
| C7 | Esc fecha e devolve o foco ao perfil | `SideMenu profile menu closes on Escape and gives focus back to the profile` passed | `SideMenu.spec.tsx:439` - `expect(screen.queryByRole('menu')).not.toBeInTheDocument()`; `:440` - `expect(profile).toHaveFocus()` | PASS |
| C8 | MenuDrawer: perfil do rodapé abre o menu acima | `MenuDrawer profile menu: the footer profile opens profileMenuItems above it` passed | `packages/ui/src/components/organisms/MenuDrawer/MenuDrawer.spec.tsx:317` - `expect(profile).toHaveAttribute('aria-haspopup', 'menu')`; `:321` - `expect(menu).toHaveClass('bottom-full', 'mb-1')` | PASS |
| C9 | `Page` repassa `nav.profileMenuItems` ao MenuDrawer | `Page profile menu in the drawer: nav.profileMenuItems reaches the MenuDrawer` passed | `packages/ui/src/components/templates/Page/Page.spec.tsx:678` - `expect(within(screen.getByRole('menu', { name: 'Menu do perfil' })).getByRole('menuitem', { name: 'Sair' })).toBeInTheDocument()` (aberto a partir de `within(drawerOf())`) | PASS |
| C10 | sem `profileMenuItems`, `<button>` que chama `onProfileClick`, último filho do rodapé | `SideMenu profile button (C13)` passed; `MenuDrawer.spec.tsx` inteiro, 10/10 passed | `SideMenu.spec.tsx:301` - `expect(profile).toHaveAttribute('type', 'button')`; `:302` - `expect(getFooter().lastElementChild).toBe(profile)`; `:331` - `expect(onProfileClick).toHaveBeenCalledTimes(1)`; `MenuDrawer.spec.tsx:198` - `expect(footer.lastElementChild).toBe(profile)`; `:203` - `expect(onProfileClick).toHaveBeenCalledTimes(1)` | PASS (provas pré-existentes, adequadas a um claim de não-regressão; rodaram contra o `ProfileButton` alterado) |
| C11 | 200 `{ nome, papel }`, papel do claim `roles`, `admin` > `secretaria` > `lider` | 5 casos `roles %j → papel %s` + `decodes the renewed token when sessionFetch refreshes first` passed | `apps/backoffice/app/api/perfil/route.spec.ts:57-61` - tabela `[['admin'],'admin']`…`[['lider','secretaria'],'secretaria']`, `[['lider','admin','secretaria'],'admin']`; `:68` - `expect(res.status).toBe(200)`; `:69` - `await expect(res.json()).resolves.toEqual({ nome: 'Fulano Teste', papel })`; `:93` - `toEqual({ nome: 'Fulano Teste', papel: 'admin' })` após o refresh | PASS |
| C12 | token sem payload decodificável ou sem papel conhecido → `papel: null` | 5 casos passed | `route.spec.ts:102-106` - `'access-fake'`, `'header.bmFvLWpzb24.sig'`, sem `roles`, `roles: 'admin'`, `roles: ['visitante']`; `:114` - `await expect(res.json()).resolves.toEqual({ nome: 'Fulano Teste', papel: null })` | PASS |
| C13 | corpo 200 só com `nome` e `papel` | `drops email, telefone, gc, id and the token` passed | `route.spec.ts:130` - `expect(Object.keys(JSON.parse(text) as object).sort()).toEqual(['nome', 'papel'])`; `:134` - `expect(text).not.toContain(token)` | PASS |
| C14 | `/perfil` 204 → 204 sem corpo | `answers 204 with an empty body` (+ `answers 204 when the 200 body has no nome`) passed | `route.spec.ts:145` - `expect(res.status).toBe(204)`; `:146` - `await expect(res.text()).resolves.toBe('')` | PASS |
| C15 | `/perfil` 500 → repassa 500 com o corpo | `relays 500 with its body` passed | `route.spec.ts:167` - `expect(res.status).toBe(500)`; `:168` - `await expect(res.json()).resolves.toEqual(body)` com `body` em `:162` | PASS |
| C16 | sem sessão → 401 com a mensagem, sem chamar o backend | `answers 401 with the session-expired message` (+ refresh revogado) passed | `route.spec.ts:179` - `expect(res.status).toBe(401)`; `:180` - `toEqual(SESSION_EXPIRED_BODY)`; `:181` - `expect(fetchSpy).not.toHaveBeenCalled()` | PASS (ver achado 4: o valor esperado vem de `test/routeSession.ts:21`) |
| C17 | árvore, ordem, ícones e destinos | `buildNavigation — C17 … lists the items in the prototype order` passed | `apps/backoffice/lib/navigation.spec.ts:47-54` - `toEqual([{label:'Início',iconName:'home',href:'/inicio'},{label:'Pessoas',iconName:'group',href:undefined},{label:'Ensino',iconName:'auto_stories',href:'/ensino'},{label:'Gestão',iconName:'bar_chart',href:'/gestao'}])`; `:57-62` - os 4 sub-itens com `/pessoas`, `?aba=visitantes`, `?aba=gcs`, `?aba=ministerios`; `:69-71` - `[{ label: 'Configurações', iconName: 'settings', href: '/configuracoes' }]` | PASS |
| C18 | `/pessoas` sem aba, `membros`, desconhecida, `/pessoas/{id}` → só Membros `activated`, Pessoas `selected` | 5 casos passed | `navigation.spec.ts:77-81` - tabela; `:83` - `expect(activated(pathname, aba)).toEqual(['Membros'])`; `:84` - `expect(pessoasSelected(pathname, aba)).toBe(true)` | PASS |
| C19 | `?aba=visitantes\|gcs\|ministerios` → só o sub-item, Pessoas `selected` | 3 casos passed | `navigation.spec.ts:94` - `expect(activated('/pessoas', aba)).toEqual([label])`; `:95` - `expect(pessoasSelected('/pessoas', aba)).toBe(true)` | PASS |
| C20 | `/inicio`, `/ensino`, `/gestao`, `/configuracoes` → só o item, Pessoas não `selected` | 4 casos + caminho fora da árvore passed | `navigation.spec.ts:106` - `expect(activated(pathname)).toEqual([label])`; `:107` - `expect(pessoasSelected(pathname)).toBe(false)` | PASS |
| C21 | `Page` com SideMenu (`aside` com nav "Menu principal") e filhos em `<main>` | `AppShell — C21 …` passed | `apps/backoffice/app/(painel)/AppShell.spec.tsx:86` - `expect(within(asideOf()).getByRole('navigation')).toBe(navOf())` (`navOf` = nav "Menu principal", `:72`); `:87` - `expect(within(screen.getByRole('main')).getByText('Conteúdo da página')).toBeInTheDocument()` | PASS |
| C22 | layout `(painel)` envolve no `AppShell`; `/login` e `/` fora; raiz sem `AppShell` | 4 testes `route tree — C22` passed | `apps/backoffice/app/route-tree.spec.tsx:30` - `expect(isValidElement(element) && element.type).toBe(AppShell)`; `:29` - `expect(connection).toHaveBeenCalledTimes(1)`; `:37-40` - `exists('login','page.tsx')` true, `exists('(painel)','login')` false; `:53` - `expect(root).not.toMatch(/AppShell\|@church\/ui\/templates\/Page/)` | PASS |
| C23 | itens com `href` são `<a href>` | `AppShell — C23 …` passed | `AppShell.spec.tsx:102` - `expect(hrefs).toEqual(['/inicio','/pessoas','/pessoas?aba=visitantes','/pessoas?aba=gcs','/pessoas?aba=ministerios','/ensino','/gestao','/configuracoes'])` | PASS |
| C24 | começa expandido; recolhido continua recolhido quando a URL muda; não remonta | `AppShell — C24 …` passed | `AppShell.spec.tsx:121` - `toHaveAttribute('data-collapsed', 'false')`; `:128` - `toHaveAttribute('data-collapsed', 'true')` após `at('/inicio')` + `rerender`; `:133` - `expect(mockObter).toHaveBeenCalledTimes(1)` | PASS (ver achado 2) |
| C25 | `?aba=` → `?aba=visitantes` move o ativo de Membros a Visitantes, sem remontar | `AppShell — C25 …` passed | `AppShell.spec.tsx:149` - Visitantes `toHaveAttribute('aria-current', 'page')`; `:153` - Membros `not.toHaveAttribute('aria-current')`; `:156` - `expect(mockObter).toHaveBeenCalledTimes(1)` | PASS |
| C26 | `[secao]` aceito → `EmptyState` "Em construção" após `verifySession`; outro → `notFound()` | 6 testes `[secao] — C26` passed | `apps/backoffice/app/(painel)/[secao]/page.spec.tsx:42` - `screen.getByRole('heading', { name: 'Em construção' })`; `:44` - `expect(mockVerifySession).toHaveBeenCalledTimes(1)`; `:50` - `rejects.toThrow('NEXT_NOT_FOUND')`; `:53` - `expect(notFound).toHaveBeenCalledTimes(1)`; `:59` - não renderiza quando `verifySession` redireciona | PASS |
| C27 | `?aba=visitantes\|gcs\|ministerios` → "Em construção"; sem aba, `membros`, desconhecida → `PessoasPage` | 7 testes `pessoas page — C27` passed | `apps/backoffice/app/(painel)/pessoas/page.spec.tsx:70` - `expect(typeOf(await PessoasRoute(comAba(aba)))).toBe(EmConstrucao)`; `:80` - `expect(typeOf(await PessoasRoute(props))).toBe(PessoasPage)` com a tabela em `:75-78` | PASS |
| C28 | nome, rótulo do papel, iniciais "FT"; `null` → só o nome | 4 testes `AppShell — C28` passed | `AppShell.spec.tsx:163-165` - `['admin','Administrador']`, `['secretaria','Secretaria']`, `['lider','Líder']`; `:172` - `getByText('Fulano Teste')`; `:173` - `getByText(label)`; `:174` - `getByText('FT')`; `:184-185` - `for (const label of ['Administrador','Secretaria','Líder']) expect(within(profile).queryByText(label)).toBeNull()` | PASS |
| C29 | pendente → Configurações e nenhum botão de perfil | `AppShell — C29 …` passed | `AppShell.spec.tsx:194` - `expect(screen.getByRole('link', { name: 'Configurações' })).toBeInTheDocument()`; `:197` - `expect(profileOf()).toBeNull()` | PASS |
| C30 | rejeição ou `null` → sem perfil, sem toast próprio | 2 testes `AppShell — C30` passed | `AppShell.spec.tsx:215` - `expect(profileOf()).toBeNull()`; `:216` - `expect(toast.error).not.toHaveBeenCalled()`; `:227-228` - idem para `null` | PASS (ver achado 3) |
| C31 | `obter()` chama `apiFetch('/api/perfil')`, devolve o corpo ou `null` | 3 testes `perfilService.obter — C31` passed | `apps/backoffice/services/perfil.spec.ts:20` - `resolves.toEqual({ nome: 'Fulano Teste', papel: 'lider' })`; `:25` - `expect(mockApiFetch).toHaveBeenCalledWith('/api/perfil')`; `:31` - `resolves.toBeNull()` (o 204 → `null` é do `apiFetch` existente, `lib/http.ts:79`, provado em `lib/http.spec.ts:160`) | PASS |
| C32 | um item "Sair" com ícone `logout`; escolher chama `logout` uma vez | `AppShell — C32 …` passed | `AppShell.spec.tsx:241` - `expect(items).toHaveLength(1)`; `:242` - `expect(items[0]).toHaveAccessibleName('Sair')`; `:243` - `expect(within(menu).getByText('logout')).toBeInTheDocument()`; `:246` - `expect(logout).toHaveBeenCalledTimes(1)` | PASS |
| C33 | `logout` destrói o cookie e redireciona a `/login`, mesmo com o backend falhando (existente) | `logout — C8 …` (1) e `logout — C9 …` (2) passed | `apps/backoffice/app/actions/auth.spec.ts:205` - `await expect(logout()).rejects.toThrow('NEXT_REDIRECT /login')`; `:213` - `expect(mockCookies.lastWrite()?.options.maxAge).toBe(0)`; `:228-229` e `:238-240` - o mesmo com rejeição e com 500 | PASS (prova pré-existente; `auth.ts` fora do diff, como o checklist declara) |
| C34 | typecheck, lint e testes passam; o build compila as rotas novas | ver **Gate** | ver **Gate** | PASS para a feature (22 falhas pré-existentes, fora do diff) |

## Swept — linhas "existing" relidas

| Linha | Restrição citada | No código | Resultado |
|---|---|---|---|
| authorization | `proxy.ts` (proxy C11–C14) e `verifySession` nas páginas | `apps/backoffice/proxy.ts`: sem sessão redireciona a `/login`; `config.matcher: ['/((?!api\|_next/static\|_next/image\|favicon.ico\|.*\\..*).*)']` cobre `/inicio`, `/ensino`, `/gestao`, `/configuracoes` e `/pessoas`. `proxy.spec.ts:27,39,54,69` tem C11–C14. `verifySession` em `app/(painel)/[secao]/page.tsx:9`, `app/(painel)/pessoas/page.tsx` e `app/(painel)/pessoas/[id]/page.tsx:7`. `/api/*` fica fora do matcher, e a rota responde 401 sozinha (C16) | presente |
| concurrency | `refreshOnce` em `lib/server/backend.ts` serializa a renovação (backend.spec existente) | `lib/server/backend.ts:103` - `refreshOnce` reusa a promessa em voo por refresh token; `:126` - usada por `renew`. `lib/server/backend.spec.ts:220-221` - `sessionFetch — C23: one refresh per refresh token within 10 s … shares a single POST /auth/refresh between concurrent and late requests` | presente |

As linhas `n/a` (idempotency, data lifecycle, observability) não têm o que conferir no código.

## Coverage (observações sob `light`; o join não foi recomputado)

- `papel` (4): `admin`, `secretaria`, `lider` e `null` têm asserção na rota (C11/C12) e no shell
  (C28) — confirmado nas tabelas `route.spec.ts:57-61,102-106` e `AppShell.spec.tsx:163-165,177`.
- `/perfil` respostas: 200, 204, 500 e sem sessão têm asserção; há um membro a mais, provado e
  não listado na linha: 200 sem `nome` → 204 (`route.spec.ts:149-156`).
- `[secao]` (5) e `aba` em `/pessoas`: todos os membros listados têm caso na tabela. A linha
  "`aba` em `/pessoas` (5)" enumera 6 membros (ausente, `membros`, `visitantes`, `gcs`,
  `ministerios`, desconhecida) e a prova cobre ainda um sétimo, `aba` repetida
  (`page.spec.tsx:78`) — imprecisão de contagem na tabela, não lacuna de prova.
- "URL → item ativo (8)" enumera 11 URLs; todas têm caso em `navigation.spec.ts`.
- Fora do checklist, sem efeito no veredito: o critério 1 da task diz "vale nas duas
  densidades" e o C1 não o repete; o critério 21 inclui "clique fora fecha", que o C7 não cita
  (o comportamento é o `dismissal (C83)` existente do `MenuDropdown`, que passou).

## Gate

- `npx turbo run typecheck lint --continue --force` — 9 successful, 9 total (sem cache).
- `npm run verify -- --force --continue` — exit 1:
  - `web:test` — 22 suites, 181 passed, 0 failed.
  - `@church/ui:test` — 54 suites (3 failed), 1020 passed, **22 failed**, todas em
    `src/figma-links.spec.ts` (inclui `lamb page shell (lote 5) › batch 5 figma nodes (C36)`),
    `src/styles.spec.ts` (`loads Inter as --font-inter in apps/web` — `ENOENT … apps/web/app/layout.tsx`;
    o diretório `apps/web` não existe neste tree) e `Paginator › C17 stories` (espera
    `node-id=13607-2572`, recebe `13607-2556`).
  - Pré-existentes, não da feature: `git diff 066944a --stat -- packages/ui/src/styles.spec.ts
    packages/ui/src/figma-links.spec.ts packages/ui/src/components/molecules/Paginator
    packages/ui/src/styles.css packages/tokens` vem vazio; nenhum `*.stories.tsx` está no diff
    nem no `git status`; e o `styles.spec.ts` lê `apps/web/app/layout.tsx`, não o
    `apps/backoffice/app/layout.tsx` que a feature alterou. A afirmação do Handoff de que as
    mesmas 22 falham em `HEAD` não foi re-executada aqui (exigiria outro tree); a conclusão
    acima vem da leitura do diff.
- `npm run build -w web` — exit 0, `✓ Compiled successfully`; rotas `ƒ /[secao]`,
  `ƒ /api/perfil`, `ƒ /login`, `ƒ /pessoas`, `ƒ /pessoas/[id]`, `ƒ Proxy (Middleware)`.

## Achados (não bloqueantes, em ordem)

1. **Comandos de prova com `(painel)` não casam nada** — C21, C23, C24, C25, C26, C27, C28, C29,
   C30 e C32. O argumento posicional do Jest é regex, então `"app/(painel)/AppShell.spec.tsx"`
   vira um grupo e casa `app/painel/…`. Executado literalmente:
   `Pattern: app/(painel)/AppShell.spec.tsx - 0 matches`, exit 1. Os testes existem e passam com
   o caminho escapado (`'app/\(painel\)/AppShell\.spec\.tsx'`). É uma lacuna de precisão do
   checklist: quem rodar as provas como escritas não reproduz o verde.
2. **C24/C25 — "não remonta" não pode falhar no teste.** O `rerender` do Testing Library
   preserva a instância por construção, então `data-collapsed="true"` (`AppShell.spec.tsx:128`)
   e `mockObter` chamado 1 vez (`:133`, `:156`) seguem verdadeiros mesmo que, no Next, o shell
   remontasse. A garantia real é estrutural: o `AppShell` mora no layout do `(painel)` (C22,
   `route-tree.spec.tsx:30`).
3. **C30 — o caso de rejeição observa após um único microtask** (`AppShell.spec.tsx:210-212`).
   Não se verificou se a asserção pegaria uma implementação que preenchesse o perfil no `catch`;
   isso seria injeção de falha, que não roda sob `light`.
4. **C16 — o valor esperado não é legível na asserção** (`route.spec.ts:180`,
   `SESSION_EXPIRED_BODY` vem de `apps/backoffice/test/routeSession.ts:21`). O valor lá,
   `{ message: 'Sua sessão expirou. Entre novamente.' }`, coincide com o claim.
5. **Contagens da tabela Coverage** — "`aba` em `/pessoas` (5)" lista 6 membros e
   "URL → item ativo (8)" lista 11. Só texto; as provas cobrem todos.
