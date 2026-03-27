// HouseStyleForm — textarea for the user's house style (tone, language, sign-off).
// Tracks dirty state locally and calls onSave only when the user explicitly saves.

import { useState, useRef } from 'react'
import styles from '../Kitchen.module.css'

interface Props {
  houseStyle: string | undefined
  onSave: (style: string) => void
}

export default function HouseStyleForm({ houseStyle, onSave }: Props) {
  const [draft, setDraft] = useState(houseStyle ?? '')
  const dirty = draft !== (houseStyle ?? '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  return (
    <section className={styles.sectionCard} aria-label="House style">
      <div className={styles.sectionLabel}>House Style</div>
      {!houseStyle && !dirty ? (
        <p className={styles.emptyState}>
          Tell your sous chef how you write — your tone, your language, how you sign off.
          This shapes every message your recipes compose.
        </p>
      ) : null}
      <textarea
        ref={textareaRef}
        className={styles.houseStyleTextarea}
        placeholder="e.g. I'm informal and warm. I use first names. I sign off with 'Warme groet, Maria'. Keep emails short."
        value={draft}
        onChange={e => setDraft(e.target.value)}
        rows={4}
      />
      {dirty && (
        <div className={styles.houseStyleActions}>
          <button
            className={styles.houseStyleSave}
            onClick={() => onSave(draft)}
          >
            Save
          </button>
          <button
            className={styles.houseStyleCancel}
            onClick={() => setDraft(houseStyle ?? '')}
          >
            Cancel
          </button>
        </div>
      )}
    </section>
  )
}
