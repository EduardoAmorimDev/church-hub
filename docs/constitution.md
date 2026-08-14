<!--
Sync Impact Report - Version: 1.0.0 -> 1.1.0 (MINOR: the design system becomes a package; lint
now enforces two rules that were review-only)
- Principle II: design-system components, theme, lib, models, Storybook and specs moved from
  `apps/web` to `packages/ui` (`@church/ui`). Inside the package, modules reach each other through
  the package's own exports (`@church/ui/...`); apps import the same paths.
- Principle III and Testing Requirements: `eslint-plugin-only-warn` removed, so `npm run lint`
  fails on errors. Jest runs on `@swc/jest` in `packages/ui` (`next/jest` needs an app dir).
- Principles IV and XIV: `@repo/eslint-config` now rejects arbitrary Tailwind values, inline style
  colours and `console.*` other than `warn`/`error` (build scripts in `packages/tokens` exempt).
  The arbitrary values counted at ratification were replaced by tokens (icon sizes, a 10px radius,
  an 11px text size) in `packages/tokens`.
- Resolved follow-ups from 1.0.0: lint fails on its own; `packages/tokens` declares `tsx`; the
  Chromatic token is read from `CHROMATIC_PROJECT_TOKEN` instead of `package.json` (the old token
  remains in git history until it is revoked - owner decision).
- Still open (owner decisions): no git hook or CI runs any gate before push; the 2
  `as unknown as` casts in `packages/ui/jest.setup.ts`.
- Templates/docs updated: `AGENTS.md`, `docs/commit-convention.md` (scopes `ui/...`), skills
  `commit-organizer`, `open-pr`, `figma-implement-design`.
-->

# Church Hub Constitution

## Core Principles

### I. Test-First Delivery (NON-NEGOTIABLE)

Every component created or modified MUST ship a colocated unit test (`Component.spec.tsx` next to
`Component.tsx`) written with Jest and Testing Library, and a design-system component MUST also
ship its `Component.stories.tsx`. A component is not done until its spec passes. Before
delivering any change the agent MUST run the spec(s) covering it (see Testing Requirements) and
confirm a passing result — a change with failing or unexecuted tests MUST NOT be delivered.
This applies to components created or modified from version 1.0.0 onward; components that have
no spec today get one the first time they are changed.
**Rationale**: the design system is the one layer every app in this monorepo will consume; a
regression in an atom propagates to the member app, the backoffice and the landing page at once.

### II. Component Architecture Consistency

UI code MUST follow the atomic-design layout already in use (`atoms`, `molecules`, `organisms`,
and `templates` when needed). Each component lives in its own PascalCase folder holding
`Component.tsx`, a barrel `index.ts`, `Component.stories.tsx` and `Component.spec.tsx`, plus —
only when needed — `Component.styles.ts`, `Component.types.ts`, `Component.context.ts` and
`components/`, `data/`, `hooks/` subfolders. Design-system types and enums belong under
`packages/ui/src/models` (`enums`, `types`); an app's own go under its `~/models`. Inside an app,
import through the `~` alias (the app root) instead of `../../..` chains; inside `packages/ui`,
import another component, `lib`, `utils` or `models` through the package's own exports
(`@church/ui/atoms/Icon`, `@church/ui/lib/tailwind-variants`). A single `../` to a sibling
component is acceptable in both. Design-system components live in `packages/ui/src/components`;
app-specific UI stays in its app (Principle XV).
**Rationale**: a predictable folder shape is what lets a component be moved into a shared package
without being rewritten, and what keeps Storybook and the specs discoverable.

### III. Type Safety & Static Checks

Code MUST be TypeScript with `strict` respected; widening to `any` to get past an error is
forbidden. Before delivery, code MUST pass `npm run typecheck` and `npm run lint`; lint fails on
errors, and the files a change touches carry no warnings either.
Forbidden to silence the type checker: `as unknown as T`, `as never`, `as Partial<T> as T`, and
the non-null assertion `!` on a value that may be undefined or null. Handle the case instead
(narrowing, optional chaining with a guarded branch, a default). `as` is a last resort. The same
applies in tests: a mocked value is typed as the real interface (optionally `Partial<T>`, or via
`jest.mocked(...)`), never as `never` or `unknown`.
**Rationale**: no git hook runs these checks before a push, so the agent's own run is the gate.

### IV. Design-Token-Based Styling

