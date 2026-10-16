# Gestão de pessoas — alinhamento ao Figma, drawer, menu de ações e cadastro

> Build this with **tlc-implement**.
> Every criterion below becomes a check with a proof, referenced by its number. Nothing under
> `Unresolved` gets settled while building.

## Intent

A tela `/pessoas` do backoffice (`apps/backoffice/app/(painel)/pessoas/PessoasPage.tsx`) diverge
do design em dez pontos levantados pelo dono em 2026-10-19 (screenshot
`Screenshot From 2026-10-19 17-23-00.png`, fora do repositório): o título fica num wrapper com
`p-6` somado ao padding do `PageBody`; há dois botões ("Adicionar pessoa", desabilitado, e
"Exportar base") que o design não tem; não há abas, busca nem "Adicionar membro"; o rodapé
cola os botões de navegação ao contador "1-1 de 1 item"; as colunas são Nome/Telefone/Bairro/
Status/Origem; o chevron da linha leva a uma página stub `/pessoas/[id]`. O admin não consegue
cadastrar, editar nem inativar um membro pela interface — hoje isso só se faz pelo
Swagger/Postman do `ibfc-server`.

Quando esta task estiver pronta, `/pessoas` reproduz o frame **141-4445** do Figma Backoffice:
cabeçalho com abas de navegação, card da tabela com a busca (desabilitada até o backend ter
filtro por nome) e "Adicionar membro", colunas Membro/Contato/Grupo de Crescimento/Data de
ingresso/Situação/Ações, paginador com "Linhas" à esquerda e navegação à direita. O olho abre o
drawer do membro (289-39940) pela direita; os três pontos abrem um menu flutuante com Editar e
Inativar; Adicionar e Editar usam um modal de formulário. Só frontend: nenhuma mudança no
`ibfc-server`; o cadastro usa `/core/pessoas` como solução provisória, para testar adição e
edição.

29 critérios em 7 slices · 5 one-way doors · 12 open, dos quais 0 bloqueiam e 1 bloqueia go-live

## Criteria

### Slice 1 — Cabeçalho e abas de navegação

1. Em `/pessoas`, o título "Gestão de pessoas" é o `<h1>` da página, sem wrapper com padding
   próprio: sua borda esquerda alinha com a do primeiro `StatCard` (ambos só com o padding do
   `PageBody`, `px-8` no desktop). Os botões "Adicionar pessoa" e "Exportar base" não existem
   na página.
2. Abaixo do título há um `<nav aria-label="Seções de pessoas">` com quatro abas-link, nesta
   ordem e com estes destinos: "Membros" → `/pessoas`, "Visitantes" →
   `/pessoas?aba=visitantes`, "Grupos de Crescimento" → `/pessoas?aba=gcs`, "Ministérios" →
   `/pessoas?aba=ministerios` (Figma 141-4446: Tab com borda, gap 8px, visual do `Chip`).
3. A aba da `aba` atual da URL tem `aria-current="page"` e o estilo selecionado do Figma; sem
   `aba`, ou com `aba` desconhecida (`?aba=xyz`), "Membros" é a atual — a mesma regra que
   `buildNavigation` aplica ao sub-item do SideMenu.
4. Quando o admin clica em "Visitantes", a URL vira `/pessoas?aba=visitantes`, o sub-item
   "Visitantes" do SideMenu fica ativo, o título e as abas continuam visíveis e abaixo deles
   aparece o `EmConstrucao` (hoje o `EmConstrucao` substitui a página inteira).

### Slice 2 — Barra da tabela

5. A primeira linha do card da tabela mostra, à esquerda, um `SearchField` desabilitado com
   placeholder "Buscar membro" (Figma 149-3908) — não aceita digitação e não dispara
   requisição — e, à direita, o botão `filled` `neutral` "Adicionar membro" com o ícone `add`
   antes do rótulo (Figma 149-3996). O botão "Bairro" (288-38990) não aparece.

