// Pure load/save/migrate/derive functions for sous chef provider storage.
// No React dependency — independently testable.

import type { SousChefConfig, SousChefSetup } from '../types.ts'
import { getProvider } from '../sous-chef/providers.ts'

const STORAGE_KEY = 'aicard:sous-chef-config'
const LEGACY_KEY = 'aicard:api-key'

export function loadSousChefSetup(): SousChefSetup {
  // 1. Check for legacy bare API key (oldest format)
  const legacy = localStorage.getItem(LEGACY_KEY)
  if (legacy) {
    const setup: SousChefSetup = {
      active: 'anthropic',
      providers: { anthropic: { apiKey: legacy.trim() } },
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(setup)) } catch { /* best-effort migration */ }
    try { localStorage.removeItem(LEGACY_KEY) } catch { /* best-effort cleanup */ }
    return setup
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return { active: null, providers: {} }

  try {
    const parsed = JSON.parse(stored)

    // 2. New shape — has a `providers` key
    if (parsed.providers && typeof parsed.providers === 'object') {
      return parsed as SousChefSetup
    }

    // 3. Old single-config shape — has `provider` at top level
    if (parsed.provider && typeof parsed.provider === 'string') {
      const old = parsed as SousChefConfig
      const setup: SousChefSetup = {
        active: old.provider,
        providers: { [old.provider]: { apiKey: old.apiKey, ...(old.baseUrl ? { baseUrl: old.baseUrl } : {}) } },
      }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(setup)) } catch { /* best-effort migration */ }
      return setup
    }
  } catch {
    // Corrupted JSON — start fresh
  }

  return { active: null, providers: {} }
}

export function saveSousChefSetup(setup: SousChefSetup): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(setup))
  } catch (e) {
    console.warn('Failed to save sous chef setup:', e)
  }
}

export function deriveActiveConfig(setup: SousChefSetup): SousChefConfig | null {
  if (!setup.active) return null
  const entry = setup.providers[setup.active]
  if (!entry) return null
  const provider = getProvider(setup.active)
  return {
    provider: setup.active,
    apiKey: entry.apiKey,
    baseUrl: provider.id === 'ollama'
      ? `${(entry.baseUrl ?? 'http://localhost:11434').replace(/\/v1\/?$/, '')}/v1`
      : entry.baseUrl,
    model: entry.model,
  }
}
