import { HistoryRecord } from './types';

const STORAGE_KEY_PREFIX = 'ctc_history_';

/**
 * Get user ID from localStorage (Google user ID or guest ID)
 */
export const getUserId = (): string => {
  const googleUser = localStorage.getItem('ctc_google_user');
  if (googleUser) {
    try {
      const user = JSON.parse(googleUser);
      return user.sub || user.id || 'guest';
    } catch {
      return 'guest';
    }
  }
  return localStorage.getItem('ctc_guest_id') || 'guest';
};

/**
 * Initialize guest ID if not exists
 */
export const initGuestId = (): string => {
  let guestId = localStorage.getItem('ctc_guest_id');
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('ctc_guest_id', guestId);
  }
  return guestId;
};

/**
 * Get storage key for user's history
 */
const getStorageKey = (userId: string): string => {
  return `${STORAGE_KEY_PREFIX}${userId}`;
};

/**
 * Save a history record
 */
export const saveHistoryRecord = (record: HistoryRecord): void => {
  const userId = getUserId();
  const key = getStorageKey(userId);
  const history = getHistoryRecords();
  history.unshift(record); // Add to beginning
  // Keep only last 50 records
  const limitedHistory = history.slice(0, 50);
  localStorage.setItem(key, JSON.stringify(limitedHistory));
};

/**
 * Get all history records for current user
 */
export const getHistoryRecords = (): HistoryRecord[] => {
  const userId = getUserId();
  const key = getStorageKey(userId);
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (err) {
    console.error('Failed to load history records', err);
    return [];
  }
};

/**
 * Delete a history record
 */
export const deleteHistoryRecord = (recordId: string): void => {
  const userId = getUserId();
  const key = getStorageKey(userId);
  const history = getHistoryRecords();
  const filtered = history.filter(r => r.id !== recordId);
  localStorage.setItem(key, JSON.stringify(filtered));
};

/**
 * Clear all history records for current user
 */
export const clearHistoryRecords = (): void => {
  const userId = getUserId();
  const key = getStorageKey(userId);
  localStorage.removeItem(key);
};
