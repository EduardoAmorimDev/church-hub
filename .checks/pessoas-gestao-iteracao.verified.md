# Gestão de pessoas — iteração: verificação

**Verdict**: PASS
**Profile**: light
**Diff range**: 9056779..working tree (não commitado: `git diff 9056779` + arquivos não rastreados de `git status --short`)
**Round**: 2 - scoped
**Verifier**: sub-agente independente (author != verifier), somente leitura; o único arquivo escrito é este relatório

Resumo: 32/32 checks com prova completa. Os 8 checks não-PASS da rodada 1 (C4, C5, C9, C10, C12, C14a, C19, C29) foram rejulgados e passam. O gate `npm run verify` passa sem cache (`--force`), com exit 0 e 11/11 tarefas.

## Escopo da rodada 2

Como não há commit, a "fix diff" foi identificada pelos arquivos modificados depois do relatório da rodada 1 (`find -newer .checks/pessoas-gestao-iteracao.verified.md`):

- `apps/backoffice/app/(painel)/pessoas/page.spec.tsx` — C4
- `apps/backoffice/app/(painel)/pessoas/PessoasPage.spec.tsx` — C5, C9, C10, C12 e o teste de C24 da página, agora com a tag
- `apps/backoffice/app/(painel)/pessoas/MembroFormDialog.spec.tsx` — C29
- `packages/ui/src/styles.css` e `packages/ui/src/styles.spec.ts` — C14a
- `packages/ui/src/components/atoms/Cell/Cell.spec.tsx` — novo teste C19
- `packages/ui/src/components/atoms/Cell/Cell.types.ts` — o prettier do gate
- `.checks/pessoas-gestao-iteracao.md` (o checklist) — ganhou duas linhas `Proof:`: `Cell.spec.tsx -t "C19"` e `PessoasPage.spec.tsx -t "C24"`. Nenhuma claim mudou; C14a continua fixando `translate: 100% 0`.

Rejulgados: C4, C5, C9, C10, C12, C14a, C19, C29 e C24 (ganhou uma prova). Os demais checks mantêm o veredito da rodada 1, marcados como "carried from round 1". As citações deles foram atualizadas nos arquivos que a correção tocou, porque os números de linha mudaram.

## Steps not run (profile `light`)

- Step 1 (comparar as fontes binding com o checklist, inclusive o Figma `HQ5Vfbwug9vzIskrlSIXJW`): não executado, pois só roda no profile `ui`.
- Recomputação do `Coverage`, linhas de `Test policy` e step 4 (injeção de falhas): não executados, pois só rodam em `standard`/`ui`.
- Executados: step 2 (todas as provas, re-rodadas por inteiro no working tree atual), step 3 (asserção por check, nos checks rejulgados), gate completo.

## Proofs run — verified at working tree (round 2)

Duas invocações em lote, com `--json --outputFile` para listar cada teste:

- `npm test -w web -- "pessoas/page.spec.tsx" "pessoas/PessoasPage.spec.tsx" "lib/navigation.spec.ts" "lib/format.spec.ts" "app/route-tree.spec.tsx" "membros/\[id\]/inativar/route.spec.ts" "membros/\[id\]/route.spec.ts" "pessoas/MembroFormDialog.spec.tsx" "services/membros.spec.ts" "app/api/membros/route.spec.ts" -t "C[0-9]+|formatTelefone"`: exit 0, 10 suítes, 108 passed, 0 failed.
- `npm test -w @church/ui -- <Tabs, PageHeader, Section, Paginator, Drawer, styles, Cell, MenuDropdown specs> -t "C2|C3|tabs|titleHidden|spans its container|C14a|drawer C14a|menu|C18a|dismissal|C19"`: exit 0, 8 suítes, 57 passed, 194 skipped (pulados pelo filtro `-t`), 0 failed.
- Cruzei cada uma das 45 linhas `Proof:` (arquivo + filtro `-t`) com o JSON. Todas casam com pelo menos 1 teste, e todos esses testes estão `passed`. Nenhum filtro casou com zero testes. Os testes novos desta rodada aparecem individualmente como `passed`:
  - `Cell.spec.tsx` "C19 Esc closes the floating menu and returns focus to its button"
  - `PessoasPage.spec.tsx` "C24 opens the "Adicionar membro" dialog"
  - `styles.spec.ts` "overlay motion resolves in CSS (C35, drawer C14a): motion-safe:animate-drawer-in"

