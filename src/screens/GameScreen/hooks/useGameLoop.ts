import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useGameStore } from '../../../store/useGameStore';
import { CONTENT_ITEMS, CRAZY_RULES } from '../../../constants/mockData';
import { ContentItem } from '../../../types/game.types';
import { timerPulse } from '../../../utils/haptics';
import { playTickSound } from '../../../utils/audio';

const ROUND_DURATION = 60;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function useGameLoop() {
  const router = useRouter();
  const {
    selectedCategories,
    crazyRulesEnabled,
    currentTurn,
    teamA,
    teamB,
    incrementScore,
    setPhase,
  } = useGameStore();

  // ── Build the card pool once on mount ───────────────────────────────────────
  const [pool] = useState<ContentItem[]>(() =>
    shuffle(CONTENT_ITEMS.filter((item) => selectedCategories.includes(item.categoryId)))
  );

  // ── Pick a crazy rule once per round (stable ref) ────────────────────────
  const crazyRule = useRef<string | null>(
    crazyRulesEnabled && CRAZY_RULES.length > 0 ? pickRandom(CRAZY_RULES) : null
  ).current;

  // ── Local game state ─────────────────────────────────────────────────────
  const [cardIndex, setCardIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [isActive, setIsActive] = useState(true);
  const hasNavigated = useRef(false);

  // ── Countdown: tick every second while active ───────────────────────────
  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(
      () => setTimeLeft((t) => (t > 0 ? t - 1 : 0)),
      1000
    );
    return () => clearInterval(id);
  }, [isActive]);

  // ── When time runs out → navigate to results ────────────────────────────
  useEffect(() => {
    if (timeLeft === 0 && !hasNavigated.current) {
      hasNavigated.current = true;
      setIsActive(false);
      setPhase('roundEnd');
      router.push('/results');
    }
  }, [timeLeft, setPhase, router]);

  // ── Haptic + sound pulse every second in the warning zone (1 – 10 s) ────
  useEffect(() => {
    if (timeLeft > 0 && timeLeft <= 10) {
      timerPulse();
      playTickSound();
    }
  }, [timeLeft]);

  // ── Card navigation (wraps around the pool) ──────────────────────────────
  const advance = useCallback(() => {
    if (pool.length === 0) return;
    setCardIndex((i) => (i + 1) % pool.length);
  }, [pool.length]);

  const handleCorrectAnswer = useCallback(() => {
    incrementScore(currentTurn);
    advance();
  }, [currentTurn, incrementScore, advance]);

  const handleSkip = useCallback(() => {
    advance();
  }, [advance]);

  // ── Derived values ────────────────────────────────────────────────────────
  const currentCard = pool.length > 0 ? pool[cardIndex] : null;
  const currentTeamData = currentTurn === 'A' ? teamA : teamB;
  const isTimeWarning = timeLeft > 0 && timeLeft <= 10;

  return {
    currentTurn,
    currentTeamData,
    currentCard,
    timeLeft,
    crazyRule,
    isTimeWarning,
    progress: timeLeft / ROUND_DURATION,
    handleCorrectAnswer,
    handleSkip,
  };
}
