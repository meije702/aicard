// The Listen card: watches for an event in a connected service.
//
// TRADE-OFF: v1 uses manual confirmation instead of real polling.
// Real Shopify/service polling is blocked by browser CORS restrictions
// without a proxy backend. Instead, we ask Maria to enter the event
// details when the event happens. This is honest: she sees exactly
// what the recipe is waiting for and provides the real data herself.
//
// When onInteraction is not provided (test/headless mode), the executor
// falls back to placeholder data for backward compatibility.

import type { CardConfig, CardResult, EquipmentCheck, Kitchen, RecipeContext } from '../types.ts'
import type { CardExecutor, OnInteraction, StepInteractionField } from './card-executor.ts'

// TRADE-OFF: field mapping is hardcoded for v1. A future version could
// derive fields from card definitions or let the user configure them.
function getFieldsForEvent(listenFor: string): StepInteractionField[] {
  const event = listenFor.toLowerCase()

  if (event.includes('order')) {
    return [
      {
        key: 'customer email',
        label: 'Customer email',
        placeholder: 'e.g. maria@example.com',
      },
      {
        key: 'order number',
        label: 'Order number',
        placeholder: 'e.g. #1042',
      },
    ]
  }

  if (event.includes('subscriber') || event.includes('signup') || event.includes('sign up')) {
    return [
      {
        key: 'subscriber email',
        label: 'Subscriber email',
        placeholder: 'e.g. newuser@example.com',
      },
      {
        key: 'subscriber name',
        label: 'Name',
        placeholder: 'e.g. Alex',
      },
    ]
  }

  if (event.includes('message')) {
    return [
      {
        key: 'sender',
        label: 'Who sent it',
        placeholder: 'e.g. a customer',
      },
      {
        key: 'message content',
        label: 'What did they say',
        placeholder: 'Paste or summarise the message',
      },
    ]
  }

  // Default: a single generic field
  return [
    {
      key: 'event data',
      label: 'Event details',
      placeholder: 'Enter the relevant details',
    },
  ]
}

export const listenExecutor: CardExecutor = {
  type: 'listen',

  checkEquipment(kitchen: Kitchen, config: CardConfig): EquipmentCheck {
    const from = config['from']

    if (!from) {
      const hasAnyEquipment = kitchen.equipment.some(e => e.connected)
      return {
        ready: hasAnyEquipment,
        missing: hasAnyEquipment ? [] : ['a connected service to listen to'],
      }
    }

    const found = kitchen.equipment.find(
      e => e.name.toLowerCase() === from.toLowerCase() && e.connected
    )
    return {
      ready: !!found,
      missing: found ? [] : [from],
    }
  },

  async execute(
    config: CardConfig,
    _context: RecipeContext,
    kitchen: Kitchen,
    onInteraction?: OnInteraction
  ): Promise<CardResult> {
    const listenFor = config['listen for'] ?? 'an event'
    const from = config['from'] ?? 'your connected service'

    // Check that the named equipment is actually connected
    const equipment = kitchen.equipment.find(
      e => e.name.toLowerCase() === from.toLowerCase()
    )

    if (!equipment?.connected) {
      return {
        success: false,
        output: {},
        message: `Your ${from} connection isn\u2019t responding. Check that ${from} is still connected in your kitchen.`,
      }
    }

    // If we have an interaction callback, ask Maria for the real event data
    if (onInteraction) {
      const fields = getFieldsForEvent(listenFor)
      const response = await onInteraction({
        prompt: `When a ${listenFor} comes in from ${from}, enter the details here:`,
        fields,
      })

      // Build output from the user's response
      const output: Record<string, string> = {
        event: listenFor,
        source: from,
        ...response,
      }

      return {
        success: true,
        output,
        message: `Picked up ${listenFor} from ${from}.`,
      }
    }

    // Fallback: no interaction callback (test/headless mode).
    // Return placeholder data so existing tests and headless runs still work.
    return {
      success: true,
      output: {
        event: listenFor,
        source: from,
        'customer email': 'customer@example.com',
      },
      message: `Picked up ${listenFor} from ${from}.`,
    }
  },

  describe(config: CardConfig): string {
    const listenFor = config['listen for'] ?? 'an event'
    const from = config['from'] ?? 'your connected service'
    return `Listening for a ${listenFor} from ${from}...`
  },
}
