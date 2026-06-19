# Kitchen Counter

*Things on our mind. Not a plan — just a surface for thinking.*

*When something here graduates into a sequenced plan, it moves to `docs/ROADMAP.md`.*

*Last touched: 20 June 2026*

---

## Needs answering before we build

- Can a small local AI model handle Level 1 and Level 2 sous chef tasks?
  The greeting, the kitchen setup, interpreting "warm" → "professional" —
  bounded stuff. This is testable with an experiment, not a debate.
  Mid-2026 evidence (June review): the bounded interpretation jobs look
  fine at 1B–3B. The risk is the open-ended part — conversational kitchen
  setup is exactly where small local models are weakest, and reliability
  swings by device. Still gated on the real-user test, which hasn't
  happened yet. Until it does, don't let "offline first" promise more
  than we've shown.

- How does the Wait card actually work when the browser is closed?
  "Wait 3 days" means something has to run in the background. A browser tab
  can't do that. This affects the "just open it in a browser" promise.
  Probably needs a lightweight local service. Trade-off to name clearly.

---

## Design decisions to make (not build yet)

- How far can the Decide card branch before a recipe stops reading like steps?
  Constraint proposal: Decide only routes to sub-recipes, never inline steps.
  Keeps the recipe linear. Test this against a real example before committing.

- Governance and funding model for "open source, forever."
  The manifesto promises permanence. Permanence requires a plan. A draft now
  lives in `GOVERNANCE.md` — it still needs the maintainer's calls on the
  funding stance and who the maintainers are (both marked "Decision needed").

- Who do we put v1 in front of first? Maria, Jun, Sam are co-equal as a
  design target — if it doesn't work for all three it doesn't ship. But
  for *adoption*, the June review points the other way: the makers (Jun)
  and the control-wanters (Sam) are the reliable early users. Maria
  arrives later, through a recipe someone she trusts hands her — which is
  already how her success story starts in the personas doc. Sequencing
  call, not a persona change.

- How does a card stay reliable when a small local model drives the tool
  call? Forcing a 1B–3B model into a rigid JSON/MCP schema measurably
  hurts its accuracy. Likely answer: natural-language-first invocation,
  validate the result, retry, fall back to a bigger/cloud model on
  failure. Decide the fallback policy per card type before building the
  executor for real.

- How much of the MCP world do we actually expose? The ecosystem won, but
  its security in 2026 is rough — only a small minority of public servers
  are trustworthy. For non-technical people connecting their own accounts,
  ship a small vetted starter set of equipment, not the open firehose.
  Curation is a safety decision, not a catalogue decision.

---

## Things to build and discover

- The recipe parser. Fast, deterministic, reads the six structural markers.
  Hands structure to the machine, values to the AI. Feed it messy input and
  see where it breaks. This probably unblocks the most other things.

- Data mapping — what happens when "customer from the order" matches three
  email fields? Build the clarification flow. Sous chef asks once, remembers.
  Or asks every time? We'll learn by trying.

---

## New ideas from today

- **The kitchen counter itself.** This concept isn't in the domain language yet.
  It should be. It's the surface where thinking lives before it becomes a
  recipe. Your wife's notebook before and during cooking. Needs writing up
  and adding to AICard_Domain_Language.md.

- **The sous chef helps with overwhelm, not just errors.** When Maria has three
  things she wants to automate, the sous chef's job isn't "pick one." It's
  "help her see what to do first and why, without making the other things
  feel dismissed." This is a Level 1 need, not a Level 5 need. Needs adding
  to the sous chef's role in the domain language.

- **Dogfooding works.** We just set up our own kitchen to manage building
  AICard. If this counter helps us think, that's evidence the concept works.
  If it doesn't, that's more valuable — it tells us what's missing.

---

## Simmering (not now, but don't forget)

- Journey 4 through 7 from the user journeys doc — sharing, combining,
  failure, upgrading. These need designing but not before Level 1 is solid.

- The full core pantry. We have three cards. The domain language mentions
  eight capabilities (listening, filtering, summarizing, transforming,
  deciding, waiting, storing, sending). Which ones are v1?

- What does Jun's kitchen counter look like? Probably messy and full.
  That's fine — but does the format support that energy?

- The "better oven" upgrade moment. When does the sous chef suggest it?
  What does it feel like? This is a user journey waiting to be written.

---

*Cross things off when they're done. Add things when they come to mind.
The counter is never empty and never finished — that's how you know
the kitchen is alive.*
