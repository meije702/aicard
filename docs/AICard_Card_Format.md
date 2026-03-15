# AICard Card Format

A card definition is a plain Markdown file with a `.card.md` extension. It defines a card type — what it does, what equipment it needs, and what configuration it accepts.

---

## Structure

A card definition file has five sections:

1. **Title** — the card type name
2. **Purpose** — a one-sentence description of what this card does
3. **Equipment** — what equipment (if any) this card needs to run
4. **Config** — the configuration fields this card accepts
5. **Example** — a complete example showing the card in a recipe step

---

## Section reference

### 1. Title

A level-1 heading. The text is the card type name, as it appears in recipe files.

```markdown
# Listen
```

→ `card.name = "Listen"`, normalised to `card.type = "listen"`

---

### 2. Purpose

A blockquote immediately after the title. One sentence describing what the card does for the user — not how it works technically.

```markdown
> Watches for something to happen in one of your connected services, then continues the recipe.
```

---

### 3. Equipment

A `## Equipment` section with a bulleted list of equipment types this card may need, with a note on whether each is required or optional.

```markdown
## Equipment

- A connected service to listen to (required)
```

If the card needs no equipment, say "None."

---

### 4. Config

A `## Config` section listing the configuration fields the card accepts. Each field is a level-3 heading followed by a description.

```markdown
## Config

### Listen for
What event to listen for. Examples: "new order", "new subscriber", "new message".

### From
Which piece of equipment to listen on. Must match an equipment name in the kitchen.
```

---

### 5. Example

A `## Example` section showing how this card appears in a recipe step.

```markdown
## Example

### 1. Listen for a new order

*Card: Listen*

- Listen for: new order
- From: Shopify
```

---

## Complete examples

### listen.card.md

```markdown
# Listen

> Watches for something to happen in one of your connected services, then continues the recipe.

## Equipment

- A connected service to listen to (required)

## Config

### Listen for
What event to listen for. Examples: "new order", "new subscriber", "new message".

### From
Which piece of equipment to listen on. Must match an equipment name in the kitchen.

## Example

### 1. Listen for a new order

*Card: Listen*

- Listen for: new order
- From: Shopify
```

---

### wait.card.md

```markdown
# Wait

> Pauses the recipe for a set amount of time before continuing to the next step.

## Equipment

None.

## Config

### How long
How long to wait before continuing. Examples: "3 days", "1 hour", "30 minutes".

## Example

### 2. Wait a few days

*Card: Wait*

- How long: 3 days

## Notes

Waiting requires the browser tab to stay open. A warning is shown before running any recipe that contains a Wait step.
```

---

### send-message.card.md

```markdown
# Send Message

> Sends a message to a person or group using one of your connected services.

## Equipment

- A connected messaging service (required) — email, Slack, SMS, etc.

## Config

### To
Who to send the message to. Can be a fixed address or a value from an earlier step (e.g. "customer email").

### Subject
The subject line (for email). Optional for other message types.

### Message
The body of the message.

## Example

### 3. Send the thank you message

*Card: Send Message*

- To: customer email
- Subject: Thank you for your order
- Message: We really appreciate your support. Your order is on its way!
```

---

## File naming

Card definition files use the pattern: `card-type-name.card.md`

Examples:

- `listen.card.md`
- `wait.card.md`
- `send-message.card.md`
- `filter.card.md`
- `transform.card.md`

---

## Parser rules

- The title heading (`#`) sets the card name. Normalise to lowercase-hyphenated for `card.type`.
- The blockquote sets `card.purpose`.
- The `## Equipment` section lists required/optional equipment.
- The `## Config` section lists config field names and descriptions.
- Config field names are normalised to lowercase when used as keys.
