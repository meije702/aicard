// The main kitchen view — Maria's first impression.
// This needs to feel warm, inviting, and clear — not like a settings panel.

import type { Kitchen as KitchenType, SousChefSetup } from '../types.ts'
import { getProvider } from '../sous-chef/providers.ts'
import SousChefProviders from './SousChefProviders.tsx'
import styles from './Kitchen.module.css'

interface Props {
  kitchen: KitchenType
  onOpenRecipe: () => void
  onConnectEquipment: (name: string) => void
  sousChefSetup: SousChefSetup
  onSousChefSetupChange: (setup: SousChefSetup) => void
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

export default function Kitchen({ kitchen, onOpenRecipe, sousChefSetup, onSousChefSetupChange }: Props) {
  const connectedEquipment = kitchen.equipment.filter(e => e.connected)
  const isConnected = sousChefSetup.active !== null
  const activeProvider = isConnected ? getProvider(sousChefSetup.active!) : null

  return (
    <div className={styles.container}>
      {/* Hero greeting */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Your Kitchen</h1>
        <p className={styles.heroSubtitle}>
          If you can follow a recipe, you can build with AI.
        </p>
      </div>

      {/* Sous Chef — inline provider selection */}
      <section className={styles.sectionCard} aria-label="Sous Chef configuration">
        <div className={styles.sectionLabel}>Sous Chef</div>
        <div className={styles.apiKeyRow}>
          <div className={styles.apiKeyIcon} aria-hidden="true">🧑‍🍳</div>
          <div className={styles.apiKeyContent}>
            <div className={styles.apiKeyLabel}>
              {isConnected ? `Connected to ${activeProvider!.label}` : 'Choose your sous chef'}
            </div>
            <div className={styles.apiKeyHint}>
              {isConnected
                ? 'Your key stays in your browser — never sent anywhere else.'
                : 'Pick an AI to power your sous chef. Your keys stay in this browser only.'}
            </div>
          </div>
        </div>

        <SousChefProviders setup={sousChefSetup} onSetupChange={onSousChefSetupChange} />
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
