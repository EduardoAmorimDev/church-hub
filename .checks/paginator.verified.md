# Paginator Verification

**Verdict**: PASS
**Profile**: light
**Diff range**: a66a5cd..5451980 (HEAD `54519802c96282d7388746baea30cfb5e71c1f33`, branch `feat/paginator`)
**Round**: 2 - scoped (fix diff `c404ba0..5451980`; round 1 verified at `c404ba0`)
**Verifier**: independent sub-agent (author != verifier)

Commits in range: `617eb91` (task + checklist), `24c8926` (select field ring), `c404ba0` (Paginator
component), `b59433b` (extracts `LabeledControl`), `5451980` (tightens C4/C16 assertions, commits the
round 1 report).
All proofs were re-run at `5451980`. The working tree was clean before and after (`git status --porcelain` empty).

## Scope of this round - verified at 5451980

Fix diff `c404ba0..5451980` touches only `apps/web/components/molecules/Paginator/`:
`Paginator.spec.tsx` (+11), `components/LabeledControl.tsx` (new, 27 lines),
`components/PageJumpField.tsx`, `components/PageSizeSelect.tsx`, `components/index.ts` (+1 export).
`Paginator.tsx`, `Paginator.styles.ts`, `Paginator.stories.tsx` and `Paginator.types.ts` are untouched
(`git diff --stat c404ba0..HEAD` on those files is empty).

**Refactor `b59433b` preserves behaviour.** `LabeledControl` renders the same tree that both callers
rendered inline before: `div.cluster` > `Typography as="label"` (`supportingText`, `variant="p3"`,
`htmlFor={id}`) followed by the control, which receives the same `id` through a render prop
(`LabeledControl.tsx:15-25`). `useId` moved from each caller into `LabeledControl`, still one id per
instance. The control subtrees did not change: `selectBox > select + Icon` and `Field` keep the same
props, so the `parentElement` reads in C4 (`spec:129`, `:139-140`) still reach the same nodes. All
three files sit under the `'use client'` boundary of `Paginator.tsx:1`, so a function passed as
`children` is never serialized. Effect on the checks that depend on the refactored code:

- C1: labels still precede their controls in document order (`expectInDocumentOrder`, `spec:58`).
- C5, C10, C11, C12, C13, C14: label association (`htmlFor` = control `id`) is unchanged, so
  `getByLabelText('Linhas:')` / `getByLabelText('Ir para página:')` and
  `getByRole('combobox'|'textbox', { name })` resolve as before. None of these assertions was edited.
  They all pass at `5451980`.

## Binding sources - carried from c404ba0

Not run under `light`. Figma node `13607:2572` was not opened. C1, C4 and C5 are verified against the
checklist only. The fix does not change the interface (same DOM, same labels), so step 1 would not
re-open in a scoped round anyway.

## Proof run - verified at 5451980

- Jest, one invocation from the repo root:
  `npm test -w web -- components/molecules/Paginator/Paginator.spec.tsx --json --outputFile=<scratch>/r2.json`
  -> exit 0, 24 tests, 24 passed, 0 failed, 0 pending. Each test reported `passed`: C1, C2, C3, C4, C5,
  C6, C7, C8, C9 x4 (`page 15 of 300`, `page 1 of 300`, `page 30 of 300`, `page 1 of 20`), C10, C11,
  C12 x5 (`"0"`, `"31"`, `"2.5"`, `"abc"`, `""`), C13, C14, C15, C16, C17.
- C4 grep, run exactly as written:
  `! grep -nE -- '-\[[0-9#]|style=' .../Paginator.tsx .../Paginator.styles.ts .../components/*.tsx`
  -> exit 0, no output. The glob now also covers the new `LabeledControl.tsx`.
- Existence (`rg` is not installed; `grep -nE "it(\.each)?\("`): test names at `Paginator.spec.tsx`
  lines 41, 74, 85, 91, 143, 156, 168, 179, 204/209, 215, 229, 242, 260, 277, 289, 306, 341.

All paths below are relative to `apps/web/components/molecules/Paginator/`. Citations were refreshed
at `5451980`. Lines after `:103` moved +1, and lines after the C16 insertion moved +11.

## Checks - verified at 5451980

