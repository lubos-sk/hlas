import { useState, useEffect } from 'react';
import { textToPhonemeSymbols, createPhonemeSegments, analyzeSpeechStats, SLOVAK_PHONEMES } from './synthesis/SlovakPhonetics';
import { synthInstance } from './synthesis/SpeechEngine';
import { VoiceConfig, PhonemeSegment, SpeechStats, DEFAULT_SIBILANTS, AudioEffectsConfig, DEFAULT_AUDIO_EFFECTS } from './types';
import { VoiceControls } from './components/VoiceControls';
import { PhonemeEditor } from './components/PhonemeEditor';
import { SyllableVisualizer } from './components/SyllableVisualizer';
import { EffectRack } from './components/EffectRack';
import { Play, Square, Sparkles, Volume2, Info, BookOpen, VolumeX, Sliders, Activity, Layers, Cpu } from 'lucide-react';

const PRESETS = [
  {
    title: "Sklonovanie SI jednotiek 📐",
    text: "Preteky trvali 1 s, potom 2 s, nakoniec 5 s a tréning zabral 21 s. Dráha merala 1 m, neskôr 32 m a ďalších 12 m. Nádrž mala 0.5 l, potom 1.5 l, vtedy spotrebovali 2.7 l oleja. Rýchlosť vetra bola 11 m, 22 m, alebo až 21 m. Frekvencia bola 1 Hz, 4 Hz, alebo 14 Hz. Výkon bol 1 W, 3 W, 10 W, napätie 1 V, 12 V, 230 V a prúd 1 A, 2 A, 5 A."
  },
  {
    title: "Tituly, jednotky a rozsahy 📏",
    text: "Prednášal nám Mgr. Ján Kováč, PhD. a docent Ing. Peter Čierny. Naše laboratórium nameralo 25 °C, čo je viac ako 77 °F. Vzdialenosť bola 175-180 cm (teda asi 1.8 m) a hmotnosť vzorky klesla z 2 kg na 500 mg. Úspešnosť bola 100 % (čo je asi 1000 ‰)."
  },
  {
    title: "Emocionálne citoslovcia 🎭",
    text: "Ahoj! Aha, pozri sa na to. Oho, to je úspech! Auuu, to bolí! Jaj, nešťastie! Fuj, to je odporné! Bŕŕŕ, tu je ale zima. Ha ha, to je veľmi smiešne! Búúú, fňuk, prečo plačeš? Bum! Prásk! Cink! Hav-hav, mňau-mňau, kikirikí."
  },
  {
    title: "Technické & moderné skratky 💻",
    text: "Naša AI a ChatGPT bežia na GPU od NVIDIA. Celé IT oddelenie má prístup k SQL databáze cez HTTPS API a Wi-Fi. Na stiahnutie máme PDF a XML súbory na www.google.sk, a kód nájdete na GitHub alebo YouTube. Naše B2B tržby stúpli o 10 %."
  },
  {
    title: "Matematické rovnice 🧮",
    text: "Vyskúšajme matematiku: 5+3=8 a tiež 10 - 2 = 8. Vieme aj násobiť: 5 x 3 = 15 alebo 4 * 2 = 8, a deliť: 12 / 4 = 3."
  },
  {
    title: "Veľké čísla & desatinné miesta 📊",
    text: "Počítajme veľké cifry: 10 000, 150 000, 1 250 300 a až 15 000 000 alebo 120 500 000. Desatinné miesta: 0.5, 1.25, 2.008 a 150.35."
  },
  {
    title: "Asimilačné & neutralizačné procesy 🇸🇰",
    text: "Znelostná asimilácia v slove odpad a včela. Neutralizácia znelosti na konci slova ľad a dub. Velárne n v slove bankár a sánka. Palatalizácia v slove dievčina a kyticu. Elidácia a epentéza v slovách jablko, vtedy, srdce a vstúpiť."
  },
  {
    title: "Gramatická normalizácia",
    text: "V 3. storočí sa s 5 kg cukru, 2 m látky a 1 l mlieka udialo veľa vecí. Písmeno m tu nie je meter, ale 10 m prekážka už áno. Sledujte TV, no pozrite sa mu do tváre. Máte nové PC, hrajte hry na pc. Cena m-stavebnín klesla o 3,5 % napr. kvôli dovozu."
  },
  {
    title: "Klasické predstavenie",
    text: "Vítam vás v našom lokálnom hlasovom syntetizátore. Tento hlas je generovaný od základov priamo vo vašom prehliadači."
  },
  {
    title: "Skúška spodobovania a dvojhlások",
    text: "Predpoveď počasia hlási vietor. Včela letela okolo duba. Vlk stál pri kope snehu."
  },
  {
    title: "Slovenský rytmus (Prízvuky a dĺžky)",
    text: "Mladá dievčina nesie peknú kyticu ruží. Rýchly potok tečie pod starou brizolitovou stenou."
  },
  {
    title: "Najťažší jazykolam (Kmitavé r / ŕ)",
    text: "Tristo tridsať tri strieborných striekačiek striekalo cez tristo tridsať tri strieborných striech."
  },
  {
    title: "Bilingválna výslovnosť (Anglický slovník)",
    text: "Ahoj developer! Vyskúšaj náš nový web a browser. Zadaj hello a zahraj demo. Tento software beží perfektne online aj offline."
  },
  {
    title: "Výslovnosť pismen (w, q, x) a zatvorky",
    text: "Máme tu písmená w, q, x. Vyslovujeme ich ako vee, kveee a iks. Vyskúšaj (zátvorky) a slová ako (wifi), wc, taxi a Alex."
  },
  {
    title: "Bilingválny IPA slovník (30 000 slov)",
    text: "Tento hlas dokáže plynule vysloviť anglické slová v slovenskom texte: apple, beautiful, business, danger, country, language, question, shadow a family."
  }
];

