# Backoffice — sessão no servidor (iron-session) e camada HTTP padronizada — Verification

**Verdict**: PASS (40/40 checks com evidência localizada; os 7 gaps do round 1 estão fechados)
**Profile**: light
**Diff range**: `d85d768` (HEAD) + árvore de trabalho, restrito a `apps/backoffice`, `turbo.json`, `docs/backend/ibfc-server.md`, `.tasks/`, `.checks/`. Diff do fix (round 1 → round 2): arquivos com mtime posterior ao relatório do round 1 (2026-10-19 13:39:44)
**Round**: 2 - scoped
**Verifier**: independent sub-agent (author != verifier), somente leitura; proofs rodadas por mim na árvore atual em 2026-10-19

"Árvore atual" abaixo = `d85d768` + árvore de trabalho no momento deste round 2 (o trabalho não está commitado, então não há sha próprio).

## Escopo do fix — verified at árvore atual

Arquivos com mtime posterior ao relatório do round 1 (`find apps/backoffice -newer .checks/backoffice-sessao-iron-session.verified.md`, sem `node_modules`/`.next`):

| Arquivo | Tipo | Observação |
|---|---|---|
| `app/actions/auth.spec.ts` | spec | +2 testes (C1 `Secure`, C9 500) |
| `lib/server/backend.spec.ts` | spec | +2 testes (fronteira de C19) |
| `app/pessoas/PessoasPage.spec.tsx` | spec | asserções de C37 reforçadas, IDs renomeados |
| `app/pessoas/[id]/PessoaPerfilPage.spec.tsx` | spec | IDs renomeados para C38 |
| `lib/http.toast.spec.tsx` | spec nova | C34 com `ToastContainer` real |
| `app/pessoas/PessoasPage.toast.spec.tsx` | spec nova | C35 com `ToastContainer` real |
| `app/login/page.spec.tsx` | spec nova | C30, junção rota → prop |
| `jest.config.mjs` | config de teste | `testMatch` do projeto `client` passou a `lib/**/*.spec.{ts,tsx}` (`:53`) |
| `lib/http.ts` | **produção** | mtime 13:57:00, mas o conteúdo é idêntico ao snapshot do histórico de arquivos do Claude Code tirado às 13:39:10 (`~/.claude/file-history/7c7a27c5-…/9db719a69145ccfb@v2`, `diff` sem saída). Nenhuma mudança de conteúdo |
| `.gitignore` | config | `+.env.local` (fora do checklist; inofensivo) |
| `tsconfig.tsbuildinfo` | artefato | regravado pelo meu próprio `tsc` |

Nenhum outro arquivo de produção mudou depois do round 1. As linhas de produção citadas no round 1 continuam batendo: `lib/server/backend.ts:138` (`expiresAt - Date.now() <= RENEW_MARGIN_MS`), `lib/http.ts:17` (`toast.error(message, { toastId: message })`), `lib/server/session.ts:21` (`SESSION_COOKIE = 'church_session'`), `app/login/page.tsx:7` (`sessao === 'expirada'`), `app/pessoas/PessoasPage.tsx:125` (`'Erro ao exportar a base.'`) e `:132` (`a.download = 'membros.csv'`).

Checklist: comparei o `.checks/backoffice-sessao-iron-session.md` atual com o snapshot de 13:39:10 (`891d973feff6e1f4@v2`). O `diff` mostra só três linhas `Proof:` adicionadas (C30 `:143`, C34 `:156`, C35 `:160`). Nenhuma proof foi removida nem alterada, o que bate com a coluna "Proof run" do round 1.

Projetos jest: as três specs novas caem no projeto `client` (`jest.config.mjs:50-57`). `lib/http.toast.spec.tsx` casa `lib/**/*.spec.{ts,tsx}` (`:53`), e as duas em `app/` casam `app/**/*.spec.tsx` (`:55`). `lib/server/` continua só no projeto `server` (`:57` o ignora no `client`). Na saída JSON, cada suíte aparece uma vez (16 suítes).

## Binding sources — carried from round 1

Não se aplica: o perfil é `light` e o checklist declara que nenhuma fonte de design é binding.

## Proofs executadas — verified at árvore atual