### Slice 3 — Paginador

6. No rodapé do card, o seletor "Linhas" e o texto "X-Y de N itens" ficam encostados à
   esquerda e os botões de navegação (primeira, anterior, páginas, próxima, última) encostados à
   direita, ocupando a largura do rodapé (Figma 162-10794). Hoje o `<nav>` do `Paginator` não
   ocupa a largura do footer do `Section` (`flex items-center gap-4`, filho sem largura), e o
   `justify-between` dele não tem efeito.

### Slice 4 — Colunas e células

7. Os cabeçalhos da tabela são, nesta ordem: "Membro", "Contato", "Grupo de Crescimento",
   "Data de ingresso", "Situação", "Ações" (Figma 154-17874).
8. A célula Membro mostra um `Avatar` com as iniciais do nome (o backend não tem foto) ao lado
   do nome (Figma 282-38969); `"Pessoa Exemplo"` mostra `PE`.
9. A célula Contato mostra o e-mail na primeira linha e o telefone na segunda (Figma
   162-7854); com `email: null`, só o telefone. Um telefone de 11 dígitos `11900000000`
   aparece como `(11) 9 0000-0000`; outro comprimento aparece como veio.
10. Em toda linha, a célula Grupo de Crescimento mostra o texto `a fazer` (o backend não
    devolve o GC; Figma 162-7855).
11. Em toda linha, a célula Data de ingresso mostra o texto `a fazer` (o backend não devolve a
    data; Figma 162-7856).
12. A célula Situação mostra um `Badge` `neutral` `low` com "Ativo" para `status: 'ativo'` e
    "Inativo" para `'inativo'` (Figma 162-7857 — o mesmo estilo nos dois; hoje é `Tag` verde
    para ativo).
13. A célula Ações mostra dois `IconButton`: `visibility` com `aria-label="Ver membro"` e
    `more_vert` com `aria-label="Mais ações"` (Figma 162-7858); o `chevron_right` some.

### Slice 5 — Drawer do membro

14. Quando o admin clica em "Ver membro", um `Drawer` `mode="modal"` entra deslizando da borda
    direita para a esquerda e mostra, no cabeçalho, o `Avatar` com iniciais, o nome, o `Badge`
    de situação e o botão "Editar"; e a seção "Informações de Contato" com Telefone, E-mail e
    Endereço (Figma 289-39940), com os dados da linha clicada. Com `prefers-reduced-motion`, o
    drawer aparece sem deslizar.
15. Clicar em "Editar" no drawer fecha o drawer e abre o modal de edição do mesmo membro
    (criterion 24).
16. Esc, o botão Fechar e o clique no scrim fecham o drawer, e o foco volta ao botão "Ver
    membro" que o abriu (existing — `useModalLayer`).
17. `GET /pessoas/id-fake-001` responde a página 404 do Next: a rota `pessoas/[id]` não
    existe mais.

### Slice 6 — Menu de ações e inativação

18. Quando o admin clica em "Mais ações", abre um menu flutuante ancorado ao botão, com
    "Editar" (ícone `edit`) e "Inativar" (ícone `person_off`), ambos neutros. Na última linha
    visível da tabela o menu aparece inteiro, sem ser cortado pelo `overflow-x-auto` da tabela
    nem criar barra de rolagem nela.
19. Esc ou um clique fora fecham o menu e devolvem o foco ao botão (existing — `MenuDropdown`).
20. "Editar" no menu abre o modal de edição do membro da linha (criterion 24).
21. "Inativar" num membro `ativo` chama, sem diálogo de confirmação, o BFF que repassa a
    `POST /admin/membros/:id/inativar`; com `200`, aparece o toast "Membro inativado.", e a
    tabela e os três `StatCard`s recarregam — a linha passa a mostrar "Inativo".
