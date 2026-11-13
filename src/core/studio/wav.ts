/** Codificación WAV PCM (16 o 24 bits) y medición REAL del pico de un buffer renderizado. */
export interface AudioData {
  numberOfChannels: number;
  sampleRate: number;
  length: number;
  getChannelData(ch: number): Float32Array;
}

export function encodeWav(buf: AudioData, bits: 16 | 24 = 16): Blob {
  const ch = buf.numberOfChannels;
  const bytes = bits / 8;
  const dataLen = buf.length * ch * bytes;
  const out = new ArrayBuffer(44 + dataLen);
  const v = new DataView(out);
  const str = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF');
  v.setUint32(4, 36 + dataLen, true);
  str(8, 'WAVE');
  str(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, ch, true);
  v.setUint32(24, buf.sampleRate, true);
  v.setUint32(28, buf.sampleRate * ch * bytes, true);
  v.setUint16(32, ch * bytes, true);
  v.setUint16(34, bits, true);
  str(36, 'data');
  v.setUint32(40, dataLen, true);
  const chans = Array.from({ length: ch }, (_, i) => buf.getChannelData(i));
  let o = 44;
  for (let i = 0; i < buf.length; i++) {
    for (let c = 0; c < ch; c++) {
      const s = Math.max(-1, Math.min(1, chans[c][i]));
      if (bits === 16) {
        v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      } else {
        const x = Math.round(s < 0 ? s * 0x800000 : s * 0x7fffff);
        v.setUint8(o, x & 0xff);
        v.setUint8(o + 1, (x >> 8) & 0xff);
        v.setUint8(o + 2, (x >> 16) & 0xff);
      }
      o += bytes;
    }
  }
  return new Blob([out], { type: 'audio/wav' });
}

/** Pico de muestra (sample peak) en dBFS. No es True Peak: no mide picos entre muestras. */
export function samplePeakDb(buf: AudioData): number {
  let peak = 0;
  for (let c = 0; c < buf.numberOfChannels; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < d.length; i++) {
      const a = Math.abs(d[i]);
      if (a > peak) peak = a;
    }
  }
  return peak > 0 ? 20 * Math.log10(peak) : -Infinity;
}
