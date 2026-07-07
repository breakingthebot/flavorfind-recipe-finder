// src/services/nutritionService.js
// Estimates recipe macronutrients and sodium content based on ingredient keywords.
// Connects to: src/components/RecipeCard.jsx, src/components/CookModeModal.jsx
// Created: 2026-07-07

import { parseIngredientQuantity } from '../utils/portionsScaler.js';
import { parseIngredient } from '../utils/shoppingListUtils.js';
import { logger } from '../utils/logger.js';

// Nutrient density values per 100g of food item
const NUTRITION_DB = {
  avocado: { kcal: 160, protein: 2.0, carbs: 9.0, fat: 15.0, fiber: 7.0, sodium: 7 },
  egg: { kcal: 143, protein: 12.6, carbs: 0.7, fat: 9.5, fiber: 0.0, sodium: 140 },
  eggs: { kcal: 143, protein: 12.6, carbs: 0.7, fat: 9.5, fiber: 0.0, sodium: 140 },
  bread: { kcal: 265, protein: 9.0, carbs: 49.0, fat: 3.2, fiber: 2.7, sodium: 490 },
  sourdough: { kcal: 289, protein: 12.0, carbs: 56.0, fat: 1.8, fiber: 2.4, sodium: 600 },
  oil: { kcal: 884, protein: 0.0, carbs: 0.0, fat: 100.0, fiber: 0.0, sodium: 2 },
  butter: { kcal: 717, protein: 0.9, carbs: 0.1, fat: 81.0, fiber: 0.0, sodium: 643 },
  chicken: { kcal: 165, protein: 31.0, carbs: 0.0, fat: 3.6, fiber: 0.0, sodium: 74 },
  salmon: { kcal: 208, protein: 20.0, carbs: 0.0, fat: 13.0, fiber: 0.0, sodium: 59 },
  beef: { kcal: 250, protein: 26.0, carbs: 0.0, fat: 15.0, fiber: 0.0, sodium: 72 },
  pasta: { kcal: 131, protein: 5.0, carbs: 25.0, fat: 1.1, fiber: 1.8, sodium: 6 },
  rice: { kcal: 130, protein: 2.7, carbs: 28.0, fat: 0.3, fiber: 0.4, sodium: 1 },
  spinach: { kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sodium: 79 },
  mushroom: { kcal: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1.0, sodium: 5 },
  mushrooms: { kcal: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1.0, sodium: 5 },
  milk: { kcal: 50, protein: 3.3, carbs: 4.8, fat: 2.0, fiber: 0.0, sodium: 44 },
  coconut: { kcal: 230, protein: 2.3, carbs: 5.5, fat: 24.0, fiber: 2.2, sodium: 15 },
  cheese: { kcal: 402, protein: 25.0, carbs: 1.3, fat: 33.0, fiber: 0.0, sodium: 621 },
  feta: { kcal: 264, protein: 14.0, carbs: 4.1, fat: 21.0, fiber: 0.0, sodium: 1116 },
  parmesan: { kcal: 431, protein: 38.0, carbs: 4.1, fat: 29.0, fiber: 0.0, sodium: 1529 },
  sugar: { kcal: 387, protein: 0.0, carbs: 100.0, fat: 0.0, fiber: 0.0, sodium: 1 },
  honey: { kcal: 304, protein: 0.3, carbs: 82.0, fat: 0.0, fiber: 0.0, sodium: 4 },
  flour: { kcal: 364, protein: 10.0, carbs: 76.0, fat: 1.0, fiber: 2.7, sodium: 2 },
  garlic: { kcal: 149, protein: 6.4, carbs: 33.0, fat: 0.5, fiber: 2.1, sodium: 17 },
  tomato: { kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sodium: 5 },
  tomatoes: { kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sodium: 5 },
  onion: { kcal: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, sodium: 4 },
  onions: { kcal: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, sodium: 4 },
  pork: { kcal: 242, protein: 27.0, carbs: 0.0, fat: 14.0, fiber: 0.0, sodium: 62 },
  turkey: { kcal: 189, protein: 29.0, carbs: 0.0, fat: 7.0, fiber: 0.0, sodium: 70 },
  shrimp: { kcal: 85, protein: 20.0, carbs: 0.0, fat: 0.5, fiber: 0.0, sodium: 119 },
  tofu: { kcal: 76, protein: 8.0, carbs: 1.9, fat: 4.8, fiber: 0.3, sodium: 7 },
  banana: { kcal: 89, protein: 1.1, carbs: 23.0, fat: 0.3, fiber: 2.6, sodium: 1 },
  strawberry: { kcal: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2.0, sodium: 1 },
  bell_pepper: { kcal: 20, protein: 0.9, carbs: 4.6, fat: 0.2, fiber: 1.7, sodium: 4 },
  broccoli: { kcal: 34, protein: 2.8, carbs: 7.0, fat: 0.4, fiber: 2.6, sodium: 33 }
};

