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

### ~~The sub-recipe problem~~ ✓ Resolved

Implemented in Level 3 (commit `2420481`). Sub-recipe steps use the `OnSubRecipe` callback pattern with `createSubRecipeRunner` factory. Recipes are looked up by name in the kitchen. Max nesting depth is 3.

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

### The technique injection problem

When the sous chef executes a card, the prompt will include: system prompt + technique + house style + journal entries + step context. How do we stay within token limits as all of these grow?

**Not yet decided.** Needs a token budget per section. What gets truncated first? Probably journal entries (oldest first), then technique (summarise), then house style (never — it is short).

---

### The journal storage problem

The kitchen journal is append-only and stored in localStorage (~5MB limit). It grows with every recipe run.

**Tentative policy**: keep the most recent 100 entries per card type, or entries from the last 30 days, whichever is smaller. Prune on write.

---

### The house style editing problem

How does Maria set her house style? A free-text field? A structured form? The sous chef interviews her and generates it?

**Not yet decided.** This is a UX problem. The simplest v4 approach is a free-text field in the kitchen settings. A sous-chef-guided interview would be better but adds complexity.

---

### The correction detection problem

When Maria edits a composed message before sending, how does the system know what she changed? The Send Message card shows the composed message for review — if Maria changes it, we can diff the original against her edit. But if she edits in her email app (after clicking the mailto: link), we have no visibility.

**v4 decision**: only capture corrections made within AICard's review panel. Edits made outside AICard are invisible. This is honest and avoids invasive tracking.

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