- Jest, uma invocação para todos os alvos (em `apps/backoffice`): `npx jest app/actions/auth.spec.ts app/login/LoginPage.spec.tsx app/login/page.spec.tsx proxy.spec.ts lib/server/session.spec.ts app/pessoas/page.spec.tsx app/api/membros lib/server/backend.spec.ts lib/http.spec.ts lib/http.toast.spec.tsx app/pessoas/PessoasPage.spec.tsx app/pessoas/PessoasPage.toast.spec.tsx services/membros.spec.ts "app/pessoas/\[id\]/PessoaPerfilPage.spec.tsx" --json --outputFile=…`. Exit 0, 16 suítes, 118 testes, 118 passed, 0 failed. Cada teste citado abaixo aparece individualmente como `passed` na saída JSON.
- Comandos, rodados exatamente como escritos a partir da raiz do repositório: C28 exit 0, a parte grep de C37 exit 0, C39 exit 0.
- Gate C40: `npm run typecheck -w web` exit 0; `npm run lint -w web` exit 0 (`eslint .` sem saída de erro, então não precisei do `rtk proxy`); `npm test -w web` exit 0 (16 suítes, 118/118, "Ran all test suites in 2 projects").

## Checks

Coluna "Cit.": **R2** = citação refrescada neste round (arquivo tocado pelo fix); **R1** = citação carried from round 1 (arquivo não tocado; a proof foi re-rodada e passou).

