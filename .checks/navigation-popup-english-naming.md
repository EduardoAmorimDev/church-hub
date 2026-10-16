# Pop-up da navegação colapsada e nomes em en-US

Profile: `light` (nenhuma declaração em `AGENTS.md`). Handoff: `on`, mas um único lote (ver `## Handoff`).

Sources:

- `.tasks/navigation-popup-english-naming.md` - critérios 1–11, Out of scope, Unresolved 1–3 (defaults assumidos: campos do fio em pt-BR, URLs antigas dão 404, `tab=groups`)
- conversa de 2026-10-19 - pedido do usuário, citado literalmente na task

## Out of scope

- Traduzir texto exibido ao usuário - a regra mantém labels e mensagens em pt-BR.
- Paths, campos JSON e valores de enum do `ibfc-server` - contrato de outro serviço (Unresolved 1 da task).
- `AGENTS.md` desatualizado (`apps/web`/`apps/native`) - sem relação com o pedido.
- `.tasks/` e `.checks/` anteriores e `docs/backend/ibfc-server.md` - registros históricos.
- Títulos de `describe`/`it` das specs - não são identificadores; só os que citam um nome renomeado (pasta, rota, parâmetro) são atualizados para não mentir.
- Commits - por `feedback-work-on-main`, o trabalho fica não commitado em `main` para o usuário.

## Landing

Toca `packages/ui/src/components/atoms/NavItem` (pop-up), a story `SideMenu/Collapsed` como palco da prova em navegador, e todo `apps/backoffice` (renome). Reusa o padrão `fixed` dentro da árvore do gatilho de `MenuDropdown.tsx:76`, sem portal; nenhuma dependência nova no repositório.

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| Esquema de URLs públicas | `/home`, `/people`, `/people?tab=visitors\|groups\|ministries`, `/teaching`, `/management`, `/settings`, `/login?session=expired` | manter pt-BR - contraria a regra do usuário |
| Fronteira de vocabulário | nomes definidos pelo app em en-US; campos do fio do `ibfc-server` (`nome`, `telefone`, `_nome`…), valores de enum do fio e paths do backend mantêm a grafia do backend | traduzir campos na BFF - camada de mapeamento nova para listagem e export (Unresolved 1) |

- Nothing else in this change is hard to reverse

## Checks

### S1 - O pop-up da navegação colapsada flutua sobre a página · 9 files · 67 KB · ~17k

Prova em navegador: Storybook em `http://localhost:6006` (`npm run storybook -w @church/ui`), story `organisms-sidemenu--collapsed`, script `NAVPOP=/tmp/claude-1000/-home-joao-eduardo-Documents-personal-church-hub/0ae33d47-79f5-41a2-b3c2-dfb22df14602/scratchpad/e2e` com `playwright-core@1.49.1` e o Chromium 1148 já em cache.

**C1** - Com o `SideMenu` colapsado, clicar em "Pessoas" mostra os 3 sub-itens da story inteiros, com a borda direita do pop-up além da borda direita do `aside`, e o slot `middle` sem rolagem horizontal (`scrollWidth === clientWidth`)
Proof: `node $NAVPOP/nav-popup.mjs c1`

**C2** - Com o pop-up aberto, `document.elementFromPoint` no centro de cada sub-item devolve o próprio sub-item (ou um descendente) e o fundo computado do pop-up tem alfa 1
Proof: `node $NAVPOP/nav-popup.mjs c2`

**C3** - Com o pop-up aberto, após rolar a janela 120px e após redimensionar a janela, a distância vertical entre o topo do pop-up e o topo do botão "Pessoas" continua a mesma (±1px)
Proof: `node $NAVPOP/nav-popup.mjs c3`

**C4** - Colapsado e com o pop-up aberto, Tab do item para um sub-item mantém o pop-up aberto; o foco saindo para fora do item o fecha
Proof: `npm test -w @church/ui -- src/components/atoms/NavItem/NavItem.spec.tsx -t "C4 popup focus"`

**C5** - Com `collapsed=false`, a lista inline e o `MenuDrawer` seguem como hoje: as specs existentes passam sem alteração de asserção
Proof: `npm test -w @church/ui -- src/components/atoms/NavItem src/components/organisms/MenuDrawer src/components/organisms/SideMenu src/components/molecules/Navigation`
Proof: `git diff --stat -- packages/ui/src/components/organisms/MenuDrawer/MenuDrawer.spec.tsx packages/ui/src/components/organisms/SideMenu/SideMenu.spec.tsx | wc -l | grep -qx 0`

### S2 - Rotas, parâmetros e identificadores do app em en-US · ~60 files · 168 KB · ~42k

