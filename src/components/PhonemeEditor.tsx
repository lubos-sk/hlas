import React, { useState } from 'react';
import { SLOVAK_PHONEMES } from '../synthesis/SlovakPhonetics';
import { PhonemeConfig, VoiceConfig, PhonemeSegment, DEFAULT_SIBILANTS } from '../types';
import { Play, Activity, Settings2, Sparkles } from 'lucide-react';
import { SlovakSpeechSynth } from '../synthesis/SpeechEngine';

interface PhonemeEditorProps {
  synth: SlovakSpeechSynth;
  voiceConfig: VoiceConfig;
  onChangeVoiceConfig?: (cfg: VoiceConfig) => void;
}

export const PhonemeEditor: React.FC<PhonemeEditorProps> = ({ synth, voiceConfig, onChangeVoiceConfig }) => {
  const [selectedPhoneme, setSelectedPhoneme] = useState<PhonemeConfig>(SLOVAK_PHONEMES['a']);
  const [customFormants, setCustomFormants] = useState<typeof SLOVAK_PHONEMES['a']['formants']>(
    JSON.parse(JSON.stringify(SLOVAK_PHONEMES['a'].formants || []))
  );

  const isSibilant = ['s', 'š', 'z', 'ž', 'c', 'č', 'dz', 'dž'].includes(selectedPhoneme.symbol);

  const sibConfig = voiceConfig.sibilants?.[selectedPhoneme.symbol] || {
    teethInfluence: 0.65,
    tonguePlacement: 0.0,
    tongueConstriction: 1.0,
  };

  const updateSibilantProp = (
    prop: 'teethInfluence' | 'tonguePlacement' | 'tongueConstriction',
    val: number
  ) => {
    if (!onChangeVoiceConfig) return;
    const sibilants = { ...(voiceConfig.sibilants || {}) };
    sibilants[selectedPhoneme.symbol] = {
      ...(sibilants[selectedPhoneme.symbol] || { teethInfluence: 0.65, tonguePlacement: 0.0, tongueConstriction: 1.0 }),
      [prop]: val
    };
    onChangeVoiceConfig({ ...voiceConfig, sibilants });
  };

  const resetSibilantConfig = () => {
    if (!onChangeVoiceConfig) return;
    const sibilants = { ...(voiceConfig.sibilants || {}) };
    const def = DEFAULT_SIBILANTS[selectedPhoneme.symbol] || { teethInfluence: 0.65, tonguePlacement: 0.0, tongueConstriction: 1.0 };
    sibilants[selectedPhoneme.symbol] = { ...def };
    onChangeVoiceConfig({ ...voiceConfig, sibilants });
  };

  const selectPhoneme = (key: string) => {
    const config = SLOVAK_PHONEMES[key];
    if (config) {
      setSelectedPhoneme(config);
      let newestFormants = config.formants;
      if (!newestFormants && config.type === 'vowel') {
        const mapping: Record<string, string> = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ý': 'y' };
        const shortBase = mapping[config.symbol] || 'a';
        newestFormants = SLOVAK_PHONEMES[shortBase]?.formants;
      }
      
      const formantsToSet = newestFormants ? JSON.parse(JSON.stringify(newestFormants)) : [];
      setCustomFormants(formantsToSet);

      // Play immediately on click
      const overCfg = { ...config };
      if (formantsToSet.length > 0) {
        overCfg.formants = formantsToSet;
      }
      playSinglePhoneme(overCfg, formantsToSet);
    }
  };

  const playSinglePhoneme = (cfg: PhonemeConfig, customF?: typeof SLOVAK_PHONEMES['a']['formants']) => {
    let resolvedCfg = { ...cfg };
    let targetPhoneme: PhonemeConfig | undefined;

    if (resolvedCfg.type === 'diphthong') {
      if (resolvedCfg.symbol === 'ia') {
        targetPhoneme = SLOVAK_PHONEMES['a'];
        resolvedCfg.formants = SLOVAK_PHONEMES['i'].formants;
      } else if (resolvedCfg.symbol === 'ie') {
        targetPhoneme = SLOVAK_PHONEMES['e'];
        resolvedCfg.formants = SLOVAK_PHONEMES['i'].formants;
      } else if (resolvedCfg.symbol === 'iu') {
        targetPhoneme = SLOVAK_PHONEMES['u'];
        resolvedCfg.formants = SLOVAK_PHONEMES['i'].formants;
      } else if (resolvedCfg.symbol === 'ô') {
        targetPhoneme = SLOVAK_PHONEMES['o'];
        resolvedCfg.formants = SLOVAK_PHONEMES['u'].formants;
      }
    } else if (!resolvedCfg.formants && resolvedCfg.type === 'vowel') {
      const mapping: Record<string, string> = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ý': 'y' };
      const shortBase = mapping[resolvedCfg.symbol] || 'a';
      resolvedCfg.formants = SLOVAK_PHONEMES[shortBase]?.formants;
    }

    const currentF = customF !== undefined ? customF : customFormants;

    // Override with custom formants if we edited them
    if (resolvedCfg.symbol === selectedPhoneme.symbol && currentF && currentF.length > 0) {
      resolvedCfg.formants = currentF;
    }

    const seg: PhonemeSegment = {
      phoneme: resolvedCfg,
      customDuration: resolvedCfg.baseDuration * 2.5 / voiceConfig.speed, // give some extra length for isolation
      pitchStart: voiceConfig.baseF0,
      pitchEnd: voiceConfig.baseF0,
      isStressed: true,
      textPosition: 0,
      targetPhoneme
    };

    // Synthesize as sound sequence
    synth.play([seg], voiceConfig);
  };

  const updateFormantFreq = (idx: number, freq: number) => {
    if (!customFormants) return;
    const next = [...customFormants];
    next[idx] = { ...next[idx], frequency: freq };
    setCustomFormants(next);
  };

  const updateFormantGain = (idx: number, gain: number) => {
    if (!customFormants) return;
    const next = [...customFormants];
    next[idx] = { ...next[idx], gain: gain };
    setCustomFormants(next);
  };

  // Group Slovak Phonemes for UI
  const groups = [
    {
      title: 'Krátke samohlásky (Vowels)',
      keys: ['a', 'ä', 'e', 'i', 'o', 'u', 'y']
    },
    {
      title: 'Dlhé samohlásky (Long)',
      keys: ['á', 'é', 'í', 'ó', 'ú', 'ý']
    },
    {
      title: 'Dvojhlásky (Diphthongs)',
      keys: ['ia', 'ie', 'iu', 'ô']
    },
    {
      title: 'Trené spoluhlásky (Fricatives)',
      keys: ['s', 'š', 'f', 'ch', 'z', 'ž', 'v', 'h']
    },
    {
      title: 'Záverové (Plosives)',
      keys: ['p', 't', 'ť', 'k', 'b', 'd', 'ď', 'g']
    },
    {
      title: 'Afrikáty / Polozáverové (Affricates)',
      keys: ['c', 'č', 'dz', 'dž']
    },
    {
      title: 'Nasály, Likvidy & Aproximanty (Nasals/Liquids/Glides)',
      keys: ['m', 'n', 'ň', 'l', 'ľ', 'r', 'ŕ', 'ĺ', 'j']
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
            <Activity className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-slate-100 text-sm tracking-tight">Laboratórium Foném</h2>
            <p className="text-[11px] text-slate-400 font-mono">Simulácia a ladenie jednotlivých zvukov</p>
          </div>
        </div>
        <span className="text-[10px] bg-slate-950 font-mono text-slate-400 border border-slate-800 px-2.5 py-1 rounded-lg">
          ZDROJ: Lokálny DSP Trakt
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Phoneme Grid Selection */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h3 className="font-sans font-medium text-xs text-slate-300 uppercase tracking-wider">Vyberte hlásku na výskum:</h3>
          
          <div className="flex flex-col gap-4.5">
            {groups.map((grp) => (
              <div key={grp.title} className="flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 font-mono">{grp.title}</span>
                <div className="flex flex-wrap gap-1.5">
                  {grp.keys.map((k) => {
                    const isSelected = selectedPhoneme.symbol === k;
                    return (
                      <button
                        key={k}
                        id={`phoneme-btn-${k}`}
                        onClick={() => selectPhoneme(k)}
                        className={`min-w-10 h-10 flex flex-col items-center justify-center rounded-xl font-mono font-semibold text-sm border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/10'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                        }`}
                      >
                        {k}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phoneme Specs & Modifiers */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg font-bold font-mono">
                {selectedPhoneme.symbol}
              </span>
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase">Fonéma: {selectedPhoneme.symbol}</h4>
                <p className="text-[10px] text-slate-400 font-mono capitalize">Typ: {selectedPhoneme.type}</p>
              </div>
            </div>
            
            <button
              id="btn-play-single-phoneme"
              onClick={() => playSinglePhoneme(selectedPhoneme)}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Prehrať hlásku
            </button>
          </div>

          {/* Formant frequency slider list (vowels and resonant sounds) */}
          {customFormants && customFormants.length > 0 ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-300 uppercase tracking-wide">
                <Settings2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Rezonančné formanty (Vlastné)</span>
              </div>
              
              <div className="flex flex-col gap-3.5">
                {customFormants.map((f, fIdx) => (
                  <div key={fIdx} className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                     <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                      <span>Frekvencia F{fIdx + 1}</span>
                      <span className="text-emerald-400 font-bold">{Math.round(f.frequency)} Hz</span>
                    </div>
                    <input
                      id={`formant-freq-${selectedPhoneme.symbol}-${fIdx}`}
                      type="range"
                      min={100 * (fIdx + 1)}
                      max={1200 * (fIdx + 1)}
                      step="5"
                      value={f.frequency}
                      onChange={(e) => updateFormantFreq(fIdx, parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mt-1">
                      <span>Zisk F{fIdx + 1}</span>
                      <span className="text-emerald-400 font-bold">{f.gain} dB</span>
                    </div>
                    <input
                      id={`formant-gain-${selectedPhoneme.symbol}-${fIdx}`}
                      type="range"
                      min="-30"
                      max="10"
                      step="1"
                      value={f.gain}
                      onChange={(e) => updateFormantGain(fIdx, parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : selectedPhoneme.type === 'fricative' ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sibilantný Šumový Generátor</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300">Stred šumu (Hz)</span>
                  <span className="text-emerald-400 font-bold">{selectedPhoneme.noiseFreq ?? 'Širokopásmový'} Hz</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300">Zisk šumu</span>
                  <span className="text-emerald-400 font-bold">{Math.round((selectedPhoneme.noiseGain ?? 0) * 100)} %</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300">Hlasivkový doprovod (Voicing)</span>
                  <span className="text-emerald-400 font-bold">{Math.round((selectedPhoneme.voicedGain ?? 0) * 100)} %</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-relaxed mt-2 p-2 bg-slate-950/60 rounded border border-slate-800/80">
                  Pri vnímaní syčivých hlások (`s`, `š`, `f`) akustický trakt smeruje stlačený vzduch cez zúžené rezonancie. Voiced-fricatives (`z`, `ž`) navyše rezonujú na základnom hrtanovom tóne (voiced gain).
                </div>
              </div>
            </div>
          ) : selectedPhoneme.type === 'plosive' ? (
            <div className="flex flex-col gap-3 font-mono text-xs">
              <span className="font-semibold text-slate-400 uppercase tracking-wider">Acoustic Burst Matrix</span>
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex flex-col gap-2 leading-relaxed text-slate-300 text-[11px]">
                <p><strong className="text-emerald-400 font-medium">Uzávierka (Gap):</strong> ~{Math.round(selectedPhoneme.baseDuration * 0.65)} ms uvoľneného ticha.</p>
                <p><strong className="text-emerald-400 font-medium">Hrdlový tón (Hum):</strong> {selectedPhoneme.voicedGain ? 'Aktívny (Muffled hum)' : 'Neaktívny (Silent)'}.</p>
                <p><strong className="text-emerald-400 font-medium font-mono">Výbušný Burst:</strong> Šumová explózia s rezonanciou na {selectedPhoneme.noiseFreq} Hz o dĺžke ~{Math.round(selectedPhoneme.baseDuration * 0.35)} ms.</p>
                <p className="text-[10px] text-slate-400 mt-2 italic">Tento tranzit zabezpečuje ostrý nábehový ráz (plosive attack) typický pre slovenské `p`, `t`, `k`, `b`, `d`, `g`.</p>
              </div>
            </div>
          ) : selectedPhoneme.type === 'affricate' ? (
            <div className="flex flex-col gap-3 font-mono text-xs">
              <span className="font-semibold text-slate-400 uppercase tracking-wider">Akustická Štruktúra (Afrikáta)</span>
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex flex-col gap-2.5 leading-relaxed text-slate-300 text-[11px]">
                <p><strong className="text-emerald-400 font-medium font-mono">Závera (Muted Closure):</strong> Krátky fázový útlm napodobňujúci záverovú fázu.</p>
                <p><strong className="text-emerald-400 font-medium font-mono">Uvoľňovací Burst šum:</strong> Rýchly výbuch plosívneho rázu prechádzajúci do syčivého šumu na {selectedPhoneme.noiseFreq} Hz.</p>
                <p><strong className="text-emerald-400 font-medium font-mono">Hlasivkový doprovod:</strong> {selectedPhoneme.voicedGain ? `Znelá afrikáta (${Math.round(selectedPhoneme.voicedGain * 100)}% hum)` : 'Neznelá afrikáta (Bezhlasná)'}.</p>
                <p className="border-t border-slate-850 pt-2 text-[10px] text-slate-400 mt-1 italic">
                  Afrikáty (polozáverové hlásky `c`, `č`, `dz`, `dž`) začínajú ako okluzíva a končia ako rýchla frikatíva s rovnakým miestom artikulácie.
                </p>
              </div>
            </div>
          ) : selectedPhoneme.type === 'diphthong' ? (
            <div className="flex flex-col gap-3 font-mono text-xs">
              <span className="font-semibold text-slate-400 uppercase tracking-wider">Prechod Formantov (Dvojhláska)</span>
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex flex-col gap-2 leading-relaxed text-slate-300 text-[11px]">
                <p>Dvojhlásky (`ia`, `ie`, `iu`, `ô`) sú v slovenskom jazyku tvorené plynulou zmenou polohy jazyka a otvorenia úst (synchrónny sklz).</p>
                <p><strong className="text-emerald-400">Začiatok sklzu:</strong> {selectedPhoneme.symbol === 'ô' ? 'Samohláska /u/' : 'Samohláska /i/'}</p>
                <p><strong className="text-emerald-400">Koniec sklzu:</strong> {selectedPhoneme.symbol === 'ia' ? '/a/' : selectedPhoneme.symbol === 'ie' ? '/e/' : selectedPhoneme.symbol === 'iu' ? '/u/' : '/o/'}</p>
                <p className="border-t border-slate-800 pt-2 text-[10px] text-slate-400 mt-1">
                  Počas syntézy Web Audio API v reálnom čase vykonáva <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">linearRampToValueAtTime</code> interpoláciu frekvencií a ziskov formantov F1, F2, F3 smerom k cieľovému vokálu!
                </p>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">Pre túto fonému sú použité strednopásmové tlmené formanty. Kliknite na prehrať hlásku pre vzorku.</div>
          )}

          {isSibilant && (
            <div className="flex flex-col gap-4 border-t border-slate-800/80 pt-4 mt-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Akustický Simulátor Traktu ({['s', 'z', 'c', 'dz'].includes(selectedPhoneme.symbol) ? 'Ostrá / Alveolárna' : 'Tupá / Postalveolárna'} Sykavka)</span>
                </div>
                <button
                  type="button"
                  id={`btn-reset-sib-${selectedPhoneme.symbol}`}
                  onClick={resetSibilantConfig}
                  className="text-[10px] text-emerald-400 hover:text-white transition-all font-mono font-bold uppercase border border-emerald-500/20 px-2.5 py-0.5 rounded bg-emerald-500/5 hover:bg-emerald-500/20 cursor-pointer"
                >
                  Obnoviť
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                {/* Teeth Influence */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                    <span>Odraz o zubné bariéry</span>
                    <span className="text-emerald-400 font-bold">{sibConfig.teethInfluence.toFixed(2)}x</span>
                  </div>
                  <input
                    id={`lab-slider-teeth-${selectedPhoneme.symbol}`}
                    type="range"
                    min="0.0"
                    max="1.5"
                    step="0.02"
                    value={sibConfig.teethInfluence}
                    onChange={(e) => updateSibilantProp('teethInfluence', parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-emerald-500"
                  />
                  <span className="text-[9px] text-slate-400 leading-normal">
                    Určuje ostrosť sypania a podiel trenia o hroty rezákov (hrebeňový šejper).
                  </span>
                </div>

                {/* Tongue Placement */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                    <span>Poloha jazyka (Predná/Zadná)</span>
                    <span className="text-emerald-400 font-bold">{sibConfig.tonguePlacement > 0 ? '+' : ''}{sibConfig.tonguePlacement.toFixed(2)}</span>
                  </div>
                  <input
                    id={`lab-slider-tongue-${selectedPhoneme.symbol}`}
                    type="range"
                    min="-1.0"
                    max="1.0"
                    step="0.02"
                    value={sibConfig.tonguePlacement}
                    onChange={(e) => updateSibilantProp('tonguePlacement', parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-emerald-500"
                  />
                  <span className="text-[9px] text-slate-400 leading-normal">
                    Posúva rezonancie (dental-alveolárna vpravo vs palato-alveolárna vľavo).
                  </span>
                </div>

                {/* Tongue Constriction */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                    <span>Zúženie rečového koryta</span>
                    <span className="text-emerald-400 font-bold">{sibConfig.tongueConstriction.toFixed(2)}x</span>
                  </div>
                  <input
                    id={`lab-slider-constriction-${selectedPhoneme.symbol}`}
                    type="range"
                    min="0.3"
                    max="2.5"
                    step="0.02"
                    value={sibConfig.tongueConstriction}
                    onChange={(e) => updateSibilantProp('tongueConstriction', parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-emerald-500"
                  />
                  <span className="text-[9px] text-slate-400 leading-normal">
                    Zužuje kanál prúdenia nad hrotom jazyka (faktor akosti Q). Vyššie = ostrejšia rezonancia.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
