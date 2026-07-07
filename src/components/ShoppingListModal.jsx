// src/components/ShoppingListModal.jsx
// Renders the consolidated categorized ingredients list with checkboxes, printing, and clipboard copying.
// Connects to: src/App.jsx, src/utils/shoppingListUtils.js
// Created: 2026-07-06

import React, { useState, useEffect } from 'react';
import { 
  consolidateIngredients,
  getCustomCategories,
  saveCustomCategories,
  getCustomCategoryMappings,
  saveCustomCategoryMappings
} from '../utils/shoppingListUtils.js';

/**
 * ShoppingListModal Component.
 * 
 * @param {Object} props - Component properties.
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {Function} props.onClose - Callback to close the modal.
 * @param {Object[]} props.selectedRecipes - Array of selected recipes to compile ingredients from.
 * @param {Function} props.onCopySuccess - Callback to display toast logs upon clipboard success.
 */
export default function ShoppingListModal({ isOpen, onClose, selectedRecipes, onCopySuccess }) {
  const [checkedItems, setCheckedItems] = useState({});
  const [listData, setListData] = useState({});

  // Custom Category Sorters States
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [customCats, setCustomCats] = useState([]);
  const [customMaps, setCustomMaps] = useState({});
  const [newCatName, setNewCatName] = useState('');
  const [newMappingIng, setNewMappingIng] = useState('');
  const [newMappingCat, setNewMappingCat] = useState('PRODUCE');

  // Load custom configuration when modal opens
  useEffect(() => {
    if (isOpen) {
      setCustomCats(getCustomCategories());
      setCustomMaps(getCustomCategoryMappings());
    }
  }, [isOpen]);

  // Handle adding custom category
  const handleAddCategory = () => {
    const nameClean = newCatName.trim().toUpperCase();
    if (!nameClean) return;
    const defaults = ['PRODUCE', 'MEAT SEAFOOD', 'DAIRY ALTERNATES', 'BAKERY', 'PANTRY', 'SPICES BAKING', 'OTHER'];
    if (defaults.includes(nameClean) || customCats.includes(nameClean)) {
      alert('Category already exists.');
      return;
    }
    const updated = [...customCats, nameClean];
    setCustomCats(updated);
    saveCustomCategories(updated);
    setNewCatName('');
    setNewMappingCat(nameClean);
    
    // Refresh list data
    setListData(consolidateIngredients(selectedRecipes));
  };

  // Handle deleting custom category
  const handleDeleteCategory = (cat) => {
    const updatedCats = customCats.filter(c => c !== cat);
    setCustomCats(updatedCats);
    saveCustomCategories(updatedCats);
    
    // Clean mappings pointing to this category
    const updatedMaps = { ...customMaps };
    Object.keys(updatedMaps).forEach(k => {
      if (updatedMaps[k] === cat) {
        delete updatedMaps[k];
      }
    });
    setCustomMaps(updatedMaps);
    saveCustomCategoryMappings(updatedMaps);
    
    // Refresh list data
    setListData(consolidateIngredients(selectedRecipes));
  };

  // Handle adding keyword mapping rule
  const handleAddMapping = () => {
    const ingClean = newMappingIng.trim().toLowerCase();
    if (!ingClean) return;
    const updated = {
      ...customMaps,
      [ingClean]: newMappingCat
    };
    setCustomMaps(updated);
    saveCustomCategoryMappings(updated);
    setNewMappingIng('');
    
    // Refresh list data
    setListData(consolidateIngredients(selectedRecipes));
  };

  // Handle deleting keyword mapping rule
  const handleDeleteMapping = (ingKey) => {
    const updated = { ...customMaps };
    delete updated[ingKey];
    setCustomMaps(updated);
    saveCustomCategoryMappings(updated);
    
    // Refresh list data
    setListData(consolidateIngredients(selectedRecipes));
  };

  useEffect(() => {
    if (isOpen && selectedRecipes.length > 0) {
      const consolidated = consolidateIngredients(selectedRecipes);
      setListData(consolidated);
      setCheckedItems({}); // reset checkboxes on reload
    }
  }, [isOpen, selectedRecipes]);

  if (!isOpen) return null;

  const handleToggleCheck = (category, ingName) => {
    const key = `${category}-${ingName}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const formatQuantity = (qty) => {
    return parseFloat(qty.toFixed(2));
  };

  const handleCopyClipboard = () => {
    let text = `📋 FLAVORFIND SHOPPING LIST\n`;
    text += `Generated on: ${new Date().toLocaleDateString()}\n`;
    text += `Recipes: ${selectedRecipes.map(r => r.name).join(', ')}\n\n`;

    Object.entries(listData).forEach(([category, items]) => {
      const itemEntries = Object.entries(items);
      if (itemEntries.length === 0) return;

      text += `■ ${category}\n`;
      itemEntries.forEach(([name, details]) => {
        let line = `  [ ] ${formatQuantity(details.quantity)} ${details.unit ? details.unit + ' ' : ''}${name}`;
        if (details.alternativeQuantities && details.alternativeQuantities.length > 0) {
          details.alternativeQuantities.forEach(alt => {
            line += ` + ${formatQuantity(alt.quantity)} ${alt.unit ? alt.unit + ' ' : ''}`;
          });
        }
        line += ` (from: ${details.recipes.join(', ')})`;
        text += `${line}\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text)
      .then(() => {
        onCopySuccess('Shopping list copied to clipboard!');
      })
      .catch(() => {
        onCopySuccess('Failed to copy list.', 'error');
      });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="shopping-list-modal">
      <div className="modal-content print-friendly" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header no-print">
          <h3>📋 Consolidated Shopping List</h3>
          <div className="header-actions">
            <button 
              onClick={() => setIsManageOpen(!isManageOpen)} 
              className={`text-action-btn ${isManageOpen ? 'active' : ''}`}
              id="toggle-category-sorters"
              title="Manage custom shopping list categories and sorting rules"
            >
              {isManageOpen ? '📋 View List' : '📂 Category Sorters'}
            </button>
            {!isManageOpen && (
              <>
                <button onClick={handleCopyClipboard} className="text-action-btn">Copy Text</button>
                <button onClick={handlePrint} className="text-action-btn">Print</button>
              </>
            )}
            <button onClick={onClose} className="close-modal-btn" aria-label="Close modal">✕</button>
          </div>
        </div>

        {/* Printable header */}
        <div className="print-only print-header">
          <h2>FlavorFind Shopping List</h2>
          <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
          <p><strong>Recipes:</strong> {selectedRecipes.map(r => r.name).join(', ')}</p>
          <hr />
        </div>

        {isManageOpen ? (
          <div className="shopping-list-body custom-sorters-panel">
            <div className="tools-section">
              <h4>📂 Custom Shopping Categories</h4>
              <div className="add-rule-inline-form">
                <input 
                  type="text"
                  placeholder="e.g. BEVERAGES, PETS, SNACKS"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="voice-mapping-input"
                  id="new-category-name"
                />
                <button onClick={handleAddCategory} className="settings-btn save compact-btn" id="add-category-btn">Add Category</button>
              </div>

              {customCats.length === 0 ? (
                <p className="no-sub-found-text" style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>No custom categories defined yet.</p>
              ) : (
                <div className="custom-cats-list">
                  {customCats.map(cat => (
                    <div key={cat} className="custom-cat-chip-row">
                      <span className="custom-cat-chip">🏷️ {cat}</span>
                      <button onClick={() => handleDeleteCategory(cat)} className="delete-chip-btn" aria-label={`Delete category ${cat}`}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="tools-section" style={{ marginTop: '1.5rem' }}>
              <h4>🔍 Ingredient Sorting Rules</h4>
              <p className="help-text-info" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Map ingredient keywords (e.g. "soda") to categories. Custom mappings take priority.</p>
              
              <div className="add-mapping-grid">
                <div className="converter-input-group">
                  <label htmlFor="new-mapping-ing-input">Ingredient Keyword</label>
                  <input 
                    type="text"
                    id="new-mapping-ing-input"
                    placeholder="e.g. apple, juice, dog food"
                    value={newMappingIng}
                    onChange={(e) => setNewMappingIng(e.target.value)}
                    className="voice-mapping-input"
                  />
                </div>

                <div className="converter-input-group" style={{ marginTop: '0.5rem' }}>
                  <label htmlFor="new-mapping-cat-select">Target Category</label>
                  <select
                    id="new-mapping-cat-select"
                    value={newMappingCat}
                    onChange={(e) => setNewMappingCat(e.target.value)}
                    className="chime-dropdown-select"
                  >
                    {['PRODUCE', 'MEAT SEAFOOD', 'DAIRY ALTERNATES', 'BAKERY', 'PANTRY', 'SPICES BAKING', ...customCats].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button onClick={handleAddMapping} className="settings-btn save" style={{ marginTop: '1.25rem', width: '100%' }} id="add-mapping-btn">
                Add Classification Rule
              </button>

              <div className="existing-rules-container" style={{ marginTop: '1.75rem' }}>
                <h5>Active Custom Mappings ({Object.keys(customMaps).length})</h5>
                {Object.keys(customMaps).length === 0 ? (
                  <p className="no-sub-found-text" style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>No custom mappings created yet. Keywords default to preset groups.</p>
                ) : (
                  <ul className="active-subs-list" style={{ padding: 0 }}>
                    {Object.entries(customMaps).map(([ing, cat]) => (
                      <li key={ing} className="active-sub-item" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <span className="sub-recipe-ing" style={{ fontSize: '0.85rem' }}>🌾 <strong>{ing}</strong> &rarr; <span className="category-tag" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.8rem' }}>{cat}</span></span>
                        <button onClick={() => handleDeleteMapping(ing)} className="delete-chip-btn" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.95rem' }} aria-label={`Delete mapping for ${ing}`}>✕</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="shopping-list-body">
            {Object.keys(listData).length === 0 ? (
              <p className="no-items-text">No ingredients to display. Please select recipes first.</p>
            ) : (
              Object.entries(listData).map(([category, items]) => {
                const itemEntries = Object.entries(items);
                if (itemEntries.length === 0) return null;

                return (
                  <div key={category} className="shopping-category-block">
                    <h4 className="shopping-category-title">{category}</h4>
                    <ul className="shopping-items-list">
                      {itemEntries.map(([name, details]) => {
                        const key = `${category}-${name}`;
                        const isChecked = checkedItems[key];
                        return (
                          <li key={name} className={`shopping-item-row ${isChecked ? 'checked' : ''}`}>
                            <label className="checkbox-container no-print">
                              <input 
                                type="checkbox" 
                                checked={!!isChecked} 
                                onChange={() => handleToggleCheck(category, name)}
                              />
                              <span className="checkbox-checkmark"></span>
                            </label>

                            {/* Print Checkbox helper */}
                            <span className="print-only print-checkbox">[ ]</span>

                            <div className="shopping-item-details">
                              <span className="shopping-item-name">
                                <span className="qty-badge">
                                  {formatQuantity(details.quantity)} {details.unit}
                                </span>
                                {details.alternativeQuantities && details.alternativeQuantities.length > 0 && (
                                  details.alternativeQuantities.map((alt, idx) => (
                                    <span key={idx} className="alt-qty-badge">
                                      + {formatQuantity(alt.quantity)} {alt.unit}
                                    </span>
                                  ))
                                )}
                                <span className="item-name-text">{name}</span>
                              </span>
                              <span className="shopping-item-source no-print">
                                {details.recipes.join(', ')}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })
            )}
          </div>
        )}

        <div className="modal-footer no-print">
          <button onClick={onClose} className="cancel-btn">Close</button>
        </div>
      </div>
    </div>
  );
}
