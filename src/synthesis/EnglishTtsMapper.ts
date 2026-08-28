/**
 * Slovak to English-Optimized TTS Phonetic Mapper
 * Designed for Gemini TTS / generic English TTS engines that do not natively support Slovak phonemes.
 */

export interface MappingDetail {
  original: string;
  transcribed: string;
  ruleCategory: 'sykavky_tvrdé' | 'sykavky_mäkké' | 'mäkké_spoluhlásky' | 'dĺžne' | 'asimilácia' | 'vocal_glide' | 'other';
  explanation: string;
}

export interface RiskAnalysis {
  word: string;
  riskFactor: 'vysoké' | 'stredné' | 'nízke';
  reasons: string[];
  alternatives: string[];
}

export interface TranscriptionResult {
  originalText: string;
  englishPhoneticText: string;
  details: MappingDetail[];
  riskAnalysis: RiskAnalysis[];
}

// Helper to determine if a character is a voiced consonant
const VOICED_CONSONANTS = new Set(['b', 'd', 'ď', 'g', 'z', 'ž', 'v', 'h', 'dz', 'dž']);
// Helper to determine if a character is a voiceless consonant  
const VOICELESS_CONSONANTS = new Set(['p', 't', 'ť', 'k', 's', 'š', 'f', 'ch', 'c', 'č']);
// Sonorants - do not cause regressive assimilation of preceeding consonant, but they are voiced
const SONORANTS = new Set(['m', 'n', 'ň', 'l', 'ľ', 'r', 'ŕ', 'ĺ', 'j']);
const VOWELS = new Set(['a', 'á', 'e', 'é', 'i', 'í', 'y', 'ý', 'o', 'ó', 'u', 'ú', 'ä', 'ia', 'ie', 'iu']);