Styling MUST use Tailwind v4 utility classes backed by `@church/tokens` (mapped to Tailwind in
`packages/ui/src/styles.css` under `@theme`), with variants declared through `tv` from
`@church/ui/lib/tailwind-variants` and class merging through `@church/ui/lib/tailwind-merge`. Forbidden: hardcoded
colors, font sizes or spacing — arbitrary values such as `bg-[#fff]`, `text-[13px]`, `p-[7px]`,
inline `style` colors — and any new styling approach (CSS-in-JS, CSS modules, a second utility
library). A value the tokens do not have is added to `packages/tokens` first, then consumed.
**Rationale**: the tokens package exists so that the member app, the backoffice, the landing page
and the native app share one visual language; a one-off value is a fork of the design system.

### V. No Sensitive Data in Code, Tests, Fixtures, or AI Context

Real member data, credentials, tokens, or any personally identifiable information MUST NEVER be
hardcoded, committed, or used as a fixture or story arg. Use synthetic values that are obviously
fake. This covers data a church holds about its members — names, contacts, addresses, documents,
family relations, donations and tithes, attendance, pastoral notes — and, above all, religious
affiliation itself, which LGPD classifies as sensitive personal data (Lei 13.709/2018, art. 5º,
II). The prohibition extends to anything shared with an AI agent: prompts, context files, logs,
snapshots, sample payloads and PR bodies. Reproducing a bug with production data requires
anonymising it first. Secrets (API keys, project tokens) come from environment variables, never
from a committed file.
**Rationale**: for a church-management product, a leaked record is not merely personal data — it
discloses a person's faith, which is exactly the category LGPD protects most strictly.

### VI. No Real Network Calls in Tests

Unit tests MUST NOT make real HTTP requests to any backend or third-party endpoint. Every
network or service call (`fetch`, a service module, a server action, an SDK client) is mocked at
the test boundary with `jest.mock`, `jest.fn()` or `jest.spyOn`. The repository has no MSW or
other interception layer; module-level mocking is the required approach until one is adopted.
A test that reaches a real endpoint is a defect and is fixed before delivery.
**Rationale**: a test that depends on the network is flaky by construction, and against a real
backend it can read or write member data.

### VII. Explicit Handling of Async Service Calls

A call that returns a Promise (a `fetch`, a service function, a server action, a mutation) MUST
be awaited and have its rejection path handled — `try/catch`, `.catch()` or an explicit error
state — before any UI signal implying success (closing a dialog, a success toast, navigation).
Fire-and-forget calls in submit handlers or event callbacks are forbidden. Whenever a component
or hook makes such a call, its spec MUST include at least one rejection-path case mirroring the
success-path case.
**Rationale**: a UI that reports success while the write failed leaves a member's record in a
state nobody can see, with no trace of the failure.

### VIII. Defensive Handling of Assumed Data Shapes

Code MUST NOT index into an array (`list[1]`) or reach into a nested property assuming a minimum
length or shape without first guarding for it (length check, optional chaining, early return) —
even when every current caller provides that shape. Whenever such an assumption exists, the spec
MUST include a boundary case (e.g. fewer elements than the code assumes) next to the happy path.
**Rationale**: shape assumptions drift silently as callers change; an unguarded access becomes a
runtime crash with no compile-time warning.

### IX. Specification-First AI-Assisted Development

Any feature, component or fix built with the help of an AI agent MUST start from an explicit,
written specification — a PRD, a technical spec, an issue carrying acceptance criteria, a Figma
node for a design-system component, or the plan document produced by this repository's planning
skills — rather than an ad-hoc prompt. When the specification is missing, thin or stale, the
agent MUST flag it and help produce it before generating implementation code, instead of
inferring undocumented intent. Code stays "AI-friendly": exported props and types documented,
non-obvious rules explained where they live, and a design-system story linking its Figma source
(`parameters.design`).
**Rationale**: an agent without a written source of truth fills the gaps with plausible guesses;
the spec is what makes its output reviewable.

### X. Human-in-the-Loop on AI-Generated Changes (NON-NEGOTIABLE)

An AI agent MAY implement, refactor, review, write tests and draft documentation, but MUST NOT be
the final authority on merging, releasing or deploying a change, nor on any decision affecting
members' data or privacy. Every AI-authored change still passes this repository's gates
(Principles I, III, VI, VII, VIII) AND receives explicit human approval before merge — an agent
completing its own checklist is not a sign-off.
**Rationale**: the repository owner answers for what reaches production; an agent cannot.

### XI. Approved AI Tooling Only

Only AI tools the repository owner has approved may be used against this codebase or its data.
The approved set is what is configured in the repository: Claude Code (`.claude/`, with skills
under `.agents/skills/`) and the Figma MCP server (`.vscode/mcp.json`). Adding an AI-powered
dependency, SDK, MCP server or third-party AI service requires the owner's prior approval — it
MUST NOT be added because it is convenient or already configured on a personal account.
**Rationale**: every AI integration is another path through which member data can leave.

