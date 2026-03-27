# ADR-002: Multi-provider sous chef via OpenAI-compatible API

## Status
Accepted

## Context
The sous chef (AICard's AI collaborator) needs to call an LLM for tasks like describing steps, checking kitchen readiness, and guiding equipment setup. Users may prefer different providers for cost, privacy, or availability reasons. The system supports five providers: Anthropic, OpenAI, Gemini, Mistral, and Ollama.

Building a dedicated SDK integration for each provider would mean five separate client implementations to maintain.

## Decision
Use two client paths in `src/sous-chef/client.ts`:

1. **Anthropic** — Uses the `@anthropic-ai/sdk` package directly (already a dependency). This is the only provider that supports vision (image input for LiteParse).
2. **All others** — Plain `fetch()` against the OpenAI-compatible `/chat/completions` endpoint. OpenAI, Gemini, Mistral, and Ollama all expose this API shape.

This means one client function (`sousChefAsk`) with a provider branch, not five SDK integrations. Provider metadata (default model, base URL, key requirements) lives in `src/sous-chef/providers.ts`.

Vision support is Anthropic-only because the Anthropic SDK handles the multipart image encoding natively, and no other provider's OpenAI-compatible endpoint guarantees the same vision format.

## Consequences
**Easier:**
- Adding a new OpenAI-compatible provider requires only a new entry in `providers.ts` — zero client code changes.
- No additional SDK dependencies beyond `@anthropic-ai/sdk`.
- Users can switch providers without code changes (just UI config).

**Harder:**
- Vision features (LiteParse photo transcription) only work with Anthropic. Users on other providers see this limitation.
- Provider-specific features (function calling, streaming, tool use) aren't available through the generic path. Acceptable at v1 scope.
- Error formats differ slightly across providers — the client maps them to a common shape, but edge cases may surface.

## Alternatives considered
**OpenAI SDK for all providers** — Rejected because it adds a dependency that duplicates what a simple `fetch()` already does. The OpenAI-compatible API is stable enough for text completion.

**Anthropic SDK for all via proxy** — Rejected because it would require users to run a translation proxy for non-Anthropic providers. Too much operational burden for v1.
