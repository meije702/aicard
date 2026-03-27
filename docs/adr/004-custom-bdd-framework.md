# ADR-004: Custom BDD framework on Deno.test

## Status
Accepted

## Context
AICard uses BDD (Behaviour-Driven Development) with Gherkin `.feature` files as living specifications. The project runs on Deno, which has a built-in test runner (`Deno.test()`). A BDD framework is needed to parse `.feature` files and execute Given/When/Then steps.

At the time of implementation, no mature Gherkin test runner existed for Deno. Cucumber.js targets Node.js and requires CommonJS compatibility shims. Other Deno BDD libraries either lacked Gherkin parsing or were unmaintained.

## Decision
Build a minimal custom BDD runner (`src/test/bdd/runner.ts`, 144 lines) that:

1. Uses `@cucumber/gherkin` for parsing `.feature` files into an AST (the parser is runtime-agnostic).
2. Maps each Scenario to a `Deno.test()` call.
3. Provides a step registry (`Given`, `When`, `Then` functions) with parameter capture (`{string}`, `{int}`).
4. Creates a fresh `World` object per scenario for isolated state.

The framework deliberately omits: tags, hooks (Before/After), Scenario Outlines, Background sections, and parallel execution. These can be added if needed.

## Consequences
**Easier:**
- Full control over test lifecycle — no fighting framework opinions.
- 144 lines total — easy to understand, debug, and modify.
- Native `Deno.test()` integration — tests appear in standard Deno test output with proper names.
- No CommonJS compatibility issues or Node.js polyfills needed.

**Harder:**
- Missing features (tags, hooks, Scenario Outlines) must be built if needed.
- No ecosystem tooling (IDE step navigation, report formatters) that full Cucumber provides.
- Maintenance burden is on the team, not an open-source community.

## Alternatives considered
**Cucumber.js via Node compatibility** — Rejected because Deno's Node compatibility layer introduces friction (CommonJS shimming, `node:` imports). The integration cost exceeded writing 144 lines of custom code.

**Deno BDD libraries (e.g., deno-bdd)** — Evaluated but found unmaintained or lacking Gherkin file parsing. They provided `describe`/`it` wrappers, not Given/When/Then with `.feature` file support.

**No BDD, just unit tests** — Rejected because the `.feature` files serve as living documentation that non-developers can read. Plain unit tests lose the specification value that Gherkin provides.
