import type { WizardFieldProps } from './field-catalog.ts'
import styles from './wizard.module.css'

export default function WizardTextField({ spec, value, onChange }: WizardFieldProps) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor={`wizard-${spec.key}`}>
        {spec.label}
      </label>
      <input
        id={`wizard-${spec.key}`}
        type="text"
        className={styles.textInput}
        placeholder={spec.placeholder ?? ''}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete="off"
      />
    </div>
  )
}
