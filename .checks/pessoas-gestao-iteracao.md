# Gestão de pessoas — alinhamento ao Figma, drawer, menu de ações e cadastro

Sources:

- `.tasks/pessoas-gestao-iteracao.md` — critérios 1–29, escopo, Decided 1–5, Unresolved com os padrões assumidos
- Figma Backoffice `HQ5Vfbwug9vzIskrlSIXJW` — **binding para a interface**: tela 141-4445, header/abas 141-4446, busca 149-3908, "Adicionar membro" 149-3996, cabeçalho 154-17874, células 282-38969 / 162-7854…7858, paginador 162-10794, drawer 289-39940
- `docs/backend/ibfc-server.md` — §7 `/admin/membros` e `/inativar`, §8 `/core/pessoas` (formato `_`, `yyyy/MM/dd`, PATCH exige `genero` e `endereco`)
- Conversa de 2026-10-19 — busca desabilitada, colunas com `a fazer`, "Inativar" sem confirmação, só frontend, mensagem ao backend no fim

Profile: `light` (o repositório não declara `## tlc-implement`). Handoff: `on`, um lote só (ver `## Handoff`).

## Out of scope

- Busca por nome funcionando, dados reais de GC e Data de ingresso, exclusão — o backend não tem; vão na mensagem ao backend
- Filtro "Bairro", coluna de seleção, seções do drawer sem dado, WhatsApp, reativação, exportar — `.tasks` Out of scope
- Qualquer mudança no `ibfc-server`
- Commits — o dono commita emendando o topo de `main` (memória `feedback-work-on-main`); o trabalho fica no working tree

## Landing

Toca `packages/ui` (Tabs novo; PageHeader, Section, Paginator, Chip, Cell, MenuDropdown, Drawer)
e `apps/backoffice` (página `/pessoas`, BFF `/api/membros*`, `services/membros`, tipos). Reusa
`Dialog`, `Drawer`, `TextField`, `Select`, `DateField` com `react-hook-form` + `zod`, `apiFetch`
e `sessionFetch`/`relayError`.

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| `Tabs` no DS com o visual do `Chip` | `@church/ui/molecules/Tabs`: `<Tabs label items={[{ label, href, current }]} />` → `<nav aria-label><a href aria-current="page">` via `next/link`; o `tv` do `Chip` passa a ser exportado como `chip` e serve às duas | `<Chip>` como aba: é `<button aria-pressed>`, não navega nem marca a página atual; `role="tablist"`: padrão ARIA para painéis na mesma página |
| `PageHeader` ganha o slot `tabs` | `tabs?: ReactNode`, renderizado abaixo da linha do título (Figma: as abas fazem parte do Header 141-4446) | abas fora do `PageHeader` num wrapper próprio: repetiria o padding lateral `px-5`/`px-8` do header em outro lugar |
| `Section` ganha `titleHidden` | `titleHidden?: boolean` — o título vira `sr-only` (continua nomeando a `<section>`) e a linha do topo some quando não há `actions` nem `description` | tirar `title` do `Section`: ele é o nome acessível obrigatório da região |
| `CellAction` pode abrir menu | `CellAction = { 'aria-label'; disabled?; icon } & ({ onClick } \| { menu: MenuItemProps[] })`; com `menu`, o `IconButton` é o `trigger` de um `MenuDropdown` `align="end"`. `Cell` (átomo) importa `@church/ui/molecules/MenuDropdown` | nova célula `type: 'custom'` com `ReactNode` livre: abre a tabela para qualquer conteúdo; duplicar a renderização das ações no `TableCell`: duas fontes para o mesmo botão |
| `MenuDropdown` ganha `strategy="fixed"`, opt-in, **sem portal** | `strategy?: 'absolute' \| 'fixed'` (padrão `absolute`, comportamento atual inalterado); com `fixed`, o menu continua no DOM da âncora, com `position: fixed` e `top`/`bottom`/`left`/`right` calculados do `getBoundingClientRect()` do trigger, recalculados em `scroll` (captura) e `resize`. O `Cell` usa `fixed`. Diverge de `.tasks` Decided 3 (portal, para todos) | portal em `document.body` (o que o `.tasks` dizia): tira o menu de dentro de `Dialog`/`Drawer`/`MenuDrawer`, cujo `useModalLayer` prende o foco no painel; trocar o padrão para todos: muda o menu de perfil do `SideMenu` sem necessidade. `fixed` já escapa do `overflow-x-auto` da tabela |
| Animação de entrada do `Drawer` modal | keyframe `drawer-in` em `packages/ui/src/styles.css` (`translate: 100% 0` → `0`), `--animate-drawer-in: drawer-in 250ms ease-out`, classe `motion-safe:animate-drawer-in` no painel modal — o mesmo padrão do `sheet-in` do `BottomSheet` | `motion` (JS) no painel: o DS já resolve entrada de overlay com keyframe CSS e `motion-safe:` |
| BFF provisório sobre `/core/pessoas` | `POST /api/membros` → `POST /core/pessoas`; `GET /api/membros/[id]` → `GET /core/pessoas/:id` mapeado de `_campo` para `PessoaDetalhe` sem `_`; `PATCH /api/membros/[id]` → `PATCH /core/pessoas/:id`; `POST /api/membros/[id]/inativar` → `POST /admin/membros/:id/inativar`. Todas via `sessionFetch`; o navegador nunca vê o formato cru. `dataNascimento` sai `yyyy/MM/dd` do mapeador de serviço | chamar `/core/pessoas` do navegador: endpoint público com CPF/endereço e o formato `_` vazaria |

