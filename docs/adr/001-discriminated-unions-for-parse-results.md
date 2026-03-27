# ADR-001: Discriminated unions for parse results

## Status
Accepted

## Context
AICard parses user-authored markdown (recipes, cards, equipment definitions) into typed domain objects. Parsing can fail in many ways: missing titles, unknown card types, malformed step headings. The system needs a consistent strategy for representing parse success and failure across all three document types.

Two common approaches exist:
1. Throw exceptions on invalid input and catch at the call site.
2. Return a discriminated union that forces callers to check success before accessing the parsed value.

The codebase is consumed by both a recipe runner (which must halt on bad input) and a UI layer (which must display errors to the user). Both consumers need structured access to error details, not just a thrown message string.

## Decision
All top-level parse functions return a discriminated union keyed on `success: true | false`. Helper functions within parsers return `ParseResult<T>` (`{ value: T; errors: string[] }`), accumulating errors without throwing.

Concrete types:
- `ParsedRecipe = { success: true; recipe: Recipe } | { success: false; errors: string[]; partialRecipe: Partial<Recipe> }`
- `ParsedCard` and `ParsedEquipment` follow the same pattern.

Callers must narrow the union before accessing the parsed value. The TypeScript compiler enforces this at build time.

## Consequences
**Easier:**
- Callers cannot accidentally use an invalid recipe — the type system prevents it.
- Error messages are structured and accumulative (multiple errors per parse, not just the first).
- Parser functions are pure (no side effects, no thrown exceptions) — trivially testable.
- Partial results are available on failure, useful for UI error display with context.

**Harder:**
- Every call site must handle the error branch, even when the input is known-good (e.g., fixture files in tests). A small `unwrap` helper mitigates this in test code.
- Adding a new parse result type requires following the union pattern consistently.

## Alternatives considered
**Exceptions with try/catch** — Rejected because exceptions are invisible in type signatures, easy to forget to catch, and only carry a single error message. The accumulative error pattern (show all problems, not just the first) doesn't fit exception flow naturally.

**Result monad (e.g., neverthrow)** — Rejected as over-engineering for v1. The simple union achieves the same compile-time safety without a library dependency. Revisit if chained parsing pipelines become common.
