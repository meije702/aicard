# AICard — Claude Code Instructions

**Read `AGENTS.md` first.** This file contains Claude Code-specific instructions that extend it. Everything in AGENTS.md applies to you — this file adds Claude-specific behavior.

## Claude-specific configuration

- **Sous chef model**: each provider has a sensible default (see `src/sous-chef/providers.ts`). The user picks which provider and model to use.
- **If unsure about a term**, check `docs/AICard_Domain_Language.md` before inventing one.

## What we are building (v1 scope)

See AGENTS.md for the full scope definition. The short version:

- **Level 1** (Following), **Level 2** (Tweaking), and **Level 3** (Combining)
- Three card types: Listen, Wait, Send Message
- No backend, no auth, no Level 4+

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

## Engineering thinking enforcement

After completing any coding task (new code, modifications, refactors, bug fixes), invoke the `/engineering-thinking-code` skill to review the changes against the seven principles before considering the work done.
