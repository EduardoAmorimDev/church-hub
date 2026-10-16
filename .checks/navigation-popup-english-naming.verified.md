# Verificação: pop-up da navegação colapsada e nomes em en-US

**Verdict**: PASS nos 15 checks, sem defeito em aberto. Há 4 decisões do usuário pendentes (lacunas 1 a 4) que este PASS **não** aceita: o trabalho só fecha depois que o usuário decidir cada uma.
**Profile**: light (nenhuma declaração em `AGENTS.md`)
**Diff range**: 16ad2c1..working tree (não commitado em `main`, inclui renomes staged e `apps/backoffice/app/page.spec.tsx` como intent-to-add)
**Round**: 3 - scoped
**Verifier**: sub-agente independente (author != verifier)

Resumo: 15 de 15 checks provados na árvore atual. O C13, único FAIL da rodada 2, agora passa. `CARGOS`, `valor` e `gc` foram trocados em `packages/ui`, a prova passou a conhecer essas palavras, e minha varredura própria (todas as formas de declaração, `apps/app` inteiro, 1116 palavras distintas revistas) não achou identificador pt-BR do app fora do fio. A lacuna 4 da rodada 2 ("Limpar search") foi fechada. Continuam as lacunas 2, 3, 5 e 6 da rodada 2, agora numeradas 1 a 4. Todas são decisões do usuário e não defeitos.

Marcação de origem: "verificado agora" quer dizer rodado nesta rodada sobre a working tree atual (base `16ad2c1`, sem SHA próprio porque nada foi commitado). "Herdado da rodada N" quer dizer que vem do relatório daquela rodada.

Escopo da correção, conferido por `find -newer` contra o relatório da rodada 2: só mudaram `packages/ui/src/components/organisms/Select/Select.stories.tsx`, `Select/Select.spec.tsx`, `Table/Table.spec.tsx`, `atoms/SearchField/SearchField.spec.tsx` e, fora do repositório, `en-names.mjs` e `discover-wide.mjs`. Os demais arquivos com data nova são saídas de build de `packages/tokens`, regeneradas pelo gate. `git status --porcelain` está idêntico ao baseline da rodada 2.

## Binding sources (herdado da rodada 1)

O checklist não marca nenhuma fonte como binding, e o profile é `light`: o passo 1 não se aplica. A correção não tocou na interface.

## Checks (proofs verificados agora; citações renovadas só nos arquivos tocados)

