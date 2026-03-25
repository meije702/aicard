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
6. Maria clicks "Connect Shopify." A panel opens with plain instructions: where to find her Shopify access token and how to copy it. She pastes it in and clicks "Connect." Shopify is now in her kitchen.
7. She clicks "Connect Gmail." A panel explains that AICard will prepare her emails and open them in her own email app for her to review and send — no password needed. She clicks "Got it." Gmail is now in her kitchen.
8. The sous chef updates: "Your kitchen is ready. This recipe will listen for new orders in Shopify, wait three days, then send an email from Gmail."
9. Maria clicks "Run recipe."
10. The recipe starts. Step 1 shows a form: "When a new order comes in from Shopify, enter the details here." Maria fills in the customer's email address and order number, then clicks "Got one!" Step 1 completes.
11. Step 2 starts: "Waiting 3 days." A persistent banner appears: "Recipe running — keep this tab open."
12. Three days pass. Step 2 completes. Step 3 starts.
13. A panel shows the email AICard has prepared — the recipient, subject, and message — all filled in from the order details Maria entered. She clicks "Open in email." Her email app opens with the message ready to go. She sends it and clicks "Got it."
14. The recipe completes. A gentle confirmation appears: "Recipe complete."

---

## Level 2 — Tweaking a setting

**Maria's second week**

1. Maria runs the thank-you recipe. It works. But she wants to wait 5 days instead of 3.
2. She opens the recipe view and clicks "Run recipe." The first step — "Listen for a new order" — starts. While it's waiting for her input, the next steps are still shown below it.
3. She spots Step 2: "Wait a few days." There's a "Tweak" button on it — the recipe is running but this step hasn't started yet, so she can still change it.
4. She clicks "Tweak." The step expands in place: "How long: 3 days."
5. She changes it to "5 days" and saves. The step description updates immediately: "Waiting 5 days..."
6. She enters the order details in Step 1 and clicks "Got one!" The recipe moves to Step 2, which now waits 5 days. Nothing else changes.

---

## Level 3 — Combining recipes

**Maria's second month**

1. Maria has two recipes: "Thank You Follow-Up" (listens for orders, waits, sends a thank-you) and "Community Message" (composes and sends a message to her local business group).
2. She wants a single recipe that handles the order *and* notifies her community about popular items. Instead of running two recipes separately, she asks Jun to help.
3. Jun opens the thank-you recipe and adds a fourth step: `*Recipe: Community Message*`. This tells the recipe to run the community message recipe as a sub-step, passing along the order context.
4. Maria runs the combined recipe. Steps 1–3 work as before. When step 4 fires, the community message recipe runs inside it — the sous chef composes the community post using the order details from step 1.
5. Maria reviews and sends both messages. The recipe completes.
6. She never had to learn about "sub-workflows" or "nested automations." Jun just told her: "Step 4 calls your other recipe."

### What success looks like at Level 3

- Maria can run one recipe that calls another, without understanding the mechanics.
- Jun can wire recipes together by adding a single step referencing another recipe by name.
- Nesting is limited to 3 levels deep — enough for real use, not enough to create confusion.

---

## v4 — Personalised messages

**Maria's third month**

1. Maria has been running the thank-you recipe for weeks. It works, but the messages sound generic — "Dear Customer, thank you for your purchase." She wants them to sound like *her*.
2. She opens her kitchen settings and sees a new section: "House style." The sous chef offers to help: "Tell me a bit about how you write — your tone, your language, how you sign off."
3. Maria types: "I'm informal and warm. I use first names. I always thank people for their specific order. I sign off with 'Warme groet, Maria'. Keep it short — three or four sentences."
4. She runs the recipe. A new order comes in from Emma who bought a spring bouquet.
5. Step 3 fires. Instead of "Dear Customer, thank you for your purchase," the sous chef composes: "Hoi Emma, Thanks so much for ordering the spring bouquet! I hope it's bringing some colour to your week. Warme groet, Maria"
6. Maria reads it, changes "colour" to "kleur" — she prefers mixing in a little Dutch. She sends it.
7. The kitchen journal records the correction: the sous chef wrote "colour", Maria changed it to "kleur".
8. Next week, another order. The sous chef composes the message — this time it writes "kleur" without being told. Maria sends it without changes.
9. Over time, Maria edits less. The sous chef learns her voice from her corrections, not from training — just from seeing what she changed last time.

### What success looks like at v4

- Maria's messages sound like her, not like a generic AI.
- She set her house style once and it applies everywhere.
- She never had to explain "fine-tuning" or "training" — she just corrected a few messages and the system improved.
- The same technique works regardless of which AI provider she connected as her sous chef.

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
