// src/components/FavoritesList.jsx
// Renders a sidebar drawer of favorite recipes with selection capabilities to compile a shopping list.
// Connects to: src/App.jsx, src/services/recipeService.js
// Created: 2026-07-06

import React from 'react';

/**
 * FavoritesList Component.
 * 
 * @param {Object} props - Component properties.
 * @param {Object[]} props.recipes - All recipes.
 * @param {string[]} props.favorites - List of favorited recipe IDs.
 * @param {Function} props.onToggleFav - Callback function to toggle favorite status.
 * @param {boolean} props.isOpen - Whether the sidebar drawer is open.
 * @param {Function} props.onClose - Callback to close the sidebar drawer.
 * @param {string[]} props.selectedItems - List of recipe IDs selected for the shopping list.
 * @param {Function} props.onToggleSelect - Callback when selection is toggled for an ID.
 * @param {Function} props.onGenerateList - Callback to trigger shopping list compilation.
 */
export default function FavoritesList({ 
  recipes, 
  favorites, 
  onToggleFav, 
  isOpen, 
  onClose,
  selectedItems,
  onToggleSelect,
  onGenerateList
}) {
  const favoriteRecipes = recipes.filter(r => favorites.includes(r.id));

  const handleScrollToRecipe = (id) => {
    const el = document.getElementById(`recipe-card-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('highlight-flash');
      setTimeout(() => {
        el.classList.remove('highlight-flash');
      }, 1500);
      onClose();
    }
  };

  const handleSelectAll = () => {
    favoriteRecipes.forEach(r => {
      if (!selectedItems.includes(r.id)) {
        onToggleSelect(r.id);
      }
    });
  };

  const handleDeselectAll = () => {
    favoriteRecipes.forEach(r => {
      if (selectedItems.includes(r.id)) {
        onToggleSelect(r.id);
      }
    });
  };

  return (
    <div className={`favorites-sidebar ${isOpen ? 'open' : ''}`} id="favorites-sidebar">
      <div className="favorites-header">
        <h3>❤️ Saved Favorites ({favoriteRecipes.length})</h3>
        <button onClick={onClose} className="close-sidebar-btn" aria-label="Close sidebar">✕</button>
      </div>

      {favoriteRecipes.length > 0 && (
        <div className="favorites-actions-row">
          <button onClick={handleSelectAll} className="bulk-action-btn">Select All</button>
          <button onClick={handleDeselectAll} className="bulk-action-btn">Clear All</button>
        </div>
      )}

      <div className="favorites-content">
        {favoriteRecipes.length === 0 ? (
          <div className="favorites-empty">
            <span className="empty-heart">🤍</span>
            <p>No favorites saved yet.</p>
            <p className="empty-subtext">Click the heart icon on any recipe to save it here.</p>
          </div>
        ) : (
          <ul className="favorites-items-list">
            {favoriteRecipes.map(recipe => {
              const isSelected = selectedItems.includes(recipe.id);
              return (
                <li 
                  key={recipe.id} 
                  className="favorite-item-card" 
                  id={`fav-item-${recipe.id}`}
                  draggable="true"
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', recipe.id);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                >
                  <label className="checkbox-container">
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => onToggleSelect(recipe.id)}
                      className="fav-select-checkbox"
                    />
                    <span className="checkbox-checkmark"></span>
                  </label>
                  
                  <img 
                    src={recipe.imageUrl} 
                    alt={recipe.name} 
                    className="fav-item-image" 
                    onClick={() => handleScrollToRecipe(recipe.id)}
                    style={{ cursor: 'pointer' }}
                  />
                  <div 
                    className="fav-item-details" 
                    onClick={() => handleScrollToRecipe(recipe.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="fav-item-name">{recipe.name}</span>
                    <span className="fav-item-meta">⏱️ {recipe.prepTime} mins | {recipe.difficulty}</span>
                  </div>
                  <button 
                    onClick={() => onToggleFav(recipe.id)} 
                    className="remove-fav-btn"
                    title="Remove from favorites"
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {favoriteRecipes.length > 0 && (
        <div className="favorites-footer">
          <button 
            onClick={onGenerateList} 
            disabled={selectedItems.length === 0}
            className="generate-list-btn"
            id="generate-shopping-list-btn"
          >
            📋 Generate Shopping List ({selectedItems.length})
          </button>
        </div>
      )}
    </div>
  );
}
