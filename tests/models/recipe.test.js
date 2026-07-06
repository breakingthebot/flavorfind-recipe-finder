// tests/models/recipe.test.js
// Tests the recipe validation logic in src/models/recipe.js.
// Connects to: src/models/recipe.js
// Created: 2026-07-06

import { describe, it, expect } from 'vitest';
import { validateRecipe } from '../../src/models/recipe.js';

describe('validateRecipe', () => {
  it('should validate a correct recipe', () => {
    const recipe = {
      id: '1',
      name: 'Test Recipe',
      ingredients: ['ingredient A', 'ingredient B'],
      dietaryFlags: ['vegan']
    };
    expect(validateRecipe(recipe)).toBe(true);
  });

  it('should invalidate null or undefined inputs', () => {
    expect(validateRecipe(null)).toBe(false);
    expect(validateRecipe(undefined)).toBe(false);
  });

  it('should invalidate recipe without valid id', () => {
    const noId = { name: 'Test', ingredients: ['a'], dietaryFlags: [] };
    const badId = { id: {}, name: 'Test', ingredients: ['a'], dietaryFlags: [] };
    expect(validateRecipe(noId)).toBe(false);
    expect(validateRecipe(badId)).toBe(false);
  });

  it('should invalidate recipe without valid name', () => {
    const noName = { id: '1', ingredients: ['a'], dietaryFlags: [] };
    const emptyName = { id: '1', name: '  ', ingredients: ['a'], dietaryFlags: [] };
    expect(validateRecipe(noName)).toBe(false);
    expect(validateRecipe(emptyName)).toBe(false);
  });

  it('should invalidate recipe with empty or invalid ingredients list', () => {
    const emptyIngs = { id: '1', name: 'Test', ingredients: [], dietaryFlags: [] };
    const badIngType = { id: '1', name: 'Test', ingredients: [123], dietaryFlags: [] };
    expect(validateRecipe(emptyIngs)).toBe(false);
    expect(validateRecipe(badIngType)).toBe(false);
  });

  it('should invalidate recipe with invalid dietary flags', () => {
    const badFlags = { id: '1', name: 'Test', ingredients: ['a'], dietaryFlags: [123] };
    expect(validateRecipe(badFlags)).toBe(false);
  });
});
