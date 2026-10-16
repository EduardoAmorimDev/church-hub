# Pop-up da navegação colapsada e nomes em en-US

> Build this with **tlc-implement**.
> Every criterion below becomes a check with a proof, referenced by its number. Nothing under
> `Unresolved` gets settled while building.

## Intent

Com o `SideMenu` colapsado, clicar num item com sub-itens (hoje só "Pessoas") abre a lista
flutuante de sub-itens, mas ela é cortada na borda do menu: não passa por cima do conteúdo da
página, só por cima do próprio `Navigation`. Quem usa o backoffice com o menu recolhido não
consegue ver nem clicar nos sub-itens "Membros", "Visitantes", "GCs" e "Ministérios". A causa está
no código: o pop-up (`popupList` em `packages/ui/src/components/atoms/NavItem/NavItem.tsx:46`) é
`absolute` dentro do `li`, e o slot `middle` do `SideMenu`
(`packages/ui/src/components/organisms/SideMenu/SideMenu.tsx:29`) é `overflow-y-auto`, o que
também recorta o eixo x. Com o menu aberto não há problema, porque a lista é inline.

O código do backoffice mistura pt-BR e en-US no que não é texto lido pelo usuário: rotas
(`/pessoas`, `/inicio`, `/api/membros/[id]/inativar`), parâmetros (`?aba=`, `?sessao=expirada`),
pastas (`(painel)`, `[secao]`), arquivos e identificadores (`MembroDrawer`, `PessoasPage`,
`membrosService.listar`). Não há convenção única, e cada arquivo novo escolhe um idioma. O
usuário fixou a regra: tudo que não é texto lido pelo usuário fica em en-US, como `/login` já
está. O source não traz números de impacto.

Passa a valer: com o menu colapsado, o pop-up de sub-itens aparece inteiro sobre a página; e as
rotas, parâmetros, arquivos, pastas e identificadores definidos pelo próprio app ficam em en-US,
com todo texto exibido ao usuário mantido em pt-BR, como hoje.

11 critérios em 2 slices · 2 one-way doors · 3 open, 0 block

## Criteria

### O pop-up da navegação colapsada flutua sobre a página

1. Dado o `AppShell` com o `SideMenu` colapsado numa página do painel, quando o usuário clica em
   "Pessoas", então os quatro sub-itens ("Membros", "Visitantes", "GCs", "Ministérios") aparecem
   inteiros à direita do item, com a borda direita do pop-up além da borda direita do
   `SideMenu`, nenhum sub-item recortado e nenhuma barra de rolagem surgindo no `SideMenu`.
2. Sempre, com o pop-up aberto, o conteúdo da página que fica sob ele não aparece através dele
   (fundo opaco de superfície) e não o cobre: o elemento no ponto central de cada sub-item é o
   próprio sub-item.
3. Dado o pop-up aberto, quando a área do menu rola ou a janela é redimensionada, então o pop-up
   continua alinhado ao item que o abriu, como acontece hoje.
4. Dado o pop-up aberto, quando o foco passa por Tab do item "Pessoas" para um sub-item, então o
   pop-up continua aberto; quando o foco sai do item e de todos os sub-itens, ele fecha. O
   mecanismo é o `handleBlur` existente (`NavItem.tsx:173`), que só funciona se o pop-up continuar
   descendente do `li`, então ele não pode ser movido para fora dessa árvore DOM.
5. Sempre, com o menu aberto (`collapsed=false`), a lista inline de sub-itens e o `MenuDrawer`
   (que sempre passa `collapsed={false}`) se comportam e são exibidos como hoje.

### Rotas, parâmetros e identificadores do app em en-US

6. Quando o usuário navega pelo `SideMenu`, a barra de endereços mostra: `/home`, `/people`,
   `/people?tab=visitors`, `/people?tab=groups`, `/people?tab=ministries`, `/teaching`,
   `/management`, `/settings` (hoje `/inicio`, `/pessoas`, `?aba=visitantes|gcs|ministerios`,
   `/ensino`, `/gestao`, `/configuracoes`). Em `/people` sem `tab`, com `tab` repetido ou
   desconhecido, e em `/people/{id}`, "Membros" é a aba e o sub-item atual, como hoje.
7. Dada uma sessão válida, quando o usuário abre `/login` ou `/`, ele é redirecionado para
   `/people`.
8. Quando uma requisição recebe 401 sem refresh possível, o usuário vai para
   `/login?session=expired` e vê o mesmo toast de sessão expirada de hoje (texto em pt-BR
   inalterado; `toastId` `session-expired`).
