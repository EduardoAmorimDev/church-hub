# Writing the PR body

Load this from step 5 of `SKILL.md`, before writing the body.

**Contents:** What makes a review fast · The template · Section by section ·
Assumptions are labelled · Anti-patterns · The AI trailer · Illustrative
example · Length

The guidance here is in EN-US; **everything it tells you to emit is Brazilian
Portuguese.** The template below is the artefact, so it is written in the
language it ships in — do not translate it into English on the way out. The
PT-BR rule is a project decision, not a description of past practice.

## What makes a review fast

A reviewer arrives with one question: *where do I need to look carefully?* The
body earns its keep by answering that before they open the diff. Four questions,
in this order, and the order matters because each one narrows the next:

1. **Which problem or need?** Without it, every design choice below looks
   arbitrary and the reviewer re-derives the motivation from the code.
2. **What changed, and where?** Named files and symbols, grouped by concern —
   not a translation of the diff into prose.
3. **What was deliberately left out?** The single highest-value section, and the
   one almost always missing. It is what prevents a reviewer spending their
   attention raising something already considered and rejected.
4. **How was it verified?** With real numbers, so the claim is checkable.

A body that answers these lets a reviewer skip the parts that are mechanical and
concentrate on the two or three places where judgement was exercised. A body
that restates the diff makes them read everything twice.

## The template

```markdown
## Resumo

<Um parágrafo: o problema ou a necessidade, e a forma da solução. Se for
correção, o sintoma observável vem antes da causa.>

## Causa raiz

<Só para correção com causa não óbvia. Nomeie o mecanismo, não o arquivo:
"a variante recebia a classe do token de cor antigo, então o hover nunca
mudava de tom".>

## O que mudou

- **`packages/ui/src/components/atoms/Exemplo/Exemplo.tsx`** — o que passou a fazer e
  por quê.
- **`OutroSímbolo`** (`packages/tokens/src/colors.ts`) — idem. Agrupe por
  preocupação, não por arquivo, quando vários arquivos servem a mesma mudança.

## Fora de escopo (avaliado e descartado)

- <O que foi considerado e deliberadamente não entrou, com o motivo em uma
  linha. Se não houver nada, diga isso explicitamente.>

## Issue

Closes #<N>

## Test plan

- [x] `npm run verify` (turbo: `typecheck`, `lint`, `test`)
  - `typecheck` — sem erros
  - `lint` — <N> warnings (o ESLint aqui só emite warnings); <N> novos neste diff
  - `test` — `Test Suites: <N> passed, <N> total` / `Tests: <N> passed, <N> total`
- [ ] Revisão visual no Storybook — não verificado nesta sessão
```

Drop any section that has no content — an empty `## Causa raiz` is noise, and
`## Issue` goes away when no issue was given — with one exception: **`Fora de
escopo` is never dropped.** When nothing was excluded, say so in one line
("Nada foi deixado de fora: a mudança é o escopo inteiro da issue"). A reviewer
cannot tell the difference between "nothing was excluded" and "nobody thought
about it" unless it is written down.

## Section by section

**`## Resumo`.** One paragraph. For a fix, lead with the observable symptom, not
the code: *"O foco do teclado sumia ao fechar o Tooltip"* orients a reviewer
instantly, where *"corrige o handler de blur"* does not. For a feature, lead
with what a user (or a consumer of the design system) can now do. For a
refactor, lead with the duplication or the coupling being removed, and give the
net effect in numbers if you have them (lines removed vs added, files
eliminated).

**`## Causa raiz`.** Only when a fix had a cause that is not obvious from the
change. Name the mechanism and why it was invisible. This is the section that
tells a reviewer whether the fix addresses the cause or a symptom — which is the
main thing worth reviewing in a bug fix.

**`## O que mudou`.** Bullets, one per concern, bolded file or symbol first.
Group by concern rather than by file: a component, its stories and its spec
that serve one change are one bullet, and one file that changed for two
unrelated reasons is two. Where a decision was made — a value kept, a default
chosen, an exclusion — say why in the same bullet; that is where a reviewer's
question would otherwise go. When the change touches more than one workspace
(`apps/web`, `apps/native`, `packages/tokens`), say which, because a token
change reaches every consumer.

**`## Fora de escopo (avaliado e descartado)`.** Each line: what, and why not.
Adjacent code that looks like it should have changed and did not; a
generalisation considered and rejected as premature; a counterpart in
`apps/native` not done yet; a move into a shared package deferred. If the scope
was narrowed at someone's request, say whose.

**`## Issue`.** Only when the user gave an issue (step 7 of `SKILL.md`). One
line, `Closes #N` — or `Refs #N` when the issue must stay open after merge.
Never paste the issue's body.

**`## Test plan`.** Checkboxes, and a checked box is a claim that the command
ran in this session. Quote the real counts from the Jest summary in the verify
log (`Test Suites: N passed, N total` / `Tests: N passed, N total` — prefixed
with `web:test:` by turbo, so match them unanchored), because a number is
checkable and "testes passando" is not. Say whether turbo replayed a cached
result. Anything not executed stays unchecked with a note saying so — the
strongest form is naming who has to do it. Where a regression was actually
proven (the old implementation fails the new specs), say that and give the
count: it is the difference between specs that describe the new code and specs
that catch the bug.

