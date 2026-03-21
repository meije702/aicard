// The main kitchen view — Maria's first impression.
// This needs to feel warm, inviting, and clear — not like a settings panel.

import type { Kitchen as KitchenType } from '../types.ts'
import styles from './Kitchen.module.css'

interface Props {
  kitchen: KitchenType
  onOpenRecipe: () => void
  onConnectEquipment: (name: string) => void
  apiKey: string
  onSetApiKey: (key: string) => void
  onClearApiKey: () => void
}

// Map equipment names to friendly icons
function equipmentIcon(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('shopify') || n.includes('shop')) return '🛍'
  if (n.includes('gmail') || n.includes('email') || n.includes('mail')) return '✉️'
  if (n.includes('discord')) return '💬'
  if (n.includes('slack')) return '💬'
  if (n.includes('calendar')) return '📅'
  if (n.includes('spreadsheet') || n.includes('sheets')) return '📊'
  return '🔌'
}

export default function Kitchen({ kitchen, onOpenRecipe, apiKey, onSetApiKey, onClearApiKey }: Props) {
  const connectedEquipment = kitchen.equipment.filter(e => e.connected)
  const hasApiKey = apiKey.trim().length > 0

  return (
    <div className={styles.container}>
      {/* Hero greeting */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Your Kitchen</h1>
        <p className={styles.heroSubtitle}>
          If you can follow a recipe, you can build with AI.
        </p>
      </div>

      {/* Sous Chef — API key setup */}
      <section className={styles.sectionCard} aria-label="Sous Chef configuration">
        <div className={styles.sectionLabel}>Sous Chef</div>
        <div className={styles.apiKeyRow}>
          <div className={styles.apiKeyIcon} aria-hidden="true">🧑‍🍳</div>
          <div className={styles.apiKeyContent}>
            <div className={styles.apiKeyLabel}>
              {hasApiKey ? 'Sous chef is ready to help' : 'Connect your sous chef'}
            </div>
            <div className={styles.apiKeyHint}>
              Your key stays in your browser — never sent anywhere else.
            </div>
          </div>
        </div>

        {hasApiKey ? (
          <div className={styles.apiKeyConfigured}>
            <span className={styles.checkIcon} aria-hidden="true">✓</span>
            <span className={styles.apiKeyMasked}>
              {apiKey.slice(0, 10)}{'•'.repeat(8)}
            </span>
            <button
              className={styles.clearKeyButton}
              onClick={onClearApiKey}
              aria-label="Remove API key"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <input
              type="password"
              className={styles.apiKeyInput}
              placeholder="sk-ant-..."
              value={apiKey}
              onChange={e => onSetApiKey(e.target.value)}
              aria-label="Anthropic API key"
            />
            <p className={styles.apiKeyHint} style={{ marginTop: 'var(--space-2)' }}>
              Don't have a key?{' '}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.apiKeyLink}
              >
                Get one at console.anthropic.com
              </a>
              {' '}— it's free to start.
            </p>
          </>
        )}
      </section>

      {/* Equipment */}
      <section className={styles.sectionCard} aria-label="Connected equipment">
        <div className={styles.sectionLabel}>Equipment</div>
        {connectedEquipment.length === 0 ? (
          <p className={styles.emptyState}>
            No equipment connected yet. When you open a recipe, you'll be able to connect
            the services it needs.
          </p>
        ) : (
          <div className={styles.equipmentGrid} role="list">
            {connectedEquipment.map(e => (
              <div key={e.name} className={styles.equipmentCard} role="listitem">
                <div className={styles.equipmentIcon} aria-hidden="true">
                  {equipmentIcon(e.name)}
                </div>
                <span className={styles.equipmentName}>{e.name}</span>
                <span className={styles.equipmentStatus}>
                  <span className={styles.statusDot} aria-hidden="true" />
                  Connected
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recipes */}
      <section className={styles.sectionCard} aria-label="Open a recipe">
        <div className={styles.sectionLabel}>Recipes</div>
        <button
          className={styles.recipeDropZone}
          onClick={onOpenRecipe}
          aria-label="Open a recipe file from your computer"
        >
          <span className={styles.recipeDropIcon} aria-hidden="true">📖</span>
          <div className={styles.recipeDropTitle}>Open a recipe</div>
          <div className={styles.recipeDropHint}>
            Choose a <code>.recipe.md</code> file from your computer
          </div>
        </button>
      </section>
    </div>
  )
}
