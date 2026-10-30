/**
 * In-memory state for the cinematic hero intro (nothing is persisted).
 *
 * Behavior:
 * - Every full page load (first visit or refresh): intro plays.
 * - Client-side navigation back to the home page: intro does NOT replay.
 */

let hasHeroIntroPlayed = false;
let hasPortraitDone = false;

// Remove leftover flags saved by older versions of the site
try {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    window.sessionStorage.removeItem('hero_intro_played');
    window.sessionStorage.removeItem('portfolio_intro_done');
  }
} catch {
  // Gracefully handle environments with restricted storage
}

type IntroListener = (played: boolean) => void;
type PortraitDoneListener = () => void;

const listeners = new Set<IntroListener>();
const portraitDoneListeners = new Set<PortraitDoneListener>();

export const getHeroIntroPlayed = (): boolean => {
  return hasHeroIntroPlayed;
};

export const getPortraitDone = (): boolean => {
  return hasPortraitDone || hasHeroIntroPlayed;
};

export const markHeroIntroPlayed = (): void => {
  hasHeroIntroPlayed = true;
  hasPortraitDone = true;
  portraitDoneListeners.forEach((fn) => fn());
  listeners.forEach((fn) => fn(true));
};

export const markPortraitDone = (): void => {
  hasPortraitDone = true;
  portraitDoneListeners.forEach((fn) => fn());
};

export const subscribeHeroIntro = (fn: IntroListener): (() => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export const subscribePortraitDone = (fn: PortraitDoneListener): (() => void) => {
  portraitDoneListeners.add(fn);
  return () => {
    portraitDoneListeners.delete(fn);
  };
};
