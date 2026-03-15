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
