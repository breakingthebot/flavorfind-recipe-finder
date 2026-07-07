// tests/services/speechSynthesisService.test.js
// Tests the speech synthesis configurations CRUD operations and speech trigger bindings.
// Connects to: src/services/speechSynthesisService.js
// Created: 2026-07-06

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getTtsConfig, 
  saveTtsConfig, 
  speakText, 
  stopSpeaking 
} from '../../src/services/speechSynthesisService.js';

describe('speechSynthesisService', () => {
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

    // Stub global speech synthesis variables
    const mockSpeechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: vi.fn(() => [
        { name: 'Google US English', lang: 'en-US' },
        { name: 'Google UK English Female', lang: 'en-GB' }
      ])
    };

    vi.stubGlobal('speechSynthesis', mockSpeechSynthesis);
    vi.stubGlobal('window', {
      speechSynthesis: mockSpeechSynthesis,
      localStorage: localStorageMock
    });

    // Mock global SpeechSynthesisUtterance constructor
    vi.stubGlobal('SpeechSynthesisUtterance', vi.fn(function(text) {
      this.text = text;
      this.rate = 1.0;
      this.pitch = 1.0;
      this.voice = null;
    }));
  });

  it('should return default config parameters when empty', () => {
    const config = getTtsConfig();
    expect(config.enabled).toBe(true);
    expect(config.rate).toBe(1.0);
    expect(config.pitch).toBe(1.0);
  });

  it('should sanitize config options and save successfully', () => {
    const raw = {
      enabled: false,
      voiceName: 'Test Voice',
      rate: 3.5, // should clamp to 2.0
      pitch: 0.1 // should clamp to 0.5
    };

    const saved = saveTtsConfig(raw);
    expect(saved.enabled).toBe(false);
    expect(saved.rate).toBe(2.0);
    expect(saved.pitch).toBe(0.5);

    const loaded = getTtsConfig();
    expect(loaded.enabled).toBe(false);
    expect(loaded.rate).toBe(2.0);
  });

  it('should invoke speech synthesis speak driver when enabled', () => {
    speakText('Hello Chef');
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });

  it('should not speak when config is disabled', () => {
    saveTtsConfig({ enabled: false });
    speakText('Hello Chef');
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
  });

  it('should cancel active speak channels on stopSpeaking', () => {
    stopSpeaking();
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
  });
});
