import { useEffect, useState } from 'react';
import { cx } from './ui';

/** Campos que editan en local y guardan al salir (blur): evita escribir en la BD en cada tecla. */
export function SaveInput({ value, onSave, className, ...rest }: { value: string; onSave: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  const [v, setV] = useState(value);
  useEffect(() => {
    setV(value);
  }, [value]);
  return <input {...rest} className={cx('input', className)} value={v} onChange={(e) => setV(e.target.value)} onBlur={() => v !== value && onSave(v)} onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} />;
}

export function SaveTextarea({ value, onSave, className, ...rest }: { value: string; onSave: (v: string) => void } & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>) {
  const [v, setV] = useState(value);
  useEffect(() => {
    setV(value);
  }, [value]);
  return <textarea {...rest} className={cx('input min-h-24', className)} value={v} onChange={(e) => setV(e.target.value)} onBlur={() => v !== value && onSave(v)} />;
}
