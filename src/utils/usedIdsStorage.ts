/**
 * src/utils/usedIdsStorage.ts
 *
 * Thin AsyncStorage wrapper for the "used item IDs" persistence layer.
 *
 * All functions are fire-and-forget safe — they swallow errors silently so a
 * storage failure never crashes the game. The in-memory Zustand state is always
 * the source of truth; AsyncStorage is the warm-start cache that survives
 * process kills and device reboots.
 *
 * Key: @movie_game:used_item_ids
 * Value: JSON array of string IDs, e.g. ["m01","m02","s03"]
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@movie_game:used_item_ids';

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Load the persisted used-item IDs from AsyncStorage.
 * Returns an empty array when nothing is stored or on any read error.
 * Call once on app startup to hydrate the Zustand store.
 */
export async function loadUsedItemIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    // Corrupted data or unavailable storage — start fresh
    return [];
  }
}

// ─── Write ────────────────────────────────────────────────────────────────────

/**
 * Persist the full used-item ID array to AsyncStorage.
 * Called fire-and-forget inside Zustand actions — errors are swallowed.
 */
export async function saveUsedItemIds(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage unavailable — in-memory state is still correct
  }
}

// ─── Nuke ─────────────────────────────────────────────────────────────────────

/**
 * Remove the persisted entry entirely (useful for dev/debug resets).
 * Normal gameplay should never need this — pool resets are per-category.
 */
export async function clearPersistedUsedItemIds(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {}
}
