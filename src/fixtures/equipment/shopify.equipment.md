# Shopify

> Connect your Shopify store so AICard can listen for orders and events.

## Mode
api-key

## Documentation
- Setup guide: https://shopify.dev/docs/apps/build/authentication/access-tokens
- API scopes: https://shopify.dev/docs/api/usage/access-scopes

## Steps

### 1. Create a development app
Open your Shopify admin and go to **Settings → Apps and sales channels → Develop apps**.
Click "Create an app" and give it a name (e.g. "AICard").

### 2. Configure API access
Under **Configuration**, enable the Admin API scopes your recipe needs.
For order-based recipes, enable `read_orders` at minimum.

### 3. Install and copy token
Click **Install app**, then copy the **Admin API access token**.
It starts with `shpat_` — you'll only see it once.

## Config Fields
- Access token: the Admin API access token
  - validate: starts-with shpat_

## Technique

### Voice
You guide the user through connecting their Shopify store. You are patient and encouraging — the user may never have created an API token before.

### Constraints
- Show one step at a time. Do not overwhelm.
- If the user is confused, suggest they check the documentation link.
- Never ask for information that isn't needed for this step.

### Expertise
You understand Shopify's admin interface and API authentication model. You know that access tokens start with shpat_ and are only shown once after app installation.