### XII. Controlled Agent Parallelism

AI agents MUST NOT recursively spawn subagents without clear justification, and prefer the current
execution context whenever the task depends heavily on it. A subagent MAY be created only when the
work executes independently, it significantly reduces overall time, and its output has clearly
defined boundaries. At most 3 concurrent subagents per task unless the specification authorises
more.
**Rationale**: excessive parallelism increases token usage, coordination overhead, duplicated work
and inconsistent decisions.

### XIII. Comments in English, Five Lines or Fewer

Code comments MUST be in English, and a single comment block MUST NOT exceed five lines counting
its own `/**`, `*/` and `//` markers — JSDoc/TSDoc, inline comments and banners, in source and
tests alike. A comment MUST open with `why:`, `hazard:` or `invariant:`; a comment narrating what
the code does is not admissible at any length. Literal content quoted inside a comment (a UI label
in Portuguese, an API string format) stays verbatim. When five lines cannot hold the explanation,
the rest moves to the specification or the PR body — it is not silently dropped. Applies to
comments added or modified from version 1.0.0 onward (for example, the long blocks in
`packages/ui/src/components/atoms/Field/Field.tsx` are conforming until edited).
**Rationale**: a comment long enough to scroll past is a document in the wrong artefact, where it
drifts from the code and is never reviewed as prose.

### XIV. No Debug Logging in Agent-Authored Code (NON-NEGOTIABLE)

An AI agent MUST NOT introduce `console.log`, nor its siblings `console.debug`, `.info`, `.table`,
`.dir`, `.trace`, `.time`/`.timeEnd`. `console.warn` and `console.error` remain permitted for a
deliberate diagnostic meant to ship. To observe behaviour, the agent writes a spec that asserts it
(Principle I); instrumentation MUST NOT reach a delivered diff. Build-time scripts that report to
a terminal (`packages/tokens/src/scripts/`) are not browser code and are exempt.
**Rationale**: an agent never sees the console it wrote to, so the line outlives its purpose and
ships as a leak of internal state — here, potentially a member record — to anyone with devtools.

### XV. Workspace Boundaries

An app MUST NOT import from another app (`apps/web` ↛ `apps/native`, and likewise for the planned
backoffice and landing page). Code needed by more than one app moves to a package under
`packages/` and is consumed through its declared `exports` (`@church/*` for product packages,
`@repo/*` for tooling configs); a package MUST NOT import from an app. A new package declares its
own `package.json`, `tsconfig.json` extending `@repo/typescript-config`, and `eslint.config.mjs`
from `@repo/eslint-config`, and exposes `lint`, `typecheck` and — when it has code under test —
`test`, so that `turbo` picks it up. Dependencies are declared in the workspace that uses them.
**Rationale**: the monorepo exists to share one design system across several apps; an app-to-app
import couples their release cycles and turns the shared layer into an accident.

## Testing Requirements

- Runner: Jest 30 with `@swc/jest`, `jest-environment-jsdom`, setup file
  `packages/ui/jest.setup.ts`, Testing Library (`@testing-library/react`, `user-event`,
  `jest-dom`). Only `packages/ui` has tests today; a new workspace with code under test adds its
  own `test`.
- Full suite: `npm run test` (`turbo run test`).
- One spec: `npm test -w @church/ui -- <path relative to packages/ui>`
  (e.g. `npm test -w @church/ui -- src/components/atoms/Cell/Cell.spec.tsx`).
- Full gate: `npm run verify` (`turbo run typecheck lint test`).
- Type check: `npm run typecheck`. Lint: `npm run lint`.
- Design-system components are also verified visually in Storybook
  (`npm run storybook -w @church/ui`),
  including the a11y addon; behaviour that depends on real layout (drag and drop) is verified
  there, not in jsdom.
- Pre-delivery lint loop (mandatory before a change is done): run `npm run lint`; fix every
  warning reported in the files you touched — never with a suppression comment, a rule override
  or by deleting the file; re-run until the touched files are clean. The harness `grind` gate runs
  lint and tests on every stop; see "Relationship to the Harness Toolkit".
- Module mocking: when `jest.mock('~/module', () => ({...}))` replaces part of a module, it MUST
  spread `jest.requireActual('~/module')` and override only what it mocks, unless the test
  deliberately replaces the whole module — in which case a `why:` comment says so.
- Every awaited call gets a rejection-path test (VII); every assumed shape gets a boundary case
  (VIII); fixtures are synthetic (V).

## Development Workflow

- Package manager: npm only (`package-lock.json`); never yarn or pnpm. Add a dependency to the
  workspace that uses it (`npm install <pkg>@<version> -w web`) and commit the lockfile with it.
