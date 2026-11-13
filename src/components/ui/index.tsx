import { useEffect, useState, type ReactNode } from 'react';
import { ChevronDown, Info, TriangleAlert, CircleCheck, X } from 'lucide-react';
import type { Verification } from '../../content/types';

export function cx(...c: (string | false | null | undefined)[]): string {
  return c.filter(Boolean).join(' ');
}

export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between animate-fade-up">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal">{eyebrow}</p>}
        <h1 className="h-title">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-fog-300">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({ children, className, title, icon, actions }: { children: ReactNode; className?: string; title?: ReactNode; icon?: ReactNode; actions?: ReactNode }) {
  return (
    <section className={cx('panel p-4 sm:p-5', className)}>
      {(title || actions) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && (
            <h2 className="flex items-center gap-2 text-sm font-semibold text-fog-100">
              {icon}
              {title}
            </h2>
          )}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Collapsible({ title, children, defaultOpen = false, icon, badge }: { title: ReactNode; children: ReactNode; defaultOpen?: boolean; icon?: ReactNode; badge?: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="panel overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-ink-700/40 sm:px-5">
        {icon}
        <span className="flex-1 text-sm font-semibold text-fog-100">{title}</span>
        {badge}
        <ChevronDown size={18} className={cx('text-fog-400 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="border-t border-ink-600/60 px-4 py-4 sm:px-5 animate-fade-up">{children}</div>}
    </div>
  );
}

export function ProgressBar({ value, color = 'var(--color-violet)', className }: { value: number; color?: string; className?: string }) {
  return (
    <div className={cx('h-1.5 w-full overflow-hidden rounded-full bg-ink-600/70', className)} role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.min(100, Math.max(0, value * 100))}%`, background: color }} />
    </div>
  );
}

export function ProgressRing({ value, size = 64, stroke = 6, label }: { value: number; size?: number; stroke?: number; label?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0" x2="1">
            <stop offset="0" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#2a2a40" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="url(#ring-grad)" strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, value))} style={{ transition: 'stroke-dashoffset .6s ease' }} />
      </svg>
      <span className="absolute text-sm font-semibold">{label ?? `${Math.round(value * 100)}%`}</span>
    </div>
  );
}

export const VERIFICATION_INFO: Record<Verification, { label: string; className: string; help: string }> = {
  general: { label: 'Recomendación general', className: 'border-violet/40 bg-violet/10 text-violet-soft', help: 'Punto de partida habitual en producción, no una regla.' },
  experimental: { label: 'Experimental', className: 'border-amber/40 bg-amber/10 text-amber', help: 'Idea creativa: pruébala y juzga con tus oídos.' },
};

export function VerificationBadge({ level }: { level: Verification }) {
  const v = VERIFICATION_INFO[level];
  return (
    <span title={v.help} className={cx('inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', v.className)}>
      {v.label}
    </span>
  );
}

export function VerificationLegend() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {(Object.keys(VERIFICATION_INFO) as Verification[]).map((k) => (
        <div key={k} className="flex items-start gap-2 text-xs text-fog-300">
          <VerificationBadge level={k} />
          <span>{VERIFICATION_INFO[k].help}</span>
        </div>
      ))}
    </div>
  );
}

export function Callout({ tone = 'info', children }: { tone?: 'info' | 'warn' | 'ok'; children: ReactNode }) {
  const map = {
    info: { icon: <Info size={16} />, cls: 'border-electric/30 bg-electric/5 text-fog-200' },
    warn: { icon: <TriangleAlert size={16} />, cls: 'border-amber/30 bg-amber/5 text-fog-200' },
    ok: { icon: <CircleCheck size={16} />, cls: 'border-teal/30 bg-teal/5 text-fog-200' },
  }[tone];
  return (
    <div className={cx('flex gap-2.5 rounded-xl border px-3.5 py-3 text-sm', map.cls)}>
      <span className={cx('mt-0.5 shrink-0', tone === 'warn' ? 'text-amber' : tone === 'ok' ? 'text-teal' : 'text-electric')}>{map.icon}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: ReactNode }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-ink-600 bg-ink-850 p-1" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cx('whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition', value === t.id ? 'bg-ink-600 text-fog-100 shadow' : 'text-fog-400 hover:text-fog-200')}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={cx('panel max-h-[92vh] w-full overflow-y-auto rounded-b-none p-5 sm:rounded-2xl animate-fade-up', wide ? 'sm:max-w-3xl' : 'sm:max-w-lg')}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="btn-ghost btn-sm" onClick={onClose} aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-500 px-6 py-10 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-ink-700 text-violet-soft">{icon}</div>
      <p className="font-semibold">{title}</p>
      <p className="max-w-sm text-sm text-fog-400">{text}</p>
      {action}
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded-md border border-ink-500 bg-ink-700 px-1.5 py-0.5 font-mono text-[11px] text-fog-200 shadow-[0_1px_0_#3a3a55]">{children}</kbd>;
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-fog-400">{hint}</span>}
    </label>
  );
}

/** Checkbox optimista: cambia al instante y se resincroniza cuando llega el dato guardado. */
export function Check({ checked, onToggle, className, label }: { checked: boolean; onToggle: () => void; className?: string; label?: string }) {
  const [v, setV] = useState(checked);
  useEffect(() => {
    setV(checked);
  }, [checked]);
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={v}
      onChange={() => {
        setV(!v);
        onToggle();
      }}
      className={cx('h-4 w-4 shrink-0 accent-[#2dd4bf]', className)}
    />
  );
}
