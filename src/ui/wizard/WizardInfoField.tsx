import type { WizardFieldProps } from './field-catalog.ts'
import styles from './wizard.module.css'

export default function WizardInfoField({ spec }: WizardFieldProps) {
  return (
    <div className={styles.fieldGroup}>
      <div className={styles.infoPanel}>
        {spec.defaultValue ?? spec.label}
      </div>
    </div>
  )
}