22. Num membro com `status: 'inativo'`, o item "Inativar" aparece desabilitado.
23. Se a inativação falha (4xx/5xx), o toast vem da camada HTTP (existing — `lib/http.ts`) e a
    tabela não muda. Com `204` (pessoa inexistente), a tabela recarrega.

### Slice 7 — Modal de membro (criar e editar)

24. "Adicionar membro" abre um `Dialog` `size="large"` com título "Adicionar membro"; "Editar"
    abre o mesmo `Dialog` com título "Editar membro". O formulário tem os campos do contrato de
    `/core/pessoas` (doc §8): Nome, CPF, Data de nascimento, Gênero (Masculino/Feminino/Outro),
    E-mail, Telefone, Endereço (CEP, Rua, Número, Complemento, Bairro, Cidade, Estado, País) e,
    opcionais, Profissão, Escolaridade e Estado civil. Ações: "Cancelar" e "Salvar".
25. Ao salvar com Nome, CPF, Data de nascimento, Gênero, E-mail, Telefone, CEP, Rua, Número,
    Bairro, Cidade, Estado ou País vazios, ou com e-mail sem `@`, cada campo inválido mostra seu
    erro inline e nenhuma requisição sai.
26. Ao salvar uma criação válida, a requisição ao backend leva `dataNascimento` no formato
    `yyyy/MM/dd` (`1990/01/31`, nunca `1990-01-31`, que o backend grava como `null`); enquanto
    pendente o `Dialog` fica em `loading` (rodapé, Fechar, Esc e scrim travados, então um
    segundo clique não envia outra requisição); com `201`, o dialog fecha, aparece o toast
    "Membro adicionado." e a tabela (página 1) e os `StatCard`s recarregam.
27. Ao abrir "Editar", o formulário mostra um estado de carregamento e depois vem preenchido
    com os dados atuais do membro, incluindo endereço, CPF, nascimento e gênero. Se a pessoa não
    existe mais (`204`), o modal fecha e a tabela recarrega.
28. Ao salvar uma edição, a requisição sempre leva `genero` e `endereco` completos (o
    `PATCH /core/pessoas/:id` responde 500 sem eles), com o mesmo `loading` de 26; com `200`, o
    dialog fecha, aparece o toast "Membro atualizado." e a tabela recarrega com os dados novos.
29. Se salvar falha (o backend responde 500 a qualquer erro de `/core/pessoas`, inclusive
    CPF ou e-mail duplicados), o dialog continua aberto, com os valores digitados preservados e
    os botões reabilitados; o toast vem da camada HTTP.

## Out of scope

- Busca por nome funcionando — `GET /admin/membros` não filtra por nome; o campo fica
  desabilitado (5) até o backend expor o filtro. Vai no pedido ao backend.
- Dados reais de Grupo de Crescimento e Data de ingresso — o backend não os devolve; as células
  mostram `a fazer` (10, 11). Vai no pedido ao backend.
- Excluir membro — não há endpoint; o dono decidiu inativar (21).
- Filtro "Bairro" (Figma 288-38990) — o dono adiou ("por enquanto não precisa").
- Coluna de checkbox / seleção em massa do Figma — não há ação em massa definida.
- Seções do drawer sem dado no backend (Relações Familiares, Grupo na Igreja com mentor e data
  de batismo, Ministérios) e o botão WhatsApp — ver Unresolved 5.
- Reativar um membro inativo — o backend não tem endpoint.
- Exportar a base — o botão sai da página; a rota `/api/membros/exportar` fica (Unresolved 8).
- Qualquer alteração no `ibfc-server` — outro repositório, outro autor (`junior`). Ao fim da
  implementação, sai uma mensagem com o que pedir ao backend.

## Observable

