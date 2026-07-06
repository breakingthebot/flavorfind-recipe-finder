// src/utils/logger.js
// Provides standard structured logging for the application.
// Connects to: src/services/recipeService.js, src/App.jsx
// Created: 2026-07-06

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// Default log level
const CURRENT_LOG_LEVEL = LOG_LEVELS.DEBUG;

/**
 * Core logging function that handles severity filtering and output.
 * 
 * @param {string} level - Log level ('DEBUG', 'INFO', 'WARN', 'ERROR').
 * @param {string} message - The log message.
 * @param {Object} [context={}] - Key-value metadata context.
 */
function log(level, message, context = {}) {
  if (LOG_LEVELS[level] >= CURRENT_LOG_LEVEL) {
    const timestamp = new Date().toISOString();
    const logString = `[${timestamp}] [${level}] ${message} ${
      Object.keys(context).length ? JSON.stringify(context) : ''
    }`.trim();
    
    if (level === 'ERROR') {
      console.error(logString);
    } else if (level === 'WARN') {
      console.warn(logString);
    } else {
      console.log(logString);
    }
  }
}

export const logger = {
  debug: (msg, ctx) => log('DEBUG', msg, ctx),
  info: (msg, ctx) => log('INFO', msg, ctx),
  warn: (msg, ctx) => log('WARN', msg, ctx),
  error: (msg, ctx) => log('ERROR', msg, ctx)
};