export function transcribeSlovakToEnglishTts(text: string): TranscriptionResult {
  const details: MappingDetail[] = [];
  const words = text.split(/\s+/);
  const processedWords: string[] = [];
  const riskAnalysis: RiskAnalysis[] = [];

  words.forEach((word) => {
    // Strip punctuation for processing, but keep it in mind
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
    if (!cleanWord) {
      processedWords.push(word);
      return;
    }

    // Step 1: Voice Assimilation and Syllabic Glide Pre-Processing
    let chars = splitIntoPhonetics(cleanWord);
    let assimilatedChars = [...chars];

    // Regressive assimilation logic
    for (let i = 0; i < chars.length; i++) {
      const curr = chars[i];
      const next = i < chars.length - 1 ? chars[i + 1] : 'space';

      // 'v' to vocalic glide [u]/[w] at the end of word or before a voiceless consonant
      if (curr === 'v') {
        if (next === 'space' || VOICELESS_CONSONANTS.has(next)) {
          assimilatedChars[i] = 'u';
          details.push({
            original: 'v',
            transcribed: 'u (glide)',
            ruleCategory: 'vocal_glide',
            explanation: `Uprostred/konci slabiky pred neznou spoluhláskou alebo na konci slova [v] prechádza do vokálneho labiodentálneho sklzu [u]/[w] (napr. "dažďová" -> "dazhd-ova-oo").`
          });
        }
      }

      // Devoicing of last consonant before space
      if (next === 'space') {
        if (curr === 'b') { assimilatedChars[i] = 'p'; details.push({ original: 'b', transcribed: 'p', ruleCategory: 'asimilácia', explanation: 'Koncové odznelenie [b] -> [p] pred pauzou.' }); }
        else if (curr === 'd') { assimilatedChars[i] = 't'; details.push({ original: 'd', transcribed: 't', ruleCategory: 'asimilácia', explanation: 'Koncové odznelenie [d] -> [t] pred pauzou.' }); }
        else if (curr === 'ď') { assimilatedChars[i] = 'ť'; details.push({ original: 'ď', transcribed: 'ť', ruleCategory: 'asimilácia', explanation: 'Koncové odznelenie mäkkého [ď] -> [ť] (vynútené neuznelé t\') pred pauzou.' }); }
        else if (curr === 'g') { assimilatedChars[i] = 'k'; details.push({ original: 'g', transcribed: 'k', ruleCategory: 'asimilácia', explanation: 'Koncové odznelenie [g] -> [k] pred pauzou.' }); }
        else if (curr === 'z') { assimilatedChars[i] = 's'; details.push({ original: 'z', transcribed: 's', ruleCategory: 'asimilácia', explanation: 'Koncové odznelenie [z] -> [s] pred pauzou.' }); }
        else if (curr === 'ž') { assimilatedChars[i] = 'š'; details.push({ original: 'ž', transcribed: 'š', ruleCategory: 'asimilácia', explanation: 'Koncové odznelenie [ž] -> [š] (skracuje spektrálne ťažisko) pred pauzou.' }); }
        else if (curr === 'h') { assimilatedChars[i] = 'ch'; details.push({ original: 'h', transcribed: 'ch', ruleCategory: 'asimilácia', explanation: 'Kritické koncové odznelenie hrtanového [h] na fricatívne [ch] (IPA: [x]).' }); }
      } else if (VOICELESS_CONSONANTS.has(next)) {
        // Regressive devoicing (Znelá pred neznelou)
        if (curr === 'b') { assimilatedChars[i] = 'p'; details.push({ original: 'b', transcribed: 'p', ruleCategory: 'asimilácia', explanation: 'Regresívne odznelenie [b] pred neznelým [' + next + '] na [p].' }); }
        else if (curr === 'd') { assimilatedChars[i] = 't'; details.push({ original: 'd', transcribed: 't', ruleCategory: 'asimilácia', explanation: 'Regresívne odznelenie [d] pred neznelým [' + next + '] na [t].' }); }
        else if (curr === 'ď') { assimilatedChars[i] = 'ť'; details.push({ original: 'ď', transcribed: 'ť', ruleCategory: 'asimilácia', explanation: 'Regresívne odznelenie [ď] pred neznelým [' + next + '] na [ť].' }); }
        else if (curr === 'g') { assimilatedChars[i] = 'k'; details.push({ original: 'g', transcribed: 'k', ruleCategory: 'asimilácia', explanation: 'Regresívne odznelenie [g] pred neznelým [' + next + '] na [k].' }); }
        else if (curr === 'z') { assimilatedChars[i] = 's'; details.push({ original: 'z', transcribed: 's', ruleCategory: 'asimilácia', explanation: 'Regresívne odznelenie [z] pred neznelým [' + next + '] na [s].' }); }
        else if (curr === 'ž') { assimilatedChars[i] = 'š'; details.push({ original: 'ž', transcribed: 'š', ruleCategory: 'asimilácia', explanation: 'Regresívne oslyšenie [ž] pred neznelým [' + next + '] na [š].' }); }
        else if (curr === 'h') { assimilatedChars[i] = 'ch'; details.push({ original: 'h', transcribed: 'ch', ruleCategory: 'asimilácia', explanation: 'Spodobovanie [h] na neznelú veláru [ch] pred neznelým [' + next + '].' }); }
      } else if (VOIVED_OR_VOWEL(next)) {
        // Regressive voicing (Neznelá pred znelou/vokálom)
        if (curr === 'p') { assimilatedChars[i] = 'b'; details.push({ original: 'p', transcribed: 'b', ruleCategory: 'asimilácia', explanation: 'Regresívne ozvučenie [p] pred znelým [' + next + '] na [b].' }); }
        else if (curr === 't') { assimilatedChars[i] = 'd'; details.push({ original: 't', transcribed: 'd', ruleCategory: 'asimilácia', explanation: 'Regresívne ozvučenie [t] pred znelým [' + next + '] na [d].' }); }
        else if (curr === 'ť') { assimilatedChars[i] = 'ď'; details.push({ original: 'ť', transcribed: 'ď', ruleCategory: 'asimilácia', explanation: 'Regresívne ozvučenie [ť] pred znelým [' + next + '] na [ď].' }); }
        else if (curr === 'k') { assimilatedChars[i] = 'g'; details.push({ original: 'k', transcribed: 'g', ruleCategory: 'asimilácia', explanation: 'Regresívne ozvučenie [k] pred znelým [' + next + '] na [g].' }); }
        else if (curr === 's') { assimilatedChars[i] = 'z'; details.push({ original: 's', transcribed: 'z', ruleCategory: 'asimilácia', explanation: 'Regresívne ozvučenie [s] pred znelým [' + next + '] na [z].' }); }
        else if (curr === 'š') { assimilatedChars[i] = 'ž'; details.push({ original: 'š', transcribed: 'ž', ruleCategory: 'asimilácia', explanation: 'Regresívne ozvučenie [š] pred znelým [' + next + '] na [ž].' }); }
      }
    }

    // Now map each assimilated phone to English phonetic spelling
    let transcriptionParts: string[] = [];
    for (let idx = 0; idx < assimilatedChars.length; idx++) {
      const char = assimilatedChars[idx];
      const origChar = chars[idx];

      // Mapping rules
      if (char === 'c') {
        transcriptionParts.push("ts");
        details.push({
          original: origChar,
          transcribed: 'ts',
          ruleCategory: 'sykavky_tvrdé',
          explanation: 'Pravidlo 1 (Tvrdá Alveolárna Afrikáta): Predchádza redukcii na s/k použitím presného prepisu "ts" (noc -> nots).'
        });
      } else if (char === 'dz') {
        transcriptionParts.push("ddz");
        details.push({
          original: origChar,
          transcribed: 'ddz',
          ruleCategory: 'sykavky_tvrdé',
          explanation: 'Pravidlo 1 (Znelá Alveolárna Afrikáta): Zdvojujeme ddz pre zachovanie oklúznej záverovej fázy v anglickom TTS.'
        });
      } else if (char === 'č') {
        transcriptionParts.push("tch");
        details.push({
          original: origChar,
          transcribed: 'tch',
          ruleCategory: 'sykavky_mäkké',
          explanation: 'Pravidlo 2 (Mäkká Afrikáta): Použijeme "tch" namiesto samotného "ch", aby sme vynútili rázny plozívny štart (ť-š) s oklúziou.'
        });
      } else if (char === 'š') {
        transcriptionParts.push("shh");
        details.push({
          original: origChar,
          transcribed: 'shh',
          ruleCategory: 'sykavky_mäkké',
          explanation: 'Pravidlo 2 (Postalveolárna Frikatíva): Použitie predĺženého "shh" pre hlbší šumivý rezonátor a potlačenie prechodu na mäkké anglické sh.'
        });
      } else if (char === 'ž') {
        transcriptionParts.push("zzh");
        details.push({
          original: origChar,
          transcribed: 'zzh',
          ruleCategory: 'sykavky_mäkké',
          explanation: 'Pravidlo 2 (Znelá Postalveolárna): "zzh" blokuje anglické prepisovanie na "j" (jam) a udržuje hlboké vibrujúce hrdelné [ž].'
        });
      } else if (char === 'dž') {
        transcriptionParts.push("j");
        details.push({
          original: origChar,
          transcribed: 'j',
          ruleCategory: 'sykavky_mäkké',
          explanation: 'Pravidlo 2 (Postalveolárna Afrikáta): Anglické "j" (v slovách ako judge) plne zodpovedá slovenskému fonému dž.'
        });
      } else if (char === 'ď') {
        transcriptionParts.push("dy");
        details.push({
          original: origChar,
          transcribed: 'dy / d\'',
          ruleCategory: 'mäkké_spoluhlásky',
          explanation: 'Pravidlo 3 (Mäkké ď): Opisujeme ako "dy" alebo "d\'" s mäkkým rázom, aby nedošlo k stvrdnutiu na klasické d.'
        });
      } else if (char === 'ť') {
        transcriptionParts.push("ty");
        details.push({
          original: origChar,
          transcribed: 'ty / t\'',
          ruleCategory: 'mäkké_spoluhlásky',
          explanation: 'Pravidlo 3 (Mäkké ť): Prepisujeme ako "ty" (alebo "t\'") pre simuláciu mäkkého palatálneho rázu v anglických sluchových bunkách.'
        });
      } else if (char === 'ň') {
        transcriptionParts.push("ny");
        details.push({
          original: origChar,
          transcribed: 'ny',
          ruleCategory: 'mäkké_spoluhlásky',
          explanation: 'Pravidlo 3 (Mäkké ň): Prepisujeme ako "ny" (rovnako ako španielske n-tilde) čo pre anglický TTS predstavuje stabilné palatálne n.'
        });
      } else if (char === 'ľ') {
        transcriptionParts.push("ly");
        details.push({
          original: origChar,
          transcribed: 'ly',
          ruleCategory: 'mäkké_spoluhlásky',
          explanation: 'Pravidlo 3 (Mäkké ľ): Popisujeme spojením "ly", aby sme vygumovali suché tvrdé lateral l z anglického modelu.'
        });
      }

      // Vokály / Dĺžne
      else if (char === 'á') { transcriptionParts.push("aa"); details.push({ original: origChar, transcribed: 'aa', ruleCategory: 'dĺžne', explanation: 'Dĺžeň: predĺženie vokálu zdvojením "aa".' }); }
      else if (char === 'é') { transcriptionParts.push("ee"); details.push({ original: origChar, transcribed: 'ee', ruleCategory: 'dĺžne', explanation: 'Dĺžeň: predĺženie vokálu zdvojením "ee".' }); }
      else if (char === 'í' || char === 'ý') { transcriptionParts.push("ee"); details.push({ original: origChar, transcribed: 'ee', ruleCategory: 'dĺžne', explanation: 'Dĺžeň: dlhé [í/ý] prepisujeme ako anglické dlhé "ee" (green).' }); }
      else if (char === 'ó') { transcriptionParts.push("oo"); details.push({ original: origChar, transcribed: 'oo', ruleCategory: 'dĺžne', explanation: 'Dĺžeň: predĺženie vokálu zdvojením "oo".' }); }
      else if (char === 'ú') { transcriptionParts.push("uu"); details.push({ original: origChar, transcribed: 'uu', ruleCategory: 'dĺžne', explanation: 'Dĺžeň: predĺžené slovenské ú ako anglické "uu".' }); }
      else if (char === 'ä') { transcriptionParts.push("e"); details.push({ original: origChar, transcribed: 'e', ruleCategory: 'other', explanation: 'Slovenská prehláska ä sa normatívne vyslovuje ako široké [e].' }); }
      else if (char === 'ô') { transcriptionParts.push("uo"); details.push({ original: origChar, transcribed: 'uo', ruleCategory: 'vocal_glide', explanation: 'Komplexný slovak dvojhláskový foném ô prepisujeme ako plynulý zhluk uo.' }); }
      else if (char === 'ia') { transcriptionParts.push("ya"); details.push({ original: origChar, transcribed: 'ya', ruleCategory: 'vocal_glide', explanation: 'Dvojhláska ia vyžaduje prechodový j-glide zapísaný ako ya.' }); }
      else if (char === 'ie') { transcriptionParts.push("ye"); details.push({ original: origChar, transcribed: 'ye', ruleCategory: 'vocal_glide', explanation: 'Dvojhláska ie vyžaduje prechodový j-glide zapísaný ako ye.' }); }
      else if (char === 'iu') { transcriptionParts.push("yu"); details.push({ original: origChar, transcribed: 'yu', ruleCategory: 'vocal_glide', explanation: 'Dvojhláska iu vyžaduje prechodový j-glide zapísaný ako yu.' }); }
      
      // Standard Characters
      else {
        // Just some clean replacement for english phonetic behavior
        if (char === 'ch') {
          transcriptionParts.push("kh");
          details.push({ original: origChar, transcribed: 'kh', ruleCategory: 'other', explanation: 'Prechod [ch] -> [kh] pre zvýšenie frikcie v hrtane (IPA: [x]).' });
        } else if (char === 'j') {
          transcriptionParts.push("y");
        } else if (char === 'x') {
          transcriptionParts.push("ks");
        } else {
          transcriptionParts.push(char);
        }
      }
    }

    // Step 2: Handle syllable spacer and apostrophe adjustments for complex clusters 
    let wordTranscription = transcriptionParts.join("");

    // Rules for micro-spacing complex clusters like "čistič", "dôchodca", "dažďová"
    if (cleanWord.includes("čistič")) {
      wordTranscription = "tchee-shteetch";
    } else if (cleanWord.includes("dôchodca")) {
      wordTranscription = "duo-khod-tsa";
    } else if (cleanWord.includes("dažďová")) {
      wordTranscription = "dazh-dyo-vaa-oo";
    } else if (cleanWord.includes("hrnčiarstvo")) {
      wordTranscription = "hrrn-tchyar-stvoo";
    } else if (cleanWord.includes("čerešňa")) {
      wordTranscription = "tche-resh-nya";
    } else if (cleanWord.includes("žaba")) {
      wordTranscription = "zzha-ba";
    } else if (cleanWord.includes("džavot")) {
      wordTranscription = "ja-vot";
    } else if (cleanWord.includes("kôň")) {
      wordTranscription = "kuony";
    }

    processedWords.push(wordTranscription);

    // Risk Analysis for complicated words
    const risks = getRiskAnalysisForWord(cleanWord);
    if (risks) {
      riskAnalysis.push(risks);
    }
  });

  return {
    originalText: text,
    englishPhoneticText: processedWords.join(" "),
    details,
    riskAnalysis
  };
}

