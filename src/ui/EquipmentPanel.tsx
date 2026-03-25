// Equipment readiness panel: shows which equipment is connected/needed.
import type { Kitchen as KitchenType } from '../types.ts'
import { equipmentIcon } from './equipment-icon.ts'
import styles from './RecipeView.module.css'

interface Props {
  equipmentNames: string[]
  kitchen: KitchenType
  onConnectEquipment: (name: string) => void
}

export default function EquipmentPanel({ equipmentNames, kitchen, onConnectEquipment }: Props) {
  if (equipmentNames.length === 0) return null

  return (
    <div className={styles.equipmentCard}>
      <div className={styles.sectionLabel}>Equipment</div>
      {equipmentNames.map(name => {
        const equip = kitchen.equipment.find(
          e => e.name.toLowerCase() === name.toLowerCase() && e.connected
        )
        const connected = !!equip
        const isHandoff = equip?.mode === 'handoff'
        return (
          <div key={name} className={styles.equipmentRow}>
            <div className={styles.equipmentIcon} aria-hidden="true">
              {equipmentIcon(name)}
            </div>
            <span className={styles.equipmentName}>{name}</span>
            {connected ? (
              <span className={isHandoff ? styles.equipmentHandoff : styles.equipmentConnected}>
                <span className={isHandoff ? styles.statusDotHandoff : styles.statusDot} aria-hidden="true" />
                {isHandoff ? 'Ready — sends via you' : 'Connected'}
              </span>
            ) : (
              <button
                className={styles.connectButton}
                onClick={() => onConnectEquipment(name)}
              >
                Connect
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
