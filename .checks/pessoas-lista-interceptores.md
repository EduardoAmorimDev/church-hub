# Tela de Pessoas — listagem, auth mínima e interceptores HTTP

Sources:

- `.tasks/pessoas-lista-interceptores.md` — critérios, decisões e escopo
- Design [node-id=131-4185](https://www.figma.com/design/HQ5Vfbwug9vzIskrlSIXJW/Backoffice?node-id=131-4185&p=f&m=dev) — **binding para a interface**: tela `/login`, tela `/pessoas` (PageHeader, chips de status, tabela, Paginator, botão Exportar base), shell `/pessoas/:id`
- `docs/backend/ibfc-server.md` — contratos de todos os endpoints usados; vence o Swagger
- `apps/backoffice/app/layout.tsx` — `ToastContainer` já importado; não duplicar

## Out of scope

- Conteúdo da página de perfil (`/pessoas/:id`) — sem endpoint auth'd com dados completos
- Fluxo "Adicionar pessoa" — botão desabilitado nesta task
- Ação "Inativar membro" por linha
- Recuperação de senha, ativação de conta
- Campo de busca por nome — backend sem suporte ao filtro `nome`
- Estrutura de homologação e produção além de `NEXT_PUBLIC_API_URL`

## Landing

Esta task cria as fundações do backoffice: o HTTP client, a camada de sessão e as BFF routes.
Quatro módulos novos existem apenas em `apps/backoffice`: `~/lib/http.ts` (fetch wrapper),
`~/stores/session.ts` (zustand), `~/types/membros.ts` (domain type), BFF routes em `app/api/`.
Nenhum código novo toca `packages/ui`.

| One-way door                                                                                                                            | Literal shape                                                                                                                                                   | Alternative rejected                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTP client como fetch wrapper `~/lib/http.ts`                                                                                          | `apiFetch(url, options)` que injeta `Authorization`, desembrulha `{ data }`, trata 204 e aciona o interceptor de erros                                          | axios — não está nas dependências adotadas (Princípio IV)                                                                                    |
| Sessão: accessToken em memória (zustand), refreshToken em cookie httpOnly via BFF                                                       | `useSessionStore` com `{ accessToken, setSession, clearSession }`                                                                                               | accessToken em localStorage — vulnerável a XSS; em cookie — conflita com `httpOnly` necessário para o refreshToken                           |
| BFF routes para todos os calls que precisam de headers ou cookies server-side                                                           | `app/api/auth/login/route.ts`, `app/api/auth/refresh/route.ts`, `app/api/auth/logout/route.ts`, `app/api/membros/route.ts`, `app/api/membros/exportar/route.ts` | Chamar o backend direto do browser — inviável por CORS (pagination-total não exposto) e por não suportar httpOnly cookie para o refreshToken |
| Toast contract: 4xx `{ error, message }` → `toast.error(message)`, 500 → genérico, 403 guard → "Sem permissão", 204 → `null` silencioso | via `react-toastify`; `ToastContainer` já em `app/layout.tsx`                                                                                                   | Toast por componente — quebraria consistência entre telas futuras                                                                            |

- Nothing else in this change is hard to reverse

## Checks

### Slice A — Auth mínima e sessão via BFF · 6 files · ~40 KB · ~10k

**C1** - Login com credenciais válidas: BFF persiste refreshToken em cookie httpOnly e retorna accessToken; cliente armazena no zustand e redireciona para `/`
Proof: `npm test -w web -- apps/backoffice/app/api/auth/login/route.spec.ts`

**C2** - Login com credenciais inválidas: BFF retorna 401 sem expor refreshToken; tela exibe campo de senha com estado de erro e mensagem do backend
Proof: `npm test -w web -- apps/backoffice/app/api/auth/login/route.spec.ts`

**C3** - 401 interceptado: interceptor chama refresh uma única vez (promessa serializada); se refresh OK, request original é refeito com novo token
Proof: `npm test -w web -- apps/backoffice/lib/http.spec.ts`

**C4** - Refresh falha (401/403): interceptor limpa zustand, chama logout BFF e redireciona para `/login`
Proof: `npm test -w web -- apps/backoffice/lib/http.spec.ts`

**C5** - Logout: `POST /api/auth/logout` repassa ao backend com refreshToken do cookie, depois apaga o cookie e limpa zustand
Proof: `npm test -w web -- apps/backoffice/app/api/auth/logout/route.spec.ts`

### Slice B — HTTP client e interceptores de toast · 1 file · ~8 KB · ~2k

**C6** - 4xx com `{ error, message }` (exceto 401): interceptor chama `toast.error(message)` sem transformação
Proof: `npm test -w web -- apps/backoffice/lib/http.spec.ts`

**C7** - 500: interceptor chama `toast.error("Algo deu errado. Tente novamente em instantes.")`
Proof: `npm test -w web -- apps/backoffice/lib/http.spec.ts`

**C8** - 403 guard `{ statusCode: 403 }`: interceptor chama `toast.error("Sem permissão para realizar esta ação.")` e não faz logout
Proof: `npm test -w web -- apps/backoffice/lib/http.spec.ts`

**C9** - 204: HTTP client resolve com `null` sem toast
Proof: `npm test -w web -- apps/backoffice/lib/http.spec.ts`

**C10** - `{}` (sucesso sem dados): HTTP client resolve com `{}` sem toast
Proof: `npm test -w web -- apps/backoffice/lib/http.spec.ts`

### Slice C — BFF route `/api/membros` · 1 file · ~6 KB · ~1.5k

**C11** - `GET /api/membros` aceita `status`, `bairro`, `idGc`, `page`, `limit`; lê `pagination-total` e `pagination-page` server-side e devolve `{ data: MembroItem[], total: number, page: number }`
Proof: `npm test -w web -- apps/backoffice/app/api/membros/route.spec.ts`

**C12** - `GET /api/membros` com backend retornando 401/403: repassa o status e o corpo ao cliente sem transformação
Proof: `npm test -w web -- apps/backoffice/app/api/membros/route.spec.ts`

### Slice D — Tela de listagem `/pessoas` · 3 files · ~25 KB · ~6k

**C13** - Tela `/pessoas` exibe PageHeader com título "Gestão de pessoas", botão "Adicionar pessoa" (desabilitado) e botão "Exportar base"
Proof: `npm test -w web -- apps/backoffice/app/pessoas/PessoasPage.spec.tsx`

**C13a** - 3 StatCards em paralelo: "Total de membros", "Ativos" (?status=ativo), "Inativos" (?status=inativo); exibem `—` enquanto carregam
Proof: `npm test -w web -- apps/backoffice/app/pessoas/PessoasPage.spec.tsx`

**C14** - Tabela exibe skeleton durante carregamento; quando carregada, exibe `nome`, `telefone`, `bairro`, `status` (Tag), `origemCadastro`
Proof: `npm test -w web -- apps/backoffice/app/pessoas/PessoasPage.spec.tsx`

**C15** - Lista vazia (`total = 0`): EmptyState com mensagem "Nenhum membro encontrado"
Proof: `npm test -w web -- apps/backoffice/app/pessoas/PessoasPage.spec.tsx`

**C16** - Paginator usa campo `total` do JSON de `GET /api/membros`; mudar página ou pageSize chama o endpoint com novos params
Proof: `npm test -w web -- apps/backoffice/app/pessoas/PessoasPage.spec.tsx`

**C17** - Chip "Ativo" ou "Inativo" selecionado: chama `GET /api/membros?status=ativo/inativo`; desmarcado: chama sem `status`
Proof: `npm test -w web -- apps/backoffice/app/pessoas/PessoasPage.spec.tsx`

**C18** - "Exportar base": `GET /api/membros/exportar` via BFF → download `membros.csv`; se CSV começa com `"erro\n"`, exibe `toast.error`
Proof: `npm test -w web -- apps/backoffice/app/pessoas/PessoasPage.spec.tsx`

**C19** - Clicar em linha da tabela navega para `/pessoas/:id`
Proof: `npm test -w web -- apps/backoffice/app/pessoas/PessoasPage.spec.tsx`

### Slice E — Shell da rota de perfil · 1 file · ~2 KB · ~0.5k

**C20** - `GET /pessoas/:id` renderiza página com título "Perfil do membro" e o `id` visível; sem chamada de API
Proof: `npm test -w web -- apps/backoffice/app/pessoas/\[id\]/PessoaPerfilPage.spec.tsx`

## Handoff

S1+S2 (Slices A–B) = ~50k → build primeiro batch
S3+S4+S5 (Slices C–E) = ~30k → build segundo batch se necessário

Este checklist é pequeno o suficiente para caber em um único agente. Toda a implementação
ocorre no mesmo contexto; sem handoff de batch.

## Swept

- validation: C2 — credencial inválida; campos required no form de login
- failure modes: C6, C7 — 4xx mostra `message`, 500 mostra genérico; C18 — CSV com `erro\n`
- idempotency and retry: C3 — refresh serializado (uma promessa em voo)
- authorization: C1, C3, C4 — JWT injetado pelo interceptor; refresh via BFF httpOnly cookie
- concurrency and ordering: C3 — múltiplos 401 concorrentes aguardam o mesmo refresh
- data lifecycle: n/a — accessToken apenas em memória zustand; refreshToken em cookie httpOnly
- external-dependency failure: C7 — 500 ou erro de rede → toast genérico
- state transitions: C3, C4 — token válido → 401 → refresh → novo token ou logout
- observability: n/a — produto local; sem logging estruturado nesta task

## Coverage

| Set (size)                | Member → proof                                                     | Unproven |
| ------------------------- | ------------------------------------------------------------------ | -------- |
| BFF auth routes (3)       | login C1,C2 · refresh C3,C4 · logout C5                            | -        |
| toast triggers (5)        | 4xx+message C6 · 500 C7 · 403-guard C8 · 204 C9 · `{}` C10         | -        |
| BFF membros responses (2) | 200 C11 · 401/403 passthrough C12                                  | -        |
| StatCard data calls (3)   | total C13a · ativos C13a · inativos C13a                           | -        |
| table states (3)          | loading C14 · empty C15 · populated C14                            | -        |
| status filter (3)         | ativo C17 · inativo C17 · sem filtro C17                           | -        |
| export CSV outcomes (2)   | download C18 · erro\n C18                                          | -        |
| startup assemblies (2)    | app entry `app/layout.tsx` (existing) · test mocks in specs C1–C20 | -        |

- Claims naming a status code, route ou response shape: C1, C2, C5, C11, C12 — cada um tem prova que cruza o boundary da BFF route
- No other check claims more than the single case its proof exercises
