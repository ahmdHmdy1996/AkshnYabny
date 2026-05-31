/**
 * src/utils/audio.ts — sound sources only
 *
 * All audio players are created via useAudioPlayer() hooks inside the
 * components/hooks that need them. This gives proper React lifecycle
 * management and guarantees the asset is loaded before play() is called.
 *
 * Files:
 *   assets/Tick.mp3              — countdown tick (used in useGameLoop)
 *   assets/sounds/success.mp3   — correct answer  (used in useGameLoop)
 *   assets/sounds/error.mp3     — skip / time-up  (used in useGameLoop)
 *   assets/sounds/cheer.mp3     — winner fanfare   (used in WinnerScreen)
 */

// ─── Tick sound source ────────────────────────────────────────────────────────
// Exported so useGameLoop can pass it to useAudioPlayer.
export const TICK_SOURCE = require('../../assets/Tick.mp3') as number;
