import { PhonemeSegment, Formant } from '../types';
import { SLOVAK_PHONEMES } from './SlovakPhonetics';

export interface ConsonantBlueprint {
  ipa: string;
  articulation: string;
  assimilationRisk: string;
  diphones: string[];
  joinCostFactor: string;
  formantTable: {
    phase: string;
    f0: string;
    f1: string;
    f2: string;
    f3: string;
    f4: string;
    source: string;
    duration: string;
  }[];
  engineCode: string;
}

// Technical specs for slovak symbols
export const PHONETIC_SPEC_MAP: Record<string, {
  ipa: string;
  articulation: string;
  assimilation: string;
  diphonesTemplate: (prev: string, next: string) => string[];
  joinCost: string;
  phases: { phase: string; f0: string; f1: string; f2: string; f3: string; f4: string; source: string; duration: string; }[];
  codeTemplate: string;
}> = {
  // Plosives Unvoiced
  'p': {
    ipa: 'p',
    articulation: 'Bilabiálna okluzíva (perno-perná záverová hláska), neprepustená v úvodnej fázi uzáveru, s prudkou explóziou pri uvoľnení tlaku.',
    assimilation: 'Pred znelými spoluhláskami (b, d, g...) podlieha regresívnej asimilácii znelosti na znelé [b] (napr. "približne" -> [b]). Na konci slov pred pauzou ostáva neuznelá.',
    diphonesTemplate: (p, n) => [`[${p}-p] (ticho v uzávere)`, `[p-${n}] (plozívny ráz a prechod formantov)`],
    joinCost: 'Faktor oklúzie: 0.15; Stálosť fázy rozopnutia (spectral jump): strmý prechod tvarov formantového prechodu (F2-track bent).',
    phases: [
      { phase: 'Uzáver (Closure)', f0: '0 Hz', f1: '0 Hz', f2: '0 Hz', f3: '0 Hz', f4: '0 Hz', source: 'Ticho (Silence)', duration: '50 ms' },
      { phase: 'Explózia (Burst)', f0: '0 Hz', f1: '500 Hz (šum)', f2: '1100 Hz', f3: '2200 Hz', f4: '3500 Hz', source: 'Šum (Aperiodic)', duration: '10 ms' },
      { phase: 'Ašpirácia (Release)', f0: 'Sweep', f1: '600 Hz (stúp)', f2: '1200 Hz', f3: '2400 Hz', f4: '3600 Hz', source: 'Tranzitný šum / hmat', duration: '15 ms' }
    ],
    codeTemplate: `// Plosive [p] DSP Nodes
const gapNode = ctx.createGain();
gapNode.gain.setValueAtTime(0.001, tStart);
gapNode.gain.setValueAtTime(0.001, tStart + 0.050); // closure
const burstFilter = ctx.createBiquadFilter();
burstFilter.type = 'bandpass';
burstFilter.frequency.setValueAtTime(500, tStart + 0.050); // low cluster burst resonance
burstFilter.Q.setValueAtTime(0.8, tStart + 0.050);`
  },
  't': {
    ipa: 't',
    articulation: 'Alveodentálna okluzíva (ďasnovo-zubná záverová hláska). Jazyk vytvára tesný uzáver na hornom ďasnovom oblúku a zúbkoch.',
    assimilation: 'Pred znelými spoluhláskami sa asimiluje regresívne na znelé [d] (napr. "platba" -> [d]).',
    diphonesTemplate: (p, n) => [`[${p}-t] (kontaktné ticho)`, `[t-${n}] (koronálny burst a prechod formantov)`],
    joinCost: 'Faktor oklúzie: 0.18; Koronálny burst prechod (Join cost coefficient: 0.22 pri transientnom fázovom skoku).',
    phases: [
      { phase: 'Uzáver (Closure)', f0: '0 Hz', f1: '0 Hz', f2: '0 Hz', f3: '0 Hz', f4: '0 Hz', source: 'Ticho (Silence)', duration: '55 ms' },
      { phase: 'Explózia (Burst)', f0: '0 Hz', f1: '4500 Hz', f2: '3800 Hz', f3: '2900 Hz', f4: '4200 Hz', source: 'Vysokofrekvenčný šum', duration: '8 ms' },
      { phase: 'Ašpirácia (Release)', f0: 'Sweep', f1: '450 Hz', f2: '1600 Hz', f3: '2600 Hz', f4: '3900 Hz', source: 'Aperiodický prechod', duration: '17 ms' }
    ],
    codeTemplate: `// Plosive [t] DSP Nodes
const mainAmp = ctx.createGain();
mainAmp.gain.setValueAtTime(0.001, tStart);
mainAmp.gain.setValueAtTime(0.001, tStart + 0.055);
mainAmp.gain.linearRampToValueAtTime(1.0, tStart + 0.055 + 0.002); // sharp release
const highBurst = ctx.createBiquadFilter();
highBurst.type = 'highpass';
highBurst.frequency.value = 4500; // alveolar frication burst`
  },
  'ť': {
    ipa: 'c',
    articulation: 'Palatálna okluzíva (tvrdopatrová záverová nemekčená/mäkká hláska). Chrbát jazyka sa dotýka tvrdého podnebia (palatum).',
    assimilation: 'Pred znelými sa spodobuje na mäkké znelé [ď] (napr. "päťdesiat" -> [ď]).',
    diphonesTemplate: (p, n) => [`[${p}-ť] (palatálny uzáver)`, `[ť-${n}] (palatálna afrikácia a glide transient)`],
    joinCost: 'Lokus F2: ~2200 Hz. Join cost: 0.28 (vyžaduje dôslednú interpoláciu F2 na začiatku nasledujúceho vokálu).',
    phases: [
      { phase: 'Uzáver (Closure)', f0: '0 Hz', f1: '0 Hz', f2: '0 Hz', f3: '0 Hz', f4: '0 Hz', source: 'Ticho', duration: '60 ms' },
      { phase: 'Plózia (Burst)', f0: '0 Hz', f1: '3800 Hz', f2: '2800 Hz', f3: '3400 Hz', f4: '4500 Hz', source: 'Sibilant-like burst', duration: '12 ms' },
      { phase: 'Vokalizácia (Trans)', f0: 'Sweep', f1: '320 Hz', f2: '2100 Hz', f3: '2900 Hz', f4: '3900 Hz', source: 'Mixed Aperiodic + F2 path', duration: '13 ms' }
    ],
    codeTemplate: `// Palatal Plosive [ť] DSP Nodes
const f2Cap = ctx.createBiquadFilter();
f2Cap.type = 'bandpass';
f2Cap.frequency.setValueAtTime(2200, tStart + 0.060); // High F2 locus reflecting palatal articulation
f2Cap.Q.setValueAtTime(3.5, tStart + 0.060);`
  },
  'k': {
    ipa: 'k',
    articulation: 'Velárna okluzíva (mäkkopatrová záverová hláska). Chrbát jazyka vytvára uzáver pritlačením o mäkké podnebie (velum).',
    assimilation: 'Podlieha asimilácii na znelé [g] v znelom prostredí (napr. "k domu" -> [g]).',
    diphonesTemplate: (p, n) => [`[${p}-k] (velárny uzáver)`, `[k-${n}] (velárny burst s prechodom formantov)`],
    joinCost: 'Velar pinch (F2 a F3 sa k sebe približujú): 1600 Hz - 2000 Hz. Join cost factor: 0.19.',
    phases: [
      { phase: 'Uzáver', f0: '0 Hz', f1: '0 Hz', f2: '0 Hz', f3: '0 Hz', f4: '0 Hz', source: 'Ticho', duration: '55 ms' },
      { phase: 'Burst', f0: '0 Hz', f1: '1600 Hz', f2: '1600 Hz', f3: '2200 Hz', f4: '3600 Hz', source: 'Mstvý stredový šum', duration: '10 ms' },
      { phase: 'Tranzit', f0: 'Sweep', f1: '520 Hz', f2: '1500 Hz', f3: '2300 Hz', f4: '3500 Hz', source: 'Aperiodic drag', duration: '15 ms' }
    ],
    codeTemplate: `// Velar Plosive [k] DSP Nodes
const velarFilter = ctx.createBiquadFilter();
velarFilter.type = 'bandpass';
velarFilter.frequency.setValueAtTime(1600, tStart + 0.055); // Concentrated burst energy (velar pinch)
velarFilter.Q.setValueAtTime(1.8, tStart + 0.055);`
  },

  // Plosives Voiced
  'b': {
    ipa: 'b',
    articulation: 'Znelá bilabiálna okluzíva (perno-perná znelá záverová hláska). Hlasivky pracujú po celý čas uzáveru vytvárajúc tlmený hrdlový hrmot.',
    assimilation: 'Pred neznými spoluhláskami alebo na konci slov sa asimiluje regresívne na neznú párovú spoluhlásku [p] (napr. "dub" -> [p]).',
    diphonesTemplate: (p, n) => [`[${p}-b] (znelé potlačené hrdlo)`, `[b-${n}] (uvoľnenie s nízkym vokalickým poryvom)`],
    joinCost: 'Nízký register prechodu (F0-tracking). Join cost: 0.12. Práca s glottálnym pulzom.',
    phases: [
      { phase: 'Hlasivkový uzáver (Hum)', f0: '75 Hz', f1: '150 Hz (tlmené F1)', f2: '0 Hz', f3: '0 Hz', f4: '0 Hz', source: 'Hrtanový tón (Periodic)', duration: '50 ms' },
      { phase: 'Rozopnutie (Release)', f0: 'Pitch sweep', f1: '450 Hz', f2: '1000 Hz', f3: '2100 Hz', f4: '3300 Hz', source: 'Periodický + jemný ráz', duration: '25 ms' }
    ],
    codeTemplate: `// Voiced Plosive [b] Voice-Bar Node
const humOsc = ctx.createOscillator();
humOsc.type = 'sine';
humOsc.frequency.setValueAtTime(75, tStart); // voice bar hum 
const humGain = ctx.createGain();
humGain.gain.setValueAtTime(0.2, tStart);
humGain.gain.linearRampToValueAtTime(0.001, tStart + 0.050);`
  },
  'd': {
    ipa: 'd',
    articulation: 'Znelá alveodentálna okluzíva (ďasnovo-zubná znelá záverová hláska). Počas kontaktu jazyka s ďasnom pracuje laryngálny hlasivkový oscilátor.',
    assimilation: 'Na konci slova pred pauzou alebo pred neznými sa mení na neznú hlásku [t] (napr. "vchod" -> [t]).',
    diphonesTemplate: (p, n) => [`[${p}-d] (alveolárny d-hum)`, `[d-${n}] (koronálny release a prechod formantov)`],
    joinCost: 'Fokálny F2 prechod na 1600 Hz. Join cost: 0.16.',
    phases: [
      { phase: 'Hlasivkový uzáver', f0: '80 Hz', f1: '150 Hz', f2: '0 Hz', f3: '0 Hz', f4: '0 Hz', source: 'Hrdelný brum (Periodic)', duration: '55 ms' },
      { phase: 'Uvoľnenie (Release)', f0: 'Pitch sweep', f1: '450 Hz', f2: '1600 Hz', f3: '2500 Hz', f4: '3800 Hz', source: 'Mixed Periodic + Burst', duration: '25 ms' }
    ],
    codeTemplate: `// Voiced Plosive [d] Voice-Bar Node
const activeHum = ctx.createOscillator();
activeHum.type = 'sine';
activeHum.frequency.setValueAtTime(80, tStart);
const filterD = ctx.createBiquadFilter();
filterD.type = 'lowpass';
filterD.frequency.value = 180; // filter high frequencies of closure hum`
  },
  'ď': {
    ipa: 'ɟ',
    articulation: 'Znelá palatálna okluzíva (tvrdopatrová znelá mäkká záverová hláska). Hlasový trakt vykazuje pre-palatálne upevnenie.',
    assimilation: 'Pred neznými asimiluje na nemekčené alebo nezné [ť] (napr. "buďte" -> [ť]).',
    diphonesTemplate: (p, n) => [`[${p}-ď] (znelý palatálny brum)`, `[ď-${n}] (silný F2 sklz a palatálny prechod)`],
    joinCost: 'Formantový prechod (High F2 target ~2200Hz). Join cost factor: 0.22.',
    phases: [
      { phase: 'Hlasivkový uzáver', f0: '82 Hz', f1: '180 Hz', f2: '0 Hz', f3: '0 Hz', f4: '0 Hz', source: 'Periodic Low Hum', duration: '60 ms' },
      { phase: 'Uvoľnenie a Sklz', f0: 'Pitch sweep', f1: '320 Hz', f2: '2100 Hz', f3: '2800 Hz', f4: '3800 Hz', source: 'Periodic + F2 glide', duration: '25 ms' }
    ],
    codeTemplate: `// Palatal Voiced [ď] F2 Bend
const f2Filter = ctx.createBiquadFilter();
f2Filter.type = 'bandpass';
f2Filter.frequency.setValueAtTime(2100, tStart + 0.060); // Target palatal resonance
f2Filter.Q.setValueAtTime(3.0, tStart + 0.060);`
  },
  'g': {
    ipa: 'g',
    articulation: 'Znelá velárna okluzíva (mäkkopatrová znelá záverová hláska). Chrbát jazyka uzatvára velum s paralelným hlasivkovým budením.',
    assimilation: 'Pred neznými sa asimiluje regresívne na [k] (napr. "povedz mi, kde si" -> "kde" k-uzáver). Na konci slova asimiluje na [k].',
    diphonesTemplate: (p, n) => [`[${p}-g] (velárny hum)`, `[g-${n}] (stredový velar burst s prechodom formantov)`],
    joinCost: 'Fokus velárneho štípania (velar pinch F2-F3): 1500 - 1800 Hz. Join cost: 0.17.',
    phases: [
      { phase: 'Hlasivkový uzáver', f0: '78 Hz', f1: '140 Hz', f2: '0 Hz', f3: '0 Hz', f4: '0 Hz', source: 'Velar hum (Periodic)', duration: '55 ms' },
      { phase: 'Velárny Burst', f0: 'Pitch sweep', f1: '400 Hz', f2: '1400 Hz', f3: '2000 Hz', f4: '3400 Hz', source: 'Velar burst release', duration: '25 ms' }
    ],
    codeTemplate: `// Velar Voiced Plosive [g] closure
const closureHum = ctx.createOscillator();
closureHum.type = 'sine';
closureHum.frequency.value = 78;
const bpf = ctx.createBiquadFilter();
bpf.type = 'bandpass';
bpf.frequency.setValueAtTime(1400, tStart + 0.055);`
  },

  // Fricatives Unvoiced
  's': {
    ipa: 's',
    articulation: 'Alveolárna frikatíva (ďasnová úžinová nezná hláska). Tesná úžina medzi jazykom a horným ďasnom vyvoláva turbulentný šum prúdenia vzduchu.',
    assimilation: 'Pred znelými asimiluje regresívne na znelú hlásku [z] (napr. "s bratom" -> [z]).',
    diphonesTemplate: (p, n) => [`[${p}-s] (nábeh sykotu)`, `[s-${n}] (doznievanie a uvoľnenie úžiny)`],
    joinCost: 'Vysokofrekvenčný spektrálny zisk. Join cost: 0.14. Nezáleží na fáze, iba na amplitúde šumového spektra.',
    phases: [
      { phase: 'Nábeh a Frikatíva', f0: '0 Hz', f1: '6000 Hz (stred)', f2: 'N/A', f3: 'N/A', f4: 'N/A', source: 'Hustý turbul. šum', duration: '90 ms' }
    ],
    codeTemplate: `// Unvoiced Alveolar Fricative [s]
const sFilter = ctx.createBiquadFilter();
sFilter.type = 'bandpass';
sFilter.frequency.setValueAtTime(6000, tStart); // High frequency alveolar focus
sFilter.Q.setValueAtTime(1.5, tStart);`
  },
  'š': {
    ipa: 'ʃ',
    articulation: 'Postalveolárna (palatoalveolárna) frikatíva (zadnoďasnová úžinová nezná hláska). Šum je centrovaný nižšie než u [s] kvôli väčšiemu sublingválnemu priestoru.',
    assimilation: 'Pred znelými asimiluje na znelé [ž] (napr. "náš dedko" -> [ž]).',
    diphonesTemplate: (p, n) => [`[${p}-š] (postalveolárny šum)`, `[š-${n}] (sploštenie šumu k vokálu)`],
    joinCost: 'Spektrálny stred ~3200 Hz. Join cost: 0.15.',
    phases: [
      { phase: 'Frikatíva (Sustain)', f0: '0 Hz', f1: '3200 Hz (stred)', f2: 'N/A', f3: 'N/A', f4: 'N/A', source: 'Hlboký turbulentný šum', duration: '100 ms' }
    ],
    codeTemplate: `// Unvoiced Postalveolar Fricative [š]
const shFilter = ctx.createBiquadFilter();
shFilter.type = 'bandpass';
shFilter.frequency.setValueAtTime(3200, tStart); // Postalveolar resonance cavity
shFilter.Q.setValueAtTime(1.2, tStart);`
  },
  'f': {
    ipa: 'f',
    articulation: 'Labiodentálna frikatíva (perno-zubná úžinová nezná hláska). Úžina medzi spodnou perou a hornými zubami generuje menej rezonančný širokospektrálny šum.',
    assimilation: 'Pred znelými sa asimiluje regresívne na znelú hlásku [v] (napr. "šéf bol" -> [v]).',
    diphonesTemplate: (p, n) => [`[${p}-f] (mdlý labiálny šum)`, `[f-${n}] (tranzitný prechod k ústom)`],
    joinCost: 'Nízka energia šumu s plochým spektrom. Join cost coefficient: 0.10.',
    phases: [
      { phase: 'Labiálna frikcia', f0: '0 Hz', f1: '4000 Hz', f2: 'N/A', f3: 'N/A', f4: 'N/A', source: 'Slabý difúzny šum', duration: '85 ms' }
    ],
    codeTemplate: `// Unvoiced Labiodental Fricative [f]
const fFilter = ctx.createBiquadFilter();
fFilter.type = 'bandpass';
fFilter.frequency.setValueAtTime(4000, tStart); 
fFilter.Q.setValueAtTime(0.5, tStart); // Low Q for diffuse broad spectrum`
  },
  'ch': {
    ipa: 'x',
    articulation: 'Velárna frikatíva (mäkkopatrová úžinová nezná hláska). Úžina medzi chrbátom jazyka a velom generuje drsný, stredofrekvenčne posadený šum.',
    assimilation: 'Pred znelými asimiluje regresívne na znelý hrtanový párový ekvivalent [h] (napr. "suchý dvor" -> [h]).',
    diphonesTemplate: (p, n) => [`[${p}-ch] (drsný velárny šum)`, `[ch-${n}] (tranzit formantu F2)`],
    joinCost: 'Viazané na rezonanciu F2 / velárnu dutinu. Join cost: 0.18.',
    phases: [
      { phase: 'Velárna trecia fáza', f0: '0 Hz', f1: '1800 Hz', f2: 'N/A', f3: 'N/A', f4: 'N/A', source: 'Drsný rezonančný šum', duration: '110 ms' }
    ],
    codeTemplate: `// Velar Fricative [ch]
const chFilter = ctx.createBiquadFilter();
chFilter.type = 'bandpass';
chFilter.frequency.setValueAtTime(1800, tStart); // Low velar fricative resonance
chFilter.Q.setValueAtTime(2.0, tStart); // High selectiveness`
  },

  // Voiced Fricatives
  'z': {
    ipa: 'z',
    articulation: 'Znelá alveolárna frikatíva (ďasnová úžinová znelá hláska). Turbulencia alveolarneho šumu prebieha súbežne s vibráciou hlasiviek.',
    assimilation: 'Pred neznými alebo na konci slov sa asimiluje regresívne na neznú hlásku [s] (napr. "odviezť" -> [s]).',
    diphonesTemplate: (p, n) => [`[${p}-z] (miešaný znelý sykot)`, `[z-${n}] (plynulý prechod vibrácií do vokálu)`],
    joinCost: 'Fyzická zložka vibrácií larynx + šum. Join cost: 0.18.',
    phases: [
      { phase: 'Znelá frikatíva', f0: 'Pitch sweep', f1: '5500 Hz (šum)', f2: '280 Hz (larynx)', f3: '1600 Hz', f4: '2500 Hz', source: 'Miešaný (Periodic + Space Noise)', duration: '90 ms' }
    ],
    codeTemplate: `// Voiced Alveolar Fricative [z]
const noiseGainNode = ctx.createGain();
noiseGainNode.gain.setValueAtTime(0.65, tStart); // turbulent hiss
const voiceGainNode = ctx.createGain();
voiceGainNode.gain.setValueAtTime(0.35, tStart); // larynx fundamental vibrations`
  },
  'ž': {
    ipa: 'ʒ',
    articulation: 'Znelá postalveolárna frikatíva (zadnoďasnová úžinová znelá hláska). Hlas v krku rezonuje paralelne so šumom postalveolárnej dutiny.',
    assimilation: 'Na konci slov alebo pred neznými asimiluje regresívne na neznú hlásku [š] (napr. "muž" -> [š]).',
    diphonesTemplate: (p, n) => [`[${p}-ž] (znelý zadnoďasnový šum)`, `[ž-${n}] (vokalický sklz)`],
    joinCost: 'Pomer Periodic/Aperiodic: 40/60. Join cost factor: 0.17.',
    phases: [
      { phase: 'Znelá hlboká trecia', f0: 'Pitch sweep', f1: '3000 Hz (šum)', f2: '280 Hz (hlas)', f3: '1450 Hz', f4: '2400 Hz', source: 'Mixed Periodic + Noise', duration: '100 ms' }
    ],
    codeTemplate: `// Voiced Postalveolar Fricative [ž]
const bandFilter = ctx.createBiquadFilter();
bandFilter.type = 'bandpass';
bandFilter.frequency.setValueAtTime(3000, tStart); // Postalveolar focus
const splitVocal = ctx.createGain();
splitVocal.gain.setValueAtTime(0.35, tStart);`
  },
  'v': {
    ipa: 'v',
    articulation: 'Znelá labiodentálna frikatíva (perno-zubná znelá hláska). Hlasivky tónujú, kým vzduch plynule uniká cez labiodentálny kontakt.',
    assimilation: 'Pred neznými asimiluje na neznú hlásku [f] (napr. "včela" -> [f], "vstúpiť" -> [f]). Na konci slov pred pauzou sa mení na vokálny sklz [u]/[w] (napr. "otcov" -> [u]).',
    diphonesTemplate: (p, n) => [`[${p}-v] (retný klz)`, `[v-${n}] (formantová adaptácia k ústam)`],
    joinCost: 'Vysoká znelosť. Join cost factor: 0.11 (vysoká spektrálna koherencia).',
    phases: [
      { phase: 'Znelý retný dotyk', f0: 'Pitch sweep', f1: '2200 Hz (šum)', f2: '320 Hz (hlas)', f3: '1150 Hz', f4: '2450 Hz', source: 'Prevažne periodická s tichým fúkaním', duration: '80 ms' }
    ],
    codeTemplate: `// Voiced Labiodental Fricative [v] (or bilabial glide w)
const voiceHdr = ctx.createGain();
voiceHdr.gain.setValueAtTime(0.60, tStart); // High periodic voiced factor
const noiseHdr = ctx.createGain();
noiseHdr.gain.setValueAtTime(0.25, tStart); // soft turbulence friction`
  },
  'h': {
    ipa: 'ɦ',
    articulation: 'Znelá glotálna frikatíva (hlasivková úžinová znelá hláska). Hlasivky sú v postavení, kedy plynule kmitajú a zároveň prepúšťajú turbulentný prúd vzduchu cez glottálnu štrbinu.',
    assimilation: 'Na konci slova pred pauzou asimiluje regresívne na nezný ekvivalent [ch] (napr. "sneh" -> "snech").',
    diphonesTemplate: (p, n) => [`[${p}-h] (hlasivkové zrnenie)`, `[h-${n}] (vokálny šumový prechod)`],
    joinCost: 'Vokálne vibrácie s ašpiráciou. Join cost: 0.20.',
    phases: [
      { phase: 'Znelý šum / dech', f0: 'Pitch (voiced)', f1: '1100 Hz', f2: '300 Hz', f3: '1300 Hz', f4: '2350 Hz', source: 'Ašpirovaný periodický signál (Mixed)', duration: '95 ms' }
    ],
    codeTemplate: `// Voiced Glottal Fricative (Aspiration) [h]
const voicePath = ctx.createGain();
voicePath.gain.setValueAtTime(0.70, tStart); // Laryngeal tone dominates
const aspGain = ctx.createGain();
aspGain.gain.setValueAtTime(0.40, tStart); // Breath dispersion bypass`
  },

  // Liquids, Trills, Nasals (e.g. j, l, r, m, n)
  'r': {
    ipa: 'r',
    articulation: 'Alveolárny kmitavý sonant (ďasnová kmitavá hláska - trill). Konček jazyka (apex) kmitá v prúde vzduchu o horné alveoly, čomu zodpovedá prudká amplitúdová modulácia (2-3 kmity/taps).',
    assimilation: 'Sonant, nepodlieha znelostnému spodobovaniu, ale ako slabikotvorná hláska vykazuje silnú spektrálnu väzbu k obklopujúcim spoluhláskam.',
    diphonesTemplate: (p, n) => [`[${p}-r] (kontaktné klzy)`, `[r-${n}] (vibrujúca modulácia k vokálu)`],
    joinCost: 'Kmitavá diskontinuita fázy. Join cost coefficient: 0.32 (vysoký interpolárny dopyt).',
    phases: [
      { phase: 'Úvodný sklz', f0: 'Pitch target', f1: '450 Hz', f2: '1300 Hz', f3: '2300 Hz', f4: '3300 Hz', source: 'Sonórny (Periodic)', duration: '20 ms' },
      { phase: 'Kmity (Vibrato)', f0: 'AM Modulated', f1: '450 Hz', f2: '1300 Hz', f3: '2300 Hz', f4: '3300 Hz', source: 'Periodické kmitavé prerušenia', duration: '65 ms' },
      { phase: 'Uvoľnenie (Release)', f0: 'Vokalický tón', f1: '480 Hz', f2: '1320 Hz', f3: '2320 Hz', f4: '3300 Hz', source: 'Prechodový tón', duration: '15 ms' }
    ],
    codeTemplate: `// Alveolar Trill [r] (Tongue vibrating loops)
const trillGain = ctx.createGain();
const trillLfo = ctx.createOscillator();
trillLfo.type = 'triangle';
trillLfo.frequency.value = 25; // 25 Hz Slovak tap rate oscillation
const trillMod = ctx.createGain();
trillMod.gain.value = 0.45; // amplitude pulse depth
trillLfo.connect(trillMod);
trillMod.connect(trillGain.gain);`
  },
  'l': {
    ipa: 'l',
    articulation: 'Alveolárny laterálny aproximant (boková slabikotvorná alofóna). Prúdenie vzduchu obchádza boky jazyka, zatiaľ čo hrot sa opiera o horné ďasno.',
    assimilation: 'Sonant. Stabilný formantový profil s výraznými damping filtrami.',
    diphonesTemplate: (p, n) => [`[${p}-l] (laterálny nábeh)`, `[l-${n}] (laterálny prechod do úst)`],
    joinCost: 'Join cost: 0.12. Stabilná fáza znelosti, plynulé naviazanie.',
    phases: [
      { phase: 'Laterálny tón', f0: 'Pitch target', f1: '330 Hz', f2: '1050 Hz', f3: '2500 Hz', f4: '3400 Hz', source: 'Periodic (Damped resonance)', duration: '85 ms' }
    ],
    codeTemplate: `// Lateral Liquida [l] DSP Configuration
const lGain = ctx.createGain();
lGain.gain.setValueAtTime(0.75, tStart); // Damped vocal multiplier
// F1 and F2 are closer, reflecting lateral articulation
const filterL1 = ctx.createBiquadFilter();
filterL1.frequency.value = 330;`
  },
  'm': {
    ipa: 'm',
    articulation: 'Bilabiálna nazála (perno-perná nosová hláska). Mäkké podnebie (velum) klesá, čím otvára nosovú dutinu pri súčasnom plnom uzávere pier.',
    assimilation: 'Sonant. Mení sa na labiodentálne [ɱ] iba tesne pred labiodentálnym f, v (napr. "amfora").',
    diphonesTemplate: (p, n) => [`[${p}-m] (nazalizácia pier)`, `[m-${n}] (rozopnutie pier do vokalizácie)`],
    joinCost: 'Spektrálny prelom (Nasálový antiformant). Join cost: 0.10. Nízke frekvenčné straty.',
    phases: [
      { phase: 'Nosová rezonancia', f0: 'Pitch', f1: '280 Hz (silný)', f2: '1000 Hz (tlmený)', f3: '2200 Hz', f4: '3200 Hz', source: 'Nazalizovaný hrtanový tón', duration: '85 ms' }
    ],
    codeTemplate: `// Nasal Sonant [m] 
const mGain = ctx.createGain();
mGain.gain.setValueAtTime(0.75, tStart);
// Low nasal formant F1 is highly dominant, other formants are heavily damped
const filterM1 = ctx.createBiquadFilter();
filterM1.Q.value = 15; // sharp low nasal pole`
  },
  'n': {
    ipa: 'n',
    articulation: 'Alveolárna nazála (ďasnová nosová hláska). Jazyk robí uzáver na ďasne pri súčasne otvorenom nazálnom poru.',
    assimilation: 'Sonant. Pred velárnymi k, g sa asimiluje regresívne na velárnu nazálu [ŋ] (napr. "banka" -> [ŋ]).',
    diphonesTemplate: (p, n) => [`[${p}-n] (alveolárna nazalizácia)`, `[n-${n}] (uvoľnenie z ďasien)`],
    joinCost: 'Join cost: 0.11. Jemné premostenie fáz.',
    phases: [
      { phase: 'Nosový tón', f0: 'Pitch', f1: '280 Hz', f2: '1450 Hz', f3: '2200 Hz', f4: '3300 Hz', source: 'Periodic (Damped Velum)', duration: '85 ms' }
    ],
    codeTemplate: `// Alveolar Nasal [n]
const nGain = ctx.createGain();
nGain.gain.setValueAtTime(0.75, tStart);
const filterN2 = ctx.createBiquadFilter();
filterN2.frequency.value = 1450; // Nasal formant peak`
  }
};

