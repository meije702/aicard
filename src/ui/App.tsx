import { useState } from 'react'
import type { Recipe, SousChefConfig } from '../types.ts'
import type { RunState } from '../runner/recipe-runner.ts'
import { parseRecipe } from '../parser/recipe-parser.ts'
import { loadKitchen, saveKitchen, upsertEquipment } from '../kitchen/kitchen-state.ts'
import { createEquipment } from '../kitchen/equipment.ts'
import Kitchen from './Kitchen.tsx'
import RecipeView from './RecipeView.tsx'
import SousChef from './SousChef.tsx'
import EquipmentConnect from './EquipmentConnect.tsx'
import ProviderConnect from './ProviderConnect.tsx'
import styles from './App.module.css'

type Screen = 'kitchen' | 'recipe'

const PROVIDER_STORAGE_KEY = 'aicard:sous-chef-config'
const LEGACY_API_KEY = 'aicard:api-key'

function loadSousChefConfig(): SousChefConfig | null {
  // Migrate legacy Anthropic-only key to new format
  const legacy = localStorage.getItem(LEGACY_API_KEY)
  if (legacy) {
    const migrated: SousChefConfig = { provider: 'anthropic', apiKey: legacy.trim() }
    localStorage.setItem(PROVIDER_STORAGE_KEY, JSON.stringify(migrated))
    localStorage.removeItem(LEGACY_API_KEY)
    return migrated
  }
  const stored = localStorage.getItem(PROVIDER_STORAGE_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored) as SousChefConfig
  } catch {
    return null
  }
}

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
  // Provider connection dialog state
  const [providerDialogOpen, setProviderDialogOpen] = useState(false)

  // Sous chef provider config — persisted to localStorage
  const [sousChefConfig, setSousChefConfig] = useState<SousChefConfig | null>(loadSousChefConfig)

  function handleSetSousChefConfig(config: SousChefConfig) {
    setSousChefConfig(config)
    localStorage.setItem(PROVIDER_STORAGE_KEY, JSON.stringify(config))
  }

  function handleClearSousChefConfig() {
    setSousChefConfig(null)
    localStorage.removeItem(PROVIDER_STORAGE_KEY)
  }

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
            sousChefConfig={sousChefConfig}
            onConnectSousChef={() => setProviderDialogOpen(true)}
            onClearSousChef={handleClearSousChefConfig}
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
        sousChefConfig={sousChefConfig}
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

      {/* Provider selection dialog */}
      {providerDialogOpen && (
        <ProviderConnect
          onConnect={(config) => { handleSetSousChefConfig(config); setProviderDialogOpen(false) }}
          onCancel={() => setProviderDialogOpen(false)}
          currentConfig={sousChefConfig}
        />
      )}
    </div>
  )
}
