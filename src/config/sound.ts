/**
 * UI Sound System Configuration
 */

export type SoundName = 'nav' | 'social' | 'button' | 'state' | 'hover';
export type SoundGroup = 'nav' | 'social' | 'button';

/**
 * Global sound defaults and feature toggles
 */
export const SOUND_CONFIG = {
  /** Default sound state ('on' | 'off'). Off until the visitor turns it on; the choice is remembered. */
  SOUND_DEFAULT: 'off' as 'on' | 'off',

  /** Enable subtle 6ms 1200Hz tick on hover for nav links & social icons on fine pointers */
  HOVER_SOUNDS: true,

  /** Master volume gain (0.0 to 1.0) */
  MASTER_VOLUME: 0.7,

  /** Dynamics compressor settings */
  COMPRESSOR: {
    threshold: -14, // dB
    knee: 20,       // dB
    ratio: 6,
    attack: 0.003,  // 3ms
    release: 0.120, // 120ms
  },

  /** Humanization variations */
  HUMANIZE: {
    pitchVariance: 0.03, // +/- 3%
    gainVariance: 0.08,  // +/- 8%
  },

  /** Concurrency and rate limiting */
  LIMITS: {
    rateLimitMs: 40,      // Minimum interval between same sound
    hoverRateLimitMs: 80, // Minimum interval between hover sounds
    maxPolyphony: 6,      // Maximum simultaneous voices
  },

  /** LocalStorage key for user preference persistence */
  STORAGE_KEY: 'portfolio:sound',
} as const;
