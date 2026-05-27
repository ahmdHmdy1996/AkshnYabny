import { useRouter } from 'expo-router';
import { useGameStore } from '../../../store/useGameStore';
import { Team } from '../../../types/game.types';

export interface ScoreScreenData {
  teamA: Team;
  teamB: Team;
  currentTurn: 'A' | 'B';
  nextTurn: 'A' | 'B';
  nextTeam: Team;
  currentRound: number;
  maxRounds: number;
  /** True when Team B has just finished the final round. */
  isGameOver: boolean;
  leadingTeam: 'A' | 'B' | null;
  handleNextRound: () => void;
  handleCrownWinner: () => void;
  handleEndGame: () => void;
}

export function useScoreScreen(): ScoreScreenData {
  const router = useRouter();
  const {
    teamA,
    teamB,
    currentTurn,
    currentRound,
    maxRounds,
    switchTurn,
    resetGame,
    setPhase,
  } = useGameStore();

  const nextTurn: 'A' | 'B' = currentTurn === 'A' ? 'B' : 'A';
  const nextTeam = nextTurn === 'A' ? teamA : teamB;

  const leadingTeam: 'A' | 'B' | null =
    teamA.score > teamB.score ? 'A' :
    teamB.score > teamA.score ? 'B' :
    null;

  // Game is over when Team B just finished the last round.
  // At this point switchTurn() hasn't been called yet, so currentRound is
  // still the round that just ended.
  const isGameOver = currentTurn === 'B' && currentRound >= maxRounds;

  const handleNextRound = () => {
    // Only called when !isGameOver
    switchTurn();
    setPhase('playing');
    router.replace('/game');
  };

  const handleCrownWinner = () => {
    // Only called when isGameOver — no switchTurn needed, game is done
    setPhase('results');
    router.replace('/winner');
  };

  const handleEndGame = () => {
    resetGame();
    router.dismissAll();
  };

  return {
    teamA,
    teamB,
    currentTurn,
    nextTurn,
    nextTeam,
    currentRound,
    maxRounds,
    isGameOver,
    leadingTeam,
    handleNextRound,
    handleCrownWinner,
    handleEndGame,
  };
}
