/**
 * Centralised haptic feedback wrappers.
 *
 * All calls are fire-and-forget (no awaiting at call sites) and silently
 * swallow errors so simulator / low-end Android devices never crash.
 */
import * as Haptics from 'expo-haptics';

// ─── Internal helper ──────────────────────────────────────────────────────────

function fire(fn: () => Promise<void>): void {
  fn().catch(() => {
    // Haptics unsupported on this device — ignore silently
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Subtle tap — navigation, generic button presses. */
export const lightImpact = (): void =>
  fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));

/** Medium tap — meaningful interactions (primary CTAs, round transitions). */
export const mediumImpact = (): void =>
  fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));

/** Celebratory ding — correct answer, winner screen mount. */
export const successFeedback = (): void =>
  fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));

/** Error buzz — skip / wrong action. */
export const errorFeedback = (): void =>
  fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));

/**
 * Urgent tick for the final-10-second countdown.
 * Uses Medium impact so it's clearly felt without being overwhelming.
 */
export const timerPulse = (): void =>
  fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