| Check | Claim | Proof run | Evidence | Result |
|---|---|---|---|---|
| C1 | pop-up inteiro, à direita além do `aside`, `middle` sem rolagem horizontal | `node $NAVPOP/nav-popup.mjs c1` → `PASS c1`, exit 0 | herdado da rodada 2 (script intocado): `nav-popup.mjs:40`, `:53-56`, `:72` | PASS (amostra de 3 sub-itens, ver lacuna 3) |
| C2 | centro de cada sub-item é o próprio sub-item; fundo com alfa 1 | `nav-popup.mjs c2` → `PASS c2`, exit 0 | herdado: `nav-popup.mjs:83`, `:92` | PASS |
| C3 | offset estável (±1px) ao rolar e redimensionar | `nav-popup.mjs c3` → `PASS c3`, exit 0 | herdado: `nav-popup.mjs:108,110,124,126,131`; mutações A/B da rodada 2 mortas | PASS |
| C4 | Tab para sub-item mantém aberto; foco fora fecha | `npm test -w @church/ui -- <7 alvos> --json` → 7 suítes, 136/136; `NavItem C4 popup focus: Tab into a sub-item keeps the pop-up open, Tab out of the item closes it` = passed | herdado (spec intocado): `NavItem.spec.tsx:529-530`, `:534-535` | PASS |
| C5 | `collapsed=false` e `MenuDrawer` inalterados | mesma invocação (NavItem, MenuDrawer, SideMenu, Navigation) → passed; `git diff --stat` dos dois specs → 0 linhas, e 0 linhas contra `16ad2c1` | `MenuDrawer.spec.tsx` e `SideMenu.spec.tsx` intocados | PASS |
| C6 | hrefs en-US; "Membros" atual sem `tab`, com `tab` desconhecido e em `/people/{id}` | `npm test -w web -- <12 alvos> --json` → 15 suítes, 161/161; 11 testes `C6 …` passed | herdado (spec intocado): `navigation.spec.ts:166-176`, `:185` | PASS |
| C7 | página e `AppShell` leem `tab` | mesma invocação web: `C7 ?tab=visitors marks Visitantes as the current tab` e `C7 ?tab=visitors marks Visitantes; ?aba=visitantes does not` passed | herdado: `people/page.spec.tsx:134-135`; `AppShell.spec.tsx:255,263` | PASS |
| C8 | `/login` com sessão → 307 `/people`; `/` → `/people` | mesma invocação web: `C8 answers 307 with Location /people`, `C8 redirects to /people` passed | herdado: `proxy.spec.ts:43-44`; `app/page.spec.tsx:13` | PASS |
| C9 | 401 → `/login?session=expired`; toast com o texto de hoje e `toastId` `session-expired` | mesma invocação web: `C9 navigates to the en-US query`, `C9 toasts the unchanged pt-BR text with toastId session-expired` passed | herdado: `http.spec.ts:202`; `login/page.spec.tsx:29-30` | PASS |
| C10 | BFF em `/api/members…` e `/api/profile`, mesmos status/corpos, relay inalterado | mesma invocação web (`app/api/members`, `app/api/profile`, `services/members.spec.ts`, `services/profile.spec.ts`) passed | herdado (arquivos intocados): `deactivate/route.spec.ts:12,35,37`; `members/route.spec.ts:72,77`; `export/route.spec.ts:50`; `[id]/route.spec.ts:13,45`; `profile/route.spec.ts:68-73` (`name: 'Fulano Teste'` em `:70`, `callsTo('/perfil')).toHaveLength(1)` em `:73`) | PASS, condicionado à lacuna 1 (corpo de `/api/profile`) |
| C11 | URLs antigas dão 404; não há `api/membros` nem `api/perfil` | mesma invocação web: 5 testes `C11 /pessoas…/configuracoes is a 404` passed; teste de shell `test ! -e api/membros && test ! -e api/perfil && test ! -e "(painel)" && test ! -e "(panel)/pessoas"` → exit 0 | herdado: `[section]/page.spec.tsx:69`, `:72` | PASS (nível unitário) |
| C12 | nenhum arquivo ou pasta com palavra pt-BR | `node $NAVPOP/en-names.mjs files` → `PASS files`, exit 0 | `en-names.mjs:76-79` - `if (isPt(path.basename(rel)…)) problems.push(rel)` | PASS |
| C13 | nenhum identificador declarado com palavra pt-BR, salvo campos do fio em allowlist explícita | `node $NAVPOP/en-names.mjs identifiers` → `PASS identifiers`, exit 0 | `en-names.mjs:29-30` - `PT` agora inclui `cargo cargos valor valores gc gcs grupo grupos`; `:37-43` - `WIRE` ganhou `valor` e `gc`, mas só isenta `PropertySignature`/`PropertyAssignment` em `apps/backoffice/` (`:109-114`). Código: `Select.stories.tsx:15` `const ROLES`; `:34` `type FormValues = { group: string \| null }`; `:38` `defaultValues: { group: null }`; `:48` `name="group"`; `Select.spec.tsx:925` `type Form = { group: … }`, `:927`, `:933`, `:942` `form.watch('group')`, `:945` `touchedFields.group`, `:977`, `:983`; `Table.spec.tsx:640` `{ header: 'Valor', id: 'amount' }`, `:646` `amount: { label: '1.234' … }` (cabeçalho "Valor" preservado). Discriminação e revisão própria: ver abaixo | PASS |
| C14 | nenhum texto pt-BR de produção removido sem reaparecer igual | `node $NAVPOP/en-names.mjs copy` → `PASS copy`, exit 0 | `en-names.mjs:176` - `if (s && !after.has(s) && !RENAMED.has(s)) problems.push(...)`; nenhum arquivo de produção mudou nesta rodada | PASS |
| C15 | gate completo | `npm run verify -- --force` → exit 0, `Tasks: 11 successful, 11 total`, `Cached: 0 cached, 11 total` | `@church/ui`: 55 suítes, 1057 passed; `web`: 25 suítes, 246 passed; typecheck e lint ok | PASS |

Os testes renomeados nesta rodada também rodaram e passaram: as suítes `Select`, `Table` e `SearchField` estão dentro dos 136/136 da invocação de `@church/ui`, incluindo `SearchField clear button is a single "Limpar busca" button…` e `…is labelled "Limpar busca" in react-hook-form mode…`.

## Revisão completa do C13 (verificado agora)

**Scanner próprio.** Reusei o scanner da rodada 2 e ampliei as formas de declaração: `VariableDeclaration`, `FunctionDeclaration`, `FunctionExpression`, `ClassDeclaration`, `ClassExpression`, `Parameter`, `BindingElement`, `TypeAliasDeclaration`, `InterfaceDeclaration`, `EnumDeclaration`, `EnumMember`, `PropertySignature`, `PropertyAssignment`, `ShorthandPropertyAssignment`, `PropertyDeclaration`, `MethodDeclaration`, `MethodSignature`, `GetAccessor`, `SetAccessor`, `TypeParameter`, `ImportSpecifier`, `ImportClause`, `NamespaceImport`, `ExportSpecifier`, `LabeledStatement` e `ModuleDeclaration`. Ele cobre palavras de qualquer tamanho, com ou sem verbete no dicionário inglês, em `apps/backoffice`, `apps/app` inteiro e `packages/ui/src`. Resultado: 1116 palavras distintas, todas revistas à mão. Em relação à rodada 2, saiu `cargos` e entrou `amount`.

