import { PhonemeConfig, PhonemeSegment, VoiceConfig, SpeechStats } from '../types';

// Standard Slovak Phonetics Dictionary
// Formants: F1, F2, F3, F4 (frequency in Hz, gain in dB, Q factor)
export const SLOVAK_PHONEMES: Record<string, PhonemeConfig> = {
  // Silent/Pause
  ' ': { symbol: ' ', type: 'silence', baseDuration: 150 },
  '.': { symbol: '.', type: 'silence', baseDuration: 400 },
  ',': { symbol: ',', type: 'silence', baseDuration: 250 },
  '?': { symbol: '?', type: 'silence', baseDuration: 400 },
  '!': { symbol: '!', type: 'silence', baseDuration: 400 },

  // Vowels (Short)
  'a': {
    symbol: 'a',
    type: 'vowel',
    baseDuration: 110,
    voicedGain: 1.0,
    formants: [
      { frequency: 730, gain: 0, q: 10 },    // F1
      { frequency: 1090, gain: -4, q: 12 },  // F2
      { frequency: 2440, gain: -12, q: 10 }, // F3
      { frequency: 3400, gain: -20, q: 8 }   // F4
    ]
  },
  'ä': {
    symbol: 'ä',
    type: 'vowel',
    baseDuration: 120,
    voicedGain: 0.95,
    formants: [
      { frequency: 660, gain: 0, q: 10 },
      { frequency: 1720, gain: -6, q: 12 },
      { frequency: 2410, gain: -15, q: 10 },
      { frequency: 3400, gain: -22, q: 8 }
    ]
  },
  'e': {
    symbol: 'e',
    type: 'vowel',
    baseDuration: 105,
    voicedGain: 1.0,
    formants: [
      { frequency: 530, gain: 0, q: 10 },
      { frequency: 1840, gain: -6, q: 10 },
      { frequency: 2480, gain: -14, q: 8 },
      { frequency: 3500, gain: -22, q: 6 }
    ]
  },
  'i': {
    symbol: 'i',
    type: 'vowel',
    baseDuration: 95,
    voicedGain: 0.95,
    formants: [
      { frequency: 270, gain: 0, q: 12 },
      { frequency: 2290, gain: -8, q: 12 },
      { frequency: 3010, gain: -16, q: 10 },
      { frequency: 3800, gain: -24, q: 6 }
    ]
  },
  'o': {
    symbol: 'o',
    type: 'vowel',
    baseDuration: 110,
    voicedGain: 1.0,
    formants: [
      { frequency: 570, gain: 0, q: 10 },
      { frequency: 840, gain: -4, q: 12 },
      { frequency: 2410, gain: -16, q: 10 },
      { frequency: 3400, gain: -24, q: 6 }
    ]
  },
  'u': {
    symbol: 'u',
    type: 'vowel',
    baseDuration: 105,
    voicedGain: 0.95,
    formants: [
      { frequency: 300, gain: 0, q: 12 },
      { frequency: 870, gain: -6, q: 12 },
      { frequency: 2240, gain: -18, q: 10 },
      { frequency: 3300, gain: -26, q: 6 }
    ]
  },
  'y': { // Technically same as 'i' in standard slovak speech
    symbol: 'y',
    type: 'vowel',
    baseDuration: 95,
    voicedGain: 0.95,
    formants: [
      { frequency: 280, gain: 0, q: 12 },
      { frequency: 2150, gain: -8, q: 12 },
      { frequency: 2950, gain: -16, q: 10 },
      { frequency: 3800, gain: -24, q: 6 }
    ]
  },

  // Long Vowels - same formants, but longer base duration
  'á': { symbol: 'á', type: 'vowel', baseDuration: 210, voicedGain: 1.0, formants: null /* computed dynamically */ },
  'é': { symbol: 'é', type: 'vowel', baseDuration: 200, voicedGain: 1.0, formants: null },
  'í': { symbol: 'í', type: 'vowel', baseDuration: 180, voicedGain: 0.95, formants: null },
  'ó': { symbol: 'ó', type: 'vowel', baseDuration: 210, voicedGain: 1.0, formants: null },
  'ú': { symbol: 'ú', type: 'vowel', baseDuration: 200, voicedGain: 0.95, formants: null },
  'ý': { symbol: 'ý', type: 'vowel', baseDuration: 180, voicedGain: 0.95, formants: null },

  // Diphthongs (Dvojhlásky) - We will interpolate formants in the synthesizer
  'ia': { symbol: 'ia', type: 'diphthong', baseDuration: 220, voicedGain: 1.0 },
  'ie': { symbol: 'ie', type: 'diphthong', baseDuration: 210, voicedGain: 1.0 },
  'iu': { symbol: 'iu', type: 'diphthong', baseDuration: 210, voicedGain: 0.95 },
  'ô':  { symbol: 'ô',  type: 'diphthong', baseDuration: 220, voicedGain: 1.0 }, // (u -> o transition)

  // Glides
  'j': {
    symbol: 'j',
    type: 'glide',
    baseDuration: 70,
    voicedGain: 0.85,
    formants: [
      { frequency: 250, gain: -2, q: 15 },
      { frequency: 2100, gain: -10, q: 12 },
      { frequency: 2900, gain: -18, q: 10 },
      { frequency: 3800, gain: -26, q: 6 }
    ]
  },
  'u̯': {
    symbol: 'u̯',
    type: 'glide',
    baseDuration: 60,
    voicedGain: 0.60,
    formants: [
      { frequency: 320, gain: -2, q: 12 },
      { frequency: 800, gain: -8, q: 12 },
      { frequency: 2200, gain: -22, q: 10 },
      { frequency: 3300, gain: -28, q: 6 }
    ]
  },

  // Nasals (Damped formants with unique resonant signatures)
  'm': {
    symbol: 'm',
    type: 'nasal',
    baseDuration: 85,
    voicedGain: 0.75,
    formants: [
      { frequency: 280, gain: -3, q: 15 },
      { frequency: 1000, gain: -18, q: 6 },
      { frequency: 2200, gain: -24, q: 5 },
      { frequency: 3200, gain: -30, q: 4 }
    ]
  },
  'n': {
    symbol: 'n',
    type: 'nasal',
    baseDuration: 85,
    voicedGain: 0.75,
    formants: [
      { frequency: 280, gain: -3, q: 15 },
      { frequency: 1450, gain: -16, q: 8 },
      { frequency: 2200, gain: -22, q: 6 },
      { frequency: 3300, gain: -28, q: 5 }
    ]
  },
  'ň': {
    symbol: 'ň',
    type: 'nasal',
    baseDuration: 90,
    voicedGain: 0.7,
    formants: [
      { frequency: 280, gain: -3, q: 15 },
      { frequency: 1900, gain: -12, q: 10 },
      { frequency: 2600, gain: -18, q: 8 },
      { frequency: 3500, gain: -26, q: 5 }
    ]
  },
  'ŋ': {
    symbol: 'ŋ',
    type: 'nasal',
    baseDuration: 85,
    voicedGain: 0.75,
    formants: [
      { frequency: 280, gain: -3, q: 15 },
      { frequency: 2100, gain: -14, q: 8 },  // High F2 locus typical of velars
      { frequency: 3000, gain: -20, q: 6 },  // F3 locus
      { frequency: 3300, gain: -28, q: 5 }
    ]
  },

  // Liquids (l, ľ, r are syllabic or standard consonants)
  'l': {
    symbol: 'l',
    type: 'glide',
    baseDuration: 85,
    voicedGain: 0.75,
    formants: [
      { frequency: 330, gain: -2, q: 10 },
      { frequency: 1050, gain: -12, q: 8 },
      { frequency: 2500, gain: -18, q: 6 },
      { frequency: 3400, gain: -26, q: 5 }
    ]
  },
  'ľ': {
    symbol: 'ľ',
    type: 'glide',
    baseDuration: 85,
    voicedGain: 0.75,
    formants: [
      { frequency: 300, gain: -2, q: 10 },
      { frequency: 1650, gain: -10, q: 10 },
      { frequency: 2650, gain: -16, q: 8 },
      { frequency: 3500, gain: -24, q: 5 }
    ]
  },
  // 'r' is a trill - modulated periodic signal
  'r': {
    symbol: 'r',
    type: 'trill',
    baseDuration: 100,
    voicedGain: 0.75,
    formants: [
      { frequency: 450, gain: -3, q: 8 },
      { frequency: 1300, gain: -12, q: 8 },
      { frequency: 2300, gain: -18, q: 8 },
      { frequency: 3300, gain: -26, q: 6 }
    ]
  },
  'ŕ': {
    symbol: 'ŕ',
    type: 'trill',
    baseDuration: 180, // Syllabic long trill
    voicedGain: 0.75,
    formants: [
      { frequency: 450, gain: -3, q: 8 },
      { frequency: 1300, gain: -12, q: 8 },
      { frequency: 2300, gain: -18, q: 8 },
      { frequency: 3300, gain: -26, q: 6 }
    ]
  },
  'ĺ': {
    symbol: 'ĺ',
    type: 'glide',
    baseDuration: 180, // Syllabic long liquid
    voicedGain: 0.75,
    formants: [
      { frequency: 330, gain: -2, q: 10 },
      { frequency: 1050, gain: -12, q: 8 },
      { frequency: 2500, gain: -18, q: 6 },
      { frequency: 3400, gain: -26, q: 5 }
    ]
  },

  // Unvoiced Fricatives
  's': {
    symbol: 's',
    type: 'fricative',
    baseDuration: 90,
    noiseFreq: 6000,
    noiseBandwidth: 1.5,
    noiseGain: 1.0,
    voicedGain: 0
  },
  'š': {
    symbol: 'š',
    type: 'fricative',
    baseDuration: 100,
    noiseFreq: 3200,
    noiseBandwidth: 1.2,
    noiseGain: 1.0,
    voicedGain: 0
  },
  'f': {
    symbol: 'f',
    type: 'fricative',
    baseDuration: 85,
    noiseFreq: 4000,
    noiseBandwidth: 0.5, // Very broad
    noiseGain: 0.45,
    voicedGain: 0
  },
  'ch': {
    symbol: 'ch',
    type: 'fricative',
    baseDuration: 110,
    noiseFreq: 1800,
    noiseBandwidth: 2.0,
    noiseGain: 0.65,
    voicedGain: 0
  },

  // Voiced Fricatives
  'z': {
    symbol: 'z',
    type: 'fricative',
    baseDuration: 90,
    noiseFreq: 5500,
    noiseBandwidth: 1.5,
    noiseGain: 0.65,
    voicedGain: 0.35, // mixed hum
    formants: [
      { frequency: 260, gain: -15, q: 8 },  // Low throat voice-bar resonance
      { frequency: 1800, gain: -24, q: 6 }, // F2 locus
      { frequency: 2600, gain: -28, q: 6 }, // F3 locus
      { frequency: 3500, gain: -35, q: 4 }  // F4 locus
    ]
  },
  'ž': {
    symbol: 'ž',
    type: 'fricative',
    baseDuration: 100,
    noiseFreq: 3000,
    noiseBandwidth: 1.2,
    noiseGain: 0.65,
    voicedGain: 0.35,
    formants: [
      { frequency: 250, gain: -14, q: 8 },  // Low throat voice-bar resonance
      { frequency: 1600, gain: -22, q: 6 }, // F2 locus
      { frequency: 2300, gain: -26, q: 6 }, // F3 locus
      { frequency: 3400, gain: -34, q: 4 }  // F4 locus
    ]
  },
  'v': {
    symbol: 'v',
    type: 'fricative',
    baseDuration: 80,
    noiseFreq: 2200,
    noiseBandwidth: 0.7,
    noiseGain: 0.25,
    voicedGain: 0.6,
    formants: [
      { frequency: 290, gain: -10, q: 10 }, // Low F1 (labialization)
      { frequency: 900, gain: -18, q: 8 },  // Low F2
      { frequency: 2200, gain: -26, q: 6 }, // F3
      { frequency: 3300, gain: -32, q: 4 }  // F4
    ]
  },
  'h': {
    symbol: 'h',
    type: 'fricative',
    baseDuration: 95,
    noiseFreq: 1100,
    noiseBandwidth: 1.0,
    noiseGain: 0.3,
    voicedGain: 0.7, // predominantly voiced breathiness
    aspirationGain: 0.4,
    formants: [
      { frequency: 350, gain: -12, q: 6 },  // Low wide F1
      { frequency: 1200, gain: -18, q: 6 }, // Neutral F2
      { frequency: 2200, gain: -24, q: 5 }, // F3
      { frequency: 3200, gain: -30, q: 4 }  // F4
    ]
  },

  // Plosives Unvoiced (gap + high resonant burst)
  'p': {
    symbol: 'p',
    type: 'plosive',
    baseDuration: 75, // includes silent closure + burst
    noiseFreq: 500,
    noiseBandwidth: 0.8,
    noiseGain: 0.4,
    voicedGain: 0
  },
  't': {
    symbol: 't',
    type: 'plosive',
    baseDuration: 80,
    noiseFreq: 4500,
    noiseBandwidth: 2.0,
    noiseGain: 0.75,
    voicedGain: 0
  },
  'ť': {
    symbol: 'ť',
    type: 'plosive',
    baseDuration: 85,
    noiseFreq: 3800,
    noiseBandwidth: 3.0, // sharper
    noiseGain: 0.75,
    voicedGain: 0
  },
  'k': {
    symbol: 'k',
    type: 'plosive',
    baseDuration: 80,
    noiseFreq: 1600,
    noiseBandwidth: 1.8,
    noiseGain: 0.7,
    voicedGain: 0
  },

  // Plosives Voiced (gap with low voiced hum + weaker burst)
  'b': {
    symbol: 'b',
    type: 'plosive',
    baseDuration: 75,
    noiseFreq: 450,
    noiseBandwidth: 0.8,
    noiseGain: 0.25,
    voicedGain: 0.45, // voicehum during gap
    formants: [
      { frequency: 200, gain: -20, q: 6 },
      { frequency: 800, gain: -28, q: 6 },
      { frequency: 2000, gain: -35, q: 4 },
      { frequency: 3200, gain: -40, q: 4 }
    ]
  },
  'd': {
    symbol: 'd',
    type: 'plosive',
    baseDuration: 80,
    noiseFreq: 4000,
    noiseBandwidth: 2.0,
    noiseGain: 0.4,
    voicedGain: 0.45,
    formants: [
      { frequency: 220, gain: -20, q: 6 },
      { frequency: 1700, gain: -28, q: 6 },
      { frequency: 2500, gain: -35, q: 4 },
      { frequency: 3300, gain: -40, q: 4 }
    ]
  },
  'ď': {
    symbol: 'ď',
    type: 'plosive',
    baseDuration: 85,
    noiseFreq: 3400,
    noiseBandwidth: 2.5,
    noiseGain: 0.45,
    voicedGain: 0.45,
    formants: [
      { frequency: 220, gain: -20, q: 6 },
      { frequency: 2100, gain: -26, q: 6 },
      { frequency: 2800, gain: -34, q: 4 },
      { frequency: 3500, gain: -40, q: 4 }
    ]
  },
  'g': {
    symbol: 'g',
    type: 'plosive',
    baseDuration: 80,
    noiseFreq: 1400,
    noiseBandwidth: 1.5,
    noiseGain: 0.4,
    voicedGain: 0.45,
    formants: [
      { frequency: 220, gain: -20, q: 6 },
      { frequency: 1500, gain: -28, q: 6 },
      { frequency: 2200, gain: -35, q: 4 },
      { frequency: 3300, gain: -40, q: 4 }
    ]
  },

  // Affricates (Closure + immediate transition to fricative)
  'c': {
    symbol: 'c',
    type: 'affricate', // treated like a quick plosive-release s
    baseDuration: 110,
    noiseFreq: 6000,
    noiseBandwidth: 2.0,
    noiseGain: 0.65,
    voicedGain: 0
  },
  'č': {
    symbol: 'č',
    type: 'affricate', // treated like a quick plosive-release š
    baseDuration: 120,
    noiseFreq: 3200,
    noiseBandwidth: 1.5,
    noiseGain: 0.45,
    voicedGain: 0
  },
  'dz': {
    symbol: 'dz',
    type: 'affricate',
    baseDuration: 110,
    noiseFreq: 5500,
    noiseBandwidth: 2.0,
    noiseGain: 0.6,
    voicedGain: 0.4,
    formants: [
      { frequency: 260, gain: -15, q: 8 },
      { frequency: 1800, gain: -24, q: 6 },
      { frequency: 2600, gain: -28, q: 6 },
      { frequency: 3500, gain: -35, q: 4 }
    ]
  },
  'dž': {
    symbol: 'dž',
    type: 'affricate',
    baseDuration: 120,
    noiseFreq: 3000,
    noiseBandwidth: 1.5,
    noiseGain: 0.6,
    voicedGain: 0.4,
    formants: [
      { frequency: 250, gain: -14, q: 8 },
      { frequency: 1600, gain: -22, q: 6 },
      { frequency: 2300, gain: -26, q: 6 },
      { frequency: 3400, gain: -34, q: 4 }
    ]
  }
};

// Fill in dynamic long vowels references from short vowels
const shortToLong: Record<string, string> = {
  'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ý': 'y'
};
for (const long in shortToLong) {
  const shortKey = shortToLong[long];
  if (SLOVAK_PHONEMES[long] && SLOVAK_PHONEMES[shortKey]) {
    SLOVAK_PHONEMES[long].formants = SLOVAK_PHONEMES[shortKey].formants;
  }
}

// Slovak voicing assimilation maps
const VOICED_CONSONANTS = ['b', 'd', 'ď', 'g', 'z', 'ž', 'dz', 'dž', 'v', 'h'];
const VOICELESS_CONSONANTS = ['p', 't', 'ť', 'k', 's', 'š', 'c', 'č', 'f', 'ch'];

const ASSIMILATION_PAIR_TO_VOICELESS: Record<string, string> = {
  'b': 'p', 'd': 't', 'ď': 'ť', 'g': 'k', 'z': 's', 'ž': 'š', 'dz': 'c', 'dž': 'č', 'v': 'f', 'h': 'ch'
};
const ASSIMILATION_PAIR_TO_VOICED: Record<string, string> = {
  'p': 'b', 't': 'd', 'ť': 'ď', 'k': 'g', 's': 'z', 'š': 'ž', 'c': 'dz', 'č': 'dž', 'f': 'v', 'ch': 'h'
};

const SONANTS = ['m', 'n', 'ň', 'l', 'ľ', 'r', 'ŕ', 'ĺ', 'j'];

interface UnitForms {
  sgNom: string;
  plNom: string;
  genPl: string;
  decGen: string;
  sgIns: string;
  plIns: string;
  gender: 'M' | 'F' | 'N';
}

