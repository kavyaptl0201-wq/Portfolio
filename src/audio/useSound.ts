/**
 * React Hook for UI Sound Effects
 * Synchronizes with the soundEngine singleton and provides intuitive trigger methods.
 */

import { useState, useEffect, useCallback } from 'react';
import { soundEngine } from './soundEngine';
import { SoundName, SoundGroup } from '../config/sound';
import { SoundParams } from './sounds';

export function useSound() {
  const [isSoundEnabled, setIsSoundEnabledState] = useState<boolean>(() =>
    soundEngine.isSoundEnabled()
  );

  useEffect(() => {
    // Keep local state synchronized with singleton state
    const unsubscribe = soundEngine.subscribe((enabled) => {
      setIsSoundEnabledState(enabled);
    });
    return unsubscribe;
  }, []);

  const play = useCallback((name: SoundName, params?: SoundParams) => {
    soundEngine.play(name, params);
  }, []);

  const playGroup = useCallback((group: SoundGroup, params?: SoundParams) => {
    soundEngine.playGroup(group, params);
  }, []);

  const playNav = useCallback((params?: SoundParams) => {
    soundEngine.play('nav', params);
  }, []);

  const playSocial = useCallback((params?: SoundParams) => {
    soundEngine.play('social', params);
  }, []);

  const playButton = useCallback((params?: SoundParams) => {
    soundEngine.play('button', params);
  }, []);

  const playState = useCallback((params?: SoundParams) => {
    soundEngine.play('state', params);
  }, []);

  const playHover = useCallback((params?: SoundParams) => {
    soundEngine.play('hover', params);
  }, []);

  const toggleSound = useCallback(() => {
    return soundEngine.toggleSound();
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    soundEngine.setSoundEnabled(enabled);
  }, []);

  return {
    isSoundEnabled,
    toggleSound,
    setSoundEnabled,
    play,
    playGroup,
    playNav,
    playSocial,
    playButton,
    playState,
    playHover,
  };
}
