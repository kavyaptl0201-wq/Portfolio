/**
 * Pure Web Audio API Sound Synthesizers
 * High-performance, zero-latency synthesis for all UI sound groups.
 */

// Cached white noise buffer per AudioContext
const noiseBufferCache = new WeakMap<AudioContext | OfflineAudioContext, AudioBuffer>();

function getNoiseBuffer(ctx: AudioContext | OfflineAudioContext): AudioBuffer {
  let buffer = noiseBufferCache.get(ctx);
  if (!buffer) {
    const length = Math.floor(ctx.sampleRate * 0.5); // 0.5s of noise is plenty
    buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    noiseBufferCache.set(ctx, buffer);
  }
  return buffer;
}

export interface SoundParams {
  pitch?: number; // Pitch multiplier (default 1.0)
  gain?: number;  // Gain multiplier (default 1.0)
}

/**
 * GROUP "nav": Soft, low, dry "tick" (<= 20ms)
 * Used by all nav buttons, links, mobile tab bar items.
 * Recipe:
 * - Sine oscillator sliding 800Hz -> 560Hz exponentially over 12ms
 * - Gain envelope: 0 to 0.30 in 1ms, exponential decay to 0.001 by 14ms
 * - 3ms white-noise burst through a lowpass at 2.5kHz, gain 0.08
 */
export function playNavSound(
  ctx: AudioContext | OfflineAudioContext,
  dest: AudioNode,
  params: SoundParams = {}
): number {
  const pitch = params.pitch ?? 1.0;
  const gainScale = params.gain ?? 1.0;
  const now = ctx.currentTime;
  const duration = 0.020; // 20ms

  // 1. Tonal sine slide (800Hz -> 560Hz)
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sine';

  const startFreq = Math.max(20, 800 * pitch);
  const endFreq = Math.max(20, 560 * pitch);

  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.012);

  oscGain.gain.setValueAtTime(0.0001, now);
  oscGain.gain.linearRampToValueAtTime(0.30 * gainScale, now + 0.001);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.014);
  oscGain.gain.setValueAtTime(0, now + 0.015);

  osc.connect(oscGain);
  oscGain.connect(dest);

  osc.start(now);
  osc.stop(now + 0.015);

  // 2. 3ms white-noise click via lowpass at 2.5kHz
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(Math.min(20000, 2500 * pitch), now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.08 * gainScale, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.003);
  noiseGain.gain.setValueAtTime(0, now + 0.0035);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(dest);

  noise.start(now);
  noise.stop(now + 0.004);

  return duration;
}

/**
 * GROUP "social": Bright, light "tink" with ringing tail (~250ms)
 * Used by all social dock and social profile icons.
 * Recipe:
 * - Two sine partials at 1318Hz and 1976Hz (perfect fifth)
 * - 2ms attack, exponential decay reaching -40dB (~0.002) at ~220ms, peak gain 0.20
 * - 2ms noise click through a highpass at 3kHz, gain 0.05
 */
export function playSocialSound(
  ctx: AudioContext | OfflineAudioContext,
  dest: AudioNode,
  params: SoundParams = {}
): number {
  const pitch = params.pitch ?? 1.0;
  const gainScale = params.gain ?? 1.0;
  const now = ctx.currentTime;
  const duration = 0.250; // 250ms

  // Partials: E6 (1318Hz) and B6 (1976Hz)
  const freqs = [1318 * pitch, 1976 * pitch];
  const partialGains = [0.13 * gainScale, 0.07 * gainScale]; // Total peak ~0.20

  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(Math.max(20, freq), now);

    const peak = partialGains[idx];
    oscGain.gain.setValueAtTime(0.0001, now);
    oscGain.gain.linearRampToValueAtTime(peak, now + 0.002);
    // Decay to -40dB (1% of peak) around 220ms
    oscGain.gain.exponentialRampToValueAtTime(Math.max(0.00001, peak * 0.01), now + 0.220);
    oscGain.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(oscGain);
    oscGain.connect(dest);

    osc.start(now);
    osc.stop(now + duration);
  });

  // 2ms highpass noise click (3kHz)
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);

  const hpFilter = ctx.createBiquadFilter();
  hpFilter.type = 'highpass';
  hpFilter.frequency.setValueAtTime(Math.min(20000, 3000 * pitch), now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.05 * gainScale, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.002);
  noiseGain.gain.setValueAtTime(0, now + 0.0025);

  noise.connect(hpFilter);
  hpFilter.connect(noiseGain);
  noiseGain.connect(dest);

  noise.start(now);
  noise.stop(now + 0.003);

  return duration;
}

/**
 * GROUP "button": Crisp, high, very short "click" (<= 15ms)
 * Used by all other interactive buttons across the site.
 * Recipe:
 * - Sine 2100Hz sliding to 1800Hz over 8ms, peak gain 0.22
 * - 500Hz sine body at -10dB (0.07) lasting 6ms
 * - 2ms noise burst through a bandpass at 2.2kHz (Q 1.2), gain 0.10
 */
