// tests/services/inventoryService.test.js
// Tests the CRUD operations and expiration calculations in src/services/inventoryService.js.
// Connects to: src/services/inventoryService.js
// Created: 2026-07-06

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getInventory, addInventoryItem, deleteInventoryItem, getExpirationStatus } from '../../src/services/inventoryService.js';

describe('inventoryService - local storage CRUD', () => {
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = value.toString(); },
      clear: () => { store = {}; }
    };
  })();

  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock);
    localStorage.clear();
  });

  it('should start with an empty inventory list', () => {
    expect(getInventory()).toEqual([]);
  });

  it('should add an item successfully', () => {
    const item = {
      name: 'Milk',
      quantity: '1 gallon',
      expirationDate: '2026-07-10'
    };

    const updated = addInventoryItem(item);
    expect(updated).toHaveLength(1);
    expect(updated[0]).toMatchObject({
      name: 'milk',
      quantity: '1 gallon',
      expirationDate: '2026-07-10'
    });
    expect(updated[0].id).toBeDefined();
  });

  it('should fail to add an item if name is missing', () => {
    expect(() => addInventoryItem({ name: '', expirationDate: '2026-07-10' })).toThrow();
  });

  it('should delete an item successfully', () => {
    const item = addInventoryItem({ name: 'avocado', quantity: '2', expirationDate: '2026-07-08' })[0];
    const updated = deleteInventoryItem(item.id);
    expect(updated).toHaveLength(0);
  });
});

describe('inventoryService - getExpirationStatus', () => {
  const getLocalDateStr = (offsetDays) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  it('should identify expired dates', () => {
    const check = getExpirationStatus(getLocalDateStr(-2));
    expect(check.isExpired).toBe(true);
    expect(check.isExpiringSoon).toBe(false);
    expect(check.daysLeft).toBe(-2);
  });

  it('should identify expiring soon dates', () => {
    const check = getExpirationStatus(getLocalDateStr(2));
    expect(check.isExpired).toBe(false);
    expect(check.isExpiringSoon).toBe(true);
    expect(check.daysLeft).toBe(2);
  });

  it('should identify safe future dates', () => {
    const check = getExpirationStatus(getLocalDateStr(10));
    expect(check.isExpired).toBe(false);
    expect(check.isExpiringSoon).toBe(false);
    expect(check.daysLeft).toBe(10);
  });
});
