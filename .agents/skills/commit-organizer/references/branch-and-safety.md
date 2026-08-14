# Branch guard and safety

Load this from step 2 of `SKILL.md` when the current branch is protected, or
when the user asks to move the work to another branch. Also the full reference
for the quarantine list in step 3.

**Contents:** Why the guard exists · Naming the branch · Moving the work ·
When a stash is genuinely required · Choosing the base · Quarantine — paths ·
Quarantine — content · What to do with a quarantined file

## Why the guard exists

This repo has a single trunk, `main`, and every PR targets it. It has **no git
hooks and no branch-protection script**: nothing local refuses a commit on
`main`, and nothing local refuses `git push origin main`. Committing a 40-file
implementation straight onto `main` succeeds quietly, and so would the push.
The work is not lost, but recovering it means moving commits between branches,
which is exactly the history editing this skill is not allowed to do
(Principle X). Guarding before the first commit costs one question; guarding
after costs a rescue.

With no repo-declared list to read, the protected set is a fixed fallback plus
whatever the remote calls its default branch:

```bash
remote_default=$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null)
protected="main master ${remote_default#origin/}"
```

`master` is not used here; it stays in the set because the cost of an extra
entry is nothing, and the set must only ever err towards over-protecting. If
`origin/HEAD` is unset the expansion adds an empty word and the fixed pair
still applies.

## Naming the branch

This repo's branches follow:

```
<type>/<kebab-description>
```

Real examples from history:

```
feat/adds-navigation-components
fix/fix-vulnerable-dependencies
refactor/tokens-package
```

(One legacy branch, `feat-update-react-and-storybook`, uses a hyphen instead of
the slash — do not propose that shape.)

`<type>` matches the Conventional Commits type of the dominant change
(`feat`, `fix`, `refactor`, `chore`, `test`, `docs`, `perf`), plus `hotfix`
for an urgent fix, named `hotfix/<short-desc>` and cut from `main`.

**Propose a name, don't just ask for one.** Derive `<type>` from the dominant
change you already inventoried and build a kebab description from what the
change does (or from a `<repo>/specs/` directory name if one drove the work).
Offer it and accept a correction — a blank prompt makes the user do work you
have the information for.

Then verify it is free, before switching:

```bash
git rev-parse --verify --quiet "refs/heads/<name>" && echo "EXISTS — pick another"
git ls-remote --exit-code --heads origin "<name>" >/dev/null 2>&1 && echo "EXISTS ON REMOTE"
```

A name that exists locally makes `switch -c` fail cleanly. A name that exists
only on the remote succeeds locally and sets up a collision at push time —
check both.

## Moving the work

```bash
git switch -c <name>
```

That is the whole operation. **`git switch -c` carries the entire working tree
to the new branch** — tracked modifications, staged content and untracked files
alike — with no stash involved.

Do **not** do this:

```bash
git stash && git switch -c <name> && git stash pop     # unnecessary and lossy
```

Three reasons:

1. **It is not needed.** Nothing about `switch -c` from `HEAD` requires a clean
   tree. The stash and the pop cancel out.
2. **`git stash` without `-u` does not include untracked files.** A new
   component folder is untracked, so the stash holds a fraction of the change
   while the rest travels with the working tree anyway — two mechanisms moving
   one change, for no gain.
3. **`git stash pop` can conflict, and then the work is trapped.** A pop onto a
   diverged tree leaves `both modified` and git keeps the stash entry — the
   change is now split between a stash entry and a half-merged file, a worse
   starting position than before the stash, and recovering it needs exactly the
   history surgery this skill forbids.

## When a stash is genuinely required

One case only: the new branch must start from a **different commit** than the
current `HEAD` — here, a freshly fetched `origin/main` that local `main` is
behind.

```bash
git switch -c <name> origin/main
```

This still carries the working tree, but only when no dirty file would be
overwritten by the checkout:

| Situation | Result |
|---|---|
| Dirty file that the new base does **not** touch | Switches, file carried over |
| Dirty file that the new base **does** modify | `error: Your local changes … would be overwritten` → **aborts, nothing lost** |

The refusal is safe and informative, so the algorithm is *try, then fall back* —
never stash pre-emptively:

```bash
git fetch --quiet origin
git switch -c <name> origin/main || {
  git stash push -u -m "commit-organizer: moving to <name>"   # -u: untracked included
  git switch -c <name> origin/main
  git stash pop
}
```

If that `stash pop` conflicts, **stop and hand it to the user** with the stash
reference. Do not attempt to resolve it and do not drop the stash — an
unresolved pop with the entry still present is recoverable; a dropped stash is
not.

## Choosing the base

New branches here are cut from a freshly fetched `origin/main`. Run
`git fetch --quiet origin`, then compare:

```bash
git rev-list --count HEAD..origin/main    # 0 = local HEAD already has everything
git rev-list --count origin/main..HEAD    # >0 = local commits on main not yet pushed
```

- **Behind by 0** — `HEAD` and `origin/main` are the same base for this
  purpose; branch from `HEAD` with a plain `git switch -c <name>`. Do not ask.
