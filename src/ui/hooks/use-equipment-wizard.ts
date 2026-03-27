// Equipment wizard hook — manages the equipment connection dialog lifecycle.
// Tracks which equipment is being connected and handles wizard completion/progress.

import { useState } from 'react'
import type { Kitchen, Equipment } from '../../types.ts'
import { createEquipment } from '../../kitchen/equipment.ts'
import { upsertEquipment } from '../../kitchen/kitchen-state.ts'

interface UseEquipmentWizardOptions {
  kitchen: Kitchen
  persistKitchen: (updated: Kitchen) => void
}

export function useEquipmentWizard({ kitchen, persistKitchen }: UseEquipmentWizardOptions) {
  const [connectingEquipment, setConnectingEquipment] = useState<string | null>(null)

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
    // Clear pendingSetup on connect (wizard completed)
    const connected = { ...equipment, connected: true, config, mode, pendingSetup: undefined } as Equipment
    persistKitchen(upsertEquipment(kitchen, connected))
    setConnectingEquipment(null)
  }

  function handleSetupProgress(step: number, collectedConfig: Record<string, string>) {
    if (!connectingEquipment) return
    const existing = kitchen.equipment.find(
      e => e.name.toLowerCase() === connectingEquipment.toLowerCase()
    ) ?? createEquipment(connectingEquipment, connectingEquipment.toLowerCase())
    const updated = {
      ...existing,
      pendingSetup: { step, startedAt: existing.pendingSetup?.startedAt ?? new Date().toISOString(), collectedConfig },
    }
    persistKitchen(upsertEquipment(kitchen, updated))
  }

  function cancelWizard() {
    setConnectingEquipment(null)
  }

  return {
    connectingEquipment,
    handleConnectEquipment,
    handleEquipmentConnected,
    handleSetupProgress,
    cancelWizard,
  }
}
