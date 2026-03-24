import { useState } from 'react'
import type { Recipe, SousChefSetup } from '../types.ts'
import type { RunState } from '../runner/recipe-runner.ts'
import { parseRecipe } from '../parser/recipe-parser.ts'
import { loadKitchen, saveKitchen, upsertEquipment, upsertRecipe, setHouseStyle } from '../kitchen/kitchen-state.ts'
import { appendJournalEntry } from '../kitchen/journal.ts'
import thankYouRecipeMd from '../fixtures/recipes/thank-you-follow-up.recipe.md?raw'
import { createEquipment } from '../kitchen/equipment.ts'
import { loadSousChefSetup, saveSousChefSetup, deriveActiveConfig } from './sous-chef-storage.ts'
import Kitchen from './Kitchen.tsx'
import RecipeView from './RecipeView.tsx'
import SousChef from './SousChef.tsx'
import EquipmentConnect from './EquipmentConnect.tsx'
import styles from './App.module.css'

type Screen = 'kitchen' | 'recipe'

function getInitialTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem('aicard:theme')
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('kitchen')
  const [kitchen, setKitchen] = useState(() => {
    const loaded = loadKitchen()
    // Seed with the starter recipe on first open — Finding 1
    if (loaded.recipes.length === 0) {
      const parsed = parseRecipe(thankYouRecipeMd)
      if (parsed.success) {
        const seeded = upsertRecipe(loaded, parsed.recipe)
        saveKitchen(seeded)
        return seeded
      }
    }
    return loaded
  })
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('aicard:theme', next)
  }

  // Set initial theme on mount
  useState(() => {
    document.documentElement.setAttribute('data-theme', theme)
  })
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null)
  const [activeRunState, setActiveRunState] = useState<RunState | null>(null)
  const [recipeParseErrors, setRecipeParseErrors] = useState<string[]>([])
  // Equipment connection dialog state
  const [connectingEquipment, setConnectingEquipment] = useState<string | null>(null)

  // Sous chef multi-provider setup — persisted to localStorage
  const [sousChefSetup, setSousChefSetup] = useState<SousChefSetup>(loadSousChefSetup)

  function handleSousChefSetupChange(setup: SousChefSetup) {
    setSousChefSetup(setup)
    saveSousChefSetup(setup)
  }

  const activeSousChefConfig = deriveActiveConfig(sousChefSetup)

  function persistKitchen(updated: ReturnType<typeof loadKitchen>) {
    setKitchen(updated)
    saveKitchen(updated)
  }

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

  function handleConnectEquipment(name: string) {
    setConnectingEquipment(name)
  }

  function handleEquipmentConnected(config: Record<string, string>) {
    if (!connectingEquipment) return
    const equipment = createEquipment(connectingEquipment, connectingEquipment.toLowerCase())
    // Equipment in 'compose' mode (e.g. Gmail) hands off to the user's own app
    // rather than acting autonomously — mark it as 'handoff' so the UI can be
    // honest about what it can do (Finding 3).
    const mode: 'full' | 'handoff' = config.mode === 'compose' ? 'handoff' : 'full'
    const connected = { ...equipment, connected: true, config, mode }
    persistKitchen(upsertEquipment(kitchen, connected))
    setConnectingEquipment(null)
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
        <button
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
      </main>

      <SousChef
        sousChefConfig={activeSousChefConfig}
        recipe={activeRecipe}
        kitchen={kitchen}
        runState={activeRunState}
      />

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
            <h2 style={{ margin: '0 0 12px', fontSize: '1rem' }}>Recipe file has errors</h2>
            <ul style={{ margin: '0 0 16px', paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
              {recipeParseErrors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
            <button onClick={() => setRecipeParseErrors([])}>Dismiss</button>
          </div>
        </div>
      )}

      {/* Equipment connection dialog */}
      {connectingEquipment && (
        <EquipmentConnect
          equipmentName={connectingEquipment}
          onConnect={handleEquipmentConnected}
          onCancel={() => setConnectingEquipment(null)}
        />
      )}

    </div>
  )
}
