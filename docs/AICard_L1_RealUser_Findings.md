# L1 real-user findings

*The deliverable of Phase 1 in `docs/ROADMAP.md`. Until a real person who is
not us has gone from zero to a successful run, the loop is unproven. This doc
is the protocol for that test and the place we record what we learn — it sets
Phase 2's priorities from evidence, not guesses.*

Earlier findings docs (`AICard_L1_Test_Findings.md`,
`AICard_L2_Test_Findings.md`) came from us testing our own product. This one is
different: it is filled in **by watching someone else**.

---

## Who to recruit

Per `docs/kitchen-counter.md`, the makers are the reliable early users, so test
in this order:

1. **Jun (a curious builder)** — comfortable with apps, will poke at the format.
2. **Sam (a developer)** — will judge whether it's sound, not just friendly.
3. **Maria (a non-technical shopkeeper)** — ideally reached the way her real
   success story starts: someone she trusts hands her a recipe. Test her last,
   once Jun/Sam findings are addressed.

Two or three people is enough to surface the big problems.

---

## Setup

- Run the real distribution, not the dev server: `deno task build` then
  `./aicard`. (We want to see what an actual user sees, including persistence.)
- Start from a **fresh kitchen** (clear the browser's localStorage for the
  site, or use a clean profile) so first-run behaviour is exercised.
- Have a sous chef provider key ready *only if* the tester wants to try the AI;
  the core loop must work without one.

---

## The session

Give the tester the goal, then **watch without helping**. Silence is data —
every question they ask out loud is a place the product failed to explain
itself. Record exactly where they hesitate.

1. "This app helps you set up an automation by following a recipe. Open it and
   have a look around." — Do they understand what they're seeing?
2. "Pick a recipe that looks useful and open it." — Do the seeded recipes read
   as useful? Does the tour help or interrupt?
3. "Get it ready to run." — Do they understand they need to connect equipment?
   Is "Connect Shopify / Gmail" obvious? Does the honest "Ready — sends via
   you" vs "Connected" distinction land?
4. "Change something about it." — Can they tweak a step (Level 2)? Do they trust
   that the change took effect?
5. "Run it." — Do they understand what happened? Does a Wait step's "keep this
   tab open" warning make sense, or alarm them?

Then ask: *What did you think this would do? What surprised you? Would you trust
it with a real customer?*

---

## The lens (from AGENTS.md persona validation)

- **Maria:** would she understand this without knowing what an API is?
- **Jun:** can he open the recipe file in a text editor and understand it?
- **Sam:** is it technically sound, not just a friendly label on a mess?

Build for Maria first, then Jun. Sam finds value if they are well served.

---

## Recording findings

Record each finding below in the triaged style of the other findings docs: a
short title, a **Status** line, and a plain-English description of what
happened and why it matters. Statuses:

- **Fixed** — addressed in this round; note the commit/file.
- **Future work** — real, but out of v1 scope or a later phase.
- **Won't fix (v1)** — an intentional trade-off; name what we're giving up.

Findings that block "zero → successful run" are Phase 1 work and should be fixed
before the next tester. Everything else feeds the Phase 2 backlog.

---

## Findings

*(Empty until the first session. Template below — copy it per finding.)*

### Finding 1

**Status:** Fixed / Future work / Won't fix — *one-line triage rationale.*

*What the tester did, where they got stuck or surprised, and why it matters for
Maria/Jun/Sam.*
