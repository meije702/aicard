# Kitchen Counter

Open questions and things to figure out. This is not a backlog — it's a thinking surface.

---

## The hard problems

### The Wait problem

"Wait 3 days" means something has to run in the background. A browser tab can't do that reliably.

**v1 decision**: use `setTimeout` and keep the tab open. Show a persistent warning before running any recipe with a Wait step. Make the limitation honest and visible — not buried in documentation.

**Future options**:

- A lightweight local service (Electron or a small Node daemon) that handles timers
- A hosted service that users can opt into
- The user's own server / cloud function

The v1 approach is an honest trade-off. It works for short waits (hours). It is fragile for long waits (days). Name this in the code and in the UI.

---

### The equipment connection problem

How do you connect equipment without a backend? OAuth flows typically require a redirect back to a server.

**v1 decision**: start with API key authentication for equipment that supports it (e.g., Shopify API keys). This is less smooth than OAuth but works entirely in the browser. Add a clear explanation of why we're asking for an API key.

**Future**: a lightweight auth proxy service that handles OAuth redirects.

---

### The "running in the background" problem

A recipe that is listening for an event (Listen card) needs to poll or receive a webhook. A browser tab can poll, but polling is battery-intensive and stops when the tab is closed.

**v1 decision**: polling every 30 seconds while the tab is open. Show the polling status. Warn the user if the tab has been closed and reopened that the recipe may have missed events.

**Future**: webhooks via a small backend service, or a local service.

---

### The sub-recipe problem

A recipe step can call another recipe (`*Recipe: Name*`). How does the runner find that recipe? By name? By file path? What if it's missing?

**v1 decision**: sub-recipes are not implemented in v1. A step with `*Recipe: Name*` is parsed correctly but shows as "Sub-recipe not yet supported" when it reaches execution. Log it in `recipe.errors[]` at parse time.

---

### The card config value types problem

Config values in recipe files are strings: `How long: 3 days`. Some cards need to parse these into durations, numbers, or references to earlier step outputs.

**v1 decision**: all config values are strings. Each card executor is responsible for parsing its own config values. Document the expected format in the card definition.

**Future**: a config value type system with validation at parse time.

---

### The "output flows into the next step" problem

A Listen card captures data (the new order). A Send Message card needs some of that data (the customer's email). How does data flow between steps?

**v1 decision**: a `RecipeContext` object accumulates step outputs. Card executors read from context using step names or numbers as keys. The format for referencing earlier outputs in config is: `{step 1: customer email}`.

This is intentionally simple. It handles the thank-you recipe. It will not handle complex data transformations.

---

## Things to decide later

- What does a recipe marketplace look like? (Level 3+)
- How do users share recipes? (Level 3+)
- What card types come after the first three? (Filter, Transform, Branch are candidates)
- How does the sous chef learn about new card types it hasn't seen before?
- What happens when a recipe errors mid-run? Can it resume?
- Should recipe files be version-controlled? (Yes, obviously — they're text files. How do we explain this to Maria?)

---

## Things that seem hard but probably aren't

- **Parsing the recipe format** — it's structured Markdown with a small grammar. Not hard.
- **The sous chef knowing the kitchen state** — pass the kitchen as context. Simple.
- **Showing what a recipe will do before running it** — `describe()` on each step. Already designed.

---

## Things that seem easy but probably aren't

- **Getting Maria to connect her equipment** — this is a UX problem, not a technical one. The flow needs to be warm, clear, and forgiving.
- **Making the sous chef feel helpful rather than intrusive** — the two-surface design (hat + toast) should solve this, but it needs careful tuning.
- **Making recipe files that Jun can read and Maria can also understand** — the format serves both. Keep it that way.
