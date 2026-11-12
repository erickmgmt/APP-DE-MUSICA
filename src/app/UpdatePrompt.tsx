import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw } from 'lucide-react';

/**
 * Aviso de nueva versión (PWA). La actualización NUNCA toca tus datos: viven en IndexedDB,
 * separados del código de la app.
 */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  if (!needRefresh) return null;
  return (
    <div className="fixed inset-x-3 bottom-20 z-[70] mx-auto max-w-md lg:bottom-6">
      <div className="panel flex items-center gap-3 p-3 text-sm">
        <RefreshCw size={18} className="shrink-0 text-teal" />
        <span className="flex-1">Hay una versión nueva de la app. Tus datos se conservan.</span>
        <button className="btn-ghost btn-sm" onClick={() => setNeedRefresh(false)}>Luego</button>
        <button className="btn-primary btn-sm" onClick={() => updateServiceWorker(true)}>Actualizar</button>
      </div>
    </div>
  );
}
