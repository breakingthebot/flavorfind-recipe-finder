// tests/utils/portionsScaler.test.js
// Tests portions scaling and formatting operations inside src/utils/portionsScaler.js.
// Connects to: src/utils/portionsScaler.js
// Created: 2026-07-07

import { describe, it, expect } from 'vitest';
import { 
  parseIngredientQuantity, 
  formatQuantityValue, 
  scaleIngredient 
} from '../../src/utils/portionsScaler.js';

describe('portionsScaler - parseIngredientQuantity', () => {
  it('should parse integers correctly', () => {
    expect(parseIngredientQuantity('2 bananas')).toEqual({ value: 2, rest: 'bananas' });
    expect(parseIngredientQuantity(' 12 cloves garlic ')).toEqual({ value: 12, rest: 'cloves garlic' });
  });

  it('should parse decimals correctly', () => {
    expect(parseIngredientQuantity('1.5 cups milk')).toEqual({ value: 1.5, rest: 'cups milk' });
    expect(parseIngredientQuantity('0.75 grams salt')).toEqual({ value: 0.75, rest: 'grams salt' });
  });

  it('should parse fractions correctly', () => {
    expect(parseIngredientQuantity('1/2 tbsp oil')).toEqual({ value: 0.5, rest: 'tbsp oil' });
    expect(parseIngredientQuantity('3/4 cup flour')).toEqual({ value: 0.75, rest: 'cup flour' });
  });

  it('should parse mixed fractions correctly', () => {
    expect(parseIngredientQuantity('1 1/2 tsp salt')).toEqual({ value: 1.5, rest: 'tsp salt' });
    expect(parseIngredientQuantity('2-3/4 pieces')).toEqual({ value: 2.75, rest: 'pieces' });
  });

  it('should return null for ingredients without quantity values', () => {
    expect(parseIngredientQuantity('salt to taste')).toBeNull();
    expect(parseIngredientQuantity('pepper and oregano')).toBeNull();
  });
});

describe('portionsScaler - formatQuantityValue', () => {
  it('should format clean integers', () => {
    expect(formatQuantityValue(3)).toBe('3');
    expect(formatQuantityValue(10.0)).toBe('10');
  });

  it('should format standard fractions', () => {
    expect(formatQuantityValue(0.5)).toBe('1/2');
    expect(formatQuantityValue(1.5)).toBe('1 1/2');
    expect(formatQuantityValue(0.25)).toBe('1/4');
    expect(formatQuantityValue(2.75)).toBe('2 3/4');
    expect(formatQuantityValue(0.33)).toBe('1/3');
    expect(formatQuantityValue(1.67)).toBe('1 2/3');
  });

  it('should fall back to decimals for non-standard fractions', () => {
    expect(formatQuantityValue(1.15)).toBe('1.15');
    expect(formatQuantityValue(0.854)).toBe('0.85');
  });
});

describe('portionsScaler - scaleIngredient', () => {
  it('should return original text if multiplier is 1 or empty', () => {
    expect(scaleIngredient('2 cups flour', 1)).toBe('2 cups flour');
    expect(scaleIngredient('2 cups flour')).toBe('2 cups flour');
  });

  it('should scale ingredients with clean quantities correctly', () => {
    expect(scaleIngredient('2 cups spinach', 0.5)).toBe('1 cups spinach');
    expect(scaleIngredient('1/2 cup milk', 3)).toBe('1 1/2 cup milk');
    expect(scaleIngredient('1.5 g salt', 2)).toBe('3 g salt');
    expect(scaleIngredient('1 1/4 cups sugar', 2)).toBe('2 1/2 cups sugar');
  });

  it('should preserve text for text-only ingredients', () => {
    expect(scaleIngredient('salt to taste', 2)).toBe('salt to taste');
    expect(scaleIngredient('pinch of pepper', 3)).toBe('pinch of pepper');
  });
});
