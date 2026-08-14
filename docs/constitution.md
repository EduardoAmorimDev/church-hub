<!--
Sync Impact Report - Version: 1.1.1 -> 2.0.0 (MAJOR: principles' fundamentals moved out)
- Split: the stack-independent fundament of every principle now lives in the general
  constitution at `~/Documents/docs/constitution.md` (2.0.0). This file keeps only how each
  principle binds in church-hub: commands, paths, libraries and conventions. No obligation was
  relaxed; only the general wording and rationale moved.
- Numbering: Principles I-XIV keep their numbers and each section below binds the general
  principle with the same number. Former Principle XV (Workspace Boundaries) has no general
  counterpart, so it is now repository rule `R1`; its text is unchanged.
- Agent tooling: `.claude/` and `.agents/` were removed from this repository on 2026-10-07. The
  skills (including the church-hub-tuned copies of `commit-organizer`, `open-pr`,
  `figma-implement-design` and `docs-writer`) are now the global, repository-agnostic ones in
  `~/.agents/skills`; the church-hub facts those copies carried (trunk, protected set, scope
  derivation, commit grouping order, GitHub issue linking, formatter command, Figma mapping) moved
  into "Development Workflow" below. The session-start hook is replaced by the global one that
  injects the general constitution.
- Harness: the "Relationship to the Harness Toolkit" section is reduced to a pointer — the harness
  is global (`~/.tlc/harness`) and the general constitution states its precedence.
- Templates/docs updated: `AGENTS.md`, `CLAUDE.md`.

Previous reports:

Sync Impact Report - Version: 1.1.0 -> 1.1.1 (PATCH: wording)
- Principle XV: `apps/web` is the backoffice, not a separate planned app; the landing page may
  live inside `apps/web` or get its own app (undecided). No rule changed.
- Templates/docs updated: `AGENTS.md`.

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

# Church Hub — Repository Constitution

This file binds every change an AI agent makes to this repository. It **extends** the general
constitution at `~/Documents/docs/constitution.md`, which states each principle's fundament;
read that first. Each section below is the binding, here, of the general principle with the same
number — it makes the principle concrete and MAY make it stricter, never looser. Where the two
appear to disagree, flag the conflict instead of silently picking one.

Church Hub is a personal church-management product (not a VIACERTA repository): an npm-workspaces
+ Turborepo monorepo with one shared design system (`packages/ui`, `@church/ui`), the backoffice
(`apps/web`, Next.js 16) and a native app (`apps/native`, Expo 55).

## Principle Bindings

### I. Tests ship with the change — here

The unit of delivery is the component: every component created or modified ships a colocated
unit test (`Component.spec.tsx` next to `Component.tsx`) written with Jest and Testing Library,
and a design-system component also ships its `Component.stories.tsx`. Before delivering, run the
spec(s) covering it (see Testing Requirements). Applies to components created or modified from
version 1.0.0 onward; a component with no spec today gets one the first time it is changed.
**Rationale (repo)**: the design system is the one layer every app consumes; a regression in an
atom reaches the member app, the backoffice and the landing page at once.

### II. Follow the existing architecture — here

UI code follows the atomic-design layout (`atoms`, `molecules`, `organisms`, and `templates`
when needed). Each component lives in its own PascalCase folder holding `Component.tsx`, a
barrel `index.ts`, `Component.stories.tsx` and `Component.spec.tsx`, plus — only when needed —
`Component.styles.ts`, `Component.types.ts`, `Component.context.ts` and `components/`, `data/`,
`hooks/` subfolders. Design-system types and enums belong under `packages/ui/src/models`
(`enums`, `types`); an app's own go under its `~/models`. Inside an app, import through the `~`
alias (the app root) instead of `../../..` chains; inside `packages/ui`, import another
component, `lib`, `utils` or `models` through the package's own exports
(`@church/ui/atoms/Icon`, `@church/ui/lib/tailwind-variants`). A single `../` to a sibling
component is acceptable in both. Design-system components live in `packages/ui/src/components`;
app-specific UI stays in its app (rule R1).
**Rationale (repo)**: a predictable folder shape lets a component move into a shared package
without a rewrite and keeps Storybook and the specs discoverable.

### III. Static checks are never silenced — here

TypeScript with `strict` respected; widening to `any` to get past an error is forbidden. Code
passes `npm run typecheck` and `npm run lint`; lint fails on errors, and the files a change
touches carry no warnings either. Forbidden: `as unknown as T`, `as never`, `as Partial<T> as T`,
and the non-null assertion `!` on a value that may be undefined or null; `as` is a last resort.
In tests, a mocked value is typed as the real interface (optionally `Partial<T>`, or via
`jest.mocked(...)`), never as `never` or `unknown`.
**Rationale (repo)**: no git hook runs these checks before a push.

### IV. Reuse before adding — here

Styling uses Tailwind v4 utility classes backed by `@church/tokens` (mapped to Tailwind in
`packages/ui/src/styles.css` under `@theme`), with variants through `tv` from
`@church/ui/lib/tailwind-variants` and class merging through `@church/ui/lib/tailwind-merge`.
Forbidden: hardcoded colors, font sizes or spacing — arbitrary values such as `bg-[#fff]`,
`text-[13px]`, `p-[7px]`, inline `style` colors — and any new styling approach (CSS-in-JS, CSS
modules, a second utility library). A value the tokens lack is added to `packages/tokens` first.
Adopted dependencies to reuse: forms `react-hook-form` + `zod`; state `zustand`; tables
`@tanstack/react-table`; drag and drop `@dnd-kit`; motion `motion`; toasts `react-toastify`.
**Rationale (repo)**: the tokens package is how the member app, the backoffice, the landing page
and the native app share one visual language.

### V. No sensitive data anywhere — here

The product holds church members' data: names, contacts, addresses, documents, family relations,
donations and tithes, attendance, pastoral notes — and religious affiliation itself, which LGPD
classifies as sensitive personal data (Lei 13.709/2018, art. 5º, II). None of it goes into a
fixture or story arg; synthetic values must be obviously fake. Secrets (API keys, project tokens
such as `CHROMATIC_PROJECT_TOKEN`) come from environment variables, never a committed file.
**Rationale (repo)**: a leaked record here discloses a person's faith.

### VI. No real network calls in tests — here

Every network or service call (`fetch`, a service module, a server action, an SDK client) is
mocked with `jest.mock`, `jest.fn()` or `jest.spyOn`. There is no MSW or other interception
layer; module-level mocking is required until one is adopted.

### VII. Handle failure before signalling success — here

A Promise-returning call (a `fetch`, a service function, a server action, a mutation) is awaited
and its rejection handled — `try/catch`, `.catch()` or an explicit error state — before any UI
signal implying success (closing a dialog, a success toast, navigation). Its spec includes a
rejection-path case.

### VIII. Guard assumed data shapes — here

The canonical violation is `list[1]` or a nested access without a length check, optional
chaining or an early return; the spec carries the boundary case.

### IX. Specification first — here

For a design-system component the Figma node is part of the specification, and its story links
its Figma source (`parameters.design`); use the `figma` / `figma-implement-design` skills with the
Figma MCP server, reading `packages/docs/figma-components.md` first (it maps Lamb Figma
components, text styles and variables to `@church/ui` components and tokens). This repository
fixes no directory for specification documents.

### X. A human has the final word — here

The repository owner approves every merge, release and deploy and every decision affecting
members' data or privacy.

### XI. Approved tools only — here

The owner approves AI tools for this codebase. Approved today: Claude Code (configured globally,
skills in `~/.agents/skills`) and the Figma MCP server (`.vscode/mcp.json`).
**Rationale (repo)**: every AI integration is another path for member data to leave.

### XII. Controlled parallelism — here

No repository-specific binding: the general principle applies in full.

### XIII. Comments: English, five lines, declared purpose — here

The five lines count the `/**`, `*/` and `//` markers. Literal content such as a Portuguese UI
label stays verbatim. Binds comments added or modified from version 1.0.0 onward (the long blocks
in `packages/ui/src/components/atoms/Field/Field.tsx` are conforming until edited).

### XIV. No debug output in delivered code — here

Forbidden: `console.log`, `console.debug`, `.info`, `.table`, `.dir`, `.trace`,
`.time`/`.timeEnd`. `console.warn` and `console.error` remain permitted for a deliberate
diagnostic meant to ship. Build-time scripts that report to a terminal
(`packages/tokens/src/scripts/`) are exempt. `@repo/eslint-config` enforces this through
`no-console` (`warn`/`error` allowed), run by `npm run lint`.

## Repository Rules

### R1. Workspace Boundaries

An app MUST NOT import from another app (`apps/web`, the backoffice, ↛ `apps/native`, and
likewise for the planned member app and for the landing page if it gets its own app). Code
needed by more than one app moves to a package under `packages/` and is consumed through its
declared `exports` (`@church/*` for product packages, `@repo/*` for tooling configs); a package
MUST NOT import from an app. A new package declares its own `package.json`, `tsconfig.json`
extending `@repo/typescript-config`, and `eslint.config.mjs` from `@repo/eslint-config`, and
exposes `lint`, `typecheck` and — when it has code under test — `test`, so that `turbo` picks it
up. Dependencies are declared in the workspace that uses them.
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
  (`npm run storybook -w @church/ui`), including the a11y addon; behaviour that depends on real
  layout (drag and drop) is verified there, not in jsdom.
- Pre-delivery lint loop: run `npm run lint`; fix every warning in the files you touched — never
  with a suppression comment, a rule override or by deleting the file; re-run until clean.
- Module mocking: when `jest.mock('~/module', () => ({...}))` replaces part of a module, it MUST
  spread `jest.requireActual('~/module')` and override only what it mocks, unless the test
  deliberately replaces the whole module — in which case a `why:` comment says so.
- No git hook or CI runs any gate before a push; `npm run verify` is owed before calling work
  done or opening a PR.

## Development Workflow

- Package manager: npm only (`package-lock.json`); never yarn or pnpm. Add a dependency to the
  workspace that uses it (`npm install <pkg>@<version> -w <workspace>`) and commit the lockfile
  with it.
- Orchestration: Turborepo (`turbo.json`). `npm run dev` starts the web app and Storybook.
- Formatting belongs to Prettier (`.prettierrc`: no semicolons, single quotes, no trailing
  commas, 80-char print width, `arrowParens: avoid`, Tailwind class sorting via
  `prettier-plugin-tailwindcss`). Check with `npx prettier --check <files>` or rewrite with
  `npm run format`; code files are also checked by the `prettier/prettier` rule in
  `npm run lint`.
- **Branches**: single trunk `main`; every PR targets it from a `feat/…`, `fix/…` or
  `refactor/…` branch. An urgent fix is `hotfix/<short-desc>`, cut from `main`. New branches are
  cut from a freshly fetched `origin/main`.
- **Protected set**: `main` and `master` (`main` is the only long-lived branch; `master` is a
  deliberate superset). There are no git hooks (no husky, no `pre-commit`, no `pre-push`), so
  nothing local refuses a commit or push to `main`; the agent's own check is the only guard.
- **Commits** follow `docs/commit-convention.md`, this repository's refinement of the general
  convention. Scope: drop a leading `apps/` or `packages/` (the workspace name becomes the first
  segment), drop the generic `components` segment and a leading `src/`, drop the extension,
  kebab-case every segment, collapse a file name that repeats its folder, max 4 segments, never
  drop the leaf — `packages/ui/src/components/atoms/Button/Button.tsx` → `ui/atoms/button`; a root
  config such as `turbo.json` → `root` (or `turbo`).
- **Commit grouping and order**: a component folder is one commit; dependency changes go alone
  and first, with `package-lock.json` (one root lockfile for all workspaces). The tracked
  generated files `apps/web/next-env.d.ts` and `apps/native/nativewind-env.d.ts` ride with the
  change that regenerated them; tokens CSS in `packages/tokens/dist/` is gitignored. Shared
  types/enums (`packages/ui/src/models`) get their own 🏷️ commit when two or more pieces consume
  them. Order: tooling configs (`packages/typescript-config`, `packages/eslint-config`) → tokens
  (`packages/tokens`) → types & enums → helpers (`packages/ui/src/lib`,
  `packages/ui/src/components/utils`) → Storybook config (`packages/ui/.storybook`) → atoms →
  molecules → organisms → routes (`apps/web/app`, `apps/native/app`) → docs (`packages/docs`,
  `docs/`).
- **Pull requests**: base `main`. There is no ticket tracker beyond GitHub issues and a ticket is
  optional: link one only when the user gives it or a branch/commit carries `#N`, as `Closes #N`
  (or `Refs #N` when it must stay open). Never invent an issue number.
- Backend contract: `docs/backend/ibfc-server.md` is the source of truth for `ibfc-server` and
  wins over the backend's Swagger examples.

## Harness

The harness is global and repository-agnostic; `tlc harness status` shows its gates and the
general constitution states its precedence.

## Governance

This file is subordinate to the general constitution and does not replace legal obligations —
LGPD above all — nor any policy of an organisation that operates the product. Anything with legal
or privacy impact is validated with whoever answers for it before being treated as settled. It
MAY bind a principle more strictly, never relax one; a rule with no general counterpart gets an
`R` id. Amendments update the Sync Impact Report and bump the version (MAJOR: remove or redefine a
binding; MINOR: add one; PATCH: wording). `Last Amended` changes on every amendment; `Ratified`
stays fixed.

**Version**: 2.0.0 | **Ratified**: 2026-09-25 | **Last Amended**: 2026-10-07