## Checks

| Check | Claim | Evidence file:line + assertion | Result | Origem |
|---|---|---|---|---|
| C1 | h1 no PageHeader, sem `p-6`, sem "Adicionar pessoa"/"Exportar base" | `app/(painel)/pessoas/page.spec.tsx:57` `expect(container.firstElementChild).toBe(screen.getByRole('banner'))`; `:58` `toContainElement(heading)`; `:59` `.not.toHaveClass('p-6')`; `:60-65` botões ausentes | PASS | carried from round 1 (prova re-rodada: passed) |
| C2 | 4 links em ordem em `nav` "Seções de pessoas" | `page.spec.tsx:73-82` `.toEqual([['Membros','/pessoas'],…,['Ministérios','/pessoas?aba=ministerios']])`; `Tabs.spec.tsx:21-30` | PASS | carried from round 1 (re-rodada: passed) |
| C3 | `aria-current="page"` na atual; ausente/desconhecida → Membros | `lib/navigation.spec.ts:143-156`; `Tabs.spec.tsx:37-39`; `page.spec.tsx:83-86` | PASS | carried from round 1 (re-rodada: passed) |
| C4 | `?aba=visitantes`: título e abas continuam, `EmConstrucao` **abaixo** | `page.spec.tsx:99-101` h1 presente; `:102-105` aba `aria-current='page'`; `:108-111` `nav.compareDocumentPosition(emConstrucao) & Node.DOCUMENT_POSITION_FOLLOWING` truthy (vem depois do nav das abas, que fica abaixo do título: C4a); `:112` `getByRole('banner')).not.toContainElement(emConstrucao)`; roda para visitantes, gcs e ministerios | PASS | verified round 2 |
| C4a | `tabs` abaixo do título no PageHeader | `PageHeader.spec.tsx:192-193` | PASS | carried from round 1 (re-rodada: passed) |
| C5 | Busca "Buscar membro" desabilitada, "Adicionar membro" com `add`, sem "Bairro", sem chips Ativo/Inativo, título só acessível | `PessoasPage.spec.tsx:131` `expect(search).toBeDisabled()`; `:132` `toHaveTextContent('add')`; `:133-135` sem `/Bairro/`; `:136-138` sem `'Ativo'`; `:139-141` `queryByRole('button',{name:'Inativo'})).not.toBeInTheDocument()`; `:142-144` heading 'Membros' `toHaveClass('sr-only')`; `Section.spec.tsx` "titleHidden" (2 testes) passed | PASS | verified round 2 |
| C6 | Paginator `w-full` + `justify-between` | `Paginator.spec.tsx:77-80` | PASS | carried from round 1 |
| C7 | 6 cabeçalhos em ordem | `PessoasPage.spec.tsx:194-195` `toHaveLength(labels.length)` + `labels.forEach((label,i)=>expect(headers[i]).toContain(label))` | PASS | carried from round 1 (citação atualizada) |
| C8 | Avatar `PE` + nome | `PessoasPage.spec.tsx:201` `rowOf('Pessoa Exemplo').getByText('PE')` | PASS | carried from round 1 (citação atualizada) |
| C9 | E-mail sobre telefone; `email:null` → **só** o telefone; formatação | `PessoasPage.spec.tsx:210-212` `email.compareDocumentPosition(phone) & DOCUMENT_POSITION_FOLLOWING`; `:213-219` células Contato (`index % 6 === 1`) `.toEqual(['pessoa@example.test(11) 9 0000-0001','0000'])`. O `textContent` da linha com `email: null` (`:43-44`) é exatamente o telefone, sem linha de e-mail nem placeholder; `lib/format.spec.ts:5-11` (5 casos passed) | PASS | verified round 2 |
| C10 | Coluna GC = `a fazer` em toda linha | `PessoasPage.spec.tsx:226` `cells.filter((_, index) => index % 6 === 2)`; `:227` `.toEqual(['a fazer','a fazer'])` (coluna de índice 2 fixada) | PASS | verified round 2 |
| C11 | Coluna Data de ingresso = `a fazer` | `PessoasPage.spec.tsx:233-237` `index % 6 === 3` → `['a fazer','a fazer']` | PASS | carried from round 1 (citação atualizada) |
| C12 | `Badge` **neutro** Ativo/Inativo, mesma classe | `PessoasPage.spec.tsx:246` renderiza a referência `<Badge color="neutral">`; `:249` `expect(ativo.className).toBe(neutral)`; `:250` `expect(inativo.className).toBe(neutral)`. Discrimina: em `packages/ui/src/components/atoms/Badge/Badge.tsx:8`, `neutral` tem classes próprias (`bg-action-primary text-inverse`) | PASS | verified round 2 |
| C13 | "Ver membro"/"Mais ações", sem "Ver perfil" | `PessoasPage.spec.tsx:257-261` | PASS | carried from round 1 (citação atualizada) |
| C14 | Drawer com nome, situação, Editar, Informações de Contato, Telefone/E-mail/Endereço | `PessoasPage.spec.tsx:276-285` | PASS | carried from round 1 (citação atualizada) |
| C14a | `motion-safe:animate-drawer-in`; `drawer-in` parte de `translate: 100% 0`; inline não anima | `Drawer.spec.tsx:260` `toHaveClass('motion-safe:animate-drawer-in')`; `:264-266` inline `.not.toHaveClass(...)`; `styles.spec.ts:835` `[DRAWER_SLIDE, 'drawer-in 250ms ease-out', 'translate', '100% 0']` com `:856` `expect(start).toBe(from)`, e `:849-855` media `prefers-reduced-motion: no-preference` + animação resolvida; código `packages/ui/src/styles.css:266-270` `@keyframes drawer-in { from { translate: 100% 0; } }`. Não resta `calc(100% + 1.5rem)` em `packages/ui/src` | PASS | verified round 2 |
| C15 | Editar no drawer fecha e abre "Editar membro" | `PessoasPage.spec.tsx:301-307` | PASS | carried from round 1 (citação atualizada) |
| C16 | Esc fecha o drawer, foco em "Ver membro" | `PessoasPage.spec.tsx:319-322` | PASS | carried from round 1 (citação atualizada) |
| C17 | Rota `pessoas/[id]` não existe | `app/route-tree.spec.tsx:50` | PASS | carried from round 1 |
| C18 | Menu com Editar/Inativar neutros | `PessoasPage.spec.tsx:333-339` (`toEqual(['editEditar','person_offInativar'])`, `toHaveClass('text-primary')`, `.not.toHaveClass('text-danger')`); `Cell.spec.tsx:376-385` | PASS | carried from round 1 (citação atualizada) |
| C18a | `strategy="fixed"`: posição e `onSelect` | `MenuDropdown.spec.tsx:280-289` | PASS | carried from round 1 |
| C19 | Esc fecha o menu e devolve o foco ao trigger | `Cell.spec.tsx:388-411` (novo, `strategy="fixed"` via `Cell`): `:405-407` menu `toHaveClass('fixed')`; `:408` `keyboard('{Escape}')`; `:410` `queryByRole('menu')).not.toBeInTheDocument()`; `:411` `expect(trigger).toHaveFocus()`; e `MenuDropdown.spec.tsx:186-193` "dismissal (C83)" no padrão `absolute` | PASS | verified round 2 |
| C20 | Editar no menu abre "Editar membro" do membro | `PessoasPage.spec.tsx:352-355` | PASS | carried from round 1 (citação atualizada) |
| C21 | Inativar: POST sem diálogo, toast, recarga; BFF → `/admin/membros/:id/inativar` | `PessoasPage.spec.tsx:372-385`; `app/api/membros/[id]/inativar/route.spec.ts:12,35-40` | PASS | carried from round 1 (citação atualizada) |
| C22 | Inativar desabilitado para inativo | `PessoasPage.spec.tsx:392` `toBeDisabled()` | PASS | carried from round 1 (citação atualizada) |
| C23 | Falha: sem toast e sem recarga; 204 recarrega | `PessoasPage.spec.tsx:417-418`, `:436-437` | PASS | carried from round 1 (citação atualizada) |
| C24 | "Adicionar membro" abre o Dialog com 17 campos + Cancelar/Salvar | `MembroFormDialog.spec.tsx:114-125` (inalterado); clique na página: `PessoasPage.spec.tsx:442-451` "C24 opens the "Adicionar membro" dialog" `getByRole('dialog',{name:'Adicionar membro'})).toBeInTheDocument()`, agora com a tag e listado em `Proof:` | PASS | verified round 2 (a nota 10 da rodada 1 foi resolvida) |
| C25 | Erro inline por campo, serviço não chamado | `MembroFormDialog.spec.tsx:147-156`, `:167-168` | PASS | carried from round 1 |
| C26 | `yyyy/MM/dd`, trava, fecha, toast, `onSaved` | `MembroFormDialog.spec.tsx:185-199`; `app/api/membros/route.spec.ts:160-161`; `services/membros.spec.ts:81-84` | PASS | carried from round 1 |
| C27 | Carregamento, campos mapeados de `_`, 204 fecha | `MembroFormDialog.spec.tsx:213-239`; `app/api/membros/[id]/route.spec.ts:46-61,69` | PASS | carried from round 1 |
| C28 | PATCH com genero/endereco, toast, `onSaved` | `MembroFormDialog.spec.tsx:253-263`; `app/api/membros/[id]/route.spec.ts:122-125` | PASS | carried from round 1 |
| C29 | Falha: dialog aberto, valores preservados, **botões** reabilitados, sem toast | `MembroFormDialog.spec.tsx:276` `waitFor(() => expect(salvar()).toBeEnabled())`; `:277` `getByRole('button',{name:'Cancelar'})).toBeEnabled()`; `:278` dialog presente; `:279` Nome `toHaveValue('Pessoa Exemplo')`; `:280-282` onClose/onSaved/`toast.success` não chamados | PASS | verified round 2 |