| Check | Claim | Proof run (round 2) | Evidence | Cit. | Result |
|---|---|---|---|---|---|
| C1 | login válido grava `church_session` com os 3 tokens e redireciona para `/pessoas` | `auth.spec.ts` "C1" ×3, passed | `app/actions/auth.spec.ts:48-50` - `rejects.toThrow('NEXT_REDIRECT /pessoas')`; `:55` - `writes.map(w => w.name)).toEqual(['church_session'])` (literal); `:57-62` - `httpOnly: true, sameSite: 'lax', path: '/', secure: false`; `:63-68` - unseal `toEqual({ accessToken: 'access-fake-login', …, refreshToken: 'refresh-fake-login', lembrar: false })`; `:82` - `options.secure).toBe(true)` com `NODE_ENV: 'production'`; `:92-95` - cookies legados apagados em `/api/auth` | R2 | PASS |
| C2 | sucesso não devolve token ao navegador | "C2", passed | `auth.spec.ts:108` - `outcome).toEqual({ error: 'NEXT_REDIRECT /pessoas' })`; `:110-111` - `sealed).not.toContain('access-fake-login')` / `'refresh-fake-login'` | R2 | PASS |
| C3 | `lembrar` → `Max-Age=2592000`; sem ele, nem `Max-Age` nem `Expires` | "C3" ×2, passed | `auth.spec.ts:121` - `maxAge).toBe(2592000)`; `:130-131` - `maxAge).toBeUndefined()`, `expires).toBeUndefined()` | R2 | PASS |
| C4 | não-2xx: sem cookie, `message` do backend ou `'Falha ao fazer login.'` | "C4" ×2, passed | `auth.spec.ts:143-146` - `resolves.toEqual({ message: 'E-mail ou senha inválidos.' })`, `writes).toHaveLength(0)`; `:152-155` - `{ message: 'Falha ao fazer login.' }` (423) | R2 | PASS |
| C5 | 2xx sem os 3 campos → mensagem de resposta inválida, sem cookie | "C5", passed | `auth.spec.ts:165-168` - `{ message: 'Resposta inválida do servidor de autenticação.' }`, `writes).toHaveLength(0)` | R2 | PASS |
| C6 | rede → mensagem genérica, sem lançar | "C6", passed | `auth.spec.ts:182-185` - `resolves.toEqual({ message: 'Algo deu errado. Tente novamente em instantes.' })`, `writes).toHaveLength(0)` | R2 | PASS |
| C7 | tela mostra `toast.error(message)` | `LoginPage.spec.tsx` "C7" ×2, passed | `app/login/LoginPage.spec.tsx:70` - `toast.error).toHaveBeenCalledWith('E-mail ou senha inválidos.')` | R1 | PASS |
| C8 | logout: `POST /auth/logout` `{ refreshToken }` + Bearer; cookie destruído; `/login` | "C8", passed | `auth.spec.ts:205` - `rejects.toThrow('NEXT_REDIRECT /login')`; `:208-212` - `method).toBe('POST')`, body `toEqual({ refreshToken: 'refresh-fake-logout' })`, `authorizationOf(...)).toBe('Bearer access-fake-logout')`; `:213` - `maxAge).toBe(0)` | R2 | PASS |
| C9 | falha no backend ainda destrói o cookie e redireciona | "C9" ×2, passed | rede: `auth.spec.ts:228-229` - `NEXT_REDIRECT /login`, `maxAge).toBe(0)`; resposta 500: `:238-240` - `NEXT_REDIRECT /login`, `callsTo('/auth/logout')).toHaveLength(1)`, `maxAge).toBe(0)` | R2 | PASS |
| C10 | logout sem cookie não chama o backend | "C10", passed | `auth.spec.ts:248-249` - `NEXT_REDIRECT /login`, `fetchSpy).not.toHaveBeenCalled()` | R2 | PASS |
| C11 | sem sessão, `/`, `/pessoas`, `/pessoas/<id>` → 307 `/login` | `proxy.spec.ts` "C11" ×3, passed | `proxy.spec.ts:33-34` - `status).toBe(307)`, `redirectTarget(res)).toBe('/login')` | R1 | PASS |
| C12 | sessão válida: `/login` → 307 `/pessoas` | "C12" ×2, passed | `proxy.spec.ts:43-44` | R1 | PASS |
| C13 | cookie adulterado conta como sem sessão | "C13" ×2, passed | `proxy.spec.ts:58-59`, `:65` | R1 | PASS |
| C14 | matcher | "C14" ×7, passed | `proxy.spec.ts:79-81` - `unstable_doesMiddlewareMatch(...)).toBe(runs)`, tabela `:71-77` | R1 | PASS |
| C15 | `verifySession()` → `/login` com cookie ausente ou adulterado | `session.spec.ts` "C15" ×3, passed | `lib/server/session.spec.ts:25`, `:31` - `rejects.toThrow('NEXT_REDIRECT /login')` | R1 | PASS |
| C16 | as duas pages chamam `verifySession()` antes de renderizar | `app/pessoas/page.spec.tsx` "C16" ×3, passed | `app/pessoas/page.spec.tsx:28`, `:34-36`, `:46` | R1 | PASS |
| C17 | 3 handlers → `401 { message: 'Sua sessão expirou. Entre novamente.' }` sem backend | 3 route specs "C17", passed | `app/api/membros/route.spec.ts:52-54`, `[id]/route.spec.ts:52-54`, `exportar/route.spec.ts:41-43` | R1 | PASS |
| C18 | token com mais de 60 s: Bearer da sessão, sem refresh | `backend.spec.ts` "C18", passed | `lib/server/backend.spec.ts:53-56` - `authorizationOf(...)).toBe('Bearer access-old')`, `callsTo('/auth/refresh')).toHaveLength(0)` | R2 | PASS |
| C19 | ≤ 60 s: refresh antes, novo token, cookie regravado com `lembrar` preservado | "C19" ×4, passed | `backend.spec.ts:75-77` - body `toEqual({ refreshToken: 'refresh-c19' })`; `:78-80` - `'Bearer access-c19'`; `:82-87` - `maxAge).toBe(2592000)`, unseal `toMatchObject({ …, lembrar: true })`; fronteira `:90-93` + `:107` - `callsTo('/auth/refresh')).toHaveLength(refreshes)` com 60 000 ms → 1 e 60 001 ms → 0 (relógio fixo `:94-95`); expirado `:122-125` | R2 | PASS |
| C20 | 401 no prazo: 1 refresh + 1 repetição; 401 de novo destrói e responde 401 | "C20" ×2, passed | `backend.spec.ts:139-143` - `toBe(200)`, refresh `toHaveLength(1)`, dados `toHaveLength(2)`, `'Bearer access-c20'`; `:155-158` - `toBe(401)`, `{ message: SESSION_EXPIRED }`, `toHaveLength(2)`, `cookieDestroyed()).toBe(true)` | R2 | PASS |
| C21 | refresh 401/403/204/corpo inválido → cookie destruído, 401 | "C21" ×4, passed | `backend.spec.ts:177-180` - `toBe(401)`, `{ message: SESSION_EXPIRED }`, `cookieDestroyed()).toBe(true)`, dados `toHaveLength(0)`; casos `:163-167` | R2 | PASS |
| C22 | refresh 5xx: cookie mantido, mesmo status; rede: 502; mensagem genérica | "C22" ×2, passed | `backend.spec.ts:194-196` - `toBe(503)`, `{ message: GENERIC }`, `writes).toHaveLength(0)`; `:214-216` - `toBe(502)`, idem | R2 | PASS |
| C23 | N concorrentes + uma até 10 s depois → exatamente 1 `POST /auth/refresh` | "C23", passed | `backend.spec.ts:238` - `toHaveLength(1)` após 3 concorrentes; `:243` - `toHaveLength(1)` em +9 s; `:251` - `toHaveLength(2)` em +10,001 s | R2 | PASS |
| C24 | `Bearer forjado` sem cookie → 401, backend não chamado | `route.spec.ts` "C24" ×2, passed | `app/api/membros/route.spec.ts:65-66`, `:76-78` | R1 | PASS |
| C25 | contratos das 3 handlers | 3 route specs "C25" (8), passed | `route.spec.ts:95-99`; `[id]/route.spec.ts:65-69`, `:109-110`; `exportar/route.spec.ts:57-61` | R1 | PASS |
| C26 | erro não-401 chega com o mesmo status e corpo | `route.spec.ts` "C26" ×2, passed | `route.spec.ts:125-126`, `:138-139` | R1 | PASS |
| C27 | `apiFetch` não envia `Authorization` | `http.spec.ts` "C27", passed | `lib/http.spec.ts:80` | R1 | PASS |
| C28 | sem `stores/`, sem `zustand`, nenhum código de cliente cita `accessToken` | comando como escrito, exit 0 | resultado do comando; `stores/` ausente | R1 | PASS |
| C29 | 401 → `/login?sessao=expirada` sem toast | "C29", passed | `http.spec.ts:91-93` | R1 | PASS |
| C30 | `sessaoExpirada` → `toast.info('Sua sessão expirou. Entre novamente.')` com `toastId` fixo | `LoginPage.spec.tsx` "C30" ×2 + `app/login/page.spec.tsx` "C30" ×4, passed | `LoginPage.spec.tsx:92-95`, `:101` (R1); rota: `app/login/page.spec.tsx:28-31` - `toast.info).toHaveBeenCalledWith('Sua sessão expirou. Entre novamente.', { toastId: 'sessao-expirada' })` para `?sessao=expirada`; `:39` - `toast.info).not.toHaveBeenCalled()` para `undefined`, `'outra'` e `['expirada','expirada']` (renderiza o `LoginPage` real; só a action está mockada) | R1+R2 | PASS |
| C31 | 401 concorrentes → 1 navegação, nenhum toast de erro | "C31", passed | `http.spec.ts:112-114` | R1 | PASS |
| C32 | 403/5xx/rede/4xx-com-message → toast certo; rejeita em todos | "C32" ×7, passed | `http.spec.ts:133-136`, `:143-146` | R1 | PASS |
| C33 | `204` resolve `null` sem toast | "C33", passed | `http.spec.ts:165-166` | R1 | PASS |
| C34 | `toastId` = mensagem, então mensagens iguais concorrentes viram um toast | `http.spec.ts` "C34" + `http.toast.spec.tsx` "C34" ×2, passed | `http.spec.ts:188-191` (R1); renderizado: `lib/http.toast.spec.tsx:38` - `screen.getAllByText(GENERIC)).toHaveLength(1)` após 500/502/503 concorrentes com o `ToastContainer` real de `@church/ui/molecules/Toast` (o mesmo de `app/layout.tsx:31`; react-toastify não mockado); `:58-59` - mensagens distintas → um toast de cada | R1+R2 | PASS |
| C35 | falha das estatísticas em `/pessoas` não gera toast da página | `PessoasPage.spec.tsx` "C35" ×2 + `PessoasPage.toast.spec.tsx` "C35", passed | `PessoasPage.spec.tsx:129-130` - `toast.error).not.toHaveBeenCalled()`, `getAllByText('—')).toHaveLength(3)`; `:142` - nenhum toast da página na falha do export; renderizado: `app/pessoas/PessoasPage.toast.spec.tsx:53` - `getAllByText(GENERIC)).toHaveLength(1)` com 500 nas três estatísticas, `fetch` real espionado, `apiFetch` real; `:54` - `queryByText('Erro ao carregar estatísticas.')).toBeNull()` | R2 | PASS |
| C36 | `listar`/`obter`/`exportar` | `membros.spec.ts` "C36" ×6, passed | `services/membros.spec.ts:34-36`, `:44`, `:50-53`, `:59`, `:65-66` | R1 | PASS |
| C37 | `/pessoas` mantém StatCards, lista, filtros, paginação, export, toast em `erro\n` e navegação, via `membrosService` | spec inteira (14), passed; grep exit 0 | StatCards: rótulos `PessoasPage.spec.tsx:101-103`, valores `:112-115` - `within(card('Total de membros')).getByText('42')` / `'5'` / `'3'` `.toBeVisible()`; lista `:151-157`; vazio `:167`; paginação `:178` - `getByText('1-10 de 50 itens')`; filtros `:193-195`, `:210-212`; download `:255-256` - `createObjectURL).toHaveBeenCalled()`, `downloads).toEqual(['membros.csv'])`; `erro\n` `:269` - `toast.error).toHaveBeenCalledWith('Erro ao exportar a base.')`; navegação `:288` - `pushSpy).toHaveBeenCalledWith('/pessoas/id-001')`. Grep: nenhuma ocorrência de `/api/` nas duas páginas | R2 | PASS |
| C38 | `/pessoas/[id]` mostra o membro, e `'Membro não encontrado'` quando `obter` → `null` | spec inteira (5), passed | `app/pessoas/[id]/PessoaPerfilPage.spec.tsx:44-49` - nome, email, telefone, `'Ativo'`, `'Origem: Importação'`; `:57` - `'/api/membros/id-fake-001'`; `:68` - `getByText('Membro não encontrado')` com `apiFetch` → `null` | R2 | PASS |
| C39 | nenhum código cita `/api/auth/`; `app/api/auth` não existe | comando como escrito, exit 0 | resultado do comando; o único `/api/auth` (sem barra final) continua sendo o caminho legado intencional em `app/actions/auth.ts` | R1 | PASS |
| C40 | typecheck, lint e test passam | os três comandos, exit 0 | `tsc --noEmit` exit 0; `eslint .` exit 0; jest com 16 suítes e 118/118 | R2 | PASS |

