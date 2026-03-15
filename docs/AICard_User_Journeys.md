# AICard User Journeys

These are the step-by-step experiences we are building toward. Each journey is described from the user's perspective.

---

## Level 1 — Following a recipe

**Maria's first time**

1. Maria opens AICard in her browser.
2. She sees her kitchen — currently empty. The sous chef's hat is in the corner, quiet.
3. She clicks "Open a recipe" and selects `thank-you-follow-up.recipe.md` from her downloads.
4. The recipe appears: title, purpose, kitchen requirements, steps — all in plain English.
5. The sous chef taps her on the shoulder: "This recipe needs Shopify and Gmail. You haven't connected either yet."
6. Maria clicks "Connect Shopify." She follows the prompts. Shopify is now in her kitchen.
7. She connects Gmail the same way.
8. The sous chef updates: "Your kitchen is ready. This recipe will listen for new orders in Shopify, wait three days, then send an email from Gmail."
9. Maria clicks "Run recipe."
10. The recipe starts. Step 1 — "Listening for a new order in Shopify" — is shown, with a quiet indicator that it's waiting.
11. A new order comes in. Step 1 completes. Step 2 starts: "Waiting 3 days."
12. A persistent banner appears: "Recipe running — keep this tab open."
13. Three days pass. Step 2 completes. Step 3 starts: "Sending thank you email to customer."
14. The email sends. The recipe completes. A gentle confirmation: "Recipe complete. The thank you email was sent."

---

## Level 2 — Tweaking a setting

**Maria's second week**

1. Maria runs the thank-you recipe. It works. But she wants to wait 5 days instead of 3.
2. She opens the recipe view. She sees Step 2: "Wait a few days — 3 days."
3. She taps the step. A small config panel opens: "How long: 3 days."
4. She changes it to "5 days." She saves.
5. The recipe now waits 5 days. Nothing else changes.
6. The sous chef confirms: "Updated. The recipe will now wait 5 days before sending."

---

## The sous chef's two surfaces

### The chef's hat

Always visible in the corner. Tap it and three to five options appear, based on what the user is currently doing:

- "Check if my kitchen is ready for this recipe"
- "What does the Listen card do?"
- "Show me what this recipe will do before I run it"
- "I want to ask something else"

Tapping "I want to ask something else" opens a text input.

### The toast

A gentle notification that appears when something genuinely needs attention:

- "Your Shopify connection isn't responding. Want to check it or skip this step?"
- "The recipe is paused because the tab was closed. Want to pick up where you left off?"
- "Step 2 has been waiting for 3 days. Everything looks right."

Toasts are not tips. They are not suggestions. They are real problems or real updates.

---

## What success looks like at Level 1

- Maria can run a recipe without knowing what an API is.
- Maria can see what the recipe is doing at all times, in language she understands.
- If something goes wrong, she knows what happened and what she can do.
- If the recipe requires her tab to stay open, she knows that *before* she runs it.

## What success looks like at Level 2

- Maria can change a config value without fear that she'll break something.
- The change is immediate and clear.
- She doesn't need to understand the whole recipe to change one part of it.
