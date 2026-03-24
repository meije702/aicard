import type { WizardFieldProps } from './field-catalog.ts'
import styles from './wizard.module.css'

export default function WizardConfirmField({ spec, value, onChange }: WizardFieldProps) {
  const confirmed = value === 'confirmed'

  return (
    <div className={styles.fieldGroup}>
      <button
        type="button"
        className={styles.confirmButton}
        onClick={() => onChange('confirmed')}
        disabled={confirmed}
      >
        {confirmed ? '✓ ' + spec.label : spec.label}
      </button>
    </div>
  )
}
