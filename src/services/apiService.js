// src/services/apiService.js
// Handles external recipe lookup from Spoonacular API (using VITE_SPOONACULAR_API_KEY)
// with a public, keyless fallback to TheMealDB API.
// Connects to: src/App.jsx
// Created: 2026-07-06

import { logger } from '../utils/logger.js';

/**
 * Searches external APIs for recipes matching a query string.
 * 
 * @param {string} query - The search query (e.g. 'pasta').
 * @returns {Promise<Object[]>} Array of mapped Recipe objects.
 */
export async function searchExternalRecipes(query) {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  // Vite loads environment variables prefixed with VITE_
  const apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY;
  
  if (apiKey && apiKey.trim().length > 0) {
    logger.info('Querying Spoonacular API', { query });
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&addRecipeInformation=true&fillIngredients=true&number=6&apiKey=${apiKey}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const results = data.results || [];
      
      return results.map(r => {
        const ingredients = (r.extendedIngredients || []).map(ing => ({
          name: ing.name ? ing.name.toLowerCase().trim() : '',
          quantity: ing.original || `${ing.amount || ''} ${ing.unit || ''}`.trim()
        })).filter(ing => ing.name.length > 0);
        
        let instructions = [];
        if (r.analyzedInstructions && r.analyzedInstructions.length > 0) {
          instructions = (r.analyzedInstructions[0].steps || []).map(s => s.step);
        } else if (r.instructions) {
          instructions = r.instructions
            .split('.')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        }
        
        const dietary = [];
        if (r.vegetarian) dietary.push('vegetarian');
        if (r.vegan) dietary.push('vegan');
        if (r.glutenFree) dietary.push('gluten-free');
        if (r.dairyFree) dietary.push('dairy-free');
        
        return {
          id: `external_spoon_${r.id}`,
          name: r.title || 'Untitled Recipe',
          ingredients,
          instructions: instructions.length > 0 ? instructions : ['Prepare ingredients and cook to taste.'],
          prepTime: Math.max(5, Math.round(r.readyInMinutes * 0.4)) || 15,
          cookTime: Math.max(5, Math.round(r.readyInMinutes * 0.6)) || 20,
          servings: r.servings || 4,
          difficulty: r.readyInMinutes > 40 ? 'Hard' : r.readyInMinutes > 20 ? 'Medium' : 'Easy',
          dietary,
          imageUrl: r.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600'
        };
      });
    } catch (error) {
      logger.error('Spoonacular search failed, falling back to TheMealDB', { error: error.message });
    }
  }

  // Fallback: TheMealDB keyless API
  logger.info('Querying keyless TheMealDB API', { query });
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const meals = data.meals || [];
    
    return meals.map(meal => {
      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        const ingredientName = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredientName && ingredientName.trim().length > 0) {
          ingredients.push({
            name: ingredientName.toLowerCase().trim(),
            quantity: measure && measure.trim().length > 0 ? measure.trim() : 'to taste'
          });
        }
      }
      
      const instructions = meal.strInstructions
        ? meal.strInstructions
            .split(/\r?\n/)
            .map(line => line.trim().replace(/^\d+\.\s*/, '')) // clean leading numbers
            .filter(line => line.length > 0)
        : ['Follow general preparation steps.'];
      
      return {
        id: `external_mealdb_${meal.idMeal}`,
        name: meal.strMeal || 'Untitled Meal',
        ingredients,
        instructions,
        prepTime: 15,
        cookTime: 25,
        servings: 4,
        difficulty: 'Medium',
        dietary: [],
        imageUrl: meal.strMealThumb || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600'
      };
    });
  } catch (error) {
    logger.error('TheMealDB lookup failed', { error: error.message });
    return [];
  }
}
