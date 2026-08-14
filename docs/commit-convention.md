# Commit Message Convention

Format below:

```
<emoji> <type>(<scope>): <description>
```

- **`<emoji>`** — the Gitmoji that best captures the change's _dominant_ intent. One per commit; when a change touches more than one concern, pick the one that would matter most to someone scanning `git log` (see Priority order below).
- **`<type>(<scope>)`** — the Conventional Commits type (`feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `perf`, `style`, `ci`, `build`, `revert`, …) plus the scope, derived from the path of the main changed file (see Scopes below).
- **`<description>`** — short, present-tense, in English.

Note the two fields answer different questions: `<type>` is the _mechanical_ nature of the change (is this a fix, a feature, cleanup?), while the emoji is the _semantic_ flavor within that (a bug fix that's `🐛` critical-looking vs `🩹` a one-liner; a `refactor` that's a `♻️` behavior-preserving rewrite vs a `🚚` pure file move). This repo's history pairs the same emoji with several different `<type>`s depending on what actually happened — that's expected, not a bug in the convention.

Use the **Unicode emoji character** (`✨`), not the colon code (`:sparkles:`). Most of this repo's history predates the convention (plain `feat: …` subjects with no emoji and no scope); follow the convention from now on and do not rewrite old commits.

## Scopes

This is a monorepo, so the scope names the workspace first. Take the main changed file's path and:

1. Drop a leading `apps/` or `packages/` — the workspace name (`web`, `native`, `tokens`, `eslint-config`, …) becomes the first segment.
2. Drop the generic `components` and `src` segments and the file extension.
3. Kebab-case every segment, and collapse a file name that repeats its folder name.
4. Keep at most 4 segments; when over budget, drop generic layer segments (`hooks`, `components`, `data`) first.

| Main changed file                                                    | Scope                                 |
| -------------------------------------------------------------------- | ------------------------------------- |
| `packages/ui/src/components/atoms/Button/Button.tsx`                 | `ui/atoms/button`                     |
| `packages/ui/src/components/organisms/Table/hooks/useColumnOrder.ts` | `ui/organisms/table/use-column-order` |
| `apps/web/app/styles.css`                                            | `web/app/styles`                      |
| `apps/native/app/_layout.tsx`                                        | `native/app/layout`                   |
| `packages/tokens/src/colors.ts`                                      | `tokens/colors`                       |
| `turbo.json`, root `package.json`                                    | `root`                                |

A change spread evenly across several workspaces (e.g. a token rename touching `tokens` and every app) takes the workspace where the change originates.

## Priority order

When a change could plausibly wear more than one hat, walk this list top to bottom and stop at the first one that applies. Higher entries signal something a reviewer or a future `git bisect` needs to see first; lower entries are progressively more "housekeeping."

| #   | Emoji               | Code                                       | Wins when…                                                                                                           |
| --- | ------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| 1   | 🚑️                  | `:ambulance:`                              | The change is a critical hotfix shipped outside the normal flow (pairs with a `hotfix/` branch — see below).         |
| 2   | 🔒️                  | `:lock:`                                   | It fixes a security or privacy issue.                                                                                |
| 3   | 💥                  | `:boom:`                                   | It's a breaking change (pair with `!` after the scope or a `BREAKING CHANGE:` footer — see below).                   |
| 4   | 🐛                  | `:bug:`                                    | A real bug fix — the kind with an incident, a repro, or non-trivial cause.                                           |
| 5   | 🩹                  | `:adhesive_bandage:`                       | A small, low-risk fix for a non-critical issue — a one-liner, a typo-grade logic slip.                               |
| 6   | ✨                  | `:sparkles:`                               | New feature or functionality, from scratch.                                                                          |
| 7   | ♻️                  | `:recycle:`                                | Refactor that preserves behavior — restructuring, extracting, simplifying.                                           |
| 8   | 🚚                  | `:truck:`                                  | Pure move/rename of files, paths or routes — nothing else changed.                                                   |
| 9   | ⚡️                  | `:zap:`                                    | Performance improvement (measured or clearly intentional).                                                           |
| 10  | 💄                  | `:lipstick:`                               | UI/visual/style-driven change — including a refactor whose purpose is styling.                                       |
| 11  | 🚸                  | `:children_crossing:`                      | UX improvement that isn't purely visual (focus handling, animation timing, feedback).                                |
| 12  | 🦺                  | `:safety_vest:`                            | Validation logic (form rules, guards).                                                                               |
| 13  | 👔                  | `:necktie:`                                | Business logic (domain rules, eligibility, calculations).                                                            |
| 14  | 🛂                  | `:passport_control:`                       | Authorization / roles / permissions.                                                                                 |
| 15  | 🏷️                  | `:label:`                                  | TypeScript types only.                                                                                               |
| 16  | ✅                  | `:white_check_mark:`                       | Tests added, updated, or made to pass.                                                                               |
| 17  | 🧪                  | `:test_tube:`                              | A failing test added deliberately (WIP/TDD red step) — rare.                                                         |
| 18  | 📝                  | `:memo:`                                   | Documentation or Storybook stories.                                                                                  |
| 19  | 🔧                  | `:wrench:`                                 | Config files (`eslint.config.mjs`, `turbo.json`, `next.config.js`, `tsconfig.json`, `.storybook/`, CI yaml content). |
| 20  | ⬆️ / ⬇️             | `:arrow_up:` / `:arrow_down:`              | Dependency version bump (up/down).                                                                                   |
| 21  | ➕ / ➖             | `:heavy_plus_sign:` / `:heavy_minus_sign:` | Adding/removing a dependency (not just bumping).                                                                     |
| 22  | 🍱                  | `:bento:`                                  | Static assets (images, videos, fonts).                                                                               |
| 23  | 🗃️                  | `:card_file_box:`                          | Database-related change.                                                                                             |
| 24  | 👽️                  | `:alien:`                                  | Adapting to an external API's change.                                                                                |
| 25  | 🔥                  | `:fire:`                                   | Removing code or files that are still referenced/reachable elsewhere.                                                |
| 26  | ⚰️                  | `:coffin:`                                 | Removing dead code — confirmed unreachable.                                                                          |
| 27  | 🚨                  | `:rotating_light:`                         | Fixing lint/compiler warnings only.                                                                                  |
| 28  | 🎨                  | `:art:`                                    | Pure formatting (Prettier, reordering) — zero logic change.                                                          |
| 29  | 🔀                  | `:twisted_rightwards_arrows:`              | Merge commit (usually automatic, rarely hand-written).                                                               |
| 30  | _(everything else)_ | —                                          | Generic housekeeping — see full table below.                                                                         |

## Full lookup table

All officially defined Gitmojis ([gitmoji.dev](https://gitmoji.dev)). The Priority order above decides between candidates; this table is the dictionary.

| Emoji | Code                          | Meaning                                                             |
| ----- | ----------------------------- | ------------------------------------------------------------------- |
| ✨    | `:sparkles:`                  | Introduce new features                                              |
| 💄    | `:lipstick:`                  | Add or update the UI and style files                                |
| ♻️    | `:recycle:`                   | Refactor code                                                       |
| 🏷️    | `:label:`                     | Add or update types                                                 |
| 👔    | `:necktie:`                   | Add or update business logic                                        |
| 🐛    | `:bug:`                       | Fix a bug                                                           |
| 🩹    | `:adhesive_bandage:`          | Simple fix for a non-critical issue                                 |
| 🔧    | `:wrench:`                    | Add or update configuration files                                   |
| 📱    | `:iphone:`                    | Work on responsive design                                           |
| 🚸    | `:children_crossing:`         | Improve user experience / usability                                 |
| ✅    | `:white_check_mark:`          | Add, update, or pass tests                                          |
| 📝    | `:memo:`                      | Add or update documentation                                         |
| ⚡️    | `:zap:`                       | Improve performance                                                 |
| 🧑‍💻    | `:technologist:`              | Improve developer experience                                        |
| 🔥    | `:fire:`                      | Remove code or files                                                |
| 🚚    | `:truck:`                     | Move or rename resources (files, paths, routes)                     |
| 🔀    | `:twisted_rightwards_arrows:` | Merge branches                                                      |
| ⬆️    | `:arrow_up:`                  | Upgrade dependencies                                                |
| ➕    | `:heavy_plus_sign:`           | Add a dependency                                                    |
| ⚰️    | `:coffin:`                    | Remove dead code                                                    |
| 🍱    | `:bento:`                     | Add or update assets                                                |
| 🚧    | `:construction:`              | Work in progress                                                    |
| 💬    | `:speech_balloon:`            | Add or update text and literals                                     |
| 🦺    | `:safety_vest:`               | Add or update code related to validation                            |
| 🛂    | `:passport_control:`          | Work on authorization, roles and permissions                        |
| ♿️    | `:wheelchair:`                | Improve accessibility                                               |
| ⏪️    | `:rewind:`                    | Revert changes                                                      |
| 👽️    | `:alien:`                     | Update code due to external API changes                             |
| ✏️    | `:pencil2:`                   | Fix typos                                                           |
| 🥅    | `:goal_net:`                  | Catch errors                                                        |
| ➖    | `:heavy_minus_sign:`          | Remove a dependency                                                 |
| 🔨    | `:hammer:`                    | Add or update development scripts                                   |
| 🗃️    | `:card_file_box:`             | Perform database related changes                                    |
| 🙈    | `:see_no_evil:`               | Add or update a `.gitignore` file                                   |
| 💩    | `:poop:`                      | Write bad code that needs to be improved                            |
| 💫    | `:dizzy:`                     | Add or update animations and transitions                            |
| 🚑️    | `:ambulance:`                 | Critical hotfix                                                     |
| 👷    | `:construction_worker:`       | Add or update CI build system                                       |
| 📈    | `:chart_with_upwards_trend:`  | Add or update analytics or track code                               |
| 🔇    | `:mute:`                      | Remove logs                                                         |
| 🔐    | `:closed_lock_with_key:`      | Add or update secrets                                               |
| 🚨    | `:rotating_light:`            | Fix compiler / linter warnings                                      |
| 🔒️    | `:lock:`                      | Fix security or privacy issues                                      |
| 🎨    | `:art:`                       | Improve structure / format of the code                              |
| ⚗️    | `:alembic:`                   | Perform experiments                                                 |
| 🍻    | `:beers:`                     | Write code drunkenly. Joke entry in the official spec — do not use. |
| 💥    | `:boom:`                      | Introduce breaking changes                                          |
| 🚀    | `:rocket:`                    | Deploy stuff                                                        |
| 🎉    | `:tada:`                      | Begin a project                                                     |
| 🔖    | `:bookmark:`                  | Release / version tags                                              |
| 💚    | `:green_heart:`               | Fix CI build                                                        |
| ⬇️    | `:arrow_down:`                | Downgrade dependencies                                              |
| 📌    | `:pushpin:`                   | Pin dependencies to specific versions                               |
| 🌐    | `:globe_with_meridians:`      | Internationalization and localization                               |
| 📦️    | `:package:`                   | Add or update compiled files or packages                            |
| 📄    | `:page_facing_up:`            | Add or update license                                               |
| 💡    | `:bulb:`                      | Add or update comments in source code                               |
| 👥    | `:busts_in_silhouette:`       | Add or update contributor(s)                                        |
| 🏗️    | `:building_construction:`     | Make architectural changes                                          |
| 🤡    | `:clown_face:`                | Mock things                                                         |
| 🥚    | `:egg:`                       | Add or update an easter egg                                         |
| 📸    | `:camera_flash:`              | Add or update snapshots                                             |
| 🔍️    | `:mag:`                       | Improve SEO                                                         |
| 🌱    | `:seedling:`                  | Add or update seed files                                            |
| 🚩    | `:triangular_flag_on_post:`   | Add, update, or remove feature flags                                |
| 🗑️    | `:wastebasket:`               | Deprecate code that needs to be cleaned up                          |
| 🧐    | `:monocle_face:`              | Data exploration/inspection                                         |
| 🩺    | `:stethoscope:`               | Add or update healthcheck                                           |
| 🧱    | `:bricks:`                    | Infrastructure related changes                                      |
| 💸    | `:money_with_wings:`          | Add sponsorships or money related infrastructure                    |
| 🧵    | `:thread:`                    | Multithreading or concurrency                                       |
| ✈️    | `:airplane:`                  | Improve offline support                                             |
| 🦖    | `:t-rex:`                     | Code that adds backwards compatibility                              |

## Disambiguation

- **🐛 vs 🩹** — both are "fix," split by weight. `🐛` is for a fix with a real cause to explain (an incident, a repro someone had to chase, a wrong calculation). `🩹` is for the kind of one-line correction that doesn't need investigation — a wrong prop, an off-by-one, a missed null check. When in doubt, `🩹` is the safer default; escalate to `🐛` only if you'd want it called out in a changelog.
- **♻️ vs 🚚 vs 💄 vs ⚡️** — all four can look like "refactor" in the diff. Pick by _why_ you touched the file: nothing about behavior changed and it's just cleaner (`♻️`); the only change is the file's location/name (`🚚`); it's about how something looks or the styling code (`💄`); it's about how fast something runs (`⚡️`). A refactor motivated by a performance concern is `⚡️`, not `♻️`.
- **🔥 vs ⚰️ vs 🗑️** — `🔥` removes code/files that are still in use elsewhere (a page, a route, a whole feature being sunset). `⚰️` removes code already confirmed dead (unreachable, unused export). `🗑️` is for marking something as deprecated without removing it yet — this repo has never used it; prefer just removing the code (`🔥`/`⚰️`) or leaving a `TODO`.
- **👔 vs 🦺 vs 🛂** — all three are "domain logic," split by role. `👔` is the business rule itself (eligibility, a calculation, a workflow decision). `🦺` is specifically about validating input (form rules, guard clauses that reject bad data). `🛂` is specifically about who's allowed to do something (roles, permissions, `canOpenX` checks).
- **🎨 vs 💄** — `🎨` is Prettier/formatting only, zero visual or logic difference. `💄` is an actual visual/style change a user could see or Tailwind classes / tokens being changed with intent.
- **✅ vs 🧪** — `✅` covers the normal case: a test added/updated/fixed to pass. `🧪` is specifically a test written to fail on purpose (red step of TDD, or reproducing a bug before fixing it) — rare enough that most PRs will never use it.

## Breaking changes

Conventional Commits' breaking-change markers (`!` after the scope, or a `BREAKING CHANGE:` footer) have not been used in this repo yet. Pair either one with 💥 `:boom:`. In a monorepo the usual breaking change is a shared package changing its contract under its consumers — a renamed token, a removed component prop:

```
💥 refactor(tokens/colors)!: renames `grey` primitives to `neutral`
```

or

```
💥 feat(ui/atoms/button): replaces `intention` prop with `color`

BREAKING CHANGE: `<Button intention="danger">` no longer compiles;
use `<Button color="destructive">`.
```

## Hotfix branches

`🚑` is also used as a **branch-name prefix** for fixes that must ship outside the normal flow: `hotfix/<short-description>`, cut from `main` and merged back into `main` by pull request. Regular work uses `feat/…`, `fix/…`, `refactor/…` branches, also targeting `main`.

## Body examples

The body is optional and explains _why_, not _what_ — skip it when the summary line is self-explanatory. Wrap at 72 columns. An illustrative example of the level of detail expected:

```
💄 feat(ui/atoms/tag): adds the `subtle` variant from the Lamb DS

The backoffice member list needs a low-emphasis status tag that the
filled variant was too loud for. Colors come from the existing neutral
alpha tokens, so dark mode follows the token inversion with no extra
rules; no new token was needed.
```
