// ProviderConfigPanel — expandable key input area with brand tint.

import { useState, useRef } from 'react'
import type { SousChefProviderEntry } from '../../types.ts'
import type { ProviderMeta } from '../../sous-chef/providers.ts'
import { getProviderLogo } from '../provider-logos.tsx'
import KeyInput from './KeyInput.tsx'
import OllamaSetup from './OllamaSetup.tsx'
import styles from '../SousChefProviders.module.css'

// Detect HTTPS — affects Ollama usability
const IS_HTTPS = typeof location !== 'undefined' && location.protocol === 'https:'

export default function ProviderConfigPanel({
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
            <OllamaSetup
              baseUrl={baseUrl}
              onBaseUrlChange={setBaseUrl}
              model={model}
              onModelChange={setModel}
              showHttpsWarning={IS_HTTPS}
            />
          ) : (
            <KeyInput
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
