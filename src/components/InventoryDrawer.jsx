// src/components/InventoryDrawer.jsx
// Renders the sliding drawer for managing the user's fridge inventory with expiration warnings and search autofill.
// Connects to: src/App.jsx, src/services/inventoryService.js
// Created: 2026-07-06

import React, { useState } from 'react';
import { getExpirationStatus } from '../services/inventoryService.js';

/**
 * InventoryDrawer Component.
 * 
 * @param {Object} props - Component properties.
 * @param {boolean} props.isOpen - Whether the drawer is open.
 * @param {Function} props.onClose - Callback to close the drawer.
 * @param {Object[]} props.inventory - List of current fridge items.
 * @param {Function} props.onAddItem - Callback when a new item is submitted.
 * @param {Function} props.onDeleteItem - Callback when an item is deleted.
 * @param {Function} props.onAutofillSearch - Callback to populate main search ingredients.
 */
export default function InventoryDrawer({
  isOpen,
  onClose,
  inventory,
  onAddItem,
  onDeleteItem,
  onAutofillSearch,
  expirationThreshold,
  onSaveThreshold
}) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  
  // Set default date to today + 7 days
  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };
  
  const [expirationDate, setExpirationDate] = useState(getDefaultDate());
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Item name is required.');
      return;
    }
    if (!expirationDate) {
      setError('Expiration date is required.');
      return;
    }

    onAddItem({
      name: name.trim(),
      quantity: quantity.trim() || '1',
      expirationDate
    });

    // Reset form fields
    setName('');
    setQuantity('');
    setExpirationDate(getDefaultDate());
    setError('');
  };

  const handleAutofill = () => {
    if (inventory.length === 0) return;
    const ingredientNames = inventory.map(item => item.name);
    onAutofillSearch(ingredientNames);
  };

  return (
    <div className={`favorites-sidebar ${isOpen ? 'open' : ''}`} id="inventory-drawer">
      <div className="favorites-header">
        <h3>🥦 Fridge Inventory ({inventory.length})</h3>
        <button onClick={onClose} className="close-sidebar-btn" aria-label="Close drawer">✕</button>
      </div>

      {inventory.length > 0 && (
        <div className="favorites-actions-row">
          <button 
            onClick={handleAutofill} 
            className="bulk-action-btn autofill-btn"
            title="Search for recipes matching your current fridge items"
            id="autofill-fridge-btn"
          >
            🔌 Search from Fridge Items
          </button>
        </div>
      )}

      <div className="favorites-content flex-container">
        {/* Add Item Form */}
        <form onSubmit={handleSubmit} className="inventory-add-form">
          <h4>➕ Add Fridge Item</h4>
          {error && <div className="error-text inventory-form-error">{error}</div>}
          
          <div className="form-group-compact">
            <input
              type="text"
              placeholder="e.g. Avocado, Milk, Spinach"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="inventory-input name-input"
              id="inventory-item-name"
            />
          </div>

          <div className="form-row-compact">
            <input
              type="text"
              placeholder="Qty (e.g. 2, 500g)"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="inventory-input qty-input"
              id="inventory-item-qty"
            />
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="inventory-input date-input"
              id="inventory-item-date"
            />
          </div>

          <button type="submit" className="add-inventory-btn" id="add-inventory-submit">
            Add to Fridge
          </button>
        </form>

        {/* Freshness Threshold Configurator */}
        <div className="threshold-configurator-row" id="freshness-threshold-panel">
          <label htmlFor="freshness-threshold-select">Freshness warning threshold:</label>
          <div className="threshold-select-group">
            <select
              id="freshness-threshold-select"
              value={expirationThreshold}
              onChange={(e) => onSaveThreshold(Number(e.target.value))}
              className="threshold-select-input"
            >
              {[1, 2, 3, 5, 7, 10, 14].map(days => (
                <option key={days} value={days}>{days} {days === 1 ? 'day' : 'days'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Inventory List */}
        <div className="inventory-list-scroll">
          {inventory.length === 0 ? (
            <div className="favorites-empty">
              <span className="empty-heart">🥦</span>
              <p>Your fridge is empty.</p>
              <p className="empty-subtext">Add ingredients to keep track of their freshness dates.</p>
            </div>
          ) : (
            <ul className="inventory-items-list">
              {inventory.map(item => {
                const status = getExpirationStatus(item.expirationDate, expirationThreshold);
                let badgeClass = 'safe';
                let badgeText = `${status.daysLeft}d left`;
                
                if (status.isExpired) {
                  badgeClass = 'expired';
                  badgeText = `🚨 Expired (${Math.abs(status.daysLeft)}d ago)`;
                } else if (status.isExpiringSoon) {
                  badgeClass = 'warning';
                  badgeText = status.daysLeft === 0 
                    ? '⚠️ Expires today!' 
                    : `⚠️ Expiring soon (${status.daysLeft}d left)`;
                }

                return (
                  <li key={item.id} className={`inventory-item-card ${badgeClass}`} id={`inventory-item-${item.id}`}>
                    <div className="inventory-item-details">
                      <div className="inventory-name-row">
                        <span className="inventory-item-name">{item.name}</span>
                        <span className="inventory-item-qty">x{item.quantity}</span>
                      </div>
                      <div className="inventory-status-row">
                        <span className={`inventory-status-badge ${badgeClass}`}>
                          {badgeText}
                        </span>
                        <span className="inventory-expiry-date">{item.expirationDate}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => onDeleteItem(item.id)}
                      className="delete-inventory-item-btn"
                      title="Remove from fridge"
                      aria-label="Remove item"
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
