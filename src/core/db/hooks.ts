import { useEffect, useRef, useState } from 'react';
import { onDbChange, type StoreName } from './database';

/**
 * Ejecuta una consulta a IndexedDB y la repite cuando cambia alguno de los stores indicados.
 * Devuelve `undefined` mientras carga la primera vez.
 */
export function useLive<T>(query: () => Promise<T>, stores: StoreName[], deps: unknown[] = []): T | undefined {
  const [value, setValue] = useState<T | undefined>(undefined);
  const queryRef = useRef(query);
  queryRef.current = query;

  useEffect(() => {
    let alive = true;
    const run = () => {
      queryRef.current().then(
        (v) => alive && setValue(v),
        (err) => console.error('[db] consulta fallida', err),
      );
    };
    run();
    const off = onDbChange((store) => {
      if (stores.includes(store)) run();
    });
    return () => {
      alive = false;
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stores.join(','), ...deps]);

  return value;
}
