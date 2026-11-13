import type { AudioData } from './wav';

/**
 * Loudness integrado (LUFS) según ITU-R BS.1770-4 / EBU R128:
 * filtro K (shelf + paso alto), bloques de 400 ms con 75 % de solape,
 * puerta absoluta a -70 LUFS y puerta relativa a -10 LU.
 * Es una medición real del archivo; no garantiza por sí sola una buena mezcla.
 */
function biquad(b: number[], a: number[], x: Float32Array): Float32Array {
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  const [b0, b1, b2] = b.map((v) => v / a[0]);
  const a1 = a[1] / a[0], a2 = a[2] / a[0];
  for (let i = 0; i < x.length; i++) {
    const v = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v;
    y[i] = v;
  }
  return y;
}

function kWeight(x: Float32Array, fs: number): Float32Array {
  // Etapa 1: high shelf (+4 dB, 1500 Hz, Q 1/√2)
  let w0 = (2 * Math.PI * 1500) / fs;
  const A = Math.pow(10, 4 / 40);
  let alpha = Math.sin(w0) / (2 * (1 / Math.SQRT2));
  const c = Math.cos(w0);
  const shelfB = [A * (A + 1 + (A - 1) * c + 2 * Math.sqrt(A) * alpha), -2 * A * (A - 1 + (A + 1) * c), A * (A + 1 + (A - 1) * c - 2 * Math.sqrt(A) * alpha)];
  const shelfA = [A + 1 - (A - 1) * c + 2 * Math.sqrt(A) * alpha, 2 * (A - 1 - (A + 1) * c), A + 1 - (A - 1) * c - 2 * Math.sqrt(A) * alpha];
  // Etapa 2: paso alto RLB (38 Hz, Q 0.5)
  w0 = (2 * Math.PI * 38) / fs;
  alpha = Math.sin(w0) / (2 * 0.5);
  const c2 = Math.cos(w0);
  const hpB = [(1 + c2) / 2, -(1 + c2), (1 + c2) / 2];
  const hpA = [1 + alpha, -2 * c2, 1 - alpha];
  return biquad(hpB, hpA, biquad(shelfB, shelfA, x));
}

export function integratedLufs(buf: AudioData): number {
  const fs = buf.sampleRate;
  const chans = Array.from({ length: Math.min(buf.numberOfChannels, 2) }, (_, i) => kWeight(buf.getChannelData(i), fs));
  const block = Math.round(0.4 * fs);
  const hop = Math.round(0.1 * fs);
  const powers: number[] = [];
  for (let start = 0; start + block <= buf.length; start += hop) {
    let sum = 0;
    for (const ch of chans) {
      let s = 0;
      for (let i = start; i < start + block; i++) s += ch[i] * ch[i];
      sum += s / block; // ganancia 1.0 para L y R
    }
    powers.push(sum);
  }
  const lufs = (p: number) => -0.691 + 10 * Math.log10(p);
  const abs = powers.filter((p) => p > 0 && lufs(p) > -70);
  if (!abs.length) return -Infinity;
  const meanAbs = abs.reduce((a, b) => a + b, 0) / abs.length;
  const rel = abs.filter((p) => lufs(p) > lufs(meanAbs) - 10);
  return lufs(rel.reduce((a, b) => a + b, 0) / rel.length);
}