const UNIT_DEFINITIONS: Array<{
  keys: string[];
  sgNom: string;
  plNom: string;
  genPl: string;
  decGen: string;
  sgIns: string;
  plIns: string;
  gender: 'M' | 'F' | 'N';
}> = [
  // Hmotnosť (Weight)
  {
    keys: ['kg', 'kilogram', 'kilogramy', 'kilogramov', 'kilogramu'],
    sgNom: 'kilogram', plNom: 'kilogramy', genPl: 'kilogramov', decGen: 'kilogramu',
    sgIns: 'kilogramom', plIns: 'kilogramami', gender: 'M'
  },
  {
    keys: ['g', 'gram', 'gramy', 'gramov', 'gramu'],
    sgNom: 'gram', plNom: 'gramy', genPl: 'gramov', decGen: 'gramu',
    sgIns: 'gramom', plIns: 'gramami', gender: 'M'
  },
  {
    keys: ['mg', 'miligram', 'miligramy', 'miligramov', 'miligramu'],
    sgNom: 'miligram', plNom: 'miligramy', genPl: 'miligramov', decGen: 'miligramu',
    sgIns: 'miligramom', plIns: 'miligramami', gender: 'M'
  },
  {
    keys: ['μg', 'mikrogram', 'mikrogramy', 'mikrogramov', 'mikrogramu'],
    sgNom: 'mikrogram', plNom: 'mikrogramy', genPl: 'mikrogramov', decGen: 'mikrogramu',
    sgIns: 'mikrogramom', plIns: 'mikrogramami', gender: 'M'
  },
  {
    keys: ['ng', 'nanogram', 'nanogramy', 'nanogramov', 'nanogramu'],
    sgNom: 'nanogram', plNom: 'nanogramy', genPl: 'nanogramov', decGen: 'nanogramu',
    sgIns: 'nanogramom', plIns: 'nanogramami', gender: 'M'
  },
  {
    keys: ['t', 'tona', 'tony', 'ton'],
    sgNom: 'tona', plNom: 'tony', genPl: 'ton', decGen: 'tony',
    sgIns: 'tonou', plIns: 'tonami', gender: 'F'
  },

  // Dĺžka (Length)
  {
    keys: ['m', 'meter', 'metre', 'metrov', 'metra'],
    sgNom: 'meter', plNom: 'metre', genPl: 'metrov', decGen: 'metra',
    sgIns: 'metrom', plIns: 'metrami', gender: 'M'
  },
  {
    keys: ['km', 'kilometer', 'kilometre', 'kilometrov', 'kilometru', 'kilometra'],
    sgNom: 'kilometer', plNom: 'kilometre', genPl: 'kilometrov', decGen: 'kilometra',
    sgIns: 'kilometrom', plIns: 'kilometrami', gender: 'M'
  },
  {
    keys: ['dm', 'decimeter', 'decimetre', 'decimetrov', 'decimetra'],
    sgNom: 'decimeter', plNom: 'decimetre', genPl: 'decimetrov', decGen: 'decimetra',
    sgIns: 'decimetrom', plIns: 'decimetrami', gender: 'M'
  },
  {
    keys: ['cm', 'centimeter', 'centimetre', 'centimetrov', 'centimetra'],
    sgNom: 'centimeter', plNom: 'centimetre', genPl: 'centimetrov', decGen: 'centimetra',
    sgIns: 'centimetrom', plIns: 'centimetrami', gender: 'M'
  },
  {
    keys: ['mm', 'milimeter', 'milimetre', 'milimetrov', 'milimetra'],
    sgNom: 'milimeter', plNom: 'milimetre', genPl: 'milimetrov', decGen: 'milimetra',
    sgIns: 'milimeterom', plIns: 'milimetrami', gender: 'M'
  },
  {
    keys: ['μm', 'mikrometer', 'mikrometre', 'mikrometrov', 'mikrometra'],
    sgNom: 'mikrometer', plNom: 'mikrometre', genPl: 'mikrometrov', decGen: 'mikrometra',
    sgIns: 'mikrometrom', plIns: 'mikrometrami', gender: 'M'
  },
  {
    keys: ['nm', 'nanometer', 'nanometre', 'nanometrov', 'nanometra'],
    sgNom: 'nanometer', plNom: 'nanometre', genPl: 'nanometrov', decGen: 'nanometra',
    sgIns: 'nanometrom', plIns: 'nanometrami', gender: 'M'
  },
  {
    keys: ['pm', 'pikometer', 'pikometre', 'pikometrov', 'pikometra'],
    sgNom: 'pikometer', plNom: 'pikometre', genPl: 'pikometrov', decGen: 'pikometra',
    sgIns: 'pikometrom', plIns: 'pikometrami', gender: 'M'
  },

  // Čas (Time)
  {
    keys: ['s', 'sekunda', 'sekundy', 'sekúnd'],
    sgNom: 'sekunda', plNom: 'sekundy', genPl: 'sekúnd', decGen: 'sekundy',
    sgIns: 'sekundou', plIns: 'sekundami', gender: 'F'
  },
  {
    keys: ['ms', 'milisekunda', 'milisekundy', 'milisekúnd'],
    sgNom: 'milisekunda', plNom: 'milisekundy', genPl: 'milisekúnd', decGen: 'milisekundy',
    sgIns: 'milisekundou', plIns: 'milisekundami', gender: 'F'
  },
  {
    keys: ['μs', 'mikrosekunda', 'mikrosekundy', 'mikrosekúnd'],
    sgNom: 'mikrosekunda', plNom: 'mikrosekundy', genPl: 'mikrosekúnd', decGen: 'mikrosekundy',
    sgIns: 'mikrosekundou', plIns: 'mikrosekundami', gender: 'F'
  },
  {
    keys: ['ns', 'nanosekunda', 'nanosekundy', 'nanosekúnd'],
    sgNom: 'nanosekunda', plNom: 'nanosekundy', genPl: 'nanosekúnd', decGen: 'nanosekundy',
    sgIns: 'nanosekundou', plIns: 'nanosekundami', gender: 'F'
  },
  {
    keys: ['min', 'minúta', 'minúty', 'minút'],
    sgNom: 'minúta', plNom: 'minúty', genPl: 'minút', decGen: 'minúty',
    sgIns: 'minútou', plIns: 'minútami', gender: 'F'
  },
  {
    keys: ['h', 'hodina', 'hodiny', 'hodín'],
    sgNom: 'hodina', plNom: 'hodiny', genPl: 'hodín', decGen: 'hodiny',
    sgIns: 'hodinou', plIns: 'hodinami', gender: 'F'
  },
  {
    keys: ['d', 'deň', 'dni', 'dní', 'dňa'],
    sgNom: 'deň', plNom: 'dni', genPl: 'dní', decGen: 'dňa',
    sgIns: 'dňom', plIns: 'dňami', gender: 'M'
  },

  // Plocha (Area)
  {
    keys: ['m²', 'meter štvorcový', 'metre štvorcové', 'metrov štvorcových', 'metra štvorcového'],
    sgNom: 'meter štvorcový', plNom: 'metre štvorcové', genPl: 'metrov štvorcových', decGen: 'metra štvorcového',
    sgIns: 'metrom štvorcovým', plIns: 'metrami štvorcovými', gender: 'M'
  },
  {
    keys: ['cm²', 'centimeter štvorcový', 'centimetre štvorcové', 'centimetrov štvorcových', 'centimetra štvorcového'],
    sgNom: 'centimeter štvorcový', plNom: 'centimetre štvorcové', genPl: 'centimetrov štvorcových', decGen: 'centimetra štvorcového',
    sgIns: 'centimetrom štvorcovým', plIns: 'centimetrami štvorcovými', gender: 'M'
  },
  {
    keys: ['km²', 'kilometer štvorcový', 'kilometre štvorcové', 'kilometrov štvorcových', 'kilometra štvorcového'],
    sgNom: 'kilometer štvorcový', plNom: 'kilometre štvorcové', genPl: 'kilometrov štvorcových', decGen: 'kilometra štvorcového',
    sgIns: 'kilometrom štvorcovým', plIns: 'kilometrami štvorcovými', gender: 'M'
  },
  {
    keys: ['ha', 'hektár', 'hektáre', 'hektárov', 'hektára'],
    sgNom: 'hektár', plNom: 'hektáre', genPl: 'hektárov', decGen: 'hektára',
    sgIns: 'hektárom', plIns: 'hektármi', gender: 'M'
  },

  // Objem (Volume)
  {
    keys: ['m³', 'meter kubický', 'metre kubické', 'metrov kubických', 'metra kubického'],
    sgNom: 'meter kubický', plNom: 'metre kubické', genPl: 'metrov kubických', decGen: 'metra kubického',
    sgIns: 'metrom kubickým', plIns: 'metrami kubickými', gender: 'M'
  },
  {
    keys: ['cm³', 'centimeter kubický', 'centimetre kubické', 'centimetrov kubických', 'centimetra kubického'],
    sgNom: 'centimeter kubický', plNom: 'centimetre kubické', genPl: 'centimetrov kubických', decGen: 'centimetra kubického',
    sgIns: 'centimetrom kubickým', plIns: 'centimetrami kubickými', gender: 'M'
  },
  {
    keys: ['dm³', 'decimeter kubický', 'decimetre kubické', 'decimetrov kubických', 'decimetra kubického'],
    sgNom: 'decimeter kubický', plNom: 'decimetre kubické', genPl: 'decimetrov kubických', decGen: 'decimetra kubického',
    sgIns: 'decimetrom kubickým', plIns: 'decimetrami kubickými', gender: 'M'
  },
  {
    keys: ['l', 'liter', 'litre', 'litrov', 'litra'],
    sgNom: 'liter', plNom: 'litre', genPl: 'litrov', decGen: 'litra',
    sgIns: 'litrom', plIns: 'litrami', gender: 'M'
  },
  {
    keys: ['ml', 'mililiter', 'mililitre', 'mililitrov', 'mililitra'],
    sgNom: 'mililiter', plNom: 'mililitre', genPl: 'mililitrov', decGen: 'mililitra',
    sgIns: 'mililitrom', plIns: 'mililitrami', gender: 'M'
  },
  {
    keys: ['μl', 'mikroliter', 'mikrolitre', 'mikrolitrov', 'mikrolitra'],
    sgNom: 'mikroliter', plNom: 'mikrolitre', genPl: 'mikrolitrov', decGen: 'mikrolitra',
    sgIns: 'mikrolitrom', plIns: 'mikrolitrami', gender: 'M'
  },

  // Teplota (Temperature)
  {
    keys: ['k', 'kelvin', 'kelviny', 'kelvinov', 'kelvinu'],
    sgNom: 'kelvin', plNom: 'kelviny', genPl: 'kelvinov', decGen: 'kelvinu',
    sgIns: 'kelvinom', plIns: 'kelvinami', gender: 'M'
  },
  {
    keys: ['celzia'],
    sgNom: 'stupeň Celzia', plNom: 'stupne Celzia', genPl: 'stupňov Celzia', decGen: 'stupňa Celzia',
    sgIns: 'stupňom Celzia', plIns: 'stupňami Celzia', gender: 'M'
  },
  {
    keys: ['fahrenheita'],
    sgNom: 'stupeň Fahrenheita', plNom: 'stupne Fahrenheita', genPl: 'stupňov Fahrenheita', decGen: 'stupňa Fahrenheita',
    sgIns: 'stupňom Fahrenheita', plIns: 'stupňami Fahrenheita', gender: 'M'
  },
  {
    keys: ['stupeň', 'stupne', 'stupňov', 'stupňa'],
    sgNom: 'stupeň', plNom: 'stupne', genPl: 'stupňov', decGen: 'stupňa',
    sgIns: 'stupňom', plIns: 'stupňami', gender: 'M'
  },

  // Elektrina (Electricity)
  {
    keys: ['A', 'a', 'ampér', 'ampéry', 'ampérov', 'ampéra'],
    sgNom: 'ampér', plNom: 'ampéry', genPl: 'ampérov', decGen: 'ampéra',
    sgIns: 'ampérom', plIns: 'ampérami', gender: 'M'
  },
  {
    keys: ['mA', 'ma', 'miliampér', 'miliampéry', 'miliampérov', 'miliampéra'],
    sgNom: 'miliampér', plNom: 'miliampéry', genPl: 'miliampérov', decGen: 'miliampéra',
    sgIns: 'miliampérom', plIns: 'miliampérami', gender: 'M'
  },
  {
    keys: ['μA', 'uA', 'μa', 'ua', 'mikroampér', 'mikroampéry', 'mikroampérov', 'mikroampéra'],
    sgNom: 'mikroampér', plNom: 'mikroampéry', genPl: 'mikroampérov', decGen: 'mikroampéra',
    sgIns: 'mikroampérom', plIns: 'mikroampérami', gender: 'M'
  },
  {
    keys: ['kA', 'ka', 'kiloampér', 'kiloampéry', 'kiloampérov', 'kiloampéra'],
    sgNom: 'kiloampér', plNom: 'kiloampéry', genPl: 'kiloampérov', decGen: 'kiloampéra',
    sgIns: 'kiloampérom', plIns: 'kiloampérami', gender: 'M'
  },
  {
    keys: ['MA', 'megaampér', 'megaampéry', 'megaampérov', 'megaampéra'],
    sgNom: 'megaampér', plNom: 'megaampéry', genPl: 'megaampérov', decGen: 'megaampéra',
    sgIns: 'megaampérom', plIns: 'megaampérami', gender: 'M'
  },
  {
    keys: ['V', 'v', 'volt', 'volty', 'voltov', 'voltu'],
    sgNom: 'volt', plNom: 'volty', genPl: 'voltov', decGen: 'voltu',
    sgIns: 'voltom', plIns: 'voltami', gender: 'M'
  },
  {
    keys: ['mV', 'mv', 'milivolt', 'milivolty', 'milivoltov', 'milivoltu'],
    sgNom: 'milivolt', plNom: 'milivolty', genPl: 'milivoltov', decGen: 'milivoltu',
    sgIns: 'milivoltom', plIns: 'milivoltami', gender: 'M'
  },
  {
    keys: ['kV', 'kv', 'kilovolt', 'kilovolty', 'kilovoltov', 'kilovoltu'],
    sgNom: 'kilovolt', plNom: 'kilovolty', genPl: 'kilovoltov', decGen: 'kilovoltu',
    sgIns: 'kilovoltom', plIns: 'kilovoltami', gender: 'M'
  },
  {
    keys: ['MV', 'megavolt', 'megavolty', 'megavoltov', 'megavoltu'],
    sgNom: 'megavolt', plNom: 'megavolty', genPl: 'megavoltov', decGen: 'megavoltu',
    sgIns: 'megavoltom', plIns: 'megavoltami', gender: 'M'
  },
  {
    keys: ['W', 'w', 'watt', 'watty', 'wattov', 'wattu'],
    sgNom: 'watt', plNom: 'watty', genPl: 'wattov', decGen: 'wattu',
    sgIns: 'wattom', plIns: 'wattami', gender: 'M'
  },
  {
    keys: ['mW', 'mw', 'miliwatt', 'miliwatty', 'miliwattov', 'miliwattu'],
    sgNom: 'miliwatt', plNom: 'miliwatty', genPl: 'miliwattov', decGen: 'miliwattu',
    sgIns: 'miliwattom', plIns: 'miliwattami', gender: 'M'
  },
  {
    keys: ['kW', 'kw', 'kilowatt', 'kilowatty', 'kilowattov', 'kilowattu'],
    sgNom: 'kilowatt', plNom: 'kilowatty', genPl: 'kilowattov', decGen: 'kilowattu',
    sgIns: 'kilowattom', plIns: 'kilowattami', gender: 'M'
  },
  {
    keys: ['MW', 'megawatt', 'megawatty', 'megawattov', 'megawattu'],
    sgNom: 'megawatt', plNom: 'megawatty', genPl: 'megawattov', decGen: 'megawattu',
    sgIns: 'megawattom', plIns: 'megawattami', gender: 'M'
  },
  {
    keys: ['GW', 'gw', 'gigawatt', 'gigawatty', 'gigawattov', 'gigawattu'],
    sgNom: 'gigawatt', plNom: 'gigawatty', genPl: 'gigawattov', decGen: 'gigawattu',
    sgIns: 'gigawattom', plIns: 'gigawattami', gender: 'M'
  },
  {
    keys: ['TW', 'tw', 'terawatt', 'terawatty', 'terawattov', 'terawattu'],
    sgNom: 'terawatt', plNom: 'terawatty', genPl: 'terawattov', decGen: 'terawattu',
    sgIns: 'terawattom', plIns: 'terawattami', gender: 'M'
  },
  {
    keys: ['Wh', 'wh', 'watthodina', 'watthodiny', 'watthodín', 'watthodiny'],
    sgNom: 'watthodina', plNom: 'watthodiny', genPl: 'watthodín', decGen: 'watthodiny',
    sgIns: 'watthodinou', plIns: 'watthodinami', gender: 'F'
  },
  {
    keys: ['kWh', 'kwh', 'kilowatthodina', 'kilowatthodiny', 'kilowatthodín', 'kilowatthodiny'],
    sgNom: 'kilowatthodina', plNom: 'kilowatthodiny', genPl: 'kilowatthodín', decGen: 'kilowatthodiny',
    sgIns: 'kilowatthodinou', plIns: 'kilowatthodinami', gender: 'F'
  },

  // Frekvencia (Frequency)
  {
    keys: ['Hz', 'hz', 'hertz', 'hertze', 'hertzov', 'hertza'],
    sgNom: 'hertz', plNom: 'hertze', genPl: 'hertzov', decGen: 'hertza',
    sgIns: 'hertzom', plIns: 'hertzami', gender: 'M'
  },
  {
    keys: ['kHz', 'khz', 'kilohertz', 'kilohertze', 'kilohertzov', 'kilohertza'],
    sgNom: 'kilohertz', plNom: 'kilohertze', genPl: 'kilohertzov', decGen: 'kilohertza',
    sgIns: 'kilohertzom', plIns: 'kilohertzami', gender: 'M'
  },
  {
    keys: ['MHz', 'mhz', 'megahertz', 'megahertze', 'megahertzov', 'megahertza'],
    sgNom: 'megahertz', plNom: 'megahertze', genPl: 'megahertzov', decGen: 'megahertza',
    sgIns: 'megahertzom', plIns: 'megahertzami', gender: 'M'
  },
  {
    keys: ['GHz', 'ghz', 'gigahertz', 'gigahertze', 'gigahertzov', 'gigahertza'],
    sgNom: 'gigahertz', plNom: 'gigahertze', genPl: 'gigahertzov', decGen: 'gigahertza',
    sgIns: 'gigahertzom', plIns: 'gigahertzami', gender: 'M'
  },

  // Tlak (Pressure)
  {
    keys: ['Pa', 'pa', 'pascal', 'pascaly', 'pascalov', 'pascalu'],
    sgNom: 'pascal', plNom: 'pascaly', genPl: 'pascalov', decGen: 'pascalu',
    sgIns: 'pascalom', plIns: 'pascalami', gender: 'M'
  },
  {
    keys: ['hPa', 'hpa', 'hektopascal', 'hektopascaly', 'hektopascalov', 'hektopascalu'],
    sgNom: 'hektopascal', plNom: 'hektopascaly', genPl: 'hektopascalov', decGen: 'hektopascalu',
    sgIns: 'hektopascalom', plIns: 'hektopascalami', gender: 'M'
  },
  {
    keys: ['kPa', 'kpa', 'kilopascal', 'kilopascaly', 'kilopascalov', 'kilopascalu'],
    sgNom: 'kilopascal', plNom: 'kilopascaly', genPl: 'kilopascalov', decGen: 'kilopascalu',
    sgIns: 'kilopascalom', plIns: 'kilopascalami', gender: 'M'
  },
  {
    keys: ['mPa', 'mpa', 'milipascal', 'milipascaly', 'milipascalov', 'milipascalu'],
    sgNom: 'milipascal', plNom: 'milipascaly', genPl: 'milipascalov', decGen: 'milipascalu',
    sgIns: 'milipascalom', plIns: 'milipascalami', gender: 'M'
  },
  {
    keys: ['MPa', 'megapascal', 'megapascaly', 'megapascalov', 'megapascalu'],
    sgNom: 'megapascal', plNom: 'megapascaly', genPl: 'megapascalov', decGen: 'megapascalu',
    sgIns: 'megapascalom', plIns: 'megapascalami', gender: 'M'
  },
  {
    keys: ['GPa', 'gpa', 'gigapascal', 'gigapascaly', 'gigapascalov', 'gigapascalu'],
    sgNom: 'gigapascal', plNom: 'gigapascaly', genPl: 'gigapascalov', decGen: 'gigapascalu',
    sgIns: 'gigapascalom', plIns: 'gigapascalami', gender: 'M'
  },
  {
    keys: ['bar', 'bary', 'barov', 'baru'],
    sgNom: 'bar', plNom: 'bary', genPl: 'barov', decGen: 'baru',
    sgIns: 'barom', plIns: 'barmi', gender: 'M'
  },
  {
    keys: ['mbar', 'milibar', 'milibary', 'milibarov', 'milibaru'],
    sgNom: 'milibar', plNom: 'milibary', genPl: 'milibarov', decGen: 'milibaru',
    sgIns: 'milibarom', plIns: 'milibarmi', gender: 'M'
  },

  // Energia (Energy)
  {
    keys: ['J', 'j', 'joule', 'jouly', 'joulov', 'joulu'],
    sgNom: 'joule', plNom: 'jouly', genPl: 'joulov', decGen: 'joulu',
    sgIns: 'joulom', plIns: 'joulami', gender: 'M'
  },
  {
    keys: ['kJ', 'kj', 'kilojoule', 'kilojouly', 'kilojoulov', 'kilojoulu'],
    sgNom: 'kilojoule', plNom: 'kilojouly', genPl: 'kilojoulov', decGen: 'kilojoulu',
    sgIns: 'kilojoulom', plIns: 'kilojoulami', gender: 'M'
  },
  {
    keys: ['mJ', 'mj', 'milijoule', 'milijouly', 'milijoulov', 'milijoulu'],
    sgNom: 'milijoule', plNom: 'milijouly', genPl: 'milijoulov', decGen: 'milijoulu',
    sgIns: 'milijoulom', plIns: 'milijoulami', gender: 'M'
  },
  {
    keys: ['MJ', 'megajoule', 'megajouly', 'megajoulov', 'megajoulu'],
    sgNom: 'megajoule', plNom: 'megajouly', genPl: 'megajoulov', decGen: 'megajoulu',
    sgIns: 'megajoulom', plIns: 'megajoulami', gender: 'M'
  },
  {
    keys: ['cal', 'kalória', 'kalórie', 'kalórií'],
    sgNom: 'kalória', plNom: 'kalórie', genPl: 'kalórií', decGen: 'kalórie',
    sgIns: 'kalóriou', plIns: 'kalóriami', gender: 'F'
  },
  {
    keys: ['kcal', 'kilokalória', 'kilokalórie', 'kilokalórií'],
    sgNom: 'kilokalória', plNom: 'kilokalórie', genPl: 'kilokalórií', decGen: 'kilokalórie',
    sgIns: 'kilokalóriou', plIns: 'kilokalóriami', gender: 'F'
  },

  // Výkon (Power)
  {
    keys: ['hp', 'ps', 'konská sila', 'konské sily', 'konských síl', 'konskej sily'],
    sgNom: 'konská sila', plNom: 'konské sily', genPl: 'konských síl', decGen: 'konskej sily',
    sgIns: 'konskou silou', plIns: 'konskými silami', gender: 'F'
  },

  // Dáta (Data)
  {
    keys: ['bit', 'bity', 'bitov', 'bitu', 'b'],
    sgNom: 'bit', plNom: 'bity', genPl: 'bitov', decGen: 'bitu',
    sgIns: 'bitom', plIns: 'bitami', gender: 'M'
  },
  {
    keys: ['Kb', 'kb', 'kilobit', 'kilobity', 'kilobitov', 'kilobitu'],
    sgNom: 'kilobit', plNom: 'kilobity', genPl: 'kilobitov', decGen: 'kilobitu',
    sgIns: 'kilobitom', plIns: 'kilobitami', gender: 'M'
  },
  {
    keys: ['Mb', 'mb', 'megabit', 'megabity', 'megabitov', 'megabitu'],
    sgNom: 'megabit', plNom: 'megabity', genPl: 'megabitov', decGen: 'megabitu',
    sgIns: 'megabitom', plIns: 'megabitami', gender: 'M'
  },
  {
    keys: ['Gb', 'gb', 'gigabit', 'gigabity', 'gigabitov', 'gigabitu'],
    sgNom: 'gigabit', plNom: 'gigabity', genPl: 'gigabitov', decGen: 'gigabitu',
    sgIns: 'gigabitom', plIns: 'gigabitami', gender: 'M'
  },
  {
    keys: ['Tb', 'tb', 'terabit', 'terabity', 'terabitov', 'terabitu'],
    sgNom: 'terabit', plNom: 'terabity', genPl: 'terabitov', decGen: 'terabitu',
    sgIns: 'terabitom', plIns: 'terabitami', gender: 'M'
  },
  {
    keys: ['B', 'bajt', 'bajty', 'bajtov', 'bajtu'],
    sgNom: 'bajt', plNom: 'bajty', genPl: 'bajtov', decGen: 'bajtu',
    sgIns: 'bajtom', plIns: 'bajtami', gender: 'M'
  },
  {
    keys: ['kB', 'kilobajt', 'kilobajty', 'kilobajtov', 'kilobajtu'],
    sgNom: 'kilobajt', plNom: 'kilobajty', genPl: 'kilobajtov', decGen: 'kilobajtu',
    sgIns: 'kilobajtom', plIns: 'kilobajtami', gender: 'M'
  },
  {
    keys: ['MB', 'megabajt', 'megabajty', 'megabajtov', 'megabajtu'],
    sgNom: 'megabajt', plNom: 'megabajty', genPl: 'megabajtov', decGen: 'megabajtu',
    sgIns: 'megabajtom', plIns: 'megabajtami', gender: 'M'
  },
  {
    keys: ['GB', 'gigabajt', 'gigabajty', 'gigabajtov', 'gigabajtu'],
    sgNom: 'gigabajt', plNom: 'gigabajty', genPl: 'gigabajtov', decGen: 'gigabajtu',
    sgIns: 'gigabajtom', plIns: 'gigabajtami', gender: 'M'
  },
  {
    keys: ['TB', 'terabajt', 'terabajty', 'terabajtov', 'terabajtu'],
    sgNom: 'terabajt', plNom: 'terabajty', genPl: 'terabajtov', decGen: 'terabajtu',
    sgIns: 'terabajtom', plIns: 'terabajtami', gender: 'M'
  },
  {
    keys: ['MWh', 'mwh', 'megawatthodina', 'megawatthodiny', 'megawatthodín'],
    sgNom: 'megawatthodina', plNom: 'megawatthodiny', genPl: 'megawatthodín', decGen: 'megawatthodiny',
    sgIns: 'megawatthodinou', plIns: 'megawatthodinami', gender: 'F'
  },
  {
    keys: ['ot.', 'ot', 'otáčka', 'otáčky', 'otáčok'],
    sgNom: 'otáčka', plNom: 'otáčky', genPl: 'otáčok', decGen: 'otáčky',
    sgIns: 'otáčkou', plIns: 'otáčkami', gender: 'F'
  },
  {
    keys: ['obr.', 'obr', 'obrázok', 'obrázky', 'obrázkov'],
    sgNom: 'obrázok', plNom: 'obrázky', genPl: 'obrázkov', decGen: 'obrázka',
    sgIns: 'obrázkom', plIns: 'obrázkami', gender: 'M'
  },
  {
    keys: ['str.', 'str', 'strana', 'strany', 'strán'],
    sgNom: 'strana', plNom: 'strany', genPl: 'strán', decGen: 'strany',
    sgIns: 'stranou', plIns: 'stranami', gender: 'F'
  },

  // Menové a iné jednotky
  {
    keys: ['eur', 'euro', 'eurá', '€'],
    sgNom: 'euro', plNom: 'eurá', genPl: 'eur', decGen: 'eura',
    sgIns: 'eurom', plIns: 'eurami', gender: 'N'
  },
  {
    keys: ['sk'],
    sgNom: 'slovenská koruna', plNom: 'slovenské koruny', genPl: 'slovenských korún', decGen: 'slovenskej koruny',
    sgIns: 'slovenskou korunou', plIns: 'slovenskými korunami', gender: 'F'
  },
  {
    keys: ['ks'],
    sgNom: 'kus', plNom: 'kusy', genPl: 'kusov', decGen: 'kusu',
    sgIns: 'kusom', plIns: 'kusmi', gender: 'M'
  },
  {
    keys: ['$', 'dolár', 'doláre', 'dolárov', 'dolára'],
    sgNom: 'dolár', plNom: 'doláre', genPl: 'dolárov', decGen: 'dolára',
    sgIns: 'dolárom', plIns: 'dolármi', gender: 'M'
  },
  {
    keys: ['£', 'libra', 'libry', 'libier'],
    sgNom: 'libra', plNom: 'libry', genPl: 'libier', decGen: 'libry',
    sgIns: 'librou', plIns: 'librami', gender: 'F'
  },
  {
    keys: ['¥', 'jen', 'jeny', 'jenov', 'jena'],
    sgNom: 'jen', plNom: 'jeny', genPl: 'jenov', decGen: 'jena',
    sgIns: 'jenom', plIns: 'jenmi', gender: 'M'
  },
  {
    keys: ['%', 'percent', 'percento', 'percentá'],
    sgNom: 'percento', plNom: 'percentá', genPl: 'percent', decGen: 'percenta',
    sgIns: 'percentom', plIns: 'percentami', gender: 'N'
  },
  {
    keys: ['‰', 'promile'],
    sgNom: 'promile', plNom: 'promile', genPl: 'promile', decGen: 'promile',
    sgIns: 'promile', plIns: 'promile', gender: 'N'
  }
];

