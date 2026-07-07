// src/services/speechSynthesisService.js
// Manages Web Speech API SpeechSynthesis configuration and step text-to-speech (TTS) playbacks.
// Connects to: src/components/CookModeModal.jsx
// Created: 2026-07-06

import { logger } from '../utils/logger.js';

const STORAGE_KEY = 'recipe_finder_tts_config';

const DEFAULT_CONFIG = {
  enabled: true,
  voiceName: '',
  rate: 1.0,
  pitch: 1.0
};

/**
 * Loads the current text-to-speech config from localStorage.
 * 
 * @returns {Object} Config object.
 */
export function getTtsConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(raw);
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_CONFIG.enabled,
      voiceName: typeof parsed.voiceName === 'string' ? parsed.voiceName : DEFAULT_CONFIG.voiceName,
      rate: typeof parsed.rate === 'number' ? parsed.rate : DEFAULT_CONFIG.rate,
      pitch: typeof parsed.pitch === 'number' ? parsed.pitch : DEFAULT_CONFIG.pitch
    };
  } catch (e) {
    logger.warn('Failed to parse TTS config, returning defaults', { error: e.message });
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Saves TTS configuration settings to localStorage.
 * 
 * @param {Object} config - Config details.
 * @returns {Object} Saved details.
 */
export function saveTtsConfig(config) {
  if (!config) throw new Error('Cannot save empty TTS config');

  const rate = Math.max(0.5, Math.min(2.0, Number(config.rate) || 1.0));
  const pitch = Math.max(0.5, Math.min(2.0, Number(config.pitch) || 1.0));

  const clean = {
    enabled: !!config.enabled,
    voiceName: String(config.voiceName || '').trim(),
    rate,
    pitch
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  logger.info('Saved TTS configuration settings to localStorage', clean);
  return clean;
}

/**
 * Speaks a step text aloud, canceling any active speech.
 * 
 * @param {string} text - The directions content to read.
 * @param {Object} config - Config object (enabled, rate, pitch, voiceName).
 */
export function speakText(text, config = {}) {
  const synth = window.speechSynthesis;
  if (!synth) {
    logger.warn('Speech synthesis not supported in this browser environment');
    return;
  }

  // Cancel any ongoing speak queues immediately
  synth.cancel();

  const activeConfig = { ...DEFAULT_CONFIG, ...getTtsConfig(), ...config };
  if (!activeConfig.enabled || !text) return;

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = activeConfig.rate;
    utterance.pitch = activeConfig.pitch;

    // Retrieve and match requested voice
    if (activeConfig.voiceName) {
      const voices = synth.getVoices() || [];
      const matched = voices.find(v => v.name === activeConfig.voiceName);
      if (matched) {
        utterance.voice = matched;
      }
    }

    synth.speak(utterance);
    logger.debug('Triggered step narration', { text, rate: utterance.rate, pitch: utterance.pitch });
  } catch (err) {
    logger.error('Failed to trigger speech synthesis', { error: err.message });
  }
}

/**
 * Halts any currently playing speech.
 */
export function stopSpeaking() {
  const synth = window.speechSynthesis;
  if (synth) {
    synth.cancel();
    logger.debug('Narrator speech cancelled');
  }
}
