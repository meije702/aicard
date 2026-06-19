# AGENTS.md — AICard

This file is the primary instruction set for any AI coding agent working on AICard. It is self-contained: everything you need to contribute correctly is here or linked from here.

If you are Claude Code, also read `CLAUDE.md` for Claude-specific instructions.

---

## What AICard is

AICard is an open-source platform that lets ordinary people build automations using a recipe-and-ingredient metaphor — without writing code, understanding APIs, or thinking like an engineer.

**Core thesis**: if you can follow a recipe, you can build with AI.

## Read these first

Before generating any code, tests, or documentation, read these files. They are the authoritative source:

- `docs/MANIFESTO.md` — the vision and philosophy. The "why."
- `docs/AICard_Domain_Language.md` — the shared vocabulary. **Source of truth for all terminology.**
- `docs/AICard_Personas.md` — Maria, Jun, Sam. Every decision is tested against them.
- `docs/AICard_User_Journeys.md` — the step-by-step user experiences we are building toward.
- `docs/AICard_Recipe_Format.md` — the exact file format for recipes.
- `docs/AICard_Card_Format.md` — the exact file format for card type definitions.
- `docs/Seven_Principles_of_Engineering_Thinking.md` — the mindset to apply to every decision.
- `docs/kitchen-counter.md` — open questions and things to figure out.

Do not generate code until you have read `AICard_Domain_Language.md` and `Seven_Principles_of_Engineering_Thinking.md` at minimum.

---

## Domain vocabulary — hard constraint

Use these terms in all code, comments, UI strings, variable names, and documentation:

| Say this | Not this |
|----------|----------|
| recipe | workflow, pipeline, automation |
| card | node, action, step (when you mean the type) |
| step | task, item (when you mean a position in a recipe) |
| kitchen | workspace, environment, project |
| equipment | integration, connector, service |
| pantry | library, marketplace, registry |
| sous chef | assistant, agent, copilot, bot |
| purpose | description, summary (in recipe context) |

**If you find yourself writing "workflow", "node", "action", "integration", "connector", "assistant", or "agent" in code, comments, variable names, or UI strings — STOP. You are using the wrong term. Consult `docs/AICard_Domain_Language.md`.**

Wrong vocabulary is the single fastest signal that a contribution was generated without project context. PRs using incorrect terms will be closed.

---

## v1 scope — the fence

**Level 1** (Following), **Level 2** (Tweaking), and **Level 3** (Combining) are implemented and tested.

- **Level 1**: a user opens a recipe, the sous chef checks their kitchen, and the recipe runs.
- **Level 2**: a user opens a card in a running recipe and changes a setting.
- **Level 3**: a recipe step can call another recipe via `*Recipe: Name*`. Sub-recipe execution uses the `OnSubRecipe` callback pattern with `createSubRecipeRunner` factory (max depth 3).

### What not to build yet

- User accounts or authentication
- Recipe sharing mechanics
- The full pantry (8 card types) — v1 has 3: Listen, Wait, Send Message
- Level 4 or 5 features
- A mobile-specific UI
- Any backend server

---

## Roadmap — what comes after v1

### v4 — Techniques and house style ✓ Implemented

Cards are agent skills. Techniques teach the sous chef how to use each skill well. See `docs/AICard_Techniques.md` for the full design.

- Each card type gets a **technique** document (Voice, Constraints, Expertise) injected into the sous chef's prompt when that card executes
- Each kitchen gets a **house style** — the user's voice and preferences — that shapes all text generation
- A **kitchen journal** records what happened and what the user changed. Recent corrections become few-shot examples in prompts

This is structured prompting, not model training. It works with any provider Maria has connected.

Key implementation files: `src/sous-chef/prompt-context.ts` (prompt assembly), `src/kitchen/journal.ts` (kitchen journal with pruning), `src/ui/Kitchen.tsx` (house style editor).

### v5 — Pattern detection (not yet designed)

The kitchen journal enables the sous chef to notice patterns and suggest defaults:
"You always change the greeting — want me to update the default?"

### v6 — New card types (not yet designed)

Expanding the pantry beyond Listen, Wait, Send Message. Candidates: Filter, Transform, Branch.

**Note**: the self-improving model system (fine-tuning, LoRA adapters, training pipelines) is a separate research project and is not on this roadmap.

---

## The v1 stack

- **Runtime**: Deno — test runner, type checker, compiler
- **Frontend**: React + TypeScript, bundled by Vite, runs entirely in the browser
- **Distribution**: `deno compile` produces a single `./aicard` binary that serves the bundled app
- **Recipe/card parsing**: deterministic parser that reads Markdown formats defined in docs
- **Sous chef**: calls any of 5 providers via `createSousChef(config)` — Anthropic, OpenAI, Gemini, Mistral, or Ollama (local, no key required). Each provider has a sensible default model; the user picks which provider and model to use
- **Card execution**: each card type has an executor; v1 ships with: Listen, Wait, Send Message
- **Storage**: browser localStorage for kitchen state; file system access via `<input type="file">`
- **No backend required for v1** — except the Anthropic API for the sous chef

