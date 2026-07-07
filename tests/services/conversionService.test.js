// tests/services/conversionService.test.js
// Tests the metric/imperial unit converter and fuzzy ingredient substitutions database lookup.
// Connects to: src/services/conversionService.js
// Created: 2026-07-06

import { describe, it, expect } from 'vitest';
import { 
  convertMeasurement, 
  getIngredientSubstitution, 
  CONVERSION_GROUPS 
} from '../../src/services/conversionService.js';

describe('conversionService', () => {
  describe('convertMeasurement', () => {
    it('should return same value when converting to same unit', () => {
      const result = convertMeasurement(10, 'g', 'g');
      expect(result).toBe(10);
    });

    it('should convert weights correctly', () => {
      // 100g -> oz (factor 28.3495)
      const toOz = convertMeasurement(100, 'g', 'oz');
      expect(toOz).toBe(3.53);

      // 1 lb -> g (factor 453.592)
      const toG = convertMeasurement(1, 'lb', 'g');
      expect(toG).toBe(453.59);
    });

    it('should convert volumes correctly', () => {
      // 1 cup -> ml (factor 240)
      const toMl = convertMeasurement(1, 'cup', 'ml');
      expect(toMl).toBe(240);

      // 3 tsp -> tbsp (15ml -> 5ml)
      const toTbsp = convertMeasurement(3, 'tsp', 'tbsp');
      expect(toTbsp).toBe(1);
    });

    it('should convert temperatures correctly', () => {
      // 100 C -> F (formula: C * 1.8 + 32)
      const toF = convertMeasurement(100, 'C', 'F');
      expect(toF).toBe(212);

      // 350 F -> C (formula: (F - 32) / 1.8)
      const toC = convertMeasurement(350, 'F', 'C');
      expect(toC).toBe(176.67);
    });

    it('should return null for incompatible units', () => {
      const result = convertMeasurement(50, 'g', 'ml');
      expect(result).toBeNull();
    });

    it('should return null for invalid number inputs', () => {
      const result = convertMeasurement(NaN, 'C', 'F');
      expect(result).toBeNull();
    });
  });

  describe('getIngredientSubstitution', () => {
    it('should return exact match substitution details', () => {
      const sub = getIngredientSubstitution('butter');
      expect(sub).not.toBeNull();
      expect(sub.name).toBe('butter');
      expect(sub.alternatives).toContain('Coconut oil');
    });

    it('should return fuzzy/substring matches', () => {
      const sub = getIngredientSubstitution('organic salted butter');
      expect(sub).not.toBeNull();
      expect(sub.name).toBe('butter');
    });

    it('should return null for unknown ingredients', () => {
      const sub = getIngredientSubstitution('extravagant truffles');
      expect(sub).toBeNull();
    });
  });
});
