// SousChefProviders — inline provider selection with logo row + expandable config.
//
// Decomposed into focused pieces (Single Responsibility):
//   SousChefProviders — thin orchestrator, owns expandedId/hoveredId state
//   ProviderLogo      — one 48×48 logo button with visual state
//   ProviderTooltip   — hover/focus info card
//   ProviderConfigPanel — expandable key input area (separate file)

import { useState } from 'react'
import type { SousChefProviderId, SousChefSetup, SousChefProviderEntry } from '../../types.ts'
import { PROVIDERS, type ProviderMeta } from '../../sous-chef/providers.ts'
import { getProviderLogo } from '../provider-logos.tsx'
import ProviderConfigPanel from './ProviderConfigPanel.tsx'
import styles from '../SousChefProviders.module.css'

interface Props {
  setup: SousChefSetup
  onSetupChange: (setup: SousChefSetup) => void
}

type ProviderState = 'active' | 'configured' | 'unconfigured'

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
