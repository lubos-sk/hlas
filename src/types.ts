export interface Formant {
  frequency: number; // Hz
  gain: number;       // dB (or relative amplitude)
  q: number;          // Quality factor (selectivity)
}

export type PhonemeType = 
  | 'vowel' 
  | 'diphthong' 
  | 'nasal' 
  | 'fricative' 
  | 'plosive' 
  | 'affricate' 
  | 'glide' 
  | 'trill' 
  | 'silence';

export interface PhonemeConfig {
  symbol: string;        // Slovak phoneme symbol (e.g. "a", "á", "š", "r")
  type: PhonemeType;
  formants?: Formant[];  // Formant frequencies (F1, F2, F3, F4)
  noiseFreq?: number;    // Center frequency for fricative noise
  noiseBandwidth?: number; // Q factor of noise filter
  noiseGain?: number;    // Amplitude of noise source (0 to 1)
  voicedGain?: number;   // Amplitude of voiced source (0 to 1)
  aspirationGain?: number; // Breath/hiss gain mixed with vowel (0 to 1)
  baseDuration: number;  // ms
}

export interface PhonemeSegment {
  phoneme: PhonemeConfig;
  customDuration: number; // Duration after applying speech-speed rules
  pitchStart: number;     // Hz
  pitchEnd: number;       // Hz
  isStressed: boolean;
  textPosition: number;   // Position in original string for highlighting
  targetPhoneme?: PhonemeConfig; // Used for diphthongs to interpolate formants
  vibratoRateOverride?: number;
  vibratoDepthOverride?: number;
  volumeOverride?: number;
}

export interface SibilantConfig {
  teethInfluence: number;     // 0 to 1.5 - High-octave dental noise reflection, adds crispness
  tonguePlacement: number;    // -1 to +1 - Shifts center sibilant frequency around tongue posture
  tongueConstriction: number; // 0.3 to 2.5 - Adjusts bandwidth focus of the friction channel
}

export interface VoiceConfig {
  gender: 'male' | 'female' | 'child';
  baseF0: number;         // Base pitch in Hz (e.g., 100 for male, 200 for female)
  speed: number;          // Speed multiplier (0.5 to 2.0)
  vibratoRate: number;    // Hz
  vibratoDepth: number;   // cents / semitones
  formantShift: number;   // Multiplier to stretch/squeeze the vocal tract (0.5 to 2.0)
  volume: number;         // 0 to 1
  intonationPattern: 'flat' | 'natural' | 'animated' | 'question';
  sibilants: Record<string, SibilantConfig>;
  reverbLevel?: number;   // 0 to 1, preset to e.g. 0.15 for ambient space
  enableWarmthEQ?: boolean; // toggle to apply 10kHz roll-off + mids boost
  enableCasualReduction?: boolean; // toggle for fast-speech unstressed short vowel reductions
  enableElision?: boolean;         // toggle for casual contraction and assimilation rules
}

export interface SpeechStats {
  totalDuration: number;
  wordCount: number;
  phonemeCount: number;
  syllableCount: number;
}

export const DEFAULT_SIBILANTS: Record<string, SibilantConfig> = {
  's': { teethInfluence: 1.0, tonguePlacement: 0.7, tongueConstriction: 1.3 },
  'š': { teethInfluence: 0.35, tonguePlacement: -0.4, tongueConstriction: 0.8 },
  'z': { teethInfluence: 0.85, tonguePlacement: 0.6, tongueConstriction: 1.15 },
  'ž': { teethInfluence: 0.30, tonguePlacement: -0.35, tongueConstriction: 0.75 },
  'c': { teethInfluence: 1.1, tonguePlacement: 0.8, tongueConstriction: 1.4 },
  'č': { teethInfluence: 0.4, tonguePlacement: -0.3, tongueConstriction: 0.85 },
  'dz': { teethInfluence: 0.9, tonguePlacement: 0.7, tongueConstriction: 1.2 },
  'dž': { teethInfluence: 0.45, tonguePlacement: -0.25, tongueConstriction: 0.9 }
};

// ================= EFFECT RACK TYPES & CONFIGURATIONS =================

export interface ParametricEQConfig {
  enabled: boolean;
  lowGain: number;    // dB (-18 to +18)
  lowFreq: number;    // Hz (60 to 350)
  midGain: number;    // dB (-18 to +18)
  midFreq: number;    // Hz (350 to 4000)
  midQ: number;       // Q (0.3 to 5.0)
  highGain: number;   // dB (-18 to +18)
  highFreq: number;   // Hz (4000 to 12000)
}

export interface DistortionConfig {
  enabled: boolean;
  type: 'warm' | 'overdrive' | 'fuzz' | 'hard';
  drive: number;      // 0 to 100
  tone: number;       // Hz (1000 to 12000)
  mix: number;        // 0 to 1
  outputGain: number; // 0 to 2
}

export interface BitcrusherConfig {
  enabled: boolean;
  bits: number;         // 2 to 16 bits
  downsample: number;   // 1 to 16x reduction
  mix: number;          // 0 to 1
}

export interface ChorusConfig {
  enabled: boolean;
  rate: number;         // Hz (0.1 to 8.0)
  depth: number;        // ms (0.5 to 8.0)
  delay: number;        // ms (5 to 30)
  feedback: number;     // 0 to 0.7
  mix: number;          // 0 to 1
}

export interface FlangerPhaserConfig {
  enabled: boolean;
  mode: 'flanger' | 'phaser';
  rate: number;         // Hz (0.05 to 5.0)
  depth: number;        // 0 to 1
  feedback: number;     // -0.85 to 0.85
  baseFreq: number;     // Hz (200 to 3000)
  mix: number;          // 0 to 1
}

