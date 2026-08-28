import React from 'react';
import { VoiceConfig } from '../types';
import { Sliders, Volume2, Sparkles, HelpCircle } from 'lucide-react';

interface VoiceControlsProps {
  config: VoiceConfig;
  onChange: (config: VoiceConfig) => void;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({ config, onChange }) => {
  const updateProp = <K extends keyof VoiceConfig>(key: K, value: VoiceConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  const handleGenderChange = (gender: 'male' | 'female' | 'child') => {
    let baseF0 = 100;
    let formantShift = 1.0;
    let vibratoRate = 5.5;
    let vibratoDepth = 0.5;

    if (gender === 'female') {
      baseF0 = 175;
      formantShift = 1.15;
    } else if (gender === 'child') {
      baseF0 = 240;
      formantShift = 1.35;
      vibratoRate = 6.2;
    }

    onChange({
      ...config,
      gender,
      baseF0,
      formantShift,
      vibratoRate,
      vibratoDepth
    });
  };



  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
            <Sliders className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-slate-100 text-sm tracking-tight">Parametre Reči</h2>
            <p className="text-[11px] text-slate-400 font-mono">Úprava lokálneho akustického traktu</p>
          </div>
        </div>
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800/80">
          {(['male', 'female', 'child'] as const).map((g) => (
            <button
              key={g}
              id={`gender-${g}`}
              onClick={() => handleGenderChange(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                config.gender === g
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {g === 'male' && 'MUŽ'}
              {g === 'female' && 'ŽENA'}
              {g === 'child' && 'DIEŤA'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pitch F0 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300">
            <span>Základná výška (F0)</span>
            <span className="text-emerald-400 font-bold">{config.baseF0} Hz</span>
          </div>
          <input
            id="slider-base-f0"
            type="range"
            min="50"
            max="300"
            step="1"
            value={config.baseF0}
            onChange={(e) => updateProp('baseF0', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <span className="text-[10px] text-slate-400">
            Riadi frekvenciu kmitov hlasiviek. Vyššie hodnoty spôsobujú vyšší tón hlasu.
          </span>
        </div>

        {/* Speed */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300">
            <span>Rýchlosť reči</span>
            <span className="text-emerald-400 font-bold">{config.speed.toFixed(2)}x</span>
          </div>
          <input
            id="slider-speed"
            type="range"
            min="0.4"
            max="2.5"
            step="0.05"
            value={config.speed}
            onChange={(e) => updateProp('speed', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <span className="text-[10px] text-slate-400">
            Nelineárne skracuje/predlžuje dĺžku samohlások a prechodov v slabikách.
          </span>
        </div>

        {/* Formant Shift (Vocal tract scale) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300">
            <span>Geometria krku (Formant shift)</span>
            <span className="text-emerald-400 font-bold">{config.formantShift.toFixed(2)}x</span>
          </div>
          <input
            id="slider-formant-shift"
            type="range"
            min="0.5"
            max="1.8"
            step="0.02"
            value={config.formantShift}
            onChange={(e) => updateProp('formantShift', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <span className="text-[10px] text-slate-400">
            Zväčšuje/zmenšuje simulovaný rezonančný trakt, čo mení vnímanú veľkosť postavy.
          </span>
        </div>

        {/* Volume */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1"><Volume2 className="w-3.5 h-3.5 text-slate-400" /> Hlasitosť</span>
            <span className="text-emerald-400 font-bold">{Math.round(config.volume * 100)} %</span>
          </div>
          <input
            id="slider-volume"
            type="range"
            min="0"
            max="1.2"
            step="0.05"
            value={config.volume}
            onChange={(e) => updateProp('volume', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <span className="text-[10px] text-slate-400">
            Multiplikátor zisku pred hlavným diagnostickým výstupom.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Intonation Patterns */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Melodika a Intonácia reči</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {([
              { id: 'natural', label: 'Prirodzená', desc: 'Prízvuk na 1. slabike' },
              { id: 'animated', label: 'Hravá', desc: 'Kolísanie výšky hlasu' },
              { id: 'question', label: 'Otázka', desc: 'Stúpavá finálna kadencia' },
              { id: 'flat', label: 'Monotónna', desc: 'Rovný robotický tón' }
            ] as const).map((p) => (
              <button
                key={p.id}
                id={`intonation-${p.id}`}
                onClick={() => updateProp('intonationPattern', p.id)}
                className={`flex flex-col p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  config.intonationPattern === p.id
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-200'
                    : 'bg-slate-950 border-slate-800/80 hover:border-slate-700 text-slate-400'
                }`}
              >
                <span className="text-xs font-semibold">{p.label}</span>
                <span className="text-[9px] text-slate-400 mt-0.5">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Vibrato controls */}
        <div className="flex flex-col gap-3 justify-center">
          <div className="flex flex-col gap-1.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <h4 className="text-[11px] font-mono font-semibold text-slate-300 tracking-wide uppercase flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-emerald-400" /> Akustické Hlasivky (LFO Vibrato)
            </h4>
            <div className="grid grid-cols-2 gap-3 mt-1.5">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-mono">Frekvencia LFO</span>
                <input
                  id="vibrato-rate"
                  type="number"
                  min="2"
                  max="15"
                  step="0.1"
                  value={config.vibratoRate}
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
                  onChange={(e) => updateProp('vibratoRate', parseFloat(e.target.value) || 5)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-mono">Hĺbka kmitov</span>
                <input
                  id="vibrato-depth"
                  type="number"
                  min="0"
                  max="10"
                  step="0.05"
                  value={config.vibratoDepth}
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
                  onChange={(e) => updateProp('vibratoDepth', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

       {/* Humanization Effects Section */}
      <div className="border-t border-slate-800/80 pt-5 mt-2">
        <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Akustické poludštenie hlasu (Humanize FX)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Reverb Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span>Priestorová ozvena (Reverb)</span>
              <span className="text-emerald-400 font-bold">
                {config.reverbLevel !== undefined ? Math.round(config.reverbLevel * 100) : 15} %
              </span>
            </div>
            <input
              id="slider-reverb"
              type="range"
              min="0"
              max="0.8"
              step="0.05"
              value={config.reverbLevel !== undefined ? config.reverbLevel : 0.15}
              onChange={(e) => updateProp('reverbLevel', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <span className="text-[10px] text-slate-400">
              Pridá jemný dozvuk nahrávacej miestnosti vyvolávajúci realistický dojazd mikrofónu.
            </span>
          </div>

          {/* EQ Warmth Toggle */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span>Hrejivosť & Filter (Ekvalizácia EQ)</span>
              <button
                id="toggle-warmth-eq"
                onClick={() => updateProp('enableWarmthEQ', !config.enableWarmthEQ)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono transition-all border cursor-pointer ${
                  config.enableWarmthEQ !== false
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {config.enableWarmthEQ !== false ? 'AKTÍVNY' : 'VYPNUTÝ'}
              </button>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mt-1">
              <span className="text-[10px] text-slate-400 block leading-relaxed">
                Mierne orezáva príliš ostré kovové frekvencie nad 10 kHz a posilňuje tón stredového traktu (450 Hz) pre plnší, hrejivejší ľudský hlas.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Slovak Phonological Rules Section */}
      <div className="border-t border-slate-800/80 pt-5 mt-2">
        <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-emerald-400" />
          Slovenské hovorové & asimilačné procesy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Vowel Reduction Toggle */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span>Redukcia neprízvučných samohlások</span>
              <button
                id="toggle-vowel-reduction"
                onClick={() => updateProp('enableCasualReduction', !config.enableCasualReduction)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono transition-all border cursor-pointer ${
                  config.enableCasualReduction
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {config.enableCasualReduction ? 'ZAPNUTÁ' : 'VYPNUTÁ'}
              </button>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mt-1">
              <span className="text-[10px] text-slate-400 block leading-relaxed">
                V neformálnej reči oslabuje (redukuje) a o 30 % skracuje krátke samohlásky v bezprízvučných slabikách pre plynulejší rytmický tok.
              </span>
            </div>
          </div>

          {/* Elision & Epenthesis Toggle */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span>Hovorové spojenie slabík (Elidácia / Epentéza)</span>
              <button
                id="toggle-elision-epenthesis"
                onClick={() => updateProp('enableElision', !config.enableElision)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono transition-all border cursor-pointer ${
                  config.enableElision
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {config.enableElision ? 'ZAPNUTÉ' : 'VYPNUTÉ'}
              </button>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mt-1">
              <span className="text-[10px] text-slate-400 block leading-relaxed">
                Zjednodušuje ťažké skupiny spoluhlások (např. <em>jablko &rarr; japko</em>, <em>vtedy &rarr; fedy</em>) alebo vkladá spojovacie hlásky pre prirodzenejšiu výslovnosť.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
