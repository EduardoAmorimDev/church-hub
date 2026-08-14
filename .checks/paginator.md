# Paginator

Sources:

- `.tasks/paginator.md` - criteria 1-17, out of scope, decided rows; all Unresolved closed by the user on 2026-10-04
- Figma, Lamb Design System, "Paginação" node `13607:2572` - **binding for the interface**, except "Ir para página:", which is a numeric field by user decision (the Figma still shows a select)
- conversation 2026-10-04 - native `<select>` for "Linhas:"; numeric field shown only with 6+ pages; Enter confirms; invalid input rejected with `state="error"`; field starts empty and clears after navigating
- `docs/constitution.md` - spec + story (I), atomic layout (II), tokens only (IV), boundary cases (VIII)

Profile: `light` (no `tlc-implement` profile declared in `AGENTS.md`).

## Out of scope

- Styled open list ("Menu dropdown") for "Linhas:" - native `<select>` decided
- Pagination prop inside `Table`, row slicing, URL sync, loading state - consumer's job (task, Out of scope)
- Ellipsis / page ranges, narrow layout, `apps/native`
- Fixing `Button` ignoring `variant` - observed, untouched

## Landing

New molecule `apps/web/components/molecules/Paginator` composing `IconButton`, `Icon`, `Typography`
and `Field` (reused as-is for "Ir para página:"); page buttons extend `buttonBase` from the `Button`
atom instead of restyling a button. The "Linhas:" select reuses the field ring from
`components/utils/fieldRingStyles.ts`. `Table` is untouched.

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| Public API, controlled and 1-based | `PaginatorProps = { page; pageSize; totalItems; onPageChange(page); onPageSizeChange(pageSize); pageSizeOptions?: ReadonlyArray<number>; className? }` | uncontrolled state - cannot follow server pagination; 0-based - does not match the shown/typed number (tanstack users convert with `page - 1`) |
| `Paginator` is a sibling of `Table` | `<Table rows={pageRows} />` then `<Paginator />` | `pagination` prop on `Table` - `Table` would own totals and slicing |
| Name and level | `Paginator` in `~/components/molecules/Paginator` | organism - it composes only atoms and native controls |
| First native `<select>` in the DS, styled with the shared field ring | `FieldControlTag` gains `'select'`: `inset-ring inset-ring-neutral-33 has-[select:focus]:inset-ring-2 has-[select:focus]:inset-ring-neutral-999` | a ring constant private to `Paginator` - forks the field focus look the next select would copy |

- Nothing else in this change is hard to reverse

## Handoff

One batch: S1-S4 read ~29 KB of existing files (~7k tokens) plus ~20 KB of new files (~5k) - far under 150k, all in `molecules/Paginator`. No handoff.

Settled mid-build:

- C4 icon: `material-symbols@0.40.2` has no `expand_more` in its `MaterialSymbol` type (tsc TS2820); the chevron uses `keyboard_arrow_down`, the same down-chevron `NavItem` already renders. Claim otherwise unchanged.
- C4 grep proof: the first command matched array literals (`[10, 20, 50]`) and the spec's fixtures, not classes; narrowed to arbitrary values after a utility prefix (`-[` + digit/`#`) in the component sources. Claim unchanged.
- C17 proof: `composeStories` from `@storybook/nextjs` cannot load under this Jest config (ESM, outside `transformIgnorePatterns`); the story's render component is exported as `PaginatedTableExample` (listed in `excludeStories`) and rendered directly. Jest config untouched.

## Checks

Spec file for every proof below: `apps/web/components/molecules/Paginator/Paginator.spec.tsx`,
run as `npm test -w web -- components/molecules/Paginator/Paginator.spec.tsx -t "<name>"`.

### S1 - Shows the current position · new files + 4 atoms · ~29 KB · ~7k

**C1** - page=1, pageSize=10, totalItems=300 renders, in order: "Linhas:" select showing 10, "1-10 de 300 itens", Primeira/Anterior, pages 1 2 3 with 1 `aria-current="page"`, Próxima/Última, "Ir para página:" with an empty field
Proof: `-t "C1 renders the designed layout"`

**C2** - page=30, pageSize=10, totalItems=295 shows "291-295 de 295 itens" and pages 28 29 30 with 30 current
Proof: `-t "C2 partial last page"`

**C3** - totalItems=1 shows "1-1 de 1 item"
Proof: `-t "C3 singular counter"`

