# Resolving the base branch

Load this from step 2 of `SKILL.md` when a long-lived branch other than `main`
exists on the remote, when HEAD is a protected branch, or when the user
disputes the proposal.

**Contents:** Why not the remote default · When more than one long-lived branch
exists · Edge cases · What not to do

## Why not the remote default

`origin/HEAD` points at the repository's default branch, which answers "where do
clones start", not "where does this work belong". Today the two coincide —
`main` is the only long-lived branch and every PR so far targets it — so the
proposal in `SKILL.md` is `main` by elimination. That stops being safe the day
an integration or release branch appears, which is what this file is for.

## When more than one long-lived branch exists

Reachability alone cannot tell two candidates apart when one contains the
other: "the candidate that is an ancestor of HEAD" fails as soon as the
candidate advances after the branch was cut, and "the candidate with the most
recent merge-base" favours whichever branch is contained in the other. Ask
about **unique** history instead: does the branch's fork point with a candidate
carry commits that exist in no other candidate?

```bash
cands=(main other-long-lived-branch)          # from step 2's listing
proved=()
for c in "${cands[@]}"; do
  mb=$(git merge-base "origin/$c" HEAD 2>/dev/null) || continue
  others=(); for o in "${cands[@]}"; do [ "$o" = "$c" ] || others+=("origin/$o"); done
  inherited=$(git rev-list --count "$mb" --not "${others[@]}" 2>/dev/null)
  [ "${inherited:-0}" -gt 0 ] && proved+=("$c")
done
```

Run it only with two or more candidates: with an empty `others`, `--not` takes
no arguments, the count includes everything reachable, and it reports a proof
nothing established.

- **Exactly one proved** → propose it as *provado*, with the count.
- **None proved** → the fork point sits in shared history, and git cannot tell.
  Say so and ask; there is no branch-prefix rule in this repository to fall
  back on.
- **More than one proved** → do not choose, and do not pick the larger count (a
  bigger count means an older fork point, not a better base). Report both and
  ask.

## Edge cases

**HEAD is itself a protected branch.** Stop, as step 1 says. With a single
trunk there is no sync PR to open; if the user describes one (merging `main`
into a new long-lived branch), take the base from the user explicitly and say
in the body which direction it goes. Never derive one.

**The branch's own range is empty.** `git rev-list --count origin/$base..HEAD`
is 0. Either the work is already merged, or the branch was never advanced. Stop
and say which — `git branch -r --contains HEAD` distinguishes them.

**The branch was cut from another feature branch (a stacked PR).** A PR
against `main` then includes the parent's commits. Detect it before proposing:

```bash
git branch -r --contains "$(git merge-base "origin/$base" HEAD)" \
  | grep -v -E "origin/($(echo $protected | tr ' ' '|'))$" | grep -v HEAD | head
```

A non-protected remote branch that contains the fork point is a candidate
parent. If one shows up and it is not this branch, say so and ask whether the
base should be that branch instead — a stacked PR reviews better, but it is the
user's call, and the PR must be retargeted when the parent merges.

**The user passed a base explicitly.** It wins. Still report what step 2 would
have proposed when the two differ, in one sentence.

## What not to do

- **Do not use `@{upstream}`.** It is the remote copy of this same branch, so it
  answers "what have I not pushed", a different question.
- **Do not rebase or merge to make the base cleaner.** Being behind the base is
  normal; rewriting history is out of scope.
- **Do not ask GitHub whether the merge is clean.** `mergeable` is computed
  lazily and can return `UNKNOWN` on a first read. `git merge-tree
  --write-tree` answers locally: exit 0 clean, exit 1 conflict, and
  `--name-only` lists the conflicted paths.
