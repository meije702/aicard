import type { WizardFieldProps } from './field-catalog.ts'
import styles from './wizard.module.css'

export default function WizardSelectField({ spec, value, onChange }: WizardFieldProps) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor={`wizard-${spec.key}`}>
        {spec.label}
      </label>
      <select
        id={`wizard-${spec.key}`}
        className={styles.selectInput}
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">{spec.placeholder ?? 'Select...'}</option>
        {spec.options?.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}
