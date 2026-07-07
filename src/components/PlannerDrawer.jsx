// src/components/PlannerDrawer.jsx
// Sliding weekly calendar drawer supporting drag-and-drop recipe planning, fallbacks, and shopping list compile.
// Connects to: src/App.jsx, src/services/plannerService.js, src/components/FavoritesList.jsx
// Created: 2026-07-06

import React from 'react';

const DAYS = [
  { id: 'monday', label: '📅 Monday' },
  { id: 'tuesday', label: '📅 Tuesday' },
  { id: 'wednesday', label: '📅 Wednesday' },
  { id: 'thursday', label: '📅 Thursday' },
  { id: 'friday', label: '📅 Friday' },
  { id: 'saturday', label: '📅 Saturday' },
  { id: 'sunday', label: '📅 Sunday' }
];

const MEALS = [
  { id: 'breakfast', label: '🌅 Breakfast' },
  { id: 'lunch', label: '☀️ Lunch' },
  { id: 'dinner', label: '🌙 Dinner' }
];

/**
 * PlannerDrawer Component.
 * 
 * @param {Object} props - Component properties.
 * @param {boolean} props.isOpen - Whether the drawer is visible.
 * @param {Function} props.onClose - Callback to close the drawer.
 * @param {Object[]} props.recipes - All recipes (custom + mock) for lookup.
 * @param {string[]} props.favorites - List of favorited recipe IDs.
 * @param {Object} props.mealPlan - The current weekly plan mapping slot keys to recipe IDs.
 * @param {Function} props.onPlanMeal - Callback to assign a recipe to a slot.
 * @param {Function} props.onUnplanMeal - Callback to clear a slot.
 * @param {Function} props.onClearPlan - Callback to reset all weekly slots.
 * @param {Function} props.onGenerateShoppingList - Callback to compile shopping list for all planned meals.
 */
export default function PlannerDrawer({
  isOpen,
  onClose,
  recipes,
  favorites,
  mealPlan,
  onPlanMeal,
  onUnplanMeal,
  onClearPlan,
  onGenerateShoppingList
}) {
  const favoriteRecipes = recipes.filter(r => favorites.includes(r.id));

  // Count how many slots are filled
  const plannedRecipeIds = Object.values(mealPlan).filter(Boolean);
  const plannedCount = plannedRecipeIds.length;

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, day, meal) => {
    e.preventDefault();
    const recipeId = e.dataTransfer.getData('text/plain');
    if (recipeId) {
      onPlanMeal(day, meal, recipeId);
    }
  };

  const handleCompileList = () => {
    if (plannedCount === 0) return;
    onGenerateShoppingList(plannedRecipeIds);
  };

  return (
    <div className={`favorites-sidebar ${isOpen ? 'open' : ''}`} id="planner-drawer">
      {/* Header */}
      <div className="favorites-header">
        <h3>📅 Meal Planner ({plannedCount} slots)</h3>
        <button onClick={onClose} className="close-sidebar-btn" aria-label="Close drawer">✕</button>
      </div>

      {/* Action Buttons */}
      <div className="favorites-actions-row">
        {plannedCount > 0 && (
          <>
            <button 
              onClick={onClearPlan} 
              className="bulk-action-btn clear-all-btn"
              style={{ color: '#ef4444' }}
              id="clear-meal-plan-btn"
            >
              🔄 Reset Week
            </button>
            <button 
              onClick={handleCompileList} 
              className="bulk-action-btn generate-plan-list-btn"
              id="compile-planner-list-btn"
            >
              🛍️ Compile Shopping List
            </button>
          </>
        )}
      </div>

      {/* Calendar Scrolling Content */}
      <div className="favorites-content planner-scroll-container">
        <p className="planner-helper-text">
          💡 Drag recipes from cards/favorites and drop them into the slots below, or select from the dropdown.
        </p>

        <div className="planner-days-list">
          {DAYS.map(day => (
            <div key={day.id} className="planner-day-section" id={`planner-day-${day.id}`}>
              <h4>{day.label}</h4>
              <div className="planner-day-meals">
                {MEALS.map(meal => {
                  const slotKey = `${day.id}-${meal.id}`;
                  const recipeId = mealPlan[slotKey];
                  const plannedRecipe = recipeId ? recipes.find(r => r.id === recipeId) : null;

                  return (
                    <div 
                      key={meal.id} 
                      className={`planner-meal-slot ${plannedRecipe ? 'filled' : 'empty'}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day.id, meal.id)}
                      id={`slot-${slotKey}`}
                    >
                      <span className="meal-type-label">{meal.label}</span>

                      {plannedRecipe ? (
                        <div className="planned-meal-card">
                          <img 
                            src={plannedRecipe.imageUrl} 
                            alt={plannedRecipe.name} 
                            className="planned-meal-thumb" 
                          />
                          <div className="planned-meal-info">
                            <span className="planned-meal-name" title={plannedRecipe.name}>
                              {plannedRecipe.name}
                            </span>
                          </div>
                          <button 
                            onClick={() => onUnplanMeal(day.id, meal.id)}
                            className="unplan-slot-btn"
                            title="Remove meal"
                            aria-label="Remove meal"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="empty-slot-placeholder">
                          <span className="drop-target-hint">Drop recipe here or:</span>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                onPlanMeal(day.id, meal.id, e.target.value);
                                e.target.value = ''; // reset select
                              }
                            }}
                            className="planner-dropdown-select"
                            defaultValue=""
                            aria-label={`Select recipe for ${day.label} ${meal.label}`}
                          >
                            <option value="" disabled>Choose favorite...</option>
                            {favoriteRecipes.map(fav => (
                              <option key={fav.id} value={fav.id}>
                                {fav.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