| Check | Claim | Proof run | Evidence | Result |
|---|---|---|---|---|
| C1 | layout order, select 10, counter, pages 1 2 3 with 1 current, empty jump field | `C1 renders the designed layout` passed | `Paginator.spec.tsx:47` `expect(sizeSelect).toHaveValue('10')`; `:48` `expect(jumpField).toHaveValue('')`; `:49` `toEqual(['1','2','3'])`; `:50-53` Página 1 `toHaveAttribute('aria-current','page')`; `:58-71` `expectInDocumentOrder([Linhas:, select, counter, Primeira, Anterior, Página 1..3, Próxima, Última, 'Ir para página:', field])` (helper `:30-36`) | PASS |
| C2 | 291-295 de 295 itens; 28 29 30, 30 current | `C2 partial last page` passed | `:77` `getByText('291-295 de 295 itens')`; `:78` `toEqual(['28','29','30'])`; `:79-82` Página 30 `aria-current="page"` | PASS |
| C3 | "1-1 de 1 item" | `C3 singular counter` passed | `:88` `expect(screen.getByText('1-1 de 1 item')).toBeInTheDocument()` | PASS |
| C4 | token classes, ghost/small nav icons, chevron, no arbitrary values | `C4 design tokens` passed + grep exit 0 | `:97-103` current `toHaveClass('min-w-8','rounded-lg','inset-ring','inset-ring-neutral-999','text-neutral-100')`; **`:104` `expect(current).not.toHaveClass('text-neutral-83')`** (new); `:105-106` other `toHaveClass('min-w-8','rounded-lg','text-neutral-83')` / `not.toHaveClass('inset-ring-neutral-999')`; `:117-118` nav `toHaveClass('p-2','rounded-lg','bg-neutral-alpha/10')` + `toHaveTextContent(icon)` for `first_page/chevron_left/chevron_right/last_page`; `:122-125` labels + counter `toHaveClass('text-size-25','text-neutral-67')`; `:131-137` select box `toHaveClass('w-17','h-8','rounded-lg','inset-ring-neutral-33')` + `toHaveTextContent('keyboard_arrow_down')`; `:138-140` field wrapper `toHaveClass('w-17','h-8','rounded-lg')` | PASS (notes 3, 4) |
| C5 | `<nav aria-label="Paginação">`, "Página N", select/field by label | `C5 accessible names` passed | `:146-148` navigation `tagName` `toBe('NAV')`; `:149` `getByLabelText('Linhas:').tagName` `toBe('SELECT')`; `:150` `getByLabelText('Ir para página:').tagName` `toBe('INPUT')`; `:151-153` buttons Página 1/2/3 | PASS |
| C6 | page 5/30: 1, 4, 6, 30 once per click | `C6 navigation buttons` passed | `:165` `expect(onPageChange.mock.calls).toEqual([[1],[4],[6],[30]])` | PASS |
| C7 | click 2 emits 2 once; click 1 emits nothing | `C7 page buttons` passed | `:173` `not.toHaveBeenCalled()`; `:176` `toEqual([[2]])` | PASS |
| C8 | edges disabled, clicking emits nothing | `C8 disabled at the edges` passed | `:186` start `toBeDisabled()`; `:189` `first.onPageChange` `not.toHaveBeenCalled()`; `:196` end `toBeDisabled()`; `:201` `last.onPageChange` `not.toHaveBeenCalled()` | PASS |
| C9 | window 15->14 15 16; 1->1 2 3; 30->28 29 30; 2 pages->1 2 | `C9 page window` x4 passed | `:205-208` table rows; `:212` `expect(pageButtonLabels()).toEqual(expected)` | PASS |
| C10 | 17+Enter emits 17 once and clears; 1+Enter emits nothing | `C10 jump to page` passed | `:221` after `'1{Enter}'` `not.toHaveBeenCalled()`; `:225` `toEqual([[17]])`; `:226` `expect(field).toHaveValue('')` | PASS |
| C11 | field + label with 60 items, absent with 50 | `C11 jump field threshold` passed | `:231-234` label and textbox present (60); `:238-239` `queryByText('Ir para página:')` / `queryByRole('textbox')` `not.toBeInTheDocument()` (50) | PASS |
| C12 | 0, 31, 2.5, abc, empty: no emit, `aria-invalid="true"` until next keystroke | `C12 invalid jump input` x5 passed | `:242` `it.each(['0','31','2.5','abc',''])`; `:252` `not.toHaveBeenCalled()`; `:253` `toHaveAttribute('aria-invalid','true')`; `:256` after `'5'` `not.toHaveAttribute('aria-invalid')` | PASS |
| C13 | defaults 10 20 50; choosing 20 emits size 20 once and page 1 once | `C13 page size options` passed | `:265-269` options `toEqual(['10','20','50'])`; `:273` `toEqual([[20]])`; `:274` `toEqual([[1]])` | PASS |
| C14 | pageSize 15 shows 15, lists 10 15 20 50 | `C14 page size outside the options` passed | `:281` `toHaveValue('15')`; `:282-286` options `toEqual(['10','15','20','50'])` | PASS |
| C15 | 0 items: "0 itens", no page buttons, no jump field, 4 nav disabled, Linhas enabled | `C15 empty list` passed | `:292` `getByText('0 itens')`; `:293` `toEqual([])`; `:294` textbox absent; `:295-302` 4 nav `toBeDisabled()`; `:303` combobox `toBeEnabled()` | PASS |
| C16 | page 40 -> 30 + 291-300; page 0 -> 1 + 1-10; no emit on render; pageSize 0 = empty list, no NaN/Infinity | `C16 out-of-range props` passed | `:308-312` `'291-300 de 300 itens'` + Página 30 current; `:313` `not.toHaveBeenCalled()`; `:317-321` `'1-10 de 300 itens'` + Página 1 current; `:322` `not.toHaveBeenCalled()`; pageSize 0: `:326` `'0 itens'`; `:327` `toEqual([])`; **`:328` `queryByRole('textbox')` `not.toBeInTheDocument()`; `:329-336` 4 nav buttons `toBeDisabled()`; `:337` `getByRole('combobox',{name:'Linhas:'})` `toBeEnabled()`** (new); `:338` `not.toMatch(/NaN\|Infinity/)` | PASS |
| C17 | default story design URL -> `13607-2572`; Table + Paginator story, 30 synthetic rows, Página 2 -> rows 11-20 and "11-20 de 30 itens" | `C17 stories` passed | `:344` `toContain('node-id=13607-2572')`; `:346` `expect(WithTable.render).toBeDefined()`; `:350` `getByText('11-20 de 30 itens')`; `:352-359` rows 11 and 20 present, 10 and 21 absent | PASS (note 2) |

