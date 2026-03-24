// Builds a PromptContext for a specific card execution.
// This is the ONLY place that knows where technique, house style,
// and corrections come from — call sites just call buildPromptContext().

import type { Kitchen, CardType, PromptContext } from '../types.ts'
import { getRecentCorrections } from '../kitchen/journal.ts'

export function buildPromptContext(
  kitchen: Kitchen,
  cardType: CardType,
  stepContext: string,
): PromptContext {
  const technique = kitchen.pantry.find(c => c.type === cardType)?.technique
  const houseStyle = kitchen.houseStyle
  const recentCorrections = getRecentCorrections(kitchen.journal ?? [], cardType)

  return { technique, houseStyle, recentCorrections, stepContext }
}
