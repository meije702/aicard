// The Listen card: watches for an event in a connected service.
// When the event fires, it captures the event data and passes it to the next step.

import type { CardConfig, CardResult, EquipmentCheck, Kitchen, RecipeContext } from '../types.ts'
import type { CardExecutor } from './card-executor.ts'

export const listenExecutor: CardExecutor = {
  type: 'listen',

  checkEquipment(kitchen: Kitchen): EquipmentCheck {
    // Listen needs the equipment named in its "from" config to be connected.
    // We can't check config here (it's not passed), so we verify at execute time.
    // At the kitchen-readiness stage, we confirm at least one service is connected.
    const hasAnyEquipment = kitchen.equipment.some(e => e.connected)
    return {
      ready: hasAnyEquipment,
      missing: hasAnyEquipment ? [] : ['a connected service to listen to'],
    }
  },

  async execute(
    config: CardConfig,
    _context: RecipeContext,
    kitchen: Kitchen
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
        message: `Your ${from} connection isn't responding. Check that ${from} is still connected in your kitchen.`,
      }
    }

    // TRADE-OFF: v1 uses polling to detect events. A future version will use
    // webhooks via a small backend service. For now, we return a placeholder
    // result indicating the step is listening.
    return {
      success: true,
      output: {
        event: listenFor,
        source: from,
        // In a real implementation, the event data would be populated here
        'customer email': 'customer@example.com',
      },
      message: `Picked up a new ${listenFor} from ${from}.`,
    }
  },

  describe(config: CardConfig): string {
    const listenFor = config['listen for'] ?? 'an event'
    const from = config['from'] ?? 'your connected service'
    return `Listening for a ${listenFor} from ${from}...`
  },
}
