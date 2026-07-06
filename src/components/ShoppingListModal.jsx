// src/components/ShoppingListModal.jsx
// Renders the consolidated categorized ingredients list with checkboxes, printing, and clipboard copying.
// Connects to: src/App.jsx, src/utils/shoppingListUtils.js
// Created: 2026-07-06

import React, { useState, useEffect } from 'react';
import { consolidateIngredients } from '../utils/shoppingListUtils.js';

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
            <button onClick={handleCopyClipboard} className="text-action-btn">Copy Text</button>
            <button onClick={handlePrint} className="text-action-btn">Print</button>
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

        <div className="modal-footer no-print">
          <button onClick={onClose} className="cancel-btn">Close</button>
        </div>
      </div>
    </div>
  );
}
