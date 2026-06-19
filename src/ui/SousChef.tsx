// SousChef: the chef's hat and toast system.
// Two interaction surfaces:
//   1. The chef's hat — always visible, never pushy. Premium floating button.
//   2. The toast — a gentle tap on the shoulder for real problems.
// The panel uses glass morphism with spring animations.
//
// State management extracted to hooks:
//   use-toast-manager.ts — toast lifecycle
//   use-hat-menu.ts — hat state machine + sous chef API calls
// Render extracted to:
//   sous-chef/ToastContainer.tsx — toast rendering
//   sous-chef/HatPanel.tsx — glass panel with options/ask UI

import { useEffect, useRef } from 'react'
import type { Recipe, Kitchen as KitchenType, SousChefConfig } from '../types.ts'
import type { RunState } from '../runner/recipe-runner.ts'
import { checkRecipeReadiness } from '../runner/recipe-readiness.ts'
import { useToastManager } from './hooks/use-toast-manager.ts'
import { useHatMenu } from './hooks/use-hat-menu.ts'
import ToastContainer from './sous-chef/ToastContainer.tsx'
import HatPanel from './sous-chef/HatPanel.tsx'
import styles from './SousChef.module.css'

interface Props {
  sousChefConfig: SousChefConfig | null
  recipe: Recipe | null
  kitchen: KitchenType
  runState?: RunState | null
  onStartTour?: () => void
}

export default function SousChef({ sousChefConfig, recipe, kitchen, runState: externalRunState, onStartTour }: Props) {
  const { toasts, addToast, dismissToast } = useToastManager()
  const {
    hatState, options, loadingOptions,
    question, setQuestion, answer, loadingAnswer,
    handleOpenHat, handleSelectOption, handleAsk,
    closeHat, goBackToOptions,
  } = useHatMenu({
    sousChefConfig, recipe, kitchen,
    runState: externalRunState, onStartTour, addToast,
  })

  const panelRef = useRef<HTMLDivElement>(null)
  const hatButtonRef = useRef<HTMLButtonElement>(null)

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && hatState !== 'closed') {
        closeHat()
        hatButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [hatState, closeHat])

  // Focus the panel when it opens
  useEffect(() => {
    if (hatState !== 'closed' && panelRef.current) {
      const firstFocusable = panelRef.current.querySelector<HTMLElement>(
        'button, input, [tabindex]'
      )
      firstFocusable?.focus()
    }
  }, [hatState])

  // Proactively notify Maria when a recipe loads with missing equipment —
  // the sous chef taps her on the shoulder so she knows before hitting "Run".
  const prevRecipeNameRef = useRef<string | null>(null)
  useEffect(() => {
    if (!recipe) {
      prevRecipeNameRef.current = null
      return
    }
    if (recipe.name === prevRecipeNameRef.current) return
    prevRecipeNameRef.current = recipe.name

    const { blockers } = checkRecipeReadiness(recipe, kitchen)
    const equipmentBlockers = blockers.filter(b => b.kind === 'equipment')
    if (equipmentBlockers.length === 0) return

    const names = equipmentBlockers.map(b => b.label)
    const list = names.length === 1
      ? names[0]
      : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1]
    addToast(`This recipe needs ${list}. Connect it in Your Kitchen before running.`, 'info')
  // kitchen intentionally excluded — only fires once per recipe load, not on every equipment update
  }, [recipe])

  const isOpen = hatState !== 'closed'

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {isOpen && (
        <HatPanel
          panelRef={panelRef}
          hatState={hatState}
          options={options}
          loadingOptions={loadingOptions}
          question={question}
          onQuestionChange={setQuestion}
          answer={answer}
          loadingAnswer={loadingAnswer}
          onSelectOption={handleSelectOption}
          onAsk={handleAsk}
          onBack={goBackToOptions}
        />
      )}

      {/* Hat button */}
      <button type="button"
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
