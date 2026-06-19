// App — thin composition manifest.
// Wires screens, state, and overlays together. Business logic lives in hooks and modules.

import { useState, useEffect } from 'react'
import type { Recipe, SousChefSetup } from '../types.ts'
import type { RunState } from '../runner/recipe-runner.ts'
import { parseRecipe } from '../parser/recipe-parser.ts'
import { loadKitchen, saveKitchen, upsertRecipe, upsertCardDefinition, setHouseStyle } from '../kitchen/kitchen-state.ts'
import { appendJournalEntry } from '../kitchen/journal.ts'
import thankYouRecipeMd from '../fixtures/recipes/thank-you-follow-up.recipe.md?raw'
import newCustomerWelcomeMd from '../fixtures/recipes/new-customer-welcome.recipe.md?raw'
import reviewRequestMd from '../fixtures/recipes/review-request.recipe.md?raw'
import { builtInCards } from '../fixtures/pantry/built-in-cards.ts'
import { getEquipmentDefinition } from '../fixtures/equipment/index.ts'
import { loadSousChefSetup, saveSousChefSetup, deriveActiveConfig } from './sous-chef-storage.ts'
import { hasSeenTour, markTourSeen } from './first-run.ts'
import { useTheme } from './hooks/use-theme.ts'
import { useEquipmentWizard } from './hooks/use-equipment-wizard.ts'
import Kitchen from './Kitchen.tsx'
import RecipeView from './RecipeView.tsx'
import SousChef from './SousChef.tsx'
import EquipmentWizard from './wizard/EquipmentWizard.tsx'
import RecipeTour from './tour/RecipeTour.tsx'
import LiteParseSpike from './LiteParseSpike.tsx'
import styles from './App.module.css'

// Starter recipes seeded into an empty kitchen on first open, so a new user
// always lands on something runnable they can read, run, and tweak.
const STARTER_RECIPES = [thankYouRecipeMd, newCustomerWelcomeMd, reviewRequestMd]

type Screen = 'kitchen' | 'recipe' | 'liteparse'

