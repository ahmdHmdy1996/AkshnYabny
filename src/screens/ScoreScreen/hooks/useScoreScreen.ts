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
  const isGameOver = currentTurn === 'B' && currentRound >= maxRounds;

  const handleNextRound = () => {
    // Use push (not replace) so each game screen is a fresh component instance.
    // This prevents the old screen's hasNavigated ref from blocking Team B's turn.
    switchTurn();
    setPhase('playing');
    router.push('/game');
  };

  const handleCrownWinner = () => {
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
