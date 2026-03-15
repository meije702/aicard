// SousChef: the chef's hat and toast system.
// Two interaction surfaces:
//   1. The chef's hat — always visible, never pushy. Premium floating button.
//   2. The toast — a gentle tap on the shoulder for real problems.
// The panel uses glass morphism with spring animations.

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Recipe, Kitchen as KitchenType } from '../types.ts'
import type { RunState } from '../runner/recipe-runner.ts'
import { createSousChef } from '../sous-chef/sous-chef.ts'
import styles from './SousChef.module.css'

interface Props {
  apiKey: string
  recipe: Recipe | null
  kitchen: KitchenType
  runState?: RunState | null
}

type HatState = 'closed' | 'options' | 'asking'

interface Toast {
  id: number
  message: string
  type: 'info' | 'warning' | 'error'
  exiting?: boolean
}

let toastCounter = 0

function LoadingDots() {
  return (
    <span className={styles.loadingDots}>
      <span className={styles.loadingDot} />
      <span className={styles.loadingDot} />
      <span className={styles.loadingDot} />
    </span>
  )
}

export default function SousChef({ apiKey, recipe, kitchen, runState: externalRunState }: Props) {
  const [hatState, setHatState] = useState<HatState>('closed')
  const [options, setOptions] = useState<string[]>([])
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loadingAnswer, setLoadingAnswer] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const panelRef = useRef<HTMLDivElement>(null)
  const hatButtonRef = useRef<HTMLButtonElement>(null)

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && hatState !== 'closed') {
        setHatState('closed')
        setAnswer('')
        setQuestion('')
        hatButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [hatState])

  // Focus the panel when it opens
  useEffect(() => {
    if (hatState !== 'closed' && panelRef.current) {
      const firstFocusable = panelRef.current.querySelector<HTMLElement>(
        'button, input, [tabindex]'
      )
      firstFocusable?.focus()
    }
  }, [hatState])

  async function handleOpenHat() {
    if (hatState !== 'closed') {
      setHatState('closed')
      setAnswer('')
      setQuestion('')
      return
    }

    if (!apiKey) {
      setOptions(['Add an Anthropic API key in your kitchen to use the sous chef'])
      setHatState('options')
      return
    }

    setHatState('options')
    setLoadingOptions(true)

    try {
      const sousChef = createSousChef(apiKey)
      // Pass the current step name from run state so the sous chef can give
      // contextual suggestions (e.g., "Your Shopify connection is missing")
      const currentStep = externalRunState?.steps.find(s => s.status === 'running')
        ?? externalRunState?.steps.find(s => s.status === 'failed')
      const opts = await sousChef.getHatOptions(recipe, currentStep?.name ?? null, kitchen)
      setOptions(opts)
    } catch {
      setOptions([
        'Check if my kitchen is ready',
        'What does this recipe do?',
        'I want to ask something else',
      ])
    } finally {
      setLoadingOptions(false)
    }
  }

  async function handleSelectOption(option: string) {
    if (option.toLowerCase().includes('ask something else') ||
        option.toLowerCase().includes('ask anything')) {
      setHatState('asking')
      return
    }
    setHatState('asking')
    setQuestion(option)
    await handleAsk(option)
  }

  const handleAsk = useCallback(async (q: string = question) => {
    if (!q.trim() || !apiKey) return
    setLoadingAnswer(true)
    setAnswer('')

    try {
      const sousChef = createSousChef(apiKey)
      const response = await sousChef.ask(q, recipe, kitchen)
      setAnswer(response)
    } catch {
      setAnswer("I couldn't reach the sous chef right now. Check your API key and try again.")
    } finally {
      setLoadingAnswer(false)
    }
  }, [apiKey, kitchen, question, recipe])

  function addToast(message: string, type: Toast['type'] = 'info') {
    const id = ++toastCounter
    setToasts(prev => [...prev, { id, message, type }])
    // Start exit animation, then remove
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
    }, 5500)
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 6000)
  }

  // Expose addToast for the recipe runner
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__aicard_toast = addToast
  }, [])

  function toastClass(toast: Toast): string {
    const classes = [styles.toast]
    if (toast.type === 'info') classes.push(styles.toastInfo)
    if (toast.type === 'warning') classes.push(styles.toastWarning)
    if (toast.type === 'error') classes.push(styles.toastError)
    if (toast.exiting) classes.push(styles.toastExiting)
    return classes.join(' ')
  }

  const isOpen = hatState !== 'closed'

  return (
    <>
      {/* Toasts */}
      <div className={styles.toastContainer} aria-live="polite">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={toastClass(toast)}
            role={toast.type === 'error' ? 'alert' : 'status'}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Glass panel */}
      {isOpen && (
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
                    onClick={() => handleSelectOption(opt)}
                    role="menuitem"
                  >
                    {opt}
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
                    onChange={e => setQuestion(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAsk()}
                    autoFocus
                    aria-label="Ask the sous chef a question"
                  />
                  <button
                    className={styles.askSendButton}
                    onClick={() => handleAsk()}
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
                  <p className={styles.answerText}>{answer}</p>
                  <button
                    className={styles.backLink}
                    onClick={() => { setAnswer(''); setQuestion(''); setHatState('options') }}
                  >
                    ← Back to options
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Hat button */}
      <button
        ref={hatButtonRef}
        className={`${styles.hatButton} ${isOpen ? styles.hatButtonOpen : ''}`}
        onClick={handleOpenHat}
        aria-label={isOpen ? 'Close Sous Chef' : 'Open Sous Chef'}
        aria-expanded={isOpen}
      >
        {!isOpen && <span className={styles.hatRing} aria-hidden="true" />}
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {/* Chef's hat: dome, brim, and toque band */}
            <path d="M8 6 C8 6 6 6.5 4.5 9 C3.5 11 5 14 5 14 L19 14 C19 14 20.5 11 19.5 9 C18 6.5 16 6 16 6 C15.5 4.2 13.9 3 12 3 C10.1 3 8.5 4.2 8 6 Z" />
            <rect x="5" y="14" width="14" height="3" rx="1" />
            <line x1="9" y1="17" x2="9" y2="20" />
            <line x1="15" y1="17" x2="15" y2="20" />
            <line x1="9" y1="20" x2="15" y2="20" />
          </svg>
        )}
      </button>
    </>
  )
}
