import { useEffect, useState } from 'react';
import { CircleCheck, TriangleAlert } from 'lucide-react';

interface Toast { id: number; text: string; tone: 'ok' | 'error' }
let counter = 0;
const subs = new Set<(t: Toast) => void>();

export function toast(text: string, tone: Toast['tone'] = 'ok'): void {
  const t = { id: ++counter, text, tone };
  subs.forEach((fn) => fn(t));
}

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    const fn = (t: Toast) => {
      setItems((prev) => [...prev, t]);
      window.setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== t.id)), 3200);
    };
    subs.add(fn);
    return () => void subs.delete(fn);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className="panel pointer-events-auto flex items-center gap-2 px-4 py-2.5 text-sm animate-fade-up">
          {t.tone === 'ok' ? <CircleCheck size={16} className="text-teal" /> : <TriangleAlert size={16} className="text-rose" />}
          {t.text}
        </div>
      ))}
    </div>
  );
}
