import type { WizardFieldProps } from './field-catalog.ts'
import styles from './wizard.module.css'

export default function WizardPasswordField({ spec, value, onChange }: WizardFieldProps) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor={`wizard-${spec.key}`}>
        {spec.label}
      </label>
      <input
        id={`wizard-${spec.key}`}
        type="password"
        className={styles.passwordInput}
        placeholder={spec.placeholder ?? ''}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete="off"
      />
      <p className={styles.securityNote}>
        Your key stays in this browser only — it is never sent to our servers.
      </p>
    </div>
  )
}
