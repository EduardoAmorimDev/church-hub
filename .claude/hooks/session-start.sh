#!/bin/sh
# why: a CLAUDE.md line alone is a soft rule the model can skip under load;
# additionalContext reaches the model on every session, so the constitution
# binds every change, not only work that started from a spec.

printf '%s\n' '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"This project'"'"'s constitution at docs/constitution.md is binding for every code change made in this session, including small ad-hoc requests with no spec behind them -- read it before editing code. AGENTS.md at the repository root carries the commands (npm + turbo: npm run verify) and the rules lint does not catch. Where the constitution and the harness disagree, see the constitution section \"Relationship to the Harness Toolkit\"."}}'
