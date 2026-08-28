import { AudioEffectsConfig, ReverbRackConfig } from '../types';

export class AudioEffectsEngine {
  private static reverbCache = new Map<string, AudioBuffer>();

  // Helper to generate distortion curves
  public static makeDistortionCurve(amount: number, type: 'warm' | 'overdrive' | 'fuzz' | 'hard'): Float32Array {
    const k = Math.max(1, amount);
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;

      switch (type) {
        case 'warm': {
          // Soft tube/tape saturation curve
          const normX = x * (1 + k * 0.05);
          curve[i] = (3 / 2) * normX * (1 - (normX * normX) / 3);
          if (normX > 1) curve[i] = 1;
          if (normX < -1) curve[i] = -1;
          break;
        }
        case 'overdrive': {
          // Classic asymmetric overdrive
          curve[i] = ((3 + k * 0.1) * x * 20 * deg) / (Math.PI + k * 0.1 * Math.abs(x));
          break;
        }
        case 'fuzz': {
          // Symmetrical high-gain fuzz
          const sign = x < 0 ? -1 : 1;
          curve[i] = sign * (1 - Math.exp(-Math.abs(x * (1 + k * 0.2))));
          break;
        }
        case 'hard': {
          // Hard clipping
          const threshold = 1 / (1 + k * 0.08);
          curve[i] = Math.max(-threshold, Math.min(threshold, x)) * (1 / threshold);
          break;
        }
      }
    }
    return curve;
  }

  // Generate synthetic impulse response buffers for varied reverb types
  public static getReverbImpulse(ctx: BaseAudioContext, config: ReverbRackConfig): AudioBuffer {
    const sampleRate = ctx.sampleRate || 22050;
    const duration = Math.max(0.2, Math.min(8.0, config.decay));
    const length = Math.ceil(sampleRate * duration);
    const cacheKey = `${sampleRate}_${config.type}_${duration.toFixed(2)}_${config.damping.toFixed(2)}`;

    if (this.reverbCache.has(cacheKey)) {
      return this.reverbCache.get(cacheKey)!;
    }

    const impulse = ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    let decayFactor = 3.5;
    let diffusion = 1.0;
    let earlyReflectionsCount = 8;

    switch (config.type) {
      case 'room':
        decayFactor = 5.5;
        earlyReflectionsCount = 6;
        break;
      case 'hall':
        decayFactor = 3.0;
        earlyReflectionsCount = 14;
        break;
      case 'cathedral':
        decayFactor = 1.6;
        earlyReflectionsCount = 24;
        break;
      case 'plate':
        decayFactor = 3.8;
        diffusion = 1.8;
        earlyReflectionsCount = 4;
        break;
      case 'cosmic':
        decayFactor = 1.1;
        earlyReflectionsCount = 30;
        break;
    }

    // Precalculate early reflections
    const reflections: { timeIdx: number; gainL: number; gainR: number }[] = [];
    for (let r = 0; r < earlyReflectionsCount; r++) {
      reflections.push({
        timeIdx: Math.floor((Math.random() * 0.08 + 0.005) * sampleRate),
        gainL: (Math.random() * 2 - 1) * 0.4,
        gainR: (Math.random() * 2 - 1) * 0.4
      });
    }

    const damping = Math.max(0, Math.min(1, config.damping));

    for (let i = 0; i < length; i++) {
      const percent = i / length;
      const decay = Math.exp(-percent * decayFactor);
      const highCutFactor = 1.0 - (percent * damping * 0.85);

      let noiseL = (Math.random() * 2 - 1) * diffusion;
      let noiseR = (Math.random() * 2 - 1) * diffusion;

      // Add early reflections energy
      for (const ref of reflections) {
        if (i >= ref.timeIdx && i < ref.timeIdx + 40) {
          noiseL += ref.gainL;
          noiseR += ref.gainR;
        }
      }

      left[i] = noiseL * decay * highCutFactor * 0.6;
      right[i] = noiseR * decay * highCutFactor * 0.6;
    }

    this.reverbCache.set(cacheKey, impulse);
    return impulse;
  }

  // Apply complete effects chain between sourceNode and destinationNode
  public static applyEffects(
    ctx: BaseAudioContext,
    sourceNode: AudioNode,
    destinationNode: AudioNode,
    fx: AudioEffectsConfig,
    totalDurationSec: number = 2.0,
    trackedNodes?: AudioNode[]
  ) {
    if (fx.masterBypass) {
      // Connect directly if bypassed
      sourceNode.connect(destinationNode);
      return;
    }

    const isOffline = typeof OfflineAudioContext !== 'undefined' && ctx instanceof OfflineAudioContext;

    const track = <T extends AudioNode>(node: T): T => {
      if (trackedNodes) {
        trackedNodes.push(node);
      }
      return node;
    };

    let currentNode: AudioNode = sourceNode;

    // Helper: Dry/Wet mixing node pair
    const createDryWet = (
      input: AudioNode,
      wetProcessBuilder: (wetInput: AudioNode) => AudioNode,
      mixAmount: number
    ): AudioNode => {
      if (mixAmount <= 0.001) return input;
      if (mixAmount >= 0.999) return wetProcessBuilder(input);

      const dryGain = track(ctx.createGain());
      const wetGain = track(ctx.createGain());
      const outputSum = track(ctx.createGain());

      dryGain.gain.setValueAtTime(1 - mixAmount, 0);
      wetGain.gain.setValueAtTime(mixAmount, 0);

      input.connect(dryGain);
      dryGain.connect(outputSum);

      const wetOutput = wetProcessBuilder(input);
      wetOutput.connect(wetGain);
      wetGain.connect(outputSum);

      return outputSum;
    };

    // 1. PITCH HARMONIZER / SUB-OCTAVE / ROBOT MONOTONE
    if (fx.pitchHarmonizer.enabled) {
      currentNode = createDryWet(currentNode, (wetIn) => {
        const outGain = track(ctx.createGain());

        // Sub-harmonic octave generator (-12 semitones)
        if (fx.pitchHarmonizer.subHarmonic > 0.05) {
          const subFilter = track(ctx.createBiquadFilter());
          subFilter.type = 'lowpass';
          subFilter.frequency.setValueAtTime(220, 0);

          const subGain = track(ctx.createGain());
          subGain.gain.setValueAtTime(fx.pitchHarmonizer.subHarmonic * 0.7, 0);

          // Full-wave rectifier wave shaping for octave frequency dividing
          const rectifier = track(ctx.createWaveShaper());
          const rectCurve = new Float32Array(1024);
          for (let k = 0; k < 1024; k++) {
            const x = (k * 2) / 1024 - 1;
            rectCurve[k] = Math.abs(x) * 2 - 0.5;
          }
          rectifier.curve = rectCurve;

          wetIn.connect(subFilter);
          subFilter.connect(rectifier);
          rectifier.connect(subGain);
          subGain.connect(outGain);
        }

        // Robot monotone vocoder carrier injection
        if (fx.pitchHarmonizer.robotMonotone) {
          const robotOsc = (ctx as any).createOscillator ? track((ctx as any).createOscillator()) : null;
          if (robotOsc) {
            robotOsc.type = 'sawtooth';
            robotOsc.frequency.setValueAtTime(110, 0);

            const carrierFilter = track(ctx.createBiquadFilter());
            carrierFilter.type = 'bandpass';
            carrierFilter.frequency.setValueAtTime(650, 0);
            carrierFilter.Q.setValueAtTime(3.0, 0);

            const modGain = track(ctx.createGain());
            modGain.gain.setValueAtTime(0.5, 0);

            robotOsc.connect(carrierFilter);
            carrierFilter.connect(modGain);
            modGain.connect(outGain);

            try {
              robotOsc.start(0);
              if (isOffline) {
                robotOsc.stop(totalDurationSec + 10);
              }
            } catch (e) {}
          }
        }

        // Fifth harmonic (+7 semitones presence)
        if (fx.pitchHarmonizer.fifthHarmonic > 0.05) {
          const fifthFilter = track(ctx.createBiquadFilter());
          fifthFilter.type = 'peaking';
          fifthFilter.frequency.setValueAtTime(1500, 0);
          fifthFilter.gain.setValueAtTime(8.0 * fx.pitchHarmonizer.fifthHarmonic, 0);
          fifthFilter.Q.setValueAtTime(2.5, 0);

          wetIn.connect(fifthFilter);
          fifthFilter.connect(outGain);
        } else {
          wetIn.connect(outGain);
        }

        return outGain;
      }, fx.pitchHarmonizer.mix);
    }

    // 2. AUTO-WAH / DYNAMIC RESONANT FILTER
    if (fx.autoWah.enabled) {
      currentNode = createDryWet(currentNode, (wetIn) => {
        const wahFilter = track(ctx.createBiquadFilter());
        wahFilter.type = 'bandpass';
        wahFilter.frequency.setValueAtTime(fx.autoWah.baseFreq, 0);
        wahFilter.Q.setValueAtTime(fx.autoWah.resonance, 0);

        // LFO sweep
        const lfo = (ctx as any).createOscillator ? track((ctx as any).createOscillator()) : null;
        if (lfo) {
          lfo.type = 'sine';
          lfo.frequency.setValueAtTime(fx.autoWah.speed, 0);

          const lfoGain = track(ctx.createGain());
          lfoGain.gain.setValueAtTime(fx.autoWah.sweepRange, 0);

          lfo.connect(lfoGain);
          lfoGain.connect(wahFilter.frequency);

          try {
            lfo.start(0);
            if (isOffline) {
              lfo.stop(totalDurationSec + 10);
            }
          } catch (e) {}
        }

        wetIn.connect(wahFilter);
        return wahFilter;
      }, fx.autoWah.mix);
    }

    // 3. PARAMETRIC EQUALIZER (3-Band EQ)
    if (fx.eq.enabled) {
      const lowShelf = track(ctx.createBiquadFilter());
      lowShelf.type = 'lowshelf';
      lowShelf.frequency.setValueAtTime(fx.eq.lowFreq, 0);
      lowShelf.gain.setValueAtTime(fx.eq.lowGain, 0);

      const midPeak = track(ctx.createBiquadFilter());
      midPeak.type = 'peaking';
      midPeak.frequency.setValueAtTime(fx.eq.midFreq, 0);
      midPeak.gain.setValueAtTime(fx.eq.midGain, 0);
      midPeak.Q.setValueAtTime(fx.eq.midQ, 0);

      const highShelf = track(ctx.createBiquadFilter());
      highShelf.type = 'highshelf';
      highShelf.frequency.setValueAtTime(fx.eq.highFreq, 0);
      highShelf.gain.setValueAtTime(fx.eq.highGain, 0);

      currentNode.connect(lowShelf);
      lowShelf.connect(midPeak);
      midPeak.connect(highShelf);
      currentNode = highShelf;
    }

    // 4. DISTORTION / SATURATION
    if (fx.distortion.enabled) {
      currentNode = createDryWet(currentNode, (wetIn) => {
        const shaper = track(ctx.createWaveShaper());
        shaper.curve = this.makeDistortionCurve(fx.distortion.drive, fx.distortion.type) as any;
        shaper.oversample = '4x';

        const toneFilter = track(ctx.createBiquadFilter());
        toneFilter.type = 'lowpass';
        toneFilter.frequency.setValueAtTime(fx.distortion.tone, 0);

        const outGain = track(ctx.createGain());
        outGain.gain.setValueAtTime(fx.distortion.outputGain, 0);

        wetIn.connect(shaper);
        shaper.connect(toneFilter);
        toneFilter.connect(outGain);
        return outGain;
      }, fx.distortion.mix);
    }

    // 5. BITCRUSHER & LO-FI QUANTIZER
    if (fx.bitcrusher.enabled) {
      currentNode = createDryWet(currentNode, (wetIn) => {
        const shaper = track(ctx.createWaveShaper());
        const steps = Math.pow(2, Math.max(2, Math.min(16, fx.bitcrusher.bits)));
        const n_samples = 4096;
        const curve = new Float32Array(n_samples);
        for (let i = 0; i < n_samples; i++) {
          const x = (i * 2) / n_samples - 1;
          curve[i] = Math.round(x * steps) / steps;
        }
        shaper.curve = curve as any;

        // Downsampling antialias reduction emulation
        const downsampleFilter = track(ctx.createBiquadFilter());
        downsampleFilter.type = 'lowpass';
        const cutoff = Math.max(800, 11025 / Math.max(1, fx.bitcrusher.downsample));
        downsampleFilter.frequency.setValueAtTime(cutoff, 0);

        wetIn.connect(shaper);
        shaper.connect(downsampleFilter);
        return downsampleFilter;
      }, fx.bitcrusher.mix);
    }

    // 6. LO-FI SPECIAL FILTERS (Telephone, Megaphone, Walkie-Talkie, Vinyl, Underwater)
    if (fx.loFiFilter.enabled) {
      currentNode = createDryWet(currentNode, (wetIn) => {
        const highPass = track(ctx.createBiquadFilter());
        const lowPass = track(ctx.createBiquadFilter());
        const peakRes = track(ctx.createBiquadFilter());
        const outGain = track(ctx.createGain());

        switch (fx.loFiFilter.type) {
          case 'telephone':
            // Narrow bandpass: 350 Hz to 3400 Hz
            highPass.type = 'highpass';
            highPass.frequency.setValueAtTime(350, 0);
            lowPass.type = 'lowpass';
            lowPass.frequency.setValueAtTime(3400, 0);
            peakRes.type = 'peaking';
            peakRes.frequency.setValueAtTime(1400, 0);
            peakRes.gain.setValueAtTime(4.0 * fx.loFiFilter.intensity, 0);
            break;

          case 'megaphone':
            // Piercing mid-range horn resonance: 550 Hz to 2800 Hz + high boost
            highPass.type = 'highpass';
            highPass.frequency.setValueAtTime(550, 0);
            lowPass.type = 'lowpass';
            lowPass.frequency.setValueAtTime(2800, 0);
            peakRes.type = 'peaking';
            peakRes.frequency.setValueAtTime(1800, 0);
            peakRes.gain.setValueAtTime(9.0 * fx.loFiFilter.intensity, 0);
            peakRes.Q.setValueAtTime(3.5, 0);
            break;

          case 'walkie':
            // Harsh communications squelch: 650 Hz to 2400 Hz
            highPass.type = 'highpass';
            highPass.frequency.setValueAtTime(650, 0);
            lowPass.type = 'lowpass';
            lowPass.frequency.setValueAtTime(2400, 0);
            peakRes.type = 'peaking';
            peakRes.frequency.setValueAtTime(1200, 0);
            peakRes.gain.setValueAtTime(6.0 * fx.loFiFilter.intensity, 0);
            break;

          case 'vinyl':
            // Warm vintage gramophone roll-off
            highPass.type = 'highpass';
            highPass.frequency.setValueAtTime(180, 0);
            lowPass.type = 'lowpass';
            lowPass.frequency.setValueAtTime(4800, 0);
            peakRes.type = 'peaking';
            peakRes.frequency.setValueAtTime(800, 0);
            peakRes.gain.setValueAtTime(3.0, 0);
            break;

          case 'radio':
            // AM radio boxiness
            highPass.type = 'highpass';
            highPass.frequency.setValueAtTime(300, 0);
            lowPass.type = 'lowpass';
            lowPass.frequency.setValueAtTime(4200, 0);
            peakRes.type = 'peaking';
            peakRes.frequency.setValueAtTime(1500, 0);
            peakRes.gain.setValueAtTime(5.0 * fx.loFiFilter.intensity, 0);
            break;

          case 'underwater':
            // Deep muffled submerged water acoustic
            highPass.type = 'highpass';
            highPass.frequency.setValueAtTime(40, 0);
            lowPass.type = 'lowpass';
            lowPass.frequency.setValueAtTime(420, 0);
            peakRes.type = 'peaking';
            peakRes.frequency.setValueAtTime(280, 0);
            peakRes.gain.setValueAtTime(6.0, 0);
            peakRes.Q.setValueAtTime(4.0, 0);
            break;
        }

        wetIn.connect(highPass);
        highPass.connect(lowPass);
        lowPass.connect(peakRes);
        peakRes.connect(outGain);
        return outGain;
      }, fx.loFiFilter.mix);
    }

    // 7. TREMOLO & RING MODULATOR
    if (fx.tremoloRingMod.enabled) {
      currentNode = createDryWet(currentNode, (wetIn) => {
        const modGain = track(ctx.createGain());
        const lfo = (ctx as any).createOscillator ? track((ctx as any).createOscillator()) : null;

        if (lfo) {
          lfo.type = fx.tremoloRingMod.waveform;
          lfo.frequency.setValueAtTime(fx.tremoloRingMod.rate, 0);

          const lfoDepthGain = track(ctx.createGain());
          const depth = Math.max(0, Math.min(1, fx.tremoloRingMod.depth));

          if (fx.tremoloRingMod.mode === 'tremolo') {
            // Amplitude modulation (Tremolo): center around (1 - depth/2)
            modGain.gain.setValueAtTime(1.0 - depth * 0.5, 0);
            lfoDepthGain.gain.setValueAtTime(depth * 0.5, 0);
          } else {
            // Ring modulation: full bipolar multiplication
            modGain.gain.setValueAtTime(0.0, 0);
            lfoDepthGain.gain.setValueAtTime(depth, 0);
          }

          lfo.connect(lfoDepthGain);
          lfoDepthGain.connect(modGain.gain);

          try {
            lfo.start(0);
            if (isOffline) {
              lfo.stop(totalDurationSec + 10);
            }
          } catch (e) {}
        }

        wetIn.connect(modGain);
        return modGain;
      }, fx.tremoloRingMod.mix);
    }

    // 8. CHORUS
    if (fx.chorus.enabled) {
      currentNode = createDryWet(currentNode, (wetIn) => {
        const delayNode = track(ctx.createDelay());
        const baseDelaySec = Math.max(0.005, fx.chorus.delay / 1000);
        delayNode.delayTime.setValueAtTime(baseDelaySec, 0);

        const lfo = (ctx as any).createOscillator ? track((ctx as any).createOscillator()) : null;
        if (lfo) {
          lfo.type = 'sine';
          lfo.frequency.setValueAtTime(fx.chorus.rate, 0);

          const lfoGain = track(ctx.createGain());
          const depthSec = Math.max(0.0005, fx.chorus.depth / 1000);
          lfoGain.gain.setValueAtTime(depthSec, 0);

          lfo.connect(lfoGain);
          lfoGain.connect(delayNode.delayTime);

          try {
            lfo.start(0);
            if (isOffline) {
              lfo.stop(totalDurationSec + 10);
            }
          } catch (e) {}
        }

        const feedbackGain = track(ctx.createGain());
        feedbackGain.gain.setValueAtTime(fx.chorus.feedback, 0);

        wetIn.connect(delayNode);
        delayNode.connect(feedbackGain);
        feedbackGain.connect(delayNode);

        return delayNode;
      }, fx.chorus.mix);
    }

    // 9. FLANGER / PHASER
    if (fx.flangerPhaser.enabled) {
      currentNode = createDryWet(currentNode, (wetIn) => {
        if (fx.flangerPhaser.mode === 'flanger') {
          const flangerDelay = track(ctx.createDelay());
          flangerDelay.delayTime.setValueAtTime(0.003, 0);

          const lfo = (ctx as any).createOscillator ? track((ctx as any).createOscillator()) : null;
          if (lfo) {
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(fx.flangerPhaser.rate, 0);

            const lfoGain = track(ctx.createGain());
            lfoGain.gain.setValueAtTime(0.0025 * fx.flangerPhaser.depth, 0);

            lfo.connect(lfoGain);
            lfoGain.connect(flangerDelay.delayTime);

            try {
              lfo.start(0);
              if (isOffline) {
                lfo.stop(totalDurationSec + 10);
              }
            } catch (e) {}
          }

          const fb = track(ctx.createGain());
          fb.gain.setValueAtTime(fx.flangerPhaser.feedback, 0);

          wetIn.connect(flangerDelay);
          flangerDelay.connect(fb);
          fb.connect(flangerDelay);

          return flangerDelay;
        } else {
          // Phaser: 4-stage all-pass ladder filter
          const ap1 = track(ctx.createBiquadFilter());
          const ap2 = track(ctx.createBiquadFilter());
          const ap3 = track(ctx.createBiquadFilter());
          const ap4 = track(ctx.createBiquadFilter());

          [ap1, ap2, ap3, ap4].forEach(ap => {
            ap.type = 'allpass';
            ap.frequency.setValueAtTime(fx.flangerPhaser.baseFreq, 0);
          });

          const lfo = (ctx as any).createOscillator ? track((ctx as any).createOscillator()) : null;
          if (lfo) {
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(fx.flangerPhaser.rate, 0);

            const lfoGain = track(ctx.createGain());
            lfoGain.gain.setValueAtTime(fx.flangerPhaser.baseFreq * 0.75 * fx.flangerPhaser.depth, 0);

            lfo.connect(lfoGain);
            lfoGain.connect(ap1.frequency);
            lfoGain.connect(ap2.frequency);
            lfoGain.connect(ap3.frequency);
            lfoGain.connect(ap4.frequency);

            try {
              lfo.start(0);
              if (isOffline) {
                lfo.stop(totalDurationSec + 10);
              }
            } catch (e) {}
          }

          const fb = track(ctx.createGain());
          fb.gain.setValueAtTime(fx.flangerPhaser.feedback * 0.6, 0);

          wetIn.connect(ap1);
          ap1.connect(ap2);
          ap2.connect(ap3);
          ap3.connect(ap4);
          ap4.connect(fb);
          fb.connect(ap1);

          return ap4;
        }
      }, fx.flangerPhaser.mix);
    }

    // 10. DELAY / ECHO & PING-PONG
    if (fx.delay.enabled) {
      currentNode = createDryWet(currentNode, (wetIn) => {
        const delayNode = track(ctx.createDelay());
        const delaySec = Math.max(0.02, Math.min(1.0, fx.delay.time / 1000));
        delayNode.delayTime.setValueAtTime(delaySec, 0);

        const feedback = track(ctx.createGain());
        feedback.gain.setValueAtTime(Math.min(0.9, fx.delay.feedback), 0);

        const dampFilter = track(ctx.createBiquadFilter());
        dampFilter.type = 'lowpass';
        dampFilter.frequency.setValueAtTime(Math.max(500, fx.delay.damping), 0);

        wetIn.connect(delayNode);
        delayNode.connect(dampFilter);
        dampFilter.connect(feedback);
        feedback.connect(delayNode);

        return dampFilter;
      }, fx.delay.mix);
    }

    // 11. REVERB RACK (Studio, Hall, Cathedral, Plate, Cosmic)
    if (fx.reverb.enabled) {
      currentNode = createDryWet(currentNode, (wetIn) => {
        const convolver = track(ctx.createConvolver());
        convolver.buffer = this.getReverbImpulse(ctx, fx.reverb);

        // Pre-delay
        if (fx.reverb.preDelay > 0) {
          const preDelayNode = track(ctx.createDelay());
          preDelayNode.delayTime.setValueAtTime(fx.reverb.preDelay / 1000, 0);
          wetIn.connect(preDelayNode);
          preDelayNode.connect(convolver);
        } else {
          wetIn.connect(convolver);
        }

        return convolver;
      }, fx.reverb.mix);
    }

    // 12. DYNAMIC COMPRESSOR & LIMITER
    if (fx.compressor.enabled) {
      const comp = track(ctx.createDynamicsCompressor());
      comp.threshold.setValueAtTime(fx.compressor.threshold, 0);
      comp.ratio.setValueAtTime(fx.compressor.ratio, 0);
      comp.attack.setValueAtTime(fx.compressor.attack / 1000, 0);
      comp.release.setValueAtTime(fx.compressor.release / 1000, 0);

      const makeup = track(ctx.createGain());
      const gainLin = Math.pow(10, fx.compressor.makeupGain / 20);
      makeup.gain.setValueAtTime(gainLin, 0);

      currentNode.connect(comp);
      comp.connect(makeup);
      currentNode = makeup;
    }

    // 13. MASTER GAIN TRIM
    const masterGainNode = track(ctx.createGain());
    const finalMasterGain = Math.max(0, Math.min(2.5, fx.masterGain));
    masterGainNode.gain.setValueAtTime(finalMasterGain, 0);

    currentNode.connect(masterGainNode);
    masterGainNode.connect(destinationNode);
  }

  // Pre-configured Sound Effect Chains (Presets)
  public static getPresets(): Record<string, { name: string; desc: string; config: AudioEffectsConfig }> {
    return {
      clean: {
        name: 'Čistý hlas (Default)',
        desc: 'Prirodzený, čistý hlas bez prídavných efektov',
        config: {
          masterBypass: false,
          masterGain: 1.0,
          eq: { enabled: false, lowGain: 0, lowFreq: 120, midGain: 0, midFreq: 1000, midQ: 1.0, highGain: 0, highFreq: 6000 },
          distortion: { enabled: false, type: 'warm', drive: 20, tone: 5000, mix: 0.5, outputGain: 1.0 },
          bitcrusher: { enabled: false, bits: 8, downsample: 4, mix: 0.7 },
          chorus: { enabled: false, rate: 1.5, depth: 3.5, delay: 15, feedback: 0.2, mix: 0.4 },
          flangerPhaser: { enabled: false, mode: 'flanger', rate: 0.5, depth: 0.7, feedback: 0.5, baseFreq: 800, mix: 0.45 },
          delay: { enabled: false, time: 240, feedback: 0.4, damping: 4000, pingPong: true, mix: 0.35 },
          reverb: { enabled: false, type: 'room', decay: 1.5, preDelay: 10, damping: 0.3, mix: 0.3 },
          tremoloRingMod: { enabled: false, mode: 'tremolo', rate: 5.0, depth: 0.6, waveform: 'sine', mix: 0.5 },
          loFiFilter: { enabled: false, type: 'telephone', intensity: 0.8, noiseCrackle: 0.3, mix: 0.8 },
          pitchHarmonizer: { enabled: false, pitchShiftSemitones: 0, robotMonotone: false, subHarmonic: 0.0, fifthHarmonic: 0.0, mix: 0.5 },
          autoWah: { enabled: false, baseFreq: 400, sweepRange: 1200, speed: 2.0, resonance: 6.0, mix: 0.5 },
          stereoWidener: { enabled: false, width: 100, haasDelayMs: 10 },
          compressor: { enabled: false, threshold: -18, ratio: 3.0, attack: 10, release: 80, makeupGain: 2.0 }
        }
      },

      broadcast: {
        name: 'Rádiový moderátor (Studio Broadcast)',
        desc: 'Plné hrejivé basy, jemný kompresor a štúdiový dozvuk',
        config: {
          masterBypass: false,
          masterGain: 1.05,
          eq: { enabled: true, lowGain: 4.5, lowFreq: 140, midGain: 2.0, midFreq: 2400, midQ: 1.2, highGain: -2.5, highFreq: 8000 },
          distortion: { enabled: true, type: 'warm', drive: 12, tone: 7000, mix: 0.25, outputGain: 1.0 },
          bitcrusher: { enabled: false, bits: 8, downsample: 4, mix: 0.7 },
          chorus: { enabled: false, rate: 1.5, depth: 3.5, delay: 15, feedback: 0.2, mix: 0.4 },
          flangerPhaser: { enabled: false, mode: 'flanger', rate: 0.5, depth: 0.7, feedback: 0.5, baseFreq: 800, mix: 0.45 },
          delay: { enabled: false, time: 240, feedback: 0.4, damping: 4000, pingPong: true, mix: 0.35 },
          reverb: { enabled: true, type: 'room', decay: 0.8, preDelay: 5, damping: 0.5, mix: 0.18 },
          tremoloRingMod: { enabled: false, mode: 'tremolo', rate: 5.0, depth: 0.6, waveform: 'sine', mix: 0.5 },
          loFiFilter: { enabled: false, type: 'telephone', intensity: 0.8, noiseCrackle: 0.3, mix: 0.8 },
          pitchHarmonizer: { enabled: false, pitchShiftSemitones: 0, robotMonotone: false, subHarmonic: 0.0, fifthHarmonic: 0.0, mix: 0.5 },
          autoWah: { enabled: false, baseFreq: 400, sweepRange: 1200, speed: 2.0, resonance: 6.0, mix: 0.5 },
          stereoWidener: { enabled: false, width: 100, haasDelayMs: 10 },
          compressor: { enabled: true, threshold: -20, ratio: 4.5, attack: 5, release: 60, makeupGain: 3.5 }
        }
      },

      cyberRobot: {
        name: 'Cyber Robot (Kovový kybor)',
        desc: 'Kovový ring modulátor, bitcrusher a robotický tón',
        config: {
          masterBypass: false,
          masterGain: 1.0,
          eq: { enabled: true, lowGain: -4.0, lowFreq: 200, midGain: 6.0, midFreq: 1800, midQ: 2.5, highGain: 3.0, highFreq: 5000 },
          distortion: { enabled: true, type: 'overdrive', drive: 35, tone: 4000, mix: 0.45, outputGain: 1.0 },
          bitcrusher: { enabled: true, bits: 6, downsample: 3, mix: 0.6 },
          chorus: { enabled: true, rate: 3.2, depth: 5.0, delay: 10, feedback: 0.4, mix: 0.5 },
          flangerPhaser: { enabled: false, mode: 'flanger', rate: 0.5, depth: 0.7, feedback: 0.5, baseFreq: 800, mix: 0.45 },
          delay: { enabled: true, time: 90, feedback: 0.35, damping: 3000, pingPong: false, mix: 0.3 },
          reverb: { enabled: true, type: 'plate', decay: 1.4, preDelay: 0, damping: 0.2, mix: 0.25 },
          tremoloRingMod: { enabled: true, mode: 'ringmod', rate: 125, depth: 0.85, waveform: 'triangle', mix: 0.65 },
          loFiFilter: { enabled: false, type: 'telephone', intensity: 0.8, noiseCrackle: 0.3, mix: 0.8 },
          pitchHarmonizer: { enabled: true, pitchShiftSemitones: 0, robotMonotone: true, subHarmonic: 0.3, fifthHarmonic: 0.2, mix: 0.75 },
          autoWah: { enabled: false, baseFreq: 400, sweepRange: 1200, speed: 2.0, resonance: 6.0, mix: 0.5 },
          stereoWidener: { enabled: false, width: 100, haasDelayMs: 10 },
          compressor: { enabled: true, threshold: -16, ratio: 6.0, attack: 2, release: 40, makeupGain: 4.0 }
        }
      },

      vintageTelephone: {
        name: 'Starý telefón 1930 (Vintage Telephone)',
        desc: 'Orezané frekvencie, jemný šum a rezonancia starého slúchadla',
        config: {
          masterBypass: false,
          masterGain: 1.15,
          eq: { enabled: true, lowGain: -16.0, lowFreq: 300, midGain: 5.0, midFreq: 1400, midQ: 2.0, highGain: -14.0, highFreq: 3800 },
          distortion: { enabled: true, type: 'warm', drive: 30, tone: 3200, mix: 0.4, outputGain: 1.1 },
          bitcrusher: { enabled: false, bits: 8, downsample: 4, mix: 0.7 },
          chorus: { enabled: false, rate: 1.5, depth: 3.5, delay: 15, feedback: 0.2, mix: 0.4 },
          flangerPhaser: { enabled: false, mode: 'flanger', rate: 0.5, depth: 0.7, feedback: 0.5, baseFreq: 800, mix: 0.45 },
          delay: { enabled: false, time: 240, feedback: 0.4, damping: 4000, pingPong: true, mix: 0.35 },
          reverb: { enabled: true, type: 'room', decay: 0.4, preDelay: 0, damping: 0.8, mix: 0.15 },
          tremoloRingMod: { enabled: false, mode: 'tremolo', rate: 5.0, depth: 0.6, waveform: 'sine', mix: 0.5 },
          loFiFilter: { enabled: true, type: 'telephone', intensity: 0.95, noiseCrackle: 0.4, mix: 0.9 },
          pitchHarmonizer: { enabled: false, pitchShiftSemitones: 0, robotMonotone: false, subHarmonic: 0.0, fifthHarmonic: 0.0, mix: 0.5 },
          autoWah: { enabled: false, baseFreq: 400, sweepRange: 1200, speed: 2.0, resonance: 6.0, mix: 0.5 },
          stereoWidener: { enabled: false, width: 100, haasDelayMs: 10 },
          compressor: { enabled: true, threshold: -22, ratio: 8.0, attack: 2, release: 40, makeupGain: 5.0 }
        }
      },

      megaCathedral: {
        name: 'Monumentálna Katedrála (Mega Reverb & Echo)',
        desc: 'Obrovský posvätný priestor s hlbokým dozvukom a ozvenou',
        config: {
          masterBypass: false,
          masterGain: 0.95,
          eq: { enabled: true, lowGain: 2.0, lowFreq: 150, midGain: -1.5, midFreq: 1200, midQ: 0.8, highGain: 3.0, highFreq: 5000 },
          distortion: { enabled: false, type: 'warm', drive: 20, tone: 5000, mix: 0.5, outputGain: 1.0 },
          bitcrusher: { enabled: false, bits: 8, downsample: 4, mix: 0.7 },
          chorus: { enabled: true, rate: 0.6, depth: 4.0, delay: 20, feedback: 0.3, mix: 0.35 },
          flangerPhaser: { enabled: false, mode: 'flanger', rate: 0.5, depth: 0.7, feedback: 0.5, baseFreq: 800, mix: 0.45 },
          delay: { enabled: true, time: 380, feedback: 0.55, damping: 2800, pingPong: true, mix: 0.4 },
          reverb: { enabled: true, type: 'cathedral', decay: 4.8, preDelay: 35, damping: 0.35, mix: 0.55 },
          tremoloRingMod: { enabled: false, mode: 'tremolo', rate: 5.0, depth: 0.6, waveform: 'sine', mix: 0.5 },
          loFiFilter: { enabled: false, type: 'telephone', intensity: 0.8, noiseCrackle: 0.3, mix: 0.8 },
          pitchHarmonizer: { enabled: false, pitchShiftSemitones: 0, robotMonotone: false, subHarmonic: 0.0, fifthHarmonic: 0.0, mix: 0.5 },
          autoWah: { enabled: false, baseFreq: 400, sweepRange: 1200, speed: 2.0, resonance: 6.0, mix: 0.5 },
          stereoWidener: { enabled: false, width: 100, haasDelayMs: 10 },
          compressor: { enabled: false, threshold: -18, ratio: 3.0, attack: 10, release: 80, makeupGain: 2.0 }
        }
      },

      megaphone: {
        name: 'Policajný Megafón (Megaphone / Bullhorn)',
        desc: 'Priebojný, drsný hlas s vysokou stredovou rezonanciou a saturáciou',
        config: {
          masterBypass: false,
          masterGain: 1.1,
          eq: { enabled: true, lowGain: -18.0, lowFreq: 400, midGain: 8.0, midFreq: 1900, midQ: 3.0, highGain: -12.0, highFreq: 3500 },
          distortion: { enabled: true, type: 'hard', drive: 45, tone: 3200, mix: 0.65, outputGain: 1.2 },
          bitcrusher: { enabled: false, bits: 8, downsample: 4, mix: 0.7 },
          chorus: { enabled: false, rate: 1.5, depth: 3.5, delay: 15, feedback: 0.2, mix: 0.4 },
          flangerPhaser: { enabled: false, mode: 'flanger', rate: 0.5, depth: 0.7, feedback: 0.5, baseFreq: 800, mix: 0.45 },
          delay: { enabled: true, time: 110, feedback: 0.45, damping: 2500, pingPong: false, mix: 0.25 },
          reverb: { enabled: true, type: 'room', decay: 0.6, preDelay: 0, damping: 0.7, mix: 0.2 },
          tremoloRingMod: { enabled: false, mode: 'tremolo', rate: 5.0, depth: 0.6, waveform: 'sine', mix: 0.5 },
          loFiFilter: { enabled: true, type: 'megaphone', intensity: 0.9, noiseCrackle: 0.2, mix: 0.85 },
          pitchHarmonizer: { enabled: false, pitchShiftSemitones: 0, robotMonotone: false, subHarmonic: 0.0, fifthHarmonic: 0.0, mix: 0.5 },
          autoWah: { enabled: false, baseFreq: 400, sweepRange: 1200, speed: 2.0, resonance: 6.0, mix: 0.5 },
          stereoWidener: { enabled: false, width: 100, haasDelayMs: 10 },
          compressor: { enabled: true, threshold: -24, ratio: 12.0, attack: 1, release: 30, makeupGain: 6.0 }
        }
      },

      retro8Bit: {
        name: 'Retro 8-Bit Arkáda (Game Boy Voice)',
        desc: 'Kvantizovaný digitálny zvuk z 80. rokov',
        config: {
          masterBypass: false,
          masterGain: 1.0,
          eq: { enabled: true, lowGain: -6.0, lowFreq: 250, midGain: 4.0, midFreq: 1500, midQ: 1.5, highGain: -8.0, highFreq: 5000 },
          distortion: { enabled: false, type: 'warm', drive: 20, tone: 5000, mix: 0.5, outputGain: 1.0 },
          bitcrusher: { enabled: true, bits: 4, downsample: 6, mix: 0.9 },
          chorus: { enabled: false, rate: 1.5, depth: 3.5, delay: 15, feedback: 0.2, mix: 0.4 },
          flangerPhaser: { enabled: false, mode: 'flanger', rate: 0.5, depth: 0.7, feedback: 0.5, baseFreq: 800, mix: 0.45 },
          delay: { enabled: true, time: 140, feedback: 0.5, damping: 2000, pingPong: false, mix: 0.35 },
          reverb: { enabled: false, type: 'plate', decay: 1.0, preDelay: 0, damping: 0.5, mix: 0.2 },
          tremoloRingMod: { enabled: false, mode: 'tremolo', rate: 5.0, depth: 0.6, waveform: 'square', mix: 0.5 },
          loFiFilter: { enabled: false, type: 'radio', intensity: 0.8, noiseCrackle: 0.3, mix: 0.8 },
          pitchHarmonizer: { enabled: false, pitchShiftSemitones: 0, robotMonotone: false, subHarmonic: 0.0, fifthHarmonic: 0.0, mix: 0.5 },
          autoWah: { enabled: false, baseFreq: 400, sweepRange: 1200, speed: 2.0, resonance: 6.0, mix: 0.5 },
          stereoWidener: { enabled: false, width: 100, haasDelayMs: 10 },
          compressor: { enabled: true, threshold: -14, ratio: 5.0, attack: 5, release: 50, makeupGain: 2.5 }
        }
      },

      alienTransmission: {
        name: 'Mimozemský signál (Alien Sci-Fi)',
        desc: 'Fázový flanger, prstencová modulácia a vesmírny dozvuk',
        config: {
          masterBypass: false,
          masterGain: 0.95,
          eq: { enabled: true, lowGain: -4.0, lowFreq: 180, midGain: 3.0, midFreq: 2200, midQ: 2.0, highGain: 4.0, highFreq: 7000 },
          distortion: { enabled: false, type: 'warm', drive: 20, tone: 5000, mix: 0.5, outputGain: 1.0 },
          bitcrusher: { enabled: false, bits: 8, downsample: 4, mix: 0.7 },
          chorus: { enabled: true, rate: 4.5, depth: 6.0, delay: 18, feedback: 0.5, mix: 0.6 },
          flangerPhaser: { enabled: true, mode: 'phaser', rate: 1.2, depth: 0.9, feedback: 0.75, baseFreq: 1200, mix: 0.7 },
          delay: { enabled: true, time: 260, feedback: 0.6, damping: 4500, pingPong: true, mix: 0.45 },
          reverb: { enabled: true, type: 'cosmic', decay: 4.2, preDelay: 25, damping: 0.2, mix: 0.5 },
          tremoloRingMod: { enabled: true, mode: 'tremolo', rate: 14.0, depth: 0.7, waveform: 'triangle', mix: 0.5 },
          loFiFilter: { enabled: false, type: 'radio', intensity: 0.8, noiseCrackle: 0.3, mix: 0.8 },
          pitchHarmonizer: { enabled: true, pitchShiftSemitones: 0, robotMonotone: false, subHarmonic: 0.4, fifthHarmonic: 0.4, mix: 0.5 },
          autoWah: { enabled: true, baseFreq: 500, sweepRange: 1800, speed: 1.5, resonance: 8.0, mix: 0.4 },
          stereoWidener: { enabled: false, width: 100, haasDelayMs: 10 },
          compressor: { enabled: false, threshold: -18, ratio: 3.0, attack: 10, release: 80, makeupGain: 2.0 }
        }
      },

      underwater: {
        name: 'Pod vodou (Deep Submerged)',
        desc: 'Zahmlené hĺbky, pomalý chorus a tlmený priestor',
        config: {
          masterBypass: false,
          masterGain: 1.2,
          eq: { enabled: true, lowGain: 6.0, lowFreq: 180, midGain: -8.0, midFreq: 1200, midQ: 1.0, highGain: -18.0, highFreq: 2500 },
          distortion: { enabled: false, type: 'warm', drive: 20, tone: 5000, mix: 0.5, outputGain: 1.0 },
          bitcrusher: { enabled: false, bits: 8, downsample: 4, mix: 0.7 },
          chorus: { enabled: true, rate: 0.8, depth: 7.0, delay: 25, feedback: 0.35, mix: 0.65 },
          flangerPhaser: { enabled: false, mode: 'flanger', rate: 0.5, depth: 0.7, feedback: 0.5, baseFreq: 800, mix: 0.45 },
          delay: { enabled: true, time: 320, feedback: 0.4, damping: 900, pingPong: false, mix: 0.35 },
          reverb: { enabled: true, type: 'room', decay: 2.4, preDelay: 15, damping: 0.9, mix: 0.5 },
          tremoloRingMod: { enabled: false, mode: 'tremolo', rate: 5.0, depth: 0.6, waveform: 'sine', mix: 0.5 },
          loFiFilter: { enabled: true, type: 'underwater', intensity: 1.0, noiseCrackle: 0.0, mix: 0.95 },
          pitchHarmonizer: { enabled: false, pitchShiftSemitones: 0, robotMonotone: false, subHarmonic: 0.0, fifthHarmonic: 0.0, mix: 0.5 },
          autoWah: { enabled: false, baseFreq: 400, sweepRange: 1200, speed: 2.0, resonance: 6.0, mix: 0.5 },
          stereoWidener: { enabled: false, width: 100, haasDelayMs: 10 },
          compressor: { enabled: false, threshold: -18, ratio: 3.0, attack: 10, release: 80, makeupGain: 2.0 }
        }
      }
    };
  }
}
