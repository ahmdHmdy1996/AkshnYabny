/**
 * app/_layout.tsx — Root layout with guaranteed hydration gate
 *
 * WHY we block the navigator:
 *   usedItemIds starts as [] in the Zustand store. If the Stack renders before
 *   AsyncStorage resolves, the GameScreen's useState initializer sees an empty
 *   list and treats the entire catalog as "available", ignoring all play history.
 *   By keeping the splash screen visible until loadUsedItemIds() resolves (< 5 ms
 *   on any real device), we guarantee the store is fully populated before any
 *   screen can mount.
 *
 * Timing:
 *   SplashScreen.preventAutoHideAsync() is called at module-evaluation time so
 *   Expo never auto-hides it. We hide it explicitly in the finally{} block once
 *   the store is hydrated and React state is committed.
 */

import { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import { loadUsedItemIds } from '../src/utils/usedIdsStorage';
import { useGameStore }    from '../src/store/useGameStore';

// ── Prevent Expo from auto-hiding the splash before we finish hydration ────────
// Must be called synchronously at module level, before any await.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Silently ignore — thrown when splash is already hidden (e.g. second hot-reload)
});

export default function RootLayout() {
  // Navigator is hidden until we have confirmed the store is hydrated.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function hydrateAndReveal() {
      try {
        console.log('[Layout] Starting AsyncStorage hydration…');
        const ids = await loadUsedItemIds();

        // Push into the store. setUsedItemIds merges rather than replaces, so any
        // markItemUsed calls that raced ahead of hydration are preserved.
        useGameStore.getState().setUsedItemIds(ids);

        console.log(
          `[Layout] Hydration complete — ${ids.length} used ID(s) restored from AsyncStorage.`
        );
      } catch (err) {
        // Storage failure is non-fatal; the game runs with an empty history.
        console.warn('[Layout] Hydration failed — starting with empty history:', err);
      } finally {
        // Allow React to render the navigator, then hide the splash.
        setHydrated(true);
        SplashScreen.hideAsync().catch(() => {});
      }
    }

    hydrateAndReveal();
  }, []); // runs exactly once on cold-start

  // Keep rendering null (splash covers it) until hydration is confirmed.
  if (!hydrated) return null;

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