export interface DelayConfig {
  enabled: boolean;
  time: number;         // ms (30 to 800)
  feedback: number;     // 0 to 0.85
  damping: number;      // Hz (800 to 10000)
  pingPong: boolean;    // stereo bouncing echo
  mix: number;          // 0 to 1
}

export interface ReverbRackConfig {
  enabled: boolean;
  type: 'room' | 'hall' | 'cathedral' | 'plate' | 'cosmic';
  decay: number;        // sec (0.2 to 6.0)
  preDelay: number;     // ms (0 to 80)
  damping: number;      // 0 to 1
  mix: number;          // 0 to 1
}

export interface TremoloRingModConfig {
  enabled: boolean;
  mode: 'tremolo' | 'ringmod';
  rate: number;         // Hz (0.5 to 800 Hz)
  depth: number;        // 0 to 1
  waveform: 'sine' | 'triangle' | 'square';
  mix: number;          // 0 to 1
}

export interface LoFiSpecialFilterConfig {
  enabled: boolean;
  type: 'telephone' | 'megaphone' | 'walkie' | 'radio' | 'vinyl' | 'underwater';
  intensity: number;    // 0 to 1
  noiseCrackle: number; // 0 to 1
  mix: number;          // 0 to 1
}

export interface PitchHarmonizerConfig {
  enabled: boolean;
  pitchShiftSemitones: number; // -12 to +12 semitones
  robotMonotone: boolean;      // Lock pitch to flat monotone vocoder carrier
  subHarmonic: number;         // 0 to 1 (octave down blend)
  fifthHarmonic: number;       // 0 to 1 (fifth blend)
  mix: number;                 // 0 to 1
}

export interface AutoWahConfig {
  enabled: boolean;
  baseFreq: number;     // Hz (200 to 1200)
  sweepRange: number;   // Hz (300 to 3000)
  speed: number;        // Hz (0.5 to 6.0)
  resonance: number;    // Q factor (1 to 15)
  mix: number;          // 0 to 1
}

export interface StereoWidenerConfig {
  enabled: boolean;
  width: number;        // 0% (mono) to 200% (super wide)
  haasDelayMs: number;  // 0 to 25 ms
}

export interface CompressorLimiterConfig {
  enabled: boolean;
  threshold: number;    // dB (-36 to 0)
  ratio: number;        // 1 to 20
  attack: number;       // ms (1 to 100)
  release: number;      // ms (10 to 400)
  makeupGain: number;   // dB (0 to 12)
}

export interface AudioEffectsConfig {
  masterBypass: boolean;
  masterGain: number;       // 0 to 2 (default 1.0)
  eq: ParametricEQConfig;
  distortion: DistortionConfig;
  bitcrusher: BitcrusherConfig;
  chorus: ChorusConfig;
  flangerPhaser: FlangerPhaserConfig;
  delay: DelayConfig;
  reverb: ReverbRackConfig;
  tremoloRingMod: TremoloRingModConfig;
  loFiFilter: LoFiSpecialFilterConfig;
  pitchHarmonizer: PitchHarmonizerConfig;
  autoWah: AutoWahConfig;
  stereoWidener: StereoWidenerConfig;
  compressor: CompressorLimiterConfig;
}

export const DEFAULT_AUDIO_EFFECTS: AudioEffectsConfig = {
  masterBypass: false,
  masterGain: 1.0,
  eq: {
    enabled: false,
    lowGain: 3.0,
    lowFreq: 150,
    midGain: 2.0,
    midFreq: 1200,
    midQ: 1.0,
    highGain: -2.0,
    highFreq: 6000
  },
  distortion: {
    enabled: false,
    type: 'warm',
    drive: 25,
    tone: 5000,
    mix: 0.5,
    outputGain: 1.0
  },
  bitcrusher: {
    enabled: false,
    bits: 8,
    downsample: 4,
    mix: 0.75
  },
  chorus: {
    enabled: false,
    rate: 1.5,
    depth: 3.5,
    delay: 15,
    feedback: 0.25,
    mix: 0.4
  },
  flangerPhaser: {
    enabled: false,
    mode: 'flanger',
    rate: 0.6,
    depth: 0.7,
    feedback: 0.5,
    baseFreq: 800,
    mix: 0.45
  },
  delay: {
    enabled: false,
    time: 240,
    feedback: 0.45,
    damping: 3500,
    pingPong: true,
    mix: 0.35
  },
  reverb: {
    enabled: false,
    type: 'hall',
    decay: 2.2,
    preDelay: 20,
    damping: 0.4,
    mix: 0.35
  },
  tremoloRingMod: {
    enabled: false,
    mode: 'tremolo',
    rate: 6.0,
    depth: 0.65,
    waveform: 'sine',
    mix: 0.6
  },
  loFiFilter: {
    enabled: false,
    type: 'telephone',
    intensity: 0.8,
    noiseCrackle: 0.3,
    mix: 0.8
  },
  pitchHarmonizer: {
    enabled: false,
    pitchShiftSemitones: 0,
    robotMonotone: false,
    subHarmonic: 0.0,
    fifthHarmonic: 0.0,
    mix: 0.5
  },
  autoWah: {
    enabled: false,
    baseFreq: 400,
    sweepRange: 1400,
    speed: 2.2,
    resonance: 6.0,
    mix: 0.5
  },
  stereoWidener: {
    enabled: false,
    width: 140,
    haasDelayMs: 12
  },
  compressor: {
    enabled: false,
    threshold: -18,
    ratio: 4.0,
    attack: 10,
    release: 80,
    makeupGain: 3.0
  }
};

