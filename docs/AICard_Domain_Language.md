# AICard Domain Language

This is the shared vocabulary for AICard. Use these terms in code, comments, UI strings, and documentation. Do not invent synonyms.

---

## Core terms

### Recipe

A file (`.recipe.md`) that describes a sequence of steps toward a purpose. Recipes are human-readable. A recipe has a name, a purpose, a kitchen section (equipment needed), and a steps section.

**Not**: workflow, pipeline, automation, flow, process

### Card

A type of action that a recipe step can perform. Cards are defined in `.card.md` files in the pantry. Each card type does one thing. A card is the *type* — a step uses a card.

**Not**: node, action, trigger, output (those are technical terms)

### Step

A single item in a recipe's Steps section. A step has a number, a name, and a card type. A step is a position in a recipe — it uses a card. Do not say "card" when you mean "step."

### Kitchen

The user's workspace. The kitchen contains their equipment, their pantry, and their recipes. The kitchen is backed by localStorage in v1.

**Not**: workspace, environment, project, dashboard

### Equipment

A connected service — a shop, an email account, a calendar. Equipment is what makes certain cards work. Equipment lives in the kitchen.

**Not**: integration, connector, service, plugin

### Pantry

The collection of card type definitions available to the kitchen. The pantry contains `.card.md` files. In v1, the pantry is bundled with the app.

**Not**: library, marketplace, registry, store

### Sous Chef

The AI collaborator. Not a chatbot. A quiet helper that checks kitchen readiness, describes what is happening, and taps the user on the shoulder when something needs attention.

**Not**: assistant, agent, copilot, bot, AI

### Purpose

A one-sentence description of what a recipe does, written from the user's perspective. In a recipe file, this is the blockquote under the title.

**Not**: description, summary (outside of recipe context), objective

### Pantry card / Card definition

The `.card.md` file that defines a card type. It specifies what the card does, what equipment it needs, and what configuration it accepts.

### Technique

The structured knowledge that makes the sous chef competent at a specific card. A technique lives in the `.card.md` file and defines the card's voice, constraints, and expertise. When the sous chef executes a card, the technique is injected into its prompt.

In the broader LLM ecosystem, a card is an *agent skill* and a technique is what teaches the agent how to use that skill well.

**Not**: skill, prompt, instruction, personality, behavior

### House style

The user's voice and preferences, stored in the kitchen. House style is injected into every card that generates text. Example: "informal tone, use first names, sign off with 'Warme groet, Maria'."

A restaurant has a house style — the way *this* kitchen does things. So does an AICard kitchen.

**Not**: preferences, settings, voice profile, persona

### Kitchen journal

An append-only log of what happened during recipe runs. Records events, user corrections, and approvals. The sous chef uses recent journal entries as few-shot examples — corrections from past runs improve future ones.

**Not**: event log, audit trail, history, ledger

---

## Recipe file terms

### Kitchen section

The `## Kitchen` section of a recipe file. Lists the equipment the recipe needs.

### Steps section

The `## Steps` section of a recipe file. Contains the ordered list of steps.

### Card step

A step whose action is a card type: `*Card: Listen*`

### Sub-recipe step

A step that calls another recipe: `*Recipe: Name*`

### Config

The key-value settings under a step. Config keys use plain English: `How long: 3 days`, not `duration: 3`.

---

## Status terms

### Ready

A kitchen or recipe that has all required equipment connected and is able to run.

### Missing equipment

A specific piece of equipment that a recipe needs but the kitchen does not have connected.

### Running

A recipe that is currently executing steps.

### Paused

A recipe that has been interrupted (e.g., the browser tab was closed during a Wait step).

### Complete

A recipe that has finished all steps successfully.

---

## Level terms (for user progression)

- **Level 1 — Following**: running a recipe written by someone else
- **Level 2 — Tweaking**: changing config values in a running recipe
- **Level 3 — Combining**: connecting recipes together
- **Level 4 — Creating**: writing a recipe from scratch
- **Level 5 — Inventing**: building a new card type

---

## What to avoid

| Say this | Not this |
|----------|----------|
| recipe | workflow, pipeline, automation |
| card | node, action, step (when you mean the type) |
| kitchen | workspace, environment, project |
| equipment | integration, connector, service |
| pantry | library, marketplace, registry |
| sous chef | assistant, agent, copilot, bot |
| purpose | description, summary (in recipe context) |
| technique | skill, prompt, instruction |
| house style | preferences, voice profile, persona |
| kitchen journal | event log, audit trail, history |
