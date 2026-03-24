// System prompts for the sous chef.
// The sous chef speaks in recipe language, never technical language.
// It knows about kitchens, recipes, cards, and equipment.
// It does not know about APIs, webhooks, or JSON.

import type { PromptContext } from '../types.ts'

export const SOUS_CHEF_SYSTEM_PROMPT = `You are a friendly kitchen assistant who helps people run their recipes.

You know about:
- Recipes: step-by-step instructions for automating something
- Cards: the types of actions a recipe can take (Listen, Wait, Send Message)
- Equipment: the connected services a recipe needs (like a shop, an email account)
- The kitchen: the workspace where recipes run and equipment lives

You speak in kitchen language only. You say "recipe" not "workflow". You say "card" not "action". You say "equipment" not "integration". You say "kitchen" not "workspace".

You are helpful, warm, and direct. You do not use jargon. You do not explain how things work under the hood unless asked. You focus on what the person needs to do next.

When something goes wrong, you describe what happened in plain terms and suggest one clear next step.

You never say "API", "webhook", "JSON", "endpoint", "OAuth", "token", or similar technical terms. If you need to refer to connecting a service, you say "connect your [service name]" or "add [service name] to your kitchen".`

// Build the context string the sous chef receives when checking kitchen readiness
export function buildReadinessContext(
  recipeName: string,
  equipmentNeeded: string[],
  equipmentConnected: string[],
  missing: string[]
): string {
  const connectedList = equipmentConnected.length > 0
    ? equipmentConnected.join(', ')
    : 'nothing yet'

  const missingList = missing.length > 0
    ? missing.join(', ')
    : 'none'

  return `Recipe: "${recipeName}"
Equipment this recipe needs: ${equipmentNeeded.join(', ') || 'nothing'}
Equipment connected in the kitchen: ${connectedList}
Missing equipment: ${missingList}

How steps work in this version:
- Listen steps ask the user to enter event details when the event happens (e.g., "a new order came in — enter the customer email").
- Send Message steps compose the message and open it in the user's email app for them to review and send.
- Wait steps pause the recipe for a set time (the browser tab needs to stay open).`
}

// Build context for a step-description request
export function buildStepContext(
  stepName: string,
  cardType: string,
  config: Record<string, string>
): string {
  const configLines = Object.entries(config)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n')

  return `Step: "${stepName}"
Card type: ${cardType}
Settings:
${configLines || '  (none)'}`
}

// Render a PromptContext into the user message for the sous chef.
// Assembly order: technique → house style → corrections → step context.
// See docs/AICard_Techniques.md for the design.
export function renderCardPrompt(context: PromptContext): string {
  const sections: string[] = []

  if (context.technique) {
    const t = context.technique
    const parts: string[] = []
    if (t.voice) parts.push(`### Voice\n${t.voice}`)
    if (t.constraints) parts.push(`### Constraints\n${t.constraints}`)
    if (t.expertise) parts.push(`### Expertise\n${t.expertise}`)
    if (parts.length > 0) {
      sections.push(`## Technique\n\n${parts.join('\n\n')}`)
    }
  }

  if (context.houseStyle) {
    sections.push(`## House style\n\n${context.houseStyle}`)
  }

  if (context.recentCorrections.length > 0) {
    const examples = context.recentCorrections.map((c, i) => {
      const before = c.before ?? '(unknown)'
      const after = c.after ?? '(unknown)'
      return `${i + 1}. You wrote: "${before}"\n   User changed to: "${after}"`
    })
    sections.push(`## Recent corrections (learn from these)\n\n${examples.join('\n\n')}`)
  }

  sections.push(context.stepContext)

  return sections.join('\n\n---\n\n')
}