### Round 1 findings re-judged

1. **C16 precision gap / partial evidence: closed at `5451980`.** For `pageSize=0`, the proof now
   asserts every property of C15's empty list: counter (`:326`), no page buttons (`:327`), no jump
   field (`:328`), 4 nav buttons disabled (`:329-336`), "Linhas:" enabled (`:337`). These are the
   same assertions as C15 `:292-303`. The checklist wording "as the empty list" is now pinned by the
   proof to C15's definition.
2. **C17 weak link between story and proof: carried from c404ba0, still open (non-blocking).**
   `Paginator.spec.tsx:346` asserts only `WithTable.render` `toBeDefined()`. The test renders
   `PaginatedTableExample` directly, and the link to the story rests on reading
   `Paginator.stories.tsx:101`. Not touched by the fix.
3. **C4 current-page color asserted by presence only: closed at `5451980`.**
   `Paginator.spec.tsx:104` `expect(current).not.toHaveClass('text-neutral-83')` now fails if the
   compound variant stops overriding the base color, or if tailwind-merge order regresses.
   (Fault injection does not run under `light`, so this new surface has not been made to fail.)
4. **C4 grep narrowing: carried from c404ba0, still open (non-blocking).** The pattern `-\[[0-9#]`
   misses arbitrary values that start with a letter. The wider sweep `grep -nE '\[[^]]*\]'` over the
   component sources, including the new `LabeledControl.tsx`, still finds only
   `transition-[box-shadow]` at `Paginator.styles.ts:16` (a transition property, not a color, size or
   spacing). The fix added no new arbitrary values.
5. **C4 icon deviates from the binding design: carried from c404ba0, still open (non-blocking).**
   The chevron is `keyboard_arrow_down` instead of Figma's `expand_more`, because
   `material-symbols@0.40.2` has no `expand_more`. A design owner should accept this. Not touched by
   the fix (the icon line only moved into the render prop, `PageSizeSelect.tsx:34`).
6. Observation, not a finding: `LabeledControl` is a private subcomponent with no spec of its own,
   like `PageSizeSelect` and `PageJumpField` in round 1. `Paginator.spec.tsx` covers it
   (C1/C4/C5/C11/C13).

## Swept - carried from c404ba0

No `existing` rows. Each row maps to checks or is marked "not in scope" (policy the user approved).
The fix adds no branch, I/O or state.

## Coverage - carried from c404ba0

Not run under `light`. The fix adds no member to any set: the refactor adds no branches, and the spec
changes add assertions only.

## Test policy rows - carried from c404ba0

Not run under `light`. The checklist has no `## Test policy` section.

## Faults injected - carried from c404ba0

Not run under `light`. Neither the new assertions (`:104`, `:328-337`) nor any other has been made to fail.

## Gate - verified at 5451980

`npm run verify -- --force` -> exit 0.
- `Tasks: 7 successful, 7 total`, `Cached: 0 cached, 7 total`
- web:test: `Test Suites: 4 passed, 4 total` / `Tests: 106 passed, 106 total`
- typecheck: no errors
- lint warnings appear only in files outside the diff, the same three as round 1:
  `apps/native/index.js`, `apps/native/nativewind-env.d.ts`, `apps/web/next-env.d.ts`. None of the
  files in the fix diff has a warning.