- **Behind by more than 0** — ask, with exactly two options (a genuine
  either/or, so `AskUserQuestion` fits):
  - **Branch from the current `HEAD`.** No stash, no conflict path; the code
    stays on the base it was written and tested against.
  - **Branch from `origin/main`** (the repo's convention). May need the stash
    fallback above, and it moves the code onto a base it was never tested
    against — so if the user picks it, say that the verification in step 9 is
    now load-bearing rather than confirmatory.
- **Ahead by more than 0** — local `main` already holds unpushed commits. They
  will be part of the new branch either way; report them and let the user
  decide what to do with local `main` afterwards. Resetting it is not this
  skill's job.

Do not offer to rebase, reset or pull. Those change existing history or
existing commits.

## Quarantine — paths

Never in a commit without the user's explicit per-file approval in this
session. Matching is on the path:

```
.env                    .env.*                  *.pem
*.key                   *.p12                   *_rsa
*_rsa.pub               id_ed25519*             credentials*
*secret*                *.keystore              serviceAccount*.json
.npmrc                  .netrc                  *.mobileprovision
```

**Only four env variants are gitignored** (`.env.local`,
`.env.development.local`, `.env.test.local`, `.env.production.local`, at any
depth, via the root `.gitignore`). Those never reach the inventory. A plain `.env`,
`.env.development` or `.env.production` is *not* ignored and appears as an
ordinary untracked file — that is the hazard. Note that `turbo.json` lists
`.env*` as build inputs, so such files are expected to exist in working trees.

Also exclude, as a different category — wrong rather than dangerous:

```
node_modules/   .next/   .turbo/   .swc/   out/   build/   dist/
coverage/   .expo/   web-build/   packages/ui/storybook-static/
*storybook.log   tsconfig.tsbuildinfo   npm-debug.log*
```

These are gitignored in this repo, so they should not appear; if one does, the
ignore rules have drifted and that is worth reporting rather than committing.

## Quarantine — content

Path matching misses a secret pasted into a source file, so scan the staged
diff text of every group before committing it. Look at added lines only
(`git diff --cached -U0 | grep '^+'`), and treat a hit as a stop-and-ask, never
an auto-exclude — a false positive in a fixture is common and the user decides.

Two families are needed, and the second is the one that gets forgotten.
**Keyword-anchored** patterns catch `token = "..."`; they miss a secret assigned
to an innocuously named variable. **Prefix-anchored** patterns catch the value
itself regardless of the variable name, which is how real leaks look:
`export const a = "ghp_…"` is invisible to every keyword pattern and obvious to
a prefix one. Tokens also hide inside `package.json` scripts (a CLI flag such as
`--project-token=`), so scan manifests too.

```
# prefix-anchored — the value identifies itself
ghp_[A-Za-z0-9]{20,}            github_pat_[A-Za-z0-9_]{20,}
gho_[A-Za-z0-9]{20,}            chpt_[A-Za-z0-9]{10,}
sk-[A-Za-z0-9-]{20,}            xox[baprs]-[A-Za-z0-9-]{10,}
AKIA[0-9A-Z]{16}                AIza[0-9A-Za-z_-]{35}
eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.
-----BEGIN [A-Z ]*PRIVATE KEY-----

# keyword-anchored — the name identifies it
(secret|token|passwd|password|api_?key|bearer|authorization:)[[:space:]]*[:=]

# personal data (Principle V applies inside fixtures too)
[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}-?[0-9]{2}                          # CPF
(\+?55[[:space:]]?)?\(?[1-9][0-9]\)?[[:space:]]?9?[0-9]{4}-?[0-9]{4}  # BR phone
[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}                    # email
```

Discard email hits whose domain is `example.com` / `example.org`. The phone
pattern also matches an unformatted 11-digit CPF; either way it is a stop-and-ask.

This repo holds church members' data, and religious affiliation is sensitive
personal data under the LGPD (art. 5º, II) — a real member's name, contact or
membership record in a fixture, story or `data/` mock is the same violation as
one in production code. Principle V puts fixtures explicitly inside this rule.
If a fixture holds a real-looking value, the finding is "replace it with an
obviously synthetic placeholder", not "exclude the file".

**Never quote the matched value back to the user.** Name the file, the line and
the shape (`packages/ui/src/components/molecules/Foo/data/mock.ts:42 — CPF-shaped
literal`). Repeating the value into the chat is a second egress of the same
data, and the chat transcript is itself an AI-tool artifact under Principle V.

## What to do with a quarantined file

1. Exclude it from the plan.
2. Name it in the closing report, with the reason, so the user knows it is
   still sitting uncommitted in the working tree.
3. If the user wants it committed, require them to name the file explicitly.
   "Commit everything" is not approval for a quarantined path — the whole point
   of the list is that the blanket instruction is the thing being guarded
   against.
4. For a content hit inside a file that genuinely belongs in the commit, the
   fix is to change the content first (a synthetic placeholder, an env var),
   then re-inventory. Committing it and cleaning up afterwards does not work:
   the value stays in history and removing it needs history editing, which is
   out of scope here and expensive everywhere. A secret that is *already* in
   history is out of this skill's reach — tell the user it needs rotating.