**C4** - Figma tokens: current page `inset-ring-neutral-999 text-neutral-100`, other pages `text-neutral-83`, page buttons `min-w-8 rounded-lg`; nav buttons are ghost/small `IconButton` with `first_page` `chevron_left` `chevron_right` `last_page`; labels and counter `text-size-25 text-neutral-67`; select and field `w-17 h-8 rounded-lg`, select with the chevron `keyboard_arrow_down` (Figma's `expand_more`; see Handoff)
Proof: `-t "C4 design tokens"`
Proof: `! grep -nE -- '-\[[0-9#]|style=' apps/web/components/molecules/Paginator/Paginator.tsx apps/web/components/molecules/Paginator/Paginator.styles.ts apps/web/components/molecules/Paginator/components/*.tsx`

**C5** - root is `<nav aria-label="Paginação">`, page buttons are named "Página N", select and field are found by "Linhas:" and "Ir para página:"
Proof: `-t "C5 accessible names"`

### S2 - Navigates between pages · same files · ~0 new

**C6** - at page 5 of 30, Primeira/Anterior/Próxima/Última emit 1, 4, 6, 30, once per click
Proof: `-t "C6 navigation buttons"`

**C7** - at page 1, clicking 2 emits 2 once; clicking 1 emits nothing
Proof: `-t "C7 page buttons"`

**C8** - first/prev disabled at page 1 and next/last disabled at the last page, and clicking them emits nothing
Proof: `-t "C8 disabled at the edges"`

**C9** - window: page 15/30 -> 14 15 16; page 1 -> 1 2 3; page 30 -> 28 29 30; 2 pages -> 1 2
Proof: `-t "C9 page window"`

**C10** - typing 17 + Enter emits 17 once and empties the field; typing 1 (current) + Enter emits nothing
Proof: `-t "C10 jump to page"`

**C11** - the field and its label render with 6 pages (totalItems=60) and not with 5 (totalItems=50)
Proof: `-t "C11 jump field threshold"`

**C12** - Enter with 0, 31, 2.5, abc or empty emits nothing and sets the field `aria-invalid="true"` (Field `state="error"`) until the next keystroke
Proof: `-t "C12 invalid jump input"`

### S3 - Changes the page size · same files

**C13** - default options are 10, 20, 50; choosing 20 emits `onPageSizeChange(20)` once and `onPageChange(1)` once
Proof: `-t "C13 page size options"`

**C14** - pageSize=15 with options [10, 20, 50] shows 15 and lists 10, 15, 20, 50
Proof: `-t "C14 page size outside the options"`

### S4 - Limits and use with the Table · + Table story ~5 KB

**C15** - totalItems=0 shows "0 itens", no page buttons, no jump field, the 4 nav buttons disabled, "Linhas:" enabled
Proof: `-t "C15 empty list"`

**C16** - page=40 shows 30 and "291-300 de 300 itens"; page=0 shows 1 and "1-10 de 300 itens"; neither emits on render; pageSize=0 renders as the empty list without NaN/Infinity
Proof: `-t "C16 out-of-range props"`

**C17** - the stories module has a default story whose `parameters.design.url` targets node `13607-2572`, and a Table + Paginator story with 30 synthetic rows where clicking "Página 2" shows rows 11-20 and "11-20 de 30 itens"
Proof: `-t "C17 stories"`

## Swept

- validation: C12, C14, C16
- failure modes: not in scope - no I/O or promises; invalid input is validation
- idempotency: C7, C10 - going to the current page emits nothing
- authorization: not in scope - UI component with no data or permissions
- concurrency: not in scope - controlled; every action derives from the current `page` prop
- data lifecycle: not in scope - only the typed text is held, nothing persists
- dependency failure: not in scope - no external service
- state transitions: C6, C7, C8, C10, C13
- observability: not in scope - Principle XIV forbids debug logging; behaviour observed by the spec

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| nav buttons (4) | first C6 · prev C6 · next C6 · last C6 | - |
| disabled edges (2) | start C8 · end C8 | - |
| page window (4 shapes) | start C9 · middle C9 · end C9 · fewer than 3 pages C9 | - |
| jump input classes (7) | other page C10 · current page C10 · `0` C12 · `31` C12 · `2.5` C12 · `abc` C12 · empty C12 | - |
| jump threshold (3) | 6 pages C11 · 5 pages C11 · 0 pages C15 | - |
| counter forms (5) | full page C1 · partial last C2 · singular C3 · empty C15 · clamped C16 | - |
| invalid props (3) | page above C16 · page below C16 · pageSize 0 C16 | - |

- Claims naming a status code, route or response shape: none
- No other check claims more than the single case its proof exercises