9. A BFF responde em `GET`/`POST /api/members`, `GET`/`PATCH /api/members/[id]`,
   `POST /api/members/[id]/deactivate`, `GET /api/members/export` e `GET /api/profile`, com os
   mesmos status e corpos das rotas atuais `/api/membros…` e `/api/perfil`, relaying sem mudança
   para `/admin/membros`, `/admin/membros/exportar`, `/admin/membros/:id/inativar`,
   `/core/pessoas` e `/perfil` do `ibfc-server`.
10. Quando alguém acessa uma URL antiga (`/pessoas`, `/inicio`, `/api/membros`, `/api/perfil`),
    então recebe 404; não há redirect (default de `Unresolved 2`).
11. Sempre, em `apps/backoffice`, `apps/app` e `packages/ui`, todo nome definido pelo próprio app
    está em en-US: arquivos, pastas, segmentos de rota, grupos de rota, nomes e valores de
    parâmetros de URL, tipos, constantes, funções, componentes, variáveis, helpers de teste e
    `toastId`. Exemplos de destino: `MembroDrawer` → `MemberDrawer`, `MembroFormDialog` →
    `MemberFormDialog`, `PessoasPage` → `PeoplePage`, `EmConstrucao` → `UnderConstruction`,
    `(painel)` → `(panel)`, `[secao]` → `[section]`, `membrosService.{listar,obter,criar,
    atualizar,inativar,exportar}` → `membersService.{list,get,create,update,deactivate,export}`,
    `ABAS_PESSOAS` → `PEOPLE_TABS`. Ficam em pt-BR somente: (a) texto exibido ao usuário — labels,
    `tabLabel`, títulos, `aria-label`, `title`, mensagens de toast e de validação; (b) o
    contrato do `ibfc-server` — paths do backend, nomes de campo do JSON e valores de enum que
    trafegam no fio (`nome`, `telefone`, `'ativo'`, `'masculino'`, `'secretaria'`…), default de
    `Unresolved 1`; (c) documentos históricos em `.tasks/`, `.checks/` e
    `docs/backend/ibfc-server.md`. Todo texto exibido ao usuário é idêntico ao de antes: as
    asserções de texto das specs existentes passam sem alterar a string esperada.

## Out of scope

- Traduzir texto exibido ao usuário — a regra do usuário mantém labels e mensagens em pt-BR.
- Renomear paths, campos ou enums do `ibfc-server` — é contrato de outro serviço.
- Corrigir `AGENTS.md`, que descreve `apps/web` e `apps/native` enquanto o código tem
  `apps/backoffice` e `apps/app` — divergência real, mas sem relação com este pedido; fica sinalizada.
- Renomear ou atualizar `.tasks/pessoas-*.md` e os `.checks/` correspondentes — são o registro do
  que foi decidido e verificado à época.

## Observable

| Surface | Decision | Landing |
| --- | --- | --- |
| tela `SideMenu` colapsado, pop-up | estado aberto | 1, 2 |
| tela `SideMenu` colapsado, pop-up | fechamento (clique no sub-item, foco fora, alternar `collapsed`) | 4; existing - `onActivate` fecha ao clicar, `useEffect([collapsed])` fecha ao alternar |
| tela `SideMenu` colapsado, pop-up | estado vazio | n/a - o pop-up só existe com `subItems.length > 0` |
| tela `SideMenu` colapsado, pop-up | loading / erro | n/a - itens estáticos de `buildNavigation`, sem fetch |
| tela `SideMenu` colapsado, pop-up | não autorizado | existing - `proxy.ts` redireciona sem sessão para `/login` |
| rotas de página | nomes e parâmetros | 6, 7, 8 |
| rotas de página | URL antiga | 10; Unresolved 2 |
| API BFF `/api/members…`, `/api/profile` | formato de resposta e de erro | 9; existing - `relayError` |
| API BFF | quem pode chamar | existing - sessão verificada em cada route handler |
| API BFF | versionamento | n/a - consumida apenas pelo próprio app, no mesmo deploy |
| API BFF | rate limit | n/a - não existe hoje e o pedido não o introduz |
| texto lido pelo usuário | conteúdo | 11 (inalterado) |

## Swept

- validation: existing - schema zod e mensagens inalterados; `tab` desconhecido cai em Membros (6)
- failure modes: 8, 10
- idempotency and retry: n/a - nenhuma escrita nova; renome de rotas não muda semântica de método
- authorization: existing - `proxy.ts` (matcher não depende dos nomes de rota) e `verifySession` nas páginas e route handlers
- concurrency and ordering: n/a - o pop-up é estado local de cada `NavItem`; não há estado compartilhado novo
- data lifecycle: n/a - nada persistido muda; o cookie `church_session` e o path de limpeza legado `/api/auth` mantêm o nome
- external-dependency failure: existing - relay ao `ibfc-server` inalterado (9)
- state transitions: 4; existing - abrir/fechar do pop-up
- observability: n/a - nenhum log ou métrica envolvido