export default function App() {
  const [text, setText] = useState<string>(
    localStorage.getItem('slovak_synth_text') || PRESETS[0].text
  );
  
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>({
    gender: 'male',
    baseF0: 100,
    speed: 1.0,
    vibratoRate: 5.5,
    vibratoDepth: 0.15,
    formantShift: 1.0,
    volume: 0.8,
    intonationPattern: 'natural',
    sibilants: { ...DEFAULT_SIBILANTS },
    reverbLevel: 0.15,
    enableWarmthEQ: true
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [segments, setSegments] = useState<PhonemeSegment[]>([]);
  const [blocks, setBlocks] = useState<PhonemeSegment[][]>([]);
  const [stats, setStats] = useState<SpeechStats | null>(null);

  // Audio Context lock release trigger
  const [audioInitialized, setAudioInitialized] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'text' | 'params' | 'analysis' | 'lab' | 'effects'>('text');

  const [audioEffects, setAudioEffects] = useState<AudioEffectsConfig>(() => {
    try {
      const saved = localStorage.getItem('slovak_synth_effects');
      if (saved) {
        return { ...DEFAULT_AUDIO_EFFECTS, ...JSON.parse(saved) };
      }
    } catch (e) {}
    return DEFAULT_AUDIO_EFFECTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('slovak_synth_effects', JSON.stringify(audioEffects));
    } catch (e) {}
  }, [audioEffects]);

  useEffect(() => {
    localStorage.setItem('slovak_synth_text', text);
    
    // Split the text into clauses while respecting paragraph boundaries for instant rendering and natural breath pauses
    const getClausalChunks = (input: string) => {
      const result: { text: string; pauseAfter: number; origIndex: number }[] = [];
      const paragraphs = input.split(/\n+/);
      const abbreviations = [
        'napr', 'atď', 'tj', 't', 'j', 'doc', 'prof', 'ing', 'mudr', 'phdr', 'rndr', 'mgr', 'bc', 'dr', 
        'č', 'str', 'cca', 'sv', 'ul', 'tel', 'roč', 'nar', 'stol', 'st', 'tzv', 'resp', 'obr', 'tab'
      ];
      
      let currentOffset = 0;
      
      for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
        const rawPara = paragraphs[pIdx];
        const paraTrimmed = rawPara.trim();
        
        const pStart = input.indexOf(rawPara, currentOffset);
        if (pStart === -1) {
          currentOffset += rawPara.length + 1;
          continue;
        }
        
        if (paraTrimmed === '') {
          currentOffset = pStart + rawPara.length;
          continue;
        }
        
        const splitPoints: { index: number; length: number; pause: number }[] = [];
        
        for (let i = 0; i < rawPara.length; i++) {
          const char = rawPara[i];
          
          if (char === '.' || char === '?' || char === '!' || char === ',' || char === ';' || char === ':') {
            const isFollowedBySpace = i === rawPara.length - 1 || /\s/.test(rawPara[i + 1]);
            if (!isFollowedBySpace) continue;
            
            let shouldSplit = false;
            let pauseDuration = 150; // default clause/comma pause in ms (very short breath)
            
            if (char === '?' || char === '!') {
              shouldSplit = true;
              pauseDuration = 300; // sentence ending breath
            } else if (char === ',') {
              shouldSplit = true;
              pauseDuration = 150; // comma breathing pause
            } else if (char === ';' || char === ':') {
              shouldSplit = true;
              pauseDuration = 180; // semicolon/colon breath
            } else if (char === '.') {
              const prevMatch = rawPara.slice(0, i).match(/[\wáäčďéíĺľňóôŕštúýžÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽ]+$/);
              let isAbbrev = false;
              if (prevMatch) {
                const word = prevMatch[0].toLowerCase();
                if (abbreviations.includes(word) || word.length === 1) {
                  isAbbrev = true;
                } else if (/^\d+$/.test(word)) {
                  const rest = rawPara.slice(i + 1).trim();
                  if (rest.length > 0) {
                    const firstChar = rest[0];
                    const isNextLowercase = firstChar === firstChar.toLowerCase() && firstChar !== firstChar.toUpperCase();
                    if (isNextLowercase) {
                      isAbbrev = true;
                    }
                  }
                }
              }
              if (!isAbbrev) {
                shouldSplit = true;
                pauseDuration = 300; // sentence ending full stop breath
              }
            }
            
            if (shouldSplit) {
              splitPoints.push({
                index: i,
                length: 1,
                pause: pauseDuration
              });
            }
          } else if (char === '-' || char === '—') {
            const precededBySpace = i > 0 && /\s/.test(rawPara[i - 1]);
            const followedBySpace = i < rawPara.length - 1 && /\s/.test(rawPara[i + 1]);
            if (precededBySpace && followedBySpace) {
              splitPoints.push({
                index: i,
                length: 1,
                pause: 180 // dash boundary breath
              });
            }
          }
        }
        
        let lastSliceEnd = 0;
        for (let ptIdx = 0; ptIdx < splitPoints.length; ptIdx++) {
          const pt = splitPoints[ptIdx];
          const sliceStart = lastSliceEnd;
          const sliceEnd = pt.index + pt.length;
          const textBlock = rawPara.slice(sliceStart, sliceEnd).trim();
          
          if (textBlock !== '') {
            const origIndex = pStart + sliceStart + (rawPara.slice(sliceStart, sliceEnd).length - rawPara.slice(sliceStart, sliceEnd).trimStart().length);
            const isParagraphEnd = (pIdx < paragraphs.length - 1) && (ptIdx === splitPoints.length - 1);
            const pauseAfter = isParagraphEnd ? 450 : pt.pause;
            
            result.push({
              text: textBlock,
              pauseAfter,
              origIndex
            });
          }
          lastSliceEnd = sliceEnd;
        }
        
        if (lastSliceEnd < rawPara.length) {
          const textBlock = rawPara.slice(lastSliceEnd).trim();
          if (textBlock !== '') {
            const origIndex = pStart + lastSliceEnd + (rawPara.slice(lastSliceEnd).length - rawPara.slice(lastSliceEnd).trimStart().length);
            const isParagraphEnd = pIdx < paragraphs.length - 1;
            const pauseAfter = isParagraphEnd ? 450 : 250;
            result.push({
              text: textBlock,
              pauseAfter,
              origIndex
            });
          }
        }
        
        currentOffset = pStart + rawPara.length;
      }
      return result;
    };

    const clauses = getClausalChunks(text);

    if (clauses.length === 0) {
      setSegments([]);
      setBlocks([]);
      setStats(null);
      return;
    }

    const computedBlocks = clauses.map(c => {
      const symbols = textToPhonemeSymbols(c.text, voiceConfig);
      const block = createPhonemeSegments(symbols, voiceConfig, c.text);
      
      // Append breathing pause to the block audio itself
      const pausePhoneme = { symbol: ' ', type: 'silence' as const, baseDuration: c.pauseAfter };
      block.push({
        phoneme: pausePhoneme,
        customDuration: c.pauseAfter / voiceConfig.speed,
        pitchStart: voiceConfig.baseF0,
        pitchEnd: voiceConfig.baseF0,
        isStressed: false,
        textPosition: (block[block.length - 1]?.textPosition || 0) + 1
      });
      return block;
    });

    setBlocks(computedBlocks);

    // Merge into flat segments for diagnostics (stats and syllables visualizer)
    const flatSegs: PhonemeSegment[] = [];
    computedBlocks.forEach((block, blockIdx) => {
      const c = clauses[blockIdx];
      block.forEach(seg => {
        flatSegs.push({
          ...seg,
          textPosition: seg.textPosition + c.origIndex
        });
      });
    });

    setSegments(flatSegs);
    setStats(analyzeSpeechStats(text, flatSegs));
  }, [text, voiceConfig]);

  // Proactive background synthesis pre-caching for instant playback
  useEffect(() => {
    if (blocks.length === 0) return;
    
    const handler = setTimeout(() => {
      synthInstance.preCache(blocks, voiceConfig);
    }, 200); // 200ms debounce during typing/slider tweaking

    return () => {
      clearTimeout(handler);
    };
  }, [blocks, voiceConfig]);

  useEffect(() => {
    synthInstance.registerPlaybackEnd(() => {
      setIsPlaying(false);
    });

    // Cleanup on unmount
    return () => {
      synthInstance.stop();
    };
  }, []);

  const handlePlay = () => {
    if (!audioInitialized) {
      synthInstance.init();
      setAudioInitialized(true);
    }

    if (isPlaying) {
      synthInstance.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      // Generate voice on user active gesture using blocks instead of flat segments
      synthInstance.play(blocks, voiceConfig, audioEffects);
    }
  };

  const handleStop = () => {
    synthInstance.stop();
    setIsPlaying(false);
  };

  const handleExportWav = async () => {
    if (isExporting || text.trim() === '') return;
    setIsExporting(true);
    try {
      const blob = await synthInstance.exportToWav(blocks, voiceConfig, audioEffects);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanName = text.trim()
        .slice(0, 30)
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove slovak diacritics for export filename
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase() || 'slovak_synth';
      a.download = `${cleanName}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Chyba exportu:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const selectPreset = (t: string) => {
    synthInstance.stop();
    setIsPlaying(false);
    setText(t);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Sparkles className="w-5.5 h-5.5 text-slate-950" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
                Slovenský Hlasový Syntetizátor
              </h1>
              <p className="text-[11px] text-slate-400 font-mono">
                Akustický Formantový DSP Syntetizátor (100% Lokálny v prehliadači)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/50 border border-emerald-500/20 rounded-full text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Web Audio API Sound Engine // HLAS-SK v1.0
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Switcher Navigation */}
      <div className="border-b border-slate-900/60 bg-slate-950/50 backdrop-blur-sm sticky top-[73px] z-40 px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2 justify-start items-center">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap ${
              activeTab === 'text'
                ? 'bg-emerald-500/10 border-emerald-500/80 text-emerald-400 font-bold shadow-md shadow-emerald-500/5'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Slovenský text a syntéza
          </button>
          <button
            onClick={() => setActiveTab('params')}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap ${
              activeTab === 'params'
                ? 'bg-emerald-500/10 border-emerald-500/80 border-emerald-500 text-emerald-400 font-bold shadow-md shadow-emerald-500/5'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Parametre reči
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap ${
              activeTab === 'analysis'
                ? 'bg-emerald-500/10 border-emerald-500/80 border-emerald-500 text-emerald-400 font-bold shadow-md shadow-emerald-500/5'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            Analýza
          </button>
          <button
            onClick={() => setActiveTab('lab')}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap ${
              activeTab === 'lab'
                ? 'bg-emerald-500/10 border-emerald-500/80 border-emerald-500 text-emerald-400 font-bold shadow-md shadow-emerald-500/5'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Laboratórium foném
          </button>
          <button
            onClick={() => setActiveTab('effects')}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap ${
              activeTab === 'effects'
                ? 'bg-emerald-500/10 border-emerald-500/80 border-emerald-500 text-emerald-400 font-bold shadow-md shadow-emerald-500/5'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Effect Rack
          </button>
        </div>
      </div>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

        {/* Tab 1: Slovenský text a syntéza */}
        {activeTab === 'text' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-emerald-400" />
                <span className="font-display font-semibold text-slate-200 text-xs uppercase tracking-wide">
                  Slovenský text k syntéze
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Príklady:</span>
            </div>

            {/* Preset buttons */}
            <div className="flex flex-wrap gap-1.5 -mt-1">
              {PRESETS.map((p, pIdx) => (
                <button
                  key={pIdx}
                  id={`preset-${pIdx}`}
                  onClick={() => selectPreset(p.text)}
                  className="px-2.5 py-1 text-[10px] rounded-lg bg-slate-950 hover:bg-slate-850/80 border border-slate-800 text-slate-300 hover:text-slate-100 transition-all font-mono cursor-pointer"
                  title={p.text}
                >
                  {p.title}
                </button>
              ))}
            </div>

            {/* Text Input area */}
            <div className="relative">
              <textarea
                id="slovak-synth-text-input"
                className="w-full h-36 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/80 transition-all resize-none shadow-inner leading-relaxed"
                value={text}
                onChange={(e) => {
                  synthInstance.stop();
                  setIsPlaying(false);
                  setText(e.target.value);
                }}
                placeholder="Napíšte ľubovoľnú slovenskú vetu s diakritikou (napr. á, ä, ô, ľ, š, č, ť)..."
                maxLength={400}
              />
              <span className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-500">
                {text.length} / 400 znakov
              </span>
            </div>

            {/* Control Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1 border-t border-slate-800/80">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  id="btn-play-synth"
                  onClick={handlePlay}
                  disabled={text.trim() === ''}
                  className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
                    isPlaying
                      ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/10 cursor-pointer'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-45 disabled:pointer-events-none shadow-emerald-500/10 cursor-pointer'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Square className="w-4 h-4 fill-current" /> Zastaviť
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" /> Syntetizovať hlas
                    </>
                  )}
                </button>

                <button
                  id="btn-export-wav"
                  onClick={handleExportWav}
                  disabled={isExporting || text.trim() === ''}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-xs font-semibold bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 font-mono transition-all disabled:opacity-40 disabled:pointer-events-none shadow-md cursor-pointer"
                >
                  {isExporting ? 'Generujem .WAV...' : 'Stiahnuť .WAV'}
                </button>

                {isPlaying && (
                  <button
                    id="btn-stop-audio-synth"
                    onClick={handleStop}
                    className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-850 text-rose-400 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                    title="Sekundárny hard stop"
                  >
                    <VolumeX className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>

              {/* Synth stats summary */}
              {stats && (
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-x-4 gap-y-1 text-[10px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <div>Odhad času: <span className="text-emerald-400 font-bold">{stats.totalDuration.toFixed(2)}s</span></div>
                  <div className="sm:border-l sm:border-slate-800 sm:pl-3">Slabík: <span className="text-emerald-400 font-bold">{stats.syllableCount}</span></div>
                  <div className="hidden sm:block sm:border-l sm:border-slate-800 sm:pl-3">Foném: <span className="text-emerald-500 font-bold">{stats.phonemeCount}</span></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Parametre reči (Sliders & Slovak casual laws) */}
        {activeTab === 'params' && (
          <div className="w-full">
            <VoiceControls config={voiceConfig} onChange={setVoiceConfig} />
          </div>
        )}

        {/* Tab 3: Analýza (Acoustic timeline analysis) */}
        {activeTab === 'analysis' && (
          <div className="w-full">
            <SyllableVisualizer segments={segments} rawText={text} />
          </div>
        )}

        {/* Tab 4: Laboratórium foném (Formant tweak workbench) */}
        {activeTab === 'lab' && (
          <div className="w-full">
            <PhonemeEditor synth={synthInstance} voiceConfig={voiceConfig} onChangeVoiceConfig={setVoiceConfig} />
          </div>
        )}

        {/* Tab 5: Zvukový Effect Rack (DSP Audio Processor) */}
        {activeTab === 'effects' && (
          <div className="w-full">
            <EffectRack
              effects={audioEffects}
              onChange={setAudioEffects}
              onReset={() => setAudioEffects(DEFAULT_AUDIO_EFFECTS)}
            />
          </div>
        )}

      </main>
    </div>
  );
}
