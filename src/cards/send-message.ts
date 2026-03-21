// The Send Message card: composes a message and hands it off to the user.
//
// TRADE-OFF: v1 uses mailto: to open the user's email client with a
// pre-composed message. Real email sending requires OAuth (backend) or
// a transactional email API. The compose-and-hand-off approach is honest:
// Maria sees the message, reviews it, and sends it herself.
//
// Step reference resolution ({step N: key}) happens in the runner
// before config reaches this executor. By the time execute() is called,
// all references are already resolved or the step has been failed.

import type { CardConfig, CardResult, EquipmentCheck, Kitchen, RecipeContext } from '../types.ts'
import type { CardExecutor, OnInteraction } from './card-executor.ts'

// Build a mailto: URL from the message fields.
// Handles encoding of special characters in subject and body.
export function buildMailtoUrl(to: string, subject: string, message: string): string {
  const params: string[] = []
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`)
  if (message) params.push(`body=${encodeURIComponent(message)}`)
  const query = params.length > 0 ? `?${params.join('&')}` : ''
  return `mailto:${encodeURIComponent(to)}${query}`
}

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
    kitchen: Kitchen,
    onInteraction?: OnInteraction
  ): Promise<CardResult> {
    const to = config['to'] ?? ''
    const subject = config['subject'] ?? ''
    const message = config['message'] ?? ''

    if (!to) {
      return {
        success: false,
        output: {},
        message: 'The message has no recipient. Check the \u201CTo\u201D setting in this step.',
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

    // If we have an interaction callback, show the composed message for review.
    // The mailto: link is included as a 'link' field so the UI renders it as
    // a native <a href> the user clicks — avoiding popup-blocker issues from
    // programmatic window.open() calls.
    if (onInteraction) {
      const mailtoUrl = buildMailtoUrl(to, subject, message)
      await onInteraction({
        prompt: 'Ready to send this message. Review it, then click the link to open in your email app:',
        fields: [
          { key: 'to', label: 'To', defaultValue: to, readOnly: true },
          { key: 'subject', label: 'Subject', defaultValue: subject, readOnly: true },
          { key: 'message', label: 'Message', defaultValue: message, readOnly: true },
          { key: 'mailto', label: 'Open in email app', defaultValue: mailtoUrl, type: 'link' },
        ],
      })
    }

    return {
      success: true,
      output: { sent: 'true', to, subject },
      message: `Opened your email with a message to ${to} ready to send.`,
    }
  },

  describe(config: CardConfig): string {
    const to = config['to'] ?? 'the recipient'
    return `Sending a message to ${to}...`
  },
}