## Impact

| Front | What changes |
|---|---|
| componente `NavItem` | o pop-up deixa de ser posicionado relativo ao `li`; consumidores: `Navigation` → `SideMenu` (colapsável) e `MenuDrawer` (nunca colapsado). Specs e stories de `NavItem`, `Navigation` e `SideMenu` são tocados; precedente de posicionamento `fixed` dentro da árvore do gatilho em `MenuDropdown.tsx:76` |
| domain | termo `aba` (query) passa a `tab` - lido hoje por `AppShell.tsx:52`, `lib/navigation.ts` e `(painel)/pessoas/page.tsx:13` |
| domain | termo `sessao=expirada` passa a `session=expired` - escrito por `lib/http.ts:29`, lido por `login/page.tsx:7` |
| domain | `secao` / `SecaoEmConstrucao` passa a `section` / `UnderConstructionSection` - lido por `[secao]/page.tsx` e `buildNavigation` |
| URLs | links e favoritos para `/pessoas`, `/inicio` etc. passam a 404 (Unresolved 2) |
| specs | `route-tree.spec.tsx` afirma nomes de pasta (`(painel)`); `proxy.spec.ts`, `navigation.spec.ts`, `http*.spec.ts` e as specs de rota afirmam paths - todos mudam com os nomes, sem mudar o comportamento afirmado |
| stored data | nada a migrar - nenhum nome persistido muda |

## Decided

| Decision | Shape | Alternative rejected |
|---|---|---|
| esquema de URLs públicas do backoffice | `/home`, `/people`, `/people?tab=visitors\|groups\|ministries`, `/people/{id}`, `/teaching`, `/management`, `/settings`, `/login?session=expired` | manter pt-BR - contraria a regra do usuário; `/login` já é o padrão. URL vira favorito e link compartilhado, por isso é porta de mão única |
| fronteira de vocabulário (precedente) | nomes definidos pelo app em en-US; nomes que espelham o fio do `ibfc-server` (campos JSON, valores de enum, paths do backend) mantêm a grafia do backend | renomear também os campos do modelo do app e traduzir na BFF - exigiria camada de mapeamento nova para a listagem e o export, que hoje são repassados crus (Unresolved 1) |

## Sources

- Pedido do usuário nesta conversa (sem endereço; trechos decisivos citados literalmente):
  "Quando ele está fechado, deve abrir um menu flutuante com as opções [...] O menu flutuante é
  cortado, ele não consegue \"flutuar\" sobre o conteúdo da página, apenas sobre o próprio
  componente navigation." / "o que não for label de botão, ou coisas do genero, coisa que o
  usuário vai ler, deve ser em en-US. o path deve ser /people por exemplo, e não /pessoas. [...]
  o path do login está correto. Dentro do código também, instancia de constantes, funções e
  arquivos, como por exemplo o \"MembroDrawer\", deve ser \"MemberDrawer\", \"PessoasPage\"
  deve ser \"PeoplePage\"."
- `docs/backend/ibfc-server.md` - define os paths e campos do backend que permanecem em pt-BR.
- `packages/ui/src/components/molecules/MenuDropdown/MenuDropdown.tsx:76` - precedente para
  escapar de ancestral com `overflow` sem sair da árvore DOM do gatilho.

This task is the record of decision. If a linked document diverges, ask before building.

## Unresolved

| # | Kind | Question | Until answered |
|---|---|---|---|
| 1 | open | Os campos e valores de enum do modelo do app (`MembroItem.nome`, `PessoaInput.telefone`, `StatusMembro = 'ativo'`) também passam a en-US, com tradução na BFF, ou mantêm a grafia do `ibfc-server`? | Escrito em 11(b): mantêm a grafia do backend; só os nomes de tipo mudam (`MembroItem` → `MemberItem`). Recomendação: manter, porque a listagem e o export são repassados crus hoje e a tradução seria uma camada nova |
| 2 | open | URLs antigas (`/pessoas` etc.) devem redirecionar para as novas? | Escrito em 10: 404, sem redirect, assumindo que o backoffice ainda não tem usuários com favoritos |
| 3 | open | Valor en-US de `?aba=gcs` (Grupos de Crescimento) | Escrito em 6: `tab=groups`. Alternativa: `tab=growth-groups` |
