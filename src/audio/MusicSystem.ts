/**
 * MusicSystem.ts - Procedural Indian Classical & Desert Mythical Fantasy Soundtrack
 * Generates continuous, immersive, adaptive background music using the Web Audio API.
 * Features Tanpura drones, Bansuri bamboo flute melodies, Plucked Sitar arpeggios,
 * Temple chimes, and rhythmic desert percussion that dynamically adapts to each realm.
 */

export class MusicSystem {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  public isMuted = false;
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private melodyGain: GainNode | null = null;
  private chimeGain: GainNode | null = null;
  private rhythmGain: GainNode | null = null;

  private currentRegion = 'kingdom_gate';
  private timerId: number | null = null;
  private step = 0;

  // Indian Raga Scales (Frequencies in Hz centered around D / Re)
  // Raag Bhupali (Pentatonic Majestic Sa-Re-Ga-Pa-Dha): D, E, F#, A, B
  private readonly bhupaliScale = [
    146.83, // D3 (Sa)
    164.81, // E3 (Re)
    185.00, // F#3 (Ga)
    220.00, // A3 (Pa)
    246.94, // B3 (Dha)
    293.66, // D4 (Sa')
    329.63, // E4 (Re')
    369.99, // F#4 (Ga')
    440.00, // A4 (Pa')
    493.88, // B4 (Dha')
    587.33  // D5 (Sa'')
  ];

  // Raag Yaman / Bhairav (Mystical twilight/dawn scale with C# and G)
  private readonly mysticalScale = [
    146.83, // D3
    155.56, // Eb3 (Komal Re)
    185.00, // F#3 (Teevra Ma/Ga)
    220.00, // A3 (Pa)
    233.08, // Bb3 (Komal Dha)
    277.18, // C#4 (Teevra Ni)
    293.66, // D4
    311.13, // Eb4
    369.99, // F#4
    440.00, // A4
    466.16, // Bb4
    554.37  // C#5
  ];

  constructor() {
    // Audio context will be initialized on first user gesture
    this.setupGestureUnlock();
  }

  private setupGestureUnlock(): void {
    const unlock = () => {
      if (!this.ctx) {
        this.initAudio();
      } else if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
  }

  public initAudio(): void {
    if (this.ctx) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.35;
      this.masterGain.connect(this.ctx.destination);

      // Sub-channel gains
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.value = 0.45;
      this.droneGain.connect(this.masterGain);

      this.melodyGain = this.ctx.createGain();
      this.melodyGain.gain.value = 0.5;
      this.melodyGain.connect(this.masterGain);

      this.chimeGain = this.ctx.createGain();
      this.chimeGain.gain.value = 0.4;
      this.chimeGain.connect(this.masterGain);

      this.rhythmGain = this.ctx.createGain();
      this.rhythmGain.gain.value = 0.35;
      this.rhythmGain.connect(this.masterGain);

      // Start continuous ambient drone
      this.startTanpuraDrone();

      // Start rhythmic and melodic sequencing
      this.startSequenceLoop();
      this.isPlaying = true;
    } catch (err) {
      console.warn('Web Audio initialization error:', err);
    }
  }

