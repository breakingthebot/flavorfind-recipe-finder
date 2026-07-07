// src/components/RecipeCard.jsx
// Displays an individual recipe card with details, dietary tags, and favorite toggling.
// Connects to: src/services/recipeService.js, src/components/RecipeList.jsx
// Created: 2026-07-06

import React, { useState } from 'react';

/**
 * RecipeCard Component.
 * 
 * @param {Object} props - Component properties.
 * @param {Object} props.recipe - The recipe data object.
 * @param {boolean} props.isFav - Whether the recipe is in the favorites list.
 * @param {Function} props.onToggleFav - Callback function to toggle favorite status.
 * @param {Function} [props.onDelete] - Callback function to delete a custom recipe.
 */
export default function RecipeCard({ recipe, isFav, onToggleFav, onDelete, onCook }) {
  const [showInstructions, setShowInstructions] = useState(false);

  const getDifficultyClass = (diff) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'diff-easy';
      case 'medium': return 'diff-medium';
      case 'hard': return 'diff-hard';
      default: return '';
    }
  };

  const isCustom = recipe.id && String(recipe.id).startsWith('custom_');

  return (
    <div 
      className="recipe-card" 
      id={`recipe-card-${recipe.id}`}
      draggable="true"
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', recipe.id);
        e.dataTransfer.effectAllowed = 'copy';
      }}
    >
      <div className="recipe-image-container">
        <img src={recipe.imageUrl} alt={recipe.name} className="recipe-image" loading="lazy" />
        <div className="recipe-image-overlay"></div>
        
        {isCustom && onDelete && (
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${recipe.name}"?`)) {
                onDelete(recipe.id);
              }
            }}
            className="delete-recipe-btn"
            title="Delete custom recipe"
            aria-label="Delete recipe"
          >
            🗑️
          </button>
        )}

        <button 
          onClick={() => onToggleFav(recipe.id)} 
          className={`favorite-btn ${isFav ? 'active' : ''}`}
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          id={`fav-btn-${recipe.id}`}
        >
          <svg viewBox="0 0 24 24" className="heart-icon">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
      </div>

      <div className="recipe-content">
        <div className="recipe-header-row">
          <span className={`difficulty-tag ${getDifficultyClass(recipe.difficulty)}`}>
            {recipe.difficulty}
          </span>
          <span className="prep-time-tag">
            ⏱️ {recipe.prepTime} mins
          </span>
        </div>

        <h3 className="recipe-title">{recipe.name}</h3>
        <p className="recipe-description">{recipe.description}</p>

        <div className="recipe-tags-section">
          {recipe.dietaryFlags.map(flag => (
            <span key={flag} className="dietary-tag">
              {flag}
            </span>
          ))}
        </div>

        {recipe.matchingExpiringItems && recipe.matchingExpiringItems.length > 0 && (
          <div className="recipe-expiring-warning-container" id={`expiring-container-${recipe.id}`}>
            {recipe.matchingExpiringItems.map(({ item, status }) => (
              <div 
                key={item.id} 
                className={`recipe-expiring-warning-badge ${status.isExpired ? 'expired' : 'warning'}`}
              >
                {status.isExpired 
                  ? `🚨 Uses expired: ${item.name}` 
                  : `⚠️ Uses expiring: ${item.name} (${status.daysLeft}d left)`
                }
              </div>
            ))}
          </div>
        )}

        <div className="recipe-ingredients-section">
          <h4>Ingredients:</h4>
          <ul className="recipe-ingredients-list">
            {recipe.ingredients.map((ing, idx) => (
              <li key={idx} className="recipe-ingredient-item">
                <span className="bullet"></span> {ing}
              </li>
            ))}
          </ul>
        </div>

        <div className="recipe-actions-row">
          <button 
            className={`toggle-instructions-btn ${showInstructions ? 'active' : ''}`}
            onClick={() => setShowInstructions(!showInstructions)}
            id={`toggle-instructions-${recipe.id}`}
          >
            {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
          </button>
          
          <button
            className="start-cooking-btn"
            onClick={() => onCook && onCook(recipe)}
            id={`start-cooking-${recipe.id}`}
          >
            👨‍🍳 Cook Mode
          </button>
        </div>

        {showInstructions && (
          <div className="recipe-instructions-section">
            <h4>Instructions:</h4>
            <ol className="recipe-instructions-list">
              {recipe.instructions.map((step, idx) => (
                <li key={idx} className="recipe-instruction-step">
                  <span className="step-num">{idx + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
