import { useState } from 'react';
import { Download, FileAudio } from 'lucide-react';
import { renderSong } from '../../core/studio/player';
import { encodeWav, samplePeakDb } from '../../core/studio/wav';
import { integratedLufs } from '../../core/studio/loudness';
import { totalBars, type Song } from '../../core/studio/song';
import { logActivity } from '../../core/db/repo';
import { Callout, Modal, ProgressBar } from '../../components/ui';

interface Result {
  url: string;
  name: string;
  seconds: number;
  peak: number;
  lufs: number;
  sizeMb: number;
}

export function ExportModal({ open, onClose, song, bpm, name }: { open: boolean; onClose: () => void; song: Song; bpm: number; name: string }) {
  const [bits, setBits] = useState<16 | 24>(16);
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bars = song.sections.length ? totalBars(song) : song.loopBars;

  const run = async () => {
    setError(null);
    setResult(null);
    setProgress(0);
    try {
      const buf = await renderSong(song, bpm, setProgress);
      const blob = encodeWav(buf, bits);
      const file = `${name.replace(/[^\p{L}\p{N} _-]/gu, '').trim() || 'cancion'} (${bpm} BPM).wav`;
      setResult({ url: URL.createObjectURL(blob), name: file, seconds: buf.duration, peak: samplePeakDb(buf), lufs: integratedLufs(buf), sizeMb: blob.size / 1048576 });
      await logActivity('export', `Canción exportada: ${file}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setProgress(null);
    }
  };

  const close = () => {
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={close} title="Exportar canción (WAV)">
      <div className="space-y-4">
        <p className="text-sm text-fog-300">
          Se renderiza {song.sections.length ? `la canción completa (${bars} compases, según la Estructura)` : `el loop (${bars} compases)`} en tu dispositivo, más rápido que en tiempo real. No se sube nada a internet.
        </p>
        <div className="flex gap-2 text-sm">
          {[16, 24].map((b) => (
            <label key={b} className="flex items-center gap-1.5">
              <input type="radio" name="bits" checked={bits === b} onChange={() => setBits(b as 16 | 24)} /> WAV {b} bits {b === 16 ? '(compatible con todo)' : '(más calidad, para masterizar)'}
            </label>
          ))}
        </div>
        {progress !== null ? (
          <div>
            <ProgressBar value={progress} />
            <p className="mt-1 text-xs text-fog-400">Renderizando… {Math.round(progress * 100)} % (en equipos modestos puede tardar un poco)</p>
          </div>
        ) : (
          !result && <button className="btn-primary" onClick={run}><FileAudio size={16} /> Renderizar</button>
        )}
        {error && <Callout tone="warn">No se pudo exportar: {error}</Callout>}
        {result && (
          <div className="space-y-3">
            <audio controls src={result.url} className="w-full" />
            <div className="grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
              <div className="panel-inset p-2"><p className="font-mono text-base">{Math.floor(result.seconds / 60)}:{String(Math.round(result.seconds % 60)).padStart(2, '0')}</p><p className="text-fog-400">duración</p></div>
              <div className="panel-inset p-2"><p className="font-mono text-base">{result.peak.toFixed(1)} dBFS</p><p className="text-fog-400">pico medido</p></div>
              <div className="panel-inset p-2"><p className="font-mono text-base">{Number.isFinite(result.lufs) ? result.lufs.toFixed(1) : '—'} LUFS</p><p className="text-fog-400">loudness integrado</p></div>
              <div className="panel-inset p-2"><p className="font-mono text-base">{result.sizeMb.toFixed(1)} MB</p><p className="text-fog-400">tamaño</p></div>
            </div>
            {result.peak > -0.1 && <Callout tone="warn">El pico llega a 0 dBFS: puede haber distorsión. Baja el volumen master o activa el limitador.</Callout>}
            <p className="text-[11px] text-fog-400">Mediciones reales del archivo: pico de muestra (no True Peak) y loudness integrado según ITU-R BS.1770. Como referencia, Spotify normaliza a -14 LUFS. Ningún número garantiza por sí solo una mezcla profesional: escúchala en varios altavoces y compárala con tus referencias.</p>
            <a href={result.url} download={result.name} className="btn-primary"><Download size={16} /> Descargar {result.name}</a>
          </div>
        )}
      </div>
    </Modal>
  );
}
