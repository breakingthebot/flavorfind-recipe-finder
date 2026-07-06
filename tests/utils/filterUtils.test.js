// tests/utils/filterUtils.test.js
// Tests the search and filter utilities in src/utils/filterUtils.js.
// Connects to: src/utils/filterUtils.js
// Created: 2026-07-06

import { describe, it, expect } from 'vitest';
import { matchIngredients, matchDietaryFilters } from '../../src/utils/filterUtils.js';

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