export default function App() {
  const { theme, toggleTheme } = useTheme()

  const [screen, setScreen] = useState<Screen>('kitchen')
  const [kitchen, setKitchen] = useState(() => {
    let k = loadKitchen()
    // Seed the starter recipes on first open so the kitchen is never empty — Finding 1
    if (k.recipes.length === 0) {
      for (const recipeMd of STARTER_RECIPES) {
        const parsed = parseRecipe(recipeMd)
        if (parsed.success) {
          k = upsertRecipe(k, parsed.recipe)
        }
      }
    }
    // Seed built-in card definitions so the pantry is always populated
    if (k.pantry.length === 0) {
      for (const card of builtInCards) {
        k = upsertCardDefinition(k, card)
      }
    }
    saveKitchen(k)
    return k
  })

  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null)
  const [activeRunState, setActiveRunState] = useState<RunState | null>(null)
  const [recipeParseErrors, setRecipeParseErrors] = useState<string[]>([])
  const [tourActive, setTourActive] = useState(false)

  // Sous chef multi-provider setup — persisted to localStorage
  const [sousChefSetup, setSousChefSetup] = useState<SousChefSetup>(loadSousChefSetup)

  function handleSousChefSetupChange(setup: SousChefSetup) {
    setSousChefSetup(setup)
    saveSousChefSetup(setup)
  }

  const activeSousChefConfig = deriveActiveConfig(sousChefSetup)

  // First-run guidance: auto-launch the recipe tour the first time a new user
  // opens any recipe, exactly once. The tour is skippable (Escape / close) and
  // works without a sous chef configured (it falls back to built-in stops).
  useEffect(() => {
    if (screen === 'recipe' && activeRecipe && !hasSeenTour()) {
      markTourSeen()
      setTourActive(true)
    }
  }, [screen, activeRecipe])

  function persistKitchen(updated: ReturnType<typeof loadKitchen>) {
    setKitchen(updated)
    saveKitchen(updated)
  }

  const {
    connectingEquipment,
    handleConnectEquipment,
    handleEquipmentConnected,
    handleSetupProgress,
    cancelWizard,
  } = useEquipmentWizard({ kitchen, persistKitchen })

  function handleOpenRecipeFile() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      const parsed = parseRecipe(text)
      if (!parsed.success) {
        setRecipeParseErrors(parsed.errors)
        return
      }
      setRecipeParseErrors([])
      setActiveRecipe(parsed.recipe)
      setScreen('recipe')
    }
    input.click()
  }

  return (
    <div className={styles.app}>
      {/* Frosted glass top bar */}
      <header className={styles.topBar} role="banner">
        <span className={styles.wordmark}>AICard</span>
        {screen === 'recipe' && activeRecipe && (
          <>
            <span className={styles.breadcrumbSeparator} aria-hidden="true">/</span>
            <span className={styles.breadcrumbLabel}>{activeRecipe.name}</span>
          </>
        )}
        <button type="button"
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '☽' : '☀'}
        </button>
      </header>

      {/* Content area — key forces remount for transition animation */}
      <main className={styles.content} key={screen}>
        {screen === 'kitchen' && (
          <Kitchen
            kitchen={kitchen}
            onOpenRecipe={handleOpenRecipeFile}
            onOpenLiteParse={() => setScreen('liteparse')}
            onOpenKitchenRecipe={(recipe) => {
              setRecipeParseErrors([])
              setActiveRecipe(recipe)
              setScreen('recipe')
            }}
            onConnectEquipment={handleConnectEquipment}
            sousChefSetup={sousChefSetup}
            onSousChefSetupChange={handleSousChefSetupChange}
            onHouseStyleChange={(style) => {
              const updated = setHouseStyle(kitchen, style)
              setKitchen(updated)
              saveKitchen(updated)
            }}
          />
        )}

        {screen === 'recipe' && activeRecipe && (
          <RecipeView
            recipe={activeRecipe}
            kitchen={kitchen}
            onBack={() => { setScreen('kitchen'); setActiveRunState(null) }}
            onConnectEquipment={handleConnectEquipment}
            onRunStateChange={setActiveRunState}
            onJournalEntry={(entry) => {
              const updated = appendJournalEntry(kitchen, entry)
              setKitchen(updated)
              saveKitchen(updated)
            }}
          />
        )}

        {screen === 'liteparse' && (
          <LiteParseSpike
            sousChefConfig={activeSousChefConfig}
            onRecipeParsed={(_markdown, parsed) => {
              if (parsed.success) {
                const updated = upsertRecipe(kitchen, parsed.recipe)
                persistKitchen(updated)
                setActiveRecipe(parsed.recipe)
                setScreen('recipe')
              }
            }}
            onBack={() => setScreen('kitchen')}
          />
        )}
      </main>

      <SousChef
        sousChefConfig={activeSousChefConfig}
        recipe={activeRecipe}
        kitchen={kitchen}
        runState={activeRunState}
        onStartTour={() => setTourActive(true)}
      />

      {/* Recipe tour — in-page spotlight walkthrough */}
      {tourActive && activeRecipe && (
        <RecipeTour
          recipe={activeRecipe}
          kitchen={kitchen}
          sousChefConfig={activeSousChefConfig}
          onClose={() => setTourActive(false)}
        />
      )}

      {/* Recipe parse error dialog — shown when the uploaded file has parse errors */}
      {recipeParseErrors.length > 0 && (
        <div role="dialog" aria-modal="true" style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: 'var(--color-surface)', borderRadius: '12px',
            padding: '24px', maxWidth: '480px', width: '90%',
          }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '1rem' }}>We couldn't open this recipe</h2>
            <p style={{ margin: '0 0 12px', fontSize: '0.875rem' }}>
              These are usually small formatting slips. Here's what tripped us up:
            </p>
            <ul style={{ margin: '0 0 16px', paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
              {recipeParseErrors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
            <button type="button" onClick={() => setRecipeParseErrors([])}>Dismiss</button>
          </div>
        </div>
      )}

      {/* Equipment setup wizard */}
      {connectingEquipment && (() => {
        const def = getEquipmentDefinition(connectingEquipment)
        const existing = kitchen.equipment.find(
          e => e.name.toLowerCase() === connectingEquipment.toLowerCase()
        )
        return (
          <EquipmentWizard
            equipmentName={connectingEquipment}
            equipmentDefinition={def ?? null}
            sousChefConfig={activeSousChefConfig}
            onConnect={handleEquipmentConnected}
            onCancel={cancelWizard}
            pendingSetup={existing?.pendingSetup}
            onSetupProgress={handleSetupProgress}
          />
        )
      })()}

    </div>
  )
}
