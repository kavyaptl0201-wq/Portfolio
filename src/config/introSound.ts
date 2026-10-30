/**
 * Intro Soundscape Configuration & Musical Parameters
 * Warm, round, thocky acoustic soundscape (zero high-pitched plucks or background drones)
 */

export interface IntroSoundSettings {
  INTRO_SOUND: boolean;
  INTRO_VOLUME: number;
  REVERB_WET: number;
  BOUNCE_SOUNDS: boolean;
  LETTER_SOUNDS: boolean;
  SHUFFLE_FLUTTER: boolean;
  SHUFFLE_LANDING: boolean;
  ARRIVAL_CHORD: boolean;
  SETTLE_THOCK: boolean;
  PORTRAIT_SOUNDS: boolean;
  THOCK_PITCH_SHIFT: number;
  INTRO_IGNORES_SAVED_MUTE: boolean;
  MAX_PEAK_DBFS: number;
  REVERB_DURATION: number;
}

export const INTRO_SOUND_CONFIG: IntroSoundSettings = {
  /** Master toggle for intro soundscape */
  INTRO_SOUND: true,

  /** Intro bus volume relative to master gain (default: 0.55) */
  INTRO_VOLUME: 0.55,

  /** Convolver reverb wet send level (default: 0.12) */
  REVERB_WET: 0.12,

  /** Sound layer toggles */
  BOUNCE_SOUNDS: true,
  LETTER_SOUNDS: true,
  SHUFFLE_FLUTTER: true,
  SHUFFLE_LANDING: true,
  ARRIVAL_CHORD: true,
  SETTLE_THOCK: true,
  PORTRAIT_SOUNDS: true,

  /** Global pitch shift for all intro notes in semitones (default: 0) */
  THOCK_PITCH_SHIFT: 0,

  /** If true, intro always plays with sound, even if saved mute is 'off' */
  INTRO_IGNORES_SAVED_MUTE: false,

  /** Maximum peak dBFS threshold for intro soundscape */
  MAX_PEAK_DBFS: -12.0,

  /** Reverb impulse response duration in seconds */
  REVERB_DURATION: 0.9,
};

/**
 * C Major Pentatonic Scale tuning frequencies (Hz) - 2 octaves lower
 * Note: Never randomized; kept precisely in tune for ear comfort.
 */
export const PENTATONIC_SCALE = {
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  G3: 196.00,
  A3: 220.00,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  G4: 392.00,
} as const;

/**
 * Letter Launch Notes mapping (8 letters: H A R S H R A J)
 * C major pentatonic, low and warm.
 * H C3, A D3, R E3, S G3, H A3, R C4, A D4, J E4
 */
export const LETTER_NOTES = [
  PENTATONIC_SCALE.C3, // H
  PENTATONIC_SCALE.D3, // A
  PENTATONIC_SCALE.E3, // R
  PENTATONIC_SCALE.G3, // S
  PENTATONIC_SCALE.A3, // H
  0,                   // (Space)
  PENTATONIC_SCALE.C4, // R
  PENTATONIC_SCALE.D4, // A
  PENTATONIC_SCALE.E4, // J
] as const;

/**
 * Shuffle Landing Notes mapping (9 slots: P O R T F O L I O)
 * P C3, O D3, R E3, T G3, F A3, O C4, L D4, I E4, O G4
 */
export const SHUFFLE_LANDING_NOTES = [
  PENTATONIC_SCALE.C3, // P
  PENTATONIC_SCALE.D3, // O
  PENTATONIC_SCALE.E3, // R
  PENTATONIC_SCALE.G3, // T
  PENTATONIC_SCALE.A3, // F
  PENTATONIC_SCALE.C4, // O
  PENTATONIC_SCALE.D4, // L
  PENTATONIC_SCALE.E4, // I
  PENTATONIC_SCALE.G4, // O
] as const;
