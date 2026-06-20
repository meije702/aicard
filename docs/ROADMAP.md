# AICard Roadmap

*How we take v1 to the next level. Last touched: 20 June 2026.*

This is the sequenced plan for what comes after v1. It supersedes the short
"Roadmap" list in `AGENTS.md` with an ordered, reasoned path and a current
focus. For the longer-term research vision, see
`docs/Self-Improving_Micro-Models_in_Composable_Multi-Agent_Systems__Architecture_and_Market_Analysis.md`.

---

## Context — the gap

v1 is shipped and healthy: Levels 1–3 work, the suite is green, lint is
enforced. The honest gap — named repeatedly in `docs/kitchen-counter.md` — is
that **AICard has never earned a real non-technical user**, and two of the
manifesto's central promises are still unbuilt:

- **Recipes don't travel.** Readiness matches equipment by exact brand name
  (`src/runner/recipe-readiness.ts`), so a recipe written for "Shopify" can't
  run for an Etsy user, and there is no share flow.
- **Recipes don't survive.** `src/server.ts` is a static file server with no
  backend, so a "Wait 3 days" step silently needs the browser tab open for 3
  days (see the trade-off note in `src/cards/wait.ts`).

Two assets are already in place to build on: the kitchen journal is v5-ready
(`getRecentCorrections` in `src/kitchen/journal.ts` captures before/after
corrections), and the `./aicard` binary is the natural home for a future
background service.

---

## Thesis & sequencing

> Close the gap between the manifesto's promises and lived reality, in
> dependency order: **Validate → Travel → Learn → Survive** — with
> self-improvement as a parallel research track that only starts once there is
> real ledger data to learn from.

Why this order:

- Validation is the cheapest way to learn what's actually broken, and the
  makers (Jun, Sam) are the reliable early users.
- Recipe *portability* must exist before *sharing* is worth anything.
- The journal already captures the data pattern-detection needs, so "learn"
  both delights users and *produces the ledger* the research track is gated on.
- Background execution is the most architectural bet and isn't blocking for
  short-recipe validation, so it comes last.

---

## Phase 1 — Earn the first real users (in progress)

Goal: a real Jun/Sam (then a Maria, via a recipe handed to her) can go from
opening the app to a successful, understood run **without finding a file or
asking how it works** — and we capture what breaks.

- **Publish this roadmap** and cross-link it from `AGENTS.md` and
  `docs/kitchen-counter.md`.
- **First-run guidance.** Auto-launch the existing recipe tour
  (`src/ui/tour/RecipeTour.tsx`) once on first load, guarded by a localStorage
  flag, with a skippable, friendly opener. Reuse the existing tour components.
- **More starter recipes.** Seed 2–3 real, runnable recipes that exercise all
  three v1 cards and speak to Jun/Sam, beyond today's single "Thank You
  Follow-Up".
- **Reliability & honesty hardening.** Make every failure state legible to
  Maria — parse errors, readiness blockers, and Send/Listen failures — with
  adversarial-input tests. No new features; just no dead ends.
- **Real-user test protocol + findings.** Put the build in front of 2–3 real
  Jun/Sam users and record results as `docs/AICard_L1_RealUser_Findings.md`, in
  the triaged style of the existing test-findings docs. This is the phase's
  actual deliverable — it sets Phase 2's priorities from evidence.
- **GOVERNANCE.md.** The manifesto promises "open source, forever"; write the
  governance/funding model before the first external contributor arrives.

Phase 1 is done when a first-timer is auto-guided to a successful run, 3+
recipes seed and run green, failure states are friendly, and a written
real-user findings doc is driving Phase 2.

---

## Phase 2 — Recipes that travel (next)

The manifesto's core ("Maria gets a recipe from someone she trusts and it just
works") and the growth lever. Build only after Phase 1 evidence confirms the
single-user loop is trusted.

- **Capability-based equipment.** Add a `## Capabilities` section to the
  `.equipment.md` format (e.g. `receive-orders`, `send-email`) and let recipes'
  `## Kitchen` declare *capabilities* instead of brand names. Change the
  Layer-1 matcher in `src/runner/recipe-readiness.ts` from exact-name to
  capability → any-connected-equipment-that-provides-it; the sous chef bridges
  gaps.
- **Share / import flow.** A real "share this recipe" — the `.recipe.md` plus a
  human-readable "what you'll need" manifest the sous chef explains on import —
  beyond the current bare file input.
- **Curated equipment starter set.** A small, vetted set of equipment
  (`docs/kitchen-counter.md` frames this as a safety decision, not a catalogue)
  so non-technical users connect trusted services, not the open firehose.

---

## Phase 3 — A sous chef that learns

The delight/retention lever — and it produces the ledger the research track is
gated on.

- **Event sourcing foundation.** Make each card execution emit immutable events;
  the micro-models analysis calls this "the architectural foundation" that
  enables pattern detection, auditability, and later self-improvement through a
  single pattern.
- **v5 pattern detection.** A pure `detectDefaultSuggestions` built on the
  existing `getRecentCorrections` (`src/kitchen/journal.ts`): spot a recurring
  before→after correction and surface a gentle suggestion ("you always shorten
  the greeting — make it the default?"). Additive; no new storage.

---

## Phase 4 — Recipes that survive + deepen the pantry

- **Binary as a local service.** Evolve `src/server.ts` from a static server
  into a lightweight always-on local service: persist run state to disk and add a
  scheduler that advances Wait steps with the tab closed, plus a small API the
  frontend polls. Solves the named Wait trade-off. The most architectural bet —
  deferred because it isn't blocking early validation.
- **New card types (v6).** Filter, Transform, then Decide — with the
  `docs/kitchen-counter.md` constraint that Decide routes only to sub-recipes
  (never inline steps) so recipes stay linear and readable.

---

## Research track — Self-improving micro-models (deferred)

Per the project's own analysis: **do not build now.** Gate it on Phases 1–3
producing real usage data in the ledger. The event sourcing in Phase 3 is the
deliberate on-ramp; binary feedback (thumbs up/down) plus KTO on small local
models is the eventual mechanism. Collect feedback now; train later, offline
and evaluated.

---

## Deliberately not doing yet (trade-offs)

- No self-improvement build-out, no model training — research track only.
- No full MCP firehose — curate a vetted set (safety, not catalogue).
- No inline Decide branching — sub-recipe routing only, to keep recipes linear.
- No accounts / cloud / backend beyond the optional local service in Phase 4.
