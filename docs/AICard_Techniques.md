# AICard Techniques — Design Document

## Cards are agent skills

The LLM ecosystem has converged on "agent skills" — discrete capabilities an AI agent can invoke to accomplish tasks. AICard's cards are exactly this. Each card is a skill the sous chef can use:

- **Listen** is the skill of capturing events from connected equipment
- **Send Message** is the skill of composing and delivering messages
- **Wait** is the skill of timing

Today the sous chef has a single generic system prompt. It knows *about* cards, but it has no expertise *in* them. It can say "this step sends a message" but it cannot compose that message in Maria's voice, respect her preferred greeting, or learn from her corrections.

A **technique** is what makes the sous chef competent at a specific card. It is the structured knowledge — voice, constraints, expertise — injected into the sous chef's prompt when that card executes.

| LLM concept | AICard term |
|-------------|-------------|
| Agent | Sous chef |
| Skill / Tool | Card |
| Tool description | Technique |
| User preferences | House style |
| Execution history | Kitchen journal |

---

## Technique documents

A technique lives in the `.card.md` file, in a `## Technique` section. It has three parts:

### Voice

How the sous chef behaves when executing this card. Written as direct instructions to the sous chef.

### Constraints

Hard limits the sous chef must respect. These are non-negotiable regardless of house style.

### Expertise

What the sous chef knows about when executing this card. Domain knowledge that improves output quality.

### Example: Send Message technique

```markdown
## Technique

### Voice
You compose messages on behalf of the user. You match the tone and style described in their house style. You write as if you are the user, not as an AI assistant.

### Constraints
- Keep messages under 150 words unless the house style says otherwise.
- Never use marketing language unless the recipe's purpose calls for it.
- Always mention the specific product or event that triggered this recipe.
- Never invent facts. Use only data from previous steps in the recipe.

### Expertise
You understand email etiquette. You write subject lines that are specific and personal — "Thanks for your order of [product]" not "Thank you for your purchase." You know when formal language helps (first contact) and when informal is better (follow-up). You adapt to the user's corrections over time.
```

### Example: Listen technique

```markdown
## Technique

### Voice
You guide the user through capturing event details. You are patient and clear about what information is needed and why.

### Constraints
- Only ask for fields that the recipe's later steps actually use.
- Never ask for sensitive data (passwords, payment details) through the event form.

### Expertise
You understand common event types — new orders, new subscribers, incoming messages. You know which fields are typically important for each event type and suggest helpful defaults.
```

### Cards without techniques

Some cards do not need techniques. The Wait card has no AI-generated output — it simply pauses. Cards like Wait can omit the `## Technique` section entirely. The sous chef falls back to its generic system prompt for steps that have no technique.

---

## House style

A technique makes the sous chef competent at a card. House style makes it *personal*.

House style is the user's voice and preferences, stored once in the kitchen and injected into every card that generates text. A restaurant has a house style — the way *this* kitchen does things. So does an AICard kitchen.

### What it contains

House style is free-form text the user writes (or the sous chef helps them compose). It can include:

- **Tone**: "Informal and warm. I use first names."
- **Language**: "I write in Dutch. Sign off with 'Warme groet, Maria'."
- **Formatting**: "Keep emails short — three paragraphs maximum."
- **Identity**: "I am Maria from Vondelstraat Bloemen. I sell flowers."

### Where it lives

House style is a field on the Kitchen: a single free-text string stored in localStorage alongside the rest of the kitchen data.

### How it is injected

When the sous chef executes a card that has a technique, the prompt is assembled in this order:

1. **System prompt** — the static sous chef personality (recipe language, warmth, directness)
2. **Technique** — the card's Voice, Constraints, and Expertise
3. **House style** — the user's personal voice and preferences
4. **Journal entries** — the 3 most recent corrections for this card type (few-shot examples)
5. **Step context** — the specific config values and data from previous steps

### Example: Maria's house style

```
I run Vondelstraat Bloemen, a small flower shop in Amsterdam.
I write in a mix of Dutch and English — mostly English for international customers.
My tone is warm and informal. I use first names.
I always thank customers for their specific order.
I sign off with "Warme groet, Maria".
Keep emails to 3-4 sentences.
```

---

## Kitchen journal

A technique gives the sous chef expertise. House style gives it personality. The kitchen journal gives it **memory**.

The kitchen journal is an append-only log of what happened during recipe runs. Every meaningful event is recorded: steps that executed, messages the user corrected, outputs the user approved. The sous chef does not need fine-tuning to improve over time — it just needs to see what the user changed last time.

### What it records

Each journal entry has:

- **timestamp** — when it happened
- **recipe** — which recipe was running
- **step** — which step (number and name)
- **card** — which card type
- **type** — one of:
  - `executed` — the step ran and produced output
  - `corrected` — the user changed the output before approving
  - `approved` — the user approved the output without changes
- **before** — the original output (for corrections)
- **after** — the corrected output (for corrections)

### How it is used

**Few-shot examples**: When the sous chef composes a Send Message, the 3 most recent `corrected` entries for Send Message are included in the prompt. The sous chef sees what it wrote, what the user changed it to, and adjusts accordingly.

**Pattern detection** (v5): The sous chef analyses the journal and surfaces suggestions: "You always change the greeting from 'Dear' to 'Hi'. Want me to update the default?" This is consent-driven — the sous chef asks, the user decides.

### Storage

In v1, the kitchen journal is stored in localStorage alongside the kitchen data. Retention policy: keep the most recent 100 entries per card type, or entries from the last 30 days, whichever is smaller.

---

## How it flows together

A concrete walkthrough:

1. Maria runs the thank-you recipe for the 10th time.
2. Step 1 (Listen) captures a new order: "Emma, emma@example.com, ordered a spring bouquet."
3. Step 2 (Wait) pauses for 3 days.
4. Step 3 (Send Message) fires. The sous chef receives:
   - **System prompt**: "You are a friendly kitchen assistant..."
   - **Send Message technique**: voice, constraints, expertise
   - **Maria's house style**: warm, informal, Dutch sign-off, short emails
   - **3 recent corrections**: last time Maria changed "Dear Emma" to "Hoi Emma", changed "your recent purchase" to "your beautiful spring bouquet", removed the closing line about "valued customer"
   - **Step context**: to = emma@example.com, product = spring bouquet
5. The sous chef composes: "Hoi Emma, Thanks so much for ordering the spring bouquet! I hope it's bringing some colour to your week. Warme groet, Maria"
6. Maria reads it, smiles, sends it without changes.
7. The journal logs: `{ type: 'approved', step: 3, card: 'send-message' }` — no correction needed this time.

Over time, the journal accumulates evidence that the sous chef is getting it right. Maria edits less. The system improves without any model being retrained.

---

## What this is NOT

- **Not fine-tuning.** No model weights are changed. The sous chef is the same model — it just receives better context.
- **Not training.** No LoRA adapters, no QLoRA, no Unsloth. Those belong in a separate research project.
- **Not RAG.** The journal is not a vector database. It is a short, recent history — 3 entries, not 3,000.
- **Not model-specific.** Techniques work with any provider Maria has connected — Claude, ChatGPT, Gemini, Ollama. The prompt structure is the same regardless of backend.

This is structured prompting with few-shot examples from the user's own history. It gives 80% of the personalisation value with 0% of the training complexity.
