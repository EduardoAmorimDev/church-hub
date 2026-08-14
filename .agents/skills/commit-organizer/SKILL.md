---
name: commit-organizer
description: >
  Turns a finished, uncommitted implementation into an ordered series of
  semantic commits — one per coherent piece of the change — following this
  repo's Gitmoji + Conventional Commits convention. Groups files that belong
  to the same piece, orders the commits so each one builds on the last, writes
  the messages, and asks for approval before creating anything. Guards against
  committing on a protected branch (offers to create a feature branch and
  carry the work over) and against committing secrets or environment files.
  Use when the user invokes /commit-organizer, or asks to commit finished work,
  split changes into commits, organize commits, or commit a large
  implementation semantically. Does NOT push, open a PR, rebase, or amend.
model: claude-opus-5
effort: high
argument-hint: "[branch-name]"
---

# Commit organizer (church-hub)

**Internal** skill. Input: a working tree holding a finished, tested
implementation. Output: a series of commits on a non-protected branch, each one
a single coherent piece of the change, each message following
`<repo>/docs/commit-convention.md`.

**Path notation.** `<repo>/` marks a path in the **host repository**, resolved
as `"$(git rev-parse --show-toplevel)/…"` — never relative to this skill
directory and never a hardcoded absolute path. An unqualified `references/`
path means a file inside this skill bundle. A bare relative path inherits
whatever the reader's working directory happens to be, which is why every
out-of-bundle citation here carries the marker.

The convention itself is **not restated here** — that document is authoritative
for emoji choice, priority order, `<type>`, the scope rule, disambiguation and
body style. Read it in step 6. This skill covers what it does not: how to cut
one large change into commits, in what order, and what must never be committed.

Typical run: 25–50 changed files across `apps/*` and `packages/*` → 4–9
commits, ordered so each type-checks, presented as a plan for one approval,
then created.

## Reference files — load when the trigger fires

- `references/grouping.md` — the layer map of this monorepo, a worked example,
  and the edge cases (renames, generated artifacts, formatting-only changes,
  lockfile-only changes, splitting a single file). **Load in step 4 whenever
  the change spans more than ~10 files, or includes any rename, deletion, or
  generated file.**
- `references/branch-and-safety.md` — the protected-branch flow, choosing the
  new branch's base, when a stash is genuinely required, and the full
  quarantine pattern list. **Load in step 2 whenever the current branch is
  protected, or the user asks to move the work to another branch.**

## 0. Limits — read before running

Four constitution principles (`<repo>/docs/constitution.md`) govern this
skill and are not negotiable:

1. **Principle X — the AI is not the final authority.** This skill creates
   local commits only. It MUST NOT push, open a PR, merge, rebase, tag,
   `--amend`, or `--force` anything, and MUST NOT rewrite an existing commit.
   Pushing and PR creation belong to a separate skill. Every commit stays
   local and undoable until a human pushes it.
2. **Principle V — no sensitive data in the repository.** This app handles
   church members' personal data, and religious affiliation is *sensitive*
   personal data under the LGPD (Lei 13.709/2018, art. 5º, II). Step 3
   quarantines environment files, keys and credentials, and scans the staged
   content for secrets and personal data before each commit. Only four `.env`
   variants are gitignored here (`.env.local`, `.env.development.local`,
   `.env.test.local`, `.env.production.local`); a plain `.env` or
   `.env.development` shows up as an ordinary untracked file — never let one
   into a commit without the user saying so explicitly, in this session, for
   that file.
3. **Principle I — a component is not done without its test.** Never put a
   component in one commit and its spec in another. A commit that adds code
   without the test covering it violates Principle I *at that point in
   history*, which is exactly where `git bisect` and a reviewer will look.
4. **Principle XII — controlled parallelism.** Resolve in the current context.
   Reading diffs does not need subagents; if the change exceeds ~40 files and
   the diffs will not fit, use at most 3 concurrent readers and keep grouping
   decisions in the main context.

Out of scope, always: `git push`, `gh pr create`, rebasing, squashing,
amending, tagging, editing history, and touching any commit that already
exists. If the user asks for those, say they belong to the push/PR skill and
stop at the commits.

## 1. Repo preflight — stop conditions

Run these before anything else. Each one stops the run with a one-line reason:

```bash
git rev-parse --is-inside-work-tree                       # not a repo -> stop
git symbolic-ref --short HEAD                             # fails = detached HEAD -> stop
ls .git/rebase-merge .git/rebase-apply .git/MERGE_HEAD \
   .git/CHERRY_PICK_HEAD 2>/dev/null                      # any hit -> stop
git status --porcelain=v1 -uall                           # empty -> nothing to commit -> stop
git diff --cached --name-only                             # non-empty -> see below
```