Totais: PASS 32 · PARTIAL 0 · FAIL 0 · total 32.

## Swept rows marked `existing` — carried from round 1

A correção não tocou nenhum arquivo citado (`pessoas/page.tsx`, rotas BFF, `lib/server/backend.ts`, `lib/server/pessoaRoute.ts`, `lib/http.ts`). Os resultados da rodada 1 continuam valendo: authorization **Confirmed**, external-dependency failure **Confirmed**.

## Gate — verified round 2

`rtk proxy npm run verify` (raiz): exit 0, `Tasks: 11 successful, 11 total`, mas `Cached: 11 cached`. Re-rodei com `rtk proxy npm run verify -- --force`: **PASS**, exit 0, `Tasks: 11 successful, 11 total`, `Cached: 0 cached, 11 total`.

- `@church/ui:test`: 55 suítes, 1056 passed. O +1 em relação à rodada 1 é o novo C19 em `Cell.spec.tsx`.
- `web:test`: 24 suítes, 223 passed.
- typecheck e lint em todos os workspaces: OK. O erro `prettier/prettier` em `Cell.types.ts` sumiu; a união agora está numa linha só, em `packages/ui/src/components/atoms/Cell/Cell.types.ts:30`.
- Os `console.error` na saída são toasts esperados de `lib/http.ts:17`, nos testes de falha. Não são falhas.

## Gaps (ranked)

Nenhum. Os gaps 1 a 10 da rodada 1 estão fechados:

1. Gate verde: `Cell.types.ts:30`.
2. C14a: `styles.css:268` e `styles.spec.ts:835` usam `100% 0`.
3. C10: `PessoasPage.spec.tsx:226-227`.
4. C12: `:246-250`.
5. C4: `page.spec.tsx:108-112`.
6. C19: `Cell.spec.tsx:388-411`.
7. C9: `PessoasPage.spec.tsx:213-219`.
8. C29: `MembroFormDialog.spec.tsx:277`.
9. C5: `PessoasPage.spec.tsx:139-141`.
10. C24 da página: agora tem tag e prova.

Nota, sem efeito no veredito: o checklist ganhou duas linhas `Proof:` depois da rodada 1 (C19 `Cell.spec.tsx -t "C19"`, C24 `PessoasPage.spec.tsx -t "C24"`). Só se acrescentaram provas; nenhuma claim mudou.

Dados: todas as fixtures citadas são sintéticas (`Pessoa Exemplo`, `000.000.000-00`, `@example.test`). Nenhum dado pessoal real foi usado nesta verificação.
