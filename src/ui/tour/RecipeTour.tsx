// RecipeTour: the in-page spotlight walkthrough.
// Manages tour state, loads content (from sous chef or fallback),
// positions popovers on real UI elements, and handles navigation.

import { useState, useEffect, useCallback } from 'react'
import type { Recipe, Kitchen as KitchenType, SousChefConfig, TourStop } from '../../types.ts'
import { createSousChef } from '../../sous-chef/sous-chef.ts'
import { buildTourStopList, buildFallbackTourStops } from '../../sous-chef/tour-prompts.ts'
import { useTourPosition } from './use-tour-position.ts'
import TourOverlay from './TourOverlay.tsx'
import TourPopover from './TourPopover.tsx'

interface Props {
  recipe: Recipe
  kitchen: KitchenType
  sousChefConfig: SousChefConfig | null
  onClose: () => void
}

export default function RecipeTour({ recipe, kitchen, sousChefConfig, onClose }: Props) {
  const stopList = buildTourStopList(recipe)
  const totalStops = stopList.length
  const fallbackStops = buildFallbackTourStops(recipe, kitchen)

  const [currentStop, setCurrentStop] = useState(0)
  const [cachedStops, setCachedStops] = useState<Record<number, TourStop>>({})
  const [loading, setLoading] = useState(false)

  // Current stop's target selector
  const targetSelector = stopList[currentStop]?.targetSelector ?? ''
  const position = useTourPosition(targetSelector)

  // Current content (cached or fallback)
  const currentContent = cachedStops[currentStop] ?? fallbackStops[currentStop]

  // Load stop content from sous chef
  const loadStop = useCallback(async (index: number) => {
    if (cachedStops[index]) return  // already cached
    if (!sousChefConfig) return     // use fallback

    setLoading(true)
    try {
      const sousChef = createSousChef(sousChefConfig)
      const stop = await sousChef.generateTourStop(recipe, kitchen, index)
      setCachedStops(prev => ({ ...prev, [index]: stop }))
    } catch {
      // Fallback content is already available — no action needed
    } finally {
      setLoading(false)
    }
  }, [sousChefConfig, recipe, kitchen, cachedStops])

  // Load current stop on mount and navigation
  useEffect(() => {
    loadStop(currentStop)
  }, [currentStop]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && currentStop < totalStops - 1) setCurrentStop(c => c + 1)
      if (e.key === 'ArrowLeft' && currentStop > 0) setCurrentStop(c => c - 1)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentStop, totalStops, onClose])

  if (!currentContent) return null

  return (
    <>
      <TourOverlay targetRect={position.targetRect} onClose={onClose} />
      {position.found && (
        <TourPopover
          title={currentContent.title}
          body={currentContent.body}
          top={position.top}
          left={position.left}
          arrowDirection={position.arrowDirection}
          currentStop={currentStop}
          totalStops={totalStops}
          loading={loading && !cachedStops[currentStop]}
          onBack={() => setCurrentStop(c => Math.max(0, c - 1))}
          onNext={() => setCurrentStop(c => Math.min(totalStops - 1, c + 1))}
          onClose={onClose}
        />
      )}
    </>
  )
}
