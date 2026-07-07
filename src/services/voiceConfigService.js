// src/services/voiceConfigService.js
// Manages customizable voice commands mappings and Web Audio alarm chime selections synced to localStorage.
// Connects to: src/components/CookModeModal.jsx
// Created: 2026-07-06

import { logger } from '../utils/logger.js';

const CONFIG_KEY = 'recipe_finder_voice_config';

const DEFAULT_MAPPINGS = {
  next: ['next', 'continue', 'forward', 'avanti'],
  back: ['back', 'previous', 'go back', 'indietro'],
  start: ['start', 'resume', 'go', 'via'],
  stop: ['pause', 'stop', 'hold', 'ferma'],
  reset: ['reset', 'restart', 'ripristina'],
  exit: ['close', 'exit', 'finish', 'esci']
};

const DEFAULT_CHIME = 'chime'; // 'chime', 'beep-beep', 'sweep'

/**
 * Retrieves the user's voice command and chime configuration from localStorage.
 * 
 * @returns {Object} { mappings: Object, chime: string }
 */
export function getVoiceConfig() {
  try {
    const data = localStorage.getItem(CONFIG_KEY);
    const parsed = data ? JSON.parse(data) : {};
    
    const config = {
      mappings: parsed.mappings ? { ...DEFAULT_MAPPINGS, ...parsed.mappings } : { ...DEFAULT_MAPPINGS },
      chime: parsed.chime || DEFAULT_CHIME
    };
    logger.debug('Retrieved voice and chime configuration');
    return config;
  } catch (error) {
    logger.error('Failed to load voice config from localStorage', { error: error.message });
    return {
      mappings: { ...DEFAULT_MAPPINGS },
      chime: DEFAULT_CHIME
    };
  }
}

/**
 * Saves the voice command and chime configuration to localStorage.
 * 
 * @param {Object} config - { mappings: Object, chime: string }
 * @returns {Object} The saved configuration.
 */
export function saveVoiceConfig(config) {
  if (!config || !config.mappings) {
    logger.warn('Failed validation for voice config - missing mappings');
    throw new Error('Invalid voice configuration.');
  }

  // Clean and sanitize command lists (lowercase, trim, non-empty)
  const cleanedMappings = {};
  Object.entries(config.mappings).forEach(([key, list]) => {
    if (Array.isArray(list)) {
      cleanedMappings[key] = list
        .map(p => p.toLowerCase().trim())
        .filter(p => p.length > 0);
    } else {
      cleanedMappings[key] = DEFAULT_MAPPINGS[key] || [];
    }
  });

  const updatedConfig = {
    mappings: cleanedMappings,
    chime: config.chime || DEFAULT_CHIME
  };

  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(updatedConfig));
    logger.info('Saved voice and chime configuration');
    return updatedConfig;
  } catch (error) {
    logger.error('Failed to save voice config to localStorage', { error: error.message });
    throw new Error('Failed to save settings.');
  }
}

/**
 * Checks if a given recognized transcript matches a planned action keyword.
 * 
 * @param {string} transcript - The spoken transcript.
 * @param {string} actionKey - 'next', 'back', 'start', 'stop', 'reset', 'exit'.
 * @param {Object} mappings - The active command mappings.
 * @returns {boolean} True if matching, false otherwise.
 */
export function matchVoiceCommand(transcript, actionKey, mappings) {
  if (!transcript || !actionKey || !mappings) return false;
  
  const normalizedTranscript = transcript.toLowerCase().trim();
  const phrases = mappings[actionKey] || [];
  
  return phrases.some(phrase => normalizedTranscript.includes(phrase));
}