export function playButtonSound(
  ctx: AudioContext | OfflineAudioContext,
  dest: AudioNode,
  params: SoundParams = {}
): number {
  const pitch = params.pitch ?? 1.0;
  const gainScale = params.gain ?? 1.0;
  const now = ctx.currentTime;
  const duration = 0.015; // 15ms

  // 1. High-frequency click slide (2100Hz -> 1800Hz)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(Math.max(20, 2100 * pitch), now);
  osc1.frequency.exponentialRampToValueAtTime(Math.max(20, 1800 * pitch), now + 0.008);

  gain1.gain.setValueAtTime(0.0001, now);
  gain1.gain.linearRampToValueAtTime(0.22 * gainScale, now + 0.001);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.012);
  gain1.gain.setValueAtTime(0, now + 0.014);

  osc1.connect(gain1);
  gain1.connect(dest);
  osc1.start(now);
  osc1.stop(now + 0.014);

  // 2. 500Hz body sine (-10dB = ~0.07 gain) lasting 6ms
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(Math.max(20, 500 * pitch), now);

  gain2.gain.setValueAtTime(0.0001, now);
  gain2.gain.linearRampToValueAtTime(0.07 * gainScale, now + 0.001);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.006);
  gain2.gain.setValueAtTime(0, now + 0.0065);

  osc2.connect(gain2);
  gain2.connect(dest);
  osc2.start(now);
  osc2.stop(now + 0.007);

  // 3. 2ms bandpass noise burst (2.2kHz, Q 1.2)
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);

  const bpFilter = ctx.createBiquadFilter();
  bpFilter.type = 'bandpass';
  bpFilter.frequency.setValueAtTime(Math.min(20000, 2200 * pitch), now);
  bpFilter.Q.setValueAtTime(1.2, now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.10 * gainScale, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.002);
  noiseGain.gain.setValueAtTime(0, now + 0.0025);

  noise.connect(bpFilter);
  bpFilter.connect(noiseGain);
  noiseGain.connect(dest);

  noise.start(now);
  noise.stop(now + 0.003);

  return duration;
}

/**
 * SPECIAL sound "state": Heavier "thunk" with soft whoosh (~550ms)
 * Used for: Sound toggle ON, contact form success, Skip intro, case-study modal open.
 * Recipe:
 * - Two sines at 520Hz and 780Hz, 12ms attack, decay to -40dB over 550ms, peak gain 0.28
 * - Body sine sliding 130Hz -> 90Hz over 120ms, gain 0.15
 * - Lowpass-swept noise whoosh (cutoff 3kHz to 400Hz over 300ms), gain 0.10
 */
export function playStateSound(
  ctx: AudioContext | OfflineAudioContext,
  dest: AudioNode,
  params: SoundParams = {}
): number {
  const pitch = params.pitch ?? 1.0;
  const gainScale = params.gain ?? 1.0;
  const now = ctx.currentTime;
  const duration = 0.550; // 550ms

  // 1. Dual tones (520Hz, 780Hz)
  const freqs = [520 * pitch, 780 * pitch];
  const peakGains = [0.18 * gainScale, 0.10 * gainScale]; // Total peak ~0.28

  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(Math.max(20, freq), now);

    const peak = peakGains[idx];
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(peak, now + 0.012);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.00001, peak * 0.01), now + 0.550);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.580);

    osc.connect(gainNode);
    gainNode.connect(dest);

    osc.start(now);
    osc.stop(now + 0.580);
  });

  // 2. Low-frequency body slide (130Hz -> 90Hz over 120ms)
  const bodyOsc = ctx.createOscillator();
  const bodyGain = ctx.createGain();
  bodyOsc.type = 'sine';
  bodyOsc.frequency.setValueAtTime(Math.max(20, 130 * pitch), now);
  bodyOsc.frequency.exponentialRampToValueAtTime(Math.max(20, 90 * pitch), now + 0.120);

  bodyGain.gain.setValueAtTime(0.0001, now);
  bodyGain.gain.linearRampToValueAtTime(0.15 * gainScale, now + 0.005);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.120);
  bodyGain.gain.setValueAtTime(0, now + 0.130);

  bodyOsc.connect(bodyGain);
  bodyGain.connect(dest);
  bodyOsc.start(now);
  bodyOsc.stop(now + 0.130);

  // 3. Lowpass-swept noise whoosh (3kHz -> 400Hz over 300ms)
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);

  const sweepFilter = ctx.createBiquadFilter();
  sweepFilter.type = 'lowpass';
  sweepFilter.frequency.setValueAtTime(Math.min(20000, 3000 * pitch), now);
  sweepFilter.frequency.exponentialRampToValueAtTime(Math.max(20, 400 * pitch), now + 0.300);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.linearRampToValueAtTime(0.10 * gainScale, now + 0.020);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.300);
  noiseGain.gain.setValueAtTime(0, now + 0.310);

  noise.connect(sweepFilter);
  sweepFilter.connect(noiseGain);
  noiseGain.connect(dest);

  noise.start(now);
  noise.stop(now + 0.310);

  return duration;
}

/**
 * OPTIONAL quiet sound "hover": Subtle 6ms 1200Hz tick
 * Triggered on fine pointer devices when hovering nav links and social icons.
 */
export function playHoverSound(
  ctx: AudioContext | OfflineAudioContext,
  dest: AudioNode,
  params: SoundParams = {}
): number {
  const pitch = params.pitch ?? 1.0;
  const gainScale = params.gain ?? 1.0;
  const now = ctx.currentTime;
  const duration = 0.006; // 6ms

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(Math.max(20, 1200 * pitch), now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.05 * gainScale, now + 0.001);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.006);
  gain.gain.setValueAtTime(0, now + 0.0065);

  osc.connect(gain);
  gain.connect(dest);

  osc.start(now);
  osc.stop(now + 0.007);

  return duration;
}
