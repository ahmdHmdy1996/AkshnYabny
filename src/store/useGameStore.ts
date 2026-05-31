/**
 * src/store/useGameStore.ts
 *
 * Global Zustand store for the Movie Charades game.
 *
 * ── Lifetime buckets ─────────────────────────────────────────────────────────
 *
 *   initialState (cleared by resetGame / "New Game" button)
 *     teamA, teamB, selectedCategories, crazyRulesEnabled,
 *     phase, currentTurn, maxRounds, currentRound,
 *     teamASkipsUsed, teamBSkipsUsed
 *
 *   Persistent preferences (survive resetGame AND app restarts)
 *     isSoundEnabled, gameMode, roundDuration, skipLimit
 *
 *   Cross-session history (survives resetGame; persisted to AsyncStorage)
 *     usedItemIds  ← key addition: prevents item repetition across sessions
 *                    hydrated from AsyncStorage in app/_layout.tsx on startup
 *                    written back on every markItemUsed / resetCategoryPool call
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { create } from 'zustand';
import { CategoryId, GameConfig, GamePhase, Team } from '../types/game.types';
import { saveUsedItemIds } from '../utils/usedIdsStorage';

// ─── Shape ────────────────────────────────────────────────────────────────────

interface RoundConfig {
  maxRounds:    number;
  currentRound: number;
}

interface GameActions {
  setTeamName:       (team: 'A' | 'B', name: string) => void;
  toggleCategory:    (id: CategoryId) => void;
  toggleCrazyRules:  () => void;
  setMaxRounds:      (rounds: number) => void;
  setPhase:          (phase: GamePhase) => void;
  incrementScore:    (team: 'A' | 'B') => void;
  /**
   * Toggles currentTurn A↔B.
   * When Team B finishes (B→A), also increments currentRound.
   */
  switchTurn: () => void;
  /** Resets game-session state only — usedItemIds and preferences are untouched. */
  resetGame: () => void;

  // ── Sound ───────────────────────────────────────────────────────────────────
  toggleSound: () => void;

  // ── Game mode ───────────────────────────────────────────────────────────────
  setGameMode: (mode: 'single' | 'multiple') => void;

  // ── Round duration & skip limit (preferences) ───────────────────────────────
  setRoundDuration: (seconds: number) => void;
  setSkipLimit:     (limit: number | null) => void;

  // ── Uniqueness / no-repeat engine ───────────────────────────────────────────
  /**
   * Mark a single content item as played.
   * Updates in-memory state AND persists the full array to AsyncStorage.
   */
  markItemUsed: (id: string) => void;

  /**
   * Hydrate the store from AsyncStorage on app startup.
   * Only overwrites usedItemIds when ids.length > 0 to avoid a flash of
   * "all categories available" if storage returns before the component mounts.
   */
  setUsedItemIds: (ids: string[]) => void;

  /**
   * Per-category pool reset.
   * Removes only the IDs that belong to the currently exhausted category set
   * from usedItemIds. IDs from other categories remain — their history is preserved.
   *
   * @param itemIds  All content-item IDs in the exhausted category pool
   *                 (obtained by filtering MOVIES by selectedCategories).
   */
  resetCategoryPool: (itemIds: string[]) => void;

  /**
   * Nuclear option — clears the full used-IDs list and persists it.
   * Retained for completeness; normal gameplay uses resetCategoryPool instead.
   */
  clearUsedItems: () => void;

  // ── Per-team skip tracking (cleared on resetGame) ───────────────────────────
  incrementSkipsUsed: (team: 'A' | 'B') => void;
}

type GameStore = GameConfig & RoundConfig & {
  phase:        GamePhase;
  currentTurn:  'A' | 'B';

  // ── Persistent preferences (survive resetGame) ─────────────────────────────
  isSoundEnabled: boolean;
  gameMode:       'single' | 'multiple';
  /** Round duration in seconds. Default 60. Preserved across games. */
  roundDuration: number;
  /** Max skips per team per game. null = infinite. Preserved across games. */
  skipLimit: number | null;

  // ── Cross-session history (persisted via AsyncStorage) ─────────────────────
  /**
   * IDs of every content item that has been shown in any round across all
   * sessions. Hydrated from AsyncStorage on startup; written back on change.
   * Does NOT reset when resetGame() is called — only resets per-category when
   * the pool for that category is exhausted.
   */
  usedItemIds: string[];

  // ── Round-session only (cleared on resetGame) ──────────────────────────────
  teamASkipsUsed: number;
  teamBSkipsUsed: number;
} & GameActions;

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultTeam = (name = ''): Team => ({ name, score: 0 });

