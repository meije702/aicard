// WizardStepRenderer: renders one wizard step from a WizardStepResponse.
// Manages field values, validates, and calls onComplete when the user advances.
// Does not know about steps, progress, or the sous chef — SRP.

import { useState } from 'react'
import type { WizardStepResponse, EquipmentConfigField } from '../../types.ts'
import { getFieldComponent } from './field-catalog.ts'
import styles from './wizard.module.css'

// Strip basic markdown formatting for plain text display
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')   // **bold**
    .replace(/`(.+?)`/g, '$1')          // `code`
    .replace(/\*(.+?)\*/g, '$1')        // *italic*
}

interface Props {
  step: WizardStepResponse
  configFields: EquipmentConfigField[]   // for validation rules
  onComplete: (values: Record<string, string>) => void
  isLastStep?: boolean
}

// Run a simple validation rule against a value.
// Currently supports: "starts-with <prefix>"
function runValidation(value: string, rule: string): string | null {
  const startsWithMatch = rule.match(/^starts-with\s+(.+)$/)
  if (startsWithMatch) {
    const prefix = startsWithMatch[1]
    if (!value.startsWith(prefix)) {
      return `Must start with "${prefix}"`
    }
  }
  return null
}

export default function WizardStepRenderer({ step, configFields, onComplete, isLastStep }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const field of step.fields) {
      initial[field.key] = field.defaultValue ?? ''
    }
    return initial
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  function handleChange(key: string, value: string) {
    setValues(prev => ({ ...prev, [key]: value }))
    // Clear validation error on change
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  function validate(): boolean {
    const errors: Record<string, string> = {}

    for (const field of step.fields) {
      const value = values[field.key] ?? ''

      // Required check
      if (field.required && !value.trim()) {
        errors[field.key] = 'This field is required.'
        continue
      }

      // Validation rules from equipment config fields
      if (value.trim()) {
        const configField = configFields.find(
          cf => cf.name.toLowerCase().replace(/\s+/g, '_') === field.key || cf.name === field.label
        )
        if (configField?.validate) {
          const error = runValidation(value, configField.validate)
          if (error) errors[field.key] = error
        }
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  function handleNext() {
    if (!validate()) return
    // Only include fields that have values (skip info/empty fields)
    const collected: Record<string, string> = {}
    for (const field of step.fields) {
      const value = values[field.key]
      if (value && field.type !== 'info') {
        collected[field.key] = value
      }
    }
    onComplete(collected)
  }

  // Can advance if: no required fields are empty
  const editableFields = step.fields.filter(f => f.type !== 'info')
  const hasRequiredEmpty = editableFields.some(
    f => f.required && !(values[f.key] ?? '').trim()
  )
  const canNext = step.canAdvance && !hasRequiredEmpty

  return (
    <div>
      <p className={styles.stepInstruction}>{stripMarkdown(step.instruction)}</p>

      {step.fields.length > 0 && (
        <div className={styles.stepFields}>
          {step.fields.map((field, idx) => {
            const Component = getFieldComponent(field.type)
            if (!Component) return null
            return (
              <div key={field.key}>
                <Component
                  spec={{ ...field, ...(idx === 0 ? {} : {}) }}
                  value={values[field.key] ?? ''}
                  onChange={(v) => handleChange(field.key, v)}
                />
                {validationErrors[field.key] && (
                  <p className={styles.validationError}>{validationErrors[field.key]}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className={styles.stepActions}>
        <button
          className={styles.nextButton}
          onClick={handleNext}
          disabled={!canNext}
        >
          {isLastStep ? 'Connect' : 'Next'}
        </button>
      </div>
    </div>
  )
}
