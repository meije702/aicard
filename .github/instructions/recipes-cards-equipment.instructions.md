---
applyTo: "**/*.recipe.md,**/*.card.md,**/*.equipment.md"
---

# Recipe, card & equipment files

These are AICard's data formats — a compact Markdown DSL the parser reads, and
files a real user might read or write. Full specs:
`docs/AICard_Recipe_Format.md` and `docs/AICard_Card_Format.md`.

## Rules

- **Domain vocabulary applies to file content too**, and it is user-facing:
  write `purpose`, `step`, `equipment` — never workflow/node/integration. A
  card's `purpose` and a Send Message's text are read by Maria; keep them plain
  and warm, no jargon, no internal syntax.
- **Line endings: LF.** (The parser tolerates CRLF, but keep fixtures LF.)
- These files intentionally use a **compact format** — heading directly above
  its content, config lists without surrounding blank lines. markdownlint is
  deliberately relaxed for them via per-directory `.markdownlint.jsonc`; don't
  "fix" the spacing.

## Recipe format (`*.recipe.md`)

`# Title` → `> Purpose` (one blockquote) → `## Kitchen` (equipment list, or
`None`) → `## Steps`. Each step is `### N. Step name`, then a declaration on
its own line — `*Card: Type*` or `*Recipe: Name*` (Level 3 sub-recipe) — then
`- Key: Value` config. A config value may reference an earlier step's output
with `{step N: field name}`; the runner resolves it.

## Card format (`*.card.md`)

`# Name` → `> Purpose` → `## Equipment` → `## Config` → optional `## Technique`
with `### Voice` / `### Constraints` / `### Expertise`. Only the three v1 card
types exist (Listen, Wait, Send Message) — do not invent new ones.

## Equipment format (`*.equipment.md`)

`# Name` → `> Purpose` → `## Mode` (`api-key` or `compose`) → `## Documentation`
→ `## Steps` → `## Config Fields` → optional `## Technique`. `compose` mode
means hand-off ("Ready — sends via you"), `api-key` means it can act directly
("Connected"); keep that distinction honest.
