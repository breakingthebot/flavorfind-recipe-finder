// src/services/plannerService.js
// Manages weekly meal planning slots (Monday-Sunday for breakfast, lunch, and dinner) synced to localStorage.
// Connects to: src/App.jsx
// Created: 2026-07-06

import { logger } from '../utils/logger.js';

const PLANNER_KEY = 'recipe_finder_meal_plan';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MEALS = ['breakfast', 'lunch', 'dinner'];

// Default blank weekly calendar schema
const DEFAULT_PLAN = {};
DAYS.forEach(day => {
  MEALS.forEach(meal => {
    DEFAULT_PLAN[`${day}-${meal}`] = null;
  });
});

/**
 * Retrieves the current week's meal plan from localStorage.
 * 
 * @returns {Object} Key-value pairs representing calendar slots mapped to recipe IDs.
 */
export function getMealPlan() {
  try {
    const data = localStorage.getItem(PLANNER_KEY);
    const parsed = data ? JSON.parse(data) : {};
    
    // Merge with DEFAULT_PLAN to ensure all slots are defined
    const merged = { ...DEFAULT_PLAN, ...parsed };
    logger.debug('Retrieved meal plan from localStorage');
    return merged;
  } catch (error) {
    logger.error('Failed to load meal plan from localStorage', { error: error.message });
    return { ...DEFAULT_PLAN };
  }
}

/**
 * Plans a recipe for a specific calendar slot.
 * 
 * @param {string} day - 'monday', 'tuesday', etc.
 * @param {string} mealType - 'breakfast', 'lunch', or 'dinner'.
 * @param {string} recipeId - The ID of the recipe.
 * @returns {Object} The updated meal plan.
 */
export function planMeal(day, mealType, recipeId) {
  const slotKey = `${day.toLowerCase()}-${mealType.toLowerCase()}`;
  
  if (!DEFAULT_PLAN.hasOwnProperty(slotKey)) {
    logger.warn('Attempted to plan meal for invalid slot key', { slotKey });
    throw new Error('Invalid day or meal type selection.');
  }

  const currentPlan = getMealPlan();
  currentPlan[slotKey] = recipeId;
  
  localStorage.setItem(PLANNER_KEY, JSON.stringify(currentPlan));
  logger.info('Planned recipe in slot', { slotKey, recipeId });
  
  return currentPlan;
}

/**
 * Clears a specific calendar slot.
 * 
 * @param {string} day - 'monday', 'tuesday', etc.
 * @param {string} mealType - 'breakfast', 'lunch', or 'dinner'.
 * @returns {Object} The updated meal plan.
 */
export function unplanMeal(day, mealType) {
  const slotKey = `${day.toLowerCase()}-${mealType.toLowerCase()}`;
  
  const currentPlan = getMealPlan();
  currentPlan[slotKey] = null;
  
  localStorage.setItem(PLANNER_KEY, JSON.stringify(currentPlan));
  logger.info('Cleared planned recipe from slot', { slotKey });
  
  return currentPlan;
}

/**
 * Resets the entire weekly planner.
 * 
 * @returns {Object} The cleared meal plan.
 */
export function clearMealPlan() {
  localStorage.setItem(PLANNER_KEY, JSON.stringify(DEFAULT_PLAN));
  logger.info('Reset entire weekly meal planner');
  return { ...DEFAULT_PLAN };
}
