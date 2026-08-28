import React from 'react';
import { AudioEffectsConfig } from '../types';
import { AudioEffectsEngine } from '../synthesis/AudioEffectsEngine';
import {
  Sliders,
  Volume2,
  Zap,
  Radio,
  Sparkles,
  Layers,
  Waves,
  Repeat,
  Compass,
  Cpu,
  Power,
  RotateCcw,
  CheckCircle2,
  Disc,
  Activity,
  Gauge
} from 'lucide-react';

interface EffectRackProps {
  effects: AudioEffectsConfig;
  onChange: (effects: AudioEffectsConfig) => void;
  onReset: () => void;
}

export const EffectRack: React.FC<EffectRackProps> = ({ effects, onChange, onReset }) => {
  const presets = AudioEffectsEngine.getPresets();

  const handleUpdate = <K extends keyof AudioEffectsConfig>(key: K, value: AudioEffectsConfig[K]) => {
    onChange({
      ...effects,
      [key]: value
    });
  };

  const handleModuleUpdate = <K extends keyof AudioEffectsConfig, SK extends keyof AudioEffectsConfig[K]>(
    moduleKey: K,
    subKey: SK,
    val: any
  ) => {
    onChange({
      ...effects,
      [moduleKey]: {
        ...(effects[moduleKey] as any),
        [subKey]: val
      }
    });
  };

  const applyPreset = (presetKey: string) => {
    if (presets[presetKey]) {
      onChange(JSON.parse(JSON.stringify(presets[presetKey].config)));
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
      {/* Top Rack Header & Master Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/5">
            <Sliders className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-slate-100 text-sm tracking-wide uppercase">
                Zvukový Effect Rack & DSP Procesor
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
                12 DSP Modulov
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Modulárna efektová rack jednotka aplikovaná v reálnom čase na výstupný zvuk
            </p>
          </div>
        </div>

        {/* Master Controls & Presets */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Preset selector */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px] font-medium text-slate-400">Predvoľby:</span>
            <select
              aria-label="Výber predvoľby efektov"
              onChange={(e) => applyPreset(e.target.value)}
              defaultValue=""
              className="bg-transparent text-xs font-semibold text-emerald-400 outline-none cursor-pointer pr-1"
            >
              <option value="" disabled className="bg-slate-900 text-slate-400">
                Vybrať preset...
              </option>
              {Object.entries(presets).map(([key, item]) => (
                <option key={key} value={key} className="bg-slate-900 text-slate-200">
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Master Volume */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <span className="text-[11px] font-medium text-slate-400">Master:</span>
            <input
              type="range"
              min="0"
              max="2.0"
              step="0.05"
              value={effects.masterGain}
              onChange={(e) => handleUpdate('masterGain', parseFloat(e.target.value))}
              className="w-16 sm:w-20 accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] font-mono text-slate-200 min-w-[32px]">
              {Math.round(effects.masterGain * 100)}%
            </span>
          </div>

          {/* Master Bypass Toggle */}
          <button
            onClick={() => handleUpdate('masterBypass', !effects.masterBypass)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
              effects.masterBypass
                ? 'bg-rose-950/40 border-rose-500/50 text-rose-400'
                : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {effects.masterBypass ? 'Bypass (Vypnuté)' : 'FX Aktívne'}
          </button>

          {/* Reset button */}
          <button
            onClick={onReset}
            title="Resetovať všetky efekty na predvolené hodnoty"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium cursor-pointer transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Grid of Modular Effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* 1. EQUALIZER (3-Band Parametric EQ) */}
        <EffectCard
          title="3-Pásmový Parametrický EQ"
          icon={<Sliders className="w-4 h-4" />}
          enabled={effects.eq.enabled}
          onToggle={(val) => handleModuleUpdate('eq', 'enabled', val)}
          color="emerald"
        >
          <div className="flex flex-col gap-3">
            <SliderRow
              label="Basy (Low Shelf)"
              value={`${effects.eq.lowGain > 0 ? '+' : ''}${effects.eq.lowGain.toFixed(1)} dB`}
              min={-18}
              max={18}
              step={0.5}
              current={effects.eq.lowGain}
              onChange={(v) => handleModuleUpdate('eq', 'lowGain', v)}
            />
            <SliderRow
              label="Basy frekvencia"
              value={`${effects.eq.lowFreq} Hz`}
              min={60}
              max={400}
              step={10}
              current={effects.eq.lowFreq}
              onChange={(v) => handleModuleUpdate('eq', 'lowFreq', v)}
            />
            <SliderRow
              label="Stredy (Mid Peak)"
              value={`${effects.eq.midGain > 0 ? '+' : ''}${effects.eq.midGain.toFixed(1)} dB`}
              min={-18}
              max={18}
              step={0.5}
              current={effects.eq.midGain}
              onChange={(v) => handleModuleUpdate('eq', 'midGain', v)}
            />
            <SliderRow
              label="Stredy frekvencia"
              value={`${effects.eq.midFreq} Hz`}
              min={400}
              max={5000}
              step={50}
              current={effects.eq.midFreq}
              onChange={(v) => handleModuleUpdate('eq', 'midFreq', v)}
            />
            <SliderRow
              label="Výšky (High Shelf)"
              value={`${effects.eq.highGain > 0 ? '+' : ''}${effects.eq.highGain.toFixed(1)} dB`}
              min={-18}
              max={18}
              step={0.5}
              current={effects.eq.highGain}
              onChange={(v) => handleModuleUpdate('eq', 'highGain', v)}
            />
            <SliderRow
              label="Výšky frekvencia"
              value={`${effects.eq.highFreq} Hz`}
              min={2500}
              max={12000}
              step={100}
              current={effects.eq.highFreq}
              onChange={(v) => handleModuleUpdate('eq', 'highFreq', v)}
            />
          </div>
        </EffectCard>

        {/* 2. DISTORTION & SATURATION */}
        <EffectCard
          title="Distortion & Saturácia"
          icon={<Zap className="w-4 h-4" />}
          enabled={effects.distortion.enabled}
          onToggle={(val) => handleModuleUpdate('distortion', 'enabled', val)}
          color="amber"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Charakter</span>
              <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {(['warm', 'overdrive', 'fuzz', 'hard'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleModuleUpdate('distortion', 'type', t)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase transition-all ${
                      effects.distortion.type === t
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t === 'warm' ? 'Lampa' : t === 'overdrive' ? 'Drive' : t === 'fuzz' ? 'Fuzz' : 'Clip'}
                  </button>
                ))}
              </div>
            </div>

            <SliderRow
              label="Drive (Zosilnenie)"
              value={`${effects.distortion.drive}`}
              min={1}
              max={100}
              step={1}
              current={effects.distortion.drive}
              onChange={(v) => handleModuleUpdate('distortion', 'drive', v)}
            />
            <SliderRow
              label="Tón (Lowpass Filter)"
              value={`${effects.distortion.tone} Hz`}
              min={800}
              max={10000}
              step={100}
              current={effects.distortion.tone}
              onChange={(v) => handleModuleUpdate('distortion', 'tone', v)}
            />
            <SliderRow
              label="Dry / Wet Pomer"
              value={`${Math.round(effects.distortion.mix * 100)}%`}
              min={0}
              max={1}
              step={0.02}
              current={effects.distortion.mix}
              onChange={(v) => handleModuleUpdate('distortion', 'mix', v)}
            />
          </div>
        </EffectCard>

        {/* 3. BITCRUSHER & LO-FI QUANTIZER */}
        <EffectCard
          title="Bitcrusher & 8-Bit Lo-Fi"
          icon={<Cpu className="w-4 h-4" />}
          enabled={effects.bitcrusher.enabled}
          onToggle={(val) => handleModuleUpdate('bitcrusher', 'enabled', val)}
          color="cyan"
        >
          <div className="flex flex-col gap-3">
            <SliderRow
              label="Bitová hĺbka"
              value={`${effects.bitcrusher.bits} bitov`}
              min={2}
              max={16}
              step={1}
              current={effects.bitcrusher.bits}
              onChange={(v) => handleModuleUpdate('bitcrusher', 'bits', v)}
            />
            <SliderRow
              label="Downsampling faktor"
              value={`${effects.bitcrusher.downsample}x`}
              min={1}
              max={16}
              step={1}
              current={effects.bitcrusher.downsample}
              onChange={(v) => handleModuleUpdate('bitcrusher', 'downsample', v)}
            />
            <SliderRow
              label="Dry / Wet Pomer"
              value={`${Math.round(effects.bitcrusher.mix * 100)}%`}
              min={0}
              max={1}
              step={0.02}
              current={effects.bitcrusher.mix}
              onChange={(v) => handleModuleUpdate('bitcrusher', 'mix', v)}
            />
          </div>
        </EffectCard>

        {/* 4. LO-FI CHARACTER FILTERS */}
        <EffectCard
          title="Lo-Fi Filtre & Zariadenia"
          icon={<Radio className="w-4 h-4" />}
          enabled={effects.loFiFilter.enabled}
          onToggle={(val) => handleModuleUpdate('loFiFilter', 'enabled', val)}
          color="rose"
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-400 font-medium">Režim zariadenia:</span>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px]">
                {[
                  { id: 'telephone', label: 'Telefón 1930' },
                  { id: 'megaphone', label: 'Megafón' },
                  { id: 'walkie', label: 'Vysielačka' },
                  { id: 'vinyl', label: 'Gramofón' },
                  { id: 'radio', label: 'AM Rádio' },
                  { id: 'underwater', label: 'Pod vodou' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleModuleUpdate('loFiFilter', 'type', item.id as any)}
                    className={`py-1 px-1.5 rounded font-medium text-center transition-all truncate ${
                      effects.loFiFilter.type === item.id
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <SliderRow
              label="Intenzita filtra"
              value={`${Math.round(effects.loFiFilter.intensity * 100)}%`}
              min={0.1}
              max={1.0}
              step={0.05}
              current={effects.loFiFilter.intensity}
              onChange={(v) => handleModuleUpdate('loFiFilter', 'intensity', v)}
            />
            <SliderRow
              label="Dry / Wet Pomer"
              value={`${Math.round(effects.loFiFilter.mix * 100)}%`}
              min={0}
              max={1}
              step={0.02}
              current={effects.loFiFilter.mix}
              onChange={(v) => handleModuleUpdate('loFiFilter', 'mix', v)}
            />
          </div>
        </EffectCard>

        {/* 5. PITCH HARMONIZER & ROBOT VOCODER */}
        <EffectCard
          title="Harmonizér & Robot Vocoder"
          icon={<Cpu className="w-4 h-4" />}
          enabled={effects.pitchHarmonizer.enabled}
          onToggle={(val) => handleModuleUpdate('pitchHarmonizer', 'enabled', val)}
          color="indigo"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-300 font-medium">Monotónny robotický tón</span>
              <button
                onClick={() =>
                  handleModuleUpdate('pitchHarmonizer', 'robotMonotone', !effects.pitchHarmonizer.robotMonotone)
                }
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  effects.pitchHarmonizer.robotMonotone
                    ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
                    : 'bg-slate-900 border border-slate-700 text-slate-400'
                }`}
              >
                {effects.pitchHarmonizer.robotMonotone ? 'ZAPNUTÉ' : 'VYPNUTÉ'}
              </button>
            </div>

            <SliderRow
              label="Sub-oktáva (-12 poltónov)"
              value={`${Math.round(effects.pitchHarmonizer.subHarmonic * 100)}%`}
              min={0}
              max={1}
              step={0.05}
              current={effects.pitchHarmonizer.subHarmonic}
              onChange={(v) => handleModuleUpdate('pitchHarmonizer', 'subHarmonic', v)}
            />
            <SliderRow
              label="5. Harmonická (+7 poltónov)"
              value={`${Math.round(effects.pitchHarmonizer.fifthHarmonic * 100)}%`}
              min={0}
              max={1}
              step={0.05}
              current={effects.pitchHarmonizer.fifthHarmonic}
              onChange={(v) => handleModuleUpdate('pitchHarmonizer', 'fifthHarmonic', v)}
            />
            <SliderRow
              label="Dry / Wet Pomer"
              value={`${Math.round(effects.pitchHarmonizer.mix * 100)}%`}
              min={0}
              max={1}
              step={0.02}
              current={effects.pitchHarmonizer.mix}
              onChange={(v) => handleModuleUpdate('pitchHarmonizer', 'mix', v)}
            />
          </div>
        </EffectCard>

        {/* 6. CHORUS */}
        <EffectCard
          title="Multi-Voice Chorus"
          icon={<Waves className="w-4 h-4" />}
          enabled={effects.chorus.enabled}
          onToggle={(val) => handleModuleUpdate('chorus', 'enabled', val)}
          color="teal"
        >
          <div className="flex flex-col gap-3">
            <SliderRow
              label="Rýchlosť modulácie (Rate)"
              value={`${effects.chorus.rate.toFixed(1)} Hz`}
              min={0.1}
              max={8.0}
              step={0.1}
              current={effects.chorus.rate}
              onChange={(v) => handleModuleUpdate('chorus', 'rate', v)}
            />
            <SliderRow
              label="Hĺbka (Depth)"
              value={`${effects.chorus.depth.toFixed(1)} ms`}
              min={0.5}
              max={10.0}
              step={0.5}
              current={effects.chorus.depth}
              onChange={(v) => handleModuleUpdate('chorus', 'depth', v)}
            />
            <SliderRow
              label="Spätná väzba (Feedback)"
              value={`${Math.round(effects.chorus.feedback * 100)}%`}
              min={0}
              max={0.8}
              step={0.05}
              current={effects.chorus.feedback}
              onChange={(v) => handleModuleUpdate('chorus', 'feedback', v)}
            />
            <SliderRow
              label="Dry / Wet Pomer"
              value={`${Math.round(effects.chorus.mix * 100)}%`}
              min={0}
              max={1}
              step={0.02}
              current={effects.chorus.mix}
              onChange={(v) => handleModuleUpdate('chorus', 'mix', v)}
            />
          </div>
        </EffectCard>

        {/* 7. FLANGER & PHASER */}
        <EffectCard
          title="Flanger / Phaser"
          icon={<Disc className="w-4 h-4" />}
          enabled={effects.flangerPhaser.enabled}
          onToggle={(val) => handleModuleUpdate('flangerPhaser', 'enabled', val)}
          color="violet"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Režim</span>
              <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => handleModuleUpdate('flangerPhaser', 'mode', 'flanger')}
                  className={`px-3 py-0.5 rounded text-[11px] font-semibold uppercase transition-all ${
                    effects.flangerPhaser.mode === 'flanger'
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Flanger
                </button>
                <button
                  onClick={() => handleModuleUpdate('flangerPhaser', 'mode', 'phaser')}
                  className={`px-3 py-0.5 rounded text-[11px] font-semibold uppercase transition-all ${
                    effects.flangerPhaser.mode === 'phaser'
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Phaser
                </button>
              </div>
            </div>

            <SliderRow
              label="Rýchlosť LFO (Rate)"
              value={`${effects.flangerPhaser.rate.toFixed(2)} Hz`}
              min={0.1}
              max={5.0}
              step={0.05}
              current={effects.flangerPhaser.rate}
              onChange={(v) => handleModuleUpdate('flangerPhaser', 'rate', v)}
            />
            <SliderRow
              label="Spätná väzba (Feedback)"
              value={`${Math.round(effects.flangerPhaser.feedback * 100)}%`}
              min={0}
              max={0.9}
              step={0.02}
              current={effects.flangerPhaser.feedback}
              onChange={(v) => handleModuleUpdate('flangerPhaser', 'feedback', v)}
            />
            <SliderRow
              label="Dry / Wet Pomer"
              value={`${Math.round(effects.flangerPhaser.mix * 100)}%`}
              min={0}
              max={1}
              step={0.02}
              current={effects.flangerPhaser.mix}
              onChange={(v) => handleModuleUpdate('flangerPhaser', 'mix', v)}
            />
          </div>
        </EffectCard>

        {/* 8. DELAY / ECHO */}
        <EffectCard
          title="Echo & Stereo Delay"
          icon={<Repeat className="w-4 h-4" />}
          enabled={effects.delay.enabled}
          onToggle={(val) => handleModuleUpdate('delay', 'enabled', val)}
          color="blue"
        >
          <div className="flex flex-col gap-3">
            <SliderRow
              label="Čas oneskorenia (Time)"
              value={`${effects.delay.time} ms`}
              min={20}
              max={800}
              step={10}
              current={effects.delay.time}
              onChange={(v) => handleModuleUpdate('delay', 'time', v)}
            />
            <SliderRow
              label="Opakovanie (Feedback)"
              value={`${Math.round(effects.delay.feedback * 100)}%`}
              min={0}
              max={0.85}
              step={0.02}
              current={effects.delay.feedback}
              onChange={(v) => handleModuleUpdate('delay', 'feedback', v)}
            />
            <SliderRow
              label="Tlmenie výšok (Damping)"
              value={`${effects.delay.damping} Hz`}
              min={800}
              max={8000}
              step={100}
              current={effects.delay.damping}
              onChange={(v) => handleModuleUpdate('delay', 'damping', v)}
            />
            <SliderRow
              label="Dry / Wet Pomer"
              value={`${Math.round(effects.delay.mix * 100)}%`}
              min={0}
              max={1}
              step={0.02}
              current={effects.delay.mix}
              onChange={(v) => handleModuleUpdate('delay', 'mix', v)}
            />
          </div>
        </EffectCard>

        {/* 9. REVERB RACK */}
        <EffectCard
          title="Priestorový Reverb Rack"
          icon={<Layers className="w-4 h-4" />}
          enabled={effects.reverb.enabled}
          onToggle={(val) => handleModuleUpdate('reverb', 'enabled', val)}
          color="emerald"
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-400 font-medium">Typ priestoru:</span>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px]">
                {[
                  { id: 'room', label: 'Izba (Room)' },
                  { id: 'hall', label: 'Sála (Hall)' },
                  { id: 'cathedral', label: 'Katedrála' },
                  { id: 'plate', label: 'Plate' },
                  { id: 'cosmic', label: 'Kozmos' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleModuleUpdate('reverb', 'type', item.id as any)}
                    className={`py-1 px-1 rounded font-medium text-center transition-all truncate ${
                      effects.reverb.type === item.id
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <SliderRow
              label="Dĺžka dozvuku (Decay)"
              value={`${effects.reverb.decay.toFixed(1)} s`}
              min={0.3}
              max={6.0}
              step={0.1}
              current={effects.reverb.decay}
              onChange={(v) => handleModuleUpdate('reverb', 'decay', v)}
            />
            <SliderRow
              label="Tlmenie (Damping)"
              value={`${Math.round(effects.reverb.damping * 100)}%`}
              min={0}
              max={1.0}
              step={0.05}
              current={effects.reverb.damping}
              onChange={(v) => handleModuleUpdate('reverb', 'damping', v)}
            />
            <SliderRow
              label="Dry / Wet Pomer"
              value={`${Math.round(effects.reverb.mix * 100)}%`}
              min={0}
              max={1}
              step={0.02}
              current={effects.reverb.mix}
              onChange={(v) => handleModuleUpdate('reverb', 'mix', v)}
            />
          </div>
        </EffectCard>

        {/* 10. TREMOLO & RING MODULATOR */}
        <EffectCard
          title="Tremolo & Ring Modulátor"
          icon={<Activity className="w-4 h-4" />}
          enabled={effects.tremoloRingMod.enabled}
          onToggle={(val) => handleModuleUpdate('tremoloRingMod', 'enabled', val)}
          color="orange"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Režim</span>
              <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => handleModuleUpdate('tremoloRingMod', 'mode', 'tremolo')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase transition-all ${
                    effects.tremoloRingMod.mode === 'tremolo'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tremolo
                </button>
                <button
                  onClick={() => handleModuleUpdate('tremoloRingMod', 'mode', 'ringmod')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase transition-all ${
                    effects.tremoloRingMod.mode === 'ringmod'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Ring Mod
                </button>
              </div>
            </div>

            <SliderRow
              label="Frekvencia modulácie"
              value={`${effects.tremoloRingMod.rate.toFixed(1)} Hz`}
              min={0.5}
              max={effects.tremoloRingMod.mode === 'ringmod' ? 300 : 25}
              step={0.5}
              current={effects.tremoloRingMod.rate}
              onChange={(v) => handleModuleUpdate('tremoloRingMod', 'rate', v)}
            />
            <SliderRow
              label="Hĺbka (Depth)"
              value={`${Math.round(effects.tremoloRingMod.depth * 100)}%`}
              min={0}
              max={1.0}
              step={0.02}
              current={effects.tremoloRingMod.depth}
              onChange={(v) => handleModuleUpdate('tremoloRingMod', 'depth', v)}
            />
            <SliderRow
              label="Dry / Wet Pomer"
              value={`${Math.round(effects.tremoloRingMod.mix * 100)}%`}
              min={0}
              max={1}
              step={0.02}
              current={effects.tremoloRingMod.mix}
              onChange={(v) => handleModuleUpdate('tremoloRingMod', 'mix', v)}
            />
          </div>
        </EffectCard>

        {/* 11. AUTO-WAH */}
        <EffectCard
          title="Dynamický Auto-Wah"
          icon={<Compass className="w-4 h-4" />}
          enabled={effects.autoWah.enabled}
          onToggle={(val) => handleModuleUpdate('autoWah', 'enabled', val)}
          color="pink"
        >
          <div className="flex flex-col gap-3">
            <SliderRow
              label="Základná frekvencia"
              value={`${effects.autoWah.baseFreq} Hz`}
              min={150}
              max={1500}
              step={20}
              current={effects.autoWah.baseFreq}
              onChange={(v) => handleModuleUpdate('autoWah', 'baseFreq', v)}
            />
            <SliderRow
              label="Rozsah sweepu"
              value={`${effects.autoWah.sweepRange} Hz`}
              min={200}
              max={3000}
              step={50}
              current={effects.autoWah.sweepRange}
              onChange={(v) => handleModuleUpdate('autoWah', 'sweepRange', v)}
            />
            <SliderRow
              label="Rýchlosť (Speed)"
              value={`${effects.autoWah.speed.toFixed(1)} Hz`}
              min={0.2}
              max={8.0}
              step={0.1}
              current={effects.autoWah.speed}
              onChange={(v) => handleModuleUpdate('autoWah', 'speed', v)}
            />
            <SliderRow
              label="Rezonancia (Q)"
              value={`${effects.autoWah.resonance.toFixed(1)}`}
              min={1.0}
              max={15.0}
              step={0.5}
              current={effects.autoWah.resonance}
              onChange={(v) => handleModuleUpdate('autoWah', 'resonance', v)}
            />
            <SliderRow
              label="Dry / Wet Pomer"
              value={`${Math.round(effects.autoWah.mix * 100)}%`}
              min={0}
              max={1}
              step={0.02}
              current={effects.autoWah.mix}
              onChange={(v) => handleModuleUpdate('autoWah', 'mix', v)}
            />
          </div>
        </EffectCard>

        {/* 12. DYNAMICS COMPRESSOR */}
        <EffectCard
          title="Štúdiový Kompresor & Limiter"
          icon={<Gauge className="w-4 h-4" />}
          enabled={effects.compressor.enabled}
          onToggle={(val) => handleModuleUpdate('compressor', 'enabled', val)}
          color="yellow"
        >
          <div className="flex flex-col gap-3">
            <SliderRow
              label="Threshold (Prah)"
              value={`${effects.compressor.threshold} dB`}
              min={-40}
              max={0}
              step={1}
              current={effects.compressor.threshold}
              onChange={(v) => handleModuleUpdate('compressor', 'threshold', v)}
            />
            <SliderRow
              label="Ratio (Pomer)"
              value={`${effects.compressor.ratio.toFixed(1)}:1`}
              min={1}
              max={20}
              step={0.5}
              current={effects.compressor.ratio}
              onChange={(v) => handleModuleUpdate('compressor', 'ratio', v)}
            />
            <SliderRow
              label="Attack"
              value={`${effects.compressor.attack} ms`}
              min={1}
              max={100}
              step={1}
              current={effects.compressor.attack}
              onChange={(v) => handleModuleUpdate('compressor', 'attack', v)}
            />
            <SliderRow
              label="Release"
              value={`${effects.compressor.release} ms`}
              min={10}
              max={500}
              step={10}
              current={effects.compressor.release}
              onChange={(v) => handleModuleUpdate('compressor', 'release', v)}
            />
            <SliderRow
              label="Makeup Gain"
              value={`+${effects.compressor.makeupGain.toFixed(1)} dB`}
              min={0}
              max={15}
              step={0.5}
              current={effects.compressor.makeupGain}
              onChange={(v) => handleModuleUpdate('compressor', 'makeupGain', v)}
            />
          </div>
        </EffectCard>
      </div>
    </div>
  );
};

// Sub-component: Modular Effect Container Box
interface EffectCardProps {
  title: string;
  icon: React.ReactNode;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  color: 'emerald' | 'amber' | 'cyan' | 'rose' | 'indigo' | 'teal' | 'violet' | 'blue' | 'orange' | 'pink' | 'yellow';
  children: React.ReactNode;
}

const EffectCard: React.FC<EffectCardProps> = ({ title, icon, enabled, onToggle, color, children }) => {
  return (
    <div
      className={`rounded-xl border transition-all duration-200 flex flex-col p-4 ${
        enabled
          ? 'bg-slate-950/80 border-slate-700/80 shadow-lg'
          : 'bg-slate-950/40 border-slate-900 opacity-60 hover:opacity-85'
      }`}
    >
      {/* Module Titlebar & Toggle */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg border ${
              enabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {icon}
          </div>
          <span className="font-semibold text-xs text-slate-200 tracking-wide">{title}</span>
        </div>

        {/* LED Toggle Switch */}
        <button
          onClick={() => onToggle(!enabled)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold transition-all cursor-pointer ${
            enabled
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-500 border border-slate-800'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full transition-all ${
              enabled ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400' : 'bg-slate-700'
            }`}
          />
          {enabled ? 'ON' : 'BYPASS'}
        </button>
      </div>

      {/* Module Controls Body */}
      <div className={enabled ? 'pointer-events-auto' : 'pointer-events-none opacity-50'}>{children}</div>
    </div>
  );
};

// Sub-component: Slider Row
interface SliderRowProps {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  current: number;
  onChange: (val: number) => void;
}

const SliderRow: React.FC<SliderRowProps> = ({ label, value, min, max, step, current, onChange }) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-400 font-medium">{label}</span>
        <span className="font-mono text-slate-200 font-semibold">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer transition-all hover:bg-slate-700"
      />
    </div>
  );
};
