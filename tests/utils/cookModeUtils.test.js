// tests/utils/cookModeUtils.test.js
// Tests the step duration parsing logic in src/utils/cookModeUtils.js.
// Connects to: src/utils/cookModeUtils.js
// Created: 2026-07-06

import { describe, it, expect } from 'vitest';
import { parseStepTime } from '../../src/utils/cookModeUtils.js';

describe('cookModeUtils - parseStepTime', () => {
  it('should parse single durations correctly', () => {
    expect(parseStepTime('Simmer for 5 minutes.')).toBe(300);
    expect(parseStepTime('Boil pasta for 10 mins')).toBe(600);
    expect(parseStepTime('Rest for 1 min in the bowl')).toBe(60);
  });

  it('should parse range durations (returning upper limit) correctly', () => {
    expect(parseStepTime('Grill the chicken for 6-8 minutes.')).toBe(480);
    expect(parseStepTime('Let sit for 10 to 15 mins before slicing')).toBe(900);
  });

  it('should return null if no duration is found in text', () => {
    expect(parseStepTime('Sourdough toast topped with avocado.')).toBeNull();
    expect(parseStepTime('Mix garlic and oil together.')).toBeNull();
  });

  it('should handle edge cases and invalid input types gracefully', () => {
    expect(parseStepTime(null)).toBeNull();
    expect(parseStepTime(undefined)).toBeNull();
    expect(parseStepTime(123)).toBeNull();
    expect(parseStepTime('')).toBeNull();
  });
});
