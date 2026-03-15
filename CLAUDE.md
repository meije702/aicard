# AICard — Claude Code Instructions

**Read `AGENTS.md` first.** This file contains Claude Code-specific instructions that extend it. Everything in AGENTS.md applies to you — this file adds Claude-specific behavior.

## Claude-specific configuration

- **Sous chef model**: `claude-sonnet-4-6` — this is the model the sous chef calls via the Anthropic API. Do not change this without discussion.
- **If unsure about a term**, check `docs/AICard_Domain_Language.md` before inventing one.

## What we are building (v1 scope)

See AGENTS.md for the full scope definition. The short version:

- **Level 1** (Following) and **Level 2** (Tweaking) only
- Three card types: Listen, Wait, Send Message
- No backend, no auth, no Level 3+

When tempted to build more, ask: **"Does Level 1 work yet?"**

## Commands

See AGENTS.md for the full list. Quick reference:

```bash
deno install           # install / sync dependencies
deno task dev          # start the dev server (Vite, http://localhost:5173)
deno task test         # run the test suite (deno test)
deno task build        # build frontend + compile binary → ./aicard
deno check src/        # type-check all source files
```

## Language rules

See the domain vocabulary table in AGENTS.md. Use it consistently in code, comments, UI strings, and variable names.

## The seven principles

See AGENTS.md for the condensed version. The full document is at `docs/Seven_Principles_of_Engineering_Thinking.md`.
