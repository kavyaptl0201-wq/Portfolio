/**
 * Global Document Delegated Audio Listeners
 * Implements container-based sound assignment via data-sound-group and data-sound.
 */

import { soundEngine } from './soundEngine';
import { SOUND_CONFIG, SoundGroup, SoundName } from '../config/sound';

let isInitialized = false;

export function initSoundDelegation(): () => void {
  if (isInitialized || typeof document === 'undefined') {
    return () => {};
  }
  isInitialized = true;

  // 1. Delegated Click Listener
  const handleClick = (e: MouseEvent) => {
    if (!soundEngine.isSoundEnabled()) return;

    const target = e.target as HTMLElement | null;
    if (!target) return;

    // A. Disabled or demo elements are strictly silent
    const disabledEl = target.closest(
      'button[disabled], [aria-disabled="true"], input[disabled], .disabled, [disabled]'
    );
    if (disabledEl) {
      return;
    }

    // B. Check for explicit data-sound attribute on element or nearest ancestor
    const soundOverrideEl = target.closest<HTMLElement>('[data-sound]');
    if (soundOverrideEl) {
      const override = soundOverrideEl.getAttribute('data-sound');
      if (override === 'none') {
        return; // Opt out
      }
      if (
        override === 'nav' ||
        override === 'social' ||
        override === 'button' ||
        override === 'state'
      ) {
        soundEngine.play(override as SoundName);
        return;
      }
    }

    // C. Check for nearest container with data-sound-group
    const groupEl = target.closest<HTMLElement>('[data-sound-group]');
    if (groupEl) {
      const group = groupEl.getAttribute('data-sound-group') as SoundGroup | null;
      if (group === 'nav' || group === 'social' || group === 'button') {
        soundEngine.playGroup(group);
        return;
      }
    }

    // D. If NO group ancestor, check if element is an interactive control:
    // button, a, [role=button], [role=tab], input[type=submit]
    const interactiveEl = target.closest(
      'button, a, [role="button"], [role="tab"], input[type="submit"], input[type="button"]'
    );
    if (interactiveEl) {
      soundEngine.play('button');
    }
  };

  // 2. Delegated Hover Listener (Quiet tick on fine-pointer devices for nav & social)
  let lastHoverElement: Element | null = null;

  const handlePointerOver = (e: PointerEvent) => {
    if (!soundEngine.isSoundEnabled()) return;
    if (!SOUND_CONFIG.HOVER_SOUNDS) return;
    if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) return;

    const target = e.target as HTMLElement | null;
    if (!target) return;

    const interactiveEl = target.closest('a, button, [role="button"], [role="tab"]');
    if (!interactiveEl || interactiveEl === lastHoverElement) return;
    lastHoverElement = interactiveEl;

    // Silent if disabled or opted out
    if (interactiveEl.closest('button[disabled], [aria-disabled="true"], [data-sound="none"]')) {
      return;
    }

    // Only for nav links and social icons
    const groupEl = interactiveEl.closest<HTMLElement>('[data-sound-group]');
    if (groupEl) {
      const group = groupEl.getAttribute('data-sound-group');
      if (group === 'nav' || group === 'social') {
        soundEngine.play('hover');
      }
    }
  };

  document.addEventListener('click', handleClick, { capture: true, passive: true });
  document.addEventListener('pointerover', handlePointerOver, { capture: true, passive: true });

  return () => {
    document.removeEventListener('click', handleClick, { capture: true });
    document.removeEventListener('pointerover', handlePointerOver, { capture: true });
    isInitialized = false;
  };
}