- **Detached HEAD or an operation in progress** — stop. Committing into either
  produces work that is hard to find afterwards. Say which state it is and let
  the user resolve it.
- **Something is already staged** — this skill resets the index on every group,
  so a pre-existing staging arrangement will be lost. Report exactly what is
  staged and ask whether to fold it into the plan or stop. Never reset a
  populated index silently.
- **Record the starting commit** — `START=$(git rev-parse HEAD)`. This is the
  undo anchor and must appear in the closing report.

## 2. Branch guard

```bash
current=$(git symbolic-ref --short HEAD)
remote_default=$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null)
protected="main master ${remote_default#origin/}"
```

If `$current` is **not** in `$protected`: state the branch in one line and go
to step 3. Do not ask.

If it **is** protected: **load `references/branch-and-safety.md` and follow
it.** In summary — the work must move to a feature branch first, the branch
name comes from the user (offer one built from the repo's convention
`<type>/<kebab-description>`), and the move is `git switch -c <name>`, which
carries the whole working tree with no stash. Do not stash pre-emptively: an
unconditional `stash` → `switch` → `stash pop` adds a conflict path that can
trap the work in the stash, and it is unnecessary, because git carries
uncommitted changes across `switch -c` and refuses safely in the one case where
it cannot. The reference covers that case.

**Nothing else in this repo will catch it.** There are no git hooks (no
husky, no `pre-commit`, no `pre-push`), so a commit on `main` succeeds and a
later `git push` to `main` goes through locally. This guard, running before any
commit, is the only thing standing between the work and the trunk.

## 3. Inventory and quarantine

**Rename detection requires the index.** An editor-performed rename appears in
`git status` as an unrelated delete plus an untracked file; only a staged pair
resolves to `R`. So take the inventory through the index and put it back:

```bash
git add -A
git diff --cached -M --name-status      # authoritative inventory: A/M/D/R + similarity
git diff --cached -M --stat             # size per file, for grouping
git reset -q                            # index restored to empty; working tree untouched
```

Use `-uall` on any `git status` call. A bare `--porcelain` collapses an
untracked *directory* to one line, so a count taken from it under-reports a new
component folder as a single entry.

Then **quarantine**, before grouping. These never enter a commit without the
user's explicit per-file say-so in this session:

- `.env`, `.env.*`, and anything matching `*.pem`, `*.key`, `*.p12`, `*_rsa`,
  `credentials*`, `*secret*`, `serviceAccount*.json`.
- Any file whose staged diff contains a credential or personal-data shape —
  API tokens (`ghp_`, `chpt_`, `sk-`, …), private-key headers, a CPF-shaped
  literal, a phone number, a real-looking email that is not `@example.com`.
  Scan the diff text, not just the paths. **Never echo a matched value** —
  report only its shape and location.
- Build output that is not gitignored (`.next/`, `.turbo/`, `dist/`,
  `coverage/`, `storybook-static/`, `.expo/`).

Report the quarantine as its own list. A quarantined file is **excluded from
the plan**, not silently dropped: name it in the closing report so the user
knows it is still uncommitted.

## 4. Group into pieces

**Load `references/grouping.md` when the change spans more than ~10 files or
contains any rename, deletion or generated file.** The rules that apply on
every run:

1. **The colocated unit is one commit.** A component folder under
   `packages/ui/src/components/{atoms,molecules,organisms}` — `Foo.tsx`, `index.ts`,
   `Foo.stories.tsx`, and whichever of `Foo.spec.tsx`, `Foo.styles.ts`,
   `Foo.types.ts`, `Foo.context.ts` and the `components/`, `data/`, `hooks/`
   subfolders it has — is one piece. Atomic design (Principle II) means most
   groups are exactly one folder.
2. **A test ships with the code it covers.** Never a separate "adds tests"
   commit for code added in this same run. (Tests added for *pre-existing*
   code are their own ✅ commit — that is a different change.)
3. **A generated artifact rides with its source.** The tracked ones here are
   `apps/web/next-env.d.ts` and `apps/native/nativewind-env.d.ts`; each belongs
   with the change that made its tool regenerate it, never alone. The tokens
   CSS is generated into `packages/tokens/dist/` and is gitignored.
4. **A pure rename or move goes alone.** Mixing a move with an edit makes the
   diff unreadable, and the convention has a dedicated 🚚 for it.
5. **Formatting-only changes go alone** (🎨), never folded into a logic commit.
6. **Dependency changes go alone and first.** npm workspaces share one root
   lockfile, so a change to any `package.json`'s dependencies ships with
   `package-lock.json` in the same commit. A lockfile that moved with no
   manifest change is a question for the user, not an assumption.
7. **Shared types/enums** (`packages/ui/src/models/{enums,types}`): their own 🏷️
   commit when two or more pieces in this run consume them; folded into the
   consumer when only one does.
