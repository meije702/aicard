# AICard Recipe Format

A recipe is a plain Markdown file with a `.recipe.md` extension. It is human-readable in any text editor and parseable by the AICard recipe parser.

---

## Structure

A recipe file has five sections, in this order:

1. **Title** — the recipe name
2. **Purpose** — a one-sentence description
3. **Kitchen** — the equipment this recipe needs
4. **Steps** — the ordered list of actions

---

## Section reference

### 1. Title

A level-1 heading. The text is the recipe name.

```markdown
# Thank You Follow-Up
```

→ `recipe.name = "Thank You Follow-Up"`

---

### 2. Purpose

A Markdown blockquote immediately after the title. One sentence. Written from the user's perspective, not the system's.

```markdown
> Send a personalised thank you message to new customers three days after their first purchase.
```

→ `recipe.purpose = "Send a personalised thank you message to new customers three days after their first purchase."`

---

### 3. Kitchen

A level-2 heading `## Kitchen` followed by a bulleted list of equipment names. Each item is the name of a piece of equipment the recipe requires.

```markdown
## Kitchen

- Shopify
- Gmail
```

→ `recipe.kitchen = ["Shopify", "Gmail"]`

If the recipe needs no equipment, the section is still present with an empty list or the word "None".

---

### 4. Steps

A level-2 heading `## Steps` followed by level-3 headings, one per step.

Each step heading follows this format:

```markdown
### N. Step name
```

Where `N` is the step number (1, 2, 3, …) and "Step name" is a plain-English description of what this step does.

Immediately after the heading, on its own line, the step declares its card type (or sub-recipe):

**Card step:**
```markdown
*Card: Card Type Name*
```

**Sub-recipe step:**
```markdown
*Recipe: Recipe Name*
```

After the card/recipe declaration, configuration values are listed as a bulleted list of `Key: Value` pairs:

```markdown
- How long: 3 days
- Message: Thank you for your order!
```

Configuration keys are plain English. The parser normalises them to lowercase.

---

## Complete example

```markdown
# Thank You Follow-Up

> Send a personalised thank you message to new customers three days after their first purchase.

## Kitchen

- Shopify
- Gmail

## Steps

### 1. Listen for a new order

*Card: Listen*

- Listen for: new order
- From: Shopify

### 2. Wait a few days

*Card: Wait*

- How long: 3 days

### 3. Send the thank you message

*Card: Send Message*

- To: customer email
- Subject: Thank you for your order
- Message: We really appreciate your support. Your order is on its way!
```

---

## Parser rules

- The title heading (`#`) sets `recipe.name`. Strip leading/trailing whitespace.
- The first blockquote (`>`) after the title sets `recipe.purpose`. Strip the `>` prefix and whitespace.
- The `## Kitchen` section contains equipment names as a bulleted list.
- The `## Steps` section contains numbered step headings (`### N. Name`).
- Each step heading is followed by a card or recipe declaration in italics: `*Card: Type*` or `*Recipe: Name*`.
- Config items are bulleted `- Key: Value` lines under the card declaration.
- Card type names are normalised: `Send Message` → `send-message`, `Listen` → `listen`, `Wait` → `wait`.
- Config keys are normalised to lowercase: `How long` → `how long`.
- Missing optional sections result in empty defaults, not errors.
- Missing required sections (title, steps) are added to `recipe.errors[]`.

---

## File naming

Recipe files use the pattern: `recipe-name.recipe.md`

Examples:
- `thank-you-follow-up.recipe.md`
- `community-message-router.recipe.md`
- `weekly-report.recipe.md`
