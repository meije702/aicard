// CardConfig: Level 2 — tweaking a card's settings.
// Opens inline within the step card. Feels like an iOS settings sheet:
// grouped table rows, label left, value right, hairline dividers.

import { useState } from 'react'
import type { CardStep } from '../types.ts'
import styles from './CardConfig.module.css'

interface Props {
  step: CardStep
  onSave: (config: Record<string, string>) => void
  onCancel: () => void
}

export default function CardConfig({ step, onSave, onCancel }: Props) {
  const [config, setConfig] = useState<Record<string, string>>({ ...step.config })

  function handleChange(key: string, value: string) {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className={styles.configSheet} role="region" aria-label="Edit step configuration">
      <p className={styles.configTitle}>Settings</p>

      <div className={styles.configFields}>
        {Object.entries(config).map(([key, value]) => (
          <label key={key} className={styles.configField}>
            <span className={styles.configLabel}>{key}</span>
            <input
              type="text"
              className={styles.configInput}
              value={value}
              onChange={e => handleChange(key, e.target.value)}
              aria-label={key}
            />
          </label>
        ))}
      </div>

      <div className={styles.configActions}>
        <button
          className={styles.cancelButton}
          onClick={onCancel}
          aria-label="Cancel editing"
        >
          Cancel
        </button>
        <button
          className={styles.saveButton}
          onClick={() => onSave(config)}
          aria-label="Save configuration changes"
        >
          Save
        </button>
      </div>
    </div>
  )
}
