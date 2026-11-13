import type { VisualKind } from '../../content/types';
import { DawMap, StudioMap } from './Diagrams';
import { BarGrid, Metronome } from './RhythmWidgets';
import { KeyExplorer, PianoLesson, PianoRoll, ScalePlayer } from './TheoryWidgets';
import { WaveformLab } from './WaveformLab';
import { StepSequencer } from './StepSequencer';

/** Registro de representaciones visuales/interactivas de las lecciones. Añade aquí nuevos tipos. */
export function LessonVisual({ kind, preset }: { kind: VisualKind; preset?: string }) {
  switch (kind) {
    case 'daw-map':
      return <DawMap />;
    case 'studio-map':
      return <StudioMap />;
    case 'metronome':
      return <Metronome />;
    case 'bar-grid':
      return <BarGrid />;
    case 'piano':
      return <PianoLesson />;
    case 'scale-player':
      return <ScalePlayer />;
    case 'key-explorer':
      return <KeyExplorer />;
    case 'piano-roll':
      return <PianoRoll />;
    case 'waveform':
      return <WaveformLab />;
    case 'step-seq':
      return <StepSequencer preset={preset} />;
    default:
      return <p className="text-sm text-fog-400">Visualización en preparación.</p>;
  }
}
