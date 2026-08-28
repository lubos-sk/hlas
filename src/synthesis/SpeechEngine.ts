import { PhonemeSegment, VoiceConfig, Formant, AudioEffectsConfig } from '../types';
import { SLOVAK_PHONEMES } from './SlovakPhonetics';
import { AudioEffectsEngine } from './AudioEffectsEngine';

export class SlovakSpeechSynth {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private isPlaying: boolean = false;
  private activeSequence: any[] = []; // Track active sound nodes to stop them
  private playbackStartTime: number = 0;
  private onPhonemeTrigger: ((segment: PhonemeSegment | null, index: number) => void) | null = null;
  private onPlaybackEnd: (() => void) | null = null;
  private timeouts: number[] = [];
  private activeSource: AudioBufferSourceNode | null = null;
  private liveInputGain: GainNode | null = null;
  private liveEffectNodes: AudioNode[] = [];
  private currentPlayId: number = 0;
  private reverbImpulseCache = new WeakMap<BaseAudioContext, AudioBuffer>();
  private noiseBufferCache = new WeakMap<BaseAudioContext, AudioBuffer>();
  private audioBufferCache = new Map<string, AudioBuffer>();
  private cacheKeysQueue: string[] = [];
  private readonly MAX_CACHE_SIZE = 150;
  private masterNoiseData: Float32Array | null = null;
  private masterReverbLeft: Float32Array | null = null;
  private masterReverbRight: Float32Array | null = null;

  constructor() {
    // Lazy initialize to comply with browser audio policies
  }

  public registerPlaybackEnd(callback: () => void) {
    this.onPlaybackEnd = callback;
  }

  // Calculate natural reverb and delay tail decay duration in seconds
  public getEffectsTailDuration(voice: VoiceConfig, effects?: AudioEffectsConfig): number {
    let tail = 0.4;
    const reverbLevel = voice.reverbLevel !== undefined ? voice.reverbLevel : 0.15;
    if (reverbLevel > 0.05) {
      tail = Math.max(tail, 0.6 + reverbLevel * 1.5);
    }

    if (effects && !effects.masterBypass) {
      if (effects.reverb && effects.reverb.enabled) {
        const decay = effects.reverb.decay || 1.5;
        const preDelay = (effects.reverb.preDelay || 0) / 1000;
        tail = Math.max(tail, decay + preDelay + 0.4);
      }
      if (effects.delay && effects.delay.enabled) {
        const delaySec = (effects.delay.time || 200) / 1000;
        const feedback = Math.min(0.9, effects.delay.feedback || 0.4);
        const repeats = 1 / Math.max(0.1, 1 - feedback);
        tail = Math.max(tail, delaySec * repeats + 0.5);
      }
      if (effects.chorus && effects.chorus.enabled) {
        tail = Math.max(tail, 0.8);
      }
      if (effects.flangerPhaser && effects.flangerPhaser.enabled) {
        tail = Math.max(tail, 0.8);
      }
    }

    return Math.min(8.0, Math.max(0.5, tail));
  }

  public generateCacheKey(block: PhonemeSegment[], voice: VoiceConfig, effects?: AudioEffectsConfig): string {
    const blockKey = block.map(seg => {
      const targetSymbol = seg.targetPhoneme?.symbol || '';
      // Row duration to nearest 5ms or 10ms for extreme cache reuse on minuscule speed changes
      const roundedDur = Math.round(seg.customDuration / 10) * 10;
      // Round pitch frequencies to nearest 2Hz to bucket micro-variations
      const roundedPitchStart = Math.round(seg.pitchStart / 2) * 2;
      const roundedPitchEnd = Math.round(seg.pitchEnd / 2) * 2;

      // Serialize formants dynamically to avoid cache collisions when tweaking them in Phoneme Laboratory!
      const formantsStr = seg.phoneme.formants 
        ? seg.phoneme.formants.map(f => `${Math.round(f.frequency)}_${Math.round(f.gain)}`).join(',')
        : 'none';
        
      const noiseFreq = seg.phoneme.noiseFreq !== undefined ? seg.phoneme.noiseFreq : '';
      const noiseBW = seg.phoneme.noiseBandwidth !== undefined ? seg.phoneme.noiseBandwidth.toFixed(2) : '';
      const noiseG = seg.phoneme.noiseGain !== undefined ? seg.phoneme.noiseGain.toFixed(2) : '';
      const voicedG = seg.phoneme.voicedGain !== undefined ? seg.phoneme.voicedGain.toFixed(2) : '';
      const aspG = seg.phoneme.aspirationGain !== undefined ? seg.phoneme.aspirationGain.toFixed(2) : '';
      const baseDur = seg.phoneme.baseDuration;

      return `${seg.phoneme.symbol}:${roundedDur}:${roundedPitchStart}:${roundedPitchEnd}:${seg.isStressed ? 1 : 0}:${targetSymbol}:${formantsStr}:${noiseFreq}:${noiseBW}:${noiseG}:${voicedG}:${aspG}:${baseDur}`;
    }).join('|');

    // Bucket settings to allow seamless caching while dragging sliders
    const bucketedSpeed = (Math.round(voice.speed * 40) / 40).toFixed(3); // steps of 0.025
    const bucketedF0 = Math.round(voice.baseF0 / 2) * 2; // steps of 2 Hz
    const bucketedVibratoRate = (Math.round(voice.vibratoRate * 10) / 10).toFixed(2); // steps of 0.1
    const bucketedVibratoDepth = (Math.round(voice.vibratoDepth * 100) / 100).toFixed(3); // steps of 0.01
    const bucketedFormantShift = (Math.round(voice.formantShift * 50) / 50).toFixed(3); // steps of 0.02
    const bucketedVolume = (Math.round(voice.volume * 50) / 50).toFixed(3); // steps of 0.02
    const bucketedReverb = (voice.reverbLevel !== undefined ? Math.round(voice.reverbLevel * 20) / 20 : 0.15).toFixed(2); // steps of 0.05

    const voiceKey = `${voice.gender}:${bucketedF0}:${bucketedSpeed}:${bucketedVibratoRate}:${bucketedVibratoDepth}:${bucketedFormantShift}:${bucketedVolume}:${voice.intonationPattern}:${bucketedReverb}:${voice.enableWarmthEQ !== false}`;

    const sibilantsKey = Object.keys(voice.sibilants || {})
      .sort()
      .map(sym => {
        const s = voice.sibilants[sym];
        const teeth = (Math.round(s.teethInfluence * 50) / 50).toFixed(3); // steps of 0.02
        const placement = (Math.round(s.tonguePlacement * 50) / 50).toFixed(3); // steps of 0.02
        const constriction = (Math.round(s.tongueConstriction * 50) / 50).toFixed(3); // steps of 0.02
        return `${sym}:${teeth}:${placement}:${constriction}`;
      })
      .join(',');

    const effectsKey = (effects && !effects.masterBypass) ? JSON.stringify(effects) : 'direct';

    return `${blockKey}#${voiceKey}#${sibilantsKey}#${effectsKey}`;
  }

