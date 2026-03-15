# Contributing to AICard

We're glad you're here. AICard is built on the idea that if you can follow a recipe, you can build with AI — and that extends to contributing. Whether you're a human or an AI agent, the bar is the same: understand the project, respect the vocabulary, stay in scope, and test your work.

## Before you contribute

Read these documents first. They are short and they are the source of truth:

1. [docs/MANIFESTO.md](docs/MANIFESTO.md) — the vision and philosophy
2. [docs/AICard_Domain_Language.md](docs/AICard_Domain_Language.md) — the shared vocabulary
3. [docs/AICard_Personas.md](docs/AICard_Personas.md) — Maria, Jun, Sam
4. [docs/Seven_Principles_of_Engineering_Thinking.md](docs/Seven_Principles_of_Engineering_Thinking.md) — the engineering mindset

If you have not read these, your contribution will likely not match the project's expectations. This applies whether you are a human or an AI agent.

## The scope fence

**v1 builds Level 1 (Following) and Level 2 (Tweaking) only.**

- Level 1: a user opens a recipe, the sous chef checks their kitchen, and the recipe runs.
- Level 2: a user opens a card in a running recipe and changes a setting.

### What not to build yet

- User accounts or authentication
- Recipe sharing mechanics
- The full pantry (8 card types) — v1 has 3: Listen, Wait, Send Message
- Level 3, 4, or 5 features
- A mobile-specific UI
- Any backend server

When tempted to build these, ask: **"Does Level 1 work yet?"** If no, build that first. Out-of-scope PRs will be closed.

## How to contribute

### Report a bug

Open an issue using the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md). Describe what you expected, what happened, and which persona is affected.

### Fix a bug

1. Find or open an issue describing the bug.
2. Write a failing test first (Principle 3: define "done" before you start).
3. Fix the bug.
4. Verify the test passes.
5. Open a PR linking the issue.

### Propose a feature

1. Open an issue using the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) **before writing code**.
2. The feature must be within v1 scope.
3. Wait for discussion before starting work.

Do not submit unsolicited feature PRs. This is the most common source of wasted effort.

### Improve documentation

Welcome. Use the correct [domain language](docs/AICard_Domain_Language.md).

## Development setup

### Prerequisites

- [Deno](https://deno.com/) installed

### Commands

```bash
deno install                # install dependencies
deno task dev               # start dev server (http://localhost:5173)
deno task test              # run the test suite
deno task build             # build frontend + compile binary → ./aicard
deno task build:frontend    # build the React app into dist/ only
deno task compile           # compile dist/ + server.ts → ./aicard binary
deno check src/             # type-check all source files
```

### Testing

- **Unit tests**: `*.test.ts` files next to the source they test
- **BDD features**: `src/features/*.steps.test.ts` with step definitions
- **Fixtures**: `src/fixtures/` contains example `.recipe.md` and `.card.md` files
- **Test runner**: Deno's native test runner (`deno test --allow-read src/`)
- **Philosophy**: parsers accumulate errors in an `errors[]` array — they never throw

## Code conventions

### Domain language

Use the project vocabulary in all code, comments, UI strings, and variable names:

| Say this | Not this |
|----------|----------|
| recipe | workflow, pipeline, automation |
| card | node, action, step (when you mean the type) |
| kitchen | workspace, environment, project |
| equipment | integration, connector, service |
| pantry | library, marketplace, registry |
| sous chef | assistant, agent, copilot, bot |
| purpose | description, summary (in recipe context) |

If you catch yourself using a term from the "Not this" column, stop and use the correct one.

### TypeScript

- Strict mode enabled. No `any` types. No unused variables or parameters.
- File naming: `kebab-case.ts`
- Card files: `card-type-name.card.md`
- Recipe files: `recipe-name.recipe.md`

### Style

- Clarity beats cleverness. A readable 20-line function beats a clever 5-line one.
- Comments explain *why*, not *what*.
- When making a simplifying assumption, add a `// TRADE-OFF:` comment naming what you're giving up.
- Don't add abstractions you don't need yet. Three similar lines of code is better than a premature helper.

## Contributing with AI assistance

We welcome AI-assisted contributions. AICard is a project about making AI accessible — it would be hypocritical to ban AI from our own development process.

But we have seen open source projects overwhelmed by contributions that compile but don't understand the project. PRs that add features nobody asked for, use the wrong vocabulary, or pass tests by testing the wrong thing. Our approach is systemic, not punitive: we build guardrails that make bad contributions easy to spot, not rules that punish people for using tools.

### Disclosure

We use a tiered disclosure model with commit message trailers:

- **Trivial changes** (typo fixes, formatting, one-line fixes): no disclosure needed.
- **Meaningful changes** (new functions, tests, logic changes, documentation sections): include an `Assisted-By: [tool name]` trailer in the commit message.
- **Substantially generated** (entire files, large refactors, new features where AI did most of the work): include a `Generated-By: [tool name]` trailer and note this in the PR description.

### The quality bar does not change

AI-assisted or not, every contribution must:

- Use the correct domain language
- Be testable against the personas ("Would Maria understand this?")
- Include tests if it changes behavior
- Stay within v1 scope
- Follow the seven engineering principles

### What gets a PR closed quickly

- Uses wrong terminology ("workflow" instead of "recipe", "node" instead of "card")
- Adds features outside v1 scope without prior discussion
- Includes no tests for behavioral changes
- Cannot articulate *why* the change is needed (the PR describes "what" but not "why")
- Contains generated code the contributor cannot explain if asked
- Bulk changes across many files that could have been smaller, focused PRs

These are not punishments — they are signals. If a PR hits multiple items on this list, it was likely generated without sufficient project context.

## Commit messages

```
area: imperative description of the change

Optional body explaining why, not what.

Assisted-By: Claude Code
Fixes #42
```

**Areas**: `parser`, `cards`, `ui`, `runner`, `sous-chef`, `kitchen`, `docs`, `ci`, `meta`

- First line: imperative mood, under 72 characters
- Body: explain *why* the change is needed
- Trailers: `Assisted-By:`, `Generated-By:`, `Fixes #N` as applicable

## Pull request process

1. Fork the repository and create a branch from `main`.
2. Make your changes. Write tests. Use the domain language.
3. Run `deno task test` and `deno check src/` locally.
4. Open a PR using the [pull request template](.github/PULL_REQUEST_TEMPLATE.md).
5. Fill in every section of the template — especially "Why".
6. Wait for review. Respond to feedback.

Every PR must pass CI (type checking + tests) before review.

## Questions?

Open a discussion or an issue. There are no dumb questions — only unclear documentation that we should fix (Principle 1: blame systems, not people).