  /**
   * Resonant Indian Tanpura Drone (Sa - Pa - Sa')
   * Generates warm, oscillating harmonic fifths with slow chorusing
   */
  private startTanpuraDrone(): void {
    if (!this.ctx || !this.droneGain) return;

    // Frequencies: D2 (73.42Hz), A2 (110Hz), D3 (146.83Hz)
    const droneFreqs = [73.42, 110.0, 146.83];

    droneFreqs.forEach((freq, idx) => {
      // Dual detuned oscillators for authentic acoustic wobble
      [-3, 3].forEach(detune => {
        const osc = this.ctx!.createOscillator();
        const filter = this.ctx!.createBiquadFilter();
        const gain = this.ctx!.createGain();

        osc.type = idx === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.value = freq;
        osc.detune.value = detune;

        // Warm analog lowpass filter
        filter.type = 'lowpass';
        filter.frequency.value = 350 + idx * 120;
        filter.Q.value = 2.0;

        // Slow LFO for breath-like drone swelling
        const lfo = this.ctx!.createOscillator();
        const lfoGain = this.ctx!.createGain();
        lfo.frequency.value = 0.12 + idx * 0.05;
        lfoGain.gain.value = 0.15;
        lfo.connect(lfoGain.gain);

        gain.gain.value = 0.25;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.droneGain!);

        osc.start();
        lfo.start();
      });
    });
  }

  /**
   * Musical Sequencer: Generates procedural Sitar, Bansuri, and Tabla phrases
   */
  private startSequenceLoop(): void {
    if (this.timerId !== null) return;

    const tempoMs = 500; // 120 BPM eighth notes

    const tick = () => {
      if (this.ctx && this.ctx.state === 'running' && !this.isMuted) {
        this.step++;
        this.onBeat(this.step);
      }
      this.timerId = window.setTimeout(tick, tempoMs);
    };

    tick();
  }

  private onBeat(step: number): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const measure = step % 16;

    const scale = (this.currentRegion === 'ancient_cave' || this.currentRegion === 'kingdom_gate')
      ? this.mysticalScale
      : this.bhupaliScale;

    // 1. Rhythmic pulse (Tabla Bayan & Dayan strokes)
    if (this.currentRegion !== 'ancient_cave') {
      if (measure === 0 || measure === 6 || measure === 10) {
        this.playTablaBayan(now);
      }
      if (measure === 4 || measure === 8 || measure === 12 || measure === 14) {
        this.playTablaDayan(now);
      }
    }

    // 2. Temple Chimes on structural downbeats
    if (measure === 0) {
      if (Math.random() < 0.75) {
        this.playTempleChime(now);
      }
    }

    // 3. Sitar Plucked Melodic Riff
    if (Math.random() < 0.65) {
      const noteIdx = Math.floor(Math.random() * scale.length);
      const freq = scale[noteIdx];
      this.playSitarPluck(now, freq);
    }

    // 4. Bansuri Flute Legato Phrase (every 8 to 16 beats)
    if (measure === 0 || measure === 8) {
      if (Math.random() < 0.6) {
        const rootIdx = 3 + Math.floor(Math.random() * (scale.length - 4));
        const freq1 = scale[rootIdx];
        const freq2 = scale[rootIdx + (Math.random() < 0.5 ? 1 : -1)];
        this.playBansuriPhrase(now, freq1, freq2);
      }
    }
  }

  /**
   * Sitar Pluck Synthesis:
   * Uses dual triangle/saw oscillators with sharp percussive attack, rapid decay,
   * and a high resonance bandpass filter to emulate the buzzing 'jawari' bridge of a sitar.
   */
  private playSitarPluck(time: number, freq: number): void {
    if (!this.ctx || !this.melodyGain) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    // Subtle microtonal bend (meend) typical of sitar playing
    if (Math.random() < 0.4) {
      osc.frequency.linearRampToValueAtTime(freq * 1.03, time + 0.12);
      osc.frequency.linearRampToValueAtTime(freq, time + 0.28);
    }

    // Jawari resonance filter
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 2.2, time);
    filter.Q.setValueAtTime(4.0, time);

    // Pluck amplitude envelope
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.35, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.75);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.melodyGain);

    osc.start(time);
    osc.stop(time + 0.8);
  }

  /**
   * Bansuri Bamboo Flute Synthesis:
   * Warm sine-triangle mix with gentle vibrato and smooth breathy swell.
   */
  private playBansuriPhrase(time: number, freq1: number, freq2: number): void {
    if (!this.ctx || !this.melodyGain) return;

    const osc = this.ctx.createOscillator();
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq1, time);
    // Smooth glissando between notes
    osc.frequency.setTargetAtTime(freq2, time + 0.4, 0.2);

    // Gentle vibrato
    vibrato.frequency.value = 5.2; // 5 Hz
    vibratoGain.gain.value = 6.0;  // ±6 Hz
    vibrato.connect(osc.frequency);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, time);

    // Soft breathy swell envelope
    const dur = 1.6;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.28, time + 0.25);
    gain.gain.setValueAtTime(0.25, time + 1.1);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    vibrato.start(time);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.melodyGain);

    osc.start(time);
    osc.stop(time + dur);
    vibrato.stop(time + dur);
  }

  /**
   * Sacred Temple Chime Synthesis:
   * Inharmonic metallic partials ringing into pure silence like ancient bronze bells.
   */
  private playTempleChime(time: number): void {
    if (!this.ctx || !this.chimeGain) return;

    // Inharmonic ratios typical of bronze singing bowls
    const baseFreq = 587.33; // D5
    const partials = [1.0, 1.48, 2.05, 2.76];

    partials.forEach((ratio, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * ratio, time);

      const decay = 2.5 - i * 0.4;
      gain.gain.setValueAtTime(0.18 / (i + 1), time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + decay);

      osc.connect(gain);
      gain.connect(this.chimeGain!);

      osc.start(time);
      osc.stop(time + decay);
    });
  }

  /**
   * Tabla Bayan (Bass Drum) Synthesis:
   * Deep pitch drop stroke (G1 to E1) simulating the palm pressure of the Indian bayan.
   */
  private playTablaBayan(time: number): void {
    if (!this.ctx || !this.rhythmGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.18);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.connect(gain);
    gain.connect(this.rhythmGain);

    osc.start(time);
    osc.stop(time + 0.26);
  }

  /**
   * Tabla Dayan (Treble Drum) Synthesis:
   * Crisp resonant high stroke with bell-like overtones.
   */
  private playTablaDayan(time: number): void {
    if (!this.ctx || !this.rhythmGain) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(293.66, time); // D4 Dayan tuning

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(587, time);
    filter.Q.value = 6;

    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.rhythmGain);

    osc.start(time);
    osc.stop(time + 0.15);
  }

  public setRegion(regionId: string): void {
    this.currentRegion = regionId;
    if (!this.ctx) return;

    // Adjust sub-channel mixing to match the environment atmosphere
    if (regionId === 'ancient_cave') {
      if (this.rhythmGain) this.rhythmGain.gain.setTargetAtTime(0.05, this.ctx.currentTime, 1.0);
      if (this.droneGain) this.droneGain.gain.setTargetAtTime(0.65, this.ctx.currentTime, 1.0);
      if (this.chimeGain) this.chimeGain.gain.setTargetAtTime(0.6, this.ctx.currentTime, 1.0);
    } else if (regionId === 'royal_market') {
      if (this.rhythmGain) this.rhythmGain.gain.setTargetAtTime(0.45, this.ctx.currentTime, 1.0);
      if (this.melodyGain) this.melodyGain.gain.setTargetAtTime(0.55, this.ctx.currentTime, 1.0);
    } else if (regionId === 'sacred_forest') {
      if (this.rhythmGain) this.rhythmGain.gain.setTargetAtTime(0.15, this.ctx.currentTime, 1.0);
      if (this.melodyGain) this.melodyGain.gain.setTargetAtTime(0.6, this.ctx.currentTime, 1.0);
    } else if (regionId === 'sun_temple') {
      if (this.chimeGain) this.chimeGain.gain.setTargetAtTime(0.65, this.ctx.currentTime, 1.0);
      if (this.droneGain) this.droneGain.gain.setTargetAtTime(0.55, this.ctx.currentTime, 1.0);
    } else {
      // Standard balanced mix
      if (this.rhythmGain) this.rhythmGain.gain.setTargetAtTime(0.35, this.ctx.currentTime, 1.0);
      if (this.droneGain) this.droneGain.gain.setTargetAtTime(0.45, this.ctx.currentTime, 1.0);
      if (this.melodyGain) this.melodyGain.gain.setTargetAtTime(0.5, this.ctx.currentTime, 1.0);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime, 0.1);
    }
    return this.isMuted;
  }

  public setVolume(val: number): void {
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.1);
    }
  }

  public stop(): void {
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.isPlaying = false;
  }
}
