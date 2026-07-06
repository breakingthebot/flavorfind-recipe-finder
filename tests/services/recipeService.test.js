// tests/services/recipeService.test.js
// Tests the recipe service layer in src/services/recipeService.js.
// Connects to: src/services/recipeService.js
// Created: 2026-07-06

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { getRecipes, searchRecipes, getFavorites, toggleFavorite, isFavorite } from '../../src/services/recipeService.js';

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
    it('should return all recipes', () => {
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

    it('should search by both ingredient and dietary flag', () => {
      const results = searchRecipes(['chicken breast'], ['keto']);
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('3');
    });

    it('should handle strict searching', () => {
      const strictResults = searchRecipes(['pasta', 'chicken breast'], [], true);
      const nonStrictResults = searchRecipes(['pasta', 'chicken breast'], [], false);
      expect(strictResults.length).toBe(0);
      expect(nonStrictResults.length).toBe(2);
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
});