const UNIT_MAP: Record<string, UnitForms> = {};
const UNIT_GEN_SG: Record<string, string> = {};

UNIT_DEFINITIONS.forEach(def => {
  const forms: UnitForms = {
    sgNom: def.sgNom,
    plNom: def.plNom,
    genPl: def.genPl,
    decGen: def.decGen,
    sgIns: def.sgIns,
    plIns: def.plIns,
    gender: def.gender
  };
  def.keys.forEach(key => {
    // Populate exactly as defined (preserving case)
    UNIT_MAP[key] = forms;
    UNIT_GEN_SG[key] = def.decGen;

    // Populate lowercase fallback if not present
    const lower = key.toLowerCase();
    if (!UNIT_MAP[lower]) {
      UNIT_MAP[lower] = forms;
    }
    if (!UNIT_GEN_SG[lower]) {
      UNIT_GEN_SG[lower] = def.decGen;
    }
  });
});

const ORDINAL_STEMS: Record<number, { stem: string; type: 'y' | 'i' }> = {
  1: { stem: 'prv', type: 'y' },
  2: { stem: 'druh', type: 'y' },
  3: { stem: 'tret', type: 'i' },
  4: { stem: 'štvrt', type: 'y' },
  5: { stem: 'piat', type: 'y' },
  6: { stem: 'šiest', type: 'y' },
  7: { stem: 'siedm', type: 'y' },
  8: { stem: 'ôsm', type: 'y' },
  9: { stem: 'deviat', type: 'y' },
  10: { stem: 'desiat', type: 'y' },
  11: { stem: 'jedenást', type: 'y' },
  12: { stem: 'dvanást', type: 'y' },
  13: { stem: 'trinást', type: 'y' },
  14: { stem: 'štrnást', type: 'y' },
  15: { stem: 'pätnást', type: 'y' },
  16: { stem: 'šestnást', type: 'y' },
  17: { stem: 'sedemnást', type: 'y' },
  18: { stem: 'osemnást', type: 'y' },
  19: { stem: 'devätnást', type: 'y' },
  20: { stem: 'dvadsiat', type: 'y' },
  30: { stem: 'tridsiat', type: 'y' },
  40: { stem: 'štyridsiat', type: 'y' },
  50: { stem: 'päťdesiat', type: 'y' },
  60: { stem: 'šesťdesiat', type: 'y' },
  70: { stem: 'sedemdesiat', type: 'y' },
  80: { stem: 'osemdesiat', type: 'y' },
  90: { stem: 'deväťdesiat', type: 'y' },
};

export function getNominativeCardinal(num: number): string {
  if (num === 0) return 'nula';
  const ones = ['', 'jeden', 'dva', 'tri', 'štyri', 'päť', 'šesť', 'sedem', 'osem', 'deväť'];
  const teens = ['desať', 'jedenásť', 'dvanásť', 'trinásť', 'štrnásť', 'pätnásť', 'šestnásť', 'sedemnásť', 'osemnásť', 'devätnásť'];
  const tens = ['', 'desať', 'dvadsať', 'tridsať', 'štyridsať', 'päťdesiat', 'šesťdesiat', 'sedemdesiat', 'osemdesiat', 'deväťdesiat'];

  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const t = Math.floor(num / 10);
    const o = num % 10;
    return tens[t] + (o > 0 ? ones[o] : '');
  }
  if (num < 1000) {
    const h = Math.floor(num / 100);
    const rem = num % 100;
    const hundredWord = h === 1 ? 'sto' : h === 2 ? 'dvesto' : h === 3 ? 'tristo' : h === 4 ? 'štyristo' : (ones[h] + 'sto');
    return hundredWord + (rem > 0 ? ' ' + getNominativeCardinal(rem) : '');
  }
  if (num < 1000000) {
    const thousands = Math.floor(num / 1000);
    const rem = num % 1000;
    let thousandsWord = '';
    if (thousands === 1) {
      thousandsWord = 'tisíc';
    } else if (thousands === 2) {
      thousandsWord = 'dva tisíce';
    } else if (thousands === 3) {
      thousandsWord = 'tri tisíce';
    } else if (thousands === 4) {
      thousandsWord = 'štyri tisíce';
    } else {
      thousandsWord = getNominativeCardinal(thousands) + ' tisíc';
    }
    return thousandsWord + (rem > 0 ? ' ' + getNominativeCardinal(rem) : '');
  }
  if (num < 1000000000) {
    const millions = Math.floor(num / 1000000);
    const rem = num % 1000000;
    let millionsWord = '';
    if (millions === 1) {
      millionsWord = 'jeden milión';
    } else if (millions === 2) {
      millionsWord = 'dva milióny';
    } else if (millions === 3) {
      millionsWord = 'tri milióny';
    } else if (millions === 4) {
      millionsWord = 'štyri milióny';
    } else {
      millionsWord = getNominativeCardinal(millions) + ' miliónov';
    }
    return millionsWord + (rem > 0 ? ' ' + getNominativeCardinal(rem) : '');
  }
  if (num < 1000000000000) {
    const billions = Math.floor(num / 1000000000);
    const rem = num % 1000000000;
    let billionsWord = '';
    if (billions === 1) {
      billionsWord = 'jedna miliarda';
    } else if (billions === 2) {
      billionsWord = 'dve miliardy';
    } else if (billions === 3) {
      billionsWord = 'tri miliardy';
    } else if (billions === 4) {
      billionsWord = 'štyri miliardy';
    } else {
      billionsWord = getNominativeCardinal(billions) + ' miliárd';
    }
    return billionsWord + (rem > 0 ? ' ' + getNominativeCardinal(rem) : '');
  }
  return num.toString();
}

export function getInstrumentalCardinal(num: number): string {
  if (num === 0) return 'nulou';
  const onesIns = ['', 'jedným', 'dvoma', 'tromi', 'štyrmi', 'piatimi', 'šiestimi', 'siedmimi', 'ôsmimi', 'deviatimi'];
  const teensIns = ['desiatimi', 'jedenástimi', 'dvanástimi', 'trinástimi', 'štrnástimi', 'pätnástimi', 'šestnástimi', 'sedemnástimi', 'osemnástimi', 'devätnástimi'];
  const tensIns = ['', 'desiatimi', 'dvadsiatimi', 'tridsiatimi', 'štyridsiatimi', 'päťdesiatimi', 'šesťdesiatimi', 'sedemdesiatimi', 'osemdesiatimi', 'deväťdesiatimi'];

  if (num < 10) return onesIns[num];
  if (num < 20) return teensIns[num - 10];
  if (num < 100) {
    const t = Math.floor(num / 10);
    const o = num % 10;
    return tensIns[t] + (o > 0 ? ' ' + onesIns[o] : '');
  }
  if (num < 1000) {
    const h = Math.floor(num / 100);
    const rem = num % 100;
    const hundredWord = h === 1 ? 'sto' : h === 2 ? 'dvesto' : h === 3 ? 'tristo' : h === 4 ? 'štyristo' : (getNominativeCardinal(h) + 'sto');
    return hundredWord + (rem > 0 ? ' ' + getInstrumentalCardinal(rem) : '');
  }
  if (num < 1000000) {
    const thousands = Math.floor(num / 1000);
    const rem = num % 1000;
    let thousandsWord = '';
    if (thousands === 1) {
      thousandsWord = 'tisícom';
    } else {
      thousandsWord = getInstrumentalCardinal(thousands) + ' tisícami';
    }
    return thousandsWord + (rem > 0 ? ' ' + getInstrumentalCardinal(rem) : '');
  }
  if (num < 1000000000) {
    const millions = Math.floor(num / 1000000);
    const rem = num % 1000000;
    let millionsWord = '';
    if (millions === 1) {
      millionsWord = 'miliónom';
    } else {
      millionsWord = getInstrumentalCardinal(millions) + ' miliónmi';
    }
    return millionsWord + (rem > 0 ? ' ' + getInstrumentalCardinal(rem) : '');
  }
  if (num < 1000000000000) {
    const billions = Math.floor(num / 1000000000);
    const rem = num % 1000000000;
    let billionsWord = '';
    if (billions === 1) {
      billionsWord = 'miliardou';
    } else {
      billionsWord = getInstrumentalCardinal(billions) + ' miliardami';
    }
    return billionsWord + (rem > 0 ? ' ' + getInstrumentalCardinal(rem) : '');
  }
  return num.toString();
}

function applyStemEnding(stem: string, type: 'y' | 'i', gender: string): string {
  if (type === 'y') {
    switch (gender) {
      case 'M_NOM': return stem + 'ý';
      case 'M_LOC': return stem + 'om';
      case 'F_NOM': return stem + 'á';
      case 'F_LOC': return stem + 'ej';
      case 'N_NOM': return stem + 'é';
      case 'N_LOC': return stem + 'om';
    }
  } else {
    switch (gender) {
      case 'M_NOM': return stem + 'í';
      case 'M_LOC': return stem + 'om';
      case 'F_NOM': return stem + 'ia';
      case 'F_LOC': return stem + 'ej';
      case 'N_NOM': return stem + 'ie';
      case 'N_LOC': return stem + 'om';
    }
  }
  return stem;
}

export function getOrdinalWord(num: number, gender: 'M_NOM' | 'M_LOC' | 'F_NOM' | 'F_LOC' | 'N_NOM' | 'N_LOC'): string {
  if (num >= 21 && num <= 99) {
    const tens = Math.floor(num / 10) * 10;
    const units = num % 10;
    if (units === 0) {
      return getOrdinalWord(tens, gender);
    }
    return getOrdinalWord(tens, gender) + ' ' + getOrdinalWord(units, gender);
  }
  if (num === 100) {
    return applyStemEnding('st', 'y', gender);
  }
  const entry = ORDINAL_STEMS[num];
  if (!entry) {
    return num.toString() + '.';
  }
  return applyStemEnding(entry.stem, entry.type, gender);
}

export const ANGLICIZMY_PRONUNCIATION_MAP: Record<string, string> = {
  // Conversational & Daily Greetings (often used as loanwords)
  "hello": "helou",
  "hi": "haj",
  "yes": "jes",
  "no": "nou",
  "ok": "oukej",
  "okay": "oukej",
  "please": "plíz",
  "thank": "tenk",
  "thanks": "tenks",
  "welcome": "velkam",
  "bye": "baj",
  "goodbye": "gudbaj",
  "good": "gud",
  "perfect": "perfekt",
  "nice": "najs",
  "love": "lav",
  "sorry": "sori",
  "excuse": "ekskjúz",
  "happy": "hepi",
  "sad": "sed",
  "smart": "smart",
  "fast": "fást",
  "slow": "slou",
  "friend": "frend",
  "friends": "frendz",
  "home": "houm",
  "back": "bek",
  "next": "nekst",
  "help": "help",
  "work": "verk",
  "works": "verks",
  "game": "gejm",
  "games": "gejmz",
  "time": "tajm",
  "times": "tajmz",
  "world": "verld",
  "words": "verdz",
  "life": "lajf",
  "likes": "lajks",
  "day": "dej",
  "days": "dejz",
  "night": "najt",
  "nights": "najts",
  "morning": "mórning",
  "evening": "ívning",
  "school": "skúl",
  "app": "ep",
  "apps": "eps",
  "application": "eplikejšn",
  "applications": "eplikejšnz",
  "link": "link",
  "links": "links",
  "click": "klik",
  "clicks": "kliks",
  "programming": "prougreming",
  "online": "onlajn",
  "offline": "oflajn",
  "cache": "keš",
  "client": "klajent",
  "clients": "klajents",
  "user": "júzer",
  "users": "júzerz",
  "password": "pásvord",
  "passwords": "pásvordz",
  "settings": "setings",
  "error": "eror",
  "errors": "erorz",
  "warning": "vórning",
  "warnings": "vórningz",
  "project": "projekt",
  "projects": "projekts",
  "class": "klás",
  "classes": "klásiz",
  "group": "grúp",
  "groups": "grúpz",
  "vip": "ví aj pí",
  "pdfko": "pé dé ef ko",
  "ex": "eks",
  "max": "maks",
  "matrix": "metriks",
  "pixel": "piksel",
  "text": "tekst",
  "taxi": "taksi",
  "box": "boks",
  "fax": "faks",
  "mix": "miks",
  "relax": "relaks",
  "index": "indeks",
  "latex": "lateks",
  "plexisklo": "pleksisklo",
  "prax": "praks",
  "lux": "luks",
  "fix": "fiks",
  "fixka": "fiks_ka",
  "wax": "veks",
  "quick": "kvik",
  "quality": "kvaliti",
  "quantum": "kvantum",
  "quiz": "kviz",
  "queen": "kvín",
  "quota": "kvóta",
  "quote": "kvót",
  "query": "kvéri",
  "queue": "kjú",

  // Core Borrowed Words (anglicizmy_1000) from list
  "marketing": "marketing",
  "meeting": "míting",
  "feedback": "fídbek",
  "startup": "štartap",
  "leader": "líder",
  "manager": "menežer",
  "coach": "kouč",
  "briefing": "brífing",
  "brainstorming": "brejnstorming",
  "benchmark": "benčmark",
  "outsourcing": "autsorcing",
  "leasing": "lízing",
  "holding": "holding",
  "developer": "developer",
  "investor": "investor",
  "influencer": "influenser",
  "streamer": "strímer",
  "youtuber": "jútúber",
  "gamer": "gejmer",
  "hacker": "heker",
  "software": "softvér",
  "hardware": "hardvér",
  "notebook": "notbuk",
  "smartphone": "smartfón",
  "tablet": "tablet",
  "display": "displej",
  "server": "server",
  "cloud": "klaud",
  "hosting": "hosting",
  "router": "rauter",
  "modem": "modem",
  "switch": "svič",
  "firewall": "fajrvól",
  "bug": "bag",
  "patch": "peč",
  "update": "apdejt",
  "upgrade": "apgrejd",
  "download": "daunloud",
  "upload": "aploud",
  "login": "login",
  "logout": "logaut",
  "chat": "čet",
  "chatbot": "četbot",
  "mail": "mejl",
  "newsletter": "ňúvsleter",
  "spam": "spam",
  "hashtag": "hešteg",
  "post": "post",
  "reel": "ríl",
  "story": "stóri",
  "follower": "folover",
  "like": "lajk",
  "dislike": "dislajk",
  "share": "šer",
  "screenshot": "skrínšot",
  "podcast": "podkast",
  "livestream": "lajvstrím",
  "webinar": "webinár",
  "workshop": "vorkšop",
  "coworking": "kovorking",
  "networking": "netvorking",
  "freelancer": "frílenser",
  "job": "džob",
  "deadline": "dedlajn",
  "timing": "tajming",
  "trend": "trend",
  "hit": "hit",
  "bestseller": "bestseller",
  "comeback": "kambek",
  "remake": "rimejk",
  "casting": "kasting",
  "backstage": "bekstejdž",
  "show": "šou",
  "talkshow": "tokšou",
  "standup": "stendap",
  "performer": "performer",
  "dj": "dídžej",
  "remix": "remix",
  "playlist": "plejlist",
  "single": "singl",
  "cover": "kaver",
  "festival": "festival",
  "event": "event",
  "booking": "buking",
  "catering": "kejtering",
  "burger": "burger",
  "hotdog": "hotdog",
  "steak": "stejk",
  "toast": "toust",
  "muffin": "mafin",
  "donut": "donut",
  "smoothie": "smúti",
  "fitness": "fitness",
  "jogging": "džoging",
  "workout": "vorkaut",
  "spinning": "spining",
  "crossfit": "krosfit",
  "bodybuilder": "bodibilder",
  "wellness": "velnes",
  "selfie": "selfi",
  "lifestyle": "lajfstajl",
  "outfit": "autfit",
  "vintage": "vintidž",
  "casual": "kežuál",
  "streetwear": "strítvér",
  "piercing": "pírsing",
  "tattoo": "tetú",
  "design": "dizajn",
  "branding": "brending",
  "logo": "logo",
  "slogan": "slogan",
  "packaging": "pekedžing",
  "showroom": "šourúm",
  "eshop": "ešop",
  "marketplace": "marketplejs",
  "cashback": "kešbek",
  "voucher": "vaučer",
  "gadget": "gedžet",
  "powerbank": "poverbenk",
  "drone": "drón",
  "robot": "robot",
  "prompt": "prompt",
  "token": "token",
  "plugin": "plugin",
  "framework": "frejmverk",
  "backend": "bekend",
  "frontend": "frontend",
  "database": "dejtabejz",
  "dashboard": "dešbórd",
  "workflow": "vorkflou",
  "roadmap": "roudmep",
  "ticket": "tiket",
  "helpdesk": "helpdesk",
  "scrum": "skram",
  "sprint": "sprint",
  "kanban": "kanban",
  "tester": "tester",
  "analyst": "analyst",
  "consultant": "konzultant",
  "copywriter": "kopiraiter",
  "editor": "editor",
  "blog": "blog",
  "vlog": "vlog",
  "banner": "bener",
  "popup": "popap",
  "landingpage": "lendingpejdž",
  "checkout": "čekaut",
  "retargeting": "ritergeting",
  "remarketing": "rimarketing",
  "affiliate": "afiliet",
  "broker": "broker",
  "dealer": "díler",
  "trader": "trejder",
  "scalper": "skalper",
  "rating": "rejting",
  "ranking": "renking",
  "review": "rivjú",
  "teambuilding": "tímbiling",
  "headhunter": "hedhanter",
  "mentor": "mentor"
};

