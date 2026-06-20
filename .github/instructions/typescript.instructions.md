---
applyTo: "**/*.ts,**/*.tsx"
---

# TypeScript & React (Deno)

These add to `.github/copilot-instructions.md` for the app's source.

## Architecture to respect

Data flows: **recipe file → parser → Recipe → runner → CardExecutor → result →
context.** Keep these boundaries:

- **Parsers** (`src/parser/`) turn Markdown into typed objects. Deterministic,
  no AI. They **never throw** — they return a `ParseResult` / discriminated
  union carrying any problems. Don't make a parser raise.
- **Card executors** (`src/cards/`) implement the `CardExecutor` interface:
  `type`, `checkEquipment`, `execute`, and `describe`. `describe()` is as
  important as `execute()` — Maria reads it ("Waiting 3 days…"), so write it in
  plain language, never internal syntax.
- **Runner** (`src/runner/`) takes an injected `ExecutorRegistry` and uses
  repository interfaces for persistence (dependency inversion) — don't hardcode
  executors or `localStorage` access into the runner.
- **Sous chef** (`src/sous-chef/`) is the only place that calls an AI provider;
  it is never involved in parsing or execution.

## Conventions

- Single quotes, no semicolons; **do not run `deno fmt`** (it inverts the
  house style). Match the file you're editing.
- TypeScript strict: no `any`, no unused vars/params. Buttons need an explicit
  `type`. Prefer `globalThis` over `window`.
- Tests are `*.test.ts` next to the source; BDD features live in
  `src/features/*.steps.test.ts`. Import assertions via the bare specifier
  `@std/assert` (mapped in `deno.json`), never an inline `jsr:`/`npm:`/`https:`
  specifier.
- **No React component/UI unit tests** (ADR-005) — verify UI behaviour in the
  browser instead.

## Before you finish

Run `deno task verify` (type-check + lint + tests). It must pass.
