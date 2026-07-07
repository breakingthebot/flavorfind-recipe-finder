// tests/services/apiService.test.js
// Tests the external recipe API lookup service in src/services/apiService.js.
// Connects to: src/services/apiService.js
// Created: 2026-07-06

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { searchExternalRecipes } from '../../src/services/apiService.js';

describe('apiService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubEnv('VITE_SPOONACULAR_API_KEY', '');
  });

  it('should return an empty list immediately if the query is empty or whitespace', async () => {
    const res = await searchExternalRecipes('');
    expect(res).toEqual([]);
    
    const resNull = await searchExternalRecipes(null);
    expect(resNull).toEqual([]);
  });

  it('should fallback to TheMealDB keyless API and return mapped recipes successfully', async () => {
    const mockMealDBResponse = {
      meals: [
        {
          idMeal: '1111',
          strMeal: 'Test Chicken Dish',
          strInstructions: '1. Cook chicken\n2. Eat',
          strMealThumb: 'http://test.image/img.jpg',
          strIngredient1: 'Chicken',
          strMeasure1: '500g',
          strIngredient2: 'Water',
          strMeasure2: '1 cup',
          strIngredient3: '',
          strMeasure3: ''
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMealDBResponse
    });

    const results = await searchExternalRecipes('chicken');
    
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('themealdb.com'));
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('external_mealdb_1111');
    expect(results[0].name).toBe('Test Chicken Dish');
    expect(results[0].ingredients).toHaveLength(2);
    expect(results[0].ingredients[0]).toEqual({ name: 'chicken', quantity: '500g' });
    expect(results[0].instructions).toEqual(['Cook chicken', 'Eat']);
  });

  it('should query Spoonacular complexSearch API when VITE_SPOONACULAR_API_KEY env key is present', async () => {
    vi.stubEnv('VITE_SPOONACULAR_API_KEY', 'test_key_123');

    const mockSpoonacularResponse = {
      results: [
        {
          id: 5678,
          title: 'Spoon Pasta',
          image: 'http://spoon.image/img.jpg',
          readyInMinutes: 30,
          servings: 2,
          vegetarian: true,
          vegan: false,
          glutenFree: true,
          dairyFree: false,
          extendedIngredients: [
            { name: 'Pasta', original: '100g pasta' }
          ],
          analyzedInstructions: [
            {
              steps: [
                { step: 'Boil pasta.' }
              ]
            }
          ]
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSpoonacularResponse
    });

    const results = await searchExternalRecipes('pasta');

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('spoonacular.com'));
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('external_spoon_5678');
    expect(results[0].name).toBe('Spoon Pasta');
    expect(results[0].dietary).toContain('vegetarian');
    expect(results[0].dietary).toContain('gluten-free');
    expect(results[0].dietary).not.toContain('vegan');
    expect(results[0].ingredients[0]).toEqual({ name: 'pasta', quantity: '100g pasta' });
    expect(results[0].instructions).toEqual(['Boil pasta.']);
  });
});
