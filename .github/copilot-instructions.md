# Copilot instructions for AICard

AICard is an open-source, no-code tool that lets ordinary people build with AI
using a **recipe-and-card** metaphor — no APIs, no coding. Core
thesis: *if you can follow a recipe, you can build with AI.* It is a Deno +
React + TypeScript app that runs entirely in the browser and ships as a single
`./aicard` binary. There is no backend.

When generating code or reviewing a pull request, hold contributions to the
rules below. `AGENTS.md` and `CONTRIBUTING.md` are the fuller source of truth;
`docs/ROADMAP.md` is the plan.

## Domain vocabulary — hard constraint

Use these terms everywhere — code, comments, identifiers, UI strings, docs.
Wrong vocabulary is the fastest sign a change was written without project
context. **Flag any violation in review.**

| Say this | Not this |
|----------|----------|
| recipe | workflow, pipeline, automation |
| card | node, action, step (for the type) |
| step | task, item (for a position in a recipe) |
| kitchen | workspace, environment, project |
| equipment | integration, connector, service |
| pantry | library, marketplace, registry |
| sous chef | assistant, agent, copilot, bot |
| purpose | description, summary (in a recipe) |

Legitimate exceptions: third-party names (LangGraph "nodes", n8n "nodes"),
the `AGENTS.md` filename, and "AI agent" describing an external tool — none of
these rename AICard's own concepts.

## Scope fence — do not expand v1

v1 is **Level 1 (Following), Level 2 (Tweaking), Level 3 (Combining)**, three
card types (**Listen, Wait, Send Message**), and five sous chef providers
(Anthropic, OpenAI, Gemini, Mistral, Ollama). Do **not** add: user accounts or
auth, recipe-sharing mechanics, new card types, a backend server, a mobile-only
UI, or Level 4+ features. New work belongs to a roadmap phase — flag scope
creep. When tempted to build more, ask "does Level 1 work yet?"

## The seven principles

1. Blame systems, not people.
2. Solve the user's problem, not a pre-chosen solution.
3. Define "done" before you start — test or success criteria first.
4. Writing forces thinking — if you can't name it, you don't understand it.
5. Clarity beats cleverness — a readable 20-line function beats a clever 5-line one.
6. Work small, learn fast — parser before executor before UI.
7. Embrace trade-offs — name what you give up with a `// TRADE-OFF:` comment.

## Code rules

- **TypeScript strict.** No `any`. No unused variables or parameters.
- **Parsers never throw.** They accumulate problems and return them (the
  `ParseResult` / discriminated-union pattern); they do not raise.
- **File names are kebab-case.** Recipe/card/equipment files:
  `name.recipe.md`, `type-name.card.md`, `name.equipment.md`.
- **No new dependencies** without prior discussion in an issue.
- **No premature abstractions** — three similar lines beats a helper used once.
- Comments explain **why**, not what.
- Buttons always declare an explicit `type` (default `type="button"`).

## House style — not `deno fmt`

The project uses **single quotes and no semicolons**, and intentionally does
**not** run `deno fmt` (it would invert the style across the codebase). Match
the surrounding style by hand. "Linted" means `deno lint` + markdownlint, both
enforced in CI — never `deno fmt`.

## Quality gates

Every change must keep these green (run before committing):

```bash
deno task verify   # type-check (deno check) + deno lint + deno test
```

Markdown is linted separately (`markdownlint-cli2` over `**/*.md`); CI runs
both. UI behaviour is **not** unit-tested (ADR-005) — verify it in the browser
and describe the check, rather than adding component tests.

## Persona test

Build for **Maria** (a non-technical shopkeeper) first, then **Jun** (a curious
builder); **Sam** (a developer) is served if the substance is sound. For any
user-facing text: "would Maria understand this without knowing what an API is?"
If not, rewrite it.