| Surface | Decision | Landing |
| --- | --- | --- |
| screen `/pessoas` | empty state | existing — `EmptyState` "Nenhum membro encontrado" |
| screen `/pessoas` | loading state | existing — `Table state="loading"` (skeleton) |
| screen `/pessoas` | error state | existing — toast da camada HTTP; a tabela fica vazia |
| screen `/pessoas` | unauthorised | existing — `verifySession()` em `page.tsx` e `proxy.ts` redireciona para `/login` |
| screen `/pessoas` | density and ordering | 7; ordem por nome — existing (`order: { nome: 'ASC' }` no backend) |
| screen `/pessoas` | destructive action confirms | n/a — inativar não é destrutivo por decisão do dono (21) |
| screen `/pessoas` abas | navigation and current tab | 2, 3, 4 |
| screen drawer do membro | empty / loading / error | n/a — mostra os dados da linha já carregada, sem requisição |
| screen drawer do membro | unauthorised | existing — herda a página |
| screen drawer do membro | density and ordering | 14; seções sem dado — Unresolved 5 |
| screen drawer do membro | destructive action confirms | n/a — o drawer não tem ação destrutiva |
| screen menu de ações | ordering | 18 |
| screen menu de ações | disabled item | 22 |
| screen modal de membro | empty (criação) | 24 |
| screen modal de membro | loading (edição) | 27 |
| screen modal de membro | error | 29 |
| screen modal de membro | descartar alterações ao fechar | Unresolved 9 |
| copy dos toasts de sucesso | text | 21, 26, 28 |

## Swept

- validation: 25
- failure modes: 23, 29
- idempotency and retry: 26, 28 — o `loading` do `Dialog` trava o rodapé enquanto a requisição está pendente; inativar repetido é idempotente no backend (`Pessoa.inativar()` só regrava `inativo`) e o item fica desabilitado depois (22)
- authorization: existing — `verifySession()` na página e `sessionFetch` no BFF; `/admin/*` exige `admin`. `/core/pessoas` não tem guard nenhum no backend — Unresolved 1
- concurrency and ordering: n/a — a busca fica desabilitada (5), então a única entrada concorrente continua sendo a troca de página, cujo comportamento não muda
- data lifecycle: 21 — inativar mantém o registro (status `inativo`); exclusão fora de escopo
- external-dependency failure: existing — backend fora do ar vira 502 com a mensagem genérica (`sessionFetch` → `unavailable`) e toast
- state transitions: 21, 22 (`ativo` → `inativo`); `inativo` → `ativo`: n/a — fora de escopo, sem endpoint
- observability: n/a — o backoffice não tem canal de telemetria; falhas aparecem como toast (existing)

## Impact

| Front | What changes |
|---|---|
| domain | "Inativar" no menu = `POST /admin/membros/:id/inativar`; "Situação" substitui "Status" na coluna; os valores `ativo`/`inativo` não mudam |
| route | `app/(painel)/pessoas/[id]/` (page + `PessoaPerfilPage` + spec) sai; quem depende hoje: `app/route-tree.spec.tsx:45`, `proxy.spec.ts:28` (`/pessoas/id-fake-001`), o invariant de `buildNavigation` em `lib/navigation.ts` (`/pessoas/{id}` → Membros) |
| BFF | `GET /api/membros/[id]` (varre todas as páginas de `/admin/membros`) passa a ler `/core/pessoas/:id` para a edição; ganha `PATCH`; `/api/membros` ganha `POST`; nova `POST /api/membros/[id]/inativar` |
| `@church/ui` | `Paginator`/`Section`: o paginador passa a ocupar a largura do rodapé — muda todo `Section footerType="paginator"` e suas stories |
| `@church/ui` | `MenuDropdown`: o menu passa a flutuar fora do fluxo (Decided 3) — muda também o menu de perfil do `SideMenu` |
| `@church/ui` | `Drawer` `mode="modal"` ganha animação de entrada pela direita — muda todo consumidor modal |
| `@church/ui` | `Cell`/`Table`: ação de célula pode abrir menu (Decided 2) |
| `@church/ui` | novo componente `Tabs`, com o visual extraído do `Chip` (Decided 1) |
| stored data | nada neste repositório; criar/editar/inativar gravam `Pessoa` no backend |

