import React from 'react';
import { PhonemeSegment } from '../types';
import { isVocalic } from '../synthesis/SlovakPhonetics';
import { HelpCircle, ArrowRight, Music, Clock } from 'lucide-react';

interface SyllableVisualizerProps {
  segments: PhonemeSegment[];
  rawText: string;
}

export const SyllableVisualizer: React.FC<SyllableVisualizerProps> = ({ segments, rawText }) => {
  if (segments.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-xs font-mono">
        Zatiaľ žiadna zadaná veta na analýzu. Napíšte text hore a stlačte "Syntetizovať reč".
      </div>
    );
  }

  // Detect voicing assimilation and phonological events!
  const adaptations: Array<{ original: string; phonetic: string; category: string; explanation: string }> = [];

  const phSymbols = segments.map(s => s.phoneme.symbol);
  const textLower = rawText.toLowerCase();

  // 1. Znelostná asimilácia (Regresívna):
  if (textLower.includes('odpad') || (phSymbols.includes('t') && textLower.includes('dp'))) {
    adaptations.push({
      category: 'Znelostná asimilácia (regresívna)',
      original: 'odpad',
      phonetic: '[otpat]',
      explanation: 'Koncové "d" v prvej slabike "od-" pred nasledujúcou neznelou spoluhláskou "p" asimiluje a znie ako neznelé [t].'
    });
  }
  if (textLower.includes('včela') || (phSymbols.includes('f') && textLower.includes('vč'))) {
    adaptations.push({
      category: 'Znelostná asimilácia (regresívna)',
      original: 'včela',
      phonetic: '[fčela]',
      explanation: 'Znelá párová spoluhláska "v" sa na začiatku pred neznelou "č" prispôsobuje a vyslovuje sa ako neznelé [f].'
    });
  }
  if (textLower.includes('kde') || (phSymbols.includes('g') && textLower.includes('kd'))) {
    adaptations.push({
      category: 'Znelostná asimilácia (regresívna)',
      original: 'kde',
      phonetic: '[gde]',
      explanation: 'Neznelé "k" pred znelou spoluhláskou "d" znie znelo ako párové [g].'
    });
  }

  // 2. Neutralizácia znelosti na konci slova:
  if (textLower.includes('ľad') && !textLower.includes('ľadom') && !textLower.includes('ľady')) {
    adaptations.push({
      category: 'Neutralizácia znelosti',
      original: 'ľad',
      phonetic: '[ľat]',
      explanation: 'Znelé a neznelé spoluhláskové páry sa na konci slova pred pauzou neutralizujú, koncové "d" sa vyslovuje ako neznelé [t].'
    });
  }
  if (textLower.includes('dub') && !textLower.includes('duba') && !textLower.includes('duby')) {
    adaptations.push({
      category: 'Neutralizácia znelosti',
      original: 'dub',
      phonetic: '[dup]',
      explanation: 'Koncové znelé "b" pred pauzou stráca svoju znelosť (neutralizuje sa) a realizuje sa ako neznelé bilabiálne [p].'
    });
  }

  // 3. Miesto- a spôsobová asimilácia (n -> ŋ):
  if (phSymbols.includes('ŋ')) {
    let originalWord = 'bankár';
    if (textLower.includes('bankár')) originalWord = 'bankár';
    else if (textLower.includes('sánka')) originalWord = 'sánka';
    else if (textLower.includes('anglick')) originalWord = 'anglický';
    else if (textLower.includes('bánov')) originalWord = 'Bánovce';
    else if (textLower.includes('bunk')) originalWord = 'bunka';
    
    adaptations.push({
      category: 'Miesto- a spôsobová asimilácia',
      original: originalWord,
      phonetic: originalWord.replace(/n/g, 'ŋ'),
      explanation: 'Alveolárne "n" sa pred velárnymi spoluhláskami "k, g, ch" mení na velárnu/zadnoďasnovú nazálu [ŋ] z dôvodu optimálnej artikulácie.'
    });
  }

  // 4. Palatalizácia (Zmäkčovanie):
  if (phSymbols.some(sym => ['ď', 'ť', 'ň', 'ľ'].includes(sym))) {
    if (textLower.includes('dievčina') || textLower.includes('dievča')) {
      adaptations.push({
        category: 'Palatalizácia (Zmäkčovanie)',
        original: 'dievčina / dievča',
        phonetic: '[ďieu̯čina] / [ďieu̯ča]',
        explanation: 'Zubné "d" sa pred mäkčiacim dvojhláskovým vokálom "ie" pravidelne zmäkčuje na palatálne [ď].'
      });
    } else if (textLower.includes('kyticu')) {
      adaptations.push({
        category: 'Palatalizácia (Zmäkčovanie)',
        original: 'kyticu',
        phonetic: '[kiťicu]',
        explanation: 'Tvrdé zubné "t" sa pred mäkkým vokálom "i" asimiluje a realizuje ako jemné palatálne [ť].'
      });
    } else {
      const encounteredSofts = Array.from(new Set(phSymbols.filter(s => ['ď', 'ť', 'ň', 'ľ'].includes(s)))).join(', ');
      adaptations.push({
        category: 'Palatalizácia (Zmäkčovanie)',
        original: 'Spisovné zmäkčenie',
        phonetic: `[${encounteredSofts}]`,
        explanation: 'Tradičné slovenské zmäkčovanie (palatalizácia): tvrdé d, t, n, l prechádzajú na ď, ť, ň, ľ pred prednými vokálmi a, e, i, í, ia, ie, iu.'
      });
    }
  }

  // 5. Redukcia samohlások:
  const hasReducedVowels = segments.some(seg => {
    const isShort = ['a', 'ä', 'e', 'i', 'o', 'u', 'y'].includes(seg.phoneme.symbol);
    return isShort && !seg.isStressed && seg.customDuration < 60;
  });
  if (hasReducedVowels) {
    adaptations.push({
      category: 'Redukcia samohlások v neformálnej reči',
      original: 'neprízvučné slabiky',
      phonetic: 'skrátená dĺžka a neutralizácia',
      explanation: 'V rýchlej alebo neformálnej hovorenej reči dochádza k oslabeniu (redukcii) krátkych samohlások v neprízvučných slabikách, čo uľahčuje intonačné plynutie.'
    });
  }

  // 6. Elidácia a Epentéza (Spojenie slabík):
  if (textLower.includes('jablko') && phSymbols.includes('p') && !phSymbols.includes('l')) {
    adaptations.push({
      category: 'Slabičné spojenie (Elidácia)',
      original: 'jablko',
      phonetic: '[japko]',
      explanation: 'Elidácia: Vypustenie ťažko artikulovateľného "l" v skupine "-blk-" v rýchlej hovorenej reči pre zvýšenie rytmického toku.'
    });
  }
  if (textLower.includes('vtedy') && phSymbols.includes('f') && !phSymbols.includes('t')) {
    adaptations.push({
      category: 'Slabičné spojenie (Elidácia)',
      original: 'vtedy',
      phonetic: '[fedy]',
      explanation: 'Elidácia: Úplná strata zubnej spoluhlásky "t" spolu s regresívnym spodobovaním "v" na neznelé [f] uľahčuje neformálnu výslovnosť.'
    });
  }
  if (textLower.includes('srdce') && phSymbols.includes('c') && !phSymbols.includes('d')) {
    adaptations.push({
      category: 'Slabičné spojenie (Elidácia)',
      original: 'srdce',
      phonetic: '[srce]',
      explanation: 'Elidácia: Splynutie zložitej skupiny "-dc-" do jedinej čistej afrikáty [c] pre plynulý prejavy.'
    });
  }
  if (textLower.includes('vstúp') && phSymbols.includes('v') && phSymbols.includes('o')) {
    adaptations.push({
      category: 'Slabičné spojenie (Epentéza)',
      original: 'vstúpiť',
      phonetic: '[vostúpiť]',
      explanation: 'Epentéza: Vloženie pomocnej samohlásky "o" pred ťažkopádnu počiatočnú skupinu spoluhlások uľahčuje artikulačný nábeh v dialekte/rýchlej reči.'
    });
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
            <Music className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-slate-100 text-sm tracking-tight">Akustická a Fonologická Analýza</h2>
            <p className="text-[11px] text-slate-400 font-mono">Vizualizácia rytmiky, asimilácie a spodobovania slovenskej reči</p>
          </div>
        </div>
      </div>

      {/* Phonetic Timeline Map */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-emerald-400" /> Časová os segmentov ({segments.length} foném)
        </span>
        
        <div className="flex flex-wrap gap-1.5 p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto max-h-56">
          {segments.map((seg, idx) => {
            const isVow = isVocalic(seg.phoneme.symbol);
            return (
              <div 
                key={idx}
                className={`flex flex-col items-center justify-between p-2 rounded-lg border min-w-[38px] min-h-[58px] transition-all ${
                  seg.isStressed && isVow
                    ? 'bg-amber-500/15 border-amber-400/80' 
                    : isVow 
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-slate-900 border-slate-800/80'
                }`}
              >
                <div className="relative">
                  {seg.isStressed && isVow && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-amber-400 text-[11px] font-bold">ˈ</span>
                  )}
                  <span className={`font-sans font-bold text-xs ${
                    seg.isStressed && isVow 
                      ? 'text-amber-400' 
                      : isVow 
                      ? 'text-emerald-400' 
                      : 'text-slate-300'
                  }`}>
                    {seg.phoneme.symbol}
                  </span>
                </div>
                
                <span className="text-[8px] text-slate-400 font-mono mt-2">
                  {Math.round(seg.customDuration)}ms
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed italic">
          * Prvky so symbolom <strong>ˈ</strong> sú označené ako <span className="text-amber-400 font-semibold">prízvučné slabiky</span>, predlžujúce trvanie a dvíhajúce základný tón f0 pre slovenské frázovanie.
        </p>
      </div>

    </div>
  );
};