- Nothing else in this change is hard to reverse

## Checks

### S1 — Cabeçalho e abas · ~14 files · ~40 KB · ~10k

**C1** - `/pessoas` mostra `<h1>` "Gestão de pessoas" pelo `PageHeader` direto no `main` (sem wrapper `p-6`) e não mostra "Adicionar pessoa" nem "Exportar base"
Proof: `npm test -w web -- "pessoas/page.spec.tsx" -t "C1"`

**C2** - As abas são quatro links, nesta ordem: Membros `/pessoas`, Visitantes `/pessoas?aba=visitantes`, Grupos de Crescimento `/pessoas?aba=gcs`, Ministérios `/pessoas?aba=ministerios`, dentro de `nav` "Seções de pessoas"
Proof: `npm test -w web -- "pessoas/page.spec.tsx" -t "C2"`
Proof: `npm test -w @church/ui -- src/components/molecules/Tabs/Tabs.spec.tsx -t "C2"`

**C3** - A aba da `aba` atual tem `aria-current="page"`; sem `aba` ou com `aba` desconhecida, Membros é a atual
Proof: `npm test -w web -- lib/navigation.spec.ts -t "C3"`
Proof: `npm test -w @church/ui -- src/components/molecules/Tabs/Tabs.spec.tsx -t "C3"`

**C4** - Em `?aba=visitantes`, título e abas continuam e o `EmConstrucao` aparece abaixo deles
Proof: `npm test -w web -- "pessoas/page.spec.tsx" -t "C4"`

**C4a** - `PageHeader` renderiza o slot `tabs` abaixo do título
Proof: `npm test -w @church/ui -- src/components/organisms/PageHeader/PageHeader.spec.tsx -t "tabs"`

### S2 — Barra da tabela · ~6 files · ~25 KB · ~6k

**C5** - O card mostra o `SearchField` "Buscar membro" desabilitado e o botão "Adicionar membro" com ícone `add`; não há botão "Bairro", nem chips Ativo/Inativo, e o título "Membros" fica só como nome acessível
Proof: `npm test -w web -- "pessoas/PessoasPage.spec.tsx" -t "C5"`
Proof: `npm test -w @church/ui -- src/components/organisms/Section/Section.spec.tsx -t "titleHidden"`

### S3 — Paginador · 3 files · ~22 KB · ~5k

**C6** - O `<nav>` do `Paginator` ocupa a largura do contêiner (`w-full`), então "Linhas" + contador ficam à esquerda e a navegação à direita (`justify-between`)
Proof: `npm test -w @church/ui -- src/components/molecules/Paginator/Paginator.spec.tsx -t "spans its container"`

### S4 — Colunas e células · ~8 files · ~45 KB · ~11k

**C7** - Cabeçalhos, nesta ordem: Membro, Contato, Grupo de Crescimento, Data de ingresso, Situação, Ações
Proof: `npm test -w web -- "pessoas/PessoasPage.spec.tsx" -t "C7"`

**C8** - Célula Membro: avatar com iniciais (`Pessoa Exemplo` → `PE`) e o nome
Proof: `npm test -w web -- "pessoas/PessoasPage.spec.tsx" -t "C8"`

