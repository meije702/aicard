// EquipmentWizard: the sous chef-guided equipment setup experience.
// Replaces EquipmentConnect with a step-by-step wizard for known equipment,
// or falls back to the simple single-screen dialog for unknown equipment.

import { useState, useEffect, useCallback } from 'react'
import type { EquipmentDefinition, SousChefConfig, WizardStepResponse } from '../../types.ts'
import { createSousChef } from '../../sous-chef/sous-chef.ts'
import { buildFallbackStepResponse } from '../../sous-chef/equipment-prompts.ts'
import WizardStepRenderer from './WizardStepRenderer.tsx'
import styles from './EquipmentWizard.module.css'

interface Props {
  equipmentName: string
  equipmentDefinition: EquipmentDefinition | null
  sousChefConfig: SousChefConfig | null
  onConnect: (config: Record<string, string>) => void
  onCancel: () => void
  pendingSetup?: { step: number; collectedConfig: Record<string, string> }
  onSetupProgress?: (step: number, collectedConfig: Record<string, string>) => void
}

type WizardState = 'loading' | 'active' | 'fallback'

function equipmentIcon(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('shopify') || n.includes('shop')) return '\uD83D\uDECD'
  if (n.includes('gmail') || n.includes('email') || n.includes('mail')) return '\u2709\uFE0F'
  if (n.includes('discord')) return '\uD83D\uDCAC'
  if (n.includes('slack')) return '\uD83D\uDCAC'
  if (n.includes('calendar')) return '\uD83D\uDCC5'
  return '\uD83D\uDD0C'
}

export default function EquipmentWizard({
  equipmentName, equipmentDefinition, sousChefConfig,
  onConnect, onCancel, pendingSetup, onSetupProgress,
}: Props) {
  // Determine initial state
  const hasDef = equipmentDefinition !== null && equipmentDefinition.steps.length > 0
  const initialStep = pendingSetup?.step ?? 1
  const initialConfig = pendingSetup?.collectedConfig ?? {}

  const [wizardState, setWizardState] = useState<WizardState>(hasDef ? 'loading' : 'fallback')
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [collectedConfig, setCollectedConfig] = useState<Record<string, string>>(initialConfig)
  const [stepResponse, setStepResponse] = useState<WizardStepResponse | null>(null)

  // Fallback state (for unknown equipment)
  const [fallbackKey, setFallbackKey] = useState('')

  const totalSteps = equipmentDefinition?.steps.length ?? 0

  // Load the current step from the sous chef (or use fallback)
  const loadStep = useCallback(async (stepNum: number, config: Record<string, string>) => {
    if (!equipmentDefinition) return

    setWizardState('loading')

    // Try sous chef first, fall back to .equipment.md content
    if (sousChefConfig) {
      try {
        const sousChef = createSousChef(sousChefConfig)
        const response = await sousChef.guideEquipmentStep(equipmentDefinition, stepNum, config)
        setStepResponse(response)
        setWizardState('active')
        return
      } catch {
        // Sous chef failed — use fallback
      }
    }

    // Fallback: build from .equipment.md directly
    const fallback = buildFallbackStepResponse(equipmentDefinition, stepNum)
    setStepResponse(fallback)
    setWizardState('active')
  }, [equipmentDefinition, sousChefConfig])

  // Load the first step on mount
  useEffect(() => {
    if (hasDef) {
      loadStep(currentStep, collectedConfig)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleStepComplete(values: Record<string, string>) {
    const merged = { ...collectedConfig, ...values }
    setCollectedConfig(merged)

    if (currentStep >= totalSteps) {
      // Final step — connect the equipment
      onConnect(merged)
    } else {
      // Advance to next step
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      onSetupProgress?.(nextStep, merged)
      loadStep(nextStep, merged)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onCancel()
  }

  // --- Fallback mode (unknown equipment) ---
  if (wizardState === 'fallback') {
    // Determine if this is a compose-mode equipment
    const isCompose = equipmentDefinition?.mode === 'compose' ||
      equipmentName.toLowerCase().includes('gmail') ||
      equipmentName.toLowerCase().includes('email') ||
      equipmentName.toLowerCase().includes('mail')

    return (
      <div className={styles.overlay} onClick={onCancel} onKeyDown={handleKeyDown}>
        <div
          className={styles.dialog}
          role="dialog"
          aria-label={`Connect ${equipmentName}`}
          aria-modal="true"
          onClick={e => e.stopPropagation()}
        >
          <div className={styles.header}>
            <div className={styles.icon} aria-hidden="true">{equipmentIcon(equipmentName)}</div>
            <h2 className={styles.title}>Connect {equipmentName}</h2>
          </div>

          {isCompose ? (
            <>
              <div className={styles.composeInfo}>
                No setup needed. {equipmentName} will work in compose mode — AICard prepares your
                messages and you send them yourself.
              </div>
              <div className={styles.fallbackActions}>
                <button className={styles.cancelButton} onClick={onCancel}>Cancel</button>
                <button className={styles.connectButton} onClick={() => onConnect({ mode: 'compose' })}>
                  Got it
                </button>
              </div>
            </>
          ) : (
            <>
              <p className={styles.fallbackExplanation}>
                To connect {equipmentName}, you'll need an access key or token from that service.
                Check the service's settings or developer section to find it.
              </p>
              <label className={styles.inputLabel} htmlFor="fallback-key">Access key</label>
              <input
                id="fallback-key"
                type="password"
                className={styles.fallbackInput}
                placeholder="Paste your access key here"
                value={fallbackKey}
                onChange={e => setFallbackKey(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && fallbackKey.trim()) onConnect({ apiKey: fallbackKey.trim() })
                }}
                autoFocus
                autoComplete="off"
              />
              <p className={styles.securityNote}>
                Your key stays in this browser only — it is never sent to our servers.
              </p>
              <div className={styles.fallbackActions}>
                <button className={styles.cancelButton} onClick={onCancel}>Cancel</button>
                <button
                  className={styles.connectButton}
                  onClick={() => onConnect({ apiKey: fallbackKey.trim() })}
                  disabled={!fallbackKey.trim()}
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

  // --- Wizard mode ---
  return (
    <div className={styles.overlay} onClick={onCancel} onKeyDown={handleKeyDown}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-label={`Connect ${equipmentName}`}
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.icon} aria-hidden="true">{equipmentIcon(equipmentName)}</div>
          <h2 className={styles.title}>Connect {equipmentName}</h2>
        </div>

        {/* Progress dots */}
        {totalSteps > 1 && (
          <div className={styles.progress}>
            {Array.from({ length: totalSteps }, (_, i) => {
              const stepNum = i + 1
              let dotClass = styles.progressDot
              if (stepNum < currentStep) dotClass += ' ' + styles.progressDotComplete
              else if (stepNum === currentStep) dotClass += ' ' + styles.progressDotActive
              return <div key={stepNum} className={dotClass} />
            })}
            <span className={styles.progressLabel}>
              Step {currentStep} of {totalSteps}
            </span>
          </div>
        )}

        {/* Step content */}
        {wizardState === 'loading' && (
          <div className={styles.loading}>
            Preparing step<span className={styles.loadingDots} />
          </div>
        )}

        {wizardState === 'active' && stepResponse && (
          <WizardStepRenderer
            step={stepResponse}
            configFields={equipmentDefinition?.configFields ?? []}
            onComplete={handleStepComplete}
            isLastStep={currentStep >= totalSteps}
          />
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