---

## Project structure

```text
aicard/
  docs/                          ← project documents (read-only reference)
    adr/                         ← architecture decision records (001–005)
  src/
    parser/                      ← recipe, card, and equipment file parsers
      recipe-parser.ts
      parse-steps.ts             ← step parsing (extracted from recipe-parser)
      card-parser.ts
      equipment-parser.ts
      card-type.ts               ← card type normalisation
      section-helpers.ts         ← markdown section extraction
      wizard-response-parser.ts  ← sous chef wizard JSON parsing
    cards/                       ← card type executors
      listen.ts
      wait.ts
      send-message.ts
      card-executor.ts           ← shared executor interface
      resolve-value.ts           ← config value and step-reference resolution
    kitchen/                     ← kitchen state, equipment, and journal
      kitchen-state.ts
      equipment.ts
      journal.ts                 ← append-only kitchen journal with pruning
    runner/                      ← wires everything together
      recipe-runner.ts           ← execution loop; accepts injected ExecutorRegistry
      run-types.ts               ← shared runner types (extracted from recipe-runner)
      recipe-readiness.ts        ← pre-flight checks (SRP: separate from runner)
      run-state-repository.ts    ← persistence abstraction for run state
      sub-recipe-runner.ts       ← Level 3 sub-recipe execution factory
    sous-chef/                   ← the AI collaborator
      sous-chef.ts               ← createSousChef: readiness, describe, hat options, ask
      client.ts                  ← sousChefAsk: Anthropic SDK + OpenAI-compatible fetch
      providers.ts               ← provider metadata (Anthropic, OpenAI, Gemini, Mistral, Ollama)
      prompts.ts                 ← system prompts and context builders
      prompt-context.ts          ← technique, house style, journal injection
      equipment-prompts.ts       ← equipment wizard prompt generation
      tour-prompts.ts            ← recipe tour stop generation
    liteparse/                   ← photo-to-recipe transcription (experimental)
      liteparse.ts
      liteparse-prompt.ts
    ui/                          ← React components
      App.tsx                    ← router and provider setup
      Kitchen.tsx                ← main application shell
      RecipeView.tsx             ← recipe reading/running interface
      CardConfig.tsx             ← live config tweaking panel
      SousChef.tsx               ← hat button and sous chef orchestration
      StepInteraction.tsx        ← user-input form rendered during a running step
      StepItem.tsx               ← individual step with status indicators
      EquipmentPanel.tsx         ← equipment readiness and connection UI
      MarkdownText.tsx           ← markdown renderer for sous chef responses
      sous-chef-storage.ts       ← SousChef setup persistence (localStorage)
      provider-logos.tsx         ← SVG logos for each provider
      equipment-icon.ts          ← equipment icon mapping
      markdown-blocks.ts         ← markdown block parser
      kitchen/                   ← kitchen sub-components
        HouseStyleForm.tsx
        RecipesList.tsx
      providers/                 ← sous chef provider config
        SousChefProviders.tsx    ← provider selection and API key config
        ProviderConfigPanel.tsx  ← expandable key input with brand tinting
        KeyInput.tsx             ← API key input with doc link
        OllamaSetup.tsx          ← Ollama model picker and troubleshooting
      recipe/                    ← recipe view sub-components
        RecipeRunArea.tsx        ← run/stop buttons, readiness hints
        RecipeWarningBanners.tsx ← wait-step and paused-recipe warnings
      sous-chef/                 ← sous chef UI sub-components
        HatPanel.tsx             ← options menu, ask input, answer display
        ToastContainer.tsx       ← toast notification rendering
      tour/                      ← interactive recipe tour
        RecipeTour.tsx
        TourOverlay.tsx
        TourPopover.tsx
        use-tour-position.ts
      wizard/                    ← equipment setup wizard
        EquipmentWizard.tsx
        WizardStepRenderer.tsx
        WizardTextField.tsx
        WizardPasswordField.tsx
        WizardSelectField.tsx
        WizardInfoField.tsx
        WizardConfirmField.tsx
        field-catalog.ts
      hooks/                     ← custom React hooks
        use-equipment-wizard.ts
        use-hat-menu.ts
        use-recipe-execution.ts
        use-recipe-interaction.ts
        use-recipe-review.ts
        use-theme.ts
        use-toast-manager.ts
    test/                        ← test infrastructure
      bdd/                       ← custom BDD runner (ADR-004)
      helpers/                   ← fixture loader and recipe builder
    features/                    ← BDD step definitions (.feature + .steps.test.ts)
    fixtures/                    ← example recipes, cards, and equipment definitions
      pantry/                    ← card type definitions (.card.md)
      equipment/                 ← equipment definitions (.equipment.md)
    types.ts                     ← shared domain types
    main.tsx                     ← React app entry point
    server.ts                    ← Deno HTTP server (binary target)
  AGENTS.md                      ← this file
  CLAUDE.md                      ← Claude Code-specific instructions
  CONTRIBUTING.md                ← contribution guidelines
  deno.json                      ← Deno config
  vite.config.ts                 ← Vite config (browser bundle)
```

