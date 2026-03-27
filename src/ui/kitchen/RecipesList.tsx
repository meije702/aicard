// RecipesList — recipe cards, file picker, and LiteParse button.
// Renders the recipe library and entry points for adding new recipes.

import type { Recipe } from '../../types.ts'
import styles from '../Kitchen.module.css'

interface Props {
  recipes: Recipe[]
  onOpenRecipe: () => void
  onOpenLiteParse: () => void
  onOpenKitchenRecipe: (recipe: Recipe) => void
}

export default function RecipesList({ recipes, onOpenRecipe, onOpenLiteParse, onOpenKitchenRecipe }: Props) {
  return (
    <section className={styles.sectionCard} aria-label="Your recipes">
      <div className={styles.sectionLabel}>Recipes</div>

      {/* Stored recipes (including the bundled starter) */}
      {recipes.length > 0 && (
        <div className={styles.recipeList} role="list">
          {recipes.map(recipe => (
            <button
              key={recipe.name}
              className={styles.recipeCard}
              onClick={() => onOpenKitchenRecipe(recipe)}
              aria-label={`Open recipe: ${recipe.name}`}
            >
              <span className={styles.recipeCardIcon} aria-hidden="true">📖</span>
              <div className={styles.recipeCardBody}>
                <div className={styles.recipeCardName}>{recipe.name}</div>
                {recipe.purpose && (
                  <div className={styles.recipeCardPurpose}>{recipe.purpose}</div>
                )}
              </div>
              <span className={styles.recipeCardArrow} aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      )}

      {/* File picker — always available to add more recipes */}
      <button
        className={recipes.length > 0 ? styles.recipeDropZoneSmall : styles.recipeDropZone}
        onClick={onOpenRecipe}
        aria-label="Open a recipe file from your computer"
      >
        <span className={styles.recipeDropIcon} aria-hidden="true">📂</span>
        <div className={styles.recipeDropTitle}>
          {recipes.length > 0 ? 'Open another recipe' : 'Open a recipe'}
        </div>
        {recipes.length === 0 && (
          <div className={styles.recipeDropHint}>
            Choose a <code>.recipe.md</code> file from your computer
          </div>
        )}
      </button>

      {/* LiteParse — photo-to-recipe spike */}
      <button
        className={styles.recipeDropZoneSmall}
        onClick={onOpenLiteParse}
        aria-label="Transcribe a handwritten recipe from a photo"
      >
        <span className={styles.recipeDropIcon} aria-hidden="true">📸</span>
        <div className={styles.recipeDropTitle}>Scan a handwritten recipe</div>
      </button>
    </section>
  )
}
