import { Audio } from 'expo-av';
import { useGameStore } from '../store/useGameStore';

type SoundKey = 'success' | 'error' | 'tick' | 'cheer';

// Drop .mp3 files into assets/sounds/ and uncomment the matching require() line.
const SOURCES: Record<SoundKey, ReturnType<typeof require> | null> = {
  success: null, // require('../../assets/sounds/success.mp3'),
  error:   null, // require('../../assets/sounds/error.mp3'),
  tick:    null, // require('../../assets/sounds/tick.mp3'),
  cheer:   null, // require('../../assets/sounds/cheer.mp3'),
};

let audioModeReady = false;

async function ensureAudioMode(): Promise<void> {
  if (audioModeReady) return;
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  audioModeReady = true;
}

async function play(key: SoundKey): Promise<void> {
  if (!useGameStore.getState().isSoundEnabled) return;
  const source = SOURCES[key];
  if (source === null) return;

  await ensureAudioMode();
  const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: true });
  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.isLoaded && status.didJustFinish) {
      sound.unloadAsync();
    }
  });
}

function fireSound(key: SoundKey): void {
  play(key).catch(() => {});
}

export const playSuccessSound = (): void => fireSound('success');
export const playErrorSound   = (): void => fireSound('error');
export const playTickSound    = (): void => fireSound('tick');
export const playCheerSound   = (): void => fireSound('cheer');
