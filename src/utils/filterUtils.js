// src/utils/filterUtils.js
// Provides utility functions for filtering and matching recipes by ingredients and dietary flags.
// Connects to: src/services/recipeService.js
// Created: 2026-07-06

/**
 * Checks if search ingredients match recipe ingredients.
 * Supports partial matching (e.g. "tomato" matches "cherry tomato").
 * 
 * @param {string[]} recipeIngredients - The ingredients of the recipe.
 * @param {string[]} searchIngredients - The ingredients to search for.
 * @param {boolean} [strict=false] - If true, the recipe must contain all search ingredients. If false, any match is fine.
 * @returns {boolean} True if matching, false otherwise.
 */
export function matchIngredients(recipeIngredients, searchIngredients, strict = false) {
  if (!Array.isArray(recipeIngredients) || !Array.isArray(searchIngredients)) {
    return false;
  }
  if (searchIngredients.length === 0) {
    return true;
  }

  const normalizedRecipe = recipeIngredients.map(i => i.toLowerCase().trim());
  const normalizedSearch = searchIngredients
    .map(i => i.toLowerCase().trim())
    .filter(i => i.length > 0);

  if (normalizedSearch.length === 0) {
    return true;
  }

  if (strict) {
    return normalizedSearch.every(searchIng => 
      normalizedRecipe.some(recipeIng => recipeIng.includes(searchIng))
    );
  } else {
    return normalizedSearch.some(searchIng => 
      normalizedRecipe.some(recipeIng => recipeIng.includes(searchIng))
    );
  }
}

/**
 * Checks if a recipe's dietary flags satisfy the active dietary filters.
 * All active filters must be present in the recipe's dietary flags.
 * 
 * @param {string[]} recipeFlags - The dietary flags of the recipe (e.g., ['vegan', 'gluten-free']).
 * @param {string[]} activeFilters - The active dietary filters.
 * @returns {boolean} True if the recipe satisfies all active dietary filters, false otherwise.
 */
export function matchDietaryFilters(recipeFlags, activeFilters) {
  if (!Array.isArray(recipeFlags) || !Array.isArray(activeFilters)) {
    return false;
  }
  if (activeFilters.length === 0) {
    return true;
  }

  const normalizedFlags = recipeFlags.map(f => f.toLowerCase().trim());
  const normalizedFilters = activeFilters
    .map(f => f.toLowerCase().trim())
    .filter(f => f.length > 0);

  return normalizedFilters.every(filter => normalizedFlags.includes(filter));
}