## Decided

| Decision | Shape | Alternative rejected |
|---|---|---|
| 1. `Tabs` como componente do DS, navegação por URL, visual do `Chip` | `@church/ui/molecules/Tabs`: `<Tabs label="…" items={[{ label, href, current }]} />` → `<nav aria-label> <a href aria-current="page">` via `next/link` (como `NavItem`); as classes do `Chip` saem para um `tv` exportado e servem ao `Chip` e à aba; story com `parameters.design` → Figma 141-4446 | Reusar o `<Chip>` (`<button aria-pressed>`) como aba: um botão de alternância não navega nem é anunciado como página atual. `role="tablist"`/`tabpanel`: o padrão ARIA de abas é para painéis na mesma página, não para trocar de URL |
| 2. Ação de célula que abre menu | `CellAction` ganha `menu?: MenuItemProps[]`; com `menu`, o `IconButton` vira o `trigger` do `MenuDropdown` e `onClick` deixa de ser exigido | Nova célula `type: 'custom'` com `ReactNode` livre: abre a tabela para qualquer conteúdo e perde a restrição Lamb das células |
| 3. `MenuDropdown` flutuante fora de `overflow` | o menu renderiza num portal em `document.body`, `position: fixed`, posicionado pelo `getBoundingClientRect()` do trigger e reposicionado em scroll/resize; primeiro portal do DS | `absolute` dentro da âncora (hoje): o `overflow-x-auto` da tabela corta o menu nas últimas linhas. CSS anchor positioning: suporte incompleto entre navegadores (não verificado para Firefox) |
| 4. Primeiro formulário em modal do backoffice | `react-hook-form` + `zod` (`@hookform/resolvers`, já em `apps/backoffice/package.json`), um componente de formulário compartilhado por criar e editar; o `Dialog` do DS com `footer` próprio | Biblioteca de modal nova (Radix Dialog etc.): o DS já tem `Dialog` e `Drawer` com focus trap, Esc, scrim, `loading` e restauração de foco (`useModalLayer`) — decisão do dono |
| 5. Contrato provisório com `/core/pessoas` | o BFF chama `/core/pessoas` só no servidor, via `sessionFetch`, e mapeia a entidade crua (`_id`, `_nome`, `_endereco: { _rua, … }`, datas `{ _valor }`) para um tipo do app sem `_`; o navegador nunca vê o formato cru. Provisório por decisão do dono ("mais tarde adequamos a uma estrutura mais profissional") | Esperar endpoints `admin` no backend: o dono quer testar adição e edição agora. Chamar `/core/pessoas` do navegador: endpoint público com CPF e endereço, e o formato `_` vazaria para os componentes |

## Sources

- Mensagens do dono, 2026-10-19 (chat, sem endereço) — os dez pontos e as decisões. Literal:
  "os botões 'Adicionar pessoa' e 'Exportar base' não deveriam existir"; "O componente 'Tab' …
  deve existir e servir como navegação (assim como o componente navigation)"; "deve ser: Membro,
  Contato, Grupo de Crescimento, Data de ingresso, SItuação (Ativo/Inativo) Ações"; "Situação:
  Deve ter um componente Badge neutro"; "Ações: … olhinho e … 3 pontinhos, ambos … IconButton";
  "não precisamos da pagina dinâmica stub pessoas[id] visto que o que vai abrir é uma drawer";
  "Os dialogs … devem seguir o padrão de espaçamento, cores e estilização geral que já temos".
  Decisões da segunda mensagem: "Sobre a busca por nome, então deixe o botão desabilitado";
  "Coloque as colunas mesmo assim e deixe um 'a fazer' nos campos das colunas"; "Criar e editar
  membro, vamos fazer algo a respeito de imediato, mais tarde adequamos a uma estrutura mais
  profissional"; "em vez de 'Remover' vai ser 'Inativar', neste caso não precisa ser destrutivo
  nem com dialog de 'tem certeza?'"; "Modais: … vamos usar o do design System"; "se já tivermos
  o componente Tab, abstraia ele para essa nova utilização"; "Vamos atuar só no front … no fim
  desta implementação, escreva uma mensagem com o que deve ser pedido para o backend".
