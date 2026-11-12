import { useCallback } from 'react';
import { useLive } from '../../core/db/hooks';
import { getProject, saveProject } from '../../core/db/repo';
import type { Project } from '../../core/types';

/** Proyecto en vivo + `update` que siempre parte de la versión más reciente guardada. */
export function useProject(id: string) {
  const project = useLive(() => getProject(id), ['projects'], [id]);
  const update = useCallback(
    async (fn: (p: Project) => Project, reason = 'Edición', snapshot: 'auto' | 'force' | 'none' = 'auto') => {
      const cur = await getProject(id);
      if (!cur) return;
      await saveProject(fn(structuredClone(cur)), reason, snapshot);
    },
    [id],
  );
  return { project, update, loading: project === undefined };
}
