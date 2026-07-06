// src/services/recipeService.js
// Handles recipe retrieval, search filtering, and favorites persistence in localStorage.
// Connects to: src/models/recipe.js, src/utils/filterUtils.js, src/utils/logger.js
// Created: 2026-07-06

import { validateRecipe } from '../models/recipe.js';
import { matchIngredients, matchDietaryFilters } from '../utils/filterUtils.js';
import { logger } from '../utils/logger.js';

// Standard storage key for favorites
const FAVORITES_KEY = 'recipe_finder_favorites';

// High-quality mock data representing premium recipes
const MOCK_RECIPES = [
  {
    id: '1',
    name: 'Avocado Toast with Poached Egg',
    ingredients: ['avocado', 'egg', 'sourdough bread', 'olive oil', 'salt', 'black pepper', 'chili flakes'],
    dietaryFlags: ['vegetarian'],
    prepTime: 10,
    difficulty: 'Easy',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
    description: 'Crispy sourdough bread topped with creamy mashed avocado, a perfectly poached egg, and a sprinkle of chili flakes.',
    instructions: [
      'Toast the sourdough bread slices until golden brown.',
      'Mash the avocado with a splash of olive oil, salt, and pepper in a bowl.',
      'Poach the egg in simmering water with a splash of vinegar for 3-4 minutes.',
      'Spread the avocado on the toast, top with the egg, and garnish with chili flakes.'
    ]
  },
  {
    id: '2',
    name: 'Vegan Garlic Mushroom Pasta',
    ingredients: ['pasta', 'mushrooms', 'garlic', 'olive oil', 'spinach', 'coconut milk', 'nutritional yeast', 'parsley'],
    dietaryFlags: ['vegan', 'vegetarian', 'dairy-free'],
    prepTime: 20,
    difficulty: 'Medium',
    imageUrl: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&auto=format&fit=crop&q=80',
    description: 'A rich and creamy garlic mushroom pasta that is completely vegan and dairy-free.',
    instructions: [
      'Cook pasta according to package instructions.',
      'Sauté minced garlic and sliced mushrooms in olive oil until soft and browned.',
      'Add coconut milk and nutritional yeast, let simmer for 5 minutes.',
      'Stir in fresh spinach and cooked pasta, toss well, and top with fresh parsley.'
    ]
  },
  {
    id: '3',
    name: 'Keto Lemon Herb Grilled Chicken',
    ingredients: ['chicken breast', 'lemon', 'garlic', 'rosemary', 'olive oil', 'salt', 'black pepper'],
    dietaryFlags: ['keto', 'gluten-free', 'dairy-free'],
    prepTime: 25,
    difficulty: 'Easy',
    imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&auto=format&fit=crop&q=80',
    description: 'Juicy, marinated chicken breasts grilled to perfection with lemon juice, fresh rosemary, and garlic.',
    instructions: [
      'Marinate chicken breast with lemon juice, minced garlic, olive oil, rosemary, salt, and pepper for 15 minutes.',
      'Preheat grill or pan over medium-high heat.',
      'Grill the chicken for 6-8 minutes on each side until fully cooked.',
      'Rest for 5 minutes before slicing and serving.'
    ]
  },
  {
    id: '4',
    name: 'Gluten-Free Quinoa Salad',
    ingredients: ['quinoa', 'cucumber', 'cherry tomato', 'feta cheese', 'red onion', 'olive oil', 'lemon', 'parsley'],
    dietaryFlags: ['gluten-free', 'vegetarian'],
    prepTime: 15,
    difficulty: 'Easy',
    imageUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=600&auto=format&fit=crop&q=80',
    description: 'A refreshing salad featuring fluffy quinoa, crisp cucumber, sweet cherry tomatoes, and salty feta cheese.',
    instructions: [
      'Cook quinoa according to package instructions and let cool.',
      'Dice cucumber, tomatoes, red onion, and chop parsley.',
      'Combine quinoa and vegetables in a large salad bowl.',
      'Drizzle with olive oil and lemon juice, toss well, and crumble feta cheese on top.'
    ]
  },
  {
    id: '5',
    name: 'Spicy Tofu Stir-Fry',
    ingredients: ['tofu', 'soy sauce', 'chili sauce', 'garlic', 'ginger', 'bell pepper', 'broccoli', 'sesame oil'],
    dietaryFlags: ['vegan', 'vegetarian', 'dairy-free'],
    prepTime: 15,
    difficulty: 'Medium',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    description: 'Crispy tofu cubes tossed with fresh bell peppers and broccoli in a fiery, savory soy-chili sauce.',
    instructions: [
      'Press tofu to remove excess moisture, then cut into cubes.',
      'Pan-fry tofu in sesame oil until golden-brown and crispy on all sides.',
      'Add minced garlic, ginger, sliced bell peppers, and broccoli, stir-frying for 5 minutes.',
      'Pour in soy sauce and chili sauce, toss until everything is coated and hot.'
    ]
  }
];

