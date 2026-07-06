// src/utils/cookModeUtils.js
// Scans instruction text for time duration indicators to trigger active cooking timers.
// Connects to: src/components/CookModeModal.jsx
// Created: 2026-07-06

import { logger } from './logger.js';

/**
 * Scans step text for time indications (e.g. "5 minutes", "6-8 mins", "15 minute")
 * and returns the duration in seconds.
 * 
 * @param {string} stepText - The instruction text for a step.
 * @returns {number|null} The duration in seconds, or null if no duration is found.
 */
export function parseStepTime(stepText) {
  if (!stepText || typeof stepText !== 'string') {
    return null;
  }

  const text = stepText.toLowerCase();

  // Pattern 1: Range match like "6-8 minutes" or "10 to 15 mins"
  const rangeRegex = /(\d+)\s*(?:-|to)\s*(\d+)\s*(?:minutes|mins|minute|min)\b/;
  const rangeMatch = text.match(rangeRegex);
  
  if (rangeMatch) {
    // Return the upper range limit for safety/completion
    const upperLimit = parseInt(rangeMatch[2], 10);
    logger.debug('Extracted time range from step text', { text, upperLimit });
    return upperLimit * 60;
  }

  // Pattern 2: Single duration match like "5 minutes" or "20 mins"
  const singleRegex = /(\d+)\s*(?:minutes|mins|minute|min)\b/;
  const singleMatch = text.match(singleRegex);

  if (singleMatch) {
    const mins = parseInt(singleMatch[1], 10);
    logger.debug('Extracted single duration from step text', { text, mins });
    return mins * 60;
  }

  return null;
}