## Gaps from round 1 — verified at árvore atual

| # | Gap | Status | Evidência |
|---|---|---|---|
| 1 | Fronteira de 60 s de C19 | CLOSED | `lib/server/backend.spec.ts:90-108`: `it.each([['exactly 60 s left → refresh', 60_000, 1], ['60.001 s left → no refresh', 60_001, 0]])` com relógio fixo (`:94-95`), `expect(callsTo('/auth/refresh')).toHaveLength(refreshes)` (`:107`). Um `<` no lugar de `<=` em `backend.ts:138` falha no caso de 60 000; uma margem maior falha no de 60 001 |
| 2a | C1: nome literal `church_session` | CLOSED | `app/actions/auth.spec.ts:55` - `expect(mockCookies.writes.map(w => w.name)).toEqual(['church_session'])` |
| 2b | C1: `Secure` em produção | CLOSED | `auth.spec.ts:71-82` - com `NODE_ENV: 'production'`, `expect(mockCookies.writes[0]?.options.secure).toBe(true)`; o contrário em `:61` (`secure: false` fora de produção). A fonte lê `NODE_ENV` na chamada (`lib/server/session.ts:45`) |
| 3 | C34/C35 sem `ToastContainer`, "exatamente um toast" não observado | CLOSED | C34: `lib/http.toast.spec.tsx:28` renderiza o `ToastContainer` real; `:38` - `expect(screen.getAllByText(GENERIC)).toHaveLength(1)` após três falhas concorrentes. C35: `app/pessoas/PessoasPage.toast.spec.tsx:43-48` renderiza a página e o container; `:53` - `toHaveLength(1)` |
| 4a | C37: paginação `getByText(/50/)` | CLOSED | `app/pessoas/PessoasPage.spec.tsx:178` - `screen.getByText('1-10 de 50 itens')` |
| 4b | C37: valores 42/5/3 dos StatCards | CLOSED | `PessoasPage.spec.tsx:112-115` - `within(card('Total de membros')).getByText('42')`, `within(card('Ativos')).getByText('5')`, `within(card('Inativos')).getByText('3')`, cada um `.toBeVisible()`, com escopo por cartão (`getByRole('article', { name })`) |
| 4c | C37: mensagem do toast de `erro\n` | CLOSED | `PessoasPage.spec.tsx:269` - `expect(toast.error).toHaveBeenCalledWith('Erro ao exportar a base.')` |
| 4d | C37: nome de arquivo `membros.csv` | CLOSED | `PessoasPage.spec.tsx:244-248` captura `this.download` no `click`; `:256` - `expect(downloads).toEqual(['membros.csv'])` |
| 5 | Junção `app/login/page.tsx` `sessao === 'expirada'` sem spec | CLOSED | `app/login/page.spec.tsx:25-31` - `?sessao=expirada` → `toast.info('Sua sessão expirou. Entre novamente.', { toastId: 'sessao-expirada' })`; `:34-41` - silencioso para `undefined`, `'outra'` e array. Agora também é proof de C30 no checklist (`:143`) |
| 6 | C9 só com rejeição de rede | CLOSED | `auth.spec.ts:232-241` - backend responde 500: `rejects.toThrow('NEXT_REDIRECT /login')`, `callsTo('/auth/logout')).toHaveLength(1)`, `lastWrite()?.options.maxAge).toBe(0)` |
| 7 | IDs antigos (C13–C23) colidindo nos specs de pessoas | CLOSED | `grep -rnE "C1[3-9]\|C2[0-3]" apps/backoffice/app/pessoas --include=*.spec.tsx` só encontra `app/pessoas/page.spec.tsx:24` (C16, que é o ID correto). `PessoasPage.spec.tsx` usa só C35/C37, `PessoaPerfilPage.spec.tsx` só C38. Na saída JSON, `C21` aparece somente em `backend.spec.ts` |

