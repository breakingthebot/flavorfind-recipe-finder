// tests/services/recipeService.test.js
// Tests the recipe service layer in src/services/recipeService.js.
// Connects to: src/services/recipeService.js
// Created: 2026-07-06

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { 
  getRecipes, 
  searchRecipes, 
  getFavorites, 
  toggleFavorite, 
  isFavorite,
  getCustomRecipes,
  addCustomRecipe,
  deleteCustomRecipe
} from '../../src/services/recipeService.js';

// Mock localStorage for Node.js test environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: vi.fn(key => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; })
  };
})();

beforeAll(() => {
  global.localStorage = localStorageMock;
});

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe('recipeService', () => {
  describe('getRecipes', () => {
    it('should return all recipes including mock data', () => {
      const recipes = getRecipes();
      expect(recipes).toBeInstanceOf(Array);
      expect(recipes.length).toBeGreaterThan(0);
    });
  });

  describe('searchRecipes', () => {
    it('should return all recipes if parameters are empty', () => {
      const results = searchRecipes([], []);
      expect(results.length).toBe(getRecipes().length);
    });

    it('should search by ingredient', () => {
      const results = searchRecipes(['avocado'], []);
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('1');
    });

    it('should search by dietary flag', () => {
      const results = searchRecipes([], ['vegetarian']);
      expect(results.length).toBe(4);
    });
  });

  describe('favorites management', () => {
    it('should start with an empty favorites list', () => {
      expect(getFavorites()).toEqual([]);
    });

    it('should toggle favorite status', () => {
      const recipeId = '3';
      expect(isFavorite(recipeId)).toBe(false);
      
      toggleFavorite(recipeId);
      expect(isFavorite(recipeId)).toBe(true);
      expect(getFavorites()).toEqual([recipeId]);

      toggleFavorite(recipeId);
      expect(isFavorite(recipeId)).toBe(false);
      expect(getFavorites()).toEqual([]);
    });
  });

  describe('custom recipes management', () => {
    it('should start with empty custom recipes list', () => {
      expect(getCustomRecipes()).toEqual([]);
    });

    it('should add a custom recipe successfully', () => {
      const newRecipeData = {
        name: 'My Special Cake',
        description: 'Chocolatey goodness',
        prepTime: 45,
        difficulty: 'Medium',
        dietaryFlags: ['vegetarian'],
        ingredients: ['flour', 'sugar', 'cocoa powder'],
        instructions: ['Mix dry ingredients', 'Bake at 350F']
      };

      const saved = addCustomRecipe(newRecipeData);
      expect(saved.id).toBeDefined();
      expect(saved.id.startsWith('custom_')).toBe(true);
      expect(saved.name).toBe('My Special Cake');
      
      // Ensure custom image falls back correctly
      expect(saved.imageUrl).toBeDefined();

      const customList = getCustomRecipes();
      expect(customList.length).toBe(1);
      expect(customList[0].id).toBe(saved.id);
    });

    it('should fail to add custom recipe with missing required fields', () => {
      const invalidRecipe = {
        name: '', // Empty name triggers validation failure
        ingredients: ['sugar'],
        instructions: ['Eat it']
      };

      expect(() => addCustomRecipe(invalidRecipe)).toThrow();
    });

    it('should search custom recipes alongside mock recipes', () => {
      const customRecipeData = {
        name: 'Strawberry Salad',
        description: 'Fresh and fruity',
        prepTime: 10,
        difficulty: 'Easy',
        dietaryFlags: ['vegan', 'vegetarian'],
        ingredients: ['strawberry', 'spinach', 'vinaigrette'],
        instructions: ['Toss spinach', 'Add strawberries']
      };

      addCustomRecipe(customRecipeData);

      // Search for custom ingredient
      const searchRes = searchRecipes(['strawberry'], []);
      expect(searchRes.length).toBe(1);
      expect(searchRes[0].name).toBe('Strawberry Salad');

      // Search for custom vegan recipe
      const veganRes = searchRecipes([], ['vegan']);
      // 2 mock vegan recipes + 1 custom vegan recipe = 3
      expect(veganRes.length).toBe(3);
    });

    it('should delete a custom recipe and clean up favorites', () => {
      const customRecipeData = {
        name: 'Quick Wrap',
        description: 'Wrap it up',
        prepTime: 5,
        difficulty: 'Easy',
        dietaryFlags: [],
        ingredients: ['tortilla', 'cheese'],
        instructions: ['Roll it']
      };

      const saved = addCustomRecipe(customRecipeData);
      const recipeId = saved.id;

      // Add to favorites
      toggleFavorite(recipeId);
      expect(isFavorite(recipeId)).toBe(true);

      // Delete custom recipe
      deleteCustomRecipe(recipeId);
      expect(getCustomRecipes()).toEqual([]);

      // Ensure it is removed from favorites
      expect(isFavorite(recipeId)).toBe(false);
    });
  });
});