Palavras pt-BR que restam, todas no fio do `ibfc-server` e todas em `apps/backoffice`:

| Palavra | Onde | Classificação |
|---|---|---|
| `nome`, `cpf`, `dataNascimento`, `genero`, `telefone`, `endereco`, `rua`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `pais`, `cep`, `profissao`, `escolaridade`, `estadoCivil`, `origemCadastro`, `idPessoa`, `_nome`… | `types/members.ts`, `lib/personSchema.ts`, `lib/server/person.ts`, `test/person.ts`, specs de rota | fio (11(b)); só propriedades |
| `_valor` | `test/person.ts:31`, `api/members/[id]/route.spec.ts:79` | fio: datas da entidade `Pessoa` saem como `{ _valor: string \| null }` (`docs/backend/ibfc-server.md:985`) |
| `gc` | `api/profile/route.spec.ts:47` (`gc: null` no fixture do backend) | fio: `GET /perfil` devolve `{ id, nome, email, telefone, gc }` (`ibfc-server.md:1005`) |
| `accessTokenExpiraEm` | `lib/server/backend.ts:24,58`, `session.ts:14`, specs | fio de `/auth/login` (herdado da rodada 2) |
| `senha` | `actions/auth.ts:33`, `auth.spec.ts:54` | corpo de `/auth/login` |
| `ativo`, `inativo` | `MemberDrawer.tsx:17` | chaves iguais ao enum do fio |
| `secretaria`, `lider` | `AppShell.tsx:15-16` | papéis do token |
| `/admin/membros…`, `/core/pessoas`, `/perfil` | chaves de `mockBackend` nos specs | paths do backend |

Falsos positivos descartados: `decl` (`styles.spec.ts`), `TO_DO`, `doNotFake`, `jar`, `rej`, `preRotationCookie`, `__esModule`, `ToastfyContainer` (alias local de import), `em`/`expira` só dentro de `accessTokenExpiraEm`.

**A prova agora discrimina os três casos.** Montei uma árvore de rascunho (`scratchpad/r3/rootA`) com cópias de `Select.stories.tsx` e `Table.spec.tsx` revertidas (`ROLES`→`CARGOS`, `group`→`gc`, `amount`→`valor`) e um `apps/backoffice/w.ts` com `const valor = 1; export const p = { gc: null, valor }`. Rodei uma cópia de `en-names.mjs` apontada para essa árvore, sem tocar na árvore real. Saída: `FAIL identifiers: 6`, com `Select.stories.tsx:15 CARGOS`, `:34 gc`, `:38 gc`, `Table.spec.tsx:646 valor`, `w.ts:1 valor` (variável local) e `w.ts:2 valor` (shorthand local). O `gc: null` de `apps/backoffice` ficou isento como propriedade do fio, como deve. Exit 1. A isenção do `WIRE` é por propriedade e só em `apps/backoffice`, então não acoberta variável, parâmetro nem `packages/ui`.

Ressalva sobre a prova (não é defeito): o `PT` de `en-names.mjs` continua sendo uma lista fechada. A prova pega o que já se sabe e não pega uma palavra pt-BR nova. Hoje a cobertura vem da revisão manual completa acima, não só do script.

## Lacunas: decisões do usuário (em aberto, não aceitas por este PASS)

Nenhuma é defeito de implementação. Em cada uma, o checklist e a task não decidem o caso, ou se contradizem. Por isso a escolha cabe ao usuário. As quatro foram reconferidas agora na árvore atual e continuam sem alteração.

