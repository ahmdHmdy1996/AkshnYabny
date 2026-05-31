/**
 * useGameLoop — core game-round state machine
 *
 * Fixes applied:
 *   • 3-2-1 countdown before timer starts
 *   • Skip no longer plays error sound (it's just a card change)
 *   • Multiple mode: no error buzzer on time-up if team answered correctly this round
 *   • Last-round navigation: goes directly to /winner when it's Team B's final round
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useAudioPlayer } from 'expo-audio';

import { useGameStore }  from '../../../store/useGameStore';
import { MOVIES }        from '../../../data/movies';
import { CRAZY_RULES }   from '../../../constants/mockData';
import { ContentItem }   from '../../../types/game.types';
import { timerPulse }    from '../../../utils/haptics';
import { TICK_SOURCE }   from '../../../utils/audio';

const SUCCESS_SOURCE = require('../../../../assets/sounds/success.mp3') as number;
const ERROR_SOURCE   = require('../../../../assets/sounds/error.mp3')   as number;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function categoryPool(selectedCategories: string[]) {
  return MOVIES.filter((item) => selectedCategories.includes(item.category));
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGameLoop() {
  const router = useRouter();

  const {
    selectedCategories,
    crazyRulesEnabled,
    currentTurn,
    teamA,
    teamB,
    gameMode,
    usedItemIds,
    roundDuration,
    skipLimit,
    teamASkipsUsed,
    teamBSkipsUsed,
    isSoundEnabled,
    currentRound,
    maxRounds,
    incrementScore,
    setPhase,
    markItemUsed,
    resetCategoryPool,
    incrementSkipsUsed,
  } = useGameStore();

  // ── Audio players ────────────────────────────────────────────────────────────
  const tickPlayer    = useAudioPlayer(TICK_SOURCE);
  const successPlayer = useAudioPlayer(SUCCESS_SOURCE);
  const errorPlayer   = useAudioPlayer(ERROR_SOURCE);
  const canTick = isSoundEnabled && TICK_SOURCE !== null;

  const playSuccess = useCallback(() => {
    if (!isSoundEnabled) return;
    try { successPlayer.seekTo(0); successPlayer.play(); } catch { /* ignore */ }
  }, [isSoundEnabled, successPlayer]);

  const playError = useCallback(() => {
    if (!isSoundEnabled) return;
    try { errorPlayer.seekTo(0); errorPlayer.play(); } catch { /* ignore */ }
  }, [isSoundEnabled, errorPlayer]);

  // ── Crazy rule (stable ref) ──────────────────────────────────────────────────
  const crazyRule = useRef<string | null>(
    crazyRulesEnabled && CRAZY_RULES.length > 0 ? pickRandom(CRAZY_RULES) : null
  ).current;

  // ── Initial card ─────────────────────────────────────────────────────────────
  const [currentCard, setCurrentCard] = useState<ContentItem | null>(() => {
    const pool = categoryPool(selectedCategories);
    if (pool.length === 0) return null;
    const available = pool.filter((item) => !usedItemIds.includes(item.id));
    return pickRandom(available.length > 0 ? available : pool);
  });

  // ── 3-2-1 Countdown before timer starts ─────────────────────────────────────
  // countdown:  3 → 2 → 1 → 0 ("يلا!" frame) → -1 (overlay hidden, game live)
  const [countdown, setCountdown] = useState(3);
  const countdownDone = countdown < 0;

  useEffect(() => {
    if (countdown < 0) return;
    // After reaching 0 ("يلا!" frame), wait a bit longer before hiding overlay
    const delay = countdown === 0 ? 800 : 1000;
    const id = setTimeout(() => setCountdown((c) => c - 1), delay);
    return () => clearTimeout(id);
  }, [countdown]);

  // ── Game timer (only runs after countdown) ───────────────────────────────────
  const [timeLeft,  setTimeLeft]  = useState(roundDuration);
  const [isActive,  setIsActive]  = useState(true);
  const hasNavigated = useRef(false);

  // Track whether team answered correctly this round (for multiple mode)
  const hasAnsweredCorrectly = useRef(false);

  useEffect(() => {
    if (!isActive || !countdownDone) return;
    const id = setInterval(
      () => setTimeLeft((t) => (t > 0 ? t - 1 : 0)),
      1000
    );
    return () => clearInterval(id);
  }, [isActive, countdownDone]);

  // ── Determine if this is the final turn of the game ──────────────────────────
  const isFinalTurn = currentTurn === 'B' && currentRound >= maxRounds;

  // ── Time-up → results or winner ──────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft === 0 && !hasNavigated.current) {
      hasNavigated.current = true;
      setIsActive(false);
      if (canTick) { try { tickPlayer.pause(); } catch { /* ignore */ } }

      // Only play error if team didn't answer correctly in this round (multiple mode)
      const shouldPlayError = gameMode === 'single' || !hasAnsweredCorrectly.current;
      if (shouldPlayError) playError();

      if (currentCard) markItemUsed(currentCard.id);
      setPhase('roundEnd');

      if (isFinalTurn) {
        router.push('/winner');
      } else {
        router.push('/results');
      }
    }
  }, [timeLeft, setPhase, router, tickPlayer, canTick, currentCard, markItemUsed, playError, isFinalTurn, gameMode]);

  // ── Haptic + tick sound in last 10 seconds ───────────────────────────────────
  useEffect(() => {
    if (!countdownDone) return;
    if (timeLeft > 0 && timeLeft <= 10) {
      timerPulse();
      if (canTick) {
        try { tickPlayer.seekTo(0); tickPlayer.play(); }
        catch { /* sound not loaded — silent fallback */ }
      }
    }
  }, [timeLeft, canTick, tickPlayer, countdownDone]);

  // ── End-turn (single-mode correct / explicit early exit) ─────────────────────
  const endTurn = useCallback(() => {
    if (!hasNavigated.current) {
      hasNavigated.current = true;
      setIsActive(false);
      if (canTick) { try { tickPlayer.pause(); } catch { /* ignore */ } }
      if (currentCard) markItemUsed(currentCard.id);
      setPhase('roundEnd');

      if (isFinalTurn) {
        router.push('/winner');
      } else {
        router.push('/results');
      }
    }
  }, [setPhase, router, tickPlayer, canTick, currentCard, markItemUsed, isFinalTurn]);

  // ── Advance to the next card ──────────────────────────────────────────────────
  const advanceCard = useCallback(() => {
    if (!currentCard) return;

    const forCategories = categoryPool(selectedCategories);
    if (forCategories.length === 0) return;

    const updatedUsed = [...usedItemIds, currentCard.id];
    let   pool        = forCategories.filter((item) => !updatedUsed.includes(item.id));

    if (pool.length === 0) {
      resetCategoryPool(forCategories.map((item) => item.id));
      markItemUsed(currentCard.id);
      pool = forCategories.filter((item) => item.id !== currentCard.id);
      if (pool.length === 0) pool = forCategories;
    } else {
      markItemUsed(currentCard.id);
    }

    setCurrentCard(pickRandom(pool));
  }, [currentCard, usedItemIds, selectedCategories, markItemUsed, resetCategoryPool]);

  // ── Skip gate & counters ─────────────────────────────────────────────────────
  const currentTeamSkipsUsed = currentTurn === 'A' ? teamASkipsUsed : teamBSkipsUsed;
  const halfTimeThreshold    = Math.floor(roundDuration / 2);
  const isHalfTimePassed     = timeLeft <= halfTimeThreshold;
  const isSkipLimitReached   = skipLimit !== null && currentTeamSkipsUsed >= skipLimit;
  const isSkipDisabled       = !countdownDone || !isHalfTimePassed || isSkipLimitReached;

  const skipsRemaining: number | null =
    skipLimit !== null ? Math.max(0, skipLimit - currentTeamSkipsUsed) : null;

  // ── Skip: −5 s penalty + advance — NO error sound (it's just a card change) ──
  const handleSkip = useCallback(() => {
    if (isSkipDisabled) return;
    // No error sound on skip — skip is a neutral card change, not a mistake
    incrementSkipsUsed(currentTurn);
    setTimeLeft((prev) => Math.max(0, prev - 5));
    advanceCard();
  }, [isSkipDisabled, incrementSkipsUsed, currentTurn, advanceCard]);

  // ── Correct answer ────────────────────────────────────────────────────────────
  const handleCorrectAnswer = useCallback(() => {
    playSuccess();
    incrementScore(currentTurn);
    hasAnsweredCorrectly.current = true;
    if (gameMode === 'single') { endTurn(); return; }
    advanceCard();
  }, [currentTurn, incrementScore, gameMode, endTurn, advanceCard, playSuccess]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const currentTeamData = currentTurn === 'A' ? teamA : teamB;
  const isTimeWarning   = countdownDone && timeLeft > 0 && timeLeft <= 10;

  return {
    currentTurn,
    currentTeamData,
    currentCard,
    timeLeft,
    crazyRule,
    isTimeWarning,
    progress: timeLeft / roundDuration,
    isSkipDisabled,
    skipsRemaining,
    countdown,
    countdownDone,
    handleCorrectAnswer,
    handleSkip,
  };
}
