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

  const stopCallbacks: (() => void)[] = [];
  const TARGET_VOLUME = 0.16;

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

    // Warm low-pass bus so cosmic harmonics feel deep and non-fatiguing
    const warmFilter = ctx.createBiquadFilter();
    warmFilter.type = 'lowpass';
    warmFilter.frequency.setValueAtTime(340, ctx.currentTime);
    warmFilter.Q.setValueAtTime(0.8, ctx.currentTime);
    warmFilter.connect(masterGain);

    // Slow LFO sweeping the filter cutoff gently (25-second cosmic breath)
    const filterLfo = ctx.createOscillator();
    const filterLfoGain = ctx.createGain();
    filterLfo.type = 'sine';
    filterLfo.frequency.setValueAtTime(0.04, ctx.currentTime);
    filterLfoGain.gain.setValueAtTime(140, ctx.currentTime);
    filterLfo.connect(filterLfoGain);
    filterLfoGain.connect(warmFilter.frequency);
    filterLfo.start();

    // 1. Deep Gravitational Sub-Drones (A1 = 55Hz + gentle beating + fifth 82.4Hz)
    const droneFreqs = [55.0, 55.32, 82.41];
    const droneGains = [0.42, 0.34, 0.18];
    droneFreqs.forEach((freq, idx) => {
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 2 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(droneGains[idx], ctx.currentTime);
      osc.connect(gain);
      gain.connect(warmFilter);
      osc.start();
      stopCallbacks.push(() => {
        try {
          osc.stop();
          osc.disconnect();
          gain.disconnect();
        } catch {
          // Ignore cleanup errors
        }
      });
    });

    // 2. Subtle Shimmering Stellar Pad Harmonics
    const padNotes = [
      { freq: 164.81, lfoRate: 0.055, baseGain: 0.065 },
      { freq: 220.0, lfoRate: 0.072, baseGain: 0.05 },
      { freq: 329.63, lfoRate: 0.043, baseGain: 0.032 },
    ];
    padNotes.forEach(({ freq, lfoRate, baseGain }) => {
      if (!ctx || !masterGain) return;
      const osc = ctx.createOscillator();
      const padGain = ctx.createGain();
      const padFilter = ctx.createBiquadFilter();
      const lfo = ctx.createOscillator();
      const lfoDepth = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      padFilter.type = 'lowpass';
      padFilter.frequency.setValueAtTime(620, ctx.currentTime);

      padGain.gain.setValueAtTime(baseGain, ctx.currentTime);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(lfoRate, ctx.currentTime);
      lfoDepth.gain.setValueAtTime(baseGain * 0.7, ctx.currentTime);
      lfo.connect(lfoDepth);
      lfoDepth.connect(padGain.gain);

      osc.connect(padFilter);
      padFilter.connect(padGain);
      padGain.connect(masterGain);

      osc.start();
      lfo.start();
      stopCallbacks.push(() => {
        try {
          osc.stop();
          lfo.stop();
          osc.disconnect();
          lfo.disconnect();
          padGain.disconnect();
        } catch {
          // Ignore cleanup errors
        }
      });
    });

    // 3. Soft Filtered Cosmic Void Noise Texture
    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 2.8;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseBand = ctx.createBiquadFilter();
    noiseBand.type = 'bandpass';
    noiseBand.frequency.setValueAtTime(210, ctx.currentTime);
    noiseBand.Q.setValueAtTime(1.1, ctx.currentTime);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.14, ctx.currentTime);

    noiseSource.connect(noiseBand);
    noiseBand.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSource.start();

    stopCallbacks.push(() => {
      try {
        filterLfo.stop();
        noiseSource.stop();
        filterLfo.disconnect();
        noiseSource.disconnect();
        noiseBand.disconnect();
        noiseGain.disconnect();
        warmFilter.disconnect();
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
    masterGain.gain.linearRampToValueAtTime(TARGET_VOLUME, now + 1.4);
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
          masterGain.gain.linearRampToValueAtTime(TARGET_VOLUME, now + 0.35);
          started = true;
        }
      } else {
        muted = true;
        if (ctx && masterGain) {
          const now = ctx.currentTime;
          masterGain.gain.cancelScheduledValues(now);
          masterGain.gain.setValueAtTime(masterGain.gain.value, now);
          masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.25);
        }
      }
      notify();
      return !muted && started;
    },
    dispose() {
      disposed = true;
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