**C6** - `buildNavigation` gera os hrefs `/home`, `/people`, `/people?tab=visitors`, `/people?tab=groups`, `/people?tab=ministries`, `/teaching`, `/management`, `/settings`; em `/people` sem `tab`, com `tab` desconhecido e em `/people/{id}`, "Membros" é o sub-item atual
Proof: `npm test -w web -- lib/navigation.spec.ts -t "C6"`

**C7** - A página de pessoas e o `AppShell` leem o parâmetro `tab` (não `aba`): `/people?tab=visitors` mostra a aba "Visitantes" atual nas tabs e no menu
Proof: `npm test -w web -- "app/\(panel\)/people/page.spec.tsx" -t "C7"`
Proof: `npm test -w web -- "app/\(panel\)/AppShell.spec.tsx" -t "C7"`

**C8** - Com sessão válida, `/login` responde 307 para `/people`; `/` redireciona para `/people`
Proof: `npm test -w web -- proxy.spec.ts -t "C8"`
Proof: `npm test -w web -- app/page.spec.tsx -t "C8"`

**C9** - Um 401 sem refresh leva a `/login?session=expired`, e `/login?session=expired` mostra o toast de sessão expirada com o texto de hoje e `toastId` `session-expired`
Proof: `npm test -w web -- lib/http.spec.ts -t "C9"`
Proof: `npm test -w web -- app/login/page.spec.tsx -t "C9"`

**C10** - A BFF atende em `/api/members`, `/api/members/[id]`, `/api/members/[id]/deactivate`, `/api/members/export` e `/api/profile`, com os mesmos status/corpos e relay inalterado para `/admin/membros`, `/core/pessoas`, `/core/pessoas/:id`, `/admin/membros/:id/inativar`, `/admin/membros/exportar` e `/perfil`
Proof: `npm test -w web -- app/api/members app/api/profile`
Proof: `npm test -w web -- services/members.spec.ts services/profile.spec.ts`

**C11** - URLs antigas não existem: `/pessoas`, `/inicio` e qualquer seção fora da lista dão 404 via `[section]`; não há rota em `app/api/membros` nem `app/api/perfil`
Proof: `npm test -w web -- "app/\(panel\)/\[section\]/page.spec.tsx" -t "C11"`
Proof: `cd apps/backoffice/app && test ! -e api/membros && test ! -e api/perfil && test ! -e "(painel)" && test ! -e "(panel)/pessoas"`

**C12** - Nenhum arquivo ou pasta em `apps/backoffice` (fora de artefatos de build), `apps/app/app` e `packages/ui/src` tem nome com palavra pt-BR
Proof: `node $NAVPOP/en-names.mjs files`

**C13** - Nenhum identificador declarado (variável, função, parâmetro, binding, tipo, interface, componente, propriedade de tipo/objeto) nesses diretórios contém palavra pt-BR, salvo os campos do fio do `ibfc-server` em allowlist explícita
Proof: `node $NAVPOP/en-names.mjs identifiers`

**C14** - Todo texto exibido ao usuário continua idêntico: nenhuma string literal pt-BR com acento ou espaço foi removida do código de produção sem reaparecer igual
Proof: `node $NAVPOP/en-names.mjs copy`

**C15** - O gate completo passa
Proof: `npm run verify`

## Swept

- validation: existing - zod inalterado; `tab` desconhecido → Membros (C6)
- failure modes: C9, C11
- idempotency: not in scope - nenhuma escrita nova
- authorization: existing - `proxy.ts` (matcher independente dos nomes) e `verifySession` nas páginas e route handlers
- concurrency: not in scope - estado local de cada `NavItem`
- data lifecycle: not in scope - cookie `church_session` e path legado `/api/auth` mantêm nome
- dependency failure: existing - relay ao `ibfc-server` inalterado (C10)
- state transitions: C4; existing - abrir/fechar do pop-up
- observability: not in scope - sem log ou métrica

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| URLs de página (8) | `/home` `/people` `?tab=visitors` `?tab=groups` `?tab=ministries` `/teaching` `/management` `/settings` - C6 | - |
| rotas BFF (5) | `/api/members` · `/api/members/[id]` · `.../deactivate` · `/api/members/export` · `/api/profile` - C10 | - |
| URLs antigas (4 tipos) | página `/pessoas` C11 · seção `/inicio` C11 · `api/membros` C11 · `api/perfil` C11 | - |
| efeitos do pop-up (3) | visível C1 · por cima C2 · ancorado C3 | - |

- Claims naming a status code, route or response shape: C8, C10, C11 - cada um tem proof que atravessa o handler/proxy
- No other check claims more than the single case its proof exercises

## Handoff

S1 ≈ 17k + S2 ≈ 42k = 59k, abaixo de 150k: um único lote, sem handoff.
