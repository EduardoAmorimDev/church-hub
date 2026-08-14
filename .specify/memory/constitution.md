# Church Hub monorepo Constitution

## Monorepo Context

Church Hub is an npm-workspaces monorepo orchestrated with Turborepo. Everything lives in one
place and shares the same design tokens and engineering conventions:

- **`apps/web`** — Next.js (App Router, React) web app: the church back-office CRM
  (members, contributions, etc.). Hosts the shared design system and its Storybook.
- **`apps/native`** — Expo / React Native app for church members.
- **Future apps** (e.g. a landing/marketing page) are expected to join the same monorepo,
  following the same conventions.
- **`packages/tokens`** (`@church/tokens`) — the single design-token source, generated from
  the Figma design system. Consumed by **both** web (as CSS variables + Tailwind utilities)
  and native (as JS constants). This is the shared source of visual truth across apps.
- **`packages/eslint-config`**, **`packages/typescript-config`**, **`packages/docs`** — shared
  lint, TS, and documentation config consumed by every app.

Code that only one app needs lives in that app; code that two or more apps need (tokens,
shared types, shared utilities) lives in a `packages/*` workspace.

## Core Principles

### I. Test-First Delivery (NON-NEGOTIABLE)

Every component created or modified MUST have an accompanying unit test (`*.spec.ts` /
`*.spec.tsx`, colocated with the source file in its component folder). A component is not
considered done until its tests pass. Before delivering any change, the agent MUST run the
test(s) covering the component under development (see Testing Requirements) and confirm a
passing result — a change with failing or unexecuted tests MUST NOT be delivered.
**Rationale**: This is a church management system; it handles sensitive member data.
Regressions in shared components propagate across multiple screens (and across web and
native). Automated tests serve as the minimum safety net before code reaches the review
stage.

### II. Component Architecture Consistency

New UI code MUST follow the atomic-design layout already in use under
`apps/web/components` (`atoms`, `molecules`, with `organisms`/`templates` as the design
system grows). Each component MUST live in its own folder with a barrel `index.ts`, keep
its spec and Storybook story (`*.stories.tsx`) alongside it. Shared enums/types belong under
`apps/web/models` (`enums`, `types`); use the `~` path alias (mapped to `apps/web`) instead
of relative `../../..` chains.
**Rationale**: The codebase already enforces this structure consistently across the existing
atoms; deviating fragments the pattern and breaks discoverability.

### III. Type Safety & Static Checks

Code MUST be written in TypeScript with `strict` mode respected (no widening types away with
`any` to bypass errors). Before delivery, code MUST satisfy `npx tsc --noEmit` and `npx eslint`
(flat config from `@repo/eslint-config` — base/next-js/expo — with `@typescript-eslint`,
`react-hooks`, `next`, and Prettier rules) with no new errors introduced.
**Rationale**: `tsc --noEmit` and lint are the static checks every delivered change must pass.
Strictly forbidden to use `as unknown as {T}` to bypass type errors. Also forbidden: using
`as never` to silence a type mismatch, and using the non-null assertion operator (`!`) to
suppress a possibly-undefined/null value (e.g. `someMaybeUndefined!.executeSomething()`) — if
the value can be undefined/null, it MUST be handled explicitly (optional chaining with a
guarded branch, a narrowing check, or a default), not asserted away.
This prohibition applies equally inside test files: mocked return values (e.g.
`jest.mocked(...).mockReturnValue(...)`) MUST be cast to the real interface/type being mocked
(optionally via `Partial<T>` for objects with only some fields populated), never to `never`
or `unknown as {T}`, even when only a subset of the real shape is needed for the test.
**Acknowledged exception**: form-agnostic UI atoms (e.g. `TextField`) type their
`react-hook-form` `control` prop loosely (`Control<any>`) so any `useForm<T>()` shape works —
this is the only sanctioned `any` in the design-system layer and is documented inline.

### IV. Design-Token-Based Styling