**C9** - Célula Contato: e-mail e telefone embaixo; `email: null` mostra só o telefone; `11900000000` → `(11) 9 0000-0000`; outro comprimento como veio
Proof: `npm test -w web -- "pessoas/PessoasPage.spec.tsx" -t "C9"`
Proof: `npm test -w web -- lib/format.spec.ts -t "formatTelefone"`

**C10** - Célula Grupo de Crescimento mostra `a fazer` em toda linha
Proof: `npm test -w web -- "pessoas/PessoasPage.spec.tsx" -t "C10"`

**C11** - Célula Data de ingresso mostra `a fazer` em toda linha
Proof: `npm test -w web -- "pessoas/PessoasPage.spec.tsx" -t "C11"`

**C12** - Célula Situação: `Badge` neutro "Ativo" / "Inativo", com a mesma classe nos dois
Proof: `npm test -w web -- "pessoas/PessoasPage.spec.tsx" -t "C12"`

**C13** - Célula Ações: `IconButton` "Ver membro" e "Mais ações"; não há "Ver perfil"
Proof: `npm test -w web -- "pessoas/PessoasPage.spec.tsx" -t "C13"`

### S5 — Drawer do membro · ~6 files · ~25 KB · ~6k

**C14** - "Ver membro" abre um `dialog` com o nome, a situação, "Editar" e "Informações de Contato" com Telefone, E-mail e Endereço (bairro) da linha
Proof: `npm test -w web -- "pessoas/PessoasPage.spec.tsx" -t "C14"`

