/**
 * Utility functions for haptic feedback on mobile devices
 */

// Check if the device supports vibration
const hasVibration = (): boolean => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
};

/**
 * Trigger a light haptic feedback (short vibration)
 */
export const lightHapticFeedback = (): void => {
  if (hasVibration()) {
    navigator.vibrate(10); // 10ms vibration
  }
};

/**
 * Trigger a medium haptic feedback (medium vibration)
 */
export const mediumHapticFeedback = (): void => {
  if (hasVibration()) {
    navigator.vibrate(20); // 20ms vibration
  }
};

/**
 * Trigger a heavy haptic feedback (longer vibration)
 */
export const heavyHapticFeedback = (): void => {
  if (hasVibration()) {
    navigator.vibrate(30); // 30ms vibration
  }
};

/**
 * Trigger a success haptic feedback (double vibration)
 */
export const successHapticFeedback = (): void => {
  if (hasVibration()) {
    navigator.vibrate([10, 30, 10]); // pattern: vibrate, pause, vibrate
  }
};

/**
 * Trigger an error haptic feedback (triple vibration)
 */
export const errorHapticFeedback = (): void => {
  if (hasVibration()) {
    navigator.vibrate([30, 20, 30, 20, 30]); // pattern: vibrate, pause, vibrate, pause, vibrate
  }
};

/**
 * Trigger a notification haptic feedback
 */
export const notificationHapticFeedback = (): void => {
  if (hasVibration()) {
    navigator.vibrate([10, 50, 20]); // pattern: short, pause, medium
  }
};

/**
 * Trigger a custom haptic feedback pattern
 * @param pattern Array of durations in milliseconds where even indices are vibration durations and odd indices are pause durations
 */
export const customHapticFeedback = (pattern: number[]): void => {
  if (hasVibration()) {
    navigator.vibrate(pattern);
  }
};
