// src/models/recipe.js
// Defines the Recipe schema and validation logic.
// Connects to: src/services/recipeService.js
// Created: 2026-07-06

/**
 * Validates a recipe object structure.
 * @param {Object} recipe - The recipe to validate.
 * @returns {boolean} True if the recipe is valid, false otherwise.
 */
export function validateRecipe(recipe) {
  if (!recipe || typeof recipe !== 'object') {
    return false;
  }
  if (typeof recipe.id !== 'string' && typeof recipe.id !== 'number') {
    return false;
  }
  if (typeof recipe.name !== 'string' || !recipe.name.trim()) {
    return false;
  }
  if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
    return false;
  }
  if (recipe.ingredients.some(ing => typeof ing !== 'string' || !ing.trim())) {
    return false;
  }
  if (!Array.isArray(recipe.dietaryFlags)) {
    return false;
  }
  if (recipe.dietaryFlags.some(flag => typeof flag !== 'string' || !flag.trim())) {
    return false;
  }
  return true;
}