// Prefixes and Suffixes for compound loanwords in modern Slovak
const COMPOUNDS_PREFIXES: Record<string, string> = {
  smart: "smart",
  cyber: "sajber",
  web: "veb",
  cloud: "klaud",
  data: "dejta",
  crypto: "krypto",
  micro: "mikro",
  mega: "mega",
  ultra: "ultra",
  hyper: "hyper",
  eco: "eko",
  bio: "bio",
  video: "video",
  audio: "audio",
  photo: "foto",
  social: "sociál",
  digital: "didžitál",
  mobile: "mobajl",
  virtual: "virtuál",
  auto: "auto"
};

const COMPOUNDS_SUFFIXES: Record<string, string> = {
  tech: "tech",
  shop: "šop",
  cast: "kast",
  stream: "strím",
  track: "trek",
  score: "skór",
  board: "bórd",
  link: "link",
  hub: "hab",
  drive: "drajv",
  zone: "zóna",
  lab: "leb",
  works: "verks",
  space: "spejs",
  base: "bejz",
  point: "pojnt",
  view: "vjú",
  line: "lajn",
  gate: "gejt",
  port: "port",
  desk: "desk",
  tool: "túl",
  flow: "flou",
  stack: "stek",
  loop: "lúp",
  code: "kód",
  ware: "vér",
  net: "net",
  grid: "grid",
  sync: "synk",
  play: "plej",
  boost: "búst",
  scan: "sken",
  check: "ček",
  pilot: "pilot",
  cloud: "klaud",
  market: "market",
  system: "systém",
  engine: "endžin",
  service: "servis"
};

export function getAnglicizmusPronunciation(word: string): string | undefined {
  const lower = word.toLowerCase().trim();
  if (ANGLICIZMY_PRONUNCIATION_MAP[lower] !== undefined) {
    return ANGLICIZMY_PRONUNCIATION_MAP[lower];
  }

  // Handle techterm1 to techterm41
  const techtermMatch = lower.match(/^techterm(\d+)$/);
  if (techtermMatch) {
    return "techterm" + techtermMatch[1];
  }

  // Handle dynamic prefix + suffix compounds
  for (const [prefix, prefixSlovak] of Object.entries(COMPOUNDS_PREFIXES)) {
    if (lower.startsWith(prefix) && lower.length > prefix.length) {
      const remainder = lower.substring(prefix.length);
      if (COMPOUNDS_SUFFIXES[remainder] !== undefined) {
        return prefixSlovak + COMPOUNDS_SUFFIXES[remainder];
      }
    }
  }

  return undefined;
}

// Spelling of isolated individual letters (e.g. b, c, x, y, q, w) excluding Slovak/common prepositions and conjunctions (a, i, o, u, v, s, z, k)
export const SINGLE_LETTER_PRONUNCIATION_MAP: Record<string, string> = {
  "b": "bé",
  "c": "cé",
  "č": "čé",
  "d": "dé",
  "ď": "ďé",
  "e": "é",
  "f": "ef",
  "g": "gé",
  "h": "há",
  "j": "jé",
  "l": "el",
  "ľ": "eľ",
  "m": "em",
  "n": "en",
  "ň": "eň",
  "p": "pé",
  "q": "kveee",
  "r": "er",
  "š": "eš",
  "t": "té",
  "ť": "ťé",
  "w": "vee",
  "x": "iks",
  "y": "ypsilon",
  "ž": "žet"
};

export const EMOJI_TO_SLOVAK: Record<string, string> = {
  "👁️": "oko", "👁": "oko",
  "🪑": "stolička",
  "🛏️": "posteľ", "🛏": "posteľ",
  "🐱": "mačka",
  "🚗": "auto",
  "🐶": "pes",
  "📖": "kniha",
  "🍔": "jedlo",
  "☕": "pohár",
  "💭": "myšlienka",
  "🐦": "vták",
  "☀️": "slnko", "☀": "slnko",
  "👤": "osoba",
  "👦": "chlapec",
  "⏰": "hodiny",
  "🚶": "chôdza",
  "🖊️": "pero", "🖊": "pero",
  "🐘": "slon",
  "🔝": "vrch",
  "🐕": "pes",
  "🐈": "mačka",
  "🏃": "beh",
  "🐟": "ryba",
  "🚐": "dodávka",
  "🤔": "myslenie",
  "👉": "ukazovanie",
  "🦁": "lev",
  "👟": "topánka",
  "🎩": "klobúk",
  "👨": "muž",
  "🙅": "odmietnutie",
  "🎤": "mikrofón",
  "🦵": "noha",
  "🔴": "červená",
  "✅": "áno",
  "💧": "voda",
  "🦘": "klokan",
  "💪": "sila",
  "👆": "ukazovák"
};

