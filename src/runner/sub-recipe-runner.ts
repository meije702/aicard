// Level 3 — Combining: sub-recipe execution factory.
//
// createSubRecipeRunner returns an OnSubRecipe callback that the runner calls
// whenever it encounters a *Recipe: Name* step. All business logic — lookup,
// recursion guard, depth tracking — lives here. The runner itself stays ignorant
// of kitchens and recursion (DIP, SRP).
//
// Usage:
//   runRecipe(recipe, kitchen, ..., createSubRecipeRunner(kitchen, executors))

import type { Kitchen, CardResult } from '../types.ts'
import { runRecipe, type OnSubRecipe, type ExecutorRegistry, defaultExecutors } from './recipe-runner.ts'

const MAX_DEPTH = 3

export function createSubRecipeRunner(
    kitchen: Kitchen,
    executors: ExecutorRegistry = defaultExecutors,
    depth = 0
): OnSubRecipe {
    return async (recipeName: string): Promise<CardResult> => {
        if (depth >= MAX_DEPTH) {
            return {
                success: false,
                output: {},
                message: `Sub-recipe nesting is too deep (max ${MAX_DEPTH} levels).`,
            }
        }

        const found = kitchen.recipes.find(
            r => r.name.toLowerCase() === recipeName.toLowerCase()
        )
        if (!found) {
            return {
                success: false,
                output: {},
                message: `Recipe "${recipeName}" is not in your kitchen. Open it first.`,
            }
        }

        // Run the sub-recipe headlessly (no UI callbacks) with a nested runner
        // that increments depth, preventing infinite recursion.
        const innerRunner = createSubRecipeRunner(kitchen, executors, depth + 1)
        const finalState = await runRecipe(
            found,
            kitchen,
            undefined,   // no UI state updates for nested runs
            undefined,   // no user interaction (headless)
            undefined,   // no config overrides
            executors,
            undefined,   // no cancellation hook
            undefined,   // no step review panel
            innerRunner
        )

        if (finalState.complete) {
            const n = finalState.steps.length
            return {
                success: true,
                output: { result: 'complete', steps: String(n) },
                message: `"${recipeName}" completed — ${n} step${n === 1 ? '' : 's'} ran.`,
            }
        }

        const firstError = finalState.errors[0] ?? 'unknown error'
        return {
            success: false,
            output: {},
            message: `"${recipeName}" stopped: ${firstError}`,
        }
    }
}