- Figma Backoffice `HQ5Vfbwug9vzIskrlSIXJW` — **binding para a interface**: tela 141-4445,
  header/abas 141-4446, busca 149-3908, "Adicionar membro" 149-3996, cabeçalho da tabela
  154-17874, células 282-38969 / 162-7854…7858, paginador 162-10794, drawer 289-39940. O modal
  de membro e o menu de ações não têm nó: seguem `Dialog` e `MenuDropdown` do DS.
- `docs/backend/ibfc-server.md` — contrato: §7 `GET /admin/membros` (campos e filtros), §7
  `POST /admin/membros/:id/inativar`, §8 `/core/pessoas` (campos, `yyyy/MM/dd`, PATCH exige
  `genero` e `endereco`, 500 para qualquer erro), §10 risco 2.
- `ibfc-server` @ `b76a8ea` (`~/Documents/personal/ibfc-server`) —
  `src/gestao/application/queries/ListarMembros.query.ts` confirma que `MembroItem` não tem GC,
  data de ingresso nem foto, e que não há filtro por nome; `MembrosAdmin.controller.ts`
  confirma que não há `DELETE`; `Pessoa.inativar()` só regrava `status`.

This task is the record of decision. If a linked document diverges, ask before building.

## Unresolved

| # | Kind | Question | Until answered |
|---|---|---|---|
| 1 | blocks go-live | `/core/pessoas` é público e expõe CPF, nascimento e endereço de membros da igreja (dado sensível, LGPD art. 5º, II — doc §10 risco 2); precisa de guard no backend e validação de Segurança da Informação/DPO antes de usuários reais. | o cadastro funciona localmente para teste, mas não vai para usuários reais |
| 2 | open | O card do Figma não tem o título "Membros" nem os chips Ativo/Inativo. | Padrão: os chips saem; o `Section` ganha `titleHidden` (como `captionHidden` da `Table`), e "Membros" fica só como nome acessível |
| 3 | open | O header do Figma tem descrição ("Loren ipsum…") e o bloco do usuário (avatar, nome, ⋯) à direita. | Padrão: nenhum dos dois — a descrição é placeholder e o usuário já está no rodapé do SideMenu |
| 4 | open | Rótulo da aba: o Figma diz "Grupos de Crescimento", o SideMenu diz "GCs". | Padrão: abas como no Figma, SideMenu inalterado |
| 5 | open | Drawer: seções sem dado no backend (Relações Familiares, Grupo na Igreja, Ministérios), o botão WhatsApp e o ⋯ do cabeçalho. Endereço completo só vem de `/core/pessoas/:id`. | Padrão: seções, WhatsApp e ⋯ omitidos; "Endereço" mostra o `bairro` da linha |
| 6 | open | A segunda linha da célula Membro no Figma ("LAF") — o que é? | Padrão: omitida |
| 7 | open | `StatCard`s do Figma são Total/Homens/Mulheres; `/admin/membros` não filtra por gênero. | Padrão: Total/Ativos/Inativos, como hoje |
| 8 | open | Sem o botão "Exportar base", `/api/membros/exportar` e `membrosService.exportar` ficam sem chamador. | Padrão: ficam, para quando o design posicionar a exportação |
| 9 | open | Fechar o modal com o formulário alterado pede confirmação? | Padrão: fecha e descarta, sem confirmação |
| 10 | open | Formato do telefone. | Padrão: 11 dígitos → `(11) 9 0000-0000`, como no Figma; outros, como vieram (9) |
| 11 | open | "Inativar" num membro já inativo. | Padrão: item desabilitado (22) |
| 12 | open | Ícone de "Inativar". | Padrão: `person_off` |
