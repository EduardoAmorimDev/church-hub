# Backoffice — sessão no servidor (iron-session) e camada HTTP padronizada

Profile: light (o `AGENTS.md` não declara perfil) · handoff: on, um só lote (veja `Handoff`)

Sources:

- `.tasks/backoffice-sessao-iron-session.md` - a task: critérios 1–28, `Decided`, `Out of scope`, `Unresolved` 1–2
- `docs/backend/ibfc-server.md` §4 e §11 - envelope `{ data }`, 204, rotação e reuso do refresh
- [Next.js — Authentication](https://nextjs.org/docs/app/guides/authentication) - Server Actions, `proxy.ts`, DAL
- `node_modules/iron-session/dist/index.d.ts` (v9.0.1) - `getIronSession`, `nextProxyCookies`, `updateConfig`, regra `maxAge` × `ttl`
- Nenhuma fonte de design é binding: a task não muda nenhuma tela desenhada

## Out of scope

- Botão "Sair", loader global, opção de desligar toast, páginas buscando dados no servidor, trava em Redis, `GET /admin/membros/:id` - os motivos estão no `Out of scope` da task
- Janela de tolerância de reuso no `ibfc-server` - outro repositório (Unresolved 2 da task)

## Landing

Toca `apps/backoffice`: `lib/server/` novo (sessão e chamada ao backend, só no servidor), `app/actions/auth.ts`,
`proxy.ts`, as três route handlers de `/api/membros*`, `lib/http.ts`, `services/membros.ts`, as páginas
de login e pessoas, e `jest.config.mjs`. Reaproveita `readBackendSession` (vai para `lib/server/backend.ts`),
o `navigate` de `lib/navigate.ts` e o `ToastContainer` do layout. Remove `app/api/auth/**`,
`lib/auth-cookies.ts`, `lib/backend-session.ts` e `stores/session.ts`.

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| Dependências | `iron-session@^9.0.1` e `server-only` em `apps/backoffice/package.json`; `zustand` removido | (task `Decided`) next-auth, jose, cookies simples |
| Cookie | `church_session`, `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` em produção; com `lembrar`: `Max-Age=2592000` e seal `ttl` 2592000; sem `lembrar`: sem `Max-Age` | (task `Decided`) cookies em `Path=/api/auth` |
| Seal sem expiração no cookie de sessão | sem `lembrar`, o iron-session força `ttl = 0` quando `maxAge` é `undefined` (`index.js:227`); o limite real é o refresh token, que o backend expira em 30 dias | seal com `ttl` e cookie sem `Max-Age`: a biblioteca não aceita a combinação (forçada) |
| Auth como Server Actions | `app/actions/auth.ts` (`'use server'`): `login({ email, senha, lembrar }) → { message } \| redirect('/pessoas')`, `logout() → redirect('/login')` | (task `Decided`) `route.ts` com `login`/`logout`, `/api/auth/session` |
| Código só de servidor em `lib/server/` | `lib/server/session.ts` (`getSession`, `saveSession`, `verifySession`) e `lib/server/backend.ts` (`backendFetch`, `sessionFetch`), ambos com `import 'server-only'`; specs em ambiente `node` | módulos em `lib/` junto do cliente: o projeto jest `client` (jsdom) casa `lib/**`, e nada separa o que pode ir para o bundle do navegador |
| Deduplicação do refresh | `Map<refreshToken, Promise<RefreshResult>>` em `lib/server/backend.ts`; sucesso ou revogação ficam retidos 10 s; `unavailable` (5xx ou rede) sai do mapa ao resolver | reter também `unavailable`: um 5xx passageiro bloquearia novas tentativas por 10 s |
| 401 no cliente | `apiFetch`/`apiFetchRaw` navegam uma vez (flag de módulo) e devolvem uma promise que nunca resolve | resolver `null` (hoje) ou rejeitar: o código do chamador continua e dispara toasts próprios ("Erro ao exportar a base.") durante a navegação, o que viola o critério 24 |
| Login: página server + componente client | `app/login/page.tsx` lê `searchParams.sessao` e renderiza `LoginPage` (`app/login/LoginPage.tsx`, `'use client'`) com `sessaoExpirada` | `useSearchParams` na página client: o Next exige `Suspense` para renderizar estático |
| Serviço por domínio | `services/membros.ts` exporta `membrosService.{ listar, obter, exportar }` | (task `Decided`) URLs literais nas páginas |

- Nada mais nesta mudança é difícil de reverter

## Checks

Comando base: `npm test -w web -- <arquivo> -t "<nome>"`.

### S1 - Login e logout como Server Actions · 6 files · 18 KB · ~5k

**C1** - Credenciais válidas gravam `church_session` com os três tokens e redirecionam para `/pessoas`
Proof: `npm test -w web -- app/actions/auth.spec.ts -t "C1"`

**C2** - O sucesso do login não devolve nenhum token ao navegador (a action não retorna valor; o cookie é selado)
Proof: `npm test -w web -- app/actions/auth.spec.ts -t "C2"`

**C3** - Com `lembrar`, o cookie sai com `Max-Age=2592000`; sem `lembrar`, sai sem `Max-Age` nem `Expires`
Proof: `npm test -w web -- app/actions/auth.spec.ts -t "C3"`

**C4** - Status não-2xx do backend: sem cookie, retorna a `message` do backend, ou `'Falha ao fazer login.'`
Proof: `npm test -w web -- app/actions/auth.spec.ts -t "C4"`

**C5** - Resposta 2xx sem os três campos: sem cookie, retorna `'Resposta inválida do servidor de autenticação.'`
Proof: `npm test -w web -- app/actions/auth.spec.ts -t "C5"`

**C6** - A chamada de login rejeita por rede: sem cookie, retorna `'Algo deu errado. Tente novamente em instantes.'`, sem lançar
Proof: `npm test -w web -- app/actions/auth.spec.ts -t "C6"`

**C7** - A tela de login mostra `toast.error(message)` quando a action devolve `{ message }`
Proof: `npm test -w web -- app/login/LoginPage.spec.tsx -t "C7"`

**C8** - `logout` com sessão: o backend recebe `POST /auth/logout` com `{ refreshToken }` e `Authorization: Bearer <accessToken>`; o cookie é destruído; redireciona para `/login`
Proof: `npm test -w web -- app/actions/auth.spec.ts -t "C8"`

**C9** - `logout` com falha no backend ainda destrói o cookie e redireciona
Proof: `npm test -w web -- app/actions/auth.spec.ts -t "C9"`

**C10** - `logout` sem cookie redireciona para `/login` sem chamar o backend
Proof: `npm test -w web -- app/actions/auth.spec.ts -t "C10"`

### S2 - Proteção de páginas · 5 files · 8 KB · ~2k

**C11** - Sem `church_session`, `GET /`, `/pessoas` e `/pessoas/<id>` recebem `307` para `/login`
Proof: `npm test -w web -- proxy.spec.ts -t "C11"`

**C12** - Com sessão válida, `GET /login` recebe `307` para `/pessoas`
Proof: `npm test -w web -- proxy.spec.ts -t "C12"`

**C13** - Cookie adulterado conta como sem sessão no proxy (`/pessoas` → `/login`; `/login` passa)
Proof: `npm test -w web -- proxy.spec.ts -t "C13"`

**C14** - O proxy não casa `/api/membros`, `/_next/static/x.js`, `/_next/image` nem `/favicon.ico`, e casa `/pessoas`
Proof: `npm test -w web -- proxy.spec.ts -t "C14"`

**C15** - `verifySession()` redireciona para `/login` com cookie ausente ou adulterado
Proof: `npm test -w web -- lib/server/session.spec.ts -t "C15"`

**C16** - `app/pessoas/page.tsx` e `app/pessoas/[id]/page.tsx` chamam `verifySession()` antes de renderizar
Proof: `npm test -w web -- app/pessoas/page.spec.tsx -t "C16"`

**C17** - Sem sessão válida, as três route handlers respondem `401 { message: 'Sua sessão expirou. Entre novamente.' }` sem chamar o backend
Proof: `npm test -w web -- app/api/membros/route.spec.ts app/api/membros/\[id\]/route.spec.ts app/api/membros/exportar/route.spec.ts -t "C17"`

### S3 - Token e refresh no servidor · 3 files · 14 KB · ~4k

**C18** - Token a mais de 60 s de expirar: o backend recebe `Bearer <accessToken da sessão>` e nenhum refresh
Proof: `npm test -w web -- lib/server/backend.spec.ts -t "C18"`

**C19** - Faltando 60 s ou menos: `POST /auth/refresh` com o `refreshToken` antes da chamada, que usa o novo token; o cookie é regravado com os valores novos e `lembrar` preservado
Proof: `npm test -w web -- lib/server/backend.spec.ts -t "C19"`

**C20** - 401 no prazo: um refresh e uma única repetição; 401 de novo destrói o cookie e responde 401 com a mensagem de sessão expirada
Proof: `npm test -w web -- lib/server/backend.spec.ts -t "C20"`

**C21** - Refresh com 401, 403, 204 ou corpo inválido destrói o cookie e responde 401
Proof: `npm test -w web -- lib/server/backend.spec.ts -t "C21"`

**C22** - Refresh com 5xx mantém o cookie e responde com o mesmo status; por rede, `502`; ambos com a mensagem genérica
Proof: `npm test -w web -- lib/server/backend.spec.ts -t "C22"`

**C23** - N chamadas concorrentes com o mesmo `refreshToken`, e uma chegando até 10 s depois, geram exatamente 1 `POST /auth/refresh`
Proof: `npm test -w web -- lib/server/backend.spec.ts -t "C23"`

### S4 - Chamada ao backend reutilizável · 6 files · 12 KB · ~3k

**C24** - Um request com `Authorization: Bearer forjado` e sem cookie recebe 401 e o backend não é chamado
Proof: `npm test -w web -- app/api/membros/route.spec.ts -t "C24"`

**C25** - Os contratos de resposta das três handlers se mantêm (`{ data, total, page }`; `{ data }` ou `204`; CSV com `Content-Type` e `Content-Disposition`)
Proof: `npm test -w web -- app/api/membros/route.spec.ts app/api/membros/\[id\]/route.spec.ts app/api/membros/exportar/route.spec.ts -t "C25"`

**C26** - Um erro do backend diferente de 401 chega com o mesmo status e o mesmo corpo
Proof: `npm test -w web -- app/api/membros/route.spec.ts -t "C26"`

### S5 - Cliente HTTP e toasts · 4 files · 14 KB · ~4k

**C27** - `apiFetch` não envia `Authorization`
Proof: `npm test -w web -- lib/http.spec.ts -t "C27"`

**C28** - `stores/` e a dependência `zustand` não existem; nenhum código de cliente cita `accessToken`
Proof: `test ! -e apps/backoffice/stores && ! grep -q zustand apps/backoffice/package.json && ! grep -rn "accessToken" apps/backoffice/lib/http.ts apps/backoffice/services apps/backoffice/app/login apps/backoffice/app/pessoas --include=*.tsx --include=*.ts --exclude=*.spec.*`

**C29** - 401 navega para `/login?sessao=expirada` sem toast
Proof: `npm test -w web -- lib/http.spec.ts -t "C29"`

**C30** - A tela de login com `sessaoExpirada` mostra `toast.info('Sua sessão expirou. Entre novamente.')` com `toastId` fixo
Proof: `npm test -w web -- app/login/LoginPage.spec.tsx -t "C30"`
Proof: `npm test -w web -- app/login/page.spec.tsx -t "C30"` (a rota liga `?sessao=expirada` à prop)

**C31** - 401 concorrentes geram uma única navegação e nenhum toast de erro
Proof: `npm test -w web -- lib/http.spec.ts -t "C31"`

**C32** - 403 mostra `'Sem permissão para realizar esta ação.'`, 5xx mostra a mensagem genérica, falha de rede mostra a mensagem genérica, 4xx com `message` mostra a `message`; a promise rejeita em todos
Proof: `npm test -w web -- lib/http.spec.ts -t "C32"`

**C33** - `204` resolve `null` sem toast
Proof: `npm test -w web -- lib/http.spec.ts -t "C33"`

**C34** - Os toasts usam `toastId` igual à mensagem, então mensagens iguais concorrentes viram um toast
Proof: `npm test -w web -- lib/http.spec.ts -t "C34"`
Proof: `npm test -w web -- lib/http.toast.spec.tsx -t "C34"` (conta os toasts renderizados no `ToastContainer` real)

**C35** - Uma falha das estatísticas em `/pessoas` não dispara toast próprio da página (fica só o da camada HTTP)
Proof: `npm test -w web -- app/pessoas/PessoasPage.spec.tsx -t "C35"`
Proof: `npm test -w web -- app/pessoas/PessoasPage.toast.spec.tsx -t "C35"` (500 nas três estatísticas → exatamente 1 toast renderizado)

### S6 - Serviço de domínio · 6 files · 22 KB · ~6k

**C36** - `membrosService.listar` monta `/api/membros?page&limit[&status]`, `obter` devolve o membro ou `null` no 204, `exportar` devolve o texto do CSV
Proof: `npm test -w web -- services/membros.spec.ts -t "C36"`

**C37** - `/pessoas` mantém StatCards, lista, filtros, paginação, export com download, toast em `erro\n` e navegação por linha, chamando `membrosService`
Proof: `npm test -w web -- app/pessoas/PessoasPage.spec.tsx`
Proof: `grep -L "/api/" apps/backoffice/app/pessoas/PessoasPage.tsx apps/backoffice/app/pessoas/\[id\]/PessoaPerfilPage.tsx | wc -l | grep -qx 2`

**C38** - `/pessoas/[id]` mostra o membro, e `'Membro não encontrado'` quando `obter` devolve `null`
Proof: `npm test -w web -- app/pessoas/\[id\]/PessoaPerfilPage.spec.tsx`

**C39** - Nenhum código cita `/api/auth/`, e `app/api/auth` não existe
Proof: `test ! -e apps/backoffice/app/api/auth && ! grep -rn "/api/auth/" apps/backoffice/app apps/backoffice/lib apps/backoffice/services apps/backoffice/proxy.ts`

### Gate

**C40** - `npm run typecheck -w web`, `npm run lint -w web` e `npm test -w web` passam
Proof: `npm run typecheck -w web && npm run lint -w web && npm test -w web`

## Swept

- validation: C5 (corpo do backend); campos do formulário - existing (zod em `LoginPage`)
- failure modes: C6, C9, C22, C32
- idempotency: C20 (uma única repetição), C10 (logout sem cookie)
- authorization: C11, C15–C17, C24; papéis - existing (guard `admin` do backend); 403 em C32
- concurrency: C23 (refresh), C31 (401 no navegador), C34 (toasts)
- data lifecycle: C3, C8, C21; legado - a action `login` apaga os cookies `refreshToken`/`rememberMe` em `Path=/api/auth` (C1)
- dependency failure: C6, C22, C32
- state transitions: C1, C8, C18–C22
- observability: not in scope - confirmado pelo usuário (nada é registrado)

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| desfechos do refresh (6) | ok C19 · 401 C21 · 403 C21 · 204 C21 · corpo inválido C21 · 5xx/rede C22 | - |
| mapeamento de status no cliente (6) | 204 C33 · 401 C29 · 403 C32 · 4xx com message C32 · 5xx C32 · rede C32 | - |
| handlers de dados (3) | `/api/membros` C17 C25 · `/api/membros/[id]` C17 C25 · `/api/membros/exportar` C17 C25 | - |
| páginas protegidas (3) | `/` C11 · `/pessoas` C11 C16 · `/pessoas/[id]` C11 C16 | - |
| desfechos do login (4) | sucesso C1 · não-2xx C4 · corpo inválido C5 · rede C6 | - |

- Claims que citam status, rota ou forma de resposta: C1, C4–C6, C8, C11–C14, C17, C20–C22, C24–C26, C29 - todas com proof chamando a própria action, `proxy` ou handler
- Nenhum outro check afirma mais que o caso que sua proof exercita

## Handoff

S1–S6 somam ~24k (piso de `wc -c` / 4 sobre os arquivos tocados). Cabe num lote de 150k, então não há handoff: um build, depois o Verifier sobre `d85d768` + a árvore de trabalho (o usuário commita no `main`; este build não faz commits).