## Achados novos (round 2, não bloqueantes)

1. **`lib/http.ts` teve o mtime alterado depois do round 1 (13:57:00), mas sem mudança de conteúdo.** O arquivo atual é idêntico ao snapshot de 13:39:10 no histórico de arquivos do Claude Code. O fix, portanto, continua só em testes, mas o sinal de mtime sozinho diria o contrário. Fica registrado aqui para quem ler.
2. **`.gitignore` mudou depois do round 1** (`+.env.local`). Está fora do checklist e é inofensivo, mas não é "só testes". Não li nenhum `.env*`.
3. **As contagens de toast renderizados (C34, C35) esperam 50 ms fixos** (`http.toast.spec.tsx:37`, `PessoasPage.toast.spec.tsx:52`) antes de `toHaveLength(1)`. Um segundo toast que aparecesse depois dessa janela passaria verde. É risco baixo, porque o react-toastify despacha na mesma volta do loop, mas o teste depende de tempo.

## Swept rows resolvidas como "existing" — carried from round 1

| Row | Restrição citada | Encontrada |
|---|---|---|
| validation: campos do formulário (zod em `LoginPage`) | `app/login/LoginPage.tsx:5-6,15-16,48`; `LoginPage.spec.tsx:111-116` | sim (arquivos não tocados pelo fix) |
| authorization: papéis (guard `admin` do backend) | `docs/backend/ibfc-server.md:186`, `:192`, `:139` | sim, documentado |
| data lifecycle: legado, `login` apaga `refreshToken`/`rememberMe` em `Path=/api/auth` | `app/actions/auth.ts:22-23,57-60`; asserção refrescada: `auth.spec.ts:92-95` | sim |

## Seções omitidas pelo perfil — carried from round 1

Pelo perfil `light`, não rodam o recálculo da `Coverage`, os veredictos de `Test policy` nem a injeção de falhas. Por isso este round também não injetou falhas nas superfícies novas. A fronteira de C19 e as contagens renderizadas de C34/C35 discriminam por construção (os valores esperados são lidos na própria asserção), mas nenhum mutante foi rodado contra elas.

## Gate — verified at árvore atual

`npm run typecheck -w web && npm run lint -w web && npm test -w web` - exit 0; 16 suítes, 118 passed, 0 failed.

Observação (política da organização): todos os fixtures inspecionados são sintéticos (`*@example.test`, `(00) 00000-000x`, tokens `access-fake-*`, `refresh-c19-*`). Não li nenhum `.env*` e não usei `git stash`.