8. **The file is the atom.** Do not split one file across commits by default —
   a partially added file often does not compile, which breaks the ordering
   guarantee in step 5. Split a file only when it genuinely holds two unrelated
   changes, only with explicit confirmation, and never when the partial state
   would not type-check.
9. **Size sanity — diagnostic, not a budget.** Aim for 3–9 commits: the range
   measures whether the grouping found real seams, it is not a count to hit. A
   group above ~12 files usually hides two pieces — say so and propose the
   split. One commit for everything is a failure of this skill, not an outcome.
   A change that legitimately spans N independent consumers plus the shared
   layers beneath them has a floor of roughly N + the number of those layers,
   and that floor wins over the range: **the scope rule of step 6 and the
   buildable-order rule of step 5 are hard, the count is soft.** A run above
   the range states in the plan why, and names the merges it declined together
   with the rule that declined them — so the user can overrule it in one word.

When a `<repo>/specs/` directory drove the work (spec-driven flow, Principle
IX), read the plan or tasks file: its task boundaries are the best available
statement of where the pieces are. `<repo>/specs/` is gitignored here —
readable for intent, never part of a commit.

## 5. Order the commits

Order so that **each commit leaves the tree type-checking**, lower layers
first, and a lower workspace before the one that imports it:

dependencies → renames/moves → workspace config (`turbo.json`,
`packages/typescript-config`, `packages/eslint-config`) → tokens
(`packages/tokens`) → types & enums (`packages/ui/src/models`) → helpers
(`packages/ui/src/lib`, `packages/ui/src/components/utils`) → Storybook config
(`packages/ui/.storybook`) → `atoms` → `molecules` → `organisms` → routes
(`apps/web/app`, `apps/native/app`) → docs (`packages/docs`, `docs/`)

Two rules that override the layer order: a rename lands before any commit that
edits the renamed file, and anything a later commit imports lands before it.
If two groups are mutually dependent, they are one piece — merge them.

## 6. Write the messages

**Read `<repo>/docs/commit-convention.md` now** — resolve it as
`"$(git rev-parse --show-toplevel)/docs/commit-convention.md"` — for the emoji
priority order, the disambiguation rules, the scope rule and the body style.
Use the **unicode emoji**, not the colon code. What follows is only what that
document leaves open:

**Unit of emoji classification: the commit's own diff.** The priority walk is
applied per commit, against what that commit changes — never against the
feature it belongs to. "This is part of a new feature" is a fact about the
*branch*, not about the commit being classified, so a commit whose content is
only types takes the types value even inside a feature, a commit whose content
is the domain rule takes the business-logic value, and the feature value is for
the commits that actually add the reachable behaviour. Fix the subject of the
classification and the finer distinctions the convention documents become
reachable; leave it at branch altitude and a walk that stops at the first
applicable row returns one identical value for every commit in the run. Report
the choice in the step 7 plan table, so the user can override in one word.

**Scope derivation** — apply the convention's rule to the group's main file:
drop a leading `apps/` or `packages/` (the workspace name becomes the first
segment), drop the generic `components` segment and a leading `src/`, drop the
extension, kebab-case every segment, and collapse a file name that repeats its
folder. So `packages/ui/src/components/atoms/Button/Button.tsx` → `ui/atoms/button`,
`packages/tokens/src/colors.ts` → `tokens/colors`,
`apps/native/app/_layout.tsx` → `native/app/layout`, and a root config file
such as `turbo.json` → `root` (or the tool, `turbo`). **Max 4 segments**: when
over, drop generic layer segments (`hooks`, `components`) from the middle.
**Never drop the leaf** — it is the segment that identifies the thing changed.

**Message language: English, chat language unchanged.** The convention document
requires the `<description>` in English. The organisational instruction to
answer in Brazilian Portuguese governs the *conversation* — the plan table in
step 7, the report in step 9 — never the commit message itself. The artefact's
language is stated in `<repo>/docs/commit-convention.md` and only there.

**Subject budget: 72 characters total**, emoji included. When over, shorten in
this order: (1) tighten the description, (2) elide middle scope segments,
(3) move detail to the body. Never sacrifice the leaf or the type.

**Issue reference — optional.** There is no ticket system beyond GitHub
issues. If the user names an issue (`#N`) or the branch name carries one, add
it as a trailer; otherwise omit it and do not ask:

```
Refs: #N
```

**Body — only when it adds why.** Skip it when the subject is
self-explanatory; the diff already shows what changed. Use it for the reason,
the trade-off accepted, a risk, or a migration note.

**Co-authorship.** Append the Co-Authored-By trailer your harness specifies for
AI-assisted commits — Principle X makes AI involvement something a reviewer
should see rather than infer. Use whatever the current harness instruction
states; do not copy a model name from an older commit.

