# AGENTS.md

Church Hub monorepo: a church-management product with one shared design system.
Today: `packages/ui` (`@church/ui`, the design system: components, theme and
Storybook 10), `apps/web` (Next.js 16 App Router, consumes `@church/ui`) and
`apps/native` (Expo 55 + expo-router + nativewind). Planned: a member app, a
backoffice and a landing page, all consuming `@church/ui`.
npm workspaces + Turborepo, React 19, TypeScript, Tailwind v4 + tailwind-variants,
Jest 30 + Testing Library.

**Read `docs/constitution.md` before editing code.** It is the normative
version of this file, binds every change including small ad-hoc ones, and wins
on any conflict. Its section "Relationship to the Harness Toolkit" settles
disagreements between it and the harness gates.

## Commands

```bash
npm install                             # npm only — never yarn/pnpm (package-lock.json)
npm run dev                             # turbo: web dev server + Storybook
npm run verify                          # turbo run typecheck lint test — the full gate
npm run typecheck                       # tsc --noEmit in every workspace
npm run lint                            # eslint in every workspace
npm run test                            # jest (only packages/ui has tests today)
npm test -w @church/ui -- <path>        # one spec, e.g. src/components/atoms/Cell/Cell.spec.tsx
npm run storybook -w @church/ui         # Storybook alone on :6006
npm run chromatic -w @church/ui         # needs CHROMATIC_PROJECT_TOKEN in the environment
npm install <pkg>@<version> -w <workspace>   # add a dependency where it is used
```

No git hook runs anything: nothing stops a push to `main` or a push with a type
error. Run `npm run verify` yourself before calling work done or opening a PR.

Lint fails on errors. Besides Prettier and the recommended rules, `@repo/eslint-config`
rejects `console.log` and its siblings (`console.warn` / `console.error` are
allowed; `packages/tokens/src/scripts` is exempt), arbitrary Tailwind values
(`bg-[#fff]`, `text-[13px]`) and inline `style` colours.

## Layout

```
packages/ui/     @church/ui — the design system
                 src/components/{atoms,molecules,organisms}  src/components/utils/
                 src/lib/ (tailwind-variants, tailwind-merge)  src/models/{enums,types}
                 src/styles.css (maps @church/tokens into @theme)  .storybook/
apps/web/        app/ (routes; styles.css imports tailwindcss + @church/ui/styles.css)
apps/native/     app/ (expo-router)
packages/tokens/            @church/tokens — colors, typography, generated CSS
packages/eslint-config/     @repo/eslint-config (base, next-js, expo)
packages/typescript-config/ @repo/typescript-config (base, nextjs, react-library, react-native-library)
packages/docs/              design-system documentation (markdown)
```

A component is a PascalCase folder with `Component.tsx`, a barrel `index.ts`,
`Component.stories.tsx` (with the Figma link in `parameters.design`) and
`Component.spec.tsx`; add `Component.styles.ts` / `.types.ts` / `.context.ts`
and `components/` `data/` `hooks/` subfolders only when needed. Inside an app,
import via the `~` alias (= the app root), never `../../..`. Inside `packages/ui`,
reach another component, `lib`, `utils` or `models` through the package's own
exports (`@church/ui/atoms/Icon`, `@church/ui/lib/tailwind-variants`); a single
`../` to a sibling component is fine. Apps import the same paths.

**Workspace boundaries:** an app never imports from another app; shared code
goes to a package under `packages/` and is consumed through its `exports`. A new
workspace extends `@repo/typescript-config` and `@repo/eslint-config` and exposes
`lint` / `typecheck` (and `test` if it has specs) so turbo picks it up.

## Rules lint does not catch

Prettier owns formatting — do not hand-format. Everything below is unenforced by
tooling, which is why it is here:

- No `as unknown as T`, `as never`, or `!` non-null assertion to silence a type
  error — handle the undefined case. In tests, type mocks as the real interface
  (or `Partial<T>` / `jest.mocked`), never as `never`/`unknown`.
- To observe behaviour, write a spec that asserts it — never a debug log.
- No hardcoded spacing or sizes outside the token-backed utilities, and no
  CSS-in-JS (lint catches arbitrary values and inline colours, not inline
  spacing). A missing value goes into `packages/tokens` first. Variants via
  `tv` from `@church/ui/lib/tailwind-variants`.
- No `list[1]` or nested access on an assumed shape without a length check,
  optional chaining, or an early return.
- Await every service promise and handle its rejection **before** any UI signal
  implying success (closing a dialog, success toast, navigation).
- No new library for what an adopted dependency already does (forms:
  react-hook-form + zod; state: zustand; tables: @tanstack/react-table;
  DnD: @dnd-kit; motion: motion; toasts: react-toastify).
- Comments in English, max five lines including markers, opening with `why:`,
  `hazard:` or `invariant:`. Never narrate what the code does.

## Testing

Jest 30 with `@swc/jest`, jsdom, setup at `packages/ui/jest.setup.ts`.

- Every component created or modified ships a passing colocated spec, and a
  design-system component also ships its story.
- **No real network calls.** Mock `fetch` / the service module with `jest.mock`,
  `jest.fn()` or `jest.spyOn` — there is no MSW layer.
- Partial `jest.mock` must spread `jest.requireActual` and override only what it
  mocks.
- Each awaited service call needs a rejection-path test; each assumed array or
  object shape needs a boundary case.
- Synthetic fixtures only, with obviously fake values.

## Sensitive data

The product holds church members' data, and religious affiliation is sensitive
personal data under LGPD (Lei 13.709/2018, art. 5º, II). Never hardcode, commit,
fixture, log, or paste into a prompt: real member data, names, documents,
addresses, contacts, family relations, donations/tithes, attendance, pastoral
notes, credentials, tokens. Secrets come from environment variables. Anonymize
before using production data to reproduce a bug.

## More

- `docs/constitution.md` — the normative rules, their rationale, the
  AI-governance principles, and how they line up with the harness gates.
- `docs/commit-convention.md` — gitmoji + Conventional Commits, monorepo scopes.
- `packages/docs/` — design-system documentation (color system, and
  `figma-components.md`: which `@church/ui` component or token stands in for
  each Lamb Figma component, text style and variable).
- `.agents/skills/` — load a skill when its trigger matches (`commit-organizer`,
  `open-pr`, `the-judge`, `tlc-plan`, `tlc-implement`, `figma-implement-design`,
  …) instead of inlining it.

An agent implements, refactors, reviews and drafts; a human gives the final
"safe to merge".
