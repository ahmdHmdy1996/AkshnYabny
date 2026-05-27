import { create } from 'zustand';
import { CategoryId, GameConfig, GamePhase, Team } from '../types/game.types';

// ─── Shape ────────────────────────────────────────────────────────────────────

interface RoundConfig {
  maxRounds: number;
  currentRound: number;
}

interface GameActions {
  setTeamName: (team: 'A' | 'B', name: string) => void;
  toggleCategory: (id: CategoryId) => void;
  toggleCrazyRules: () => void;
  setMaxRounds: (rounds: number) => void;
  setPhase: (phase: GamePhase) => void;
  incrementScore: (team: 'A' | 'B') => void;
  /**
   * Toggles currentTurn A↔B.
   * When Team B finishes (B→A transition), also increments currentRound.
   */
  switchTurn: () => void;
  resetGame: () => void;
  toggleSound: () => void;
}

type GameStore = GameConfig & RoundConfig & {
  phase: GamePhase;
  currentTurn: 'A' | 'B';
  // Lives outside initialState so resetGame() preserves the user's preference.
  isSoundEnabled: boolean;
} & GameActions;

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultTeam = (name = ''): Team => ({ name, score: 0 });

const initialState: GameConfig & RoundConfig & {
  phase: GamePhase;
  currentTurn: 'A' | 'B';
} = {
  teamA: defaultTeam(),
  teamB: defaultTeam(),
  selectedCategories: [],
  crazyRulesEnabled: false,
  phase: 'setup',
  currentTurn: 'A',
  maxRounds: 3,
  currentRound: 1,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,
  isSoundEnabled: true,

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

  setPhase: (phase) => set({ phase }),

  incrementScore: (team) =>
    set((state) => {
      const key = team === 'A' ? 'teamA' : 'teamB';
      return { [key]: { ...state[key], score: state[key].score + 1 } };
    }),

  switchTurn: () =>
    set((state) => ({
      currentTurn: state.currentTurn === 'A' ? 'B' : 'A',
      // Only advance the round counter when Team B finishes (B → A transition)
      currentRound:
        state.currentTurn === 'B'
          ? state.currentRound + 1
          : state.currentRound,
    })),

  resetGame: () => set(initialState),

  toggleSound: () => set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),
}));