Visual styling MUST reuse the design tokens from `@church/tokens` (`packages/tokens`,
generated from the Figma design system) rather than introducing hardcoded, one-off values or
a new styling approach. Tokens surface as CSS variables (via `@church/tokens/styles/root.css`)
mapped to Tailwind color utilities in `apps/web/app/styles.css` (e.g. `text-neutral-*`,
`border-red-*`). Component variants MUST be composed with `tv()` from
`~/lib/tailwind-variants` (which teaches `tailwind-merge` the custom text-size scale) and
merged with `twMerge` from `~/lib/tailwind-merge`. The native app consumes the same tokens as
JS constants with NativeWind utilities.
**Rationale**: Keeps visual consistency across atoms/molecules/organisms and across web and
native, and avoids drift between the code and the Figma source of truth.

### V. No Sensitive Data in Code, Tests, Fixtures, or AI Context

Real member data, credentials, tokens, or any personally identifiable/financial information
(names, contact info, addresses, photos, contribution records) MUST NEVER be hardcoded,
committed, or used as test fixtures. Use synthetic data (realistic-but-fake names, emails,
etc.) for tests and stories.
This prohibition extends explicitly to any prompt, context file, log, or attachment shared with
an AI coding tool or agent (Claude Code, or any other approved assistant — see Principle XI):
production data, real member records, or any content classified as sensitive MUST NOT be pasted
into prompts, included in repository files intended to give AI agents context, or exposed in
generated artifacts (logs, snapshots, sample payloads). If a task genuinely requires production
data to reproduce a bug, it MUST be anonymized/faked first.
**Rationale**: This system stores real personal and financial member data; even in test code or
AI-tool context, that data creates compliance and data-protection exposure. AI coding tools are
an additional egress path for sensitive data and must be treated with the same discipline as
version control.

### VI. No Real Network Calls in Tests

Unit tests MUST NOT make real HTTP requests to any backend, staging, or production endpoint.

All network/service calls MUST be mocked or stubbed at the test boundary using `jest.mock`
and/or `jest.fn()`. The repo currently has no request-interception layer (e.g. MSW), so
module-level mocking of the service call is the required approach until such a layer is adopted.

A test that reaches a real endpoint — even one only reading data — MUST be treated as a defect
and fixed before delivery.

**Rationale**: Real network calls from automated test runs can mutate shared member data,
trigger real downstream integrations (notifications, etc.), or produce misleading audit trails.

### VII. Explicit Handling of Async Service Calls

Any call to a service/API function that returns a Promise MUST be awaited and MUST have its
rejection path handled — via `try/catch`, `.catch()`, or an equivalent error state — before any
UI feedback implying success (closing a dialog, showing a success toast, navigating away) is
triggered. Fire-and-forget calls in submit handlers or event callbacks are forbidden. Whenever
a component or hook calls such a service function, its test suite MUST include at least one case
exercising the rejection path for that call, mirroring the success-path test.
**Rationale**: A UI that reports success while a backend write silently failed (or a UI that
closes/dismisses before knowing the outcome) can leave a member's record — e.g. a registration
or contribution — in an inconsistent state with no visible error and no audit trail of the
failure.

### VIII. Defensive Handling of Assumed Data Shapes

Code MUST NOT index into an array (e.g. `list[1]`) or access a nested property assuming a
minimum length/shape without first guarding for it (length check, optional chaining, or an
explicit early return) — even when current callers happen to always provide that shape.
Whenever such an assumption exists, the corresponding test suite MUST include at least one
case exercising the boundary (e.g. an array with fewer elements than the code assumes) to
confirm the guard behaves as intended, alongside the "happy path" case.
**Rationale**: Assumptions about array/object shape drift silently as calling code changes;
an unguarded index access becomes a runtime crash with no compile-time warning, and a missing
boundary test means the crash is only discovered in production.

### IX. Specification-First AI-Assisted Development

