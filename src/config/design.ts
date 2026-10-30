/**
 * Design Configuration Flags
 * 
 * Every visual effect and layout module can be toggled independently.
 * All flags default to true per specification.
 */

export const DESIGN_FLAGS = {
  AMBIENT_BG: true,
  GRID: true,
  GRAIN: true,
  CURSOR_GLOW: true,
  DUST: true,
  SMOOTH_SCROLL: true,
  MAGNETIC_BUTTONS: false,
  TILT: true,
  STICKY_PROJECTS: true,
  TERMINAL_TILE: true,
  TECH_MARQUEE: true,
  FOOTER_WORDMARK: true,
  MONO_ACCENT_LABELS: false,
} as const;

export type DesignFlagKey = keyof typeof DESIGN_FLAGS;

export const {
  AMBIENT_BG,
  GRID,
  GRAIN,
  CURSOR_GLOW,
  DUST,
  SMOOTH_SCROLL,
  MAGNETIC_BUTTONS,
  TILT,
  STICKY_PROJECTS,
  TERMINAL_TILE,
  TECH_MARQUEE,
  FOOTER_WORDMARK,
  MONO_ACCENT_LABELS,
} = DESIGN_FLAGS;
