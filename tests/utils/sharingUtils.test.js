// tests/utils/sharingUtils.test.js
// Tests the recipe URL sharing encoding, decoding, and parsing routines.
// Connects to: src/utils/sharingUtils.js
// Created: 2026-07-06

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateShareLink, parseShareParameters } from '../../src/utils/sharingUtils.js';

describe('sharingUtils', () => {
  beforeEach(() => {
    // Mock window global location parameters
    vi.stubGlobal('window', {
      location: {
        origin: 'http://localhost:3000',
        pathname: '/',
        search: ''
      },
      history: {
        replaceState: vi.fn()
      }
    });
  });

  it('should generate an ID reference link for standard mock recipes', () => {
    const mockRecipe = { id: '2', name: 'Mock Spaghetti' };
    const link = generateShareLink(mockRecipe);
    expect(link).toBe('http://localhost:3000/?recipeId=2');
  });

  it('should generate a Base64 serialized link for custom recipes', () => {
    const customRecipe = {
      id: 'custom_123',
      name: 'Custom Cake 🍰',
      ingredients: [{ name: 'flour', quantity: '1 cup' }],
      instructions: ['Bake'],
      prepTime: 10,
      cookTime: 20,
      servings: 6,
      difficulty: 'Easy',
      imageUrl: 'http://test.com/cake.jpg'
    };

    const link = generateShareLink(customRecipe);
    expect(link).toContain('?shareRecipe=');
  });

  it('should decode and parse URL parameters successfully', () => {
    const customRecipe = {
      id: 'custom_123',
      name: 'Custom Cake 🍰',
      ingredients: [{ name: 'flour', quantity: '1 cup' }],
      instructions: ['Bake'],
      prepTime: 10,
      cookTime: 20,
      servings: 6,
      difficulty: 'Easy',
      imageUrl: 'http://test.com/cake.jpg'
    };

    const link = generateShareLink(customRecipe);
    const searchString = link.split('?')[1];
    
    // Set window search location mock
    window.location.search = '?' + searchString;

    const parsed = parseShareParameters();
    expect(parsed.type).toBe('custom');
    expect(parsed.data.name).toBe('Custom Cake 🍰');
    expect(parsed.data.ingredients[0].name).toBe('flour');
  });

  it('should parse recipe ID references from parameters successfully', () => {
    window.location.search = '?recipeId=external_mealdb_52777';
    const parsed = parseShareParameters();
    expect(parsed.type).toBe('reference');
    expect(parsed.data).toBe('external_mealdb_52777');
  });
});