const ABBREVIATIONS_REPLACEMENTS: { pattern: RegExp, substitution: string }[] = [
  // 1. Double symbols and special words (replace FIRST)
  { pattern: /°C/g, substitution: " stupňov celzia " },
  { pattern: /°F/g, substitution: " stupňov fahrenheita " },
  { pattern: /\.sk\b/gi, substitution: " bodka es ká " },
  { pattern: /\.cz\b/gi, substitution: " bodka cé zet " },
  { pattern: /\.com\b/gi, substitution: " bodka kom " },
  { pattern: /\.eu\b/gi, substitution: " bodka é ú " },
  { pattern: /\.org\b/gi, substitution: " bodka org " },
  { pattern: /\.net\b/gi, substitution: " bodka net " },
  { pattern: /\bwww\b/gi, substitution: " vé vé vé " },
  { pattern: /\bDisney\+(?=\s|[.,!?]|$)/gi, substitution: " dyzny plas " },
  { pattern: /\bPrime\s+Video\b/gi, substitution: " prajm video " },
  { pattern: /\bNode\.js\b/gi, substitution: " noud džej es " },
  { pattern: /\bWi\-Fi\b/gi, substitution: " vaj faj " },
  { pattern: /\bwifi\b/gi, substitution: " vaj faj " },
  { pattern: /\bC#(?=\s|[.,!?]|$)/gi, substitution: " sí šarp " },
  { pattern: /\bC\+\+(?=\s|[.,!?]|$)/gi, substitution: " sí plus plus " },
  { pattern: /\bDisplayPort\b/gi, substitution: " displej port " },
  { pattern: /\bBlu\-ray\b/gi, substitution: " blú rej " },
  { pattern: /\bIPv4\b/gi, substitution: " aj pí vé for " },
  { pattern: /\bIPv6\b/gi, substitution: " aj pí vé siks " },

  // Symbols (Single characters)
  { pattern: /€/g, substitution: " eur " },
  { pattern: /\$/g, substitution: " dolár " },
  { pattern: /£/g, substitution: " libra " },
  { pattern: /¥/g, substitution: " jen " },
  { pattern: /%/g, substitution: " percent " },
  { pattern: /&/g, substitution: " a " },
  { pattern: /@/g, substitution: " zavináč " },
  { pattern: /#/g, substitution: " hešteg " },

  // Multi-letter abbreviations
  { pattern: /\bWC\b/gi, substitution: " vé cé " },
  { pattern: /\bPC\b/gi, substitution: " pé cé " },
  { pattern: /\bTV\b/gi, substitution: " té vé " },
  { pattern: /\bSMS\b/gi, substitution: " es em es " },
  { pattern: /\bMMS\b/gi, substitution: " em em es " },
  { pattern: /\bGPS\b/gi, substitution: " gé pé es " },
  { pattern: /\bUSB\b/gi, substitution: " ú es bé " },
  { pattern: /\bPDF\b/gi, substitution: " pé dé ef " },
  { pattern: /\bHTML\b/gi, substitution: " há té em el " },
  { pattern: /\bXML\b/gi, substitution: " iks em el " },
  { pattern: /\bJSON\b/gi, substitution: " džejson " },
  { pattern: /\bSQL\b/gi, substitution: " es kú el " },
  { pattern: /\bAPI\b/gi, substitution: " ej pí aj " },
  { pattern: /\bAI\b/gi, substitution: " ej aj " },
  { pattern: /\bIT\b/gi, substitution: " í té " },
  { pattern: /\bICT\b/gi, substitution: " í cé té " },
  { pattern: /\bCPU\b/gi, substitution: " cé pé jú " },
  { pattern: /\bGPU\b/gi, substitution: " dží pé jú " },
  { pattern: /\bRAM\b/gi, substitution: " rem " },
  { pattern: /\bROM\b/gi, substitution: " rom " },
  { pattern: /\bSSD\b/gi, substitution: " es es dé " },
  { pattern: /\bHDD\b/gi, substitution: " há dé dé " },
  { pattern: /\bBluetooth\b/gi, substitution: " blútút " },
  { pattern: /\bLinux\b/gi, substitution: " linuks " },
  { pattern: /\bAndroid\b/gi, substitution: " android " },
  { pattern: /\biPhone\b/gi, substitution: " ajfón " },
  { pattern: /\biPad\b/gi, substitution: " ajped " },
  { pattern: /\bMacBook\b/gi, substitution: " mekbuk " },
  { pattern: /\bWindows\b/gi, substitution: " vindous " },
  { pattern: /\bGoogle\b/gi, substitution: " gúgl " },
  { pattern: /\bChrome\b/gi, substitution: " kroum " },
  { pattern: /\bFirefox\b/gi, substitution: " fajerfox " },
  { pattern: /\bEdge\b/gi, substitution: " edž " },
  { pattern: /\bGitHub\b/gi, substitution: " git hab " },
  { pattern: /\bGitLab\b/gi, substitution: " git lab " },
  { pattern: /\bYouTube\b/gi, substitution: " jútúb " },
  { pattern: /\bTikTok\b/gi, substitution: " tik tok " },
  { pattern: /\bFacebook\b/gi, substitution: " fejsbuk " },
  { pattern: /\bMessenger\b/gi, substitution: " mesendžer " },
  { pattern: /\bInstagram\b/gi, substitution: " instagram " },
  { pattern: /\bWhatsApp\b/gi, substitution: " vocap " },
  { pattern: /\bTelegram\b/gi, substitution: " telegram " },
  { pattern: /\bSignal\b/gi, substitution: " signal " },
  { pattern: /\bSpotify\b/gi, substitution: " spotifaj " },
  { pattern: /\bNetflix\b/gi, substitution: " netfliks " },
  { pattern: /\bHBO\b/gi, substitution: " há bé ó " },
  { pattern: /\bURL\b/gi, substitution: " ú er el " },
  { pattern: /\bURI\b/gi, substitution: " ú er aj " },
  { pattern: /\bIP\b/gi, substitution: " aj pí " },
  { pattern: /\bVPN\b/gi, substitution: " vé pé en " },
  { pattern: /\bDNS\b/gi, substitution: " dé en es " },
  { pattern: /\bDHCP\b/gi, substitution: " dé há cé pé " },
  { pattern: /\bLAN\b/gi, substitution: " len " },
  { pattern: /\bWAN\b/gi, substitution: " ven " },
  { pattern: /\bWLAN\b/gi, substitution: " vé len " },
  { pattern: /\bTCP\b/gi, substitution: " té cé pé " },
  { pattern: /\bUDP\b/gi, substitution: " ú dé pé " },
  { pattern: /\bHTTP\b/gi, substitution: " há té té pé " },
  { pattern: /\bHTTPS\b/gi, substitution: " há té té pé es " },
  { pattern: /\bFTP\b/gi, substitution: " ef té pé " },
  { pattern: /\bSSH\b/gi, substitution: " es es há " },
  { pattern: /\bSSL\b/gi, substitution: " es es el " },
  { pattern: /\bTLS\b/gi, substitution: " té el es " },
  { pattern: /\bNFC\b/gi, substitution: " en ef cé " },
  { pattern: /\bRFID\b/gi, substitution: " ár ef aj dí " },
  { pattern: /\bLED\b/gi, substitution: " led " },
  { pattern: /\bOLED\b/gi, substitution: " ó led " },
  { pattern: /\bLCD\b/gi, substitution: " el cé dé " },
  { pattern: /\bHDMI\b/gi, substitution: " há dé em aj " },
  { pattern: /\bAMD\b/gi, substitution: " ej em dí " },
  { pattern: /\bIntel\b/gi, substitution: " intel " },
  { pattern: /\bNVIDIA\b/gi, substitution: " envidija " },
  { pattern: /\bRyzen\b/gi, substitution: " rajzen " },
  { pattern: /\bGeForce\b/gi, substitution: " dží fors " },
  { pattern: /\bJava\b/gi, substitution: " džava " },
  { pattern: /\bJavaScript\b/gi, substitution: " džavaskript " },
  { pattern: /\bTypeScript\b/gi, substitution: " tajpskript " },
  { pattern: /\bPython\b/gi, substitution: " pajton " },
  { pattern: /\bPHP\b/gi, substitution: " pí há pé " },
  { pattern: /\bReact\b/gi, substitution: " riakt " },
  { pattern: /\bAngular\b/gi, substitution: " angjular " },
  { pattern: /\bVue\b/gi, substitution: " vjú " },
  { pattern: /\bDocker\b/gi, substitution: " doker " },
  { pattern: /\bKubernetes\b/gi, substitution: " kubernetis " },
  { pattern: /\bOpenAI\b/gi, substitution: " oupen ej aj " },
  { pattern: /\bChatGPT\b/gi, substitution: " čet dží pí tí " },
  { pattern: /\bClaude\b/gi, substitution: " klód " },
  { pattern: /\bGemini\b/gi, substitution: " džeminaj " },
  { pattern: /\bCopilot\b/gi, substitution: " kopajlot " },
  { pattern: /\bCEO\b/gi, substitution: " sí í ou " },
  { pattern: /\bCFO\b/gi, substitution: " sí ef ou " },
  { pattern: /\bCOO\b/gi, substitution: " sí ou ou " },
  { pattern: /\bHR\b/gi, substitution: " há er " },
  { pattern: /\bPR\b/gi, substitution: " pé er " },
  { pattern: /\bCRM\b/gi, substitution: " sí er em " },
  { pattern: /\bERP\b/gi, substitution: " í ar pí " },
  { pattern: /\bKPI\b/gi, substitution: " kej pí aj " },
  { pattern: /\bROI\b/gi, substitution: " ár ó aj " },
  { pattern: /\bB2B\b/gi, substitution: " bí tú bí " },
  { pattern: /\bB2C\b/gi, substitution: " bí tú sí " },
  { pattern: /\bSEO\b/gi, substitution: " es í ou " },
  { pattern: /\bSEM\b/gi, substitution: " es í em " },
  { pattern: /\bPPC\b/gi, substitution: " pí pí sí " },
  { pattern: /\bCTR\b/gi, substitution: " sí tí ár " },
  { pattern: /\bCPA\b/gi, substitution: " sí pí ej " },
  { pattern: /\bCPC\b/gi, substitution: " sí pí sí " },
  { pattern: /\bDJ\b/gi, substitution: " dídžej " },
  { pattern: /\bMC\b/gi, substitution: " em sí " },
  { pattern: /\bLP\b/gi, substitution: " el pí " },
  { pattern: /\bEP\b/gi, substitution: " í pí " },
  { pattern: /\bBPM\b/gi, substitution: " bí pí em " },
  { pattern: /\bMP3\b/gi, substitution: " em pí tri " },
  { pattern: /\bWAV\b/gi, substitution: " vév " },
  { pattern: /\bFLAC\b/gi, substitution: " flak " },
  { pattern: /\bMIDI\b/gi, substitution: " midi " },
  { pattern: /\bCD\b/gi, substitution: " cé dé " },
  { pattern: /\bDVD\b/gi, substitution: " dé vé dé " },
  { pattern: /\bBlu-ray\b/gi, substitution: " blú rej " },
  { pattern: /\bUSA\b/gi, substitution: " ú es á " },
  { pattern: /\bUK\b/gi, substitution: " jú kej " },
  { pattern: /\bEU\b/gi, substitution: " é ú " },
  { pattern: /\bEÚ\b/gi, substitution: " é ú " },
  { pattern: /\bNATO\b/gi, substitution: " náto " },
  { pattern: /\bOSN\b/gi, substitution: " ó es en " },
  { pattern: /\bUNESCO\b/gi, substitution: " junesko " },
  { pattern: /\bOECD\b/gi, substitution: " ou í sí dí " },
  { pattern: /\bSR\b/gi, substitution: " es er " },
  { pattern: /\bČR\b/gi, substitution: " čé er " },
  
  // Single-word units (when alone/isolated - notice word boundaries)
  { pattern: /\bkm\b/gi, substitution: " kilometer " },
  { pattern: /\bcm\b/gi, substitution: " centimeter " },
  { pattern: /\bmm\b/gi, substitution: " milimeter " },
  { pattern: /\bdm\b/gi, substitution: " decimeter " },
  { pattern: /(?<=\d\s*)m\b/g, substitution: " meter " },
  { pattern: /\bkg\b/gi, substitution: " kilogram " },
  { pattern: /(?<=\d\s*)g\b/g, substitution: " gram " },
  { pattern: /\bmg\b/gi, substitution: " miligram " },
  { pattern: /(?<=\d\s*)l\b/g, substitution: " liter " },
  { pattern: /\bml\b/gi, substitution: " mililiter " },
  { pattern: /\bkWh\b/gi, substitution: " kilowatthodina " },
  { pattern: /\bMW\b/g, substitution: " megawatt " },
  { pattern: /\b(mW|mw)\b/g, substitution: " miliwatt " },
  { pattern: /\bkW\b/gi, substitution: " kilowatt " },
  { pattern: /\bMB\b/g, substitution: " megabajt " },
  { pattern: /\b(Mb|mb)\b/g, substitution: " megabit " },
  { pattern: /\bGB\b/g, substitution: " gigabajt " },
  { pattern: /\b(Gb|gb)\b/g, substitution: " gigabit " },
  { pattern: /\bTB\b/g, substitution: " terabajt " },
  { pattern: /\b(Tb|tb)\b/g, substitution: " terabit " },
  { pattern: /\bPB\b/g, substitution: " petabajt " },

  // Internet terms / acronyms
  { pattern: /\bOK\b/gi, substitution: " okej " },
  { pattern: /\bLOL\b/gi, substitution: " lol " },
  { pattern: /\bROFL\b/gi, substitution: " rofl " },
  { pattern: /\bOMG\b/gi, substitution: " ou em dží " },
  { pattern: /\bWTF\b/gi, substitution: " dablju tí ef " },
  { pattern: /\bBTW\b/gi, substitution: " bí tí dablju " },
  { pattern: /\bDIY\b/gi, substitution: " dí aj vaj " },
  { pattern: /\bFAQ\b/gi, substitution: " fek " },

  // Common modern startup terms
  { pattern: /\bstartup\b/gi, substitution: " startap " },
  { pattern: /\bscaleup\b/gi, substitution: " skejlap " },
  { pattern: /\bfeedback\b/gi, substitution: " fídbek " },
  { pattern: /\bmeeting\b/gi, substitution: " míting " },
  { pattern: /\bbrainstorming\b/gi, substitution: " brejnstorming " },
  { pattern: /\bmarketing\b/gi, substitution: " marketink " },
  { pattern: /\boutsourcing\b/gi, substitution: " autsorsing " },
  { pattern: /\bnetworking\b/gi, substitution: " netvorking " },
  { pattern: /\bcoworking\b/gi, substitution: " kovorking " },
  { pattern: /\bstreamer\b/gi, substitution: " strímer " },
  { pattern: /\binfluencer\b/gi, substitution: " influenser " },
  { pattern: /\byoutuber\b/gi, substitution: " jutuber " },
  { pattern: /\bgamer\b/gi, substitution: " gejmer " },
  { pattern: /\bpodcast\b/gi, substitution: " podkast " },
  { pattern: /\bwebinar\b/gi, substitution: " webinár " },
  { pattern: /\bworkshop\b/gi, substitution: " vorkšop " },
  { pattern: /\bdeadline\b/gi, substitution: " dedlajn " },
  { pattern: /\bfreelancer\b/gi, substitution: " frílancer " },
  { pattern: /\bcashback\b/gi, substitution: " kešbek " },
  { pattern: /\bvoucher\b/gi, substitution: " vaučer " },
  { pattern: /\bpowerbank\b/gi, substitution: " pauerbanka " },
  { pattern: /\bsmartphone\b/gi, substitution: " smartfón " },
  { pattern: /\bnotebook\b/gi, substitution: " notbuk " },
];

const SLOVAK_WORD_CHARS = 'a-zA-ZáäčďéíĺľňóôŕštúýžÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽ0-9';

export function makeSlovakWordBoundaryRegex(pattern: RegExp): RegExp {
  let src = pattern.source;
  const flags = pattern.flags;
  const sChar = SLOVAK_WORD_CHARS;
  
  src = src.replace(/\\b/g, (match, offset) => {
    const nextStr = src.slice(offset + 2);
    const isLeading = offset === 0 || /^[a-zA-ZáäčďéíĺľňóôŕštúýžÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽ0-9(]/.test(nextStr);
    
    if (isLeading) {
      return `(?<![${sChar}])`;
    } else {
      return `(?![${sChar}])`;
    }
  });
  
  return new RegExp(src, flags);
}

const COMPILED_ABBREVIATIONS_REPLACEMENTS = ABBREVIATIONS_REPLACEMENTS.map(repl => ({
  pattern: makeSlovakWordBoundaryRegex(repl.pattern),
  substitution: repl.substitution
}));

export function preprocessSpecialSymbols(text: string): string {
  let preproc = text;

  // 0. Temperature symbols °C and °F
  preproc = preproc.replace(/(?<=\d)\s*°\s*C\b/gi, " celzia ");
  preproc = preproc.replace(/(?<=\d)\s*°\s*F\b/gi, " fahrenheita ");
  preproc = preproc.replace(/°\s*C\b/gi, " stupňov celzia ");
  preproc = preproc.replace(/°\s*F\b/gi, " stupňov fahrenheita ");

  // 1. Double/Triple-character programming/math operators (always pronounced)
  const codeOps = [
    { pattern: /===/g, substitution: " striktne rovná sa " },
    { pattern: /==/g, substitution: " rovná sa " },
    { pattern: /!==/g, substitution: " striktne sa nerovná " },
    { pattern: /!=/g, substitution: " nerovná sa " },
    { pattern: /\+\+/g, substitution: " plus plus " },
    { pattern: /--/g, substitution: " mínus mínus " },
    { pattern: /\+=/g, substitution: " plus rovná sa " },
    { pattern: /-=/g, substitution: " mínus rovná sa " },
    { pattern: /\*=/g, substitution: " krát rovná sa " },
    { pattern: /\/=/g, substitution: " delené rovná sa " },
    { pattern: /&&/g, substitution: " logické a " },
    { pattern: /\|\|/g, substitution: " logické alebo " },
    { pattern: /=>/g, substitution: " šípka " },
    { pattern: /->/g, substitution: " smeruje na " },
    { pattern: /::/g, substitution: " dvojitá dvojbodka " },
    { pattern: /\?\?/g, substitution: " nul kolesing " },
    { pattern: /\?:/g, substitution: " ternárny operátor " },
    { pattern: /%%/g, substitution: " dvojité percento " },
  ];

  for (const op of codeOps) {
    preproc = preproc.replace(op.pattern, op.substitution);
  }

  // 2. Conditional Punctuation Symbols (pronounced if isolated)
  preproc = preproc.replace(/(?<=^|\s)\?(?=\s|$)/g, " otáznik ");
  preproc = preproc.replace(/(?<=^|\s)\.\.\.(?=\s|$)/g, " tri bodky ");
  preproc = preproc.replace(/(?<=^|\s)…(?=\s|$)/g, " tri bodky ");
  preproc = preproc.replace(/(?<=^|\s)[\-\u2013\u2014](?=\s|$)/g, " pomlčka ");

  // 3. Brackets/parentheses (pronounced if empty/isolated/code context)
  preproc = preproc.replace(/\(\)/g, " prázdne zátvorky ");
  preproc = preproc.replace(/\[\]/g, " prázdne hranaté zátvorky ");
  preproc = preproc.replace(/\{\}/g, " prázdne zložené zátvorky ");
  
  preproc = preproc.replace(/(?<=^|\s)\((?=\s|$)/g, " ľavá zátvorka ");
  preproc = preproc.replace(/(?<=^|\s)\)(?=\s|$)/g, " pravá zátvorka ");
  preproc = preproc.replace(/(?<=^|\s)\[(?=\s|$)/g, " ľavá hranatá zátvorka ");
  preproc = preproc.replace(/(?<=^|\s)\](?=\s|$)/g, " pravá hranatá zátvorka ");
  preproc = preproc.replace(/(?<=^|\s)\{(?=\s|$)/g, " ľavá zložená zátvorka ");
  preproc = preproc.replace(/(?<=^|\s)\}(?=\s|$)/g, " pravá zložená zátvorka ");

  // 4. Always-pronounced math & comparison symbols
  const mathSymbols = [
    { pattern: /</g, substitution: " menšie ako " },
    { pattern: />/g, substitution: " väčšie ako " },
    { pattern: /≤/g, substitution: " menšie alebo rovné " },
    { pattern: /≥/g, substitution: " väčšie alebo rovné " },
    { pattern: /≠/g, substitution: " nerovná sa " },
    { pattern: /≈/g, substitution: " približne sa rovná " },
    { pattern: /≡/g, substitution: " identicky sa rovná " },
    { pattern: /×/g, substitution: " krát " },
    { pattern: /÷/g, substitution: " delené " },
    { pattern: /√/g, substitution: " odmocnina " },
    { pattern: /∛/g, substitution: " tretia odmocnina " },
    { pattern: /∞/g, substitution: " nekonečno " },
    { pattern: /∑/g, substitution: " suma " },
    { pattern: /∏/g, substitution: " súčin " },
    { pattern: /∆/g, substitution: " delta " },
    { pattern: /∇/g, substitution: " nabla " },
    { pattern: /∂/g, substitution: " parciálna derivácia " },
    { pattern: /∫/g, substitution: " integrál " },
    { pattern: /∮/g, substitution: " krivkový integrál " },
  ];

  for (const ms of mathSymbols) {
    preproc = preproc.replace(ms.pattern, ms.substitution);
  }

  // Negative numbers handle: - followed by digit (not preceded by digit/letter)
  preproc = preproc.replace(/(?<=^|\s)-(?=\d)/g, " mínus ");

  // 5. Always-pronounced Technical / Currency / Other Special Symbols
  const technicalSymbols = [
    { pattern: /@/g, substitution: " zavináč " },
    { pattern: /#/g, substitution: " mriežka " },
    { pattern: /£/g, substitution: " libra " },
    { pattern: /¥/g, substitution: " jen " },
    { pattern: /¢/g, substitution: " cent " },
    { pattern: /‰/g, substitution: " promile " },
    { pattern: /°/g, substitution: " stupeň " }, 
    { pattern: /′/g, substitution: " minúta " },  
    { pattern: /″/g, substitution: " sekunda " }, 
    { pattern: /§/g, substitution: " paragraf " },
    { pattern: /¶/g, substitution: " odsek " },
    { pattern: /©/g, substitution: " copyright " },
    { pattern: /®/g, substitution: " registrovaná ochranná známka " },
    { pattern: /™/g, substitution: " ochranná známka " },
    { pattern: /℠/g, substitution: " servisná známka " },
    { pattern: /†/g, substitution: " krížik " },
    { pattern: /‡/g, substitution: " dvojitý krížik " },
    { pattern: /_/g, substitution: " podčiarkovník " },
    { pattern: /\^/g, substitution: " strieška " },
    { pattern: /~/g, substitution: " vlnovka " },
    { pattern: /´/g, substitution: " prízvuk " },
    { pattern: /\\/g, substitution: " spätná lomka " },
    { pattern: /\|/g, substitution: " zvislá čiara " },
  ];

  for (const ts of technicalSymbols) {
    preproc = preproc.replace(ts.pattern, ts.substitution);
  }

  // Isolated exclamation mark "!" as "negácia"
  preproc = preproc.replace(/(?<=^|\s)!(?=\s|$)/g, " negácia ");

  // Special handling for % - if preceded by a digit, it's "percento", otherwise "modulo"
  preproc = preproc.replace(/(?<=\d)\s*%%/g, " percento percento ");
  preproc = preproc.replace(/(?<=\d)\s*%/g, " percento ");
  preproc = preproc.replace(/%%/g, " dvojité percento ");
  preproc = preproc.replace(/%/g, " modulo ");

  // Special handling for & (ampersand) - if surrounded by words, e.g. "A & B" -> "A a B"
  preproc = preproc.replace(/(?<=\w)\s*&\s*(?=\w)/g, " a ");
  preproc = preproc.replace(/&/g, " ampersand ");

  // Special handling for * (star/asterisk) - if between numbers, e.g. "5 * 3" -> "5 krát 3", otherwise "hviezdička"
  preproc = preproc.replace(/(?<=\d)\s*\*+\s*(?=\d)/g, " krát ");
  preproc = preproc.replace(/\*/g, " hviezdička ");

  // Special handling for / (lomka) - if not converted to "delené" by math equation replacer later
  preproc = preproc.replace(/\//g, " lomka ");

  // 6. Visual / Emoji-like shapes and symbols
  const shapesAndMisc = [
    { pattern: /•/g, substitution: " odrážka " },
    { pattern: /◦/g, substitution: " malá odrážka " },
    { pattern: /▪/g, substitution: " štvorcová odrážka " },
    { pattern: /□/g, substitution: " štvorec " },
    { pattern: /■/g, substitution: " plný štvorec " },
    { pattern: /△/g, substitution: " trojuholník " },
    { pattern: /▲/g, substitution: " plný trojuholník " },
    { pattern: /○/g, substitution: " kruh " },
    { pattern: /●/g, substitution: " plný kruh " },
    { pattern: /◇/g, substitution: " kosoštvorec " },
    { pattern: /◆/g, substitution: " plný kosoštvorec " },
    { pattern: /♠/g, substitution: " piky " },
    { pattern: /♥/g, substitution: " srdcia " },
    { pattern: /♦/g, substitution: " kára " },
    { pattern: /♣/g, substitution: " kríže " },
    { pattern: /♪/g, substitution: " nota " },
    { pattern: /♫/g, substitution: " noty " },
    { pattern: /♬/g, substitution: " hudobná značka " },
    { pattern: /✓/g, substitution: " fajka " },
    { pattern: /✔/g, substitution: " potvrdené " },
    { pattern: /✗/g, substitution: " krížik " },
    { pattern: /✘/g, substitution: " zamietnuté " },
    { pattern: /✳/g, substitution: " hviezdička " },
    { pattern: /✴/g, substitution: " osemcípa hviezda " },
    { pattern: /☀/g, substitution: " slnko " },
    { pattern: /☁/g, substitution: " oblak " },
    { pattern: /☂/g, substitution: " dáždnik " },
    { pattern: /☃/g, substitution: " snehuliak " },
    { pattern: /☎/g, substitution: " telefón " },
    { pattern: /☑/g, substitution: " začiarknuté políčko " },
    { pattern: /☒/g, substitution: " označené políčko " },
    { pattern: /☢/g, substitution: " rádioaktivita " },
    { pattern: /☣/g, substitution: " biologické nebezpečenstvo " },
    { pattern: /☮/g, substitution: " mier " },
    { pattern: /♀/g, substitution: " ženské pohlavie " },
    { pattern: /♂/g, substitution: " mužské pohlavie " },
    { pattern: /⚠/g, substitution: " upozornenie " },
    { pattern: /⚡/g, substitution: " blesk " },
    { pattern: /⚙/g, substitution: " ozubené koliesko " },
    { pattern: /⚫/g, substitution: " čierny kruh " },
    { pattern: /⚪/g, substitution: " biely kruh " },
    { pattern: /←/g, substitution: " šípka vľavo " },
    { pattern: /→/g, substitution: " šípka vpravo " },
    { pattern: /↑/g, substitution: " šípka hore " },
    { pattern: /↓/g, substitution: " šípka dole " },
    { pattern: /↔/g, substitution: " obojsmerná šípka " },
    { pattern: /↕/g, substitution: " zvislá obojsmerná šípka " },
    { pattern: /⇐/g, substitution: " implikované zľava " },
    { pattern: /⇒/g, substitution: " implikované sprava " },
    { pattern: /⇔/g, substitution: " ekvivalencia " },
    { pattern: /⌂/g, substitution: " domov " },
    { pattern: /⌐/g, substitution: " negácia " },
    { pattern: /⌘/g, substitution: " command " },
    { pattern: /⌫/g, substitution: " backspace " },
    { pattern: /⌦/g, substitution: " delete " },
    { pattern: /⌧/g, substitution: " clear " },
    { pattern: /⎋/g, substitution: " escape " },
    { pattern: /⏎/g, substitution: " enter " },
    { pattern: /⏏/g, substitution: " vysunutie " },
    { pattern: /⌚/g, substitution: " hodinky " },
    { pattern: /⌛/g, substitution: " presýpacie hodiny " },
    { pattern: /⏰/g, substitution: " budík " },
    { pattern: /№/g, substitution: " číslo " },
    { pattern: /℃/g, substitution: " stupne celzia " },
    { pattern: /℉/g, substitution: " stupne fahrenheita " },
    { pattern: /µ/g, substitution: " mikro " },
    { pattern: /Ω/g, substitution: " omega " },
    { pattern: /α/g, substitution: " alfa " },
    { pattern: /β/g, substitution: " beta " },
    { pattern: /γ/g, substitution: " gama " },
    { pattern: /δ/g, substitution: " delta " },
    { pattern: /ε/g, substitution: " epsilon " },
    { pattern: /θ/g, substitution: " theta " },
    { pattern: /λ/g, substitution: " lambda " },
    { pattern: /π/g, substitution: " pí " },
    { pattern: /σ/g, substitution: " sigma " },
    { pattern: /φ/g, substitution: " fí " },
    { pattern: /ψ/g, substitution: " psí " },
    { pattern: /ω/g, substitution: " omega " },
  ];

  for (const s of shapesAndMisc) {
    preproc = preproc.replace(s.pattern, s.substitution);
  }

  return preproc;
}

const COMPOUND_DENOMINATORS: Record<string, string> = {
  // Time units
  'min': 'minútu',
  'min.': 'minútu',
  'hod': 'hodinu',
  'hod.': 'hodinu',
  'h': 'hodinu',
  'deň': 'deň',
  'dni': 'deň',
  'noc': 'noc',
  'týždeň': 'týždeň',
  'mesiac': 'mesiac',
  'mes': 'mesiac',
  'mes.': 'mesiac',
  'rok': 'rok',
  'roky': 'rok',
  
  // Count / People / Pieces
  'os': 'osobu',
  'os.': 'osobu',
  'osoba': 'osobu',
  'ks': 'kus',
  'kus': 'kus',
  
  // Length / Area / Volume
  'm': 'meter',
  'm²': 'meter štvorcový',
  'm2': 'meter štvorcový',
  'm³': 'meter kubický',
  'm3': 'meter kubický',
  'km': 'kilometer',
  'cm': 'centimeter',
  'mm': 'milimeter',
  'ha': 'hektár',
  
  // Weight
  'g': 'gram',
  'kg': 'kilogram',
  't': 'tonu',
  
  // Volume
  'ml': 'mililiter',
  'l': 'liter',
  
  // Data
  'kb': 'kilobit',
  'Kb': 'kilobit',
  'KB': 'kilobajt',
  'kB': 'kilobajt',
  'mb': 'megabit',
  'Mb': 'megabit',
  'MB': 'megabajt',
  'gb': 'gigabit',
  'Gb': 'gigabit',
  'GB': 'gigabajt',
  'tb': 'terabit',
  'Tb': 'terabit',
  'TB': 'terabajt',
  'b': 'bit',
  'B': 'bajt',
  'bit': 'bit',
  'kbit': 'kilobit',
  'mbit': 'megabit',
  'Mbit': 'megabit',
  'gbit': 'gigabit',
  'Gbit': 'gigabit',
  'tbit': 'terabit',
  'Tbit': 'terabit',
  
  // Energy / Power
  'wh': 'watthodinu',
  'Wh': 'watthodinu',
  'kwh': 'kilowatthodinu',
  'kWh': 'kilowatthodinu',
  'mwh': 'megawatthodinu',
  'MWh': 'megawatthodinu',
  'a': 'ampér',
  'A': 'ampér',
  'ma': 'miliampér',
  'mA': 'miliampér',
  'v': 'volt',
  'V': 'volt',
  'w': 'watt',
  'W': 'watt',
  'kw': 'kilowatt',
  'kW': 'kilowatt',
  'mw': 'miliwatt',
  'mW': 'miliwatt',
  'MW': 'megawatt',
  
  // Frequency
  'hz': 'hertz',
  'Hz': 'hertz',
  'khz': 'kilohertz',
  'kHz': 'kilohertz',
  'mhz': 'megahertz',
  'MHz': 'megahertz',
  'ghz': 'gigahertz',
  'GHz': 'gigahertz',
  
  // Speed / Rotations / Pages / Pictures
  's': 'sekundu',
  'sek': 'sekundu',
  'sek.': 'sekundu',

  // Currencies (when in denominator)
  '€': 'euro',
  'euro': 'euro',
  '$': 'dolár',
  'dolár': 'dolár',
  '£': 'libru',
  'libra': 'libru',
  '¥': 'jen',
  'jen': 'jen',
};

function preprocessCompoundUnits(text: string): string {
  const numerPattern = `(?:€|\\$|£|¥|EUR|euro|eurá|eur|km|m|cm|mm|kg|g|t|ml|l|b|B|bit|kb|Kb|kB|KB|mb|Mb|MB|gb|Gb|GB|tb|Tb|TB|kbit|Mbit|Gbit|Tbit|kWh|MWh|Wh|A|mA|V|W|kW|MW|Hz|kHz|MHz|GHz|ot\\.|ot|obr\\.|obr|str\\.|str|ks|kus)`;
  const denomPattern = `(?:min\\.?|hod\\.?|deň|dni|noc|týždeň|mesiac|mes\\.?|rok|roky|os\\.?|osoba|ks|kus|m|m²|m2|m³|m3|km|cm|mm|ha|g|kg|t|ml|l|b|B|bit|kb|Kb|kB|KB|mb|Mb|MB|gb|Gb|GB|tb|Tb|TB|kbit|Mbit|Gbit|Tbit|kWh|MWh|Wh|A|mA|V|W|kW|MW|Hz|kHz|MHz|GHz|100\\s*km|h|s|sek\\.?|sek|€|euro|\\$|dolár|£|libra|¥|jen)`;

  const compoundRegex = new RegExp(
    `(?<!\\p{L})(?:(\\d+(?:[\\.,]\\d+)?)?\\s*)(${numerPattern})\\s*[\\/\\u2044]\\s*(${denomPattern})(?!\\p{L})`,
    'gu'
  );

  return text.replace(compoundRegex, (match, numStr, numUnit, denomUnit) => {
    // 1. Clean up denomUnit spaces
    const cleanDenom = denomUnit.replace(/\s+/g, '');
    
    // 2. Special case: l/100 km
    if (numUnit.toLowerCase() === 'l' && (cleanDenom === '100km' || cleanDenom === '100kilometrov')) {
      if (numStr) {
        const num = parseFloat(numStr.replace(',', '.'));
        const isDecimal = numStr.includes('.') || numStr.includes(',');
        if (isDecimal) {
          return `${numStr} litra na sto kilometrov`;
        }
        if (num === 1) {
          return `${numStr} liter na sto kilometrov`;
        }
        if (num === 2 || num === 3 || num === 4) {
          return `${numStr} litre na sto kilometrov`;
        }
        return `${numStr} litrov na sto kilometrov`;
      }
      return 'litrov na sto kilometrov';
    }

    // 3. Find numerator form
    let unitKey = numUnit;
    if (unitKey === '€' || ['eur', 'euro', 'eurá'].includes(unitKey.toLowerCase())) {
      unitKey = '€';
    } else if (unitKey === '$' || ['dolár', 'doláre', 'dolárov'].includes(unitKey.toLowerCase())) {
      unitKey = '$';
    } else if (unitKey === '£' || ['libra', 'libry', 'libier'].includes(unitKey.toLowerCase())) {
      unitKey = '£';
    } else if (unitKey === '¥' || ['jen', 'jeny', 'jenov'].includes(unitKey.toLowerCase())) {
      unitKey = '¥';
    }
    
    const unitForms = UNIT_MAP[unitKey] || UNIT_MAP[unitKey.toLowerCase()];
    
    // 4. Determine numerator spoken word
    let numWord = '';
    if (unitForms) {
      if (numStr) {
        const num = parseFloat(numStr.replace(',', '.'));
        const isDecimal = numStr.includes('.') || numStr.includes(',');
        if (isDecimal) {
          numWord = unitForms.decGen;
        } else if (num === 1) {
          numWord = unitForms.sgNom;
        } else if (num === 2 || num === 3 || num === 4) {
          numWord = unitForms.plNom;
        } else {
          numWord = unitForms.genPl;
        }
      } else {
        // Default to genitive plural or nominative plural for standard standalone terms
        // e.g. km/h -> kilometrov za hodinu, €/min -> eurá za minútu
        if (['€', 'euro'].includes(unitKey.toLowerCase())) {
          numWord = unitForms.plNom; // "eurá"
        } else {
          numWord = unitForms.genPl; // "kilometrov", "megabajtov", "otáčok"
        }
      }
    } else {
      numWord = numUnit;
    }

    // 5. Determine denominator spoken word after "za"
    let denomWord = COMPOUND_DENOMINATORS[cleanDenom] || COMPOUND_DENOMINATORS[cleanDenom.toLowerCase()] || cleanDenom;

    // 6. Return combined string
    const prefix = numStr ? `${numStr} ` : '';
    return `${prefix}${numWord} za ${denomWord}`;
  });
}

const DAY_GENITIVE_ORDINALS: Record<number, string> = {
  1: 'prvého',
  2: 'druhého',
  3: 'tretieho',
  4: 'štvrtého',
  5: 'piateho',
  6: 'šiesteho',
  7: 'siedmeho',
  8: 'ôsmeho',
  9: 'deviateho',
  10: 'desiateho',
  11: 'jedenásteho',
  12: 'dvanásteho',
  13: 'trinásteho',
  14: 'štrnásteho',
  15: 'pätnásteho',
  16: 'šestnásteho',
  17: 'sedemnásteho',
  18: 'osemnásteho',
  19: 'devätnásteho',
  20: 'dvadsiateho',
  21: 'dvadsiateho prvého',
  22: 'dvadsiateho druhého',
  23: 'dvadsiateho tretieho',
  24: 'dvadsiateho štvrtého',
  25: 'dvadsiateho piateho',
  26: 'dvadsiateho šiesteho',
  27: 'dvadsiateho siedmeho',
  28: 'dvadsiateho ôsmeho',
  29: 'dvadsiateho deviateho',
  30: 'tridsiateho',
  31: 'tridsiateho prvého'
};

const MONTH_GENITIVES: Record<number, string> = {
  1: 'januára',
  2: 'februára',
  3: 'marca',
  4: 'apríla',
  5: 'mája',
  6: 'júna',
  7: 'júla',
  8: 'augusta',
  9: 'septembra',
  10: 'októbra',
  11: 'novembra',
  12: 'decembra'
};

function getSlovakYearWord(year: number): string {
  if (year >= 2000 && year < 3000) {
    const rem = year % 1000;
    if (rem === 0) {
      return 'dvetisíc';
    }
    const remWord = getNominativeCardinal(rem);
    return `dvetisíc ${remWord}`;
  }
  if (year >= 1000 && year < 2000) {
    const rem = year % 1000;
    if (rem === 0) {
      return 'tisíc';
    }
    const hundreds = Math.floor(rem / 100);
    const tensOnes = rem % 100;

    let hundredWord = '';
    if (hundreds === 1) hundredWord = 'sto';
    else if (hundreds === 2) hundredWord = 'dvesto';
    else if (hundreds === 3) hundredWord = 'tristo';
    else if (hundreds === 4) hundredWord = 'štyristo';
    else if (hundreds > 4) {
      const ones = ['', 'jeden', 'dva', 'tri', 'štyri', 'päť', 'šesť', 'sedem', 'osem', 'deväť'];
      hundredWord = ones[hundreds] + 'sto';
    }

    const prefix = `tisíc${hundredWord}`;
    if (tensOnes === 0) {
      return prefix;
    }
    return `${prefix} ${getNominativeCardinal(tensOnes)}`;
  }
  return getNominativeCardinal(year);
}

function preprocessDates(text: string): string {
  // Regex to match D.M.RRRR, DD.MM.RRRR, D. M. RRRR, DD. MM. RRRR
  const regex = /(?<!\d)(0?[1-9]|[1-2]\d|3[01])\.\s*(0?[1-9]|1[0-2])\.\s*(\d{4})(?!\d)/g;
  return text.replace(regex, (match, dayStr, monthStr, yearStr) => {
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    const dayWord = DAY_GENITIVE_ORDINALS[day] || dayStr;
    const monthWord = MONTH_GENITIVES[month] || monthStr;
    const yearWord = getSlovakYearWord(year);

    return `${dayWord} ${monthWord} ${yearWord}`;
  });
}

function preprocessTime(text: string): string {
  // Regex to match HH:MM or H:MM with optional spaces around colon.
  // HH is 0 to 24, MM is 00 to 59.
  // Do not match if preceded or followed by digits.
  // Also, do not match if followed by AM, PM, a.m., p.m., or equivalent (case-insensitive).
  // Do not match if followed by a colon (such as :SS) to avoid corrupting seconds.
  const regex = /(?<!\d)(0?\d|1\d|2[0-4])\s*:\s*([0-5]\d)(?!\d)(?!\s*:)(?!\s*[ap]\.?\s*m\.?(?:\b|$))/gi;

  return text.replace(regex, (match, hhStr, mmStr) => {
    const hh = parseInt(hhStr, 10);
    const mm = parseInt(mmStr, 10);

    const hhWord = getNominativeCardinal(hh);
    const hoursPart = `${hhWord} hodín`;

    if (mm === 0) {
      return hoursPart;
    }

    let mmWord = '';
    if (mm >= 1 && mm <= 9) {
      const digitWord = mm === 1 ? 'jedna' : mm === 2 ? 'dve' : getNominativeCardinal(mm);
      mmWord = `nula ${digitWord}`;
    } else {
      mmWord = getNominativeCardinal(mm);
    }

    return `${hoursPart} ${mmWord}`;
  });
}

export function normalizeSlovakText(text: string): string {
  // Pre-translate Emojis to Slovak words before punctuation conversion & tokenization
  let preproc = text;
  for (const [emoji, slovakWord] of Object.entries(EMOJI_TO_SLOVAK)) {
    preproc = preproc.split(emoji).join(" " + slovakWord + " ");
  }

  // Pre-translate dates (e.g., 7. 7. 2026, 01.01.2000)
  preproc = preprocessDates(preproc);

  // Pre-translate 24-hour clock time patterns
  preproc = preprocessTime(preproc);

  // Pre-translate compound units (e.g. €/min, km/h, MB/s)
  preproc = preprocessCompoundUnits(preproc);

  // Pre-translate all special requested symbols with smart conditional rules
  preproc = preprocessSpecialSymbols(preproc);

  // Pre-translate basic mathematical equations with operators between numbers (+, -, *, x, /, =)
  const hasEquals = text.includes('=');
  preproc = preproc.replace(/(\d+)\s*([\+\-\u2212\u2013\u2014\*xX\/=])\s*(\d+)/g, (match, lhs, op, rhs) => {
    let opWord = '';
    switch (op.toLowerCase()) {
      case '+': opWord = ' plus '; break;
      case '-':
      case '\u2212':
      case '\u2013':
      case '\u2014':
        opWord = hasEquals ? ' mínus ' : ' až ';
        break;
      case '*':
      case 'x': opWord = ' krát '; break;
      case '/': opWord = ' delené '; break;
      case '=': opWord = ' rovná sa '; break;
      default: opWord = op;
    }
    return `${lhs}${opWord}${rhs}`;
  });

  // Pre-translate MS to "majstrovstvá sveta" based on sports context regex
  preproc = preproc.replace(
    /\bMS\b(?=(?:\s+(?:19|20)\d{2})?(?:\s+(?:v|vo|na|počas|pred|po|pre|pri|z|zo|do|od|o))?(?:\s+\p{L}+)?\s+\b(?:hokej|futbal|atlet|biatlon|lyž|cyklist|tenis|florbal|volejbal|basketbal|hádzan|pláv|golf|šach|šerm|zápas|reprezent|medail|majst|šampion|turnaj|finál|semifin|štvrťfin|kvalifik|tréner|hráč|mužstv|tím|víťaz|zlat|striebr|bronz|discipl)\p{L}*)/gui,
    (match) => {
      if (match === 'MS') {
        return 'majstrovstvá sveta';
      }
      return match;
    }
  );

  // Pre-translate common abbreviations to standard spelling/pronunciation
  for (const repl of COMPILED_ABBREVIATIONS_REPLACEMENTS) {
    preproc = preproc.replace(repl.pattern, repl.substitution);
  }

  // Replace brackets and parentheses with spaces to prevent words from merging and ensure they are parsed as separate spoken words
  preproc = preproc
    .replace(/[()\[\]{}]/g, ' ')
    .replace(makeSlovakWordBoundaryRegex(/\bnapr\.\s*/gi), 'napríklad ')
    .replace(makeSlovakWordBoundaryRegex(/\batď\.\s*/gi), 'a tak ďalej ')
    .replace(makeSlovakWordBoundaryRegex(/\bt\.j\.\s*/gi), 'to jest ')
    .replace(makeSlovakWordBoundaryRegex(/\bcca\s*/gi), 'približne ')
    .replace(makeSlovakWordBoundaryRegex(/\bč\.\s*/gi), 'číslo ')
    .replace(makeSlovakWordBoundaryRegex(/\bčl\.\s*/gi), 'článok ')
    .replace(makeSlovakWordBoundaryRegex(/\btzv\.\s*/gi), 'takzvaný ')
    .replace(makeSlovakWordBoundaryRegex(/\bresp\.\s*/gi), 'respektíve ')
    .replace(makeSlovakWordBoundaryRegex(/\btzn\.\s*/gi), 'to znamená ')
    .replace(makeSlovakWordBoundaryRegex(/\ba\.s\.(?:\s*|\b)/gi), 'akciová spoločnosť ')
    .replace(makeSlovakWordBoundaryRegex(/\bs\.r\.o\.(?:\s*|\b)/gi), 'spoločnosť s ručením obmedzeným ')
    .replace(makeSlovakWordBoundaryRegex(/\bBc\.\s*/gi), 'bakalár ')
    .replace(makeSlovakWordBoundaryRegex(/\bMgr\.\s*/gi), 'magister ')
    .replace(makeSlovakWordBoundaryRegex(/\bIng\.\s*/gi), 'inžinier ')
    .replace(makeSlovakWordBoundaryRegex(/\bPhD\.\s*/gi), 'doktor filozofie ')
    .replace(makeSlovakWordBoundaryRegex(/\bMUDr\.\s*/gi), 'doktor medicíny ')
    .replace(makeSlovakWordBoundaryRegex(/\bRNDr\.\s*/gi), 'doktor prírodných vied ')
    .replace(makeSlovakWordBoundaryRegex(/\bJUDr\.\s*/gi), 'doktor práv ')
    .replace(makeSlovakWordBoundaryRegex(/\bMVDr\.\s*/gi), 'doktor veterinárnej medicíny ')
    .replace(makeSlovakWordBoundaryRegex(/\bstr\.\s*/gi), 'strana ')
    .replace(makeSlovakWordBoundaryRegex(/\baha\b/gi), 'aha!')
    .replace(makeSlovakWordBoundaryRegex(/\boho\b/gi), 'oho!')
    .replace(makeSlovakWordBoundaryRegex(/\bau\b/gi), 'auuu!')
    .replace(makeSlovakWordBoundaryRegex(/\bjaj\b/gi), 'jaj!')
    .replace(makeSlovakWordBoundaryRegex(/\bfuj\b/gi), 'fuj!')
    .replace(makeSlovakWordBoundaryRegex(/\b(brr|bŕŕ)\b/gi), 'bŕŕŕ')
    .replace(makeSlovakWordBoundaryRegex(/\bha\-ha\b/gi), 'ha ha')
    .replace(makeSlovakWordBoundaryRegex(/\bhe\-he\b/gi), 'he he')
    .replace(makeSlovakWordBoundaryRegex(/\bbúú\b/gi), 'búúú')
    .replace(makeSlovakWordBoundaryRegex(/\bbum\b/gi), 'bum!')
    .replace(makeSlovakWordBoundaryRegex(/\bprásk\b/gi), 'prásk!')
    .replace(makeSlovakWordBoundaryRegex(/\bcink\b/gi), 'cink!');

  // Merge spaces in large numbers (e.g., 10 000 -> 10000, 1 000 000 -> 1000000)
  preproc = preproc.replace(/\b\d{1,3}(?:\s+\d{3})+\b/g, (m) => m.replace(/\s+/g, ''));

  const rawTokens = preproc.match(/(\d+[\.,]\d+|\d+\.|\d+|%|[a-zA-ZáäéíóúýôďťňľčšžA-ZÁÄÉÍÓÚÝÔĎŤŇĽČŠŽCď]+|\s+|[^\sa-zA-ZáäéíóúýôďťňľčšžA-ZÁÄÉÍÓÚÝÔĎŤŇĽČŠŽCď0-9%]+)/g) || [];
  const tokens = [...rawTokens];
  const result: string[] = [];

  const getNonSpaceToken = (startIdx: number, direction: 1 | -1): { token: string; index: number } => {
    let idx = startIdx + direction;
    while (idx >= 0 && idx < tokens.length) {
      const tok = tokens[idx].trim();
      if (tok !== '') {
        return { token: tok, index: idx };
      }
      idx += direction;
    }
    return { token: '', index: -1 };
  };

  for (let i = 0; i < tokens.length; i++) {
    const rawToken = tokens[i];
    const token = rawToken.trim();

    if (token === '') {
      result.push(rawToken);
      continue;
    }

    // 1. Check for decimal numbers (e.g. 3,5 or 3.5)
    const decimalMatch = token.match(/^(\d+)[,\.](\d+)$/);
    if (decimalMatch) {
      const lhs = parseInt(decimalMatch[1], 10);
      const rhsStr = decimalMatch[2];
      const rhsVal = parseInt(rhsStr, 10);
      
      let lhsWord = '';
      if (lhs === 0) {
        lhsWord = 'nula celých';
      } else if (lhs === 1) {
        lhsWord = 'jedna celá';
      } else if (lhs === 2) {
        lhsWord = 'dve celé';
      } else if (lhs === 3) {
        lhsWord = 'tri celé';
      } else if (lhs === 4) {
        lhsWord = 'štyri celé';
      } else {
        lhsWord = `${getNominativeCardinal(lhs)} celých`;
      }
      
      let rhsWord = '';
      if (rhsStr.startsWith('0') || rhsStr.length > 3) {
        const digits = rhsStr.split('');
        const digitWords: Record<string, string> = {
          '0': 'nula', '1': 'jeden', '2': 'dva', '3': 'tri', '4': 'štyri',
          '5': 'päť', '6': 'šesť', '7': 'sedem', '8': 'osem', '9': 'deväť'
        };
        rhsWord = digits.map(d => digitWords[d] || d).join(' ');
      } else {
        rhsWord = getNominativeCardinal(rhsVal);
      }

      let floatText = `${lhsWord} ${rhsWord}`;

      const nextInfo = getNonSpaceToken(i, 1);
      if (nextInfo.token !== '') {
        const nextToken = nextInfo.token;
        const decGenVal = UNIT_GEN_SG[nextToken] || UNIT_GEN_SG[nextToken.toLowerCase()];
        if (decGenVal) {
          floatText += ' ' + decGenVal;
          i = nextInfo.index;
        }
      }
      result.push(floatText);
      continue;
    }

    // 2. Check for ordinals (e.g. 3.)
    const ordinalMatch = token.match(/^(\d+)\.$/);
    if (ordinalMatch) {
      const num = parseInt(ordinalMatch[1], 10);
      const prevInfo = getNonSpaceToken(i, -1);
      const nextInfo = getNonSpaceToken(i, 1);

      const prep = prevInfo.token.toLowerCase();
      const nextWord = nextInfo.token.toLowerCase();

      let mode: 'M_NOM' | 'M_LOC' | 'F_NOM' | 'F_LOC' | 'N_NOM' | 'N_LOC' = 'M_NOM';
      const locativePreps = ['v', 'vo', 'na', 'o', 'po', 'pri'];
      const isLoc = locativePreps.includes(prep);

      if (isLoc) {
        if (nextWord.endsWith('e') || nextWord.endsWith('i') || nextWord.endsWith('ej')) {
          mode = 'F_LOC';
        } else {
          mode = 'M_LOC';
        }
      } else {
        if (nextWord.endsWith('a') || nextWord.endsWith('á') || nextWord.endsWith('ia')) {
          mode = 'F_NOM';
        } else if (nextWord.endsWith('o') || nextWord.endsWith('e') || nextWord.endsWith('ie')) {
          mode = 'N_NOM';
        } else {
          mode = 'M_NOM';
        }
      }

      result.push(getOrdinalWord(num, mode));
      continue;
    }

    // 3. Check for cardinals (e.g. 5)
    const cardinalMatch = token.match(/^(\d+)$/);
    if (cardinalMatch) {
      const num = parseInt(cardinalMatch[1], 10);
      const prevInfo = getNonSpaceToken(i, -1);
      const nextInfo = getNonSpaceToken(i, 1);

      const prep = prevInfo.token.toLowerCase();
      const isIns = (prep === 's' || prep === 'so');

      const nextToken = nextInfo.token;
      let hasUnit = (UNIT_MAP[nextToken] !== undefined) || (UNIT_MAP[nextToken.toLowerCase()] !== undefined);

      // Exclude Slovak conjunction/preposition conflicts:
      if (hasUnit) {
        const nextLower = nextToken.toLowerCase();
        if (nextLower === 'a' && nextToken !== 'A') {
          hasUnit = false;
        } else if (nextLower === 's' || nextLower === 'v') {
          // If followed by a word (which starts with a Slovak letter), s/v is a preposition, not a unit!
          const afterNextInfo = getNonSpaceToken(nextInfo.index, 1);
          if (afterNextInfo.token !== '') {
            if (/[a-zA-ZáäéíóúýôďťňľčšžÁÄÉÍÓÚÝÔĎŤŇĽČŠŽ]/.test(afterNextInfo.token[0])) {
              hasUnit = false;
            }
          }
        }
      }

      let numWord = '';
      if (isIns) {
        numWord = getInstrumentalCardinal(num);
      } else {
        const unitForms = hasUnit ? (UNIT_MAP[nextToken] || UNIT_MAP[nextToken.toLowerCase()]) : null;
        const nextWord = nextToken.toLowerCase();
        if (num === 1) {
          if (unitForms && unitForms.gender) {
            const g = unitForms.gender;
            if (g === 'F') numWord = 'jedna';
            else if (g === 'N') numWord = 'jedno';
            else numWord = 'jeden';
          } else if (nextWord.endsWith('a') || nextWord.endsWith('á') || nextWord.endsWith('ia')) {
            numWord = 'jedna';
          } else if (nextWord.endsWith('o') || nextWord.endsWith('e') || nextWord.endsWith('ie')) {
            numWord = 'jedno';
          } else {
            numWord = 'jeden';
          }
        } else if (num === 2) {
          if (unitForms && unitForms.gender) {
            const g = unitForms.gender;
            if (g === 'F' || g === 'N') numWord = 'dve';
            else numWord = 'dva';
          } else if (nextWord.endsWith('a') || nextWord.endsWith('á') || nextWord.endsWith('ia') || nextWord.endsWith('o') || nextWord.endsWith('e') || nextWord.endsWith('ie')) {
            numWord = 'dve';
          } else {
            numWord = 'dva';
          }
        } else {
          // General nominative cardinal
          numWord = getNominativeCardinal(num);
        }
      }

      if (hasUnit) {
        const unitForms = UNIT_MAP[nextToken] || UNIT_MAP[nextToken.toLowerCase()];
        let unitWord = '';
        if (isIns) {
          unitWord = (num === 1) ? unitForms.sgIns : unitForms.plIns;
        } else {
          // Detailed Slovak declension rules for whole numbers with SI units:
          // 1 -> singular (sgNom)
          // 2, 3, 4 -> plural nominative (plNom)
          // other (0, 5+, compound numbers like 21, 22) -> plural genitive (genPl)
          if (num === 1) {
            unitWord = unitForms.sgNom;
          } else if (num === 2 || num === 3 || num === 4) {
            unitWord = unitForms.plNom;
          } else {
            unitWord = unitForms.genPl;
          }
        }
        numWord += ' ' + unitWord;
        i = nextInfo.index;
      }

      result.push(numWord);
      continue;
    }

    if (token === '%') {
      result.push('percent');
      continue;
    }

    const lowerToken = token.toLowerCase();

    // 3b. Isolated letter spelling (w, q, x, and other spelling letters)
    if (token.length === 1 && SINGLE_LETTER_PRONUNCIATION_MAP[lowerToken] !== undefined) {
      result.push(SINGLE_LETTER_PRONUNCIATION_MAP[lowerToken]);
      continue;
    }

    // 4. Anglicizmy (borrowed loanwords) dictionary match
    const loanwordPronunciation = getAnglicizmusPronunciation(lowerToken);
    if (loanwordPronunciation !== undefined) {
      result.push(loanwordPronunciation);
      continue;
    }

    result.push(rawToken);
  }

  return result.join('');
}

// Align words from normalized text back to original text character offsets
export function alignWords(original: string, normalized: string): number[] {
  interface Token {
    text: string;
    start: number;
    end: number;
    clean: string;
  }

  const tokenize = (str: string): Token[] => {
    const tokens: Token[] = [];
    const regex = /\S+/g;
    let match;
    while ((match = regex.exec(str)) !== null) {
      const tokenText = match[0];
      const clean = tokenText.toLowerCase().replace(/[^a-záäéíóúýôďťňľčšžcđ0-9]/g, '');
      tokens.push({
        text: tokenText,
        start: match.index,
        end: match.index + tokenText.length,
        clean
      });
    }
    return tokens;
  };

  const origTokens = tokenize(original);
  const normTokens = tokenize(normalized);

  const mapping: number[] = new Array(normTokens.length).fill(0);

  // Find all exact matches first (anchors)
  const anchors: { normIdx: number; origIdx: number }[] = [];
  let lastO = 0;
  for (let n = 0; n < normTokens.length; n++) {
    const nt = normTokens[n];
    if (nt.clean.length === 0) continue;
    for (let o = lastO; o < origTokens.length; o++) {
      if (origTokens[o].clean === nt.clean) {
        anchors.push({ normIdx: n, origIdx: o });
        lastO = o + 1;
        break;
      }
    }
  }

  // Now, fill the mapping for all normTokens
  let anchorIdx = 0;
  for (let n = 0; n < normTokens.length; n++) {
    // If this normToken is an anchor, map it directly
    const matchingAnchor = anchors.find(a => a.normIdx === n);
    if (matchingAnchor) {
      mapping[n] = matchingAnchor.origIdx;
      // advance anchor pointer
      while (anchorIdx < anchors.length && anchors[anchorIdx].normIdx <= n) {
        anchorIdx++;
      }
    } else {
      // Find the surrounding anchors
      const prevAnchor = anchorIdx > 0 ? anchors[anchorIdx - 1] : null;
      const nextAnchor = anchorIdx < anchors.length ? anchors[anchorIdx] : null;

      const minOrig = prevAnchor ? prevAnchor.origIdx + 1 : 0;
      const maxOrig = nextAnchor ? nextAnchor.origIdx - 1 : origTokens.length - 1;

      if (minOrig > maxOrig) {
        // No space between anchors, map to nearest anchor
        mapping[n] = prevAnchor ? prevAnchor.origIdx : (nextAnchor ? nextAnchor.origIdx : 0);
      } else {
        // Distribute proportionally
        const normStart = prevAnchor ? prevAnchor.normIdx + 1 : 0;
        const normEnd = nextAnchor ? nextAnchor.normIdx - 1 : normTokens.length - 1;

        const normRange = normEnd - normStart + 1;
        const origRange = maxOrig - minOrig + 1;

        if (normRange <= 0) {
          mapping[n] = minOrig;
        } else {
          const relativePos = (n - normStart) / normRange;
          const targetOrigIdx = minOrig + Math.floor(relativePos * origRange);
          mapping[n] = Math.max(minOrig, Math.min(maxOrig, targetOrigIdx));
        }
      }
    }
  }

  // Build the character-level map from normalized string character index to original string character index
  const charMap: number[] = new Array(normalized.length).fill(0);
  let lastOrigPos = 0;

  for (let i = 0; i < normalized.length; i++) {
    // Find which normToken covers this character index
    const tokenIdx = normTokens.findIndex(t => i >= t.start && i < t.end);
    if (tokenIdx !== -1) {
      const origTokenIdx = mapping[tokenIdx];
      const ot = origTokens[origTokenIdx];
      if (ot) {
        charMap[i] = ot.start;
        lastOrigPos = ot.end;
      } else {
        charMap[i] = lastOrigPos;
      }
    } else {
      charMap[i] = lastOrigPos;
    }
  }

  return charMap;
}

// Replace pattern with replacement in string, updating character mapping array
export function replaceWithMapping(
  str: string,
  map: number[],
  pattern: RegExp,
  replacement: string
): { str: string; map: number[] } {
  let currentStr = str;
  let currentMap = [...map];

  const regex = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
  
  let match;
  let nextStr = '';
  const nextMap: number[] = [];
  let lastIndex = 0;

  while ((match = regex.exec(currentStr)) !== null) {
    const matchIndex = match.index;
    const matchLength = match[0].length;

    // Append everything before match
    nextStr += currentStr.slice(lastIndex, matchIndex);
    nextMap.push(...currentMap.slice(lastIndex, matchIndex));

    // Append replacement
    nextStr += replacement;
    const matchedOrigIdx = currentMap[matchIndex] !== undefined ? currentMap[matchIndex] : 0;
    for (let r = 0; r < replacement.length; r++) {
      nextMap.push(matchedOrigIdx);
    }

    lastIndex = matchIndex + matchLength;
  }

  // Append remaining part
  nextStr += currentStr.slice(lastIndex);
  nextMap.push(...currentMap.slice(lastIndex));

  return { str: nextStr, map: nextMap };
}

// Function to preprocess Slovak text and tokenize it into phonemic symbols!
export function textToPhonemeSymbols(text: string, voice?: VoiceConfig): string[] {
  const normalizedText = normalizeSlovakText(text);
  const charMap = alignWords(text, normalizedText);

  // Normalize string: lowercase, consolidate spaces, split into characters/digraphs
  let raw = '';
  let rawToNormalizedIdx: number[] = [];
  
  const temp = normalizedText.toLowerCase();
  for (let idx = 0; idx < temp.length; idx++) {
    let char = temp[idx];
    if (char === ';' || char === ':') {
      char = ',';
    } else if (char === '-' || char === '\u2013' || char === '\u2014') {
      char = ' ';
    }
    
    if (/[a-záäéíóúýôďťňľčšžcđ\s\.,!\?]/.test(char)) {
      raw += char;
      rawToNormalizedIdx.push(idx);
    }
  }

  // Apply Elision and Epenthesis (Zjednodušovanie a vkladanie hlások v neformálnej / rýchlej reči)
  if (voice && (voice as any).enableElision) {
    const elisions = [
      { pattern: /jablk/g, replacement: 'japk' },
      { pattern: /vtedy/g, replacement: 'fedy' },
      { pattern: /vstúp/g, replacement: 'stúp' },
      { pattern: /štvrť/g, replacement: 'štvr' },
      { pattern: /srdce/g, replacement: 'srce' },
      { pattern: /dcér/g, replacement: 'cér' },
      { pattern: /päťdesiat/g, replacement: 'paďesiat' },
      { pattern: /šesťdesiat/g, replacement: 'šesťesiat' },
      { pattern: /\bvst/g, replacement: 'vost' },
      { pattern: /\bvs/g, replacement: 'vos' }
    ];
    for (const el of elisions) {
      const res = replaceWithMapping(raw, rawToNormalizedIdx, el.pattern, el.replacement);
      raw = res.str;
      rawToNormalizedIdx = res.map;
    }
  }

  // Transliterate foreign standard letters to standard Slovak phone combinations for general fallback
  const translits = [
    { pattern: /x/g, replacement: 'ks' },
    { pattern: /w/g, replacement: 'v' },
    { pattern: /q/g, replacement: 'kv' }
  ];
  for (const tr of translits) {
    const res = replaceWithMapping(raw, rawToNormalizedIdx, tr.pattern, tr.replacement);
    raw = res.str;
    rawToNormalizedIdx = res.map;
  }

  const symbols: string[] = [];
  const symbolOriginalOffsets: number[] = [];
  let i = 0;

  while (i < raw.length) {
    const char = raw[i];
    const nextChar = raw[i + 1] || '';
    const thirdChar = raw[i + 2] || '';

    let consumed = 1;
    let sym = char;

    // Digraphs in Slovak: "ch", "dz", "dž"
    if (char === 'c' && nextChar === 'h') {
      sym = 'ch';
      consumed = 2;
    } else if (char === 'd' && nextChar === 'z' && thirdChar === 'ž') {
      sym = 'dž';
      consumed = 3;
    } else if (char === 'd' && nextChar === 'z') {
      sym = 'dz';
      consumed = 2;
    } else if (char === 'd' && nextChar === 'ž') {
      sym = 'dž';
      consumed = 2;
    } else if (char === 'i' && (nextChar === 'a' || nextChar === 'e' || nextChar === 'u')) {
      // Slovak standard diphthongs ia, ie, iu
      sym = 'i' + nextChar;
      consumed = 2;
    }

    symbols.push(sym);
    const normIdx = rawToNormalizedIdx[i] !== undefined ? rawToNormalizedIdx[i] : 0;
    const origIdx = charMap[normIdx] !== undefined ? charMap[normIdx] : 0;
    symbolOriginalOffsets.push(origIdx);

    i += consumed;
  }

  // Apply Palatalization (Slovak Zmäkčovanie):
  // When d, t, n, l are followed by e, i, í, or diphthongs ia, ie, iu, they soften to ď, ť, ň, ľ.
  const palatalizedSymbols: string[] = [];
  const SOFTEN_MAP: Record<string, string> = {
    'd': 'ď',
    't': 'ť',
    'n': 'ň',
    'l': 'ľ'
  };
  const SOFTENING_VOWELS = ['e', 'i', 'í', 'ia', 'ie', 'iu'];

  // Helper to reconstruct the word around symbols[j] to evaluate context-specific spelling exceptions (e.g. stena, ten, vtedy)
  const getFullWordAt = (index: number): string => {
    let start = index;
    while (start > 0 && symbols[start - 1] !== ' ' && !['.', ',', '!', '?'].includes(symbols[start - 1])) {
      start--;
    }
    let end = index;
    while (end < symbols.length - 1 && symbols[end + 1] !== ' ' && !['.', ',', '!', '?'].includes(symbols[end + 1])) {
      end++;
    }
    let w = '';
    for (let k = start; k <= end; k++) {
      w += symbols[k];
    }
    return w;
  };

  const shouldSoften = (sym: string, word: string): boolean => {
    const cleanWord = word.toLowerCase();
    
    // Exception for root "sten" / "stien" (e.g. stena, stenou, stenu, stene, stien, stenám, etc.) where 't' remains hard
    if (cleanWord.includes('sten') || cleanWord.includes('stien')) {
      if (sym === 't') return false;
    }
    
    // Pronouns like "ten", "tento", "tej", "tým", "toho", "tomu", "tú" where 't' remains hard
    if (cleanWord === 'ten' || cleanWord === 'tento' || cleanWord === 'tej' || cleanWord === 'tým' || 
        cleanWord === 'toho' || cleanWord === 'tomu' || cleanWord === 'tú') {
      if (sym === 't') return false;
    }
    
    // "jeden" and its declensions (excluding "jedni" where 'd' softens to 'ď')
    if (cleanWord.startsWith('jed') && cleanWord !== 'jedni') {
      if (sym === 'd') return false;
    }
    
    // "vtedy", "tedy", "teda"
    if (cleanWord === 'vtedy' || cleanWord === 'tedy' || cleanWord === 'teda') {
      if (sym === 't' || sym === 'd') return false;
    }
    
    // "teraz"
    if (cleanWord === 'teraz') {
      if (sym === 't') return false;
    }

    // Common loan/foreign words where consonants remain hard
    const foreignWordsWithHardCon = [
      'telefón', 'televízia', 'téma', 'termín', 'terasa', 'teória', 'debata', 'dekan', 'delegácia', 'depo', 'demokracia', 'definícia', 'detektív'
    ];
    if (foreignWordsWithHardCon.includes(cleanWord)) {
      if (sym === 't' || sym === 'd') return false;
    }
    
    return true;
  };

  for (let j = 0; j < symbols.length; j++) {
    const sym = symbols[j];
    if (SOFTEN_MAP[sym]) {
      // Find the next non-space phoneme
      let nextPhoneme = '';
      let nextIndex = j + 1;
      while (nextIndex < symbols.length) {
        if (symbols[nextIndex] !== ' ') {
          nextPhoneme = symbols[nextIndex];
          break;
        }
        nextIndex++;
      }
      
      const wordContext = getFullWordAt(j);
      if (SOFTENING_VOWELS.includes(nextPhoneme) && shouldSoften(sym, wordContext)) {
        palatalizedSymbols.push(SOFTEN_MAP[sym]);
      } else {
        palatalizedSymbols.push(sym);
      }
    } else {
      palatalizedSymbols.push(sym);
    }
  }

  // Apply Slovak Voicing Assimilation Rules (Spodobovanie)!
  // 1. Voiced consonants at the end of word before pause/silence become unvoiced
  // 2. Regressive voicing assimilation inside clusters
  const assimilatedSymbols: string[] = [...palatalizedSymbols];

  const isVocalicOrSyllabic = (sym: string): boolean => {
    const list = ['a', 'á', 'ä', 'e', 'é', 'i', 'í', 'o', 'ó', 'u', 'ú', 'y', 'ý', 'ia', 'ie', 'iu', 'ô', 'u̯', 'r', 'ŕ', 'l', 'ĺ'];
    return list.includes(sym);
  };

  const isEndOfWord = (idx: number): boolean => {
    if (idx === palatalizedSymbols.length - 1) return true;
    const next = palatalizedSymbols[idx + 1];
    return next === ' ' || ['.', ',', '!', '?'].includes(next);
  };

  const isPrepositionV = (idx: number): boolean => {
    if (palatalizedSymbols[idx] !== 'v') return false;
    const isStart = idx === 0 || palatalizedSymbols[idx - 1] === ' ';
    const isEnd = idx === palatalizedSymbols.length - 1 || palatalizedSymbols[idx + 1] === ' ';
    return isStart && isEnd;
  };

  const getNextWordFirstPhoneme = (idx: number): string => {
    let nextIdx = idx + 1;
    while (nextIdx < palatalizedSymbols.length && palatalizedSymbols[nextIdx] === ' ') {
      nextIdx++;
    }
    if (nextIdx < palatalizedSymbols.length) {
      return palatalizedSymbols[nextIdx];
    }
    return '';
  };

  for (let j = 0; j < palatalizedSymbols.length; j++) {
    const symbol = palatalizedSymbols[j];

    // Exception for Slovak 'v' (coda vocalization or preposition voicing)
    if (symbol === 'v') {
      if (isPrepositionV(j)) {
        const nextPh = getNextWordFirstPhoneme(j);
        if (isVocalic(nextPh) || SONANTS.includes(nextPh)) {
          assimilatedSymbols[j] = 'u̯';
        } else if (VOICELESS_CONSONANTS.includes(nextPh)) {
          assimilatedSymbols[j] = 'f';
        } else {
          assimilatedSymbols[j] = 'v';
        }
        continue;
      }

      const isEnd = isEndOfWord(j);
      const isCoda = j > 0 && isVocalicOrSyllabic(palatalizedSymbols[j - 1]) && 
                     (j < palatalizedSymbols.length - 1 && 
                      palatalizedSymbols[j + 1] !== ' ' && 
                      !isVocalicOrSyllabic(palatalizedSymbols[j + 1]) && 
                      !['.', ',', '!', '?'].includes(palatalizedSymbols[j + 1]));

      if (isEnd || isCoda) {
        assimilatedSymbols[j] = 'u̯';
        continue;
      }
    }

    // Skip pauses, vowels, sonants
    if (VOICED_CONSONANTS.includes(symbol) || VOICELESS_CONSONANTS.includes(symbol)) {
      // Find the next phonetic element (ignoring spaces unless at word boundaries)
      let nextPhoneme = '';
      let nextIndex = j + 1;
      while (nextIndex < palatalizedSymbols.length) {
        if (palatalizedSymbols[nextIndex] !== ' ') {
          nextPhoneme = palatalizedSymbols[nextIndex];
          break;
        }
        nextIndex++;
      }

      // Rule A: Consolidated ending before pause
      if (!nextPhoneme || ['.', ',', '!', '?'].includes(nextPhoneme)) {
        if (VOICED_CONSONANTS.includes(symbol)) {
          // Exception: 'v' at the end of a word is already handled by exception above
          assimilatedSymbols[j] = ASSIMILATION_PAIR_TO_VOICELESS[symbol] || symbol;
        }
      } 
      // Rule B: Regressive assimilation due to next consonant
      else {
        const isNextVoicingTrigger = VOICED_CONSONANTS.includes(nextPhoneme) || 
                                     (palatalizedSymbols.slice(j + 1, nextIndex).includes(' ') && 
                                      (SONANTS.includes(nextPhoneme) || isVocalic(nextPhoneme)));

        if (isNextVoicingTrigger) {
          // Current must become voiced
          if (VOICELESS_CONSONANTS.includes(symbol)) {
            assimilatedSymbols[j] = ASSIMILATION_PAIR_TO_VOICED[symbol] || symbol;
          }
        } else if (VOICELESS_CONSONANTS.includes(nextPhoneme)) {
          // Next is voiceless, so current must become voiceless
          if (VOICED_CONSONANTS.includes(symbol)) {
            if (symbol === 'v') {
              assimilatedSymbols[j] = 'f';
            } else {
              assimilatedSymbols[j] = ASSIMILATION_PAIR_TO_VOICELESS[symbol] || symbol;
            }
          }
        }
      }
    }
  }

  // Apply Velar Nasal Assimilation [ŋ] (bankár -> [baŋkaːr]):
  // Alveolar 'n' preceding 'k', 'g', or 'ch' becomes velar nasal 'ŋ'.
  const finalPhonemeSymbols: string[] = [];
  for (let k = 0; k < assimilatedSymbols.length; k++) {
    const sym = assimilatedSymbols[k];
    if (sym === 'n') {
      let nextNonSpace = '';
      let nextIdx = k + 1;
      while (nextIdx < assimilatedSymbols.length) {
        if (assimilatedSymbols[nextIdx] !== ' ') {
          nextNonSpace = assimilatedSymbols[nextIdx];
          break;
        }
        nextIdx++;
      }
      if (nextNonSpace === 'k' || nextNonSpace === 'g' || nextNonSpace === 'ch') {
        finalPhonemeSymbols.push('ŋ');
        continue;
      }
    }
    finalPhonemeSymbols.push(sym);
  }

  (finalPhonemeSymbols as any).originalOffsets = symbolOriginalOffsets;
  return finalPhonemeSymbols;
}

// Checks if a symbol represents a vowel or diphthong
export function isVocalic(symbol: string): boolean {
  const vowels = ['a', 'á', 'ä', 'e', 'é', 'i', 'í', 'o', 'ó', 'u', 'ú', 'y', 'ý', 'ia', 'ie', 'iu', 'ô', 'u̯'];
  // Syllabic consonants 'r', 'ŕ', 'l', 'ĺ' can act as vocal nuclei in some words (e.g. prst, vlk)
  return vowels.includes(symbol);
}

// Slovak interjections categories for TTS emotional expression
const INTERJ_SPECIAL_SURPRISE = new Set([
  'ach', 'acha', 'aha', 'och', 'ochó', 'oho', 'fíha', 'páni', 'hľa', 'ejha', 'jéj', 'fíí', 'hups', 'hop', 'ej', 'ó'
]);
const INTERJ_SPECIAL_PAIN = new Set([
  'au', 'auuu', 'jaj', 'jajaj', 'achjoj', 'achká', 'oj', 'ojoj', 'joj', 'juj', 'júj', 'achich'
]);
const INTERJ_SPECIAL_JOY = new Set([
  'hurá', 'jupí', 'hopsa', 'hopy', 'hej', 'héj', 'hééj', 'hola', 'halo', 'ahoj', 'čau', 'veru'
]);
const INTERJ_SPECIAL_FEAR = new Set([
  'fuj', 'brr', 'bŕŕ', 'bŕŕŕ', 'tfuj', 'pfuj', 'pss', 'pst', 'ššš', 'uh', 'uf', 'uff'
]);
const INTERJ_SPECIAL_LAUGHTER = new Set([
  'haha', 'hehe', 'hihi', 'chi', 'chi-chi', 'heh', 'ha-ha', 'he-he'
]);
const INTERJ_SPECIAL_CRYING = new Set([
  'bú', 'búú', 'búúú', 'fňuk', 'fňukať'
]);
const INTERJ_SPECIAL_ANIMAL = new Set([
  'kvik', 'hav', 'hav-hav', 'mňau', 'mňau-mňau', 'vrkú', 'kikirikí', 'kotkodák', 'kvoč', 'gá-gá', 'kač', 'kvák', 'híha', 'iá', 'kroch', 'chro', 'cvrk', 'bzuč', 'bz', 'bé', 'mé', 'mú'
]);
const INTERJ_SPECIAL_OBJECT = new Set([
  'žblnk', 'čľup', 'čľap', 'cap', 'cap-cap', 'bum', 'bác', 'tresk', 'prásk', 'rup', 'krak',
  'chrum', 'cink', 'ceng', 'ding', 'dong', 'tik-tak', 'tik', 'tak', 'klop', 'klop-klop', 'ťuk', 'ťuk-ťuk',
  'vrz', 'šuch', 'šuchot', 'svišť', 'fiu', 'fiuu', 'šup', 'šup-šup', 'šľak', 'žuch', 'buch', 'buch-buch',
  'dup', 'dup-dup', 'cup', 'cupy', 'hŕŕ', 'hybaj', 'marš', 'no', 'nuž', 'bože'
]);

const SLOVAK_PREPOSITIONS = new Set([
  'bez', 'ceze', 'cez', 'do', 'dľa', 'dlž', 'k', 'ku', 'medzi', 'mimo', 'na', 'nad', 'nade', 
  'namiesto', 'naprieč', 'napriek', 'neďaleko', 'o', 'ob', 'oba', 'od', 'odo', 'okolo', 'okrem', 
  'oproti', 'po', 'pod', 'podo', 'popod', 'popri', 'popred', 'poza', 'ponad', 'pomedzi', 'pomimo', 
  'pozoza', 'pre', 'predo', 'pred', 'pri', 'proti', 'prostredníctvom', 's', 'so', 'spod', 'spopod', 
  'spomedzi', 'spoza', 'spred', 'u', 'v', 'vo', 'vedľa', 'voči', 'vnútri', 'vrátane', 'vyše', 
  'z', 'zo', 'za', 'zpod', 'zpomedzi', 'zpoza', 'zospod', 'zovšadiaľ', 'zvrchu', 'zdola',
  'vďaka', 'vzhľadom', 'spolu', 'súčasne', 'súhlasne'
]);

function isPreposition(word: string): boolean {
  if (!word) return false;
  const clean = word.toLowerCase().replace(/[^a-záäéíóúýôďťňľčšžcđ]/g, '').trim();
  return SLOVAK_PREPOSITIONS.has(clean);
}

function prepositionHasVowel(word: string): boolean {
  if (!word) return false;
  const clean = word.toLowerCase().replace(/[^a-záäéíóúýôďťňľčšžcđ]/g, '').trim();
  return /[aeiouyáäéíóúýô]/i.test(clean);
}

interface WordInfo {
  wordIndex: number;
  symbols: string[];
  symbolIndices?: number[];
  isRealWord: boolean;
  cleanWordStr: string;
  originalWordStr?: string;
  isAllCaps: boolean;
  isStressed: boolean;
  vocalIndices: number[];
  stressedNucleusIdx: number;
}

interface ClauseInfo {
  words: WordInfo[];
  punctuation: string;
  isTerminal: boolean;
}

interface SentenceInfo {
  clauses: ClauseInfo[];
  sentenceType: 'declarative' | 'yesno_question' | 'wh_question' | 'imperative' | 'exclamatory';
}

// Breaks phonetic stream into syllables and assigns word stress using advanced Slovak prosody rules
export function createPhonemeSegments(symbols: string[], voice: VoiceConfig, rawText?: string): PhonemeSegment[] {
  const segments: PhonemeSegment[] = [];

  // Split into words first based on spaces and punctuation
  const words: string[][] = [[]];
  const wordSymbolIndices: number[][] = [[]];

  for (let sIdx = 0; sIdx < symbols.length; sIdx++) {
    const sym = symbols[sIdx];
    if (sym === ' ' || ['.', ',', '!', '?'].includes(sym)) {
      words.push([sym]);
      wordSymbolIndices.push([sIdx]);
      words.push([]);
      wordSymbolIndices.push([]);
    } else {
      words[words.length - 1].push(sym);
      wordSymbolIndices[wordSymbolIndices.length - 1].push(sIdx);
    }
  }

  const cleanWords = words.filter(w => w.length > 0);
  const cleanWordSymbolIndices = wordSymbolIndices.filter(w => w.length > 0);

  // Match phonetic words to original text words to check for casing (ALL CAPS)
  const rawWordTokens = rawText ? (rawText.match(/[a-zA-ZáäéíóúýôďťňľčšžcđÁÄÉÍÓÚÝÔĎŤŇĽČŠŽC]+/g) || []) : [];
  let realWordGlobalIdx = 0;

  const wordInfos: WordInfo[] = cleanWords.map((w, wIdx) => {
    const sym = w[0];
    const isReal = w.length > 0 && sym !== ' ' && !['.', ',', '!', '?'].includes(sym);
    
    // Syllables analysis to find stressed index (always first syllable in Slovak)
    const vocalIndices: number[] = [];
    if (isReal) {
      for (let j = 0; j < w.length; j++) {
         const s = w[j];
        if (isVocalic(s)) {
          vocalIndices.push(j);
        } else if (s === 'r' || s === 'ŕ' || s === 'l' || s === 'ĺ') {
          const prev = j > 0 ? w[j - 1] : '';
          const next = j < w.length - 1 ? w[j + 1] : '';
          const isPrevVocal = prev ? isVocalic(prev) : false;
          const isNextVocal = next ? isVocalic(next) : false;
          if (!isPrevVocal && !isNextVocal) {
            vocalIndices.push(j);
          }
        }
      }
    }
    
    const stressedNucleusIdx = vocalIndices.length > 0 ? vocalIndices[0] : -1;
    const origStr = isReal ? rawWordTokens[realWordGlobalIdx] : undefined;
    if (isReal) {
      realWordGlobalIdx++;
    }
    
    const isAllCaps = origStr ? (origStr.length > 1 && origStr === origStr.toUpperCase() && /[A-ZÁÄÉÍÓÚÝÔĎŤŇĽČŠŽC]/.test(origStr)) : false;
    
    return {
      wordIndex: isReal ? realWordGlobalIdx - 1 : -1,
      symbols: w,
      symbolIndices: cleanWordSymbolIndices[wIdx],
      isRealWord: isReal,
      cleanWordStr: w.join(''),
      originalWordStr: origStr,
      isAllCaps,
      isStressed: false,
      vocalIndices,
      stressedNucleusIdx
    };
  });

  // Group mapped words into sentence and clause representations
  const sentencesList: SentenceInfo[] = [];
  let currentClauses: ClauseInfo[] = [];
  let currentClauseWords: WordInfo[] = [];

  for (let idx = 0; idx < wordInfos.length; idx++) {
    const winfo = wordInfos[idx];
    if (winfo.isRealWord || winfo.symbols[0] === ' ') {
      currentClauseWords.push(winfo);
    } else {
      const punc = winfo.symbols[0];
      const isTerminal = ['.', '!', '?'].includes(punc);
      
      currentClauses.push({
        words: [...currentClauseWords],
        punctuation: punc,
        isTerminal
      });
      currentClauseWords = [];

      if (isTerminal) {
        sentencesList.push({
          clauses: [...currentClauses],
          sentenceType: 'declarative'
        });
        currentClauses = [];
      }
    }
  }

  if (currentClauseWords.length > 0) {
    currentClauses.push({
      words: [...currentClauseWords],
      punctuation: '',
      isTerminal: true
    });
  }
  if (currentClauses.length > 0) {
    sentencesList.push({
      clauses: [...currentClauses],
      sentenceType: 'declarative'
    });
  }

  // Classify each sentence's intonation profile
  const SLOVAK_WH_WORDS = [
    'kto', 'čo', 'kde', 'kedy', 'ako', 'prečo', 'aký', 'aká', 'aké', 'ktorý', 'ktorá', 'ktoré',
    'koľko', 'čím', 'komu', 'koho', 'čie', 'čej', 'či', 'kým', 'kam', 'odkiaľ', 'pokiaľ', 'čomu', 'čom'
  ];

  for (const sent of sentencesList) {
    const lastClause = sent.clauses[sent.clauses.length - 1];
    const termPunc = lastClause ? lastClause.punctuation : '';
    
    if (termPunc === '?') {
      let hasWhWord = false;
      for (const cl of sent.clauses) {
        for (const w of cl.words) {
          if (w.isRealWord && SLOVAK_WH_WORDS.includes(w.cleanWordStr.toLowerCase())) {
            hasWhWord = true;
            break;
          }
        }
        if (hasWhWord) break;
      }
      sent.sentenceType = hasWhWord ? 'wh_question' : 'yesno_question';
    } else if (termPunc === '!') {
      sent.sentenceType = 'exclamatory';
    } else {
      sent.sentenceType = 'declarative';
    }
  }

  // Generate segments with fine-tuned prosody tracking
  let absolutePos = 0;

  for (const sent of sentencesList) {
    for (let clIdx = 0; clIdx < sent.clauses.length; clIdx++) {
      const cl = sent.clauses[clIdx];
      const isFinalClause = clIdx === sent.clauses.length - 1;
      
      const realWords = cl.words.filter(w => w.isRealWord);
      let focusRealWordGlobalIdx = -1;
      const allCapsIdx = realWords.findIndex(w => w.isAllCaps);
      if (allCapsIdx !== -1) {
        focusRealWordGlobalIdx = realWords[allCapsIdx].wordIndex;
      } else if (realWords.length > 0) {
        // Default slovak intonation focus (Rheme) resides at the last content word of the clause
        focusRealWordGlobalIdx = realWords[realWords.length - 1].wordIndex;
      }

      for (let wIdx = 0; wIdx < cl.words.length; wIdx++) {
        const winfo = cl.words[wIdx];
        
        if (!winfo.isRealWord) {
          const sym = winfo.symbols[0];
          const cfg = SLOVAK_PHONEMES[sym] || SLOVAK_PHONEMES[' '];
          
          let duration = cfg.baseDuration;
          if (sym === ',') {
            duration = 260 / voice.speed;
          } else if (sym === '.') {
            duration = 480 / voice.speed;
          } else if (sym === '?') {
            duration = 400 / voice.speed;
          } else if (sym === '!') {
            duration = 420 / voice.speed;
          } else {
            duration = duration / voice.speed;
          }
          
          // Zero-out duration of spaces after prepositions to pronounce them together continuously
          if (sym === ' ' && wIdx > 0) {
            const prevWord = cl.words[wIdx - 1];
            if (prevWord && prevWord.isRealWord && isPreposition(prevWord.cleanWordStr)) {
              duration = 0;
            }
          }
          
          let pos = absolutePos;
          const origOffsets = (symbols as any).originalOffsets;
          if (origOffsets && winfo.symbolIndices && winfo.symbolIndices.length > 0) {
            const symIdx = winfo.symbolIndices[0];
            if (origOffsets[symIdx] !== undefined) {
              pos = origOffsets[symIdx];
            }
          }

          segments.push({
            phoneme: cfg,
            customDuration: duration,
            pitchStart: voice.baseF0,
            pitchEnd: voice.baseF0,
            isStressed: false,
            textPosition: pos
          });
          absolutePos += sym.length;
          continue;
        }

        const wordLen = winfo.symbols.length;
        const wordCleanLower = winfo.cleanWordStr.toLowerCase().replace(/[^a-záäéíóúýôďťňľčšžcđ]/g, '').trim();
        
        let interjType: 'surprise' | 'pain' | 'joy' | 'fear' | 'laughter' | 'crying' | 'animal' | 'object' | null = null;
        if (INTERJ_SPECIAL_SURPRISE.has(wordCleanLower)) interjType = 'surprise';
        else if (INTERJ_SPECIAL_PAIN.has(wordCleanLower)) interjType = 'pain';
        else if (INTERJ_SPECIAL_JOY.has(wordCleanLower)) interjType = 'joy';
        else if (INTERJ_SPECIAL_FEAR.has(wordCleanLower)) interjType = 'fear';
        else if (INTERJ_SPECIAL_LAUGHTER.has(wordCleanLower)) interjType = 'laughter';
        else if (INTERJ_SPECIAL_CRYING.has(wordCleanLower)) interjType = 'crying';
        else if (INTERJ_SPECIAL_ANIMAL.has(wordCleanLower)) interjType = 'animal';
        else if (INTERJ_SPECIAL_OBJECT.has(wordCleanLower)) interjType = 'object';

        for (let j = 0; j < wordLen; j++) {
          const sym = winfo.symbols[j];
          const cfg = { ...(SLOVAK_PHONEMES[sym] || SLOVAK_PHONEMES[' ']) };
          
          let isStressed = winfo.stressedNucleusIdx !== -1 && j === winfo.stressedNucleusIdx;
          
          // Shift stress away from the noun if it's preceded by a vocalic preposition
          if (isStressed && wIdx >= 2) {
            const possibleSpace = cl.words[wIdx - 1];
            const possiblePrep = cl.words[wIdx - 2];
            if (possibleSpace && !possibleSpace.isRealWord && possibleSpace.symbols[0] === ' ' &&
                possiblePrep && possiblePrep.isRealWord && isPreposition(possiblePrep.cleanWordStr) && 
                prepositionHasVowel(possiblePrep.cleanWordStr)) {
              isStressed = false;
            }
          }
          
          let duration = cfg.baseDuration;
          if (isStressed && isVocalic(sym)) {
            duration *= 1.25;
          }

          // Apply Casual vowel reduction in unstressed syllables
          const isShortVowel = ['a', 'ä', 'e', 'i', 'o', 'u', 'y'].includes(sym);
          if (isShortVowel && !isStressed && (voice as any).enableCasualReduction) {
            duration *= 0.70; // 30% reduction in unstressed syllables
            if (cfg.formants) {
              cfg.formants = cfg.formants.map(f => {
                let targetFreq = f.frequency;
                if (f.frequency < 400 && f.frequency > 200) targetFreq = 400; // F1 rises towards schwa
                else if (f.frequency > 600) targetFreq = f.frequency * 0.85 + 1500 * 0.15; // pull towards neutral schwa F2
                return {
                  ...f,
                  frequency: targetFreq,
                  gain: f.gain - 3 // muffle with -3dB loss
                };
              });
            }
          }

          duration = duration / voice.speed;
          
          let ratioStart = 1.0;
          let ratioEnd = 1.0;
          
          if (voice.intonationPattern === 'flat') {
            ratioStart = 1.0;
            ratioEnd = 1.0;
          } else {
            const pitchModeMultiplier = voice.intonationPattern === 'animated' ? 1.5 : 1.0;
            
            if (!isFinalClause) {
              // Continuation clause: comma rise or flat anticipation plateau
              const isFocusWord = winfo.wordIndex === focusRealWordGlobalIdx;
              if (isFocusWord) {
                if (isStressed) {
                  ratioStart = 1.08 + (0.04 * pitchModeMultiplier);
                  ratioEnd = 1.14 + (0.08 * pitchModeMultiplier);
                } else {
                  const progress = (j / wordLen);
                  ratioStart = 1.05 + progress * 0.12 * pitchModeMultiplier;
                  ratioEnd = 1.05 + (progress + 1/wordLen) * 0.12 * pitchModeMultiplier;
                }
              } else {
                if (isStressed) {
                  ratioStart = 1.06 + (0.03 * pitchModeMultiplier);
                  ratioEnd = 1.01 + (0.01 * pitchModeMultiplier);
                } else {
                  ratioStart = 0.98;
                  ratioEnd = 0.96;
                }
              }
            } else {
              // Final clause of the sentence
              const isFocusWord = winfo.wordIndex === focusRealWordGlobalIdx;
              
              if (sent.sentenceType === 'yesno_question') {
                // Rising cadence towards the end of Yes/No questions
                if (isFocusWord) {
                  if (isStressed) {
                    ratioStart = 1.05;
                    ratioEnd = 1.22 * pitchModeMultiplier;
                  } else {
                    const progress = (j / wordLen);
                    ratioStart = 1.15 + progress * 0.26 * pitchModeMultiplier;
                    ratioEnd = 1.15 + (progress + 1/wordLen) * 0.26 * pitchModeMultiplier;
                  }
                } else {
                  if (isStressed) {
                    ratioStart = 1.08;
                    ratioEnd = 1.04;
                  } else {
                    ratioStart = 0.98;
                    ratioEnd = 1.0;
                  }
                }
              } else if (sent.sentenceType === 'wh_question') {
                // Wh-question: peak at the Wh-word, then gentle statement-styled decline
                const isWhWord = SLOVAK_WH_WORDS.includes(winfo.cleanWordStr.toLowerCase());
                
                if (isWhWord) {
                  if (isStressed) {
                    ratioStart = 1.22 * pitchModeMultiplier;
                    ratioEnd = 1.14 * pitchModeMultiplier;
                  } else {
                    ratioStart = 1.12 * pitchModeMultiplier;
                    ratioEnd = 1.06 * pitchModeMultiplier;
                  }
                } else if (isFocusWord) {
                  if (isStressed) {
                    ratioStart = 1.02;
                    ratioEnd = 0.92;
                  } else {
                    ratioStart = 0.92;
                    ratioEnd = 0.82;
                  }
                } else {
                  if (isStressed) {
                    ratioStart = 1.06;
                    ratioEnd = 1.02;
                  } else {
                    ratioStart = 0.96;
                    ratioEnd = 0.93;
                  }
                }
              } else if (sent.sentenceType === 'exclamatory') {
                // Exclamatory/imperative: falling contour, but high range and strong focus peaks
                if (isFocusWord) {
                  if (isStressed) {
                    ratioStart = 1.40 * pitchModeMultiplier;
                    ratioEnd = 1.15 * pitchModeMultiplier;
                    duration *= 0.95;
                  } else {
                    ratioStart = 1.10;
                    ratioEnd = 0.80;
                  }
                } else {
                  if (isStressed) {
                    ratioStart = 1.18 * pitchModeMultiplier;
                    ratioEnd = 1.10 * pitchModeMultiplier;
                  } else {
                    ratioStart = 1.02;
                    ratioEnd = 0.98;
                  }
                }
              } else {
                // Declarative rules: falling cadence
                if (isFocusWord) {
                  if (isStressed) {
                    ratioStart = 1.14 * pitchModeMultiplier;
                    ratioEnd = 1.02;
                  } else {
                    const progress = (j / wordLen);
                    ratioStart = 0.98 - progress * 0.16;
                    ratioEnd = 0.98 - (progress + 1/wordLen) * 0.16;
                  }
                } else {
                  if (isStressed) {
                    ratioStart = 1.08 + (0.02 * pitchModeMultiplier);
                    ratioEnd = 1.02;
                  } else {
                    const step = Math.min(3, j);
                    ratioStart = 0.98 - step * 0.02;
                    ratioEnd = 0.98 - (step + 1) * 0.02;
                  }
                }
              }
            }
          }
          
          if (winfo.isAllCaps) {
            if (isStressed) {
              ratioStart = Math.max(ratioStart, 1.32);
              ratioEnd = Math.max(ratioEnd, 1.18);
              duration *= 1.15;
            } else {
              ratioStart = Math.max(ratioStart, 1.12);
              ratioEnd = Math.max(ratioEnd, 1.06);
            }
          }
          
          let vibratoRateOverride: number | undefined;
          let vibratoDepthOverride: number | undefined;
          let volumeOverride: number | undefined;
          let shouldAddLaughterPause = false;
          let shouldAddAnimalPause = false;

          if (interjType) {
            if (interjType === 'surprise') {
              // Prekvapenie: zvýšiť tón na začiatku
              if (j === winfo.stressedNucleusIdx || (winfo.stressedNucleusIdx === -1 && j === 0)) {
                ratioStart = Math.max(ratioStart * 1.55, 1.55);
                ratioEnd = Math.max(ratioEnd * 1.25, 1.25);
              } else {
                ratioStart *= 1.20;
                ratioEnd *= 1.10;
              }
            } else if (interjType === 'pain') {
              // Bolesť: predĺžiť samohlásku
              if (isVocalic(sym)) {
                duration *= 2.1;
                ratioStart *= 1.15;
                ratioEnd *= 0.85; // slide pitch down as a moan
              }
            } else if (interjType === 'joy') {
              // Radosť: vyšší tón, rýchlejšie tempo
              ratioStart *= 1.30;
              ratioEnd *= 1.25;
              duration *= 0.72;
            } else if (interjType === 'fear') {
              // Strach: trasľavý hlas, pomalšie tempo
              duration *= 1.45;
              vibratoRateOverride = 17; // Hz vibrato laryngeal shaking
              vibratoDepthOverride = 1.2; // deep shake
              volumeOverride = 0.75; // soft / tense sound
            } else if (interjType === 'laughter') {
              // Smiech: vyslovovať po slabikách
              if (isVocalic(sym)) {
                duration *= 0.65;
                shouldAddLaughterPause = true;
              }
              ratioStart *= 1.22;
              ratioEnd *= 1.15;
            } else if (interjType === 'crying') {
              // Plač: predlžovať samohlásky
              if (isVocalic(sym)) {
                duration *= 1.85;
                ratioStart *= 1.05;
                ratioEnd *= 0.72; // sob down
              }
            } else if (interjType === 'animal') {
              // Zvuky zvierat: každú slabiku oddeliť
              if (isVocalic(sym)) {
                duration *= 0.85;
                shouldAddAnimalPause = true;
              }
            } else if (interjType === 'object') {
              // Zvuky predmetov: krátko a dôrazne
              duration *= 0.58;
              volumeOverride = 1.45;
              ratioStart *= 1.40;
              ratioEnd *= 0.82; // sharp impact pitch fall
            }
          }
          
          const pStart = voice.baseF0 * ratioStart;
          const pEnd = voice.baseF0 * ratioEnd;
          
          let targetPhoneme: PhonemeConfig | undefined;
          if (cfg.type === 'diphthong') {
            if (sym === 'ia') {
              targetPhoneme = SLOVAK_PHONEMES['a'];
              cfg.formants = SLOVAK_PHONEMES['i'].formants;
            } else if (sym === 'ie') {
              targetPhoneme = SLOVAK_PHONEMES['e'];
              cfg.formants = SLOVAK_PHONEMES['i'].formants;
            } else if (sym === 'iu') {
              targetPhoneme = SLOVAK_PHONEMES['u'];
              cfg.formants = SLOVAK_PHONEMES['i'].formants;
            } else if (sym === 'ô') {
              targetPhoneme = SLOVAK_PHONEMES['o'];
              cfg.formants = SLOVAK_PHONEMES['u'].formants;
            }
          }
          
          let pos = absolutePos;
          const origOffsets = (symbols as any).originalOffsets;
          if (origOffsets && winfo.symbolIndices && winfo.symbolIndices[j] !== undefined) {
            const symIdx = winfo.symbolIndices[j];
            if (origOffsets[symIdx] !== undefined) {
              pos = origOffsets[symIdx];
            }
          }

          segments.push({
            phoneme: cfg,
            customDuration: duration,
            pitchStart: pStart,
            pitchEnd: pEnd,
            isStressed,
            textPosition: pos,
            targetPhoneme,
            vibratoRateOverride,
            vibratoDepthOverride,
            volumeOverride
          });

          if (shouldAddLaughterPause) {
            const silentCfg = { ...SLOVAK_PHONEMES[' '] };
            segments.push({
              phoneme: silentCfg,
              customDuration: 60,
              pitchStart: voice.baseF0,
              pitchEnd: voice.baseF0,
              isStressed: false,
              textPosition: pos
            });
          } else if (shouldAddAnimalPause) {
            const silentCfg = { ...SLOVAK_PHONEMES[' '] };
            segments.push({
              phoneme: silentCfg,
              customDuration: 45,
              pitchStart: voice.baseF0,
              pitchEnd: voice.baseF0,
              isStressed: false,
              textPosition: pos
            });
          }
        }
        
        absolutePos += winfo.symbols.join('').length + 1;
      }
    }
  }

  return segments;
}

// Analyzes the text and counts useful metadata
export function analyzeSpeechStats(text: string, segments: PhonemeSegment[]): SpeechStats {
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const phonemeCount = segments.filter(s => s.phoneme.type !== 'silence').length;
  const totalDuration = segments.reduce((sum, s) => sum + s.customDuration, 0);

  // estimate syllables based on vocalic count
  let syllableCount = 0;
  for (const s of segments) {
    if (isVocalic(s.phoneme.symbol)) {
      syllableCount++;
    }
  }

  return {
    totalDuration: totalDuration / 1000, // in seconds
    wordCount,
    phonemeCount,
    syllableCount: syllableCount || Math.ceil(wordCount * 2) // fallback
  };
}
