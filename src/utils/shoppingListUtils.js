// src/utils/shoppingListUtils.js
// Consolidates ingredients from multiple recipes into a categorized, aggregated shopping list.
// Connects to: src/components/ShoppingListModal.jsx
// Created: 2026-07-06

import { logger } from './logger.js';

// Category mappings for ingredients
const CATEGORIES = {
  PRODUCE: ['avocado', 'spinach', 'mushrooms', 'garlic', 'ginger', 'bell pepper', 'broccoli', 'lemon', 'cucumber', 'cherry tomato', 'red onion', 'parsley', 'rosemary', 'strawberry', 'banana', 'lime', 'onion', 'tomato', 'potato', 'carrots', 'celery', 'cilantro', 'basil'],
  MEAT_SEAFOOD: ['chicken breast', 'chicken', 'beef', 'pork', 'salmon', 'turkey', 'bacon', 'shrimp', 'tofu'],
  DAIRY_ALTERNATES: ['egg', 'eggs', 'milk', 'coconut milk', 'feta cheese', 'butter', 'cheese', 'yogurt', 'cream', 'sour cream', 'parmesan', 'mozzarella'],
  BAKERY: ['sourdough bread', 'bread', 'tortilla', 'tortillas', 'wrap', 'bun', 'buns'],
  PANTRY: ['pasta', 'quinoa', 'soy sauce', 'chili sauce', 'sesame oil', 'olive oil', 'vinegar', 'vegetable oil', 'rice', 'beans', 'flour', 'sugar', 'honey', 'maple syrup', 'cocoa powder', 'oats', 'nuts', 'seeds'],
  SPICES_BAKING: ['salt', 'black pepper', 'pepper', 'chili flakes', 'nutritional yeast', 'yeast', 'oregano', 'cumin', 'paprika', 'cinnamon']
};

/**
 * Assigns an ingredient name to a shopping category.
 * 
 * @param {string} name - The normalized name of the ingredient.
 * @returns {string} The category name.
 */
export function getCategory(name) {
  const normalized = name.toLowerCase().trim();
  
  for (const [category, items] of Object.entries(CATEGORIES)) {
    if (items.some(item => normalized.includes(item))) {
      return category.replace('_', ' ');
    }
  }
  return 'OTHER';
}

/**
 * Normalizes units to standard singular abbreviations to allow direct aggregation.
 * E.g., 'cups' and 'cup' -> 'cup'; 'teaspoons' and 'teaspoon' -> 'tsp'.
 * 
 * @param {string} unit - The unit string.
 * @returns {string} The normalized standard unit.
 */
export function normalizeUnit(unit) {
  const u = unit.toLowerCase().trim();
  if (u === 'cups' || u === 'cup') return 'cup';
  if (u === 'teaspoons' || u === 'teaspoon' || u === 'tsp') return 'tsp';
  if (u === 'tablespoons' || u === 'tablespoon' || u === 'tbsp') return 'tbsp';
  if (u === 'cloves' || u === 'clove') return 'clove';
  if (u === 'grams' || u === 'gram' || u === 'g') return 'g';
  if (u === 'milliliters' || u === 'ml') return 'ml';
  if (u === 'pieces' || u === 'piece') return 'piece';
  if (u === 'slices' || u === 'slice') return 'slice';
  if (u === 'ounces' || u === 'ounce' || u === 'oz') return 'oz';
  if (u === 'cans' || u === 'can') return 'can';
  return u;
}

/**
 * Parses an ingredient string to extract quantity, unit, and base name.
 * Handles patterns like: "2 bananas", "1.5 cups milk", "1/2 tsp salt", "olive oil"
 * 
 * @param {string} ingredientStr - The raw ingredient string.
 * @returns {Object} { quantity, unit, name }
 */
export function parseIngredient(ingredientStr) {
  const str = ingredientStr.toLowerCase().trim();
  
  // Regex to match leading fractions or decimals
  // Matches: 1, 1.5, 1/2, 2 1/2, etc.
  const qtyRegex = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(\.\d+)?)\s*/;
  const match = str.match(qtyRegex);
  
  let quantity = 1;
  let remaining = str;
  
  if (match) {
    const rawQty = match[1];
    remaining = str.slice(match[0].length).trim();
    
    // Evaluate fraction or decimal
    if (rawQty.includes('/')) {
      const parts = rawQty.split(/\s+/);
      if (parts.length === 2) {
        const whole = parseFloat(parts[0]);
        const fractionParts = parts[1].split('/');
        quantity = whole + (parseFloat(fractionParts[0]) / parseFloat(fractionParts[1]));
      } else {
        const fractionParts = parts[0].split('/');
        quantity = parseFloat(fractionParts[0]) / parseFloat(fractionParts[1]);
      }
    } else {
      quantity = parseFloat(rawQty);
    }
  }

  // Common units to match
  const units = ['cups', 'cup', 'tbsp', 'tablespoons', 'tablespoon', 'tsp', 'teaspoons', 'teaspoon', 'g', 'grams', 'gram', 'ml', 'milliliters', 'cloves', 'clove', 'pieces', 'piece', 'slices', 'slice', 'cans', 'can', 'oz', 'ounces', 'ounce'];
  
  let unit = '';
  const firstWord = remaining.split(/\s+/)[0];
  
  if (units.includes(firstWord)) {
    unit = normalizeUnit(firstWord);
    remaining = remaining.slice(firstWord.length).trim();
  }

  // Clean remaining text
  const name = remaining.replace(/^(of|and)\s+/, '').trim();
  
  return {
    quantity,
    unit,
    name
  };
}

/**
 * Consolidates ingredients from multiple recipes.
 * Group by category, then by ingredient name.
 * Add quantities if units match.
 * 
 * @param {Object[]} selectedRecipes - List of recipes.
 * @returns {Object} Grouped consolidated ingredients.
 */
export function consolidateIngredients(selectedRecipes) {
  logger.info('Consolidating ingredients for shopping list', { recipeCount: selectedRecipes.length });
  
  const consolidated = {}; // { category: { ingredientName: { quantity, unit, recipes: [], alternativeQuantities: [] } } }

  selectedRecipes.forEach(recipe => {
    recipe.ingredients.forEach(ingStr => {
      const parsed = parseIngredient(ingStr);
      const category = getCategory(parsed.name);
      
      if (!consolidated[category]) {
        consolidated[category] = {};
      }

      const existing = consolidated[category][parsed.name];
      if (existing) {
        // If units match, sum quantities
        if (existing.unit === parsed.unit) {
          existing.quantity += parsed.quantity;
        } else {
          // If units don't match, keep separate line items
          existing.alternativeQuantities = existing.alternativeQuantities || [];
          existing.alternativeQuantities.push({ quantity: parsed.quantity, unit: parsed.unit });
        }
        if (!existing.recipes.includes(recipe.name)) {
          existing.recipes.push(recipe.name);
        }
      } else {
        consolidated[category][parsed.name] = {
          quantity: parsed.quantity,
          unit: parsed.unit,
          recipes: [recipe.name],
          alternativeQuantities: []
        };
      }
    });
  });

  return consolidated;
}
