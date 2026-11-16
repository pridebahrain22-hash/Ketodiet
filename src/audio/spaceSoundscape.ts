export interface SpaceSoundscape {
  isMuted: () => boolean;
  isPlaying: () => boolean;
  toggleMute: () => Promise<boolean>;
  bindFirstInteraction: () => void;
  dispose: () => void;
}

interface SoundscapeCallbacks {
  onStateChange?: (playing: boolean, muted: boolean) => void;
}

export function createSpaceSoundscape(callbacks?: SoundscapeCallbacks): SpaceSoundscape {
  let ctx: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  let muted = false;
  let started = false;
  let disposed = false;
  let chimeTimerId: number | null = null;

  const stopCallbacks: (() => void)[] = [];
  const TARGET_VOLUME = 0.14;

  const notify = () => {
    callbacks?.onStateChange?.(started && !muted, muted);
  };

  const buildGraph = () => {
    if (ctx || disposed) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    ctx = new AudioCtx();
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Warm, silky low-pass master bus for soothing ambient timbre
    const warmMasterFilter = ctx.createBiquadFilter();
    warmMasterFilter.type = 'lowpass';
    warmMasterFilter.frequency.setValueAtTime(760, ctx.currentTime);
    warmMasterFilter.Q.setValueAtTime(0.5, ctx.currentTime);
    warmMasterFilter.connect(masterGain);

    // Soft ambient delay tail (creates calm spacious reverb without external IR files)
    const delayNode = ctx.createDelay(1.0);
    delayNode.delayTime.setValueAtTime(0.46, ctx.currentTime);
    const delayFeedback = ctx.createGain();
    delayFeedback.gain.setValueAtTime(0.36, ctx.currentTime);
    const delayTone = ctx.createBiquadFilter();
    delayTone.type = 'lowpass';
    delayTone.frequency.setValueAtTime(920, ctx.currentTime);
    const delayWet = ctx.createGain();
    delayWet.gain.setValueAtTime(0.32, ctx.currentTime);

    delayNode.connect(delayTone);
    delayTone.connect(delayFeedback);
    delayFeedback.connect(delayNode);
    delayTone.connect(delayWet);
    delayWet.connect(warmMasterFilter);

    // 1. Warm Velvet Bass Foundation (C3 + G3 pure sines, no harsh rumble)
    const foundationNotes = [
      { freq: 130.81, gain: 0.24 }, // C3
      { freq: 196.0, gain: 0.14 }, // G3
    ];
    foundationNotes.forEach(({ freq, gain }) => {
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      oscGain.gain.setValueAtTime(gain, ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(warmMasterFilter);
      osc.start();
      stopCallbacks.push(() => {
        try {
          osc.stop();
          osc.disconnect();
          oscGain.disconnect();
        } catch {
          // Ignore cleanup errors
        }
      });
    });

    // 2. Lush Breathing Cmaj9 Wellness Pad (gentle slow LFO swells)
    const padVoices = [
      { freq: 261.63, lfoRate: 0.045, baseGain: 0.095 }, // C4
      { freq: 329.63, lfoRate: 0.036, baseGain: 0.08 },  // E4
      { freq: 392.0, lfoRate: 0.052, baseGain: 0.068 },  // G4
      { freq: 493.88, lfoRate: 0.029, baseGain: 0.048 }, // B4
      { freq: 587.33, lfoRate: 0.041, baseGain: 0.036 }, // D5
    ];

    padVoices.forEach(({ freq, lfoRate, baseGain }) => {
      if (!ctx) return;
      const oscA = ctx.createOscillator();
      const oscB = ctx.createOscillator();
      const voiceGain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoDepth = ctx.createGain();

      // Subtle warm detune (+/- 0.25 Hz) for calm stereo-chorus richness
      oscA.type = 'sine';
      oscA.frequency.setValueAtTime(freq, ctx.currentTime);
      oscB.type = 'sine';
      oscB.frequency.setValueAtTime(freq * 1.0014, ctx.currentTime);

      voiceGain.gain.setValueAtTime(baseGain * 0.72, ctx.currentTime);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(lfoRate, ctx.currentTime);
      lfoDepth.gain.setValueAtTime(baseGain * 0.48, ctx.currentTime);
      lfo.connect(lfoDepth);
      lfoDepth.connect(voiceGain.gain);

      oscA.connect(voiceGain);
      oscB.connect(voiceGain);
      voiceGain.connect(warmMasterFilter);
      voiceGain.connect(delayNode);

      oscA.start();
      oscB.start();
      lfo.start();

      stopCallbacks.push(() => {
        try {
          oscA.stop();
          oscB.stop();
          lfo.stop();
          oscA.disconnect();
          oscB.disconnect();
          lfo.disconnect();
          lfoDepth.disconnect();
          voiceGain.disconnect();
        } catch {
          // Ignore cleanup errors
        }
      });
    });

    // 3. Soft Airy Breeze Texture (ultra-gentle filtered pink-noise mist)
    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + white * 0.029;
      b1 = 0.985 * b1 + white * 0.032;
      b2 = 0.95 * b2 + white * 0.048;
      data[i] = (b0 + b1 + b2) * 0.35;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const breezeFilter = ctx.createBiquadFilter();
    breezeFilter.type = 'lowpass';
    breezeFilter.frequency.setValueAtTime(340, ctx.currentTime);

    const breezeGain = ctx.createGain();
    breezeGain.gain.setValueAtTime(0.032, ctx.currentTime);

    noiseSource.connect(breezeFilter);
    breezeFilter.connect(breezeGain);
    breezeGain.connect(warmMasterFilter);
    noiseSource.start();

    // 4. Occasional Meditative Pentatonic Chime Notes (warm spa-like water droplets)
    const pentatonicNotes = [523.25, 587.33, 659.25, 783.99, 880.0]; // C5, D5, E5, G5, A5
    let noteCursor = 0;
    const scheduleNextChime = () => {
      if (disposed) return;
      const waitMs = 4200 + Math.random() * 3400;
      chimeTimerId = window.setTimeout(() => {
        if (disposed || !ctx || muted || !started || ctx.state !== 'running') {
          scheduleNextChime();
          return;
        }
        const now = ctx.currentTime;
        const freq = pentatonicNotes[noteCursor % pentatonicNotes.length];
        noteCursor = (noteCursor + 1 + Math.floor(Math.random() * 2)) % pentatonicNotes.length;

        const bellOsc = ctx.createOscillator();
        const bellGain = ctx.createGain();
        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(freq, now);

        bellGain.gain.setValueAtTime(0.0001, now);
        bellGain.gain.linearRampToValueAtTime(0.038, now + 0.14);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.4);

        bellOsc.connect(bellGain);
        bellGain.connect(warmMasterFilter);
        bellGain.connect(delayNode);

        bellOsc.start(now);
        bellOsc.stop(now + 3.5);
        bellOsc.onended = () => {
          bellOsc.disconnect();
          bellGain.disconnect();
        };

        scheduleNextChime();
      }, waitMs);
    };
    scheduleNextChime();

    stopCallbacks.push(() => {
      try {
        noiseSource.stop();
        noiseSource.disconnect();
        breezeFilter.disconnect();
        breezeGain.disconnect();
        delayNode.disconnect();
        delayTone.disconnect();
        delayFeedback.disconnect();
        delayWet.disconnect();
        warmMasterFilter.disconnect();
      } catch {
        // Ignore cleanup errors
      }
    });
  };

  const ensurePlaying = async () => {
    if (disposed || muted) return;
    buildGraph();
    if (!ctx || !masterGain) return;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        return;
      }
    }
    const now = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(Math.max(masterGain.gain.value, 0.0001), now);
    masterGain.gain.linearRampToValueAtTime(TARGET_VOLUME, now + 1.8);
    started = true;
    notify();
  };

  const handleFirstInteraction = () => {
    if (disposed || muted || started) return;
    void ensurePlaying();
    detachInteractionListeners();
  };

  const detachInteractionListeners = () => {
    window.removeEventListener('pointerdown', handleFirstInteraction);
    window.removeEventListener('keydown', handleFirstInteraction);
  };

  return {
    isMuted: () => muted,
    isPlaying: () => started && !muted,
    bindFirstInteraction() {
      window.addEventListener('pointerdown', handleFirstInteraction, { passive: true });
      window.addEventListener('keydown', handleFirstInteraction, { passive: true });
    },
    async toggleMute(): Promise<boolean> {
      detachInteractionListeners();
      if (muted || !started) {
        muted = false;
        buildGraph();
        if (ctx && masterGain) {
          if (ctx.state === 'suspended') {
            try {
              await ctx.resume();
            } catch {
              // Ignore resume error
            }
          }
          const now = ctx.currentTime;
          masterGain.gain.cancelScheduledValues(now);
          masterGain.gain.setValueAtTime(Math.max(masterGain.gain.value, 0.0001), now);
          masterGain.gain.linearRampToValueAtTime(TARGET_VOLUME, now + 0.5);
          started = true;
        }
      } else {
        muted = true;
        if (ctx && masterGain) {
          const now = ctx.currentTime;
          masterGain.gain.cancelScheduledValues(now);
          masterGain.gain.setValueAtTime(masterGain.gain.value, now);
          masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.35);
        }
      }
      notify();
      return !muted && started;
    },
    dispose() {
      disposed = true;
      if (chimeTimerId !== null) {
        clearTimeout(chimeTimerId);
        chimeTimerId = null;
      }
      detachInteractionListeners();
      stopCallbacks.forEach((fn) => fn());
      if (ctx) {
        void ctx.close().catch(() => {});
        ctx = null;
      }
      masterGain = null;
    },
  };
}
