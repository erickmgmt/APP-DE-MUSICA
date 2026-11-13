import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useProject } from '../producer/useProject';
import { getSample } from '../../core/db/repo';
import { decodeSample, sampleBuffers, StudioPlayer, type PlayMode } from '../../core/studio/player';
import { deepHouseSong, emptySong, normalizeSong, type Song, type StepPosition } from '../../core/studio/song';

const SAVE_DELAY = 700;
const UNDO_LIMIT = 60;

/**
 * Estado del estudio para un proyecto:
 * - los cambios se ven y se oyen al instante (estado local) y se guardan solos a los 0,7 s,
 * - deshacer (hasta 60 pasos; los movimientos seguidos de un mismo control cuentan como uno),
 * - reproductor en vivo conectado a la canción.
 */
export function useStudio(projectId: string) {
  const { project, update, loading } = useProject(projectId);
  const [song, setSongState] = useState<Song | null>(null);
  const [pos, setPos] = useState<StepPosition | null>(null);
  const [mode, setMode] = useState<PlayMode>('loop');
  const [playing, setPlaying] = useState(false);
  const [saved, setSaved] = useState(true);
  const songRef = useRef<Song | null>(null);
  const bpmRef = useRef(122);
  const undoStack = useRef<Song[]>([]);
  const lastKey = useRef<{ key: string; at: number } | null>(null);
  const saveTimer = useRef<number | null>(null);
  const [, force] = useState(0);

  bpmRef.current = project?.bpm ?? 122;

  const player = useMemo(
    () =>
      new StudioPlayer(
        () => ({ song: songRef.current!, bpm: bpmRef.current }),
        (p) => {
          setPos(p);
          if (!p) setPlaying(false);
        },
      ),
    [],
  );

  const flush = useCallback(async () => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = null;
    const s = songRef.current;
    if (!s) return;
    await update((p) => ({ ...p, song: s }), 'Estudio');
    setSaved(true);
  }, [update]);

  // Carga inicial (o crea la canción si el proyecto aún no tiene)
  useEffect(() => {
    if (!project || songRef.current) return;
    let initial: Song;
    if (project.song) initial = normalizeSong(project.song);
    else {
      initial = project.genreId === 'deep-house' ? deepHouseSong() : emptySong();
      void update((p) => ({ ...p, song: initial }), 'Canción creada en el estudio', 'force');
    }
    songRef.current = initial;
    setSongState(initial);
  }, [project, update]);

  // Guarda al salir o al ocultar la app
  useEffect(() => {
    const onHide = () => document.visibilityState === 'hidden' && void flush();
    document.addEventListener('visibilitychange', onHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      void flush();
      player.dispose();
    };
  }, [flush, player]);

  // Decodifica los samples del usuario que use la canción
  useEffect(() => {
    if (!song) return;
    const missing = song.tracks.filter((t) => t.kind === 'sample' && t.sampleId && !sampleBuffers.has(t.sampleId));
    missing.forEach(async (t) => {
      const s = await getSample(t.sampleId!);
      if (s) {
        await decodeSample(s.id, s.data).catch(() => undefined);
        force((x) => x + 1);
      }
    });
  }, [song]);

  /** Modifica la canción. `key` agrupa cambios seguidos de un mismo control en un solo "deshacer". */
  const setSong = useCallback(
    (fn: (s: Song) => Song, key?: string) => {
      const prev = songRef.current;
      if (!prev) return;
      const next = fn(prev);
      const now = Date.now();
      const sameGesture = key && lastKey.current?.key === key && now - lastKey.current.at < 1000;
      if (!sameGesture) {
        undoStack.current.push(prev);
        if (undoStack.current.length > UNDO_LIMIT) undoStack.current.shift();
      }
      lastKey.current = key ? { key, at: now } : null;
      songRef.current = next;
      setSongState(next);
      player.refresh();
      setSaved(false);
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => void flush(), SAVE_DELAY);
    },
    [player, flush],
  );

  const undo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (!prev) return;
    songRef.current = prev;
    setSongState(prev);
    lastKey.current = null;
    player.refresh();
    setSaved(false);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => void flush(), SAVE_DELAY);
  }, [player, flush]);

  const play = useCallback(
    (m: PlayMode = mode, fromStep = 0) => {
      setMode(m);
      player.start(m, fromStep);
      setPlaying(true);
    },
    [player, mode],
  );
  const stop = useCallback(() => {
    player.stop();
    setPlaying(false);
  }, [player]);

  const setBpm = useCallback(
    (bpm: number) => {
      bpmRef.current = bpm;
      player.refresh();
      void update((p) => ({ ...p, bpm }), 'Cambio de BPM');
    },
    [player, update],
  );

  return { project, loading, song, setSong, undo, canUndo: undoStack.current.length > 0, saved, player, pos, playing, mode, setMode, play, stop, setBpm, flush };
}

export type StudioApi = ReturnType<typeof useStudio>;
