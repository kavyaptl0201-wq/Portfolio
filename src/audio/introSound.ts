/**
 * Cinematic Intro Soundscape Engine
 * 100% Code-Synthesized Web Audio System
 *
 * Implements ear-comfort rules:
 * - Pure sine oscillators only (plus an 8ms filtered white-noise tap). ZERO sawtooth, square, or triangle.
 * - Warm, round, thocky acoustic character (low, soft, slightly hollow wood tap).
 * - Lowpass filter at 1.4kHz (Q 0.5) and highpass at 60Hz on every voice.
 * - Short and dark reverb (0.9s impulse, 1.8kHz lowpass, global wet 0.12).
 * - Low C major pentatonic scale (C3 to G4: 130.81Hz to 392.00Hz; all notes <= 400Hz).
 * - Global pitch shift configurable via THOCK_PITCH_SHIFT semitones.
 * - Zero background drones, swooshes, or pads. Every sound is a discrete event <= 1.2s.
 */

import { soundEngine } from './soundEngine';
import {
  INTRO_SOUND_CONFIG,
  PENTATONIC_SCALE,
  LETTER_NOTES,
  SHUFFLE_LANDING_NOTES,
} from '../config/introSound';

export interface ShuffleTimingPlan {
  startTime: number;
  slotDuration: number;
  slotStagger: number;
  numSlots: number;
  glyphSteps: number;
}

export interface ThockParams {
  f: number;
  level: number;
  bodyDecay?: number; // ms or seconds
  cavityGain?: number;
  tapGain?: number;
  reverbSend?: number;
  time?: number;
}

class IntroSoundEngine {
  private introBus: GainNode | null = null;
  private introHighpass: BiquadFilterNode | null = null;
  private introDryGain: GainNode | null = null;
  private introReverbGain: GainNode | null = null;
  private reverbSendBus: GainNode | null = null;
  private convolverNode: ConvolverNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  // Active voice nodes for cleanup
  private activeVoices = new Set<{ stop: () => void }>();

  // Flutter tap timeouts
  private activeTimeouts: number[] = [];

  // Reverb impulse cached buffer
  private reverbBuffer: AudioBuffer | null = null;

  // Config overrides for Dev Sound Lab
  public config = { ...INTRO_SOUND_CONFIG };

  /**
   * Helper to get pitch multiplier from THOCK_PITCH_SHIFT (semitones)
   */
  public getPitchMultiplier(): number {
    const shift = this.config.THOCK_PITCH_SHIFT || 0;
    return Math.pow(2, shift / 12);
  }

  /**
   * Initialize intro audio bus and reverb routing
   */
  public ensureIntroBus(): boolean {
    const ctx = soundEngine.getContext();
    const masterGain = soundEngine.getMasterGainNode();
    const compressor = soundEngine.getCompressorNode();
    if (!ctx || !masterGain || !compressor) return false;

    if (!this.introBus) {
      // 1. Intro Master Bus (0.55 volume)
      this.introBus = ctx.createGain();
      this.introBus.gain.setValueAtTime(this.config.INTRO_VOLUME, ctx.currentTime);
      
      // If intro ignores saved mute and sound is currently muted, route directly into compressor
      if (this.config.INTRO_IGNORES_SAVED_MUTE && !soundEngine.isSoundEnabled()) {
        this.introBus.connect(compressor);
      } else {
        this.introBus.connect(masterGain);
      }

      // 2. Highpass filter at 60Hz on the bus
      this.introHighpass = ctx.createBiquadFilter();
      this.introHighpass.type = 'highpass';
      this.introHighpass.frequency.setValueAtTime(60, ctx.currentTime);
      this.introHighpass.Q.setValueAtTime(0.707, ctx.currentTime);

      // 3. Dry path
      this.introDryGain = ctx.createGain();
      this.introDryGain.gain.setValueAtTime(1.0, ctx.currentTime);
      this.introHighpass.connect(this.introDryGain);
      this.introDryGain.connect(this.introBus);

      // 4. Stereo Convolver Reverb (0.9s duration, lowpass 1.8kHz)
      this.convolverNode = ctx.createConvolver();
      if (!this.reverbBuffer) {
        this.reverbBuffer = this.generateStereoImpulse(ctx, this.config.REVERB_DURATION);
      }
      this.convolverNode.buffer = this.reverbBuffer;

      this.introReverbGain = ctx.createGain();
      this.introReverbGain.gain.setValueAtTime(this.config.REVERB_WET, ctx.currentTime);
      this.convolverNode.connect(this.introReverbGain);
      this.introReverbGain.connect(this.introBus);

      // 5. Shared Reverb Send Bus
      this.reverbSendBus = ctx.createGain();
      this.reverbSendBus.gain.setValueAtTime(1.0, ctx.currentTime);
      this.reverbSendBus.connect(this.convolverNode);

      // 6. Pre-generate reusable noise buffer
      if (!this.noiseBuffer) {
        this.noiseBuffer = this.generateNoiseBuffer(ctx, 2.0);
      }
    }

    return true;
  }

