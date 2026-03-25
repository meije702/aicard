// Pre-flight checks for recipe execution.
// Extracted from recipe-runner.ts to honour the Single Responsibility Principle:
// the runner orchestrates steps; this module decides whether a recipe is ready to run.

import type { Recipe, Kitchen } from '../types.ts'
import type { ReadinessBlocker } from './recipe-runner.ts'
import { defaultExecutors, type ExecutorRegistry } from './recipe-runner.ts'

// Higher-level readiness check: delegates equipment checking to checkKitchenReadiness
// in equipment.ts but also checks card-type availability (Layer 2) and executor-
// specific equipment needs (Layer 3).
//
// Check whether the kitchen is ready to run a recipe.
// Three layers of checking:
//   1. Recipe-level: the ## Kitchen section lists equipment by name
//   2. Pantry-level: each card type must exist in the executors registry
//   3. Card-level: each card executor's checkEquipment() may flag its own needs
// All must pass. Returns typed blockers so the UI can render each kind
// with the right message — "Connect X" for equipment, not for card types.
export function checkRecipeReadiness(
    recipe: Recipe,
    kitchen: Kitchen,
    executors: ExecutorRegistry = defaultExecutors
): { ready: boolean; blockers: ReadinessBlocker[] } {
    const blockers: ReadinessBlocker[] = []

    function hasBlocker(kind: ReadinessBlocker['kind'], label: string): boolean {
        return blockers.some(b => b.kind === kind && b.label === label)
    }

    // Layer 1: check that the equipment listed in the recipe's Kitchen section is connected
    for (const equipmentName of recipe.kitchen) {
        const found = kitchen.equipment.find(
            e => e.name.toLowerCase() === equipmentName.toLowerCase() && e.connected
        )
        if (!found && !hasBlocker('equipment', equipmentName)) {
            blockers.push({ kind: 'equipment', label: equipmentName })
        }
    }

    // Layer 2: check that all card types exist in the pantry
    for (const step of recipe.steps) {
        if (!('card' in step)) continue
        const executor = executors[step.card]
        if (!executor) {
            if (!hasBlocker('card-type', step.card)) {
                blockers.push({ kind: 'card-type', label: step.card })
            }
            continue
        }

        // Layer 3: ask each card executor if the kitchen has what it needs
        const check = executor.checkEquipment(kitchen, step.config)
        if (!check.ready) {
            for (const item of check.missing) {
                if (!hasBlocker('equipment', item)) {
                    blockers.push({ kind: 'equipment', label: item })
                }
            }
        }
    }

    return { ready: blockers.length === 0, blockers }
}

// Return whether a recipe has any Wait steps (used to show the tab-open warning).
export function recipeHasWaitSteps(recipe: Recipe): boolean {
    return recipe.steps.some(step => 'card' in step && step.card === 'wait')
}
