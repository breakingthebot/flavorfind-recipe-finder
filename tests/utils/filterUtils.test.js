// tests/utils/filterUtils.test.js
// Tests the search and filter utilities in src/utils/filterUtils.js.
// Connects to: src/utils/filterUtils.js
// Created: 2026-07-06

import { describe, it, expect } from 'vitest';
import { matchIngredients, matchDietaryFilters, scoreRecipeByInventory } from '../../src/utils/filterUtils.js';

describe('matchIngredients', () => {
  const recipeIngs = ['Avocado', 'Sourdough bread', 'Poached egg'];

  it('should return true for empty search query', () => {
    expect(matchIngredients(recipeIngs, [])).toBe(true);
  });

  it('should match any ingredient in non-strict mode', () => {
    expect(matchIngredients(recipeIngs, ['avocado'])).toBe(true);
    expect(matchIngredients(recipeIngs, ['egg', 'tomato'])).toBe(true);
  });

  it('should require all ingredients in strict mode', () => {
    expect(matchIngredients(recipeIngs, ['avocado', 'egg'], true)).toBe(true);
    expect(matchIngredients(recipeIngs, ['avocado', 'tomato'], true)).toBe(false);
  });

  it('should be case-insensitive and ignore leading/trailing whitespace', () => {
    expect(matchIngredients(recipeIngs, ['  AVOCADO  '])).toBe(true);
  });

  it('should handle invalid input types gracefully', () => {
    expect(matchIngredients(null, ['avocado'])).toBe(false);
    expect(matchIngredients(recipeIngs, null)).toBe(false);
  });
});

describe('matchDietaryFilters', () => {
  const recipeFlags = ['vegan', 'gluten-free', 'dairy-free'];

  it('should return true if no dietary filters are active', () => {
    expect(matchDietaryFilters(recipeFlags, [])).toBe(true);
  });

  it('should match if all active filters are present on the recipe', () => {
    expect(matchDietaryFilters(recipeFlags, ['vegan', 'gluten-free'])).toBe(true);
  });

  it('should return false if any active filter is missing', () => {
    expect(matchDietaryFilters(recipeFlags, ['vegan', 'keto'])).toBe(false);
  });

  it('should be case-insensitive and ignore leading/trailing whitespace', () => {
    expect(matchDietaryFilters(recipeFlags, ['  VEGAN  '])).toBe(true);
  });

  it('should handle invalid input types gracefully', () => {
    expect(matchDietaryFilters(null, ['vegan'])).toBe(false);
    expect(matchDietaryFilters(recipeFlags, null)).toBe(false);
  });
});

describe('scoreRecipeByInventory', () => {
  const getLocalDateStr = (offsetDays) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const recipe = {
    name: 'Avocado Toast',
    ingredients: ['avocado', 'sourdough bread', 'milk']
  };

  it('should return 0 score and empty matches for empty inventory', () => {
    const res = scoreRecipeByInventory(recipe, []);
    expect(res.score).toBe(0);
    expect(res.matchingExpiringItems).toHaveLength(0);
  });

  it('should score safe, expiring, and expired matching items correctly', () => {
    const inventory = [
      { name: 'avocado', expirationDate: getLocalDateStr(10) }, // safe matching: +10
      { name: 'sourdough bread', expirationDate: getLocalDateStr(2) }, // expiring (2 days): +50 - 20 = +30
      { name: 'milk', expirationDate: getLocalDateStr(-1) }, // expired (-1 day): +100
      { name: 'mushroom', expirationDate: getLocalDateStr(0) } // non-matching
    ];

    const res = scoreRecipeByInventory(recipe, inventory);
    expect(res.score).toBe(140); // 10 + 30 + 100
    expect(res.matchingExpiringItems).toHaveLength(2); // sourdough bread & milk
    expect(res.matchingExpiringItems[0].item.name).toBe('sourdough bread');
    expect(res.matchingExpiringItems[1].item.name).toBe('milk');
  });
});
