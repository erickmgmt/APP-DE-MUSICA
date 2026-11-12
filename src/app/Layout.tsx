import { Suspense, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Ellipsis, X } from 'lucide-react';
import { ACTIVE_MODULES } from '../modules/registry';
import { cx } from '../components/ui';
import { Toaster } from '../components/ui/toast';
import { UpdatePrompt } from './UpdatePrompt';

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <img src="./icon.svg" alt="" className="h-9 w-9" />
      <div className="leading-tight">
        <div className="text-sm font-bold tracking-wide">REAPER ACADEMY</div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-fog-400">Estudio inteligente</div>
      </div>
    </div>
  );
}

const linkCls = ({ isActive }: { isActive: boolean }) =>
  cx('group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition', isActive ? 'bg-gradient-to-r from-violet/25 to-electric/10 text-fog-100 shadow-[inset_2px_0_0_#8b5cf6]' : 'text-fog-300 hover:bg-ink-700/60 hover:text-fog-100');

export function Layout() {
  const [moreOpen, setMoreOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => {
    setMoreOpen(false);
    window.scrollTo(0, 0);
  }, [loc.pathname]);

  const main = ACTIVE_MODULES.filter((m) => m.nav === 'main');
  const more = ACTIVE_MODULES.filter((m) => m.nav === 'more');

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[248px_1fr]">
      {/* Barra lateral (escritorio) */}
      <aside className="sticky top-0 hidden h-screen flex-col gap-6 border-r border-ink-600/60 bg-ink-900/70 p-4 backdrop-blur lg:flex">
        <Logo />
        <nav className="flex flex-col gap-1" aria-label="Navegación principal">
          {[...main, ...more].map((m) => (
            <NavLink key={m.id} to={m.path} end={m.path === '/'} className={linkCls}>
              <m.icon size={18} className="shrink-0" />
              {m.title}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-ink-600 bg-ink-850 p-3 text-xs text-fog-400">
          <p className="font-semibold text-fog-200">Tus datos son locales</p>
          <p className="mt-1">Se guardan en este navegador. Haz copias desde Sistema.</p>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Cabecera móvil */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-600/60 bg-ink-900/85 px-4 py-3 backdrop-blur lg:hidden">
          <Logo />
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12 lg:pt-8">
          <Suspense fallback={<div className="py-20 text-center text-sm text-fog-400">Cargando…</div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      {/* Navegación inferior (móvil) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-ink-600/70 bg-ink-900/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Navegación móvil">
        {main.map((m) => (
          <NavLink key={m.id} to={m.path} end={m.path === '/'} className={({ isActive }) => cx('flex flex-col items-center gap-1 py-2.5 text-[10px]', isActive ? 'text-violet-soft' : 'text-fog-400')}>
            <m.icon size={20} />
            {m.short}
          </NavLink>
        ))}
        <button onClick={() => setMoreOpen(true)} className="flex flex-col items-center gap-1 py-2.5 text-[10px] text-fog-400">
          <Ellipsis size={20} />
          Más
        </button>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMoreOpen(false)}>
          <div className="panel absolute inset-x-2 bottom-2 p-3 animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="text-sm font-semibold">Más módulos</span>
              <button className="btn-ghost btn-sm" onClick={() => setMoreOpen(false)} aria-label="Cerrar">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {more.map((m) => (
                <NavLink key={m.id} to={m.path} className="flex items-center gap-2 rounded-xl border border-ink-600 bg-ink-850 p-3 text-sm">
                  <m.icon size={18} className="text-violet-soft" />
                  {m.title}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
      <Toaster />
      <UpdatePrompt />
    </div>
  );
}
