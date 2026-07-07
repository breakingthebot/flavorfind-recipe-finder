// src/services/inventoryService.js
// Manages fridge inventory items, CRUD operations, expiration tracking, and syncing to localStorage.
// Connects to: src/App.jsx
// Created: 2026-07-06

import { logger } from '../utils/logger.js';

const INVENTORY_KEY = 'recipe_finder_fridge_inventory';

/**
 * Retrieves all inventory items from localStorage, sorted by expiration date.
 * 
 * @returns {Object[]} The list of inventory items.
 */
export function getInventory() {
  try {
    const data = localStorage.getItem(INVENTORY_KEY);
    const items = data ? JSON.parse(data) : [];
    
    // Sort items so the earliest expiration date is first
    const sorted = items.sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));
    logger.debug('Retrieved inventory from localStorage', { count: sorted.length });
    return sorted;
  } catch (error) {
    logger.error('Failed to load inventory from localStorage', { error: error.message });
    return [];
  }
}

/**
 * Adds a new item to the fridge inventory.
 * 
 * @param {Object} item - { name, quantity, expirationDate }
 * @returns {Object[]} The updated inventory list.
 */
export function addInventoryItem(item) {
  if (!item.name || !item.name.trim()) {
    logger.warn('Failed validation for inventory item - missing name');
    throw new Error('Ingredient name is required.');
  }
  if (!item.expirationDate) {
    logger.warn('Failed validation for inventory item - missing expiration date');
    throw new Error('Expiration date is required.');
  }

  const items = getInventory();
  const newItem = {
    id: `item_${Date.now()}`,
    name: item.name.trim().toLowerCase(),
    quantity: item.quantity ? item.quantity.trim() : '1',
    expirationDate: item.expirationDate
  };

  const updated = [...items, newItem];
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(updated));
  logger.info('Added new item to inventory', { id: newItem.id, name: newItem.name });
  
  return getInventory();
}

/**
 * Deletes an item from the inventory.
 * 
 * @param {string} id - The ID of the item to delete.
 * @returns {Object[]} The updated inventory list.
 */
export function deleteInventoryItem(id) {
  const items = getInventory();
  const filtered = items.filter(item => item.id !== id);
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(filtered));
  logger.info('Deleted item from inventory', { id });
  
  return filtered;
}

/**
 * Checks if an item is expired or expiring within a days threshold.
 * 
 * @param {string} dateStr - The expiration date string YYYY-MM-DD.
 * @param {number} thresholdDays - Number of days to flag as expiring soon.
 * @returns {Object} { isExpired: boolean, isExpiringSoon: boolean, daysLeft: number }
 */
export function getExpirationStatus(dateStr, thresholdDays = 3) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const parts = dateStr.split('-');
  const expDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  expDate.setHours(0, 0, 0, 0);
  
  const diffTime = expDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    isExpired: diffDays < 0,
    isExpiringSoon: diffDays >= 0 && diffDays <= thresholdDays,
    daysLeft: diffDays
  };
}