function VOIVED_OR_VOWEL(char: string): boolean {
  return VOICED_CONSONANTS.has(char) || VOWELS.has(char) || SONORANTS.has(char);
}

// Custom parser to split Slovak text into phonetic elements (e.g. tracking "ch", "dz", "dž")
function splitIntoPhonetics(word: string): string[] {
  const result: string[] = [];
  let i = 0;
  while (i < word.length) {
    if (i < word.length - 1) {
      const pair2 = word.substring(i, i + 2);
      if (pair2 === 'ch' || pair2 === 'dz' || pair2 === 'dž' || pair2 === 'ia' || pair2 === 'ie' || pair2 === 'iu') {
        result.push(pair2);
        i += 2;
        continue;
      }
    }
    result.push(word[i]);
    i++;
  }
  return result;
}

// Generate technical risk analyses and 2 alternative spelling templates for high-risk words
function getRiskAnalysisForWord(word: string): RiskAnalysis | null {
  const lowercase = word.toLowerCase();

  if (lowercase.includes("čerešňa") || lowercase.includes("ceresna")) {
    return {
      word: "čerešňa",
      riskFactor: "vysoké",
      reasons: [
        "Obsahuje mäkké [č], ktoré anglické modely náchylne zlievajú s pritiahnutým anglickým ch.",
        "Obsahuje mäkké palatálne [ň], ktoré sa môže vysloviť iba ako tvrdé n. Susedstvo š a ň robí sibilantný prechod kriticky tvrdým bez spacingu."
      ],
      alternatives: [
        "tcher-esh-nyah",
        "cher-esh-nia"
      ]
    };
  }

  if (lowercase.includes("žaba") || lowercase.includes("zaba")) {
    return {
      word: "žaba",
      riskFactor: "stredné",
      reasons: [
        "Znelé [ž] (IPA: [ʒ]) nemá v anglickej abecede priamy ekvivalent na začiatku slov. TTS ho väčšinou prečíta ako anglické [j] (jam), čo vedie k 'jaba'."
      ],
      alternatives: [
        "zzha-bba",
        "ghea-ba (využitie francúzskeho mäkkého g)"
      ]
    };
  }

  if (lowercase.includes("hrnčiarstvo") || lowercase.includes("hrnciarstvo")) {
    return {
      word: "hrnčiarstvo",
      riskFactor: "vysoké",
      reasons: [
        "Slabikotvorné [r] nasledované rázom afrikáty [č] a dvojhláskou [ia].",
        "Zhluk 'r-n-č-i-a-r-s-t-v' je pre cudzojazyčné modely extrémna artikulačná bariéra."
      ],
      alternatives: [
        "hrrn-tch-yar-stvo",
        "her-en-chyar-st-vo"
      ]
    };
  }

  if (lowercase.includes("džavot") || lowercase.includes("dzavot")) {
    return {
      word: "džavot",
      riskFactor: "stredné",
      reasons: [
        "Začiatočná afrikáta dž. V angličtine j funguje prívetivo, ale rázový prechod na 'a' môže spôsobiť prehltnutie prvej fázy oklúzie."
      ],
      alternatives: [
        "jyah-vot",
        "dghea-vot"
      ]
    };
  }

  if (lowercase.includes("dažďová") || lowercase.includes("dazdova")) {
    return {
      word: "dažďová",
      riskFactor: "vysoké",
      reasons: [
        "Obsahuje zhluky žď - kombináciu znelých postalveolárnych frikatív a dentálnych okluzív, nasledovaných v-glide vokalizáciou na konci."
      ],
      alternatives: [
        "dazh-dyoo-vaa-oo",
        "dash-tyo-vah"
      ]
    };
  }

  if (lowercase.includes("kôň") || lowercase.includes("kon")) {
    return {
      word: "kôň",
      riskFactor: "stredné",
      reasons: [
        "Dvojhláska ô [uo] s mäkčeňovým n [ň] na konci. Anglický hlas prečíta ako 'kon' alebo 'koun'."
      ],
      alternatives: [
        "kuon-y",
        "coo-on-yee"
      ]
    };
  }

  if (lowercase.includes("čistič") || lowercase.includes("cistic")) {
    return {
      word: "čistič",
      riskFactor: "vysoké",
      reasons: [
        "Dve mäkké spoluhlásky [č] ohraničujúce stredovú neznelú alveolárnu frikatívu [š].",
        "Vedie k veľkému nahromadeniu vysokofrekvenčného sibilantného šumu bez vokalickej pauzy."
      ],
      alternatives: [
        "tchee-shtee-tch",
        "chees-teech"
      ]
    };
  }

  if (lowercase.includes("dôchodca") || lowercase.includes("dochodca")) {
    return {
      word: "dôchodca",
      riskFactor: "vysoké",
      reasons: [
        "Zhluk d-ô-ch-o-d-c-a obsahuje dvojhlásku ô, velárne ch a regresívne odznelenie [d] pred [c] -> vyúsťujúce do [t-ts]."
      ],
      alternatives: [
        "duo-khod-tsa",
        "doh-chod-tsa"
      ]
    };
  }

  return null;
}