/**
 * Gets the raw list of mock recipes.
 * @returns {Object[]} The array of recipe objects.
 */
export function getRecipes() {
  logger.debug('Fetching all recipes', { count: MOCK_RECIPES.length });
  return MOCK_RECIPES;
}

/**
 * Searches and filters recipes.
 * 
 * @param {string[]} [ingredients=[]] - List of search ingredients.
 * @param {string[]} [dietaryFilters=[]] - List of active dietary filters.
 * @param {boolean} [strictSearch=false] - True if the recipe must contain all search ingredients.
 * @returns {Object[]} The list of matching recipe objects.
 */
export function searchRecipes(ingredients = [], dietaryFilters = [], strictSearch = false) {
  logger.info('Searching recipes', { ingredients, dietaryFilters, strictSearch });
  
  // Validate mock recipes
  const validRecipes = MOCK_RECIPES.filter(recipe => {
    const isValid = validateRecipe(recipe);
    if (!isValid) {
      logger.warn('Skipping invalid recipe during search', { id: recipe.id, name: recipe.name });
    }
    return isValid;
  });

  return validRecipes.filter(recipe => {
    const matchesIng = matchIngredients(recipe.ingredients, ingredients, strictSearch);
    const matchesDiet = matchDietaryFilters(recipe.dietaryFlags, dietaryFilters);
    return matchesIng && matchesDiet;
  });
}

/**
 * Retrieves the favorited recipe IDs from localStorage.
 * @returns {string[]} The array of favorited recipe IDs.
 */
export function getFavorites() {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    const favorites = stored ? JSON.parse(stored) : [];
    logger.debug('Retrieved favorites from localStorage', { count: favorites.length });
    return favorites;
  } catch (error) {
    logger.error('Failed to parse favorites from localStorage', { error: error.message });
    return [];
  }
}

/**
 * Toggles a recipe ID in the favorites storage.
 * 
 * @param {string} recipeId - The ID of the recipe to toggle.
 * @returns {string[]} The updated list of favorited recipe IDs.
 */
export function toggleFavorite(recipeId) {
  try {
    const favorites = getFavorites();
    const isFav = favorites.includes(recipeId);
    let updated;
    if (isFav) {
      updated = favorites.filter(id => id !== recipeId);
      logger.info('Removed recipe from favorites', { recipeId });
    } else {
      updated = [...favorites, recipeId];
      logger.info('Added recipe to favorites', { recipeId });
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    logger.error('Failed to update favorites in localStorage', { recipeId, error: error.message });
    return getFavorites();
  }
}

/**
 * Checks if a recipe is currently favorited.
 * 
 * @param {string} recipeId - The ID of the recipe.
 * @returns {boolean} True if the recipe is favorited, false otherwise.
 */
export function isFavorite(recipeId) {
  const favorites = getFavorites();
  return favorites.includes(recipeId);
}
