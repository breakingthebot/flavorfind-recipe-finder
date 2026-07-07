// tests/utils/shoppingListUtils.test.js
// Tests the shopping list generation and consolidation logic in src/utils/shoppingListUtils.js.
// Connects to: src/utils/shoppingListUtils.js
// Created: 2026-07-06

import { 
  getCategory, 
  parseIngredient, 
  consolidateIngredients,
  getCustomCategories,
  saveCustomCategories,
  getCustomCategoryMappings,
  saveCustomCategoryMappings
} from '../../src/utils/shoppingListUtils.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('shoppingListUtils - getCategory', () => {
  it('should map produce correctly', () => {
    expect(getCategory('avocado')).toBe('PRODUCE');
    expect(getCategory('garlic cloves')).toBe('PRODUCE');
    expect(getCategory('cherry tomato')).toBe('PRODUCE');
  });

  it('should map meats correctly', () => {
    expect(getCategory('chicken breast')).toBe('MEAT SEAFOOD');
  });

  it('should map bakery correctly', () => {
    expect(getCategory('sourdough bread')).toBe('BAKERY');
  });

  it('should fallback to OTHER for unrecognized ingredients', () => {
    expect(getCategory('exotic alien fruit')).toBe('OTHER');
  });
});

describe('shoppingListUtils - parseIngredient', () => {
  it('should parse simple integers and base names', () => {
    expect(parseIngredient('2 bananas')).toEqual({
      quantity: 2,
      unit: '',
      name: 'bananas'
    });
  });

  it('should parse decimals and units', () => {
    expect(parseIngredient('1.5 cups milk')).toEqual({
      quantity: 1.5,
      unit: 'cup',
      name: 'milk'
    });
  });

  it('should parse fractions and units', () => {
    expect(parseIngredient('1/2 tsp salt')).toEqual({
      quantity: 0.5,
      unit: 'tsp',
      name: 'salt'
    });
    
    expect(parseIngredient('2 1/2 cloves garlic')).toEqual({
      quantity: 2.5,
      unit: 'clove',
      name: 'garlic'
    });
  });

  it('should default to quantity 1 and empty unit if none provided', () => {
    expect(parseIngredient('olive oil')).toEqual({
      quantity: 1,
      unit: '',
      name: 'olive oil'
    });
  });
});

describe('shoppingListUtils - consolidateIngredients', () => {
  it('should aggregate matching ingredients with same units', () => {
    const mockRecipes = [
      {
        name: 'Recipe A',
        ingredients: ['1 cup quinoa', '1/2 tsp salt']
      },
      {
        name: 'Recipe B',
        ingredients: ['2 cups quinoa', '1 tsp salt']
      }
    ];

    const consolidated = consolidateIngredients(mockRecipes);
    
    // Check Pantry (quinoa)
    expect(consolidated['PANTRY']).toBeDefined();
    expect(consolidated['PANTRY']['quinoa']).toEqual({
      quantity: 3,
      unit: 'cup',
      recipes: ['Recipe A', 'Recipe B'],
      alternativeQuantities: []
    });

    // Check Spices (salt)
    expect(consolidated['SPICES BAKING']).toBeDefined();
    expect(consolidated['SPICES BAKING']['salt']).toEqual({
      quantity: 1.5,
      unit: 'tsp',
      recipes: ['Recipe A', 'Recipe B'],
      alternativeQuantities: []
    });
  });

  it('should split quantities with mismatching units into alternativeQuantities', () => {
    const mockRecipes = [
      {
        name: 'Recipe A',
        ingredients: ['2 cloves garlic']
      },
      {
        name: 'Recipe B',
        ingredients: ['1 tbsp garlic']
      }
    ];

    const consolidated = consolidateIngredients(mockRecipes);
    
    expect(consolidated['PRODUCE']['garlic']).toEqual({
      quantity: 2,
      unit: 'clove',
      recipes: ['Recipe A', 'Recipe B'],
      alternativeQuantities: [{ quantity: 1, unit: 'tbsp' }]
    });
  });
});

describe('shoppingListUtils - custom categories and mappings', () => {
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = value.toString(); },
      clear: () => { store = {}; }
    };
  })();

  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock);
    localStorage.clear();
  });

  it('should manage custom categories lists', () => {
    expect(getCustomCategories()).toEqual([]);
    saveCustomCategories(['Beverages', 'Pets']);
    expect(getCustomCategories()).toEqual(['BEVERAGES', 'PETS']);
  });

  it('should manage custom mappings rules', () => {
    expect(getCustomCategoryMappings()).toEqual({});
    saveCustomCategoryMappings({ 'soda': 'BEVERAGES', 'apple': 'FRUITS' });
    expect(getCustomCategoryMappings()).toEqual({ 'soda': 'BEVERAGES', 'apple': 'FRUITS' });
  });

  it('should respect custom mapping rules inside getCategory', () => {
    saveCustomCategoryMappings({ 'soda': 'BEVERAGES' });
    // Verify standard produce is mapped to standard produce
    expect(getCategory('avocado')).toBe('PRODUCE');
    // Verify mapped keyword is classified to Beverages
    expect(getCategory('diet soda')).toBe('BEVERAGES');
  });
});
