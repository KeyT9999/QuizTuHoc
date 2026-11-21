import { isSoundEnabled } from './gameStorage';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playClickSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // ignore
  }
}

export function playCorrectSound(combo = 1): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const baseFreq = Math.min(523.25 * Math.pow(1.05, Math.min(combo, 10)), 1200);
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.16);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq * 1.25, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 2, ctx.currentTime + 0.16);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc2.start();
    osc.stop(ctx.currentTime + 0.23);
    osc2.stop(ctx.currentTime + 0.23);
  } catch {
    // ignore
  }
}

export function playWrongSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.23);
  } catch {
    // ignore
  }
}

export function playLifelineSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);

      gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.05);
      osc.stop(ctx.currentTime + idx * 0.05 + 0.16);
    });
  } catch {
    // ignore
  }
}

export function playVictoryFanfare(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);

      gain.gain.setValueAtTime(0.14, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.36);
    });
  } catch {
    // ignore
  }
}

export type WoodFishTone = 'warm' | 'deep' | 'crisp';

/**
 * Realistic Acoustic Wooden Fish (Mõ Gỗ) Sound Synthesis via Web Audio API.
 * Combines cavity resonance, wood overtones, low-end body thump, and mallet contact click.
 */
export function playWoodFishSound(tone: WoodFishTone = 'warm', force = true): void {
  if (!force && !isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Pitch tuning per tone variant
    let baseFreq = 680; // Standard warm woodfish
    if (tone === 'deep') baseFreq = 520; // Deep temple wooden fish
    if (tone === 'crisp') baseFreq = 840; // Small crisp wooden block

    // Subtle humanization (+- 1.5% pitch variation for realistic tactile feel)
    const pitchJitter = 1 + (Math.random() - 0.5) * 0.03;
    const freq = baseFreq * pitchJitter;

    // Master volume node for this strike
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.42, now);
    masterGain.connect(ctx.destination);

    // 1. Primary Cavity Resonance (Hollow air body)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    // Initial attack pitch dip
    osc1.frequency.setValueAtTime(freq * 1.15, now);
    osc1.frequency.exponentialRampToValueAtTime(freq, now + 0.009);

    gain1.gain.setValueAtTime(0.85, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
    osc1.connect(gain1);
    gain1.connect(masterGain);

    // 2. Wood Shell Overtone (Acoustic timbre)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 1.72, now);
    gain2.gain.setValueAtTime(0.35, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc2.connect(gain2);
    gain2.connect(masterGain);

    // 3. Low-End Body Thump (Thump depth)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(freq * 0.45, now);
    gain3.gain.setValueAtTime(0.4, now);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc3.connect(gain3);
    gain3.connect(masterGain);

    // 4. Initial Mallet Striker Impact (Crisp contact click)
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    const clickFilter = ctx.createBiquadFilter();
    clickFilter.type = 'bandpass';
    clickFilter.frequency.setValueAtTime(2400, now);
    clickFilter.Q.setValueAtTime(2.2, now);

    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(1600, now);
    clickOsc.frequency.exponentialRampToValueAtTime(350, now + 0.012);

    clickGain.gain.setValueAtTime(0.48, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.016);

    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(masterGain);

    // Start all components
    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    clickOsc.start(now);

    // Clean up
    const stopTime = now + 0.22;
    osc1.stop(stopTime);
    osc2.stop(stopTime);
    osc3.stop(stopTime);
    clickOsc.stop(now + 0.02);
  } catch {
    // ignore
  }
}

/**
 * Small Bell Chime sound (Tiếng chuông bát nhỏ đi kèm nếu muốn)
 */
export function playTempleBellSound(force = true): void {
  if (!force && !isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.5, now); // C6
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.25);
  } catch {
    // ignore
  }
}


/**
 * Crisp Spider-Man web-shooter "THWIP!" sound (Web Audio synthesis)
 */
export function playWebThwipSound(force = false): void {
  if (!force && !isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // 1. Short band-pass noise snap ("THW-")
    const bufferSize = Math.floor(ctx.sampleRate * 0.14);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const env = Math.pow(1 - i / bufferSize, 1.8);
      data[i] = (Math.random() * 2 - 1) * env;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2600, now);
    filter.frequency.exponentialRampToValueAtTime(900, now + 0.12);
    filter.Q.setValueAtTime(1.8, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.24, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    // 2. Crisp elastic zip ("-WIP!")
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(980, now);
    osc.frequency.exponentialRampToValueAtTime(2100, now + 0.035);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.12);

    oscGain.gain.setValueAtTime(0.11, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.125);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    noise.start(now);
    osc.start(now);
    noise.stop(now + 0.14);
    osc.stop(now + 0.13);
  } catch {
    // ignore
  }
}

/**
 * Playful Crayon Shin-chan cartoon spring "BOING-POP!" & ChocoBi chime
 */
export function playShinBoingSound(force = false): void {
  if (!force && !isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // 1. Rubbery cartoon spring boing
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.22);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(gain);
    gain.connect(ctx.destination);

    // 2. Tiny sparkle star pop
    const starOsc = ctx.createOscillator();
    const starGain = ctx.createGain();
    starOsc.type = 'triangle';
    starOsc.frequency.setValueAtTime(1046.5, now + 0.06);
    starOsc.frequency.exponentialRampToValueAtTime(1567.98, now + 0.18);
    starGain.gain.setValueAtTime(0.11, now + 0.06);
    starGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    starOsc.connect(starGain);
    starGain.connect(ctx.destination);

    osc.start(now);
    starOsc.start(now + 0.06);
    osc.stop(now + 0.25);
    starOsc.stop(now + 0.23);
  } catch {
    // ignore
  }
}

/**
 * Heroic Action Kamen "ACTION BEAM!" anime shimmer arpeggio
 */
export function playActionBeamSound(force = false): void {
  if (!force && !isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5 E5 G5 C6 E6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === notes.length - 1 ? 'triangle' : 'sine';
      const t = now + i * 0.055;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.03, t + 0.22);

      gain.gain.setValueAtTime(0.13, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.27);
    });
  } catch {
    // ignore
  }
}
