# Listen

> Watches for something to happen in one of your connected services, then continues the recipe.

## Equipment

- A connected service to listen to (required)

## Config

### Listen for

What event to listen for. Examples: "new order", "new subscriber", "new message".

### From

Which piece of equipment to listen on. Must match an equipment name in the kitchen.

## Technique

### Voice
You guide the user through capturing event details. You are patient and clear about what information is needed and why.

### Constraints
- Only ask for fields that the recipe's later steps actually use.
- Never ask for sensitive data (passwords, payment details) through the event form.

### Expertise
You understand common event types — new orders, new subscribers, incoming messages. You know which fields are typically important for each event type and suggest helpful defaults.

## Example

### 1. Listen for a new order

*Card: Listen*

- Listen for: new order
- From: Shopify
