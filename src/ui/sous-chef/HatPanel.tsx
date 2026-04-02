// HatPanel — the sous chef's glass panel with options menu, ask input, and answer display.

import type { HatOption } from '../../types.ts'
import MarkdownText from '../MarkdownText.tsx'
import styles from '../SousChef.module.css'

function LoadingDots() {
  return (
    <span className={styles.loadingDots}>
      <span className={styles.loadingDot} />
      <span className={styles.loadingDot} />
      <span className={styles.loadingDot} />
    </span>
  )
}

export default function HatPanel({
  panelRef,
  hatState,
  options,
  loadingOptions,
  question,
  onQuestionChange,
  answer,
  loadingAnswer,
  onSelectOption,
  onAsk,
  onBack,
}: {
  panelRef: React.RefObject<HTMLDivElement>
  hatState: 'options' | 'asking'
  options: HatOption[]
  loadingOptions: boolean
  question: string
  onQuestionChange: (v: string) => void
  answer: string
  loadingAnswer: boolean
  onSelectOption: (opt: HatOption) => void
  onAsk: () => void
  onBack: () => void
}) {
  return (
    <div
      ref={panelRef}
      className={styles.panel}
      role="dialog"
      aria-label="Sous Chef"
      aria-modal="false"
    >
      <div className={styles.panelHeader}>
        <svg className={styles.panelHeaderIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 6 C8 6 6 6.5 4.5 9 C3.5 11 5 14 5 14 L19 14 C19 14 20.5 11 19.5 9 C18 6.5 16 6 16 6 C15.5 4.2 13.9 3 12 3 C10.1 3 8.5 4.2 8 6 Z" />
          <rect x="5" y="14" width="14" height="3" rx="1" />
          <line x1="9" y1="17" x2="9" y2="20" />
          <line x1="15" y1="17" x2="15" y2="20" />
          <line x1="9" y1="20" x2="15" y2="20" />
        </svg>
        <span className={styles.panelHeaderTitle}>Sous Chef</span>
      </div>

      {/* Options */}
      {hatState === 'options' && (
        <div className={styles.optionsList} role="menu">
          {loadingOptions ? (
            <div className={styles.loading}>
              Thinking <LoadingDots />
            </div>
          ) : (
            options.map((opt, i) => (
              <button
                key={i}
                className={styles.option}
                onClick={() => onSelectOption(opt)}
                role="menuitem"
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}

      {/* Ask */}
      {hatState === 'asking' && (
        <div className={styles.askArea}>
          {!answer && !loadingAnswer && (
            <div className={styles.askInputRow}>
              <input
                type="text"
                className={styles.askInput}
                placeholder="Ask the sous chef…"
                value={question}
                onChange={e => onQuestionChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onAsk()}
                autoFocus
                aria-label="Ask the sous chef a question"
              />
              <button
                className={styles.askSendButton}
                onClick={onAsk}
                disabled={!question.trim() || loadingAnswer}
                aria-label="Send question"
              >
                ↑
              </button>
            </div>
          )}

          {loadingAnswer && (
            <div className={styles.loading}>
              Thinking <LoadingDots />
            </div>
          )}

          {answer && (
            <div className={styles.answerArea} aria-live="polite">
              {question && (
                <p className={styles.answerQuestion}>{question}</p>
              )}
              <MarkdownText text={answer} className={styles.markdown} />
              <button
                className={styles.backLink}
                onClick={onBack}
              >
                ← Back to options
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
