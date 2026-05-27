export type CategoryId = 'movies' | 'tvShows' | 'plays';

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
  title: string;
  categoryId: CategoryId;
}