1. **Corpo de `/api/profile`: critério 9 contra critério 11.** O critério 9 e o C10 pedem "os mesmos status e corpos" das rotas antigas. Em `16ad2c1`, `api/perfil/route.ts` devolvia `{ nome, papel }`. Hoje devolve `{ name, role }` (`apps/backoffice/app/api/profile/route.ts:41`, `NextResponse.json({ name, role } satisfies Profile)`; spec `profile/route.spec.ts:70`). A mudança segue o critério 11, porque esse corpo é montado pela BFF e não é campo do fio. O único consumidor é o `AppShell`, no mesmo deploy. Classificação: **conflito entre critérios da própria task**, que a ordem de precedência não resolve. O C10 só é verdadeiro ao pé da letra se o usuário ratificar o 11 sobre o 9 neste ponto, ou pedir a volta para `{ nome, papel }`.
2. **Nome persistido no cookie selado: `lembrar` → `rememberMe`.** Ver `lib/server/session.ts:16` (`rememberMe: boolean`), `:70-71` e `lib/server/backend.ts:134`. A task diz em Impact "nada a migrar - nenhum nome persistido muda" e, no Swept, "data lifecycle: n/a". Num cookie `church_session` emitido antes da mudança, `session.rememberMe` fica `undefined`, e no próximo refresh a sessão "lembrar" perde o `Max-Age`. Classificação: **afirmação da task que ficou falsa**. O impacto é baixo pela premissa do Unresolved 2 (backoffice ainda sem usuários). Cabe ao usuário escolher entre manter `rememberMe` e corrigir o Impact/Swept, ou voltar a chave persistida para `lembrar`.
3. **C1 por amostragem.** O critério 1 fala dos quatro sub-itens no `AppShell`. A prova usa a story `SideMenu/Collapsed`, que tem três (`nav-popup.mjs:27`, `['Membros', 'Visitantes', 'GCs']`). Classificação: **lacuna de cobertura do checklist**, porque o C1 estreitou o critério. O risco técnico é baixo: a análise de ancestrais da rodada 1 segue válida, já que `Page.tsx`, `SideMenu.tsx` e `(panel)/layout.tsx` não ganharam `transform`, `filter` nem `contain`. Cabe ao usuário aceitar a amostra ou pedir uma prova em navegador no `AppShell`.
4. **Valores de string pt-BR em fixtures de `packages/ui`.** Hrefs, ids e valores sintéticos como `'inicio'`, `'membros'`, `'visitantes'`, `'avisos'` e `'gestao'` (`SideMenu.stories.tsx:9-34`, `MenuDrawer.stories.tsx:11-29`, `Page.stories.tsx:13-30`), `value: 'lider'`/`'anfitriao'` (`Select.stories.tsx:16,23`), opções `'gc-1'…'gc-4'` (`Select.spec.tsx:63-66`) e `id: 'membros'` (`Section.spec.tsx:27,31`). Nesta rodada encontrei também ids de DOM e test ids pt-BR, todos anteriores ao diff e em arquivos que ele não toca: `id="dados"`/`aria-labelledby="dados"` e `data-testid="grupo"` (`Stack.spec.tsx:133-134`), `id="lideranca"` (`Stack.stories.tsx:77-78`) e `data-testid="marca"` (`SideMenu.spec.tsx:122`). Classificação: **lacuna de precisão do critério 11**. Leio "nome definido pelo próprio app" como não alcançando valores de string de fixture. Ids de DOM e test ids são o caso mais próximo de um nome, mas não são identificadores declarados. Atenção: o C5 exige `SideMenu.spec.tsx` sem nenhuma alteração, então trocar `marca` ali quebraria o C5. Cabe ao usuário confirmar a leitura ou estender a regra (e, nesse caso, renegociar o C5).

## Lacunas da rodada 2 fechadas nesta rodada

- Lacuna 1 (C13): `CARGOS`, `valor` e `gc` em `packages/ui` foram trocados (citações na linha do C13). A prova foi ampliada e mostrada discriminante, e a revisão própria não encontrou outro caso.
- Lacuna 4 ("Limpar search"): `SearchField.spec.tsx:124` diz `'is a single "Limpar busca" button that clears and calls onClear'` e `:168` diz `'is labelled "Limpar busca" in react-hook-form mode and clears the form value'`. As asserções em `:134` (`toHaveAccessibleName('Limpar busca')`) e `:180` continuam iguais. O diff contra `16ad2c1` nesse arquivo tem 6+/6- linhas, só nas chaves de formulário `busca`→`search`, e nenhum título difere da base.

## Faults injetados

- C13 (verificado agora): ver "A prova agora discrimina os três casos" acima. Mutantes mortos, árvore real intocada (porcelain igual ao baseline).
- C3 (herdado da rodada 2): mutações A e B em `NavItem.tsx:193`, ambas mortas. `NavItem.tsx` não mudou desde então.

## Swept `existing` (herdado da rodada 1)

Nenhum arquivo que sustenta essas linhas mudou nesta rodada.

## Gate

`npm run verify -- --force` (turbo, `Cached: 0 cached, 11 total`): 11/11 tasks; `@church/ui` 55 suítes, 1057 passed, 0 failed; `web` 25 suítes, 246 passed, 0 failed; exit 0.

---
Nota: os fixtures citados são sintéticos (`id-fake-001`, "Pessoa Exemplo", "Fulano Teste"); este relatório não reproduz dado pessoal real.
