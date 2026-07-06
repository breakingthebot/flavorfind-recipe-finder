// src/components/CookModeModal.jsx
// Fullscreen Cook Mode walkthrough with dynamic step timers, speech recognition commands, and audio chime alerts.
// Connects to: src/components/RecipeCard.jsx, src/utils/cookModeUtils.js, src/utils/logger.js
// Created: 2026-07-06

import React, { useState, useEffect, useRef } from 'react';
import { parseStepTime } from '../utils/cookModeUtils.js';
import { logger } from '../utils/logger.js';

/**
 * CookModeModal Component.
 * 
 * @param {Object} props - Component properties.
 * @param {boolean} props.isOpen - Whether the modal is active.
 * @param {Function} props.onClose - Callback to exit Cook Mode.
 * @param {Object} props.recipe - The active recipe dataset.
 */
export default function CookModeModal({ isOpen, onClose, recipe }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerMax, setTimerMax] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerAlert, setTimerAlert] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  const recognitionRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const steps = recipe ? recipe.instructions : [];
  const currentStep = steps[currentStepIdx] || '';

  // Initialize Speech Recognition support check
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false; // parse step by step
      rec.interimResults = false;
      rec.lang = 'en-US';
      recognitionRef.current = rec;
    }
  }, []);

  // Audio beep and screen flashing alert
  const triggerTimerAlert = useCallback(() => {
    setTimerAlert(true);
    logger.info('Timer finished in Cook Mode', { recipeName: recipe.name, stepIdx: currentStepIdx });
    playBeepChime();
  }, [recipe.name, currentStepIdx]);

  // Parse and setup timers when step changes
  useEffect(() => {
    if (isOpen && currentStep) {
      // Clear previous timer intervals
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setIsTimerRunning(false);
      setTimerAlert(false);

      const seconds = parseStepTime(currentStep);
      if (seconds) {
        setTimeLeft(seconds);
        setTimerMax(seconds);
      } else {
        setTimeLeft(0);
        setTimerMax(0);
      }
    }
  }, [isOpen, currentStepIdx, currentStep]);

  // Timer interval ticking
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            triggerTimerAlert();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning, timeLeft, triggerTimerAlert]);

  const playBeepChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        return;
      }
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.value = 880; // High A chime
      gain.gain.setValueAtTime(1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      logger.warn('Web Audio chime playback failed', { error: e.message });
    }
  };

  const handleNextStep = useCallback(() => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else {
      handleClose();
    }
  }, [currentStepIdx, steps.length, handleClose]);

  const handlePrevStep = useCallback(() => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  }, [currentStepIdx]);

  const handleClose = useCallback(() => {
    setIsListening(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setCurrentStepIdx(0);
    onClose();
  }, [onClose]);

  // Speech context references to keep listeners stable without restarts
  const speechContextRef = useRef({
    handleNextStep,
    handlePrevStep,
    handleClose,
    timerMax,
    setIsTimerRunning,
    setTimeLeft,
    setTimerAlert
  });

  useEffect(() => {
    speechContextRef.current = {
      handleNextStep,
      handlePrevStep,
      handleClose,
      timerMax,
      setIsTimerRunning,
      setTimeLeft,
      setTimerAlert
    };
  }, [handleNextStep, handlePrevStep, handleClose, timerMax]);

  // Manage voice speech recognition loops
  useEffect(() => {
    if (!voiceSupported || !recognitionRef.current) {
      return;
    }
    const rec = recognitionRef.current;

    const handleResult = (e) => {
      const transcript = e.results[0][0].transcript.toLowerCase().trim();
      logger.info('Speech recognized in Cook Mode', { transcript });
      const ctx = speechContextRef.current;

      if (transcript.includes('next') || transcript.includes('continue') || transcript.includes('forward')) {
        ctx.handleNextStep();
      } else if (transcript.includes('back') || transcript.includes('previous') || transcript.includes('go back')) {
        ctx.handlePrevStep();
      } else if (transcript.includes('start') || transcript.includes('resume')) {
        ctx.setIsTimerRunning(true);
      } else if (transcript.includes('pause') || transcript.includes('stop')) {
        ctx.setIsTimerRunning(false);
      } else if (transcript.includes('reset')) {
        ctx.setTimeLeft(ctx.timerMax);
        ctx.setIsTimerRunning(false);
        ctx.setTimerAlert(false);
      } else if (transcript.includes('close') || transcript.includes('exit')) {
        ctx.handleClose();
      }
    };

    const handleEnd = () => {
      if (isListening && isOpen) {
        try {
          rec.start();
        } catch {
          // ignore already started errors
        }
      }
    };

    rec.onresult = handleResult;
    rec.onend = handleEnd;

    if (isListening && isOpen) {
      try {
        rec.start();
        logger.info('Speech recognition listening started');
      } catch (err) {
        logger.warn('Speech recognition start failed', { error: err.message });
      }
    } else {
      try {
        rec.stop();
        logger.info('Speech recognition listening stopped');
      } catch {
        // ignore
      }
    }

    return () => {
      rec.onresult = null;
      rec.onend = null;
      try {
        rec.stop();
      } catch {}
    };
  }, [isListening, isOpen, voiceSupported]);

  if (!isOpen || !recipe) {
    return null;
  }

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = ((currentStepIdx + 1) / steps.length) * 100;

  return (
    <div className={`cook-mode-overlay ${timerAlert ? 'timer-flash-active' : ''}`} id="cook-mode-overlay">
      {/* Header Row */}
      <header className="cook-mode-header">
        <div className="cook-recipe-info">
          <h2>👨‍🍳 Cooking: {recipe.name}</h2>
          <span className="step-counter-badge">Step {currentStepIdx + 1} of {steps.length}</span>
        </div>
        <div className="cook-header-actions">
          {voiceSupported && (
            <button 
              onClick={() => setIsListening(!isListening)} 
              className={`voice-cmd-btn ${isListening ? 'listening' : ''}`}
              title="Toggle Hands-Free Commands ('next', 'back', 'start', 'stop', 'reset')"
              id="voice-commands-toggle"
            >
              <span className="mic-icon">🎙️</span>
              {isListening ? 'Listening...' : 'Hands-Free (Voice)'}
            </button>
          )}
          <button onClick={handleClose} className="exit-cook-btn" id="exit-cook-mode">✕ Exit</button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="cook-progress-bar-container">
        <div className="cook-progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
      </div>

      {/* Main step directions */}
      <main className="cook-step-body">
        <div className="step-instruction-container">
          <p className="step-instruction-text">{currentStep}</p>
        </div>

        {/* Timer Widget */}
        {timerMax > 0 && (
          <div className="cook-timer-widget" id="cook-timer-widget">
            <span className="timer-display">{formatTimer(timeLeft)}</span>
            <div className="timer-controls-row">
              <button 
                onClick={() => setIsTimerRunning(!isTimerRunning)} 
                className={`timer-action-btn ${isTimerRunning ? 'pause' : 'start'}`}
              >
                {isTimerRunning ? '⏸ Pause' : '▶ Start'}
              </button>
              <button 
                onClick={() => {
                  setTimeLeft(timerMax);
                  setIsTimerRunning(false);
                  setTimerAlert(false);
                }} 
                className="timer-action-btn reset"
              >
                🔄 Reset
              </button>
            </div>
            {timerAlert && (
              <div className="timer-alert-badge" onClick={() => setTimerAlert(false)}>
                ⏰ Time's up! Click to dismiss.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Navigation Footer */}
      <footer className="cook-mode-footer">
        <button 
          onClick={handlePrevStep} 
          disabled={currentStepIdx === 0} 
          className="nav-step-btn prev"
          id="cook-prev-step-btn"
        >
          ◀ Previous Step
        </button>

        <div className="step-dots-row">
          {steps.map((_, idx) => (
            <span 
              key={idx} 
              className={`step-dot ${idx === currentStepIdx ? 'active' : ''}`}
              onClick={() => setCurrentStepIdx(idx)}
            ></span>
          ))}
        </div>

        <button 
          onClick={handleNextStep} 
          className="nav-step-btn next"
          id="cook-next-step-btn"
        >
          {currentStepIdx === steps.length - 1 ? '🎉 Done' : 'Next Step ▶'}
        </button>
      </footer>
    </div>
  );
}
