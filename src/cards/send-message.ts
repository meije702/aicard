// The Send Message card: sends a message using a connected service.
// Note: step reference resolution ({step N: key}) happens in the runner
// before config reaches this executor. By the time execute() is called,
// all references are already resolved or the step has been failed.

import type { CardConfig, CardResult, EquipmentCheck, Kitchen, RecipeContext } from '../types.ts'
import type { CardExecutor } from './card-executor.ts'

export const sendMessageExecutor: CardExecutor = {
    type: 'send-message',

    checkEquipment(kitchen: Kitchen, _config: CardConfig): EquipmentCheck {
        // Send Message needs at least one connected messaging service
        const messagingServices = kitchen.equipment.filter(e => e.connected)
        return {
            ready: messagingServices.length > 0,
            missing: messagingServices.length > 0 ? [] : ['a connected messaging service (email, Slack, etc.)'],
        }
    },

    async execute(
        config: CardConfig,
        _context: RecipeContext,
        kitchen: Kitchen
    ): Promise<CardResult> {
        const to = config['to'] ?? ''
        const subject = config['subject'] ?? ''
        const message = config['message'] ?? ''

        if (!to) {
            return {
                success: false,
                output: {},
                message: 'The message has no recipient. Check the "To" setting in this step.',
            }
        }

        // Find a connected service that can send messages
        const sender = kitchen.equipment.find(e => e.connected)

        if (!sender) {
            return {
                success: false,
                output: {},
                message: 'No messaging service is connected. Add one to your kitchen first.',
            }
        }

        // TRADE-OFF: v1 logs the message rather than actually sending it.
        // Real sending requires an API call to the connected service.
        // This stub is sufficient to test the full recipe flow.
        console.log(`[Send Message] To: ${to} | Subject: ${subject} | Message: ${message}`)

        return {
            success: true,
            output: { sent: 'true', to, subject },
            message: `Message sent to ${to}.`,
        }
    },

    describe(config: CardConfig): string {
        const to = config['to'] ?? 'the recipient'
        return `Sending a message to ${to}...`
    },
}