/**
 * Estimates weight in grams based on quantity and unit keywords.
 */
function estimateWeightInGrams(quantity, unit, name) {
  const normUnit = unit ? unit.toLowerCase() : '';
  const normName = name.toLowerCase();

  if (normUnit === 'g' || normUnit === 'grams' || normUnit === 'gram') {
    return quantity;
  }
  if (normUnit === 'ml' || normUnit === 'milliliters') {
    return quantity;
  }
  if (normUnit === 'cups' || normUnit === 'cup') {
    return quantity * 200;
  }
  if (normUnit === 'tbsp' || normUnit === 'tablespoons' || normUnit === 'tablespoon') {
    return quantity * 15;
  }
  if (normUnit === 'tsp' || normUnit === 'teaspoons' || normUnit === 'teaspoon') {
    return quantity * 5;
  }
  if (normUnit === 'oz' || normUnit === 'ounces' || normUnit === 'ounce') {
    return quantity * 28.3;
  }

  // Item overrides
  if (normName.includes('egg')) {
    return quantity * 50;
  }
  if (normName.includes('avocado')) {
    return quantity * 150;
  }
  if (normName.includes('garlic')) {
    return quantity * 5;
  }
  if (normName.includes('chicken')) {
    return quantity * 200;
  }
  if (normName.includes('salmon') || normName.includes('steak')) {
    return quantity * 150;
  }
  if (normName.includes('banana')) {
    return quantity * 120;
  }
  
  return quantity * 100;
}

/**
 * Compiles recipe total macronutrients, fiber, and sodium based on parsed units.
 * Estimates values per serving based on target servingsCount and portionsScale.
 * 
 * @param {string[]} ingredients - List of ingredient strings.
 * @param {number} [servingsCount=2] - Servings yield count.
 * @param {number} [portionsScale=1] - Scaling multiplier.
 * @returns {Object} Estimated macro nutrients.
 */
export function estimateRecipeNutrition(ingredients, servingsCount = 2, portionsScale = 1) {
  let totalKcal = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalSodium = 0;

  if (!Array.isArray(ingredients)) {
    return { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 };
  }

  ingredients.forEach(ingText => {
    const portionsParsed = parseIngredientQuantity(ingText);
    let qty = 1;
    let nameAndUnit = ingText;

    if (portionsParsed) {
      qty = portionsParsed.value;
      nameAndUnit = portionsParsed.rest;
    }

    const listParsed = parseIngredient(nameAndUnit);
    const unit = listParsed.unit || '';
    const name = listParsed.name || nameAndUnit;
    const weightGrams = estimateWeightInGrams(qty, unit, name);

    const dbKey = Object.keys(NUTRITION_DB).find(key => name.toLowerCase().includes(key));
    
    if (dbKey) {
      const density = NUTRITION_DB[dbKey];
      const multiplier = weightGrams / 100;
      
      totalKcal += (density.kcal * multiplier);
      totalProtein += (density.protein * multiplier);
      totalCarbs += (density.carbs * multiplier);
      totalFat += (density.fat * multiplier);
      totalFiber += (density.fiber * multiplier);
      totalSodium += (density.sodium * multiplier);
    } else {
      const multiplier = weightGrams / 100;
      totalKcal += (50 * multiplier);
      totalProtein += (1.0 * multiplier);
      totalCarbs += (8.0 * multiplier);
      totalFat += (0.5 * multiplier);
      totalFiber += (1.0 * multiplier);
      totalSodium += (10.0 * multiplier);
    }
  });

  const factor = portionsScale / (servingsCount || 2);

  const result = {
    kcal: Math.round(totalKcal * factor),
    protein: Math.round(totalProtein * factor),
    carbs: Math.round(totalCarbs * factor),
    fat: Math.round(totalFat * factor),
    fiber: Math.round(totalFiber * factor),
    sodium: Math.round(totalSodium * factor)
  };

  logger.debug('Recipe nutrition estimated', { ingredientsCount: ingredients.length, servingsCount, portionsScale, result });
  return result;
}