Any feature, component, or fix built with the help of an AI coding agent (Claude Code, or any
other approved tool) MUST start from an explicit, written specification — a PRD, technical
spec, or the equivalent `.specify` artifact (spec → plan → tasks) — rather than from an ad-hoc
prompt with no prior documentation. Product and technical documentation are the primary source
of truth that the agent must work from; when a task's specification is missing, thin, or stale,
the agent MUST flag this and help produce/update it before generating implementation code,
rather than inferring undocumented intent silently.
As the codebase evolves, code and its associated documentation/comments/interfaces MUST be kept
"AI-friendly": exported interfaces under `apps/web/models` documented, non-obvious business
rules explained in comments or adjacent docs, and legacy areas annotated as they are touched —
so that future AI-assisted work has accurate context instead of having to reverse-engineer
intent from implementation.
**Rationale**: The Specification-Driven-Development model this project uses measured a concrete
gain from this approach — a comparable integration went from 34 business days without it to 20
business days with it (41% faster, higher quality, two rollouts). Skipping the spec step
recreates the earlier, less reliable "AI code assist" phase where roughly 30% of AI suggestions
had to be discarded for lacking product context.

### X. Human-in-the-Loop on AI-Generated Changes (NON-NEGOTIABLE)

An AI agent MAY implement, refactor, or review code, generate tests, or draft documentation, but
MUST NOT be the final authority on merging, releasing, or deploying a change, nor on any decision
with member-data, contribution, or compliance impact. Every AI-authored or AI-assisted change MUST
still pass through this repo's existing gates (Principles I, III, VI, VII, VIII) AND MUST receive
explicit human review/approval before merge — an agent completing its own checklist is not a
substitute for a human sign-off. Automated code review performed by an AI tool (e.g. auto-fixing
lint/type issues flagged in a PR) is permitted, but the final "this is safe to merge" judgment
call remains with a human reviewer.
**Rationale**: AI never makes the final decision unsupervised, especially for flows involving
member or financial data; the web CRM sits directly upstream of those flows (member records,
contributions), so the same non-negotiable human checkpoint applies here.

### XI. Approved AI Tooling Only — No Unauthorized Integrations or Shadow Apps

