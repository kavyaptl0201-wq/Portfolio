import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Volume2,
  Play,
  Square,
  Copy,
  Check,
  ArrowLeft,
  Sliders,
  Music,
  Layers,
  Sparkles,
  Clock,
  Radio,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { introSound } from '../audio/introSound';
import { SoundName } from '../config/sound';

export const SoundLabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ui' | 'intro'>('intro');

  // UI Sounds State
  const [volume, setVolume] = useState<number>(0.7);
  const [pitch, setPitch] = useState<number>(1.0);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);

  // Intro Soundscape State
  const [introVol, setIntroVol] = useState<number>(introSound.config.INTRO_VOLUME);
  const [introReverb, setIntroReverb] = useState<number>(introSound.config.REVERB_WET);
  const [pitchShift, setPitchShift] = useState<number>(introSound.config.THOCK_PITCH_SHIFT || 0);

  // Custom Thock Voice Playground State
  const [thockF, setThockF] = useState<number>(130.81);
  const [thockLevel, setThockLevel] = useState<number>(0.16);
  const [thockBodyDecay, setThockBodyDecay] = useState<number>(140);
  const [thockCavityGain, setThockCavityGain] = useState<number>(0.25);
  const [thockTapGain, setThockTapGain] = useState<number>(0.05);

  const [activeLayerToggles, setActiveLayerToggles] = useState({
    bounces: introSound.config.BOUNCE_SOUNDS,
    letters: introSound.config.LETTER_SOUNDS,
    flutter: introSound.config.SHUFFLE_FLUTTER,
    landing: introSound.config.SHUFFLE_LANDING,
    arrival: introSound.config.ARRIVAL_CHORD,
    settleThock: introSound.config.SETTLE_THOCK,
    portraitSounds: introSound.config.PORTRAIT_SOUNDS,
  });

  const [isSoundscapePlaying, setIsSoundscapePlaying] = useState<boolean>(false);
  const [soundscapeProgress, setSoundscapeProgress] = useState<number>(0); // 0 to 9.6s
  const soundscapeTimersRef = useRef<number[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Sync intro layer toggles with introSound engine config
  const toggleLayer = (layerKey: keyof typeof activeLayerToggles) => {
    setActiveLayerToggles((prev) => {
      const next = { ...prev, [layerKey]: !prev[layerKey] };
      if (layerKey === 'bounces') introSound.config.BOUNCE_SOUNDS = next.bounces;
      if (layerKey === 'letters') introSound.config.LETTER_SOUNDS = next.letters;
      if (layerKey === 'flutter') introSound.config.SHUFFLE_FLUTTER = next.flutter;
      if (layerKey === 'landing') introSound.config.SHUFFLE_LANDING = next.landing;
      if (layerKey === 'arrival') introSound.config.ARRIVAL_CHORD = next.arrival;
      if (layerKey === 'settleThock') introSound.config.SETTLE_THOCK = next.settleThock;
      if (layerKey === 'portraitSounds') introSound.config.PORTRAIT_SOUNDS = next.portraitSounds;
      return next;
    });
  };

  const handleIntroVolChange = (val: number) => {
    setIntroVol(val);
    introSound.config.INTRO_VOLUME = val;
  };

  const handleIntroReverbChange = (val: number) => {
    setIntroReverb(val);
    introSound.config.REVERB_WET = val;
  };

  const handlePitchShiftChange = (val: number) => {
    setPitchShift(val);
    introSound.config.THOCK_PITCH_SHIFT = val;
    // Live preview: trigger quick C3 thock
    soundEngine.ensureContext()?.resume();
    introSound.thock({ f: 130.81, level: 0.14, bodyDecay: 0.12 });
  };

  const playCustomThock = () => {
    soundEngine.ensureContext()?.resume();
    introSound.thock({
      f: thockF,
      level: thockLevel,
      bodyDecay: thockBodyDecay / 1000,
      cavityGain: thockCavityGain,
      tapGain: thockTapGain,
    });
  };

  // Stop full soundscape playback
  const stopFullSoundscape = () => {
    soundscapeTimersRef.current.forEach((t) => clearTimeout(t));
    soundscapeTimersRef.current = [];
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    introSound.stopAll(100);
    setIsSoundscapePlaying(false);
    setSoundscapeProgress(0);
  };

  // Play full intro soundscape with real-time audio clock tracking
  const playFullSoundscape = () => {
    stopFullSoundscape();
    soundEngine.ensureContext()?.resume();
    introSound.start();
    setIsSoundscapePlaying(true);

    const totalDuration = 9.6; // seconds
    const startPerfTime = performance.now();

    // Timeline cursor animator
    const updateCursor = () => {
      const elapsed = (performance.now() - startPerfTime) / 1000;
      setSoundscapeProgress(Math.min(totalDuration, elapsed));
      if (elapsed < totalDuration) {
        animFrameRef.current = requestAnimationFrame(updateCursor);
      } else {
        setIsSoundscapePlaying(false);
        setSoundscapeProgress(totalDuration);
      }
    };
    animFrameRef.current = requestAnimationFrame(updateCursor);

    // Schedule audio callbacks at exact cinematic timeline seconds
    const schedule = [
      { t: 0.0, fn: () => introSound.start() },
      { t: 1.0, fn: () => introSound.bounce(1) },
      { t: 1.25, fn: () => introSound.bounce(2) },
      { t: 1.45, fn: () => introSound.bounce(3) },
      { t: 1.65, fn: () => introSound.letterPop(0) }, // H (C3)
      { t: 1.87, fn: () => introSound.letterPop(1) }, // A (D3)
      { t: 2.09, fn: () => introSound.letterPop(2) }, // R (E3)
      { t: 2.31, fn: () => introSound.letterPop(3) }, // S (G3)
      { t: 2.53, fn: () => introSound.letterPop(4) }, // H (A3)
      { t: 2.75, fn: () => introSound.spaceHop() },   // Space hop (98Hz)
      { t: 2.97, fn: () => introSound.letterPop(5) }, // R (C4)
      { t: 3.19, fn: () => introSound.letterPop(6) }, // A (D4)
      { t: 3.41, fn: () => { introSound.letterPop(7); introSound.vanish(); } }, // J (E4) + vanish
      { t: 3.66, fn: () => introSound.nameComplete() }, // warm G3 note
      {
        t: 4.10,
        fn: () => {
          introSound.scheduleShuffle({
            startTime: 0,
            slotDuration: 1.25,
            slotStagger: 0.08,
            numSlots: 9,
            glyphSteps: 8,
          });
        },
      },
      // 9 slot landings (PORTFOLIO in C major pentatonic <= 400Hz)
      { t: 4.10 + 0 * 0.08 + 1.25, fn: () => introSound.slotLand(0) },
      { t: 4.10 + 1 * 0.08 + 1.25, fn: () => introSound.slotLand(1) },
      { t: 4.10 + 2 * 0.08 + 1.25, fn: () => introSound.slotLand(2) },
      { t: 4.10 + 3 * 0.08 + 1.25, fn: () => introSound.slotLand(3) },
      { t: 4.10 + 4 * 0.08 + 1.25, fn: () => introSound.slotLand(4) },
      { t: 4.10 + 5 * 0.08 + 1.25, fn: () => introSound.slotLand(5) },
      { t: 4.10 + 6 * 0.08 + 1.25, fn: () => introSound.slotLand(6) },
      { t: 4.10 + 7 * 0.08 + 1.25, fn: () => introSound.slotLand(7) },
      { t: 4.10 + 8 * 0.08 + 1.25, fn: () => introSound.slotLand(8) },
      { t: 6.05, fn: () => introSound.arrival() },          // Soft open chord C3-G3-C4
      { t: 7.20, fn: () => introSound.portfolioSettle() },  // Deep settle thock
      { t: 8.30, fn: () => introSound.portraitHalf() },     // Dust convergence ~60% (D3 thock)
      { t: 9.30, fn: () => introSound.portraitDone() },     // Done open chord (70% level)
    ];

    schedule.forEach(({ t, fn }) => {
      const timer = window.setTimeout(fn, Math.max(0, t * 1000));
      soundscapeTimersRef.current.push(timer);
    });
  };

  useEffect(() => {
    return () => {
      stopFullSoundscape();
    };
  }, []);

  // Copy parameters formatted for introSound.ts
  const copyIntroParameters = () => {
    const text = `/**
 * Intro Soundscape Parameters (Exported from Dev Sound Lab)
 */
export const INTRO_SOUND_CONFIG = {
  INTRO_SOUND: true,
  INTRO_VOLUME: ${introVol.toFixed(2)},
  REVERB_WET: ${introReverb.toFixed(2)},
  BOUNCE_SOUNDS: ${activeLayerToggles.bounces},
  LETTER_SOUNDS: ${activeLayerToggles.letters},
  SHUFFLE_FLUTTER: ${activeLayerToggles.flutter},
  SHUFFLE_LANDING: ${activeLayerToggles.landing},
  ARRIVAL_CHORD: ${activeLayerToggles.arrival},
  SETTLE_THOCK: ${activeLayerToggles.settleThock},
  PORTRAIT_SOUNDS: ${activeLayerToggles.portraitSounds},
  THOCK_PITCH_SHIFT: ${pitchShift},
  INTRO_IGNORES_SAVED_MUTE: false,
  MAX_PEAK_DBFS: -12.0,
  REVERB_DURATION: 0.9,
};

// Custom Thock Voice Profile:
// f: ${thockF.toFixed(1)}Hz, level: ${thockLevel.toFixed(2)}, bodyDecay: ${thockBodyDecay}ms, cavityGain: ${thockCavityGain.toFixed(2)}, tapGain: ${thockTapGain.toFixed(2)}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // UI Sound Trigger
  const playSound = (id: SoundName) => {
    setActiveSound(id);
    soundEngine.play(id, {
      gain: volume,
      pitch: pitch,
    });
    setTimeout(() => setActiveSound(null), 300);
  };

  const playAllInSequence = () => {
    const sequence: SoundName[] = ['nav', 'social', 'button', 'state', 'hover'];
    sequence.forEach((id, index) => {
      setTimeout(() => {
        playSound(id);
      }, index * 420);
    });
  };

  const copyParameters = () => {
    const paramsText = `/**
 * Synthesized Web Audio Parameters for sounds.ts
 * Exported from Dev Sound Lab (/sound-lab)
 * Volume scale: ${volume.toFixed(2)}, Pitch multiplier: ${pitch.toFixed(2)}
 */
export const SOUND_PARAMETERS = {
  nav: {
    oscStartFreq: ${(800 * pitch).toFixed(1)},
    oscEndFreq: ${(560 * pitch).toFixed(1)},
    glideDuration: 0.012,
    peakGain: ${(0.30 * volume).toFixed(3)},
    decayTime: 0.014,
    noiseFilterCutoff: 2500,
    noiseGain: ${(0.08 * volume).toFixed(3)},
    noiseDuration: 0.003
  },
  social: {
    partial1Freq: ${(1318 * pitch).toFixed(1)},
    partial2Freq: ${(1976 * pitch).toFixed(1)},
    attackTime: 0.002,
    decayTime: 0.220,
    peakGain: ${(0.20 * volume).toFixed(3)},
    noiseFilterCutoff: 3000,
    noiseGain: ${(0.05 * volume).toFixed(3)},
    noiseDuration: 0.002
  },
  button: {
    oscStartFreq: ${(2100 * pitch).toFixed(1)},
    oscEndFreq: ${(1800 * pitch).toFixed(1)},
    glideDuration: 0.008,
    peakGain: ${(0.22 * volume).toFixed(3)},
    bodyFreq: ${(500 * pitch).toFixed(1)},
    bodyGain: ${(0.07 * volume).toFixed(3)},
    bodyDuration: 0.006,
    noiseFilterFreq: 2200,
    noiseFilterQ: 1.2,
    noiseGain: ${(0.10 * volume).toFixed(3)},
    noiseDuration: 0.002
  },
  state: {
    sine1Freq: ${(520 * pitch).toFixed(1)},
    sine2Freq: ${(780 * pitch).toFixed(1)},
    attackTime: 0.012,
    decayTime: 0.550,
    peakGain: ${(0.28 * volume).toFixed(3)},
    bodyStartFreq: ${(130 * pitch).toFixed(1)},
    bodyEndFreq: ${(90 * pitch).toFixed(1)},
    bodyDuration: 0.120,
    bodyGain: ${(0.15 * volume).toFixed(3)},
    whooshFilterStart: 3000,
    whooshFilterEnd: 400,
    whooshDuration: 0.300,
    whooshGain: ${(0.10 * volume).toFixed(3)}
  },
  hover: {
    freq: ${(1200 * pitch).toFixed(1)},
    duration: 0.006,
    gain: ${(0.05 * volume).toFixed(3)}
  }
};`;

    navigator.clipboard.writeText(paramsText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const soundList: {
    id: SoundName;
    name: string;
    type: string;
    character: string;
    recipe: string;
    duration: string;
  }[] = [
    {
      id: 'nav',
      name: 'GROUP "nav"',
      type: 'Group',
      character: 'Soft, low, dry "tick" like a light tap on a wooden desk or mechanical-keyboard key.',
      recipe: 'Sine 800Hz -> 560Hz over 12ms, gain 0.30, decay to 0.001 by 14ms + 3ms white noise (LP 2.5kHz, gain 0.08)',
      duration: '≤ 20ms',
    },
    {
      id: 'social',
      name: 'GROUP "social"',
      type: 'Group',
      character: 'Bright, light "tink" with a ringing tail like tapping a small glass or bell.',
      recipe: 'Two sine partials at 1318Hz & 1976Hz (perfect 5th), 2ms attack, decay to -40dB over 220ms, peak 0.20 + 2ms noise (HP 3kHz, gain 0.05)',
      duration: '~250ms',
    },
    {
      id: 'button',
      name: 'GROUP "button"',
      type: 'Group (Default)',
      character: 'Crisp, high, very short "click" like a mouse click or pen click. Drier and sharper than nav.',
      recipe: 'Sine 2100Hz -> 1800Hz over 8ms (gain 0.22) + 500Hz body (gain 0.07, 6ms) + 2ms noise (BP 2.2kHz, Q 1.2, gain 0.10)',
      duration: '≤ 15ms',
    },
    {
      id: 'state',
      name: 'SPECIAL "state"',
      type: 'Event-driven',
      character: 'Heavier "thunk" with soft lowpass whoosh for mode changes and successes.',
      recipe: 'Two sines at 520Hz & 780Hz (decay 550ms, peak 0.28) + 130Hz -> 90Hz body (120ms, gain 0.15) + swept noise whoosh 3kHz -> 400Hz (300ms, gain 0.10)',
      duration: '~550ms',
    },
    {
      id: 'hover',
      name: 'OPTIONAL "hover"',
      type: 'Micro-interaction',
      character: 'Ultra-subtle high tick for pointer:fine hover on nav & social links.',
      recipe: '6ms sine at 1200Hz, gain 0.05, rate-limited to at most once per 80ms.',
      duration: '6ms',
    },
  ];

  return (
    <div className="min-h-screen site-bg text-[#F5F5F7] p-6 sm:p-10 font-sans selection:bg-white/20">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[14px] text-[#9A9AA0] hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portfolio</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Dev Sound Lab
                </h1>
                <p className="text-[14px] text-[#9A9AA0]">
                  Synthesized Web Audio API inspection, Intro soundscape &amp; ear-comfort debugger
                </p>
              </div>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center p-1 rounded-pill bg-white/[0.08] border border-white/10">
            <button
              onClick={() => setActiveTab('intro')}
              className={`px-4 py-2 rounded-pill text-[14px] font-medium transition-all ${
                activeTab === 'intro'
                  ? 'bg-white text-black shadow-md'
                  : 'text-[#9A9AA0] hover:text-white'
              }`}
            >
              Intro Soundscape
            </button>
            <button
              onClick={() => setActiveTab('ui')}
              className={`px-4 py-2 rounded-pill text-[14px] font-medium transition-all ${
                activeTab === 'ui'
                  ? 'bg-white text-black shadow-md'
                  : 'text-[#9A9AA0] hover:text-white'
              }`}
            >
              UI Sound System
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: INTRO SOUNDSCAPE STUDIO                                            */}
        {/* ========================================================================= */}
        {activeTab === 'intro' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top Bar: Full Playback & Copy Button */}
            <div className="p-6 rounded-[28px] glass-surface border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      Cinematic Intro Soundscape
                    </h2>
                    <p className="text-xs text-[#9A9AA0]">
                      Audio-only playback synchronized with master visual timeline (~9.6s)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isSoundscapePlaying ? (
                    <button
                      onClick={stopFullSoundscape}
                      className="px-5 py-2.5 rounded-pill bg-rose-600 hover:bg-rose-500 text-white text-[14px] font-medium flex items-center gap-2 transition-all shadow-lg"
                    >
                      <Square className="w-4 h-4 fill-white" />
                      <span>Stop playback</span>
                    </button>
                  ) : (
                    <button
                      onClick={playFullSoundscape}
                      className="apple-button-white-3d px-5 py-2.5 rounded-pill text-black text-[14px] font-medium flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <Play className="w-4 h-4 fill-black" />
                      <span>Play full intro soundscape</span>
                    </button>
                  )}

                  <button
                    onClick={copyIntroParameters}
                    className="apple-glass-chip apple-glass-chip-interactive px-4 py-2.5 rounded-pill text-[14px] font-medium text-white flex items-center gap-2 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied config!' : 'Copy parameters'}</span>
                  </button>
                </div>
              </div>

              {/* On-Screen Timeline Cursor */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-[#9A9AA0]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Timeline Cursor</span>
                  </span>
                  <span className="font-sans font-medium text-white text-[13px]">
                    {soundscapeProgress.toFixed(2)}s / 9.60s
                  </span>
                </div>
                <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-400 via-amber-300 to-indigo-400 transition-all duration-75"
                    style={{ width: `${(soundscapeProgress / 9.6) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-sans text-[#8E8E93] px-1">
                  <span>0.0s (Drop)</span>
                  <span>1.0s (Bounces)</span>
                  <span>1.6s (Letters)</span>
                  <span>4.1s (Shuffle)</span>
                  <span>7.2s (Settle)</span>
                  <span>9.3s (Done)</span>
                </div>
              </div>
            </div>

            {/* Intro Bus Controls: Volume, Reverb & Pitch Shift */}
            <div className="p-6 rounded-[28px] glass-surface border border-white/10 space-y-6">
              <div className="flex items-center gap-2 text-white font-semibold text-[16px]">
                <Sliders className="w-5 h-5 text-white/70" />
                <span>Intro Acoustic &amp; Bus Settings</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#9A9AA0]">Intro Master Bus</span>
                    <span className="font-sans font-medium text-white">{Math.round(introVol * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={introVol}
                    onChange={(e) => handleIntroVolChange(parseFloat(e.target.value))}
                    className="w-full accent-white h-2 bg-white/10 rounded-full cursor-pointer"
                  />
                  <p className="text-[11px] text-[#8E8E93]">
                    Default: 0.55. Scaled into master bus; intro stays ≤ -12 dBFS.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#9A9AA0]">Convolver Wet Send</span>
                    <span className="font-sans font-medium text-white">{Math.round(introReverb * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.4"
                    step="0.01"
                    value={introReverb}
                    onChange={(e) => handleIntroReverbChange(parseFloat(e.target.value))}
                    className="w-full accent-white h-2 bg-white/10 rounded-full cursor-pointer"
                  />
                  <p className="text-[11px] text-[#8E8E93]">
                    Default: 0.12. Dark 0.9s impulse response lowpassed at 1.8kHz.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#9A9AA0]">Pitch Shift</span>
                    <span className="font-sans font-medium text-white">
                      {pitchShift > 0 ? `+${pitchShift}` : pitchShift} st
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={pitchShift}
                    onChange={(e) => handlePitchShiftChange(parseInt(e.target.value, 10))}
                    className="w-full accent-white h-2 bg-white/10 rounded-full cursor-pointer"
                  />
                  <p className="text-[11px] text-[#8E8E93]">
                    Shifts all intro notes at once (live preview audition).
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Thock Voice Playground */}
            <div className="p-6 rounded-[28px] glass-surface border border-white/10 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-white font-semibold text-[16px]">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>Core Voice: &quot;Thock&quot; Playground</span>
                  </div>
                  <p className="text-xs text-[#9A9AA0] mt-1">
                    Warm, round, soft mechanical keypress: sine pitch-drop body + cavity overtone + 8ms filtered tap noise.
                  </p>
                </div>
                <button
                  onClick={playCustomThock}
                  className="apple-button-white-3d px-5 py-2.5 rounded-pill text-black text-[14px] font-semibold flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Audition Thock</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-2">
                <div className="space-y-1.5 p-3 rounded-[16px] bg-white/[0.03] border border-white/5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#9A9AA0]">Frequency (f)</span>
                    <span className="font-sans font-medium text-white">{thockF.toFixed(1)} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="400"
                    step="1"
                    value={thockF}
                    onChange={(e) => setThockF(parseFloat(e.target.value))}
                    className="w-full accent-white h-1.5 bg-white/10 rounded-full cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5 p-3 rounded-[16px] bg-white/[0.03] border border-white/5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#9A9AA0]">Peak Level</span>
                    <span className="font-sans font-medium text-white">{thockLevel.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.02"
                    max="0.30"
                    step="0.01"
                    value={thockLevel}
                    onChange={(e) => setThockLevel(parseFloat(e.target.value))}
                    className="w-full accent-white h-1.5 bg-white/10 rounded-full cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5 p-3 rounded-[16px] bg-white/[0.03] border border-white/5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#9A9AA0]">Body Decay</span>
                    <span className="font-sans font-medium text-white">{thockBodyDecay} ms</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="350"
                    step="10"
                    value={thockBodyDecay}
                    onChange={(e) => setThockBodyDecay(parseInt(e.target.value, 10))}
                    className="w-full accent-white h-1.5 bg-white/10 rounded-full cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5 p-3 rounded-[16px] bg-white/[0.03] border border-white/5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#9A9AA0]">Cavity Gain</span>
                    <span className="font-sans font-medium text-white">{thockCavityGain.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.5"
                    step="0.02"
                    value={thockCavityGain}
                    onChange={(e) => setThockCavityGain(parseFloat(e.target.value))}
                    className="w-full accent-white h-1.5 bg-white/10 rounded-full cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5 p-3 rounded-[16px] bg-white/[0.03] border border-white/5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#9A9AA0]">Tap Gain</span>
                    <span className="font-sans font-medium text-white">{thockTapGain.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.12"
                    step="0.01"
                    value={thockTapGain}
                    onChange={(e) => setThockTapGain(parseFloat(e.target.value))}
                    className="w-full accent-white h-1.5 bg-white/10 rounded-full cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Per-Layer Toggles */}
            <div className="p-6 rounded-[28px] glass-surface border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-white font-semibold text-[16px]">
                <Layers className="w-5 h-5 text-white/70" />
                <span>Per-Layer Soundscape Toggles</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                {[
                  { key: 'bounces', label: 'Dot Bounces', desc: 'Impact 1, 2, 3 thocks' },
                  { key: 'letters', label: 'Letter Pops', desc: '8 pentatonic notes & hop' },
                  { key: 'flutter', label: 'Shuffle Flutter', desc: 'Soft keyboard-like taps' },
                  { key: 'landing', label: 'Landing Notes', desc: 'PORTFOLIO slot thocks' },
                  { key: 'arrival', label: 'Arrival Chord', desc: 'C3-G3-C4 open chord' },
                  { key: 'settleThock', label: 'Settle Thock', desc: 'Deep landing thock 110Hz' },
                  { key: 'portraitSounds', label: 'Portrait Cues', desc: 'D3 half & done chord' },
                ].map(({ key, label, desc }) => {
                  const k = key as keyof typeof activeLayerToggles;
                  const isChecked = activeLayerToggles[k];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleLayer(k)}
                      className={`p-3.5 rounded-[16px] border text-left transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-white/15 border-white/35 text-white shadow-sm'
                          : 'bg-white/[0.03] border-white/10 text-[#8E8E93] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px] font-semibold">{label}</span>
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isChecked ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-neutral-600'
                          }`}
                        />
                      </div>
                      <p className="text-[11px] text-[#9A9AA0]">{desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Individual Voice Audition Buttons */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-white/70" />
                <span>Discrete Voice Audition</span>
              </h3>

              {/* Group 0: Start Gate Click */}
              <div className="p-5 rounded-[20px] bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-sans font-medium text-[#C9C9CF]">
                    Step 0: Start Gate
                  </span>
                  <span className="text-[13px] font-sans text-[#8E8E93]">Warm C4 Thock</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => { soundEngine.ensureContext()?.resume(); introSound.gateClick(); }}
                    className="apple-glass-chip apple-glass-chip-interactive px-4 py-2 rounded-pill text-[14px] font-medium text-white transition-colors"
                  >
                    Start Gate Click (C4 261.63Hz)
                  </button>
                </div>
              </div>

              {/* Group A: Bounces & Letters */}
              <div className="p-6 rounded-[28px] bg-white/[0.03] border border-white/10 space-y-4">
                <span className="text-[13px] font-sans font-medium text-[#C9C9CF]">
                  Step 1 &amp; 2: Dot Impacts &amp; Letter Pops (Warm Pentatonic)
                </span>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => { soundEngine.ensureContext()?.resume(); introSound.bounce(1); }}
                    className="apple-glass-chip apple-glass-chip-interactive px-3.5 py-2 rounded-pill text-[14px] font-medium text-white transition-colors"
                  >
                    Impact 1 (110Hz, lvl 0.24)
                  </button>
                  <button
                    onClick={() => { soundEngine.ensureContext()?.resume(); introSound.bounce(2); }}
                    className="apple-glass-chip apple-glass-chip-interactive px-3.5 py-2 rounded-pill text-[14px] font-medium text-white transition-colors"
                  >
                    Impact 2 (122Hz, lvl 0.12)
                  </button>
                  <button
                    onClick={() => { soundEngine.ensureContext()?.resume(); introSound.bounce(3); }}
                    className="apple-glass-chip apple-glass-chip-interactive px-3.5 py-2 rounded-pill text-[14px] font-medium text-white transition-colors"
                  >
                    Impact 3 (135Hz, lvl 0.05)
                  </button>

                  <div className="w-full h-px bg-white/10 my-1" />

                  {[
                    { label: 'H (C3 130.8Hz)', idx: 0 },
                    { label: 'A (D3 146.8Hz)', idx: 1 },
                    { label: 'R (E3 164.8Hz)', idx: 2 },
                    { label: 'S (G3 196.0Hz)', idx: 3 },
                    { label: 'H (A3 220.0Hz)', idx: 4 },
                  ].map(({ label, idx }) => (
                    <button
                      key={label}
                      onClick={() => { soundEngine.ensureContext()?.resume(); introSound.letterPop(idx); }}
                      className="apple-glass-chip apple-glass-chip-interactive px-3.5 py-2 rounded-pill text-[14px] font-medium text-white transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    onClick={() => { soundEngine.ensureContext()?.resume(); introSound.spaceHop(); }}
                    className="apple-glass-chip apple-glass-chip-interactive px-3.5 py-2 rounded-pill text-[14px] font-medium text-amber-200 transition-colors"
                  >
                    Space Hop (98Hz)
                  </button>
                  {[
                    { label: 'R (C4 261.6Hz)', idx: 5 },
                    { label: 'A (D4 293.7Hz)', idx: 6 },
                    { label: 'J (E4 329.6Hz)', idx: 7 },
                  ].map(({ label, idx }) => (
                    <button
                      key={label}
                      onClick={() => { soundEngine.ensureContext()?.resume(); introSound.letterPop(idx); }}
                      className="apple-glass-chip apple-glass-chip-interactive px-3.5 py-2 rounded-pill text-[14px] font-medium text-white transition-colors"
                    >
                      {label}
                    </button>
                  ))}

                  <button
                    onClick={() => { soundEngine.ensureContext()?.resume(); introSound.vanish(); }}
                    className="apple-glass-chip apple-glass-chip-interactive px-3.5 py-2 rounded-pill text-[14px] font-medium text-purple-200 transition-colors"
                  >
                    Vanish Pup (180→300Hz)
                  </button>
                  <button
                    onClick={() => { soundEngine.ensureContext()?.resume(); introSound.nameComplete(); }}
                    className="apple-glass-chip apple-glass-chip-interactive px-3.5 py-2 rounded-pill text-[14px] font-medium text-indigo-200 transition-colors"
                  >
                    Name Complete (G3 196Hz)
                  </button>
                </div>
              </div>

              {/* Group B: Shuffle, Landing Notes & Arrival Chord */}
              <div className="p-6 rounded-[28px] bg-white/[0.03] border border-white/10 space-y-4">
                <span className="text-[13px] font-sans font-medium text-[#C9C9CF]">
                  Step 4: Shuffle, Landing Notes &amp; Arrival Chord
                </span>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => { soundEngine.ensureContext()?.resume(); introSound.playFlutterTap(); }}
                    className="apple-glass-chip apple-glass-chip-interactive px-3.5 py-2 rounded-pill text-[14px] font-medium text-white transition-colors"
                  >
                    Single Flutter Tap (380→260Hz)
                  </button>

                  <div className="w-full h-px bg-white/10 my-1" />

                  {[
                    'P (C3)',
                    'O (D3)',
                    'R (E3)',
                    'T (G3)',
                    'F (A3)',
                    'O (C4)',
                    'L (D4)',
                    'I (E4)',
                    'O (G4)',
                  ].map((slotName, idx) => (
                    <button
                      key={slotName}
                      onClick={() => { soundEngine.ensureContext()?.resume(); introSound.slotLand(idx); }}
                      className="apple-glass-chip apple-glass-chip-interactive px-3.5 py-2 rounded-pill text-[14px] font-medium text-white transition-colors"
                    >
                      Land {slotName}
                    </button>
                  ))}

                  <button
                    onClick={() => { soundEngine.ensureContext()?.resume(); introSound.arrival(); }}
                    className="apple-glass-chip apple-glass-chip-interactive px-4 py-2 rounded-pill text-[14px] font-medium text-emerald-200 transition-colors"
                  >
                    Arrival Chord (C3-G3-C4)
                  </button>
                </div>
              </div>

              {/* Group C: Reveal, Settle & Portrait (Discrete events only) */}
              <div className="p-6 rounded-[28px] bg-white/[0.03] border border-white/10 space-y-4">
                <span className="text-[13px] font-sans font-medium text-[#C9C9CF]">
                  Step 5: Portfolio Settle &amp; Portrait (No Drones or Continuous Sounds)
                </span>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => { soundEngine.ensureContext()?.resume(); introSound.portfolioSettle(); }}
                    className="apple-glass-chip apple-glass-chip-interactive px-4 py-2 rounded-pill text-[14px] font-medium text-white transition-colors"
                  >
                    Settle Thock (110Hz, 260ms body)
                  </button>
                  <button
                    onClick={() => { soundEngine.ensureContext()?.resume(); introSound.portraitHalf(); }}
                    className="apple-glass-chip apple-glass-chip-interactive px-4 py-2 rounded-pill text-[14px] font-medium text-amber-200 transition-colors"
                  >
                    Portrait Half (D3 Thock, lvl 0.09)
                  </button>
                  <button
                    onClick={() => { soundEngine.ensureContext()?.resume(); introSound.portraitDone(); }}
                    className="apple-glass-chip apple-glass-chip-interactive px-4 py-2 rounded-pill text-[14px] font-medium text-indigo-200 transition-colors"
                  >
                    Portrait Done (Open Chord @ 70%, 1.2s decay)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: UI SOUND SYSTEM DEBUGGER                                           */}
        {/* ========================================================================= */}
        {activeTab === 'ui' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top Action Bar */}
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-[#9A9AA0]">
                Interactive sound group debugger for navbar, social docks, buttons, and state changes.
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={playAllInSequence}
                  className="apple-glass-chip apple-glass-chip-interactive px-4 py-2.5 rounded-pill text-[14px] font-medium text-white flex items-center gap-2 transition-colors"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Play all in sequence</span>
                </button>
                <button
                  onClick={copyParameters}
                  className="apple-button-white-3d px-4 py-2.5 rounded-pill text-black text-[14px] font-medium flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied parameters!' : 'Copy parameters'}</span>
                </button>
              </div>
            </div>

            {/* Global Controls: Volume & Pitch Sliders */}
            <div className="p-6 rounded-[28px] glass-surface border border-white/10 space-y-6">
              <div className="flex items-center gap-2 text-white font-semibold text-[16px]">
                <Sliders className="w-5 h-5 text-white/70" />
                <span>UI Voice Master Controls</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#9A9AA0]">Master Voice Gain</span>
                    <span className="font-sans font-medium text-white">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-white h-2 bg-white/10 rounded-full cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#9A9AA0]">Pitch Multiplier</span>
                    <span className="font-sans font-medium text-white">{pitch.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full accent-white h-2 bg-white/10 rounded-full cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Sound Cards Grid */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-white/70" />
                <span>UI Sounds</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {soundList.map((sound) => {
                  const isPlaying = activeSound === sound.id;
                  return (
                    <div
                      key={sound.id}
                      className={`p-5 rounded-[20px] border transition-all duration-200 flex flex-col justify-between gap-4 ${
                        isPlaying
                          ? 'bg-white/15 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                          : 'bg-white/[0.04] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-sans font-medium text-[#C9C9CF]">
                            {sound.type}
                          </span>
                          <span className="text-[11px] font-sans font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-white/80">
                            {sound.duration}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white tracking-tight">{sound.name}</h3>
                        <p className="text-[13px] text-[#D1D1D6] leading-relaxed">{sound.character}</p>
                      </div>

                      <div className="space-y-3">
                        <code className="block p-2.5 rounded-[16px] bg-black/40 border border-white/5 font-mono text-[11px] text-[#8E8E93] break-words">
                          {sound.recipe}
                        </code>
                        <button
                          onClick={() => playSound(sound.id)}
                          className="w-full py-2.5 rounded-pill bg-white/10 hover:bg-white text-white hover:text-black font-medium text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Play sound</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
