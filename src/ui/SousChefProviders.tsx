// SousChefProviders — inline provider selection with logo row + expandable config.
//
// Decomposed into four focused pieces (Single Responsibility):
//   SousChefProviders — thin orchestrator, owns expandedId/hoveredId state
//   ProviderLogo      — one 48×48 logo button with visual state
//   ProviderTooltip   — hover/focus info card
//   ProviderConfigPanel — expandable key input area with brand tint

import { useState, useRef, useEffect } from 'react'
import type { SousChefProviderId, SousChefSetup, SousChefProviderEntry } from '../types.ts'
import { PROVIDERS, type ProviderMeta } from '../sous-chef/providers.ts'
import { getProviderLogo } from './provider-logos.tsx'
import styles from './SousChefProviders.module.css'

interface Props {
  setup: SousChefSetup
  onSetupChange: (setup: SousChefSetup) => void
}

type ProviderState = 'active' | 'configured' | 'unconfigured'

// Detect HTTPS — affects Ollama usability
const IS_HTTPS = typeof location !== 'undefined' && location.protocol === 'https:'

// --- Orchestrator ---

export default function SousChefProviders({ setup, onSetupChange }: Props) {
  const [expandedId, setExpandedId] = useState<SousChefProviderId | null>(null)
  const [hoveredId, setHoveredId] = useState<SousChefProviderId | null>(null)

  function getState(id: SousChefProviderId): ProviderState {
    if (setup.active === id) return 'active'
    if (setup.providers[id]) return 'configured'
    return 'unconfigured'
  }

  function handleMakeActive(id: SousChefProviderId, entry?: SousChefProviderEntry) {
    const providers = entry
      ? { ...setup.providers, [id]: entry }
      : setup.providers
    onSetupChange({ active: id, providers })
  }

  function handleRemove(id: SousChefProviderId) {
    const { [id]: _, ...rest } = setup.providers
    onSetupChange({
      active: setup.active === id ? null : setup.active,
      providers: rest,
    })
    setExpandedId(null)
  }

  const expandedProvider = expandedId ? PROVIDERS.find(p => p.id === expandedId) : null
  const expandedEntry = expandedId ? setup.providers[expandedId] : undefined

  return (
    <div>
      {/* Logo row */}
      <div className={styles.providerRow}>
        {PROVIDERS.map(provider => (
          <div key={provider.id} className={styles.tooltipWrapper}>
            <ProviderLogo
              provider={provider}
              state={getState(provider.id)}
              expanded={expandedId === provider.id}
              onClick={() => setExpandedId(expandedId === provider.id ? null : provider.id)}
              onHover={setHoveredId}
            />
            {hoveredId === provider.id && expandedId !== provider.id && (
              <ProviderTooltip provider={provider} />
            )}
          </div>
        ))}
      </div>

      {/* Config area — animated expand */}
      <div
        className={`${styles.configArea} ${expandedId ? styles.configAreaOpen : ''}`}
        style={{ '--provider-brand': expandedProvider?.brandColor } as React.CSSProperties}
      >
        <div className={styles.configAreaInner}>
          {expandedProvider && (
            <ProviderConfigPanel
              provider={expandedProvider}
              entry={expandedEntry}
              isActive={setup.active === expandedProvider.id}
              onMakeActive={(entry) => handleMakeActive(expandedProvider.id, entry)}
              onRemove={() => handleRemove(expandedProvider.id)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// --- ProviderLogo ---

function ProviderLogo({
  provider,
  state,
  expanded,
  onClick,
  onHover,
}: {
  provider: ProviderMeta
  state: ProviderState
  expanded: boolean
  onClick: () => void
  onHover: (id: SousChefProviderId | null) => void
}) {
  const Logo = getProviderLogo(provider.id)
  const stateClass = state === 'active' ? styles.providerActive
    : state === 'configured' ? styles.providerConfigured
    : ''

  return (
    <button
      className={`${styles.providerButton} ${stateClass} ${expanded ? styles.providerExpanded : ''}`}
      style={{ '--provider-brand': provider.brandColor } as React.CSSProperties}
      onClick={onClick}
      onMouseEnter={() => onHover(provider.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(provider.id)}
      onBlur={() => onHover(null)}
      aria-label={provider.label}
      aria-expanded={expanded}
    >
      <Logo size={24} />
      {state === 'active' && <span className={styles.activeDot} />}
      {state === 'configured' && <span className={styles.configuredBadge}>✓</span>}
    </button>
  )
}

// --- ProviderTooltip ---

function ProviderTooltip({ provider }: { provider: ProviderMeta }) {
  return (
    <div className={styles.tooltip} role="tooltip">
      <div className={styles.tooltipLabel}>{provider.label}</div>
      <div className={styles.tooltipDescription}>{provider.description}</div>
      <div className={styles.tooltipCost}>{provider.costNote}</div>
    </div>
  )
}

// --- ProviderConfigPanel ---

function ProviderConfigPanel({
  provider,
  entry,
  isActive,
  onMakeActive,
  onRemove,
}: {
  provider: ProviderMeta
  entry: SousChefProviderEntry | undefined
  isActive: boolean
  onMakeActive: (entry?: SousChefProviderEntry) => void
  onRemove: () => void
}) {
  const [editing, setEditing] = useState(!entry)
  const [apiKey, setApiKey] = useState(entry?.apiKey ?? '')
  const [baseUrl, setBaseUrl] = useState(entry?.baseUrl ?? 'http://localhost:11434')
  const [model, setModel] = useState(entry?.model ?? '')
  const inputRef = useRef<HTMLInputElement | null>(null)

  // When entry changes (e.g. switching providers), reset local state
  const entryKey = entry?.apiKey ?? ''
  const [lastEntryKey, setLastEntryKey] = useState(entryKey)
  if (entryKey !== lastEntryKey) {
    setLastEntryKey(entryKey)
    setApiKey(entry?.apiKey ?? '')
    setBaseUrl(entry?.baseUrl ?? 'http://localhost:11434')
    setModel(entry?.model ?? '')
    setEditing(!entry)
  }

  const Logo = getProviderLogo(provider.id)
  const hasSavedKey = !!entry
  const canSave = provider.keyRequired ? apiKey.trim().length > 0 : true

  function maskedKey(key: string): string {
    if (!key) return ''
    return key.slice(0, 8) + '•'.repeat(8)
  }

  function buildEntry(): SousChefProviderEntry {
    return {
      apiKey: apiKey.trim(),
      ...(provider.id === 'ollama' ? { baseUrl: baseUrl.trim() || 'http://localhost:11434' } : {}),
      ...(model ? { model } : {}),
    }
  }

  function handleMakeActive() {
    if (hasSavedKey && !editing) {
      onMakeActive()
    } else {
      onMakeActive(buildEntry())
      setEditing(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && canSave) handleMakeActive()
  }

  return (
    <div className={styles.configContent}>
      {/* Header */}
      <div className={styles.configHeader}>
        <Logo size={28} className={styles.configHeaderLogo} />
        <span className={styles.configHeaderName}>{provider.label}</span>
        {isActive && <span className={styles.activeBadge}>Active</span>}
      </div>

      {/* Saved key display */}
      {hasSavedKey && !editing && (
        <>
          <div className={styles.savedKeyRow}>
            <span className={styles.savedKeyMask}>
              {provider.id === 'ollama'
                ? `${entry.model || 'llama3.2'} · ${entry.baseUrl ?? 'http://localhost:11434'}`
                : maskedKey(entry.apiKey)}
            </span>
            <button className={styles.secondaryButton} onClick={() => setEditing(true)}>
              Edit
            </button>
            <button className={`${styles.secondaryButton} ${styles.removeButton}`} onClick={onRemove}>
              Remove
            </button>
          </div>
          {!isActive && (
            <div className={styles.actions}>
              <button className={styles.primaryButton} onClick={() => onMakeActive()}>
                Use this sous chef
              </button>
            </div>
          )}
        </>
      )}

      {/* Edit / new key form */}
      {(editing || !hasSavedKey) && (
        <div onKeyDown={handleKeyDown}>
          {provider.id === 'ollama' ? (
            <OllamaFields
              baseUrl={baseUrl}
              onBaseUrlChange={setBaseUrl}
              model={model}
              onModelChange={setModel}
              showHttpsWarning={IS_HTTPS}
            />
          ) : (
            <KeyFields
              provider={provider}
              apiKey={apiKey}
              onApiKeyChange={setApiKey}
              inputRef={inputRef}
            />
          )}

          <div className={styles.actions}>
            <button
              className={styles.primaryButton}
              onClick={handleMakeActive}
              disabled={!canSave}
            >
              {hasSavedKey ? 'Save and use' : 'Use this sous chef'}
            </button>
            {hasSavedKey && (
              <button className={styles.secondaryButton} onClick={() => { setEditing(false); setApiKey(entry.apiKey) }}>
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// --- Small helpers for the config panel ---

function KeyFields({
  provider,
  apiKey,
  onApiKeyChange,
  inputRef,
}: {
  provider: ProviderMeta
  apiKey: string
  onApiKeyChange: (v: string) => void
  inputRef: React.RefObject<HTMLInputElement | null>
}) {
  return (
    <>
      <p className={styles.explanation}>
        {provider.keyHint.replace(/^Get your key at /, '')}{' '}
        <a href={provider.keyLink} target="_blank" rel="noopener noreferrer" className={styles.keyLink}>
          {provider.keyLink.replace('https://', '')}
        </a>
      </p>
      <label className={styles.inputLabel} htmlFor="provider-key">API key</label>
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        id="provider-key"
        type="password"
        className={styles.keyInput}
        placeholder={provider.keyPlaceholder}
        value={apiKey}
        onChange={e => onApiKeyChange(e.target.value)}
        autoFocus
        autoComplete="off"
      />
      <p className={styles.securityNote}>
        Your key stays in this browser only — it is never sent to our servers.
      </p>
    </>
  )
}

interface OllamaModel {
  name: string
  size: number
}

function formatSize(bytes: number): string {
  const gb = bytes / 1e9
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / 1e6).toFixed(0)} MB`
}

function OllamaFields({
  baseUrl,
  onBaseUrlChange,
  model,
  onModelChange,
  showHttpsWarning,
}: {
  baseUrl: string
  onBaseUrlChange: (v: string) => void
  model: string
  onModelChange: (v: string) => void
  showHttpsWarning: boolean
}) {
  const [models, setModels] = useState<OllamaModel[]>([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsError, setModelsError] = useState<string | null>(null)

  // Fetch models when baseUrl changes (debounced slightly)
  useEffect(() => {
    const url = baseUrl.trim() || 'http://localhost:11434'
    let cancelled = false
    const timer = setTimeout(async () => {
      setModelsLoading(true)
      setModelsError(null)
      try {
        const res = await fetch(`${url}/api/tags`)
        if (!res.ok) throw new Error(`${res.status}`)
        const data = await res.json() as { models: { name: string; size: number }[] }
        if (cancelled) return
        const fetched = (data.models ?? []).map(m => ({ name: m.name, size: m.size }))
        setModels(fetched)
        // Auto-select the first model if none chosen yet
        if (!model && fetched.length > 0) {
          onModelChange(fetched[0].name)
        }
      } catch {
        if (cancelled) return
        setModels([])
        setModelsError('Could not reach Ollama')
      } finally {
        if (!cancelled) setModelsLoading(false)
      }
    }, 400)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [baseUrl]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {showHttpsWarning && (
        <div className={styles.httpsWarning}>
          Ollama only works when you run AICard locally (<code className={styles.code}>deno task dev</code>),
          not from the hosted version — browsers block requests from HTTPS pages to localhost.
        </div>
      )}

      <p className={styles.explanation}>Run a model on your own computer — completely free, no account needed.</p>

      <div className={styles.inputLabel}>Setup</div>
      <ol className={styles.ollamaSteps}>
        <li>
          Download and install Ollama from{' '}
          <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className={styles.keyLink}>
            ollama.com
          </a>
        </li>
        <li>
          Open a terminal and run: <code className={styles.code}>ollama pull llama3.2</code>
        </li>
        <li>
          Start Ollama if it's not already running: <code className={styles.code}>ollama serve</code>
        </li>
      </ol>

      {/* Model picker */}
      <label className={styles.inputLabel} htmlFor="ollama-model">Model</label>
      {modelsLoading ? (
        <div className={styles.modelStatus}>Checking for models...</div>
      ) : modelsError ? (
        <div className={styles.modelStatus}>
          {modelsError} — start Ollama and it will appear here.
        </div>
      ) : models.length === 0 ? (
        <div className={styles.modelStatus}>
          No models found. Run <code className={styles.code}>ollama pull llama3.2</code> to get started.
        </div>
      ) : (
        <div className={styles.modelGrid}>
          {models.map(m => (
            <button
              key={m.name}
              type="button"
              className={`${styles.modelOption} ${model === m.name ? styles.modelSelected : ''}`}
              onClick={() => onModelChange(m.name)}
            >
              <span className={styles.modelName}>{m.name.replace(/:latest$/, '')}</span>
              <span className={styles.modelSize}>{formatSize(m.size)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Base URL */}
      <label className={styles.inputLabel} htmlFor="ollama-url">Ollama address</label>
      <input
        id="ollama-url"
        type="text"
        className={styles.keyInput}
        value={baseUrl}
        onChange={e => onBaseUrlChange(e.target.value)}
        autoComplete="off"
      />
      <p className={styles.securityNote}>
        Default is <code className={styles.code}>http://localhost:11434</code>. Change only if you run Ollama on a different port.
      </p>

      <details className={styles.troubleshooting}>
        <summary className={styles.troubleshootingSummary}>Not working? Common fixes</summary>
        <ul className={styles.troubleshootingList}>
          <li>
            <strong>{"\"Can't reach Ollama\""}</strong> — Make sure Ollama is running.
            Open a terminal and run <code className={styles.code}>ollama serve</code>.
          </li>
          <li>
            <strong>{"\"Model not found\" (404)"}</strong> — The model needs to be downloaded first.
            Run <code className={styles.code}>ollama pull llama3.2</code> in your terminal.
          </li>
          <li>
            <strong>CORS error</strong> — Ollama needs permission to talk to your browser.
            Stop Ollama, then restart it with:{' '}
            <code className={styles.code}>OLLAMA_ORIGINS=* ollama serve</code>
          </li>
          <li>
            <strong>Still stuck?</strong> Check that <code className={styles.code}>ollama list</code> shows
            at least one model, and that you can
            reach <code className={styles.code}>http://localhost:11434</code> in your browser.
          </li>
        </ul>
      </details>
    </>
  )
}