// Generates phonetic breakdown logic dynamically
export function generateAcousticBlueprint(text: string, activeSegments: PhonemeSegment[]): ConsonantBlueprint[] {
  if (activeSegments.length === 0) return [];

  const blueprints: ConsonantBlueprint[] = [];

  activeSegments.forEach((seg, idx) => {
    const symbol = seg.phoneme.symbol;
    const type = seg.phoneme.type;

    // We focus on the Slovak Consonants (plosive, fricative, nasal, trill, glide)
    if (type !== 'vowel' && type !== 'diphthong' && type !== 'silence') {
      const prevSymbol = idx > 0 ? activeSegments[idx - 1].phoneme.symbol : 'sil';
      const nextSymbol = idx < activeSegments.length - 1 ? activeSegments[idx + 1].phoneme.symbol : 'sil';

      const spec = PHONETIC_SPEC_MAP[symbol];
      if (spec) {
        blueprints.push({
          ipa: `[${spec.ipa}]`,
          articulation: spec.articulation,
          assimilationRisk: spec.assimilation,
          diphones: spec.diphonesTemplate(prevSymbol, nextSymbol),
          joinCostFactor: spec.joinCost,
          formantTable: spec.phases.map(p => ({
            ...p,
            // Adjust duration dynamically to visual speed
            duration: p.phase.includes('Uzáver') || p.phase.includes('Hlasivkový')
              ? `${Math.round(parseInt(p.duration) / 1.0)} ms`
              : p.duration
          })),
          engineCode: spec.codeTemplate
        });
      } else {
        // Fallback for missing specification
        blueprints.push({
          ipa: `[${symbol}]`,
          articulation: `Slovenská spoluhláska typu: ${type.toUpperCase()}. Artikulovaná v lokálnom hrtanovom a ústnom trakte.`,
          assimilationRisk: `Asimiluje regresívne na základe bezprostredne nasledujúcich znelostných alebo neznelych spoluhlások.`,
          diphones: [`[${prevSymbol}-${symbol}]`, `[${symbol}-${nextSymbol}]`],
          joinCostFactor: `Faktor koherencie fázy: 0.20; Spektrálny koeficient premostenia v normatívnej dĺžke.`,
          formantTable: [
            {
              phase: 'Ustálená fáza (Steady)',
              f0: `${Math.round(seg.pitchStart)} Hz`,
              f1: seg.phoneme.formants ? `${seg.phoneme.formants[0].frequency} Hz` : 'N/A',
              f2: seg.phoneme.formants ? `${seg.phoneme.formants[1].frequency} Hz` : 'N/A',
              f3: seg.phoneme.formants ? `${seg.phoneme.formants[2].frequency} Hz` : 'N/A',
              f4: seg.phoneme.formants ? `${seg.phoneme.formants[3].frequency} Hz` : 'N/A',
              source: seg.phoneme.voicedGain ? 'Mixed Periodic/Noise' : 'Aperiodic Noise',
              duration: `${Math.round(seg.customDuration)} ms`
            }
          ],
          engineCode: `// Custom Consonant [${symbol}] configuration
const masterNode = ctx.createGain();
masterNode.gain.setValueAtTime(${seg.phoneme.voicedGain ?? 0.5}, tStart);`
        });
      }
    }
  });

  return blueprints;
}
