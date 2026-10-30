/**
 * Singleton Audio Engine for Portfolio Sound Effects
 * Handles lazy AudioContext creation, node chaining, dynamics compression,
 * humanization, rate limiting, and sound state management.
 */

import { SOUND_CONFIG, SoundName, SoundGroup } from '../config/sound';
import {
  playNavSound,
  playSocialSound,
  playButtonSound,
  playStateSound,
  playHoverSound,
  SoundParams,
} from './sounds';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;

  private isEnabled: boolean = SOUND_CONFIG.SOUND_DEFAULT === 'on';
  // Browsers block audio until the visitor clicks or presses a key, so no context is created before that
  private unlocked = false;
  private listeners = new Set<(enabled: boolean) => void>();

  // Polyphony and rate-limiting trackers
  private activeVoices = 0;
  private lastPlayTime: Record<string, number> = {};

  // Audio file override cache: AudioBuffer | null (null means checked and absent)
  private fileBuffers = new Map<SoundName, AudioBuffer | null>();
  private fileCheckAttempted = new Set<SoundName>();

  constructor() {
    this.initPersistence();
    this.initLifecycleListeners();
  }

  /**
   * Load sound preference from localStorage
   */
  private initPersistence(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(SOUND_CONFIG.STORAGE_KEY);
      if (stored === 'off') {
        this.isEnabled = false;
      } else if (stored === 'on') {
        this.isEnabled = true;
      }
    } catch {
      // Ignore localStorage errors (e.g., privacy mode)
    }
  }

  /**
   * Listen for user gestures to unlock audio and page visibility changes to pause
   */
  private initLifecycleListeners(): void {
    if (typeof window === 'undefined') return;

    // First user gesture triggers context creation & unlock
    const unlockGestures = ['pointerdown', 'keydown', 'touchend'];
    const unlockHandler = () => {
      // Some keys (e.g. Esc) don't count as a user gesture; wait for one that does
      const activation = (navigator as Navigator & { userActivation?: { isActive: boolean } }).userActivation;
      if (activation && !activation.isActive) return;
      this.unlocked = true;
      this.ensureContext();
      unlockGestures.forEach((evt) => {
        window.removeEventListener(evt, unlockHandler, { capture: true });
      });
    };

    unlockGestures.forEach((evt) => {
      window.addEventListener(evt, unlockHandler, { capture: true, passive: true });
    });

    // Suspend audio context when tab is hidden, resume when visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.ctx && this.ctx.state === 'running') {
          this.ctx.suspend().catch(() => {});
        }
      } else if (this.isEnabled && this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    });
  }

  /**
   * Ensure AudioContext and master processing nodes are initialized
   */
  public ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      if (!this.unlocked) return null;
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioCtx) return null;

      try {
        this.ctx = new AudioCtx();

        // 1. Master Dynamics Compressor
        this.compressorNode = this.ctx.createDynamicsCompressor();
        this.compressorNode.threshold.setValueAtTime(SOUND_CONFIG.COMPRESSOR.threshold, this.ctx.currentTime);
        this.compressorNode.knee.setValueAtTime(SOUND_CONFIG.COMPRESSOR.knee, this.ctx.currentTime);
        this.compressorNode.ratio.setValueAtTime(SOUND_CONFIG.COMPRESSOR.ratio, this.ctx.currentTime);
        this.compressorNode.attack.setValueAtTime(SOUND_CONFIG.COMPRESSOR.attack, this.ctx.currentTime);
        this.compressorNode.release.setValueAtTime(SOUND_CONFIG.COMPRESSOR.release, this.ctx.currentTime);
        this.compressorNode.connect(this.ctx.destination);

        // 2. Master Gain Node
        this.masterGainNode = this.ctx.createGain();
        this.masterGainNode.gain.setValueAtTime(
          this.isEnabled ? SOUND_CONFIG.MASTER_VOLUME : 0,
          this.ctx.currentTime
        );
        this.masterGainNode.connect(this.compressorNode);
      } catch (err) {
        console.warn('Failed to initialize AudioContext:', err);
        return null;
      }
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Check if sound is globally enabled in persistent user settings
   */
  public isSoundEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Check if sound is actively playing (enabled)
   */
  public isSoundActive(): boolean {
    return this.isEnabled;
  }

  /**
   * Get the master GainNode to route secondary buses (like intro bus) into master chain
   */
  public getMasterGainNode(): GainNode | null {
    this.ensureContext();
    return this.masterGainNode;
  }

  /**
   * Get the master compressor node to route audio directly if ignoring saved mute
   */
  public getCompressorNode(): DynamicsCompressorNode | null {
    this.ensureContext();
    return this.compressorNode;
  }

  /**
   * Get the current AudioContext instance
   */
  public getContext(): AudioContext | null {
    return this.ensureContext();
  }

  /**
   * Set sound state on/off with persistence
   */
  public setSoundEnabled(enabled: boolean): void {
    if (this.isEnabled === enabled) return;
    this.isEnabled = enabled;

    try {
      localStorage.setItem(SOUND_CONFIG.STORAGE_KEY, enabled ? 'on' : 'off');
    } catch {
      // Storage unavailable
    }

    if (this.masterGainNode && this.ctx) {
      const targetGain = enabled ? SOUND_CONFIG.MASTER_VOLUME : 0;
      this.masterGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGainNode.gain.setValueAtTime(this.masterGainNode.gain.value, this.ctx.currentTime);
      this.masterGainNode.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.100);
    }

    if (enabled) {
      this.ensureContext();
    }

    this.notifyListeners();
  }

  /**
   * Toggle sound on/off
   */
  public toggleSound(): boolean {
    const nextState = !this.isEnabled;
    this.setSoundEnabled(nextState);
    return nextState;
  }

  /**
   * Subscribe to sound toggle state changes
   */
  public subscribe(listener: (enabled: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.isSoundActive()));
  }

  /**
   * Check for optional audio file overrides at /sounds/{name}.mp3
   */
  private async loadFileOverride(name: SoundName): Promise<AudioBuffer | null> {
    if (this.fileCheckAttempted.has(name)) {
      return this.fileBuffers.get(name) || null;
    }

    this.fileCheckAttempted.add(name);
    try {
      const res = await fetch(`/sounds/${name}.mp3`, { method: 'HEAD' });
      if (res.ok && this.ctx) {
        const fullRes = await fetch(`/sounds/${name}.mp3`);
        const arrayBuf = await fullRes.arrayBuffer();
        const decoded = await this.ctx.decodeAudioData(arrayBuf);
        this.fileBuffers.set(name, decoded);
        return decoded;
      }
    } catch {
      // File override not found; fall back to Web Audio synthesis
    }

    this.fileBuffers.set(name, null);
    return null;
  }

  /**
   * Core Play Method
   * Enforces mute state, visibility, polyphony, rate limiting, humanization, and synthesis.
   */
  public play(name: SoundName, customParams?: SoundParams): void {
    // 1. Guard against mute and hidden tabs
    if (!this.isEnabled) return;
    if (typeof document !== 'undefined' && document.hidden) return;

    const ctx = this.ensureContext();
    if (!ctx || !this.masterGainNode) return;

    const now = performance.now();

    // 2. Rate limiting per sound
    const minInterval =
      name === 'hover' ? SOUND_CONFIG.LIMITS.hoverRateLimitMs : SOUND_CONFIG.LIMITS.rateLimitMs;
    const last = this.lastPlayTime[name] || 0;
    if (now - last < minInterval) return;
    this.lastPlayTime[name] = now;

    // 3. Polyphony limiting (at most 6 simultaneous voices)
    if (this.activeVoices >= SOUND_CONFIG.LIMITS.maxPolyphony && name === 'hover') {
      return; // Drop optional hover if busy
    }

    // 4. Humanization (+/- 3% pitch, +/- 8% gain)
    const pitchJitter = 1 + (Math.random() * 2 - 1) * SOUND_CONFIG.HUMANIZE.pitchVariance;
    const gainJitter = 1 + (Math.random() * 2 - 1) * SOUND_CONFIG.HUMANIZE.gainVariance;

    const finalParams: SoundParams = {
      pitch: (customParams?.pitch ?? 1.0) * pitchJitter,
      gain: (customParams?.gain ?? 1.0) * gainJitter,
    };

    // 5. Check if file override is cached
    const override = this.fileBuffers.get(name);
    if (override) {
      this.playBuffer(override, finalParams);
      return;
    }

    // Attempt async lookup if not checked before
    if (!this.fileCheckAttempted.has(name)) {
      this.loadFileOverride(name);
    }

    // 6. Voice node for individual gain scaling
    const voiceGain = ctx.createGain();
    voiceGain.gain.setValueAtTime(1.0, ctx.currentTime);
    voiceGain.connect(this.masterGainNode);

    this.activeVoices++;
    let duration = 0.05;

    try {
      switch (name) {
        case 'nav':
          duration = playNavSound(ctx, voiceGain, finalParams);
          break;
        case 'social':
          duration = playSocialSound(ctx, voiceGain, finalParams);
          break;
        case 'button':
          duration = playButtonSound(ctx, voiceGain, finalParams);
          break;
        case 'state':
          duration = playStateSound(ctx, voiceGain, finalParams);
          break;
        case 'hover':
          duration = playHoverSound(ctx, voiceGain, finalParams);
          break;
      }
    } catch (err) {
      console.warn(`Error playing sound "${name}":`, err);
    }

    // Release voice count and disconnect voice gain node after playback completes
    setTimeout(() => {
      this.activeVoices = Math.max(0, this.activeVoices - 1);
      try {
        voiceGain.disconnect();
      } catch {
        // Node already disconnected
      }
    }, (duration + 0.05) * 1000);
  }

  /**
   * Play an audio buffer override
   */
  private playBuffer(buffer: AudioBuffer, params: SoundParams): void {
    if (!this.ctx || !this.masterGainNode) return;
    try {
      const src = this.ctx.createBufferSource();
      const gain = this.ctx.createGain();
      src.buffer = buffer;
      src.playbackRate.setValueAtTime(params.pitch ?? 1.0, this.ctx.currentTime);
      gain.gain.setValueAtTime(params.gain ?? 1.0, this.ctx.currentTime);

      src.connect(gain);
      gain.connect(this.masterGainNode);
      src.start();
    } catch (err) {
      console.warn('Failed to play buffer override:', err);
    }
  }

  /**
   * Play sound for a group
   */
  public playGroup(group: SoundGroup, customParams?: SoundParams): void {
    this.play(group, customParams);
  }
}

// Export singleton instance
export const soundEngine = new SoundEngine();
