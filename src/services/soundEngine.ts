/**
 * TANZIEEM Procedural Web Audio Engine
 * Lightweight, zero external audio asset dependencies.
 * Synthesizes click, start, completion bells, level-up fanfares, and ambient soundscapes.
 */

import { SoundscapeType } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private ambientVolume: number = 0.8;
  private activeAmbientNode: { stop: () => void } | null = null;
  private currentTrack: SoundscapeType = 'none';

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled && this.activeAmbientNode) {
      this.stopSoundscape();
    }
  }

  public setAmbientVolume(vol: number) {
    this.ambientVolume = Math.max(0, Math.min(1, vol));
  }

  // --- UI Sound Effects ---

  public playClick() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.045);
    } catch {
      // Audio playback fails silently if browser policy restricts
    }
  }

  public playUiClick() {
    this.playClick();
  }

  public playTimerStart() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.18, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } catch {}
  }

  public playSessionComplete() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Zen Tibetan bowl chime harmonics
      const baseFreq = 440; // A4
      [1, 2, 2.76, 4.02].forEach((ratio, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * ratio, now);

        const amp = 0.25 / (i + 1);
        gain.gain.setValueAtTime(amp, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 2.5);
      });
    } catch {}
  }

  public playLevelUp() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Ascending triumphant synth arpeggio: C4, E4, G4, B4, C5
      const notes = [261.63, 329.63, 392.0, 493.88, 523.25, 659.25];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.22, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.55);
      });
    } catch {}
  }

  public playCoin() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    } catch {}
  }

  // --- Ambient Procedural Soundscapes ---

  public startSoundscape(type: SoundscapeType) {
    if (this.currentTrack === type && this.activeAmbientNode) return;
    this.stopSoundscape();
    if (type === 'none' || !this.soundEnabled) return;

    this.initContext();
    if (!this.ctx) return;

    this.currentTrack = type;

    try {
      if (type === 'lofi_rain') {
        this.activeAmbientNode = this.createRainSound();
      } else if (type === 'cyber_coffee') {
        this.activeAmbientNode = this.createCyberCoffeeSound();
      } else if (type === 'cosmic_flow') {
        this.activeAmbientNode = this.createCosmicFlowSound();
      }
    } catch (e) {
      console.warn('Could not start procedural soundscape:', e);
    }
  }

  public stopSoundscape() {
    if (this.activeAmbientNode) {
      try {
        this.activeAmbientNode.stop();
      } catch {}
      this.activeAmbientNode = null;
    }
    this.currentTrack = 'none';
  }

  public getCurrentTrack(): SoundscapeType {
    return this.currentTrack;
  }

  private createRainSound() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Pink/Brown noise generator
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter to simulate soft raindrops on glass
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.ambientVolume * 0.18, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();

    return {
      stop: () => {
        try {
          noise.stop();
          noise.disconnect();
          filter.disconnect();
          gain.disconnect();
        } catch {}
      },
    };
  }

  private createCosmicFlowSound() {
    if (!this.ctx) return null;
    const oscLeft = this.ctx.createOscillator();
    const oscRight = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Binaural beat: 108Hz and 118Hz (10Hz Alpha flow state)
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(108, this.ctx.currentTime);

    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(118, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    gain.gain.setValueAtTime(this.ambientVolume * 0.15, this.ctx.currentTime);

    oscLeft.connect(filter);
    oscRight.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    oscLeft.start();
    oscRight.start();

    return {
      stop: () => {
        try {
          oscLeft.stop();
          oscRight.stop();
          oscLeft.disconnect();
          oscRight.disconnect();
          gain.disconnect();
        } catch {}
      },
    };
  }

  private createCyberCoffeeSound() {
    if (!this.ctx) return null;
    // Warm low cafe rumble + subtle chime harmonics
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.ambientVolume * 0.14, this.ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();

    return {
      stop: () => {
        try {
          osc.stop();
          osc.disconnect();
          gain.disconnect();
        } catch {}
      },
    };
  }
}

export const soundEngine = new SoundEngine();