**C14a** - O painel modal do `Drawer` entra pela direita: classe `motion-safe:animate-drawer-in`, e `drawer-in` parte de `translate: 100% 0`; o modo `inline` não anima
Proof: `npm test -w @church/ui -- src/components/organisms/Drawer/Drawer.spec.tsx -t "C14a"`
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "drawer C14a"`

**C15** - "Editar" no drawer fecha o drawer e abre o modal "Editar membro"
Proof: `npm test -w web -- "pessoas/PessoasPage.spec.tsx" -t "C15"`

**C16** - Esc fecha o drawer e devolve o foco a "Ver membro"
Proof: `npm test -w web -- "pessoas/PessoasPage.spec.tsx" -t "C16"`

**C17** - A rota `pessoas/[id]` não existe
Proof: `npm test -w web -- app/route-tree.spec.tsx -t "C17"`

### S6 — Menu de ações e inativação · ~10 files · ~45 KB · ~11k

**C18** - "Mais ações" abre `menu` com "Editar" e "Inativar", ambos neutros
Proof: `npm test -w web -- "pessoas/PessoasPage.spec.tsx" -t "C18"`
Proof: `npm test -w @church/ui -- src/components/atoms/Cell/Cell.spec.tsx -t "menu"`

**C18a** - Com `strategy="fixed"`, o menu do `MenuDropdown` é `fixed`, posicionado pelo retângulo do trigger (`top` = `bottom` + 4; `align="end"` → `right` = largura da janela − `right` do trigger), e um clique num item ainda dispara `onSelect`
Proof: `npm test -w @church/ui -- src/components/molecules/MenuDropdown/MenuDropdown.spec.tsx -t "C18a"`

**C19** - Esc fecha o menu e devolve o foco ao trigger
Proof: `npm test -w @church/ui -- src/components/molecules/MenuDropdown/MenuDropdown.spec.tsx -t "dismissal"`
Proof: `npm test -w @church/ui -- src/components/atoms/Cell/Cell.spec.tsx -t "C19"`

**C20** - "Editar" no menu abre o modal "Editar membro" daquele membro
Proof: `npm test -w web -- "pessoas/PessoasPage.spec.tsx" -t "C20"`

**C21** - "Inativar" num membro ativo chama `POST /api/membros/{id}/inativar` sem diálogo; com sucesso, toast "Membro inativado." e a lista e os três totais recarregam
Proof: `npm test -w web -- "pessoas/PessoasPage.spec.tsx" -t "C21"`
Proof: `npm test -w web -- "membros/\[id\]/inativar/route.spec.ts" -t "C21"`

**C22** - "Inativar" num membro inativo está desabilitado
Proof: `npm test -w web -- "pessoas/PessoasPage.spec.tsx" -t "C22"`

**C23** - Falha ao inativar: sem toast de sucesso e a lista não recarrega; `204`: a lista recarrega
Proof: `npm test -w web -- "pessoas/PessoasPage.spec.tsx" -t "C23"`

### S7 — Modal de membro · ~10 files · ~50 KB · ~12k

**C24** - "Adicionar membro" abre o `Dialog` "Adicionar membro" com os campos do contrato (Nome, CPF, Data de nascimento, Gênero, E-mail, Telefone, CEP, Rua, Número, Complemento, Bairro, Cidade, Estado, País, Profissão, Escolaridade, Estado civil) e "Cancelar"/"Salvar"
Proof: `npm test -w web -- "pessoas/MembroFormDialog.spec.tsx" -t "C24"`
Proof: `npm test -w web -- "pessoas/PessoasPage.spec.tsx" -t "C24"`

**C25** - Salvar com obrigatórios vazios ou e-mail sem `@` mostra erro inline em cada campo e não chama o serviço
Proof: `npm test -w web -- "pessoas/MembroFormDialog.spec.tsx" -t "C25"`

**C26** - Criação válida envia `dataNascimento` `yyyy/MM/dd` ao backend, trava o dialog enquanto pendente, fecha com toast "Membro adicionado." e chama `onSaved`
Proof: `npm test -w web -- "pessoas/MembroFormDialog.spec.tsx" -t "C26"`
Proof: `npm test -w web -- services/membros.spec.ts -t "C26"`
Proof: `npm test -w web -- app/api/membros/route.spec.ts -t "C26"`

**C27** - Editar mostra carregamento e depois os campos preenchidos (endereço, CPF, nascimento, gênero) a partir de `GET /api/membros/{id}` mapeado do formato `_`; `204` fecha o modal e chama `onSaved`
Proof: `npm test -w web -- "pessoas/MembroFormDialog.spec.tsx" -t "C27"`
Proof: `npm test -w web -- "membros/\[id\]/route.spec.ts" -t "C27"`

**C28** - Salvar edição envia `PATCH` com `genero` e `endereco` completos, fecha com toast "Membro atualizado." e chama `onSaved`
Proof: `npm test -w web -- "pessoas/MembroFormDialog.spec.tsx" -t "C28"`
Proof: `npm test -w web -- "membros/\[id\]/route.spec.ts" -t "C28"`

**C29** - Falha ao salvar: o dialog continua aberto, valores preservados, botões reabilitados, sem toast de sucesso
Proof: `npm test -w web -- "pessoas/MembroFormDialog.spec.tsx" -t "C29"`

## Swept

- validation: C25
- failure modes: C23, C29
- idempotency and retry: C26 (`loading` trava o rodapé); inativar repetido é idempotente no backend e o item fica desabilitado (C22)
- authorization: existing — `verifySession()` em `pessoas/page.tsx`, `sessionFetch` em toda rota BFF nova; `/core/pessoas` sem guard no backend — `.tasks` Unresolved 1 (blocks go-live)
- concurrency and ordering: n/a — busca desabilitada (C5); a troca de página não muda
- data lifecycle: C21 — inativar mantém o registro
- external-dependency failure: existing — `sessionFetch` devolve 502 com mensagem genérica; toast pela camada HTTP
- state transitions: C21, C22
- observability: n/a — sem canal de telemetria no backoffice

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| abas (4) | Membros · Visitantes · Grupos de Crescimento · Ministérios — C2 (tabela) | - |
| `aba` atual (3 casos) | ausente · conhecida · desconhecida — C3 | - |
| colunas (6) | Membro C8 · Contato C9 · GC C10 · Data de ingresso C11 · Situação C12 · Ações C13; ordem C7 | - |
| `status` (2) | `ativo` · `inativo` — C12, C22 | - |
| itens do menu (2) | Editar C20 · Inativar C21 | - |
| resposta de inativar (3) | `200` C21 · erro C23 · `204` C23 | - |
| campos obrigatórios do formulário (13) | C25, iterando sobre os 13 | - |
| modos do modal (2) | criar C26 · editar C27, C28 | - |
| rotas BFF novas/alteradas (4) | `POST /api/membros` C26 · `GET /api/membros/[id]` C27 · `PATCH /api/membros/[id]` C28 · `POST /api/membros/[id]/inativar` C21 | - |

- Claims naming a status code, route or response shape: C17, C21, C23, C26, C27, C28 — cada um tem prova na rota BFF ou na árvore de rotas
- Visual (espaçamento, cor, peso) fora do alcance do profile `light`

## Handoff

Todas as fatias somam ~60k tokens de leitura, abaixo de 150k: um lote só, sem handoff. O
Verifier roda sobre o working tree contra `9056779` (nada é commitado).