**Never use `git commit -m`.** Write each message to a file and use
`git commit -F`. This is not style: a subject containing a backtick or `$`
inside a double-quoted `-m` is silently mangled by the shell and **the commit
still succeeds** — a `` `Button` `` becomes empty and `$HOME` expands to the
developer's home path inside the recorded subject. Subjects that name a
component in backticks are the common case here. Write the file outside the
repository (the session scratchpad, or `${TMPDIR:-/tmp}`) with a quoted
heredoc so nothing interpolates:

```bash
cat > "$msgfile" <<'MSG'
🏷️ feat(web/models/enums/placement-enum): adds `PlacementEnum`
MSG
```

## 7. Present the plan and get one approval

Present a table in the chat, in commit order, **before creating anything**:

```
| # | emoji type(scope)                    | files | subject                       |
|---|--------------------------------------|-------|-------------------------------|
| 1 | ➕ chore(web/package)                 | 2     | adds @radix-ui/react-popover  |
| 2 | 🚚 refactor(web/utils/clone-icons)    | 7     | renames getClonedIcons …      |
```

Below it: one line per commit naming its files (paths only, folded for a
folder), then the quarantine list, then the total. Ask for one approval in
free text — accept "go", "all", edits ("merge 4 and 5", "reword 2", "drop 7"),
and per-commit selection by number. Apply edits and re-present only the changed
rows; a wording tweak needs no second approval, a regrouping does.

Do not use `AskUserQuestion` for the plan — the option count is too small for a
list of commits. Use it only for a genuine either/or, such as the branch base
in step 2.

## 8. Create the commits

One group at a time, index reset before each so a group can never inherit the
previous one's staging:

```bash
git reset -q
git add -- <paths for this group>          # a directory path stages the whole folder
git diff --cached --name-only              # confirm the set matches the plan
git commit -q -F "$msgfile"
```

For a rename, stage **both** the old and the new path in the same `git add`, or
git records a delete plus an add instead of an `R`.

**Stop on the first failure** — a commit git rejects, a conflict, an empty
commit. Report which commits were created, which group failed and why, and
leave the remaining groups uncommitted. Do not skip a failed group and carry
on: the ordering guarantee from step 5 is void the moment one is missing.

## 9. Verify and close

1. **Type-check the final tree**: `npm run typecheck` (Turborepo runs it in
   every workspace). Mandatory — no hook runs it before a push, so this is the
   last point where a broken tree is caught before it leaves the machine.
2. Offer `npm run verify` (typecheck + lint + tests; only `packages/ui` has
   Jest specs) if the user has not just run it. Offer per-commit type-checks
   only if they ask — it is N slow runs, and the ordering rules in step 5 are
   what make it usually unnecessary.
3. **Report**, in this order: the branch; each commit as short SHA + subject;
   anything left uncommitted, quarantine included, named explicitly; the undo
   command; and one line that nothing was pushed.

```bash
git reset --soft <START> && git reset -q   # undoes every commit, keeps all changes
```

4. Say plainly that push and PR are out of scope, and that a human still
   reviews before merge (Principle X).

## Self-check before presenting the plan

Run this list before step 7. It exists because the rules above are not reliably
followed mid-flow:

- [ ] Preflight ran: not detached, no operation in progress, `START` recorded
- [ ] A pre-existing staged index was reported, not silently reset
- [ ] The branch was checked against `main master` plus `origin/HEAD`'s target
- [ ] No temporary file was written inside the repository or to a hardcoded path
- [ ] If the branch was protected, the work moved before any commit was created
- [ ] Inventory taken through the index, so renames show as `R` and not D + `??`
- [ ] Every `.env*` and credential-shaped file is in the quarantine list, the
      staged *content* was scanned, and no matched value was echoed
- [ ] No commit separates a component from its spec or story
- [ ] Renames, formatting-only changes and dependency bumps are each alone
- [ ] Every `package.json` dependency change carries `package-lock.json`
- [ ] Every generated artifact sits with the source that regenerated it
- [ ] No file is split across commits without explicit confirmation
- [ ] Order puts every dependency before its consumer, lower workspace first
- [ ] A plan above 9 commits says why, and names the merges it declined and the
      rule that declined them
- [ ] Emoji is unicode, chosen by the priority order in `<repo>/docs/commit-convention.md`,
      walked against each commit's own diff and not the branch's headline intent
- [ ] Every scope follows the monorepo rule and has at most 4 segments
- [ ] Every subject description is in English; the plan and the report are in PT-BR
- [ ] Every subject ≤ 72 characters, leaf segment intact
- [ ] Every message goes through a file and `-F`; no `-m` anywhere
- [ ] The plan is presented and approved before the first commit exists
- [ ] Nothing in the plan pushes, amends, rebases or rewrites