- Orchestration: Turborepo (`turbo.json`). `npm run dev` starts the web app and Storybook.
- Formatting belongs to Prettier (`.prettierrc`: no semicolons, single quotes, no trailing
  commas, 80-char print width, `arrowParens: avoid`, Tailwind class sorting) — do not hand-format.
- Do not introduce a library or pattern to solve what an adopted dependency already solves
  (forms: `react-hook-form` + `zod`; state: `zustand`; tables: `@tanstack/react-table`; drag and
  drop: `@dnd-kit`; motion: `motion`; toasts: `react-toastify`).
- Branches: trunk `main`; work happens on `feat/…`, `fix/…`, `refactor/…` branches merged by pull
  request. Commit messages follow `docs/commit-convention.md`.

### AI-Assisted Development Notes

- Start from a spec (Principle IX). The `tlc-discover`, `tlc-plan`, `tlc-spec-lean` and
  `tlc-implement` skills under `.agents/skills/` carry that flow and decide where the document
  lands; this repository deliberately fixes no directory for it.
- For a design-system component, the Figma node is part of the spec: use the `figma` /
  `figma-implement-design` skills and the Figma MCP server.
- Treat AI-authored diffs like any other contributor's: passing tests, clean typecheck and lint,
  and a human reviewer (Principles I, III, X).
- Never paste real member or production data into a prompt, spec or context file (Principle V).
- A new AI tool, plugin or MCP server goes through the owner first (Principle XI).

## Relationship to the Harness Toolkit

The TLC harness (configured under `.tlc/harness/`, enforced through hooks registered in
`.claude/settings.json`) checks part of this constitution mechanically and adds obligations this
constitution does not state. It is a mechanism, not a source of norms: where both speak to the
same thing, this constitution says what the rule is and the harness says how it is checked.

**Mechanised — the principle stands, the manual step is automated:**

- The pre-delivery lint loop and Principle I's test run are executed by the `grind` gate on every
  stop, using the `lintCommand` and `testCommand` in `.tlc/harness/config.json` (`npm run lint`,
  `npm run test`). `grind` does **not** run the type check, and no git hook does either —
  Principle III's `npm run typecheck` is owed by the agent, or by `npm run verify`.
- Principle X is backed by `shipGate` and `emptyDiffAntiShip`: a completion claim is recognised
  only from an explicit `HARNESS_SHIP_CLAIM:` line and is challenged without recent PASS evidence,
  and a claim over an empty diff is refused. The `pr-requires-verify` rule requires
  `npm run verify` on the current HEAD before `pr-open`. None of these replace human approval.

**Stricter than this constitution — the harness governs:** none today. Principle XIII already
carries the `why:` / `hazard:` / `invariant:` requirement that the `comments` rail enforces.

**Obligations the harness adds that this constitution does not state:**

- `duplication`: a turn adding six or more lines already present elsewhere is refused. Call the
  existing code or extract what both callers need.
- `supplyChain`: a dependency added without its lockfile moving, or with a `latest`/`*`/unpinned
  specifier, is refused. It sits beneath Principle XI: XI decides whether a dependency may be
  adopted at all, `supplyChain` how it is pinned.
- `subagents.enforceAllowlist`: restricts which models a subagent may run. Principle XII's cap of
  three concurrent subagents is **not** machine-enforced.

**Covered by lint, not by the harness:** XIV (`no-console`, `warn`/`error` allowed) and the
arbitrary-value and inline-colour half of IV run in `npm run lint`, which `grind` executes.

**Covered by neither, and therefore held by review:** Principles II, VI, VII, VIII and XV, and
the rest of IV (hardcoded spacing in inline styles, new styling approaches).

**Precedence.** Where the harness refuses an action this constitution permits, the refusal stands
and the conflict is raised to the operator — an agent MUST NOT work around a harness floor rule,
and MUST NOT edit the harness configuration, which is operator-owned. Where this constitution
forbids something the harness permits, this constitution governs.

## Governance

This constitution defines the minimum bar for code delivered into this repository. It does not
replace legal obligations — LGPD above all — nor any policy of an organisation that operates the
product; where one applies and conflicts with this file, that obligation prevails. Anything with
legal or privacy impact is validated with whoever answers for it before being treated as settled.

The harness toolkit is subordinate to this constitution as a source of norms and superior to it as
a gate (see "Relationship to the Harness Toolkit").

Amendments update this file with a Sync Impact Report and a version bump: MAJOR for removing or
redefining a principle, MINOR for adding a principle or materially expanding guidance, PATCH for
wording fixes. `Last Amended` changes on every amendment; `Ratified` stays fixed.

**Version**: 1.1.0 | **Ratified**: 2026-09-25 | **Last Amended**: 2026-10-04