/**
 * Fields that resetGame() wipes back to defaults.
 * usedItemIds is intentionally NOT here — it persists across games.
 */
const initialState: GameConfig & RoundConfig & {
  phase:          GamePhase;
  currentTurn:    'A' | 'B';
  teamASkipsUsed: number;
  teamBSkipsUsed: number;
} = {
  teamA:              defaultTeam(),
  teamB:              defaultTeam(),
  selectedCategories: [],
  crazyRulesEnabled:  false,
  phase:              'setup',
  currentTurn:        'A',
  maxRounds:          3,
  currentRound:       1,
  teamASkipsUsed:     0,
  teamBSkipsUsed:     0,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  // ── Persistent preferences ──────────────────────────────────────────────────
  isSoundEnabled: true,
  gameMode:       'multiple',
  roundDuration:  60,
  skipLimit:      null,

  // ── Cross-session history ───────────────────────────────────────────────────
  // Starts empty; overwritten by setUsedItemIds() once AsyncStorage resolves.
  usedItemIds: [],

  // ── Team & config ───────────────────────────────────────────────────────────

  setTeamName: (team, name) =>
    set((state) => {
      const key = team === 'A' ? 'teamA' : 'teamB';
      return { [key]: { ...state[key], name } };
    }),

  toggleCategory: (id) =>
    set((state) => {
      const already = state.selectedCategories.includes(id);
      return {
        selectedCategories: already
          ? state.selectedCategories.filter((c) => c !== id)
          : [...state.selectedCategories, id],
      };
    }),

  toggleCrazyRules: () =>
    set((state) => ({ crazyRulesEnabled: !state.crazyRulesEnabled })),

  setMaxRounds: (rounds) => set({ maxRounds: rounds }),
  setPhase:     (phase)  => set({ phase }),

  // ── Scoring & turns ─────────────────────────────────────────────────────────

  incrementScore: (team) =>
    set((state) => {
      const key = team === 'A' ? 'teamA' : 'teamB';
      return { [key]: { ...state[key], score: state[key].score + 1 } };
    }),

  switchTurn: () =>
    set((state) => ({
      currentTurn: state.currentTurn === 'A' ? 'B' : 'A',
      currentRound:
        state.currentTurn === 'B'
          ? state.currentRound + 1
          : state.currentRound,
    })),

  // usedItemIds is NOT in initialState, so it survives here intentionally.
  resetGame: () => set(initialState),

  // ── Sound & mode ────────────────────────────────────────────────────────────

  toggleSound:  () => set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),
  setGameMode:  (mode)    => set({ gameMode: mode }),

  // ── Round duration & skip limit ─────────────────────────────────────────────

  setRoundDuration: (seconds) => set({ roundDuration: seconds }),
  setSkipLimit:     (limit)   => set({ skipLimit: limit }),

  // ── Uniqueness / no-repeat engine ───────────────────────────────────────────

  markItemUsed: (id) =>
    set((state) => {
      // Deduplicate — the same ID should never appear twice
      if (state.usedItemIds.includes(id)) return {};
      const updated = [...state.usedItemIds, id];
      // Fire-and-forget: write to disk in the background
      saveUsedItemIds(updated);
      return { usedItemIds: updated };
    }),

  setUsedItemIds: (ids) =>
    set({ usedItemIds: ids }),

  resetCategoryPool: (itemIds) =>
    set((state) => {
      // Use a Set for O(1) lookup — important with 1 000+ item datasets
      const toRemove = new Set(itemIds);
      const updated  = state.usedItemIds.filter((id) => !toRemove.has(id));
      saveUsedItemIds(updated);
      return { usedItemIds: updated };
    }),

  clearUsedItems: () =>
    set(() => {
      saveUsedItemIds([]);
      return { usedItemIds: [] };
    }),

  // ── Skip tracking ────────────────────────────────────────────────────────────

  incrementSkipsUsed: (team) =>
    set((state) => ({
      teamASkipsUsed: team === 'A' ? state.teamASkipsUsed + 1 : state.teamASkipsUsed,
      teamBSkipsUsed: team === 'B' ? state.teamBSkipsUsed + 1 : state.teamBSkipsUsed,
    })),
}));
