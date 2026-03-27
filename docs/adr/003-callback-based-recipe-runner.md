# ADR-003: Callback-based recipe runner

## Status
Accepted

## Context
The recipe runner (`src/runner/recipe-runner.ts`) orchestrates step-by-step execution of a recipe. The UI needs to know when steps start, complete, fail, or require user interaction. The runner must also support step review (Level 2) and sub-recipes (Level 3) without being coupled to any specific UI framework.

Three common patterns for this kind of orchestration:
1. Callbacks passed as function parameters.
2. Event emitter (pub/sub) pattern.
3. Observable/stream pattern (RxJS-style).

## Decision
Use callbacks passed directly to `runRecipe()`:

```typescript
runRecipe(
  recipe, kitchen,
  onStateChange?,      // called after every step status change
  onStepInteraction?,  // called when a step needs user input (returns Promise)
  getStepConfig?,      // called before each step for live config overrides
  executors?,          // DI for card executors
  isCancelled?,        // polling function for cancellation
  onStepReview?,       // called before execution for Level 2 review
  onSubRecipe?,        // called for Level 3 sub-recipe steps
)
```

Each callback has an explicit TypeScript signature. The runner awaits Promise-returning callbacks (`onStepInteraction`, `onStepReview`, `onSubRecipe`) and calls void callbacks synchronously.

## Consequences
**Easier:**
- Zero dependencies — no event emitter library or observable framework needed.
- Type-safe — each callback's contract is visible in the function signature.
- Testable — tests pass stub callbacks (or omit them) without any setup.
- Framework-agnostic — React, Preact, or a CLI could all provide callbacks.

**Harder:**
- The parameter list is long (9 parameters). Mitigated by making most optional with sensible defaults.
- Adding a new interaction point means adding another parameter. At v1 scale (5 callbacks) this is manageable.
- No fan-out — each event type has exactly one listener. If multiple consumers need the same event, the callback must relay it. Not a problem at current scale.

## Alternatives considered
**Event emitter** — Rejected because it hides the contract. Listeners subscribe by string name, making it easy to misspell event names or pass wrong argument shapes. TypeScript can type emitters, but the ergonomics are worse than direct callbacks for a small number of events.

**RxJS observables** — Rejected as over-engineering. The runner executes steps sequentially — there's no concurrent stream to model. Observables add a dependency and conceptual overhead without matching the execution model.

**Options object** — Considered as a way to reduce parameter count (pass `{ onStateChange, onStepInteraction, ... }` as a single object). Worth revisiting if the callback count grows beyond 6-7 interaction points.
