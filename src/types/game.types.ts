// Category IDs match the `category` field in src/data/movies.ts
export type CategoryId = 'movie' | 'series' | 'play';

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
}

export interface Team {
  name: string;
  score: number;
}

export interface GameConfig {
  teamA: Team;
  teamB: Team;
  selectedCategories: CategoryId[];
  crazyRulesEnabled: boolean;
}

export type GamePhase = 'setup' | 'playing' | 'roundEnd' | 'results';

export interface ContentItem {
  id: string;
  name: string;       // was `title`
  category: CategoryId; // was `categoryId`
}
