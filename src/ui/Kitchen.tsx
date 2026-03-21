// The main kitchen view — Maria's first impression.
// This needs to feel warm, inviting, and clear — not like a settings panel.

import { useState } from 'react'
import type { Kitchen as KitchenType, Recipe, SousChefSetup } from '../types.ts'
import { getProvider } from '../sous-chef/providers.ts'
import SousChefProviders from './SousChefProviders.tsx'
import styles from './Kitchen.module.css'

interface Props {
  kitchen: KitchenType
  onOpenRecipe: () => void
  onOpenKitchenRecipe: (recipe: Recipe) => void
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

export default function Kitchen({ kitchen, onOpenRecipe, onOpenKitchenRecipe, sousChefSetup, onSousChefSetupChange }: Props) {
  const connectedEquipment = kitchen.equipment.filter(e => e.connected)
  const isConnected = sousChefSetup.active !== null
  const activeProvider = isConnected ? getProvider(sousChefSetup.active!) : null
  // Collapse the setup UI after initial config — Finding 10
  const [setupExpanded, setSetupExpanded] = useState(!isConnected)

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

        {isConnected && !setupExpanded ? (
          /* Compact status line — shown after initial setup */
          <div className={styles.sousChefStatus}>
            <div className={styles.apiKeyRow}>
              <div className={styles.apiKeyIcon} aria-hidden="true">🧑‍🍳</div>
              <div className={styles.apiKeyContent}>
                <div className={styles.apiKeyLabel}>{activeProvider!.label} · Ready</div>
                <div className={styles.apiKeyHint}>Your key stays in your browser only.</div>
              </div>
            </div>
            <button
              className={styles.editSetupButton}
              onClick={() => setSetupExpanded(true)}
              aria-label="Edit sous chef configuration"
            >
              Edit
            </button>
          </div>
        ) : (
          /* Full setup UI */
          <>
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
              {isConnected && (
                <button
                  className={styles.editSetupButton}
                  onClick={() => setSetupExpanded(false)}
                  aria-label="Collapse sous chef configuration"
                >
                  Done
                </button>
              )}
            </div>
            <SousChefProviders setup={sousChefSetup} onSetupChange={(s) => {
              onSousChefSetupChange(s)
              // Collapse after a provider becomes active
              if (s.active) setSetupExpanded(false)
            }} />
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
      <section className={styles.sectionCard} aria-label="Your recipes">
        <div className={styles.sectionLabel}>Recipes</div>

        {/* Stored recipes (including the bundled starter) */}
        {kitchen.recipes.length > 0 && (
          <div className={styles.recipeList} role="list">
            {kitchen.recipes.map(recipe => (
              <button
                key={recipe.name}
                className={styles.recipeCard}
                onClick={() => onOpenKitchenRecipe(recipe)}
                aria-label={`Open recipe: ${recipe.name}`}
              >
                <span className={styles.recipeCardIcon} aria-hidden="true">📖</span>
                <div className={styles.recipeCardBody}>
                  <div className={styles.recipeCardName}>{recipe.name}</div>
                  {recipe.purpose && (
                    <div className={styles.recipeCardPurpose}>{recipe.purpose}</div>
                  )}
                </div>
                <span className={styles.recipeCardArrow} aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        )}

        {/* File picker — always available to add more recipes */}
        <button
          className={kitchen.recipes.length > 0 ? styles.recipeDropZoneSmall : styles.recipeDropZone}
          onClick={onOpenRecipe}
          aria-label="Open a recipe file from your computer"
        >
          <span className={styles.recipeDropIcon} aria-hidden="true">📂</span>
          <div className={styles.recipeDropTitle}>
            {kitchen.recipes.length > 0 ? 'Open another recipe' : 'Open a recipe'}
          </div>
          {kitchen.recipes.length === 0 && (
            <div className={styles.recipeDropHint}>
              Choose a <code>.recipe.md</code> file from your computer
            </div>
          )}
        </button>
      </section>
    </div>
  )
}
