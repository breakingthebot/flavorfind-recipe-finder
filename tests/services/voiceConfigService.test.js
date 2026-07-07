// tests/services/voiceConfigService.test.js
// Tests the customizable voice command mappings and Web Audio alarm chime selections in src/services/voiceConfigService.js.
// Connects to: src/services/voiceConfigService.js
// Created: 2026-07-06

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getVoiceConfig, saveVoiceConfig, matchVoiceCommand } from '../../src/services/voiceConfigService.js';

describe('voiceConfigService', () => {
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

  it('should load default configuration if empty', () => {
    const config = getVoiceConfig();
    expect(config.chime).toBe('chime');
    expect(config.mappings.next).toContain('next');
    expect(config.mappings.exit).toContain('exit');
  });

  it('should sanitize mappings and save config successfully', () => {
    const customConfig = {
      chime: 'beep-beep',
      mappings: {
        next: ['  NEXT STEP  ', '', 'go ahead'],
        back: ['go back'],
        start: ['start'],
        stop: ['stop'],
        reset: ['reset'],
        exit: ['exit']
      }
    };

    const saved = saveVoiceConfig(customConfig);
    expect(saved.chime).toBe('beep-beep');
    expect(saved.mappings.next).toHaveLength(2);
    expect(saved.mappings.next).toContain('next step');
    expect(saved.mappings.next).toContain('go ahead');
    expect(saved.mappings.next).not.toContain('');
  });

  it('should match spoken transcripts against action mappings correctly', () => {
    const mappings = {
      next: ['next step', 'go ahead'],
      back: ['back']
    };

    expect(matchVoiceCommand('please go ahead now', 'next', mappings)).toBe(true);
    expect(matchVoiceCommand('next step', 'next', mappings)).toBe(true);
    expect(matchVoiceCommand('back', 'back', mappings)).toBe(true);
    expect(matchVoiceCommand('forward', 'next', mappings)).toBe(false);
  });
});
