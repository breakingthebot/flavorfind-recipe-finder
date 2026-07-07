// src/services/conversionService.js
// Handles metric/imperial kitchen measurements unit conversions and ingredient substitutions lookup.
// Connects to: src/components/CookModeModal.jsx
// Created: 2026-07-06

import { logger } from '../utils/logger.js';

// Substitution catalog mapping common ingredients to alternatives
const SUBSTITUTIONS_DB = {
  butter: {
    alternatives: 'Coconut oil, olive oil, vegan butter, or unsweetened applesauce (best for baking)',
    ratio: '1:1 ratio'
  },
  egg: {
    alternatives: 'Unsweetened applesauce (1/4 cup), mashed banana (1/4 cup), or chia/flax seed egg (1 tbsp ground seeds + 3 tbsp water)',
    ratio: 'Replaces 1 large egg'
  },
  milk: {
    alternatives: 'Almond milk, soy milk, oat milk, coconut milk, or cashew milk',
    ratio: '1:1 ratio'
  },
  buttermilk: {
    alternatives: 'Regular milk (1 cup) mixed with 1 tablespoon of lemon juice or white vinegar (let sit 5 mins)',
    ratio: '1:1 ratio'
  },
  'soy sauce': {
    alternatives: 'Tamari (gluten-free), coconut aminos (low sodium/sweet), or liquid aminos',
    ratio: '1:1 ratio'
  },
  flour: {
    alternatives: 'Gluten-free 1-to-1 baking flour, oat flour, almond flour, or spelt flour',
    ratio: '1:1 ratio for GF blends; almond flour may require less liquid'
  },
  sugar: {
    alternatives: 'Honey, pure maple syrup, coconut sugar, stevia, or monk fruit sweetener',
    ratio: 'Honey/Syrup: Use 3/4 cup per 1 cup sugar and reduce other liquids by 2-3 tbsp'
  },
  garlic: {
    alternatives: 'Garlic powder (1/8 tsp per clove), garlic flakes, or minced shallots/chives',
    ratio: '1 clove = 1/8 tsp garlic powder'
  },
  'lemon juice': {
    alternatives: 'Lime juice, white wine vinegar, apple cider vinegar, or citric acid pinch',
    ratio: '1:1 ratio for vinegars/lime juice'
  },
  'sour cream': {
    alternatives: 'Plain Greek yogurt, coconut cream mixed with 1 tsp lemon juice, or silken tofu blend',
    ratio: '1:1 ratio'
  },
  onion: {
    alternatives: 'Minced shallots, leeks, chives, onion powder (1 tsp), or green onions (scallions)',
    ratio: '1 medium onion = 1 tsp onion powder or 1/2 cup chopped shallots'
  },
  'chicken broth': {
    alternatives: 'Vegetable broth, beef broth, water + bouillon cube/powder, or dry white wine mix',
    ratio: '1:1 ratio'
  },
  'vegetable broth': {
    alternatives: 'Water + bouillon paste, chicken broth, mushroom broth, or water with herbs',
    ratio: '1:1 ratio'
  },
  honey: {
    alternatives: 'Maple syrup, agave nectar, brown rice syrup, or simple sugar syrup',
    ratio: '1:1 ratio'
  },
  yeast: {
    alternatives: 'Baking powder (1 tsp baking powder per 1/2 tsp yeast) or sourdough starter',
    ratio: 'Baking powder works best in quick breads, not kneaded doughs'
  }
};

// Supported units organized by conversion groups
export const CONVERSION_GROUPS = {
  weight: ['g', 'kg', 'oz', 'lb'],
  volume: ['ml', 'cup', 'tbsp', 'tsp', 'fl oz'],
  temperature: ['C', 'F']
};

// Baseline conversion values relative to standard baselines:
// Weight baseline is grams (g)
const WEIGHT_FACTORS = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592
};

// Volume baseline is milliliters (ml)
const VOLUME_FACTORS = {
  ml: 1,
  cup: 240,
  tbsp: 15,
  tsp: 5,
  'fl oz': 29.5735
};

/**
 * Converts a measurement value from one unit to another.
 * 
 * @param {number} value - The quantity to convert.
 * @param {string} fromUnit - The source unit label.
 * @param {string} toUnit - The destination unit label.
 * @returns {number|null} The converted value rounded to 2 decimals, or null if incompatible.
 */
export function convertMeasurement(value, fromUnit, toUnit) {
  if (typeof value !== 'number' || isNaN(value)) {
    logger.warn('Invalid number passed to unit converter');
    return null;
  }

  const from = String(fromUnit).toLowerCase().trim();
  const to = String(toUnit).toLowerCase().trim();

  if (from === to) return Number(value.toFixed(2));

  // 1. Temperature Conversion (Special Formulas)
  if ((from === 'c' && to === 'f') || (from === 'f' && to === 'c')) {
    if (from === 'c') {
      const converted = value * 1.8 + 32;
      return Number(converted.toFixed(2));
    } else {
      const converted = (value - 32) / 1.8;
      return Number(converted.toFixed(2));
    }
  }

  // 2. Weight Conversion
  if (WEIGHT_FACTORS[from] && WEIGHT_FACTORS[to]) {
    const valueInGrams = value * WEIGHT_FACTORS[from];
    const converted = valueInGrams / WEIGHT_FACTORS[to];
    return Number(converted.toFixed(2));
  }

  // 3. Volume Conversion
  if (VOLUME_FACTORS[from] && VOLUME_FACTORS[to]) {
    const valueInMl = value * VOLUME_FACTORS[from];
    const converted = valueInMl / VOLUME_FACTORS[to];
    return Number(converted.toFixed(2));
  }

  logger.warn('Incompatible unit conversion groups requested', { from, to });
  return null;
}

/**
 * Looks up substitution alternatives for a given ingredient query.
 * 
 * @param {string} ingredientName - The raw name of the ingredient to search.
 * @returns {Object|null} Substitution structure if found, otherwise null.
 */
export function getIngredientSubstitution(ingredientName) {
  if (!ingredientName) return null;
  const name = String(ingredientName).toLowerCase().trim();

  // Try direct lookup
  if (SUBSTITUTIONS_DB[name]) {
    return { name, ...SUBSTITUTIONS_DB[name] };
  }

  // Try fuzzy/substring match
  const matchKey = Object.keys(SUBSTITUTIONS_DB).find(key => name.includes(key) || key.includes(name));
  if (matchKey) {
    return { name: matchKey, ...SUBSTITUTIONS_DB[matchKey] };
  }

  return null;
}

/**
 * Retrieves the full substitution catalog database.
 * 
 * @returns {Object} Database index.
 */
export function getFullSubstitutionsDb() {
  return SUBSTITUTIONS_DB;
}
