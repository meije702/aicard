# ADR-005: No UI component tests at v1

## Status
Accepted

## Context
AICard has 12+ React components (App, Kitchen, RecipeView, SousChef, EquipmentWizard, etc.) with zero component-level test coverage. The backend — parsers, runner, card executors, kitchen state, sous chef prompts — has 237+ tests including comprehensive BDD scenarios.

Adding UI component tests requires choosing and integrating a test framework (e.g., `@testing-library/preact` or `@testing-library/react`) plus a DOM environment (`jsdom` or `happy-dom`) compatible with Deno. This is non-trivial setup work.

## Decision
Defer UI component tests to v2. At v1, rely on:

1. **Strong backend coverage** — all business logic is tested via BDD and unit tests.
2. **Pure function extraction** — UI hooks and utilities that can be tested without a DOM are tested (e.g., `parseBlocks()` in `markdown-blocks.ts`).
3. **Manual smoke testing** — dev server (`deno task dev`) for interactive verification.
4. **Architectural separation** — UI components are thin wrappers that delegate to tested modules (runner, parser, kitchen state). The components themselves contain primarily rendering logic and event wiring.

## Consequences
**Easier:**
- No DOM environment setup or framework compatibility issues to maintain.
- Faster test suite (237 tests in ~13s, no DOM overhead).
- Development velocity stays high — no test maintenance for rapidly evolving UI.

**Harder:**
- UI regressions (broken event handlers, wrong props passed, rendering bugs) are only caught manually.
- Refactoring UI components (like the splits planned in this remediation) requires manual verification.
- As the component count grows, confidence in UI correctness decreases without automated coverage.

**Trigger to revisit:** When any of these occur:
- A UI bug reaches users that automated tests would have caught.
- Component count exceeds 20 or UI logic becomes non-trivial (conditional rendering, complex state).
- A Deno-native DOM testing solution matures and reduces setup cost.

## Alternatives considered
**Add testing-library now** — Rejected because the setup cost (jsdom compatibility, Deno shims) is significant and the v1 UI is still evolving rapidly. Tests written now would churn heavily.

**Playwright/E2E tests** — Considered for critical flows (open recipe, run, interact). Deferred because it requires a running dev server in CI and adds significant test time. Worth evaluating at v2.

**Storybook for visual testing** — Rejected as out of scope for v1. Storybook requires additional build configuration and doesn't test behavior.
