// tests/services/plannerService.test.js
// Tests the weekly meal planner CRUD and storage sync in src/services/plannerService.js.
// Connects to: src/services/plannerService.js
// Created: 2026-07-06

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getMealPlan, planMeal, unplanMeal, clearMealPlan } from '../../src/services/plannerService.js';

describe('plannerService', () => {
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

  it('should start with an empty weekly schedule containing null slots', () => {
    const plan = getMealPlan();
    expect(plan['monday-breakfast']).toBeNull();
    expect(plan['sunday-dinner']).toBeNull();
  });

  it('should plan a recipe for a slot successfully', () => {
    const updated = planMeal('Monday', 'Breakfast', 'recipe_123');
    expect(updated['monday-breakfast']).toBe('recipe_123');
    expect(getMealPlan()['monday-breakfast']).toBe('recipe_123');
  });

  it('should fail to plan a recipe for an invalid day or meal slot', () => {
    expect(() => planMeal('Funday', 'Breakfast', 'recipe_123')).toThrow();
    expect(() => planMeal('Monday', 'MidnightSnack', 'recipe_123')).toThrow();
  });

  it('should clear a planned slot successfully', () => {
    planMeal('monday', 'lunch', 'recipe_456');
    const updated = unplanMeal('monday', 'lunch');
    expect(updated['monday-lunch']).toBeNull();
    expect(getMealPlan()['monday-lunch']).toBeNull();
  });

  it('should reset the entire weekly plan successfully', () => {
    planMeal('monday', 'breakfast', 'recipe_1');
    planMeal('friday', 'dinner', 'recipe_2');
    
    const cleared = clearMealPlan();
    expect(cleared['monday-breakfast']).toBeNull();
    expect(cleared['friday-dinner']).toBeNull();
    expect(getMealPlan()['monday-breakfast']).toBeNull();
  });
});
