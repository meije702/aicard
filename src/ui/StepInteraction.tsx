// StepInteraction: the inline form that appears inside a step card
// when a card executor asks Maria for input during execution.
//
// Two modes:
//   1. Input mode (Listen card) — editable fields Maria fills in
//   2. Review mode (Send Message card) — read-only fields showing
//      the composed message, with a confirmation button

import { useState } from 'react'
import type { StepInteraction as StepInteractionType } from '../cards/card-executor.ts'
import styles from './StepInteraction.module.css'

interface Props {
  interaction: StepInteractionType
  onSubmit: (values: Record<string, string>) => void
}

export default function StepInteraction({ interaction, onSubmit }: Props) {
  const allReadOnly = interaction.fields.every(f => f.readOnly)

  // Initialize field values from defaults
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const field of interaction.fields) {
      initial[field.key] = field.defaultValue ?? ''
    }
    return initial
  })

  function handleChange(key: string, value: string) {
    setValues(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(values)
  }

  // For input mode, require all fields to have values
  const editableFields = interaction.fields.filter(f => !f.readOnly)
  const canSubmit = allReadOnly || editableFields.every(f => values[f.key]?.trim())

  // Choose a button label based on the mode
  const hasLinkField = interaction.fields.some(f => f.type === 'link')
  const buttonLabel = hasLinkField ? 'Done' : (allReadOnly ? 'Confirmed' : 'Got one!')

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <p className={styles.prompt}>{interaction.prompt}</p>

      <div className={styles.fields}>
        {interaction.fields.map(field => (
          <div key={field.key} className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor={`interaction-${field.key}`}>
              {field.label}
            </label>
            {field.type === 'link' ? (
              // Link field: render as a native anchor so the browser treats it
              // as a user-initiated click (no popup blocker) — Finding 15 fix
              <a
                id={`interaction-${field.key}`}
                href={field.defaultValue}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.fieldLink}
              >
                {field.label}
              </a>
            ) : field.readOnly ? (
              // Read-only: use a textarea for long content, input for short
              field.key === 'message' ? (
                <textarea
                  id={`interaction-${field.key}`}
                  className={styles.fieldDisplay}
                  value={values[field.key]}
                  readOnly
                  rows={3}
                />
              ) : (
                <input
                  id={`interaction-${field.key}`}
                  type="text"
                  className={`${styles.fieldInput} ${styles.fieldInputReadOnly}`}
                  value={values[field.key]}
                  readOnly
                />
              )
            ) : (
              <input
                id={`interaction-${field.key}`}
                type="text"
                className={styles.fieldInput}
                placeholder={field.placeholder ?? ''}
                value={values[field.key]}
                onChange={e => handleChange(field.key, e.target.value)}
                autoFocus={interaction.fields.indexOf(field) === 0}
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={!canSubmit}
      >
        {buttonLabel}
      </button>
    </form>
  )
}
