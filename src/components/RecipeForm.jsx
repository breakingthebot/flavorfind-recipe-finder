// src/components/RecipeForm.jsx
// Interactive form modal to add custom recipes with dynamic field additions and real-time validations.
// Connects to: src/App.jsx, src/services/recipeService.js
// Created: 2026-07-06

import React, { useState } from 'react';

/**
 * RecipeForm Component.
 * 
 * @param {Object} props - Component properties.
 * @param {Function} props.onSubmit - Callback when form is successfully submitted.
 * @param {Function} props.onClose - Callback to close the modal.
 * @param {boolean} props.isOpen - Whether the modal is visible.
 */
export default function RecipeForm({ onSubmit, onClose, isOpen }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState(15);
  const [difficulty, setDifficulty] = useState('Easy');
  const [dietaryFlags, setDietaryFlags] = useState([]);
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState(['']);
  const [imageUrl, setImageUrl] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleDietaryToggle = (flag) => {
    setDietaryFlags(prev =>
      prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]
    );
  };

  const handleAddIngredient = () => setIngredients([...ingredients, '']);
  const handleRemoveIngredient = (idx) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== idx));
    }
  };
  const handleIngredientChange = (idx, value) => {
    const updated = [...ingredients];
    updated[idx] = value;
    setIngredients(updated);
  };

  const handleAddInstruction = () => setInstructions([...instructions, '']);
  const handleRemoveInstruction = (idx) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== idx));
    }
  };
  const handleInstructionChange = (idx, value) => {
    const updated = [...instructions];
    updated[idx] = value;
    setInstructions(updated);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Recipe title is required.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    if (!prepTime || Number(prepTime) <= 0) newErrors.prepTime = 'Preparation time must be greater than 0.';
    
    const validIngs = ingredients.filter(i => i.trim().length > 0);
    if (validIngs.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required.';
    }

    const validSteps = instructions.filter(s => s.trim().length > 0);
    if (validSteps.length === 0) {
      newErrors.instructions = 'At least one instruction step is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const recipeData = {
      name: name.trim(),
      description: description.trim(),
      prepTime: Number(prepTime),
      difficulty,
      dietaryFlags,
      ingredients: ingredients.filter(i => i.trim().length > 0),
      instructions: instructions.filter(s => s.trim().length > 0),
      imageUrl: imageUrl.trim()
    };

    onSubmit(recipeData);
    
    // Reset state
    setName('');
    setDescription('');
    setPrepTime(15);
    setDifficulty('Easy');
    setDietaryFlags([]);
    setIngredients(['']);
    setInstructions(['']);
    setImageUrl('');
    setErrors({});
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="recipe-form-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>➕ Add Custom Recipe</h3>
          <button onClick={onClose} className="close-modal-btn" aria-label="Close modal">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="recipe-form">
          {/* Recipe Name */}
          <div className="form-group">
            <label htmlFor="form-recipe-name">Recipe Title *</label>
            <input
              type="text"
              id="form-recipe-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grandma's Apple Pie"
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="form-recipe-desc">Short Description *</label>
            <textarea
              id="form-recipe-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe your delicious recipe..."
              rows={2}
              className={errors.description ? 'input-error' : ''}
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-row">
            {/* Prep Time */}
            <div className="form-group">
              <label htmlFor="form-recipe-time">Prep Time (mins) *</label>
              <input
                type="number"
                id="form-recipe-time"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                min={1}
                className={errors.prepTime ? 'input-error' : ''}
              />
              {errors.prepTime && <span className="error-text">{errors.prepTime}</span>}
            </div>

            {/* Difficulty */}
            <div className="form-group">
              <label htmlFor="form-recipe-difficulty">Difficulty</label>
              <select
                id="form-recipe-difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Image URL */}
          <div className="form-group">
            <label htmlFor="form-recipe-image">Image URL (optional)</label>
            <input
              type="url"
              id="form-recipe-image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          {/* Dietary Flags */}
          <div className="form-group">
            <label>Dietary Restrictions</label>
            <div className="dietary-checkboxes-grid">
              {['vegan', 'vegetarian', 'gluten-free', 'keto', 'dairy-free'].map(flag => {
                const isActive = dietaryFlags.includes(flag);
                return (
                  <button
                    key={flag}
                    type="button"
                    onClick={() => handleDietaryToggle(flag)}
                    className={`diet-checkbox-btn ${isActive ? 'active' : ''}`}
                  >
                    {flag.replace('-', ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ingredients list */}
          <div className="form-group">
            <label>Ingredients *</label>
            {errors.ingredients && <span className="error-text block-error">{errors.ingredients}</span>}
            <div className="dynamic-list">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="dynamic-list-row">
                  <input
                    type="text"
                    value={ing}
                    onChange={(e) => handleIngredientChange(idx, e.target.value)}
                    placeholder={`Ingredient #${idx + 1}`}
                    className="dynamic-input"
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="remove-row-btn"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddIngredient}
                className="add-row-btn"
              >
                ➕ Add Ingredient
              </button>
            </div>
          </div>

          {/* Instructions list */}
          <div className="form-group">
            <label>Instructions / Steps *</label>
            {errors.instructions && <span className="error-text block-error">{errors.instructions}</span>}
            <div className="dynamic-list">
              {instructions.map((step, idx) => (
                <div key={idx} className="dynamic-list-row">
                  <span className="step-row-num">{idx + 1}</span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => handleInstructionChange(idx, e.target.value)}
                    placeholder={`Step #${idx + 1}`}
                    className="dynamic-input"
                  />
                  {instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveInstruction(idx)}
                      className="remove-row-btn"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddInstruction}
                className="add-row-btn"
              >
                ➕ Add Step
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            <button type="submit" className="submit-btn" id="submit-recipe-form">Save Recipe</button>
          </div>
        </form>
      </div>
    </div>
  );
}
