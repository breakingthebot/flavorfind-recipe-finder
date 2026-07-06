// src/components/RecipeList.jsx
// Renders a grid of RecipeCards or displays an empty state if no recipes are found.
// Connects to: src/components/RecipeCard.jsx, src/App.jsx
// Created: 2026-07-06

import React from 'react';
import RecipeCard from './RecipeCard.jsx';

/**
 * RecipeList Component.
 * 
 * @param {Object} props - Component properties.
 * @param {Object[]} props.recipes - List of recipes to display.
 * @param {string[]} props.favorites - List of favorited recipe IDs.
 * @param {Function} props.onToggleFav - Callback function to toggle favorite status.
 */
export default function RecipeList({ recipes, favorites, onToggleFav }) {
  if (recipes.length === 0) {
    return (
      <div className="empty-state" id="recipes-empty-state">
        <div className="empty-icon">🍳</div>
        <h3>No Recipes Found</h3>
        <p>Try searching for different ingredients or adjusting your dietary filters.</p>
      </div>
    );
  }

  return (
    <div className="recipe-grid" id="recipes-grid">
      {recipes.map(recipe => (
        <RecipeCard 
          key={recipe.id}
          recipe={recipe}
          isFav={favorites.includes(recipe.id)}
          onToggleFav={onToggleFav}
        />
      ))}
    </div>
  );
}
