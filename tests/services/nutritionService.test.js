// tests/services/nutritionService.test.js
// Tests the recipe macronutrients compiler service in src/services/nutritionService.js.
// Connects to: src/services/nutritionService.js
// Created: 2026-07-07

import { describe, it, expect } from 'vitest';
import { estimateRecipeNutrition } from '../../src/services/nutritionService.js';

describe('nutritionService - estimateRecipeNutrition', () => {
  it('should return zeros for empty or invalid ingredients lists', () => {
    const empty = estimateRecipeNutrition([]);
    expect(empty).toEqual({ kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 });
    
    const invalid = estimateRecipeNutrition(null);
    expect(invalid).toEqual({ kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 });
  });

  it('should compile nutrients based on known database terms', () => {
    // 2 avocados (2 * 150g = 300g). Avocado per 100g: 160 kcal, 2g protein, 9g carbs, 15g fat, 7g fiber, 7mg sodium.
    // Total: 480 kcal, 6g protein, 27g carbs, 45g fat, 21g fiber, 21mg sodium.
    // Divided by default 2 servings (portionsScale = 1) -> factor = 0.5.
    // Expected per serving: 240 kcal, 3g protein, 14g carbs, 23g fat, 11g fiber, 11mg sodium.
    const result = estimateRecipeNutrition(['2 avocado'], 2, 1);
    expect(result.kcal).toBe(240);
    expect(result.protein).toBe(3);
    expect(result.carbs).toBe(14);
    expect(result.fat).toBe(23);
    expect(result.fiber).toBe(11);
    expect(result.sodium).toBe(11);
  });

  it('should scale reactively with portions scale multipliers', () => {
    const scale1 = estimateRecipeNutrition(['2 eggs'], 2, 1);
    const scale2 = estimateRecipeNutrition(['2 eggs'], 2, 2);
    
    expect(scale1.kcal).toBe(72);
    expect(scale1.protein).toBe(6);
    expect(scale2.kcal).toBe(143);
    expect(scale2.protein).toBe(13);
  });

  it('should fall back gracefully to default guesses for unlisted items', () => {
    // "exotic space spice" is unlisted. Defaults to 50 kcal, 1g protein, 8g carbs, 0.5g fat, 1g fiber, 10mg sodium per 100g.
    // 100g of space spice -> per serving (factor = 0.5) -> 25 kcal, 1g protein, 4g carbs, 0g fat, 1g fiber, 5mg sodium.
    const result = estimateRecipeNutrition(['100g exotic space spice'], 2, 1);
    expect(result.kcal).toBe(25);
    expect(result.protein).toBe(1);
    expect(result.carbs).toBe(4);
  });
});
