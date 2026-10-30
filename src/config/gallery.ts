/**
 * Gallery and Photography Ring Configuration Tokens
 */

export const GALLERY_CONFIG = {
  PLACEHOLDER_COUNT: 16,
  MIN_RING_CARDS: 16,
  CARD_ASPECT: 3 / 4,
  AUTO_ROTATE: 5, // degrees per second idle rotation
  INTRO_SECONDS: 1.5,
  MOTION_BLUR: true,
  SOUND: true,
  CAMERA: {
    PERSPECTIVE: 1000, // px - balanced perspective
    PITCH_INTRO: 18, // degrees gentle intro pitch
    PITCH_SETTLED: 0, // degrees centered eye-level
    DOLLY_INTRO: -0.2, // multiplier of radius R
    DOLLY_SETTLED: 0.0, // multiplier of radius R - centered and stable
  },
  INERTIA: {
    DAMPING: 0.92, // per frame at 60fps
    THRESHOLD_BLUR_SPEED: 40, // deg/s
    MAX_BLUR: 4, // px
    MAX_SKEW: 5, // degrees
  },
} as const;

export const {
  PLACEHOLDER_COUNT,
  MIN_RING_CARDS,
  CARD_ASPECT,
  AUTO_ROTATE,
  INTRO_SECONDS,
  MOTION_BLUR,
  SOUND,
} = GALLERY_CONFIG;
