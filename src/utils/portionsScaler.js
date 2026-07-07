// src/utils/portionsScaler.js
// Parses and scales ingredient quantity strings dynamically.
// Connects to: src/components/RecipeCard.jsx, src/components/CookModeModal.jsx
// Created: 2026-07-07

import { logger } from './logger.js';

/**
 * Parses a numeric value from the beginning of an ingredient string.
 * Supports integers, decimals, and mixed fractions (e.g., "1/2", "1 3/4").
 * Returns { value: number, rest: string } or null if no number is found.
 */
export function parseIngredientQuantity(ingStr) {
  if (!ingStr) return null;
  const str = ingStr.trim();

  // 1. Match mixed fraction / fraction first, e.g., "1 1/2" or "1/2" or "1-1/2"
  const fractionRegex = /^(\d+)?[\s-]?(\d+)\/(\d+)(.*)$/;
  const fracMatch = str.match(fractionRegex);
  if (fracMatch) {
    const whole = fracMatch[1] ? parseInt(fracMatch[1], 10) : 0;
    const num = parseInt(fracMatch[2], 10);
    const den = parseInt(fracMatch[3], 10);
    const rest = fracMatch[4];
    if (den !== 0) {
      const val = whole + (num / den);
      return { value: val, rest: rest.trim() };
    }
  }

  // 2. Match decimal or integer, e.g., "1.5" or "2" or "0.75"
  const decimalRegex = /^(\d+(?:\.\d+)?)(.*)$/;
  const decMatch = str.match(decimalRegex);
  if (decMatch) {
    const val = parseFloat(decMatch[1]);
    const rest = decMatch[2];
    return { value: val, rest: rest.trim() };
  }

  return null;
}

/**
 * Converts a decimal number back to a fraction string if close to standard values,
 * otherwise returns a rounded decimal string.
 */
export function formatQuantityValue(val) {
  if (val <= 0) return '';
  
  const eps = 0.01;
  const whole = Math.floor(val);
  const frac = val - whole;
  
  let fracStr = '';
  if (Math.abs(frac - 0) < eps) {
    fracStr = '';
  } else if (Math.abs(frac - 0.25) < eps) {
    fracStr = '1/4';
  } else if (Math.abs(frac - 0.333) < eps || Math.abs(frac - 0.33) < eps) {
    fracStr = '1/3';
  } else if (Math.abs(frac - 0.5) < eps) {
    fracStr = '1/2';
  } else if (Math.abs(frac - 0.666) < eps || Math.abs(frac - 0.67) < eps) {
    fracStr = '2/3';
  } else if (Math.abs(frac - 0.75) < eps) {
    fracStr = '3/4';
  } else {
    const decVal = parseFloat(val.toFixed(2));
    return decVal.toString();
  }

  if (whole > 0) {
    return fracStr ? `${whole} ${fracStr}` : `${whole}`;
  }
  return fracStr;
}

/**
 * Scales the portion quantity of a single ingredient string by a multiplier factor.
 * Returns the scaled ingredient string.
 */
export function scaleIngredient(ingStr, multiplier) {
  if (multiplier === 1 || !multiplier) return ingStr;
  
  const parsed = parseIngredientQuantity(ingStr);
  if (!parsed) {
    return ingStr;
  }

  const scaledVal = parsed.value * multiplier;
  const formattedVal = formatQuantityValue(scaledVal);
  return `${formattedVal} ${parsed.rest}`.trim();
}
