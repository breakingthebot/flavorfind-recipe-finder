// src/utils/sharingUtils.js
// Packages custom recipes into Base64 queries and reference links for keyless client-side sharing.
// Connects to: src/App.jsx, src/components/RecipeCard.jsx
// Created: 2026-07-06

import { logger } from './logger.js';

/**
 * Generates a shareable URL link for a given recipe.
 * 
 * @param {Object} recipe - The recipe model object to share.
 * @returns {string} The fully formed shareable browser URL.
 */
export function generateShareLink(recipe) {
  if (!recipe) return '';

  const origin = window.location.origin + window.location.pathname;
  const isCustom = recipe.id && String(recipe.id).startsWith('custom_');

  if (isCustom) {
    try {
      // Packaging only the relevant fields to keep the URL length safe
      const payload = {
        name: recipe.name,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        dietary: recipe.dietary || [],
        imageUrl: recipe.imageUrl
      };
      
      const jsonStr = JSON.stringify(payload);
      // UTF-8 safe base64 encoding
      const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
      
      logger.info('Serialized custom recipe to Base64 link');
      return `${origin}?shareRecipe=${encodeURIComponent(base64)}`;
    } catch (e) {
      logger.error('Failed to serialize custom recipe for sharing', { error: e.message });
      return '';
    }
  }

  // Mock or external recipe link (uses ID reference)
  logger.info('Generated ID lookup sharing link', { id: recipe.id });
  return `${origin}?recipeId=${encodeURIComponent(recipe.id)}`;
}

/**
 * Parses query parameters from the window location.
 * 
 * @returns {Object|null} Object containing shareRecipe parsed dataset or recipeId references.
 */
export function parseShareParameters() {
  try {
    const params = new URLSearchParams(window.location.search);
    const shareRecipe = params.get('shareRecipe');
    const recipeId = params.get('recipeId');

    if (shareRecipe) {
      // UTF-8 safe base64 decoding
      const decodedJson = decodeURIComponent(escape(atob(shareRecipe)));
      const recipeData = JSON.parse(decodedJson);
      
      logger.info('Successfully parsed shared custom recipe from URL params');
      return { type: 'custom', data: recipeData };
    }

    if (recipeId) {
      logger.info('Found recipeId share parameter in URL', { recipeId });
      return { type: 'reference', data: recipeId };
    }

    return null;
  } catch (e) {
    logger.error('Failed to parse share parameters from URL', { error: e.message });
    return null;
  }
}

/**
 * Clears the query parameters from the window URL without refreshing the page.
 */
export function clearQueryParams() {
  const url = new URL(window.location.href);
  url.search = '';
  window.history.replaceState({}, document.title, url.toString());
  logger.debug('Cleared query parameters from browser address bar');
}