  private getCachedBuffer(key: string): AudioBuffer | undefined {
    return this.audioBufferCache.get(key);
  }

  private setCachedBuffer(key: string, buffer: AudioBuffer) {
    if (this.audioBufferCache.has(key)) {
      return;
    }
    if (this.audioBufferCache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cacheKeysQueue.shift();
      if (oldestKey) {
        this.audioBufferCache.delete(oldestKey);
      }
    }
    this.audioBufferCache.set(key, buffer);
    this.cacheKeysQueue.push(key);
  }

  private concatenateAudioBuffers(ctx: BaseAudioContext, buffers: AudioBuffer[]): AudioBuffer {
    if (buffers.length === 0) {
      return ctx.createBuffer(1, 1, ctx.sampleRate || 22050);
    }
    if (buffers.length === 1) {
      return buffers[0];
    }
    const sampleRate = buffers[0].sampleRate;
    let totalLength = 0;
    for (const buf of buffers) {
      totalLength += buf.length;
    }
    const mainBuffer = ctx.createBuffer(1, totalLength, sampleRate);
    const mainData = mainBuffer.getChannelData(0);
    
    let offset = 0;
    for (const buf of buffers) {
      mainData.set(buf.getChannelData(0), offset);
      offset += buf.length;
    }
    return mainBuffer;
  }

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.connect(this.ctx.destination);
    }
  }

  public getAnalyser(): AnalyserNode | null {
    this.init();
    return this.analyser;
  }

  public registerPhonemeTrigger(callback: (segment: PhonemeSegment | null, index: number) => void) {
    this.onPhonemeTrigger = callback;
  }

  private getMasterNoiseData(length: number): Float32Array {
    if (!this.masterNoiseData || this.masterNoiseData.length < length) {
      const data = new Float32Array(length);
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.masterNoiseData = data;
    }
    return this.masterNoiseData;
  }

  // Generate white noise audio buffer (optimized with caching per sampleRate/audioContext)
  private createNoiseBuffer(ctx: BaseAudioContext): AudioBuffer {
    let existing = this.noiseBufferCache.get(ctx);
    if (existing) return existing;

    const sampleRate = ctx.sampleRate || 22050;
    const bufferSize = sampleRate * 2; // 2 seconds of noise is plenty
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    
    const master = this.getMasterNoiseData(bufferSize);
    data.set(master.subarray(0, bufferSize));

    this.noiseBufferCache.set(ctx, buffer);
    return buffer;
  }

  // Synthesize a high-fidelity room echo (recording booth / studio) impulse response buffer
  private getReverbImpulse(ctx: BaseAudioContext): AudioBuffer {
    let existing = this.reverbImpulseCache.get(ctx);
    if (existing) return existing;

    const sampleRate = ctx.sampleRate || 22050;
    const duration = 0.35; // 350ms decay duration is perfect for a compact, warm studio room reverb
    const length = Math.ceil(sampleRate * duration);
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    if (!this.masterReverbLeft || this.masterReverbLeft.length < length) {
      const mLeft = new Float32Array(length);
      const mRight = new Float32Array(length);
      for (let i = 0; i < length; i++) {
        const percent = i / length;
        const decay = Math.exp(-percent * 4.5);
        const noiseL = Math.random() * 2 - 1;
        const noiseR = Math.random() * 2 - 1;
        const highCutFactor = 1.0 - (percent * 0.5);
        mLeft[i] = noiseL * decay * 0.5 * highCutFactor;
        mRight[i] = noiseR * decay * 0.5 * highCutFactor;
      }
      this.masterReverbLeft = mLeft;
      this.masterReverbRight = mRight;
    }

    left.set(this.masterReverbLeft.subarray(0, length));
    right.set(this.masterReverbRight.subarray(0, length));

    this.reverbImpulseCache.set(ctx, impulse);
    return impulse;
  }

  // Connect EQ and spatial Reverb post-processing chain to humanize synthetic audio output, plus optional Audio Effects Rack
  private applyHumanizeEffects(
    ctx: BaseAudioContext,
    sourceNode: AudioNode,
    destinationNode: AudioNode,
    voice: VoiceConfig,
    effects?: AudioEffectsConfig,
    durationSec: number = 2.0,
    trackedNodes?: AudioNode[]
  ) {
    const track = <T extends AudioNode>(node: T): T => {
      if (trackedNodes) {
        trackedNodes.push(node);
      }
      return node;
    };

    const reverbLevel = voice.reverbLevel !== undefined ? voice.reverbLevel : 0.15;
    const isEqEnabled = voice.enableWarmthEQ !== false;

    let currentNode = sourceNode;

    // 1. Equalization (EQ): Warmth boost & High-frequency roll-off
    if (isEqEnabled) {
      // Warmth boost in mid-low frequencies (around 450 Hz) for a deep, natural, full chest tone
      const warmthEQ = track(ctx.createBiquadFilter());
      warmthEQ.type = 'peaking';
      warmthEQ.frequency.setValueAtTime(450, 0);
      warmthEQ.Q.setValueAtTime(0.85, 0);
      warmthEQ.gain.setValueAtTime(3.2, 0); // +3.2 dB boost
      
      // High-cut shelf to damp harsh, sterile metallic high frequencies above 10 kHz
      const highShelf = track(ctx.createBiquadFilter());
      highShelf.type = 'highshelf';
      highShelf.frequency.setValueAtTime(10000, 0);
      highShelf.gain.setValueAtTime(-8.0, 0); // -8.0 dB cut

      currentNode.connect(warmthEQ);
      warmthEQ.connect(highShelf);
      currentNode = highShelf;
    }

    // 2. Reverb (Ambient Room Echo) dry/wet parallel path routing
    const baseProcessedNode = track(ctx.createGain());

    if (reverbLevel > 0) {
      const convolver = track(ctx.createConvolver());
      convolver.buffer = this.getReverbImpulse(ctx);

      const dryGain = track(ctx.createGain());
      const wetGain = track(ctx.createGain());

      dryGain.gain.setValueAtTime(1.0 - (reverbLevel * 0.3), 0);
      wetGain.gain.setValueAtTime(reverbLevel, 0);

      // Routing dry & wet signal paths in parallel
      currentNode.connect(dryGain);
      currentNode.connect(convolver);
      convolver.connect(wetGain);

      dryGain.connect(baseProcessedNode);
      wetGain.connect(baseProcessedNode);
    } else {
      currentNode.connect(baseProcessedNode);
    }

    // 3. Audio Effect Rack DSP Processor
    if (effects && !effects.masterBypass) {
      AudioEffectsEngine.applyEffects(ctx, baseProcessedNode, destinationNode, effects, durationSec, trackedNodes);
    } else {
      baseProcessedNode.connect(destinationNode);
    }
  }

  public stop() {
    const wasPlaying = this.isPlaying;
    this.isPlaying = false;
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];

    if (this.activeSource) {
      try { this.activeSource.stop(); } catch(e) {}
      try { this.activeSource.disconnect(); } catch(e) {}
      this.activeSource = null;
    }

    // Stop and disconnect live effect nodes
    this.liveEffectNodes.forEach(node => {
      try {
        if ('stop' in node && typeof (node as any).stop === 'function') {
          (node as any).stop();
        }
      } catch(e) {}
      try {
        node.disconnect();
      } catch(e) {}
    });
    this.liveEffectNodes = [];

    if (this.liveInputGain) {
      try { this.liveInputGain.disconnect(); } catch(e) {}
      this.liveInputGain = null;
    }

    // Stop and disconnect all active audio nodes safely
    this.activeSequence.forEach(nodeGroup => {
      try { nodeGroup.osc.stop(); } catch(e) {}
      try { nodeGroup.vibratoOsc.stop(); } catch(e) {}
      try { nodeGroup.trillLfo.stop(); } catch(e) {}
      try { nodeGroup.noiseSource.stop(); } catch(e) {}
      try { nodeGroup.nodesToDisconnect.forEach((n: AudioNode) => n.disconnect()); } catch(e) {}
    });
    this.activeSequence = [];

    if (this.onPhonemeTrigger) {
      this.onPhonemeTrigger(null, -1);
    }

    if (wasPlaying && this.onPlaybackEnd) {
      this.onPlaybackEnd();
    }
  }

  public async play(blocks: PhonemeSegment[][] | PhonemeSegment[], voice: VoiceConfig, effects?: AudioEffectsConfig) {
    this.init();
    if (!this.ctx || !this.analyser) return;

    this.stop();
    this.isPlaying = true;

    const playId = ++this.currentPlayId;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    const normalizedBlocks: PhonemeSegment[][] = (blocks.length > 0 && Array.isArray(blocks[0]))
      ? (blocks as PhonemeSegment[][])
      : [blocks as PhonemeSegment[]];

    // Calculate global index offsets for phoneme triggering
    let globalOffset = 0;
    const blockOffsets: number[] = [];
    normalizedBlocks.forEach(block => {
      blockOffsets.push(globalOffset);
      globalOffset += block.length;
    });

    const sampleRate = 22050; // Unified sample rate for perfect cache compatibility, ultra-low CPU load, and excellent quality

    // Set up continuous live audio effects graph in the live AudioContext
    this.liveInputGain = this.ctx.createGain();
    this.liveEffectNodes.push(this.liveInputGain);
    
    // Calculate total speech duration and natural effects tail
    const totalSpeechDurationSec = normalizedBlocks.reduce(
      (acc, b) => acc + b.reduce((s, seg) => s + seg.customDuration, 0) / 1000, 
      0
    );
    const tailDurationSec = this.getEffectsTailDuration(voice, effects);

    this.applyHumanizeEffects(
      this.ctx,
      this.liveInputGain,
      this.analyser,
      voice,
      effects,
      totalSpeechDurationSec + tailDurationSec + 10,
      this.liveEffectNodes
    );

    interface RenderedBlock {
      buffer: AudioBuffer;
      durationSec: number;
    }

    const renderedBlocks: (RenderedBlock | null)[] = new Array(normalizedBlocks.length).fill(null);

    // Renderer helper: renders dry vocal block
    const renderBlock = async (blockIdx: number): Promise<RenderedBlock | null> => {
      if (!this.isPlaying || playId !== this.currentPlayId) return null;

      const block = normalizedBlocks[blockIdx];
      const blockDurationMs = block.reduce((sum, s) => sum + s.customDuration, 0);
      const blockDurationSec = blockDurationMs / 1000;

      const cacheKey = this.generateCacheKey(block, voice);
      const cached = this.getCachedBuffer(cacheKey);
      if (cached) {
        return {
          buffer: cached,
          durationSec: blockDurationSec
        };
      }

      if (!this.isPlaying || playId !== this.currentPlayId) return null;

      const OfflineCtxClass = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
      const offlineCtx = new OfflineCtxClass(1, Math.max(sampleRate, Math.ceil(sampleRate * (blockDurationSec + 0.1))), sampleRate);

      const noiseBuffer = this.createNoiseBuffer(offlineCtx);
      let currentRelativeTime = 0;

      // Add a dynamics compressor to prevent clipping when boosting synthesis gain
      const comp = offlineCtx.createDynamicsCompressor();
      comp.threshold.setValueAtTime(-14, 0);
      comp.knee.setValueAtTime(8, 0);
      comp.ratio.setValueAtTime(4.0, 0);
      comp.attack.setValueAtTime(0.003, 0);
      comp.release.setValueAtTime(0.050, 0);
      comp.connect(offlineCtx.destination);

      if (!this.isPlaying || playId !== this.currentPlayId) return null;

      block.forEach((seg, idx) => {
        const durationSec = seg.customDuration / 1000;
        const startTime = currentRelativeTime;
        const endTime = startTime + durationSec;

        if (seg.phoneme.type === 'silence') {
          currentRelativeTime += durationSec;
          return;
        }

        const prevSeg = idx > 0 ? block[idx - 1] : undefined;
        const nextSeg = idx < block.length - 1 ? block[idx + 1] : undefined;
        this.synthesizeSegment(offlineCtx, comp, seg, startTime, endTime, noiseBuffer, voice, true, prevSeg, nextSeg);
        currentRelativeTime += durationSec;
      });

      if (!this.isPlaying || playId !== this.currentPlayId) return null;

      const buffer = await offlineCtx.startRendering();
      
      // Double check active ID before caching and returning to avoid pollution or race conditions
      if (!this.isPlaying || playId !== this.currentPlayId) return null;

      this.setCachedBuffer(cacheKey, buffer);
      return {
        buffer,
        durationSec: blockDurationSec
      };
    };

    // Pre-render the first block immediately to maximize startup speed!
    try {
      const firstBlock = await renderBlock(0);
      if (!firstBlock || !this.isPlaying || playId !== this.currentPlayId) {
        return;
      }
      renderedBlocks[0] = firstBlock;
    } catch (e) {
      console.error("Failed to render first block:", e);
      this.stop();
      return;
    }

    if (!this.isPlaying || playId !== this.currentPlayId) return;

    // Asynchronously pre-render remaining blocks sequentially in the background while the first block plays.
    // This serializes the work and uses a maximum of 1 background rendering thread at any time, keeping CPU usage extremely low.
    (async () => {
      for (let i = 1; i < normalizedBlocks.length; i++) {
        if (!this.isPlaying || playId !== this.currentPlayId) break;
        try {
          const rb = await renderBlock(i);
          if (rb) {
            renderedBlocks[i] = rb;
          }
        } catch (e) {
          console.error(`Failed to pre-render block ${i}:`, e);
        }
      }
    })();

    let currentBlockIdx = 0;

    const playNextBlock = async () => {
      if (!this.isPlaying || playId !== this.currentPlayId) return;

      if (currentBlockIdx >= normalizedBlocks.length) {
        // Speech text phonemes have finished: clear visual word/phoneme highlight
        if (this.onPhonemeTrigger) {
          this.onPhonemeTrigger(null, -1);
        }

        // Allow active effects tail (reverb reflections, delay echoes) to naturally decay and ring out into silence!
        const tailTimeoutId = window.setTimeout(() => {
          if (this.isPlaying && playId === this.currentPlayId) {
            this.stop();
          }
        }, tailDurationSec * 1000);
        this.timeouts.push(tailTimeoutId);
        return;
      }

      // Fallback polling (rarely needed since render is extremely fast)
      while (!renderedBlocks[currentBlockIdx]) {
        if (!this.isPlaying || playId !== this.currentPlayId) return;
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      const rb = renderedBlocks[currentBlockIdx]!;
      const block = normalizedBlocks[currentBlockIdx];
      const offset = blockOffsets[currentBlockIdx];

      const source = this.ctx!.createBufferSource();
      source.buffer = rb.buffer;
      
      // Feed into continuous live effects graph so previous sentence tails bleed seamlessly into current sentence!
      if (this.liveInputGain) {
        source.connect(this.liveInputGain);
      } else {
        source.connect(this.analyser!);
      }

      this.activeSource = source;

      // Schedule real-time tracking triggers for active visual syllable highlighting
      let timeAccumulator = 0;
      block.forEach((seg, index) => {
        const timeoutId = window.setTimeout(() => {
          if (this.isPlaying && playId === this.currentPlayId && this.onPhonemeTrigger) {
            this.onPhonemeTrigger(seg, offset + index);
          }
        }, timeAccumulator * 1000);
        this.timeouts.push(timeoutId);
        timeAccumulator += seg.customDuration / 1000;
      });

      // Schedule transition to the next block when this finishes
      const finalTimeoutId = window.setTimeout(() => {
        if (this.isPlaying && playId === this.currentPlayId) {
          currentBlockIdx++;
          playNextBlock();
        }
      }, rb.durationSec * 1000);
      this.timeouts.push(finalTimeoutId);

      source.start();
    };

    // Begin playing the first block instantly!
    playNextBlock();
  }

  public async preCache(blocks: PhonemeSegment[][] | PhonemeSegment[], voice: VoiceConfig, effects?: AudioEffectsConfig) {
    const normalizedBlocks: PhonemeSegment[][] = (blocks.length > 0 && Array.isArray(blocks[0]))
      ? (blocks as PhonemeSegment[][])
      : [blocks as PhonemeSegment[]];

    const sampleRate = 22050;

    for (const block of normalizedBlocks) {
      if (block.length === 0) continue;
      
      const cacheKey = this.generateCacheKey(block, voice);
      if (this.getCachedBuffer(cacheKey)) {
        continue;
      }

      try {
        const blockDurationMs = block.reduce((sum, s) => sum + s.customDuration, 0);
        const blockDurationSec = blockDurationMs / 1000;

        const OfflineCtxClass = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
        const offlineCtx = new OfflineCtxClass(1, Math.max(sampleRate, Math.ceil(sampleRate * (blockDurationSec + 0.1))), sampleRate);

        const noiseBuffer = this.createNoiseBuffer(offlineCtx);
        let currentRelativeTime = 0;

        const comp = offlineCtx.createDynamicsCompressor();
        comp.threshold.setValueAtTime(-14, 0);
        comp.knee.setValueAtTime(8, 0);
        comp.ratio.setValueAtTime(4.0, 0);
        comp.attack.setValueAtTime(0.003, 0);
        comp.release.setValueAtTime(0.050, 0);
        comp.connect(offlineCtx.destination);

        block.forEach((seg, idx) => {
          const durationSec = seg.customDuration / 1000;
          const startTime = currentRelativeTime;
          const endTime = startTime + durationSec;

          if (seg.phoneme.type === 'silence') {
            currentRelativeTime += durationSec;
            return;
          }

          const prevSeg = idx > 0 ? block[idx - 1] : undefined;
          const nextSeg = idx < block.length - 1 ? block[idx + 1] : undefined;
          this.synthesizeSegment(offlineCtx, comp, seg, startTime, endTime, noiseBuffer, voice, true, prevSeg, nextSeg);
          currentRelativeTime += durationSec;
        });

        const buffer = await offlineCtx.startRendering();
        this.setCachedBuffer(cacheKey, buffer);
      } catch (e) {
        // Safe to ignore background render cancellation
      }
    }
  }

  public async exportToWav(blocks: PhonemeSegment[][] | PhonemeSegment[], voice: VoiceConfig, effects?: AudioEffectsConfig): Promise<Blob> {
    const sampleRate = 22050;

    const normalizedBlocks: PhonemeSegment[][] = (blocks.length > 0 && Array.isArray(blocks[0]))
      ? (blocks as PhonemeSegment[][])
      : [blocks as PhonemeSegment[]];

    const totalSpeechDurationMs = normalizedBlocks.reduce(
      (acc, block) => acc + block.reduce((s, seg) => s + seg.customDuration, 0),
      0
    );
    const totalSpeechDurationSec = totalSpeechDurationMs / 1000;
    const tailDurationSec = this.getEffectsTailDuration(voice, effects);
    const totalRenderSec = totalSpeechDurationSec + tailDurationSec + 0.5;

    const OfflineCtxClass = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
    const offlineCtx = new OfflineCtxClass(1, Math.ceil(sampleRate * totalRenderSec), sampleRate);

    const noiseBuffer = this.createNoiseBuffer(offlineCtx);
    let currentRelativeTime = 0;

    // Add dynamics compressor
    const comp = offlineCtx.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-14, 0);
    comp.knee.setValueAtTime(8, 0);
    comp.ratio.setValueAtTime(4.0, 0);
    comp.attack.setValueAtTime(0.003, 0);
    comp.release.setValueAtTime(0.050, 0);

    // Apply continuous audio effects chain across the whole export so sentences bleed into each other and tail decays naturally
    this.applyHumanizeEffects(offlineCtx, comp, offlineCtx.destination, voice, effects, totalRenderSec);

    for (const block of normalizedBlocks) {
      block.forEach((seg, idx) => {
        const durationSec = seg.customDuration / 1000;
        const startTime = currentRelativeTime;
        const endTime = startTime + durationSec;

        if (seg.phoneme.type === 'silence') {
          currentRelativeTime += durationSec;
          return;
        }

        const prevSeg = idx > 0 ? block[idx - 1] : undefined;
        const nextSeg = idx < block.length - 1 ? block[idx + 1] : undefined;
        this.synthesizeSegment(offlineCtx, comp, seg, startTime, endTime, noiseBuffer, voice, true, prevSeg, nextSeg);
        currentRelativeTime += durationSec;
      });
    }

    const buffer = await offlineCtx.startRendering();
    return this.audioBufferToWavBlob(buffer);
  }

  private audioBufferToWavBlob(buffer: AudioBuffer): Blob {
    const numOfChan = 1; // mono
    const sampleRate = buffer.sampleRate;
    const format = 1; // 1 = raw 16-bit PCM
    const bitDepth = 16;
    
    const result = buffer.getChannelData(0);
    const bufferLen = result.length;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numOfChan * bytesPerSample;
    
    const arrayBuffer = new ArrayBuffer(44 + bufferLen * 2);
    const view = new DataView(arrayBuffer);
    
    // RIFF identifier
    this.writeString(view, 0, 'RIFF');
    // file length
    view.setUint32(4, 36 + bufferLen * 2, true);
    // RIFF type
    this.writeString(view, 8, 'WAVE');
    // format chunk identifier
    this.writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, format, true);
    // channel count
    view.setUint16(22, numOfChan, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * blockAlign, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, blockAlign, true);
    // bits per sample
    view.setUint16(34, bitDepth, true);
    // data chunk identifier
    this.writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, bufferLen * 2, true);
    
    // Write PCM audio samples
    let offset = 44;
    for (let i = 0; i < bufferLen; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, result[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  private synthesizeSegment(
    ctx: BaseAudioContext,
    destination: AudioNode,
    seg: PhonemeSegment,
    startTime: number,
    endTime: number,
    noiseBuffer: AudioBuffer,
    voice: VoiceConfig,
    isOffline: boolean = false,
    prevSeg?: PhonemeSegment,
    nextSeg?: PhonemeSegment
  ) {
    const symbol = seg.phoneme.symbol;
    const type = seg.phoneme.type;
    const duration = endTime - startTime;

    const voicedGain = seg.phoneme.voicedGain ?? 1.0;
    const noiseGain = seg.phoneme.noiseGain ?? 0;
    const aspirationGain = seg.phoneme.aspirationGain ?? 0;

    const hasVoicedSource = voicedGain > 0;
    const hasNoiseSource = noiseGain > 0 || aspirationGain > 0 || type === 'nasal' || type === 'affricate';
    const hasFormantBank = hasVoicedSource || aspirationGain > 0 || type === 'nasal';
    const hasSibilantPath = noiseGain > 0 || type === 'affricate';

    // 1. Create Voiced Source (Glottal Oscillation)
    let osc: OscillatorNode | null = null;
    let vibratoOsc: OscillatorNode | null = null;
    let vibratoGain: GainNode | null = null;
    let tiltFilter: BiquadFilterNode | null = null;
    let trillGain: GainNode | null = null;
    let trillLfo: OscillatorNode | null = null;

    let f0Start = seg.pitchStart;
    let f0End = seg.pitchEnd;

    if (hasVoicedSource) {
      osc = ctx.createOscillator();
      
      let waveType: OscillatorType = 'sawtooth';
      if (voice.gender === 'female') {
        waveType = 'sawtooth'; 
      } else if (voice.gender === 'child') {
        waveType = 'triangle';
      }
      osc.type = waveType;

      if (voice.gender === 'female') {
        f0Start *= 1.8;
        f0End *= 1.8;
      } else if (voice.gender === 'child') {
        f0Start *= 2.3;
        f0End *= 2.3;
      }

      osc.frequency.setValueAtTime(f0Start, startTime);
      osc.frequency.exponentialRampToValueAtTime(f0End, endTime);

      vibratoOsc = ctx.createOscillator();
      vibratoGain = ctx.createGain();
      const vibRate = seg.vibratoRateOverride !== undefined ? seg.vibratoRateOverride : voice.vibratoRate;
      const vibDepth = seg.vibratoDepthOverride !== undefined ? seg.vibratoDepthOverride : voice.vibratoDepth;
      vibratoOsc.frequency.value = vibRate;
      vibratoGain.gain.value = vibDepth * (f0Start * 0.05);

      vibratoOsc.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);

      tiltFilter = ctx.createBiquadFilter();
      tiltFilter.type = 'lowpass';
      tiltFilter.frequency.value = voice.gender === 'female' ? 2200 : 1300;

      osc.connect(tiltFilter);

      trillGain = ctx.createGain();
      trillGain.gain.value = 1.0;
      
      if (type === 'trill' && symbol.includes('r')) {
        trillLfo = ctx.createOscillator();
        trillLfo.type = 'triangle';
        trillLfo.frequency.value = 25;
        
        const trillMod = ctx.createGain();
        trillMod.gain.value = 0.45;
        
        trillLfo.connect(trillMod);
        trillGain.gain.setValueAtTime(0.7, startTime);
        trillMod.connect(trillGain.gain);
      }
      tiltFilter.connect(trillGain);
    }

    // 2. Create Unvoiced Noise Source (Buffer)
    let noiseSource: AudioBufferSourceNode | null = null;
    if (hasNoiseSource) {
      noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;
    }

    // 3. Formant Filter Bank (Parallel Filters: F1, F2, F3, F4)
    const formants: Formant[] = seg.phoneme.formants || SLOVAK_PHONEMES['a'].formants!;
    const filterNodes: BiquadFilterNode[] = [];
    const filterGains: GainNode[] = [];
    let formantSum: GainNode | null = null;

    if (hasFormantBank) {
      let fShift = voice.formantShift;
      if (voice.gender === 'female') fShift *= 1.15;
      if (voice.gender === 'child') fShift *= 1.30;

      formantSum = ctx.createGain();

      formants.forEach((formantData, fIdx) => {
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        
        const fFreq = formantData.frequency * fShift;
        const fQ = formantData.q;
        const fGainDb = formantData.gain;
        const fAmp = Math.pow(10, fGainDb / 20) * voicedGain;

        let startFreq = fFreq;
        let hasBending = false;

        if (type === 'vowel' && prevSeg) {
          const prevSym = prevSeg.phoneme.symbol;
          if (fIdx === 1) {
            hasBending = true;
            if (['t', 'd', 'n', 's', 'z', 'c', 'dz'].includes(prevSym)) {
              startFreq = 1750 * fShift;
            } else if (['p', 'b', 'm', 'f', 'v'].includes(prevSym)) {
              startFreq = 750 * fShift;
            } else if (['k', 'g', 'ch'].includes(prevSym)) {
              startFreq = 1500 * fShift;
            } else if (['ť', 'ď', 'ň', 'j', 'ľ', 'š', 'ž', 'č', 'dž'].includes(prevSym)) {
              startFreq = 2100 * fShift;
            } else {
              hasBending = false;
            }
          } else if (fIdx === 2) {
            hasBending = true;
            if (['ť', 'ď', 'ň', 'j', 'ľ'].includes(prevSym)) {
              startFreq = 2900 * fShift;
            } else if (['p', 'b', 'm'].includes(prevSym)) {
              startFreq = 1900 * fShift;
            } else {
              hasBending = false;
            }
          }
        }

        if (hasBending) {
          const transTime = Math.min(0.045, duration * 0.35);
          filter.frequency.setValueAtTime(startFreq, startTime);
          filter.frequency.exponentialRampToValueAtTime(fFreq, startTime + transTime);
        } else {
          filter.frequency.setValueAtTime(fFreq, startTime);
        }

        filter.Q.setValueAtTime(fQ, startTime);

        const fGainNode = ctx.createGain();
        fGainNode.gain.setValueAtTime(fAmp, startTime);

        if (trillGain) {
          trillGain.connect(filter);
        }

        if (noiseSource && (type === 'nasal' || seg.phoneme.aspirationGain)) {
          const aspGain = ctx.createGain();
          aspGain.gain.setValueAtTime((seg.phoneme.aspirationGain || 0.1) * 0.1, startTime);
          noiseSource.connect(aspGain);
          aspGain.connect(filter);
        }

        if (seg.targetPhoneme && seg.targetPhoneme.formants) {
          const nextFormant = seg.targetPhoneme.formants[fIdx];
          if (nextFormant) {
            const nextFreq = nextFormant.frequency * fShift;
            const nextAmp = Math.pow(10, nextFormant.gain / 20) * (seg.targetPhoneme.voicedGain ?? 1.0);
            
            filter.frequency.linearRampToValueAtTime(nextFreq, endTime);
            fGainNode.gain.linearRampToValueAtTime(nextAmp, endTime);
          }
        }

        filter.connect(fGainNode);
        fGainNode.connect(formantSum!);

        filterNodes.push(filter);
        filterGains.push(fGainNode);
      });
    }

    // 4. Sibilant/Fricative Bypass Path (Noise Filter for 's', 'š', 'f', 'ch')
    let fricativeFilter: BiquadFilterNode | null = null;
    let fricGNode: GainNode | null = null;
    let teethFilter: BiquadFilterNode | null = null;
    let sibilantDeesser: BiquadFilterNode | null = null;

    if (hasSibilantPath) {
      fricativeFilter = ctx.createBiquadFilter();
      fricativeFilter.type = 'bandpass';

      fricGNode = ctx.createGain();
      const nFreq = seg.phoneme.noiseFreq ?? 4000;
      
      const isSibilant = ['s', 'š', 'z', 'ž', 'c', 'č', 'dz', 'dž'].includes(symbol);
      const scaleFactorRange = isSibilant ? 0.35 : 0.15;
      
      const sibConfig = isSibilant && voice.sibilants && voice.sibilants[symbol]
        ? voice.sibilants[symbol]
        : { teethInfluence: 0.65, tonguePlacement: 0.0, tongueConstriction: 1.0 };

      let fShift = voice.formantShift;
      if (voice.gender === 'female') fShift *= 1.15;
      if (voice.gender === 'child') fShift *= 1.30;

      const finalNFreq = nFreq * Math.pow(2, (sibConfig.tonguePlacement ?? 0.0) * scaleFactorRange);

      const nQ = seg.phoneme.noiseBandwidth ? (3.6 / seg.phoneme.noiseBandwidth) : 3.0;
      const finalNQ = nQ * (sibConfig.tongueConstriction ?? 1.0);

      fricativeFilter.frequency.setValueAtTime(finalNFreq, startTime);
      fricativeFilter.Q.setValueAtTime(finalNQ, startTime);
      
      teethFilter = ctx.createBiquadFilter();
      teethFilter.type = 'peaking';
      teethFilter.frequency.setValueAtTime(8200 * (fShift ?? 1.0), startTime);
      teethFilter.Q.setValueAtTime(1.25, startTime);
      const teethGDb = ((sibConfig.teethInfluence ?? 0.65) - 0.5) * 8.5;
      teethFilter.gain.setValueAtTime(teethGDb, startTime);

      sibilantDeesser = ctx.createBiquadFilter();
      sibilantDeesser.type = 'highshelf';
      sibilantDeesser.frequency.setValueAtTime(11000, startTime);
      sibilantDeesser.gain.setValueAtTime(-5.5, startTime);

      if (type !== 'affricate') {
        fricGNode.gain.setValueAtTime(noiseGain * 0.105, startTime);
      }

      if (noiseSource) {
        noiseSource.connect(fricativeFilter);
      }
      fricativeFilter.connect(teethFilter);
      teethFilter.connect(sibilantDeesser);
      sibilantDeesser.connect(fricGNode);
    }

    // 5. Plosive Burst & Envelope Generator ('p', 't', 'k', 'b', 'd', 'g')
    const mainAmpGain = ctx.createGain();
    
    // Create master volume node to apply user control
    const volumeNode = ctx.createGain();
    const volScale = seg.volumeOverride !== undefined ? seg.volumeOverride : 1.0;
    volumeNode.gain.setValueAtTime(voice.volume * 1.8 * volScale, startTime);

    if (formantSum) {
      formantSum.connect(mainAmpGain);
    }
    if (fricGNode) {
      fricGNode.connect(mainAmpGain);
    }
    
    mainAmpGain.connect(volumeNode);
    volumeNode.connect(destination);

    // Track synthesized Web Audio nodes for systematic garbage-collection and instant Stop behavior
    const rawNodes = [
      osc, vibratoOsc, vibratoGain, tiltFilter, trillGain, 
      noiseSource, formantSum, fricativeFilter, teethFilter, sibilantDeesser, fricGNode, 
      mainAmpGain, volumeNode, ...filterNodes, ...filterGains
    ];
    const localNodes: AudioNode[] = rawNodes.filter(n => n !== null && n !== undefined) as AudioNode[];

    // EXPERT ACOUSTIC MODULATION: Glottal-coupling & turbulence flutter simulations
    // 1. Voiced Sibilant Flutter (Laryngeal Coupling): modulates sibilance with periodic vocal fold oscillations
    if (hasVoicedSource && fricGNode) {
      const glottalModulator = ctx.createOscillator();
      glottalModulator.type = 'sine';
      glottalModulator.frequency.setValueAtTime(f0Start, startTime);
      glottalModulator.frequency.exponentialRampToValueAtTime(f0End, endTime);

      const glottalGain = ctx.createGain();
      const baseGainVal = type !== 'affricate' ? noiseGain * 0.105 : noiseGain * (['č', 'dž'].includes(symbol) ? 0.22 : 0.28);
      const modDepth = baseGainVal * 0.42 * voicedGain;

      if (type === 'affricate') {
        const gapDuration = duration * 0.35;
        const releaseTime = startTime + gapDuration;
        const decayDuration = duration * 0.50;
        glottalGain.gain.setValueAtTime(0, startTime);
        glottalGain.gain.setValueAtTime(0, releaseTime - 0.003);
        glottalGain.gain.linearRampToValueAtTime(modDepth, releaseTime);
        glottalGain.gain.exponentialRampToValueAtTime(modDepth * 0.12, releaseTime + decayDuration);
        glottalGain.gain.linearRampToValueAtTime(0, endTime);
      } else {
        glottalGain.gain.setValueAtTime(modDepth, startTime);
      }

      glottalModulator.connect(glottalGain);
      glottalGain.connect(fricGNode.gain);

      glottalModulator.start(startTime);
      glottalModulator.stop(endTime);

      localNodes.push(glottalModulator, glottalGain);
    }

    // 2. Natural Airflow Jitter / Lung Turbulence Simulation: simulates sub-audible pressure fluctuations in unvoiced airflow
    if (fricGNode) {
      const turbulenceLfo = ctx.createOscillator();
      turbulenceLfo.type = 'sine';
      turbulenceLfo.frequency.setValueAtTime(8.2 + Math.random() * 4.5, startTime);

      const turbulenceGain = ctx.createGain();
      const baseGainVal = type !== 'affricate' ? noiseGain * 0.105 : noiseGain * (['č', 'dž'].includes(symbol) ? 0.22 : 0.28);
      const tblDepth = baseGainVal * 0.15;

      if (type === 'affricate') {
        const gapDuration = duration * 0.35;
        const releaseTime = startTime + gapDuration;
        const decayDuration = duration * 0.50;
        turbulenceGain.gain.setValueAtTime(0, startTime);
        turbulenceGain.gain.setValueAtTime(0, releaseTime - 0.003);
        turbulenceGain.gain.linearRampToValueAtTime(tblDepth, releaseTime);
        turbulenceGain.gain.exponentialRampToValueAtTime(tblDepth * 0.12, releaseTime + decayDuration);
        turbulenceGain.gain.linearRampToValueAtTime(0, endTime);
      } else {
        turbulenceGain.gain.setValueAtTime(tblDepth, startTime);
      }

      turbulenceLfo.connect(turbulenceGain);
      turbulenceGain.connect(fricGNode.gain);

      turbulenceLfo.start(startTime);
      turbulenceLfo.stop(endTime);

      localNodes.push(turbulenceLfo, turbulenceGain);
    }

    // 6. Standard Dynamic Volume Envelope scheduling
    if (type === 'plosive') {
      const gapDuration = duration * 0.65; // silent/hum part

      // Muffled low-frequency voiced hum for 'b', 'd', 'g', 'ď'
      let humOsc: OscillatorNode | null = null;
      let humGainNode: GainNode | null = null;
      if (voicedGain > 0) {
        humOsc = ctx.createOscillator();
        humOsc.type = 'sine';
        humOsc.frequency.setValueAtTime(75, startTime);
        
        humGainNode = ctx.createGain();
        humGainNode.gain.setValueAtTime(0.001, startTime);
        humGainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
        humGainNode.gain.setValueAtTime(0.2, startTime + gapDuration - 0.01);
        humGainNode.gain.linearRampToValueAtTime(0.001, startTime + gapDuration);
        
        humOsc.connect(humGainNode);
        humGainNode.connect(volumeNode);
      }

      // Main amplitude during closure
      mainAmpGain.gain.setValueAtTime(0.001, startTime);
      mainAmpGain.gain.setValueAtTime(0.001, startTime + gapDuration - 0.005);
      
      // Explosion/Burst
      mainAmpGain.gain.linearRampToValueAtTime(1.0, startTime + gapDuration);
      mainAmpGain.gain.setValueAtTime(1.0, startTime + gapDuration + 0.005);
      mainAmpGain.gain.linearRampToValueAtTime(0.001, endTime);

      if (humOsc) {
        humOsc.start(startTime);
        humOsc.stop(endTime);
        if (!isOffline) {
          this.activeSequence.push({
            osc: humOsc,
            vibratoOsc: null,
            trillLfo: null,
            noiseSource: null,
            nodesToDisconnect: [humOsc, humGainNode!]
          });
        }
      }
    } else if (type === 'affricate') {
      const gapDuration = duration * 0.35;
      const releaseTime = startTime + gapDuration;
      const decayDuration = duration * 0.50;

      let humOsc: OscillatorNode | null = null;
      let humGainNode: GainNode | null = null;
      if (voicedGain > 0) {
        humOsc = ctx.createOscillator();
        humOsc.type = 'sine';
        humOsc.frequency.setValueAtTime(80, startTime);
        
        humGainNode = ctx.createGain();
        humGainNode.gain.setValueAtTime(0.001, startTime);
        humGainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.01);
        humGainNode.gain.setValueAtTime(0.12, releaseTime - 0.01);
        humGainNode.gain.linearRampToValueAtTime(0.001, releaseTime);
        
        humOsc.connect(humGainNode);
        humGainNode.connect(volumeNode);

        localNodes.push(humOsc, humGainNode);
      }

      const peakVolume = ['č', 'dž'].includes(symbol) ? 0.38 : 0.48;
      mainAmpGain.gain.setValueAtTime(0.001, startTime);
      mainAmpGain.gain.setValueAtTime(0.001, releaseTime - 0.003);
      mainAmpGain.gain.linearRampToValueAtTime(peakVolume, releaseTime);
      mainAmpGain.gain.exponentialRampToValueAtTime(peakVolume * 0.14, releaseTime + decayDuration);
      mainAmpGain.gain.linearRampToValueAtTime(0.001, endTime);

      if (fricGNode) {
        fricGNode.gain.setValueAtTime(0.001, startTime);
        fricGNode.gain.setValueAtTime(0.001, releaseTime - 0.003);
        
        const noiseOnsetFactor = ['č', 'dž'].includes(symbol) ? 0.22 : 0.28;
        fricGNode.gain.setValueAtTime(noiseGain * noiseOnsetFactor, releaseTime);
        fricGNode.gain.exponentialRampToValueAtTime(noiseGain * (noiseOnsetFactor * 0.12), releaseTime + decayDuration);
        fricGNode.gain.linearRampToValueAtTime(0.001, endTime);
      }

      if (humOsc) {
        humOsc.start(startTime);
        humOsc.stop(endTime);
      }
    } else if (type === 'fricative') {
      const attack = Math.min(0.035, duration * 0.25);
      const decay = Math.min(0.035, duration * 0.25);

      mainAmpGain.gain.setValueAtTime(0.001, startTime);
      mainAmpGain.gain.linearRampToValueAtTime(1.0, startTime + attack);
      mainAmpGain.gain.setValueAtTime(1.0, endTime - decay);
      mainAmpGain.gain.linearRampToValueAtTime(0.001, endTime);
    } else {
      const attack = Math.min(0.02, duration * 0.15);
      const decay = Math.min(0.02, duration * 0.15);

      mainAmpGain.gain.setValueAtTime(0.001, startTime);
      mainAmpGain.gain.linearRampToValueAtTime(1.0, startTime + attack);
      mainAmpGain.gain.setValueAtTime(1.0, endTime - decay);
      mainAmpGain.gain.linearRampToValueAtTime(0.001, endTime);
    }

    // 7. Start Audio Sources
    if (osc) {
      osc.start(startTime);
      osc.stop(endTime);
    }

    if (vibratoOsc) {
      vibratoOsc.start(startTime);
      vibratoOsc.stop(endTime);
    }

    if (trillLfo) {
      trillLfo.start(startTime);
      trillLfo.stop(endTime);
    }

    if (noiseSource) {
      noiseSource.start(startTime);
      noiseSource.stop(endTime);
    }

    // Track active nodes so we can cancel playback instantly if user clicks 'Stop'
    if (!isOffline) {
      this.activeSequence.push({
        osc,
        vibratoOsc,
        trillLfo,
        noiseSource,
        nodesToDisconnect: localNodes
      });
    }
  }
}
export const synthInstance = new SlovakSpeechSynth();
