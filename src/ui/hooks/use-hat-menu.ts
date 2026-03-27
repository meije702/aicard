// Hat menu hook — manages the sous chef hat state machine.
// States: closed → options (fetching hat options) → asking (free-form Q&A).

import { useState, useCallback } from 'react'
import type { Recipe, Kitchen, SousChefConfig, HatOption } from '../../types.ts'
import type { RunState } from '../../runner/recipe-runner.ts'
import { createSousChef } from '../../sous-chef/sous-chef.ts'
import { getProvider } from '../../sous-chef/providers.ts'

export type HatState = 'closed' | 'options' | 'asking'

type ErrorSeverity = 'blocking' | 'transient'

interface SousChefError {
  message: string
  severity: ErrorSeverity
}

// Map API errors to Maria-friendly messages.
// "blocking" errors need a toast — they won't resolve without user action.
// "transient" errors can live in the panel — retrying may fix them.
export function sousChefError(err: unknown, config: SousChefConfig | null): SousChefError {
  const msg = err instanceof Error ? err.message : String(err)
  const status = (err as Record<string, unknown>)?.status as number | undefined
  const providerLabel = config ? getProvider(config.provider).label : 'your AI provider'
  const keyLink = config ? getProvider(config.provider).keyLink : ''

  if (msg.toLowerCase().includes('credit balance') || msg.toLowerCase().includes('billing')) {
    return { severity: 'blocking', message: `Your ${providerLabel} account has no credits. Add some at ${keyLink.replace('https://', '')} to continue.` }
  }
  if (status === 401 || msg.includes('401')) {
    return { severity: 'blocking', message: `Your ${providerLabel} API key doesn't look right. Change your key in Your Kitchen.` }
  }
  if (status === 403 || msg.includes('403')) {
    return { severity: 'blocking', message: `Your ${providerLabel} key doesn't have permission to use this model. Check your plan.` }
  }
  if (status === 404 || msg.includes('404') || msg.toLowerCase().includes('not found')) {
    if (config?.provider === 'ollama') {
      const modelName = config.model ?? 'llama3.2'
      return { severity: 'blocking', message: `Ollama can't find that model. Run "ollama pull ${modelName}" in your terminal, then try again.` }
    }
    return { severity: 'blocking', message: `The sous chef model isn't available on your ${providerLabel} account. Check your plan.` }
  }
  if (status === 429 || msg.includes('429') || msg.includes('rate')) {
    return { severity: 'transient', message: "The sous chef is a bit busy right now. Wait a moment and try again." }
  }
  if (msg.includes('fetch') || msg.includes('network') || msg.toLowerCase().includes('failed to fetch')) {
    if (config?.provider === 'ollama') {
      return { severity: 'blocking', message: "Can't reach Ollama — make sure it's running. Open a terminal and run \"ollama serve\", then try again." }
    }
    return { severity: 'transient', message: "Can't reach the sous chef — check your internet connection and try again." }
  }
  return { severity: 'transient', message: `I couldn't reach the sous chef. Error: ${msg}` }
}

interface UseHatMenuOptions {
  sousChefConfig: SousChefConfig | null
  recipe: Recipe | null
  kitchen: Kitchen
  runState?: RunState | null
  onStartTour?: () => void
  addToast: (message: string, type: 'info' | 'warning' | 'error') => void
}

export function useHatMenu({
  sousChefConfig,
  recipe,
  kitchen,
  runState,
  onStartTour,
  addToast,
}: UseHatMenuOptions) {
  const [hatState, setHatState] = useState<HatState>('closed')
  const [options, setOptions] = useState<HatOption[]>([])
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loadingAnswer, setLoadingAnswer] = useState(false)

  async function handleOpenHat() {
    if (hatState !== 'closed') {
      setHatState('closed')
      setAnswer('')
      setQuestion('')
      return
    }

    if (!sousChefConfig) {
      setOptions([{ label: 'Connect a sous chef in Your Kitchen to get help here' }])
      setHatState('options')
      return
    }

    setHatState('options')
    setLoadingOptions(true)

    try {
      const sousChef = createSousChef(sousChefConfig)
      const currentStep = runState?.steps.find(s => s.status === 'running')
        ?? runState?.steps.find(s => s.status === 'failed')
      const opts = await sousChef.getHatOptions(recipe, currentStep?.name ?? null, kitchen)
      setOptions(opts)
    } catch (err) {
      console.error('[sous chef] getHatOptions failed:', err)
      const { message, severity } = sousChefError(err, sousChefConfig)
      if (severity === 'blocking') {
        addToast(message, 'error')
        setHatState('closed')
      } else {
        const fallbackOptions: HatOption[] = [
          { label: 'Check if my kitchen is ready' },
        ]
        if (recipe) {
          fallbackOptions.push({ label: 'Walk me through this recipe', action: 'tour' })
        }
        fallbackOptions.push({ label: 'I want to ask something else', action: 'ask-anything' })
        setOptions(fallbackOptions)
      }
    } finally {
      setLoadingOptions(false)
    }
  }

  async function handleSelectOption(option: HatOption) {
    if (option.action === 'ask-anything') {
      setHatState('asking')
      return
    }
    if (option.action === 'tour' && recipe && onStartTour) {
      setHatState('closed')
      setAnswer('')
      setQuestion('')
      onStartTour()
      return
    }
    setHatState('asking')
    setQuestion(option.label)
    await handleAsk(option.label)
  }

  const handleAsk = useCallback(async (q: string = question) => {
    if (!q.trim() || !sousChefConfig) return
    setLoadingAnswer(true)
    setAnswer('')

    try {
      const sousChef = createSousChef(sousChefConfig)
      const response = await sousChef.ask(q, recipe, kitchen)
      setAnswer(response)
    } catch (err) {
      console.error('[sous chef] ask failed:', err)
      const { message, severity } = sousChefError(err, sousChefConfig)
      if (severity === 'blocking') {
        addToast(message, 'error')
        setHatState('closed')
      } else {
        setAnswer(message)
      }
    } finally {
      setLoadingAnswer(false)
    }
  }, [sousChefConfig, kitchen, question, recipe, addToast])

  function closeHat() {
    setHatState('closed')
    setAnswer('')
    setQuestion('')
  }

  function goBackToOptions() {
    setAnswer('')
    setQuestion('')
    setHatState('options')
  }

  return {
    hatState,
    options,
    loadingOptions,
    question,
    setQuestion,
    answer,
    loadingAnswer,
    handleOpenHat,
    handleSelectOption,
    handleAsk,
    closeHat,
    goBackToOptions,
  }
}