  /**
   * Generate 0.9s stereo room impulse response
   * Exponentially decaying noise lowpassed at 1.8kHz for a dark, warm space
   */
  private generateStereoImpulse(ctx: AudioContext, duration: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const decayRate = 5.0 / duration;

    // Single-pole lowpass filter forward at 1800Hz
    const dt = 1 / sampleRate;
    const rc = 1 / (2 * Math.PI * 1800);
    const alpha = dt / (rc + dt);

    for (let ch = 0; ch < 2; ch++) {
      const channelData = impulse.getChannelData(ch);
      let y = 0;
      for (let i = 0; i < length; i++) {
        const env = Math.exp(-decayRate * (i / sampleRate));
        const white = (Math.random() * 2 - 1) * env;
        y = y + alpha * (white - y);
        channelData[i] = y * 0.7;
      }
    }

    return impulse;
  }

  /**
   * Pre-generate 2-second buffer of white noise for the tiny tap burst
   */
  private generateNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * seconds);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Helper to determine if Web Audio context is active or running offline
   */
  public isReadyToPlay(ctx: AudioContext): boolean {
    const isOffline = typeof OfflineAudioContext !== 'undefined' && ctx instanceof OfflineAudioContext;
    return ctx.state === 'running' || isOffline;
  }

  /**
   * Fade in intro bus over 30ms at start
   */
  public start(): void {
    if (!this.config.INTRO_SOUND || !soundEngine.isSoundEnabled()) return;
    const ctx = soundEngine.ensureContext();
    if (!ctx || !this.isReadyToPlay(ctx)) return;
    this.ensureIntroBus();

    if (this.introBus) {
      const now = ctx.currentTime;
      this.introBus.gain.cancelScheduledValues(now);
      this.introBus.gain.setValueAtTime(0.0001, now);
      this.introBus.gain.linearRampToValueAtTime(this.config.INTRO_VOLUME, now + 0.030);
    }
  }


  /**
   * Core Voice: "thock"
   * Low, soft, slightly hollow keyboard-like keypress.
   * - BODY: sine sliding 1.5*f -> f over 25ms, attack 2ms, exponential decay to -40dB at bodyDecay.
   * - CAVITY: sine at 2.4*f, attack 1ms, peak level*cavityGain, decay to -40dB at 60ms.
   * - TAP: 8ms white-noise burst through bandpass 700Hz (Q 0.9) and lowpass 1.2kHz.
   * - VOICE FILTER: lowpass 1.4kHz (Q 0.5) and highpass 60Hz.
   * - REVERB: send default 0.10.
   */
  public thock(params: ThockParams): void {
    if (!this.config.INTRO_SOUND || !soundEngine.isSoundEnabled()) return;
    const ctx = soundEngine.getContext();
    if (!ctx || !this.isReadyToPlay(ctx) || !this.ensureIntroBus() || !this.introHighpass || !this.reverbSendBus) return;

    const t0 = params.time ?? ctx.currentTime;
    const pitchMul = this.getPitchMultiplier();
    const f = params.f * pitchMul;
    const level = params.level;
    const bodyDecaySec = (params.bodyDecay && params.bodyDecay > 1)
      ? params.bodyDecay / 1000
      : (params.bodyDecay ?? 0.14);
    const cavityGain = params.cavityGain ?? 0.25;
    const tapGain = params.tapGain ?? 0.05;
    const reverbSend = params.reverbSend ?? 0.10;

    // Common Voice Bus
    const voiceInput = ctx.createGain();
    voiceInput.gain.setValueAtTime(1.0, t0);

    // Voice Filter: Lowpass 1.4kHz (Q 0.5) + Highpass 60Hz
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1400, t0);
    lp.Q.setValueAtTime(0.5, t0);

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(60, t0);
    hp.Q.setValueAtTime(0.707, t0);

    voiceInput.connect(lp);
    lp.connect(hp);

    // Dry connection
    hp.connect(this.introHighpass);

    // Reverb send connection
    const sendGain = ctx.createGain();
    sendGain.gain.setValueAtTime(reverbSend, t0);
    hp.connect(sendGain);
    sendGain.connect(this.reverbSendBus);

    // -------------------------------------------------------------
    // 1. BODY: Sine sliding 1.5*f -> f over 25ms, attack 2ms, decay to -40dB (0.01x) at bodyDecay
    // -------------------------------------------------------------
    const bodyOsc = ctx.createOscillator();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(Math.max(20, 1.5 * f), t0);
    bodyOsc.frequency.exponentialRampToValueAtTime(Math.max(20, f), t0 + 0.025);

    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(0.0001, t0);
    bodyGain.gain.linearRampToValueAtTime(level, t0 + 0.002);
    bodyGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, level * 0.01), t0 + bodyDecaySec);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(voiceInput);

    bodyOsc.start(t0);
    bodyOsc.stop(t0 + bodyDecaySec + 0.02);

    // -------------------------------------------------------------
    // 2. CAVITY: Sine at 2.4*f, attack 1ms, peak level*cavityGain, decay to -40dB at 60ms
    // -------------------------------------------------------------
    const cavityOsc = ctx.createOscillator();
    cavityOsc.type = 'sine';
    cavityOsc.frequency.setValueAtTime(Math.max(20, 2.4 * f), t0);

    const cavityGainNode = ctx.createGain();
    const cavityPeak = level * cavityGain;
    cavityGainNode.gain.setValueAtTime(0.0001, t0);
    cavityGainNode.gain.linearRampToValueAtTime(cavityPeak, t0 + 0.001);
    cavityGainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, cavityPeak * 0.01), t0 + 0.060);

    cavityOsc.connect(cavityGainNode);
    cavityGainNode.connect(voiceInput);

    cavityOsc.start(t0);
    cavityOsc.stop(t0 + 0.08);

    // -------------------------------------------------------------
    // 3. TAP: 8ms white-noise burst through BP 700Hz (Q 0.9) and LP 1.2kHz
    // -------------------------------------------------------------
    if (this.noiseBuffer && tapGain > 0) {
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = this.noiseBuffer;

      const bpFilter = ctx.createBiquadFilter();
      bpFilter.type = 'bandpass';
      bpFilter.frequency.setValueAtTime(700, t0);
      bpFilter.Q.setValueAtTime(0.9, t0);

      const tapLp = ctx.createBiquadFilter();
      tapLp.type = 'lowpass';
      tapLp.frequency.setValueAtTime(1200, t0);

      const tapGainNode = ctx.createGain();
      const tapPeak = tapGain * (level / 0.16);
      tapGainNode.gain.setValueAtTime(0.0001, t0);
      tapGainNode.gain.linearRampToValueAtTime(tapPeak, t0 + 0.001);
      tapGainNode.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.008);

      noiseSrc.connect(bpFilter);
      bpFilter.connect(tapLp);
      tapLp.connect(tapGainNode);
      tapGainNode.connect(voiceInput);

      noiseSrc.start(t0);
      noiseSrc.stop(t0 + 0.015);
    }

    // Register active voice cleanup
    const voiceRef = {
      stop: () => {
        try {
          bodyOsc.stop();
          cavityOsc.stop();
          bodyOsc.disconnect();
          cavityOsc.disconnect();
          voiceInput.disconnect();
        } catch {}
      },
    };
    this.activeVoices.add(voiceRef);
    setTimeout(() => this.activeVoices.delete(voiceRef), (bodyDecaySec + 0.2) * 1000);
  }

  /**
   * Start Gate Click: thock at C4 261.63Hz, level 0.12, bodyDecay 120ms
   */
  public gateClick(time?: number): void {
    this.thock({
      f: PENTATONIC_SCALE.C4,
      level: 0.12,
      bodyDecay: 0.12,
      cavityGain: 0.25,
      tapGain: 0.05,
      reverbSend: 0.10,
      time,
    });
  }

  /**
   * Dot Bounces: soft, deep, round thocks that get lighter each time
   * - Impact 1: thock f=110Hz, level 0.24, bodyDecay 180ms, cavityGain 0.3
   * - Impact 2: thock f=122Hz, level 0.12, bodyDecay 130ms, cavityGain 0.25
   * - Impact 3: thock f=135Hz, level 0.05, bodyDecay 90ms, cavityGain 0.25
   */
  public bounce(n: 1 | 2 | 3, time?: number): void {
    if (!this.config.BOUNCE_SOUNDS) return;

    if (n === 1) {
      this.thock({
        f: 110,
        level: 0.24,
        bodyDecay: 0.18,
        cavityGain: 0.30,
        tapGain: 0.05,
        reverbSend: 0.10,
        time,
      });
    } else if (n === 2) {
      this.thock({
        f: 122,
        level: 0.12,
        bodyDecay: 0.13,
        cavityGain: 0.25,
        tapGain: 0.04,
        reverbSend: 0.10,
        time,
      });
    } else {
      this.thock({
        f: 135,
        level: 0.05,
        bodyDecay: 0.09,
        cavityGain: 0.25,
        tapGain: 0.03,
        reverbSend: 0.08,
        time,
      });
    }
  }

  /**
   * Letters pop out of the dot: thock on the note scale
   * Order: H C3, A D3, R E3, S G3, H A3, R C4, A D4, J E4
   * level 0.16, bodyDecay 160ms, reverb send 0.12
   */
  public letterPop(index: number, time?: number): void {
    if (!this.config.LETTER_SOUNDS) return;
    const baseFreq = LETTER_NOTES[index];
    if (!baseFreq || baseFreq <= 0) return;

    this.thock({
      f: baseFreq,
      level: 0.16,
      bodyDecay: 0.16,
      cavityGain: 0.25,
      tapGain: 0.05,
      reverbSend: 0.12,
      time,
    });
  }

  /**
   * Space character (dot hop): thock f=98Hz, level 0.07, bodyDecay 60ms
   */
  public spaceHop(time?: number): void {
    if (!this.config.LETTER_SOUNDS) return;
    this.thock({
      f: 98,
      level: 0.07,
      bodyDecay: 0.06,
      cavityGain: 0.20,
      tapGain: 0.04,
      reverbSend: 0.10,
      time,
    });
  }

  /**
   * Dot vanishes with J: soft low "pup"
   * Sine gliding 180Hz to 300Hz in 40ms, attack 3ms, decay 90ms, gain 0.12, lowpass 900Hz
   */
  public vanish(time?: number): void {
    if (!this.config.LETTER_SOUNDS) return;
    const ctx = soundEngine.getContext();
    if (!ctx || !this.isReadyToPlay(ctx) || !this.ensureIntroBus() || !this.introHighpass || !this.reverbSendBus) return;

    const t0 = time ?? ctx.currentTime;
    const pitchMul = this.getPitchMultiplier();
    const startF = 180 * pitchMul;
    const endF = 300 * pitchMul;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startF, t0);
    osc.frequency.exponentialRampToValueAtTime(endF, t0 + 0.040);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(900, t0);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, t0);
    gainNode.gain.linearRampToValueAtTime(0.12, t0 + 0.003);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t0 + 0.090);

    osc.connect(lp);
    lp.connect(gainNode);
    gainNode.connect(this.introHighpass);

    const send = ctx.createGain();
    send.gain.setValueAtTime(0.12, t0);
    gainNode.connect(send);
    send.connect(this.reverbSendBus);

    osc.start(t0);
    osc.stop(t0 + 0.11);
  }

  /**
   * nameComplete (about 250ms after J): one warm low note
   * Sine G3 196Hz, attack 25ms, decay to -40dB at 500ms, gain 0.06, lowpass 800Hz, reverb send 0.25
   */
  public nameComplete(time?: number): void {
    if (!this.config.LETTER_SOUNDS) return;
    const ctx = soundEngine.getContext();
    if (!ctx || !this.isReadyToPlay(ctx) || !this.ensureIntroBus() || !this.introHighpass || !this.reverbSendBus) return;

    const t0 = time ?? ctx.currentTime;
    const f = PENTATONIC_SCALE.G3 * this.getPitchMultiplier();

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, t0);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(800, t0);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, t0);
    gainNode.gain.linearRampToValueAtTime(0.06, t0 + 0.025);
    gainNode.gain.exponentialRampToValueAtTime(0.0006, t0 + 0.500);

    osc.connect(lp);
    lp.connect(gainNode);
    gainNode.connect(this.introHighpass);

    const send = ctx.createGain();
    send.gain.setValueAtTime(0.25, t0);
    gainNode.connect(send);
    send.connect(this.reverbSendBus);

    osc.start(t0);
    osc.stop(t0 + 0.55);
  }

  /**
   * Shuffle Flutter Taps: soft keyboard-like taps
   * Sine gliding 380Hz to 260Hz over 10ms, attack 1ms, decay to -40dB at 28ms, gain 0.045, lowpass 900Hz.
   * Pitch slows slightly (~10%) over reel, +-2% random.
   */
  public playFlutterTap(time?: number, pitchScale = 1.0): void {
    if (!this.config.SHUFFLE_FLUTTER) return;
    const ctx = soundEngine.getContext();
    if (!ctx || !this.isReadyToPlay(ctx) || !this.ensureIntroBus() || !this.introHighpass) return;

    const t0 = time ?? ctx.currentTime;
    const pitchMul = this.getPitchMultiplier() * pitchScale * (1 + (Math.random() * 0.04 - 0.02));
    const startF = 380 * pitchMul;
    const endF = 260 * pitchMul;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startF, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endF), t0 + 0.010);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(900, t0);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, t0);
    gainNode.gain.linearRampToValueAtTime(0.045, t0 + 0.001);
    gainNode.gain.exponentialRampToValueAtTime(0.00045, t0 + 0.028);

    osc.connect(lp);
    lp.connect(gainNode);
    gainNode.connect(this.introHighpass);

    if (this.reverbSendBus) {
      const send = ctx.createGain();
      send.gain.setValueAtTime(0.06, t0);
      gainNode.connect(send);
      send.connect(this.reverbSendBus);
    }

    osc.start(t0);
    osc.stop(t0 + 0.035);
  }

  /**
   * Schedule flutter taps across 9 shuffle slots
   * Inverts power4.out easing, capped at 10 taps/sec with a minimum gap of 80ms.
   */
  public scheduleShuffle(plan: ShuffleTimingPlan): void {
    if (!this.config.SHUFFLE_FLUTTER) return;
    const ctx = soundEngine.getContext();
    if (!ctx) return;

    const candidateTimes: { time: number; pitchScale: number }[] = [];

    const totalReelSpan = (plan.numSlots - 1) * plan.slotStagger + plan.slotDuration;

    for (let slot = 0; slot < plan.numSlots; slot++) {
      const slotStart = plan.startTime + slot * plan.slotStagger;
      const duration = plan.slotDuration;

      // Inverting power4.out: t = duration * (1 - (1 - progress)^(1/4))
      for (let step = 0; step < plan.glyphSteps; step++) {
        const progress = (step + 0.5) / plan.glyphSteps;
        const normT = 1 - Math.pow(1 - progress, 0.25);
        const tapTime = slotStart + duration * normT;
        const progressRatio = Math.min(1.0, tapTime / totalReelSpan);
        const pitchScale = 1.0 - 0.10 * progressRatio; // ~10% lower over reel

        candidateTimes.push({ time: tapTime, pitchScale });
      }
    }

    candidateTimes.sort((a, b) => a.time - b.time);

    // Filter candidate times: min gap 80ms (max 10 taps/sec)
    const minGap = 0.080;
    const scheduled: { time: number; pitchScale: number }[] = [];
    let lastTime = -1;

    for (const item of candidateTimes) {
      if (lastTime < 0 || item.time - lastTime >= minGap) {
        scheduled.push(item);
        lastTime = item.time;
      }
    }

    // Schedule using setTimeout or Web Audio clock
    scheduled.forEach((item) => {
      const delayMs = Math.max(0, (item.time - plan.startTime) * 1000);
      const timer = window.setTimeout(() => {
        this.playFlutterTap(undefined, item.pitchScale);
      }, delayMs);
      this.activeTimeouts.push(timer);
    });
  }

  /**
   * Slot Landings: thock on the scale for 9 slots in order
   * P C3, O D3, R E3, T G3, F A3, O C4, L D4, I E4, O G4
   * level 0.13, bodyDecay 200ms
   */
  public slotLand(index: number, time?: number): void {
    if (!this.config.SHUFFLE_LANDING) return;
    const baseFreq = SHUFFLE_LANDING_NOTES[index];
    if (!baseFreq || baseFreq <= 0) return;

    this.thock({
      f: baseFreq,
      level: 0.13,
      bodyDecay: 0.20,
      cavityGain: 0.25,
      tapGain: 0.04,
      reverbSend: 0.10,
      time,
    });
  }

  /**
   * Arrival chord when last slot lands (shuffleDone)
   * Soft low open chord: three sines C3 130.81, G3 196.00, C4 261.63
   * Gains: 0.05, 0.045, 0.035, attack 25ms, decay to -40dB at 900ms, lowpass 900Hz, reverb send 0.25
   */
  public arrival(time?: number, levelScale = 1.0, decaySec = 0.900): void {
    if (!this.config.ARRIVAL_CHORD) return;
    const ctx = soundEngine.getContext();
    if (!ctx || !this.isReadyToPlay(ctx) || !this.ensureIntroBus() || !this.introHighpass || !this.reverbSendBus) return;

    const t0 = time ?? ctx.currentTime;
    const pitchMul = this.getPitchMultiplier();
    const chordNotes = [
      { f: PENTATONIC_SCALE.C3 * pitchMul, gain: 0.050 * levelScale },
      { f: PENTATONIC_SCALE.G3 * pitchMul, gain: 0.045 * levelScale },
      { f: PENTATONIC_SCALE.C4 * pitchMul, gain: 0.035 * levelScale },
    ];

    chordNotes.forEach(({ f, gain }) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t0);

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(900, t0);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.0001, t0);
      gainNode.gain.linearRampToValueAtTime(gain, t0 + 0.025);
      gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain * 0.01), t0 + decaySec);

      osc.connect(lp);
      lp.connect(gainNode);
      gainNode.connect(this.introHighpass!);

      const send = ctx.createGain();
      send.gain.setValueAtTime(0.25, t0);
      gainNode.connect(send);
      send.connect(this.reverbSendBus!);

      osc.start(t0);
      osc.stop(t0 + decaySec + 0.05);
    });
  }

  /**
   * Portfolio Slides Down: Settle Thock
   * Play exactly ONE deep, soft settle thock at portfolioSettle:
   * thock f=110Hz, level 0.22, bodyDecay 260ms, cavityGain 0.2, tapGain 0.04
   */
  public portfolioSettle(time?: number): void {
    if (!this.config.SETTLE_THOCK) return;
    this.thock({
      f: 110,
      level: 0.22,
      bodyDecay: 0.26,
      cavityGain: 0.20,
      tapGain: 0.04,
      reverbSend: 0.12,
      time,
    });
  }

  /**
   * Dust & Portrait: Two discrete events only (no drone or sustained sounds)
   * 1. portraitHalf: thock D3, level 0.09, bodyDecay 180ms
   */
  public portraitHalf(time?: number): void {
    if (!this.config.PORTRAIT_SOUNDS) return;
    this.thock({
      f: PENTATONIC_SCALE.D3,
      level: 0.09,
      bodyDecay: 0.18,
      cavityGain: 0.25,
      tapGain: 0.04,
      reverbSend: 0.12,
      time,
    });
  }

  /**
   * 2. portraitDone: same soft low open chord as arrival at 70% level, decay 1.2s
   */
  public portraitDone(time?: number): void {
    if (!this.config.PORTRAIT_SOUNDS) return;
    this.arrival(time, 0.70, 1.200);
  }

  /**
   * Stop all active sounds, fade intro bus to 0 in fadeMs
   */
  public stopAll(fadeMs = 100): void {
    // Clear scheduled flutter timeouts
    this.activeTimeouts.forEach((id) => clearTimeout(id));
    this.activeTimeouts = [];

    // Stop and disconnect active voice references
    this.activeVoices.forEach((voice) => voice.stop());
    this.activeVoices.clear();

    const ctx = soundEngine.getContext();
    if (this.introBus && ctx) {
      const now = ctx.currentTime;
      const fadeSec = fadeMs / 1000;
      this.introBus.gain.cancelScheduledValues(now);
      this.introBus.gain.setValueAtTime(this.introBus.gain.value, now);
      this.introBus.gain.linearRampToValueAtTime(0.0001, now + fadeSec);
    }
  }
}

export const introSound = new IntroSoundEngine();