Only AI tools/services approved for use against this codebase or its data may be used (as of this
writing: Claude/Claude Code). Introducing a new AI-powered dependency, SDK, MCP server, or
third-party AI service into this repository requires prior approval from the repository owner —
it MUST NOT be added because it is convenient or already configured on a developer's personal
account.
Building a standalone internal tool or app "vibe-coded" outside this repository's engineering
process (i.e. skipping Principles I, III, VI, VII, VIII and this repo's review process) is
forbidden, even if AI-assisted and even if requested by someone outside the engineering workstream.
Any such need MUST be routed through the standard engineering intake and, if approved, implemented
inside this monorepo under the same constitution — a CRM feature belongs in `apps/web`, a member
feature belongs in `apps/native`, and a new shared concern belongs in `packages/*`.
Where reusable AI agent configurations, skills, or MCP definitions are created for this project,
prefer contributing them to the shared configuration in this repository over one-off,
tool-specific configuration, to reduce dependency on any single AI vendor.
**Rationale**: Keeping everything in this one governed monorepo — rather than scattered
AI-built side projects — is what keeps the shared Figma tokens, the design system, and the
engineering gates consistent.

### XII. Controlled Agent Parallelism

AI agents MUST NOT recursively spawn subagents without clear justification.
Prefer solving tasks within the current execution context whenever practical.
Prefer extending the current execution context instead of spawning another agent whenever the task depends heavily on existing context.
Subagents MAY be created only when:
the work can execute independently;
it significantly reduces overall execution time;
the outputs have clearly defined boundaries.
At most 3 concurrent subagents may be active for a single task unless the specification explicitly authorizes more.
**Rationale**: Excessive parallelism increases token usage, coordination overhead, duplicated work and inconsistent decisions.

## Testing Requirements

- Test runner: **Jest** (v30, jsdom environment, `@testing-library/react` and
  `@testing-library/jest-dom`), in `apps/web`. As of 2026-08-07 the Jest devDependency is
  present and the harness (config, setup file, `test` script) is being wired; the commands
  below are the target once configured.
- Run the full suite once (from `apps/web`): `npx jest`.
- Run only the tests for the component under development: `npx jest <path-to-spec-file>`
  (e.g. `npx jest components/atoms/Button/Button.spec.tsx`) or filter by name pattern:
  `npx jest -t <ComponentName>`.
- Watch mode during development: `npx jest --watch`.
- Type check: `npx tsc --noEmit`.
- Lint: `npx eslint .`.
- A component's own test(s) MUST pass locally before the change is delivered.
- Pre-delivery lint loop (mandatory before any change is considered done):
  1. Run `npx eslint .`.
  2. If it reports errors, fix them.
  3. Re-run `npx eslint .`.
  4. Repeat steps 2–3 until `npx eslint .` reports zero errors.
- Module mocking convention: when `jest.mock('~/module', () => ({...}))` replaces only part
  of a module's surface, it MUST spread `jest.requireActual('~/module')` and override only the
  specific export(s) being mocked, unless the test deliberately intends to replace the entire
  module (rare) — in which case the file MUST have a comment stating why. Replacing the whole
  module by default risks a future new export silently becoming `undefined` for any other
  consumer of that module inside the component/hook under test.

## Development Workflow

- Follow existing folder conventions when adding code:
  - `apps/web/components/{atoms,molecules}` — UI primitives and composition (atomic design),
    each component with its own folder, `index.ts` barrel, `*.spec.tsx`, and `*.stories.tsx`.
  - `apps/web/lib` — design-system Tailwind wrappers (`tailwind-variants`, `tailwind-merge`).
  - `apps/web/models` — enums and types (`~/models`).
  - `apps/web/app` — Next.js routes and pages.
  - `apps/native/app` — Expo Router screens.
  - `packages/*` — anything shared by two or more apps (e.g. `packages/tokens`).
- Formatting follows the repo's Prettier config (`singleQuote`, no semicolons, no trailing
  commas, 80-char print width, `arrowParens: "avoid"`, `prettier-plugin-tailwindcss`) — do not
  hand-format against it. Run `npm run format` (root) or `npx prettier --write <files>`.
- Do not introduce new libraries or architectural patterns to solve a problem an existing,
  already-adopted dependency already solves (Tailwind v4, `tailwind-variants`,
  `react-hook-form`, `@church/tokens`, etc.).

### AI-Assisted Development Notes

- Start from a spec: for any non-trivial change, produce or update the relevant `.specify`
  spec/plan/tasks (or PRD/technical doc, if the change predates full `.specify` adoption) before
  asking an agent to implement — per Principle IX.
- Treat AI-authored diffs like any other contributor's diff: they still owe passing tests, clean
  `tsc`/`lint`, and a human reviewer — per Principle I, III, and X.
- Never paste real member/production data into a prompt, spec file, or context document — use
  synthetic data, per Principle V.
- If a task seems to call for a new AI tool, plugin, or MCP server not already listed as approved
  (Principle XI), raise it with the repository owner rather than installing or configuring it
  directly.

## Governance

This constitution defines the minimum bar for code delivered into this repository; it does not
replace the organization's internal compliance, security, or audit policies, which remain
authoritative for anything with regulatory, contractual, or audit impact. In particular, this
constitution's AI-related principles (V, IX–XI) are a repo-level application of — and are
subordinate to — any organization-wide AI Usage and Acquisition Policy; where the two conflict,
the organization-wide policy prevails.

Amendments require updating this file with a Sync Impact Report (as above) and a version bump:
MAJOR for removing or redefining a principle, MINOR for adding a principle or materially
expanding guidance, PATCH for wording/clarity fixes. `Last Amended` MUST be updated on every
change; `Ratified` stays fixed at the original adoption date.

**Version**: 1.2.0 | **Ratified**: 2026-07-10 | **Last Amended**: 2026-08-07
