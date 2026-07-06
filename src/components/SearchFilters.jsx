// src/components/SearchFilters.jsx
// Handles ingredient search query input, strict matching toggle, and dietary filter selection.
// Connects to: src/App.jsx
// Created: 2026-07-06

import React from 'react';

// Available dietary tags
const DIETARY_OPTIONS = [
  { value: 'vegan', label: '🌱 Vegan' },
  { value: 'vegetarian', label: '🥗 Vegetarian' },
  { value: 'gluten-free', label: '🌾 Gluten-Free' },
  { value: 'keto', label: '🥑 Keto' },
  { value: 'dairy-free', label: '🥛 Dairy-Free' }
];

/**
 * SearchFilters Component.
 * 
 * @param {Object} props - Component properties.
 * @param {string} props.searchQuery - The raw ingredient search string.
 * @param {Function} props.onSearchChange - Callback when search string changes.
 * @param {boolean} props.strictSearch - Whether strict matching is active.
 * @param {Function} props.onStrictChange - Callback when strict matching toggles.
 * @param {string[]} props.activeFilters - List of active dietary filters.
 * @param {Function} props.onFilterToggle - Callback when a filter is toggled.
 */
export default function SearchFilters({
  searchQuery,
  onSearchChange,
  strictSearch,
  onStrictChange,
  activeFilters,
  onFilterToggle
}) {
  return (
    <div className="search-filters-container" id="search-filters-container">
      {/* Search Input Section */}
      <div className="search-input-group">
        <label htmlFor="ingredient-search" className="input-label">
          Search by Ingredients (comma-separated)
        </label>
        <div className="input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            id="ingredient-search"
            placeholder="e.g. avocado, egg, pasta, garlic"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Strict Matching Switch */}
      <div className="match-toggle-group">
        <label className="switch-container">
          <input
            type="checkbox"
            id="strict-match-toggle"
            checked={strictSearch}
            onChange={(e) => onStrictChange(e.target.checked)}
            className="switch-input"
          />
          <span className="switch-slider"></span>
        </label>
        <span className="switch-label">
          Strict Mode (Must match all entered ingredients)
        </span>
      </div>

      {/* Dietary Filters Section */}
      <div className="dietary-filters-group">
        <span className="filters-label">Dietary Filters</span>
        <div className="filters-list" id="dietary-filters-list">
          {DIETARY_OPTIONS.map(opt => {
            const isActive = activeFilters.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                id={`filter-btn-${opt.value}`}
                className={`filter-tag-btn ${isActive ? 'active' : ''}`}
                onClick={() => onFilterToggle(opt.value)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
