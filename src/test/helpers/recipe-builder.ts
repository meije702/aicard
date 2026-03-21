// Builder for creating Recipe objects in tests without parsing Markdown.

import type { Recipe, SubRecipeStep, RecipeStep, CardType, CardConfig } from '../../types.ts'

export class RecipeBuilder {
  private name = 'Test Recipe'
  private purpose = 'A test recipe.'
  private kitchen: string[] = []
  private steps: RecipeStep[] = []

  static named(name: string): RecipeBuilder {
    const builder = new RecipeBuilder()
    builder.name = name
    return builder
  }

  withPurpose(purpose: string): RecipeBuilder {
    this.purpose = purpose
    return this
  }

  withEquipment(...names: string[]): RecipeBuilder {
    this.kitchen.push(...names)
    return this
  }

  withStep(name: string, card: CardType, config: CardConfig = {}): RecipeBuilder {
    this.steps.push({
      number: this.steps.length + 1,
      name,
      card,
      config,
    })
    return this
  }

  withSubRecipeStep(name: string, recipeName: string): RecipeBuilder {
    const step: SubRecipeStep = {
      number: this.steps.length + 1,
      name,
      recipe: recipeName,
    }
    this.steps.push(step)
    return this
  }

  build(): Recipe {
    return {
      name: this.name,
      purpose: this.purpose,
      kitchen: this.kitchen,
      steps: this.steps,
      errors: [],
    }
  }
}
