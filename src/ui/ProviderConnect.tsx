// ProviderConnect: two-step dialog for choosing and connecting an AI provider.
//
// Step 1 — Pick: grid of provider cards (emoji, name, cost note)
// Step 2 — Configure: provider-specific key input or Ollama setup instructions
//
// Follows the same overlay + dialog pattern as EquipmentConnect.

import { useState } from 'react'
import type { SousChefConfig, SousChefProviderId } from '../types.ts'
import { PROVIDERS } from '../sous-chef/providers.ts'
import styles from './ProviderConnect.module.css'

interface Props {
  onConnect: (config: SousChefConfig) => void
  onCancel: () => void
  currentConfig: SousChefConfig | null
}

// Detect whether the app is served over HTTPS (affects Ollama usability).
const IS_HTTPS = typeof location !== 'undefined' && location.protocol === 'https:'

export default function ProviderConnect({ onConnect, onCancel, currentConfig }: Props) {
  const [step, setStep] = useState<'pick' | 'configure'>('pick')
  const [selectedId, setSelectedId] = useState<SousChefProviderId | null>(
    currentConfig?.provider ?? null
  )
  const [apiKey, setApiKey] = useState(currentConfig?.apiKey ?? '')
  const [baseUrl, setBaseUrl] = useState(currentConfig?.baseUrl ?? 'http://localhost:11434')

  const selectedProvider = selectedId ? PROVIDERS.find(p => p.id === selectedId) : null

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onCancel()
    if (e.key === 'Enter' && step === 'configure' && canConnect) handleConnect()
  }

  function handleContinue() {
    if (!selectedId) return
    setApiKey(currentConfig?.provider === selectedId ? (currentConfig?.apiKey ?? '') : '')
    setStep('configure')
  }

  function handleConnect() {
    if (!selectedProvider) return
    const config: SousChefConfig = {
      provider: selectedProvider.id,
      apiKey: selectedProvider.keyRequired ? apiKey.trim() : '',
      ...(selectedProvider.id === 'ollama' ? { baseUrl: baseUrl.trim() || 'http://localhost:11434' } : {}),
    }
    onConnect(config)
  }

  const canConnect = selectedProvider
    ? (selectedProvider.keyRequired ? apiKey.trim().length > 0 : true)
    : false

  return (
    <div className={styles.overlay} onClick={onCancel} onKeyDown={handleKeyDown}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-label="Connect your sous chef"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        {step === 'pick' ? (
          <>
            <div className={styles.dialogHeader}>
              <h2 className={styles.dialogTitle}>Connect your sous chef</h2>
              <p className={styles.dialogSubtitle}>
                Choose which AI to use. Your key stays in this browser only.
              </p>
            </div>

            <div className={styles.providerGrid} role="radiogroup" aria-label="Choose a provider">
              {PROVIDERS.map(provider => (
                <button
                  key={provider.id}
                  className={`${styles.providerCard} ${selectedId === provider.id ? styles.providerCardSelected : ''}`}
                  onClick={() => setSelectedId(provider.id)}
                  aria-pressed={selectedId === provider.id}
                >
                  <span className={styles.providerEmoji} aria-hidden="true">{provider.emoji}</span>
                  <span className={styles.providerLabel}>{provider.label}</span>
                  <span className={styles.providerCost}>{provider.costNote}</span>
                </button>
              ))}
            </div>

            <div className={styles.actions}>
              <button className={styles.cancelButton} onClick={onCancel}>Cancel</button>
              <button
                className={styles.connectButton}
                onClick={handleContinue}
                disabled={!selectedId}
              >
                Continue →
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Configure step */}
            <div className={styles.equipmentHeader}>
              <div className={styles.equipmentIcon} aria-hidden="true">
                {selectedProvider?.emoji}
              </div>
              <h2 className={styles.equipmentName}>{selectedProvider?.label}</h2>
            </div>

            {selectedProvider?.id === 'ollama' ? (
              <OllamaSetup
                baseUrl={baseUrl}
                onBaseUrlChange={setBaseUrl}
                showHttpsWarning={IS_HTTPS}
              />
            ) : (
              <KeyedProviderSetup
                provider={selectedProvider!}
                apiKey={apiKey}
                onApiKeyChange={setApiKey}
              />
            )}

            <div className={styles.actions}>
              <button className={styles.cancelButton} onClick={() => setStep('pick')}>
                ← Back
              </button>
              <button
                className={styles.connectButton}
                onClick={handleConnect}
                disabled={!canConnect}
              >
                Connect
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// --- Sub-components ---

function KeyedProviderSetup({
  provider,
  apiKey,
  onApiKeyChange,
}: {
  provider: { keyHint: string; keyLink: string; keyPlaceholder: string }
  apiKey: string
  onApiKeyChange: (v: string) => void
}) {
  return (
    <div>
      <p className={styles.explanation}>
        {provider.keyHint.replace(/^Get your key at /, '')}{' '}
        <a
          href={provider.keyLink}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.keyLink}
        >
          {provider.keyLink.replace('https://', '')}
        </a>
      </p>
      <label className={styles.inputLabel} htmlFor="provider-key">API key</label>
      <input
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
    </div>
  )
}

function OllamaSetup({
  baseUrl,
  onBaseUrlChange,
  showHttpsWarning,
}: {
  baseUrl: string
  onBaseUrlChange: (v: string) => void
  showHttpsWarning: boolean
}) {
  return (
    <div>
      {showHttpsWarning && (
        <div className={styles.httpsWarning}>
          ⚠️ Ollama only works when you run AICard locally (<code>deno task dev</code>),
          not from the hosted version — browsers block requests from HTTPS pages to
          localhost.
        </div>
      )}

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
          Ollama runs in the background — no other setup needed.
        </li>
      </ol>

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
        Default is <code>http://localhost:11434</code>. Change only if you run Ollama on a different port.
      </p>
    </div>
  )
}