---

## Commands

```bash
deno install                # install / sync dependencies
deno task dev               # start dev server (Vite, http://localhost:5173)
deno task test              # run the test suite (deno test --allow-read src/)
deno task lint              # lint all source files (deno lint src/)
deno task verify            # check + lint + test — run before each commit
deno task build             # build frontend + compile binary → ./aicard
deno task build:frontend    # build the React app into dist/ only
deno task compile           # compile dist/ + server.ts → ./aicard binary
deno check src/             # type-check all source files
```

---

## Architecture

The data flow is: **Recipe file → Parser → Recipe object → Runner → CardExecutor → CardResult → RecipeContext**

- **Parser layer** (`src/parser/`): Markdown → typed objects. Deterministic. No AI. Errors accumulate in `errors[]` arrays — parsers never throw.
- **Executor layer** (`src/cards/`): Each card type implements the `CardExecutor` interface. v1 has three executors: Listen, Wait, Send Message.
- **Kitchen state** (`src/kitchen/`): Equipment tracking. Persistence behind `KitchenRepository` interface; production impl uses localStorage.
- **Recipe runner** (`src/runner/`): Orchestrates parsing, kitchen checks, and step execution. Readiness logic in `recipe-readiness.ts`; run-state persistence behind `RunStateRepository` interface.
- **Sous chef** (`src/sous-chef/`): Anthropic API calls for user guidance. Not involved in parsing or execution — only in the user experience.
- **UI layer** (`src/ui/`): React components mapping to user journeys.

---

## Testing

- **Run tests**: `deno test --allow-read src/`
- **Quality gates**: `deno task verify` runs the full set — type-check (`deno check src/`), lint (`deno lint src/`), and tests. CI runs the same three plus markdown lint, so a contribution that passes `deno task verify` locally will pass CI.
- **Unit tests**: `*.test.ts` files next to the source they test
- **BDD features**: `src/features/*.steps.test.ts` using custom step registry in `src/test/bdd/`
- **Fixtures**: `src/fixtures/` — example `.recipe.md` and `.card.md` files used by tests
- **Assertion library**: `@std/assert` (mapped from `jsr:@std/assert` in `deno.json`)
- **Principle 3**: write the test or define success criteria before writing implementation

---

## Code generation rules

1. **Domain vocabulary is non-negotiable.** Use the correct terms. Always.
2. **TypeScript strict mode.** No `any` types. No unused variables or parameters.
3. **File naming**: `kebab-case.ts`. Card files: `card-type-name.card.md`. Recipe files: `recipe-name.recipe.md`.
4. **Clarity beats cleverness.** A readable 20-line function beats a clever 5-line one.
5. **Comments explain why, not what.** The code explains what.
6. **Trade-off comments**: When making a simplifying assumption, add `// TRADE-OFF: [what you're giving up]`.
7. **No premature abstractions.** Three similar lines of code is better than a helper used once.
8. **Parsers never throw.** Accumulate errors in `errors[]` arrays.
9. **No new dependencies** without prior discussion in an issue.

---

## The seven principles (condensed)

Apply these to every technical decision:

1. **Blame systems, not people** — if a design fails, fix the design
2. **Solve problems, not implement solutions** — start with the user need
3. **Define "done" before you start** — test first, code second
4. **Writing forces thinking** — if you can't name it, you don't understand it
5. **Clarity beats cleverness** — readable > clever
6. **Work small, learn fast** — parser before executor, executor before UI
7. **Embrace trade-offs** — name what you're giving up

---

## Persona validation

Before suggesting any change, test it:

- **UI text or user-facing change**: "Would Maria understand this without knowing what an API is?" If not, rewrite it.
- **File format change**: "Can Jun open this in a text editor and understand exactly what it does?" If not, the format is too opaque.
- **Architecture change**: "Would Sam consider this technically sound, not just a friendly label on a mess?" If not, there's no substance.

Priority: build for Maria first, then Jun. Sam will find value if they are well served.

---

## What not to do

- Do not add dependencies without discussion
- Do not expand v1 scope
- Do not rename domain terms
- Do not introduce abstractions that are not needed yet
- Do not submit bulk changes — keep PRs small and focused
- Do not generate code you cannot explain
- Do not ignore failing tests

---

## AI contribution disclosure

Use commit message trailers:

- Trivial changes (typos, formatting): no disclosure needed
- Meaningful changes (new functions, tests, logic): `Assisted-By: [tool name]`
- Substantially generated (entire files, large features): `Generated-By: [tool name]`

See `CONTRIBUTING.md` for the full AI contribution policy.

---

## Cross-references

- `CLAUDE.md` — Claude Code-specific behavioral instructions (extends this file)
- `CONTRIBUTING.md` — full contribution guidelines for humans and AI agents
- `docs/` — all project design documents
