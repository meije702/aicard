import { useState } from 'react'
import type { Recipe, SousChefSetup } from '../types.ts'
import type { RunState } from '../runner/recipe-runner.ts'
import { parseRecipe } from '../parser/recipe-parser.ts'
import { loadKitchen, saveKitchen, upsertEquipment } from '../kitchen/kitchen-state.ts'
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
  const [kitchen, setKitchen] = useState(loadKitchen)
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
      const recipe = parseRecipe(text)
      setActiveRecipe(recipe)
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
    const connected = { ...equipment, connected: true, config }
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
            onConnectEquipment={handleConnectEquipment}
            sousChefSetup={sousChefSetup}
            onSousChefSetupChange={handleSousChefSetupChange}
          />
        )}

        {screen === 'recipe' && activeRecipe && (
          <RecipeView
            recipe={activeRecipe}
            kitchen={kitchen}
            onBack={() => { setScreen('kitchen'); setActiveRunState(null) }}
            onConnectEquipment={handleConnectEquipment}
            onRunStateChange={setActiveRunState}
          />
        )}
      </main>

      <SousChef
        sousChefConfig={activeSousChefConfig}
        recipe={activeRecipe}
        kitchen={kitchen}
        runState={activeRunState}
      />

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
