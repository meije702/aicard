// EquipmentConnect: the dialog Maria sees when connecting a piece of equipment.
// Warm, clear, and honest about what it needs and why.
//
// Equipment-specific prompts guide Maria through what to enter.
// Some equipment (like Gmail) uses "compose mode" — no key needed,
// because v1 composes the message and hands it off to the user's email client.

import { useState } from 'react'
import styles from './EquipmentConnect.module.css'

interface Props {
  equipmentName: string
  onConnect: (config: Record<string, string>) => void
  onCancel: () => void
}

// Equipment-specific connection info.
// Maria should understand every word here without knowing what an API is.
interface EquipmentProfile {
  explanation: string
  mode: 'api-key' | 'compose'
  keyPlaceholder?: string
  keyLabel?: string
}

function getEquipmentProfile(name: string): EquipmentProfile {
  const n = name.toLowerCase()

  if (n.includes('shopify') || n.includes('shop')) {
    return {
      explanation:
        'To connect your Shopify store, you need an access token. ' +
        'You can create one in your Shopify admin: go to Settings \u2192 Apps and sales channels \u2192 Develop apps, ' +
        'then create an app and copy the access token.',
      mode: 'api-key',
      keyPlaceholder: 'shpat_...',
      keyLabel: 'Access token',
    }
  }

  if (n.includes('gmail') || n.includes('email') || n.includes('mail')) {
    return {
      explanation:
        'AICard will compose your emails and open them in your email app for you to review and send. ' +
        'No password or login needed \u2014 you stay in control of every message.',
      mode: 'compose',
    }
  }

  if (n.includes('discord')) {
    return {
      explanation:
        'To connect Discord, you need a bot token. ' +
        'You can create one in the Discord Developer Portal: create an application, ' +
        'go to the Bot section, and copy the token.',
      mode: 'api-key',
      keyPlaceholder: 'Enter your Discord bot token',
      keyLabel: 'Bot token',
    }
  }

  if (n.includes('slack')) {
    return {
      explanation:
        'To connect Slack, you need a bot token. ' +
        'You can create one in the Slack API dashboard: create an app, ' +
        'go to OAuth & Permissions, and copy the Bot User OAuth Token.',
      mode: 'api-key',
      keyPlaceholder: 'xoxb-...',
      keyLabel: 'Bot token',
    }
  }

  // Default: generic API key
  return {
    explanation:
      `To connect ${name}, you\u2019ll need an access key or token from that service. ` +
      'Check the service\u2019s settings or developer section to find it.',
    mode: 'api-key',
    keyPlaceholder: 'Paste your access key here',
    keyLabel: 'Access key',
  }
}

function equipmentIcon(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('shopify') || n.includes('shop')) return '\uD83D\uDECD'
  if (n.includes('gmail') || n.includes('email') || n.includes('mail')) return '\u2709\uFE0F'
  if (n.includes('discord')) return '\uD83D\uDCAC'
  if (n.includes('slack')) return '\uD83D\uDCAC'
  if (n.includes('calendar')) return '\uD83D\uDCC5'
  return '\uD83D\uDD0C'
}

export default function EquipmentConnect({ equipmentName, onConnect, onCancel }: Props) {
  const profile = getEquipmentProfile(equipmentName)
  const [apiKey, setApiKey] = useState('')

  function handleConnect() {
    if (profile.mode === 'compose') {
      onConnect({ mode: 'compose' })
    } else {
      if (!apiKey.trim()) return
      onConnect({ apiKey: apiKey.trim() })
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && profile.mode === 'api-key' && apiKey.trim()) {
      handleConnect()
    }
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  const canConnect = profile.mode === 'compose' || apiKey.trim().length > 0

  return (
    <div className={styles.overlay} onClick={onCancel} onKeyDown={handleKeyDown}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-label={`Connect ${equipmentName}`}
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        {/* Equipment identity */}
        <div className={styles.equipmentHeader}>
          <div className={styles.equipmentIcon} aria-hidden="true">
            {equipmentIcon(equipmentName)}
          </div>
          <h2 className={styles.equipmentName}>Connect {equipmentName}</h2>
        </div>

        {/* Explanation */}
        <p className={styles.explanation}>{profile.explanation}</p>

        {/* Input or compose-mode info */}
        {profile.mode === 'api-key' ? (
          <div>
            <label className={styles.inputLabel} htmlFor="equipment-key">
              {profile.keyLabel ?? 'Access key'}
            </label>
            <input
              id="equipment-key"
              type="password"
              className={styles.keyInput}
              placeholder={profile.keyPlaceholder ?? 'Paste your key here'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              autoFocus
              autoComplete="off"
            />
            {/* TRADE-OFF: keys stored in localStorage, not encrypted.
                Same posture as the Anthropic API key — good enough for v1. */}
            <p className={styles.securityNote}>
              Your key stays in this browser only — it is never sent to our servers.
            </p>
          </div>
        ) : (
          <div className={styles.composeInfo}>
            No setup needed. {equipmentName} will work in compose mode — AICard prepares your
            messages and you send them yourself.
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button
            className={styles.connectButton}
            onClick={handleConnect}
            disabled={!canConnect}
          >
            {profile.mode === 'compose' ? 'Got it' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  )
}