Every count here comes from a command run in this session. A figure carried
over from the issue, a review or an earlier body is re-derived before it is
repeated and corrected in place if it differs; one that cannot be derived is
dropped or replaced by the measurement actually taken, named with its unit
("4 arquivos importam o componente", not "4 consumidores") — an unqualified
count is unfalsifiable at the next reading.

## Assumptions are labelled, not smoothed over

Stick to what was actually established while doing the work. Where something was
reasoned to rather than verified — "nenhum outro componente passa essa prop",
"o `apps/native` não consome este token" — say so in the body, in those words,
and name what was checked to conclude it, so a reviewer can disagree with the
check rather than with the conclusion.

The reason is asymmetric cost. An assumption presented as a fact costs the
reviewer the one thing the body was supposed to give them — the ability to aim
their attention — because they cannot see which claims were tested. An
assumption labelled as one is often the most useful line in the body: it tells
the reviewer precisely where to look.

## Anti-patterns

- **Restating the diff.** "Adiciona a prop `x` ao componente `y`" tells a
  reviewer what they can already see, and buries what they cannot: why.
- **A checked box for something not run.** It converts the test plan from
  evidence into decoration, and the next reader cannot tell which boxes to
  trust.
- **Literal data.** Never a member's name, contact, document number, religious
  or other sensitive personal data, a token, a key or a `.env` value — even
  from a fixture. The body is visible to everyone with repository access and is
  quoted into notification emails (Principle V). Name the field and the line;
  never the value.
- **Generic praise or padding.** "Melhora a qualidade do código", "refatora para
  ficar mais limpo". If the benefit cannot be named concretely, the bullet is
  not carrying information.
- **A wall of prose.** Bullets with bolded anchors are scannable; five
  paragraphs are not. A reviewer reads the body under time pressure.
- **An inference written as a verified fact.** See the section above; this is
  the same defect as a checked box for something not run, one level up.
- **Silence about a conflict or a large distance from the base.** If
  `merge-tree` reports a conflict, or the branch is far behind, say so in the
  body. The reviewer finds out anyway, and finding out from the body costs them
  nothing.

## The AI trailer

Close the body with the trailer the harness specifies for AI-assisted work — as
of this writing:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Use whatever the current harness instruction states rather than this literal
string. Principle X makes AI involvement something a reviewer should see rather
than infer — the same reasoning that puts a `Co-Authored-By` trailer on the
commits.

## Illustrative example

**Not a real PR** — an invented change, written to show the shape for this
repository. The file paths follow the real layout; the Switch component, the
issue number and every count are illustrative. Note how the summary states the
need, `O que mudou` is grouped by concern, the out-of-scope list names what a
reviewer would otherwise ask about, and every test-plan line names what was
observed.

Title: `✨ feat(ui/atoms/switch): adds switch atom`

```markdown
## Resumo

Os formulários de cadastro precisam de um controle liga/desliga que o design
system ainda não oferece — hoje cada tela improvisaria um `Checkbox` estilizado.
Este PR adiciona o átomo `Switch`, com os estados do Figma (padrão, hover,
foco, desabilitado) e acessível por teclado.

## O que mudou

- **`Switch`** (`packages/ui/src/components/atoms/Switch/Switch.tsx`) — `<button
  role="switch">` com `aria-checked`, controlado (`checked` + `onCheckedChange`)
  ou não controlado (`defaultChecked`). As variantes usam `tailwind-variants` e
  cores de `@church/tokens`, sem valor fixo. Não usa Radix: um `button` nativo
  cobre o comportamento sem dependência nova.
- **Stories** (`Switch.stories.tsx`) — um story por estado, para a revisão
  visual no Storybook.
- **Spec** (`Switch.spec.tsx`) — alternância por clique, por `Espaço` e por
  `Enter`; `onCheckedChange` não dispara quando desabilitado; `aria-checked`
  acompanha o estado nos modos controlado e não controlado.

## Fora de escopo (avaliado e descartado)

- Versão para `apps/native`: fica para quando o design system for centralizado
  num pacote compartilhado, para não duplicar o componente agora.
- Integração com `react-hook-form`: nenhum formulário usa o `Switch` ainda; o
  adaptador entra com o primeiro consumidor.

## Issue

Closes #12

## Test plan

- [x] `npm run verify` (turbo: `typecheck`, `lint`, `test`) — sem cache
  - `typecheck` — sem erros
  - `lint` — 0 warnings novos neste diff
  - `test` — `Test Suites: 4 passed, 4 total` / `Tests: 94 passed, 94 total`
- [ ] Revisão visual no Storybook contra o Figma — a fazer pelo revisor

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**An example attributed to a real artefact is either verbatim (trimmed only) or
labelled as adapted, never quietly normalised to the rule it illustrates.** This
one is attributed to nothing, which is why it says so at the top. Replace it
with a real PR from this repository, quoted verbatim, once one exists that fits
the template well.

## Length

Match the body to the change, not to a target. A one-file fix gets a summary and
a test plan and nothing else; a refactor across workspaces earns grouped bullets
and an explicit out-of-scope list. The test: **every sentence either tells a
reviewer where to look or answers a question they would otherwise ask.** Cut the
rest.
